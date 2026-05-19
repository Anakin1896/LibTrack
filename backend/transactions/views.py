from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone        
from datetime import timedelta           

from catalog.models import BookCopy
from users.models import Notification
from .models import Transaction
from .serializers import TransactionSerializer

User = get_user_model()

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user
        if user.role in ['ADMIN', 'LIBRARIAN']:
            return Transaction.objects.all().order_by('-reservation_date')
        return Transaction.objects.filter(user=user).order_by('-reservation_date')

    def create(self, request, *args, **kwargs):

        if request.user.role in ['ADMIN', 'LIBRARIAN'] and 'member_id' in request.data:
            member_id = request.data.get('member_id')
            isbn = request.data.get('isbn')
            due_date = request.data.get('due_date')

            try:
                student = User.objects.get(username=member_id)
                book_copy = BookCopy.objects.filter(book__isbn=isbn, status='AVAILABLE').first()
                
                if not book_copy:
                    return Response({"detail": "No available copies found for that ISBN."}, status=status.HTTP_400_BAD_REQUEST)

                transaction = Transaction.objects.create(
                    user=student,
                    book_copy=book_copy,
                    status='ACTIVE',
                    due_date=due_date
                )

                book_copy.status = 'BORROWED' 
                book_copy.save()

                serializer = self.get_serializer(transaction)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            except User.DoesNotExist:
                return Response({"detail": "Student/Teacher ID not found in database."}, status=status.HTTP_400_BAD_REQUEST)

        else:
            isbn = request.data.get('isbn')
            
            if not isbn:
                return Response({"detail": "ISBN is required."}, status=status.HTTP_400_BAD_REQUEST)

            book_copy = BookCopy.objects.filter(book__isbn=isbn, status='AVAILABLE').first()
            
            if not book_copy:
                return Response({"detail": "Sorry, no copies are currently available."}, status=status.HTTP_400_BAD_REQUEST)

            default_due_date = timezone.now() + timedelta(days=7)

            transaction = Transaction.objects.create(
                user=request.user,
                book_copy=book_copy,
                status='PENDING',
                due_date=default_due_date
            )

            book_copy.status = 'BORROWED' 
            book_copy.save()

            serializer = self.get_serializer(transaction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        copy = instance.book_copy

        if instance.status in ['RETURNED', 'CANCELLED']:
            copy.status = 'AVAILABLE'
            copy.save()
        elif instance.status == 'LOST':
            copy.status = 'LOST'
            copy.save()

    @action(detail=True, methods=['post'])
    def remind(self, request, pk=None):
        transaction = self.get_object()

        if not transaction.user:
            return Response({"detail": "Cannot send reminder: No registered user linked to this transaction."}, status=status.HTTP_400_BAD_REQUEST)

        formatted_date = transaction.due_date.strftime('%B %d, %Y')
        book_title = transaction.book_copy.book.title

        Notification.objects.create(
            user=transaction.user,
            message=f"Library Reminder: Your borrowed copy of '{book_title}' is due on {formatted_date}. Please return it to avoid penalties."
        )

        return Response({"status": "Reminder notification created successfully!"}, status=status.HTTP_200_OK)