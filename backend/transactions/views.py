from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.utils import timezone        
from datetime import timedelta, datetime

from catalog.models import BookCopy
from users.models import Notification
from .models import Transaction
from .serializers import TransactionSerializer

User = get_user_model()

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):

        today = timezone.now().date()

        expired_transactions = Transaction.objects.filter(status='PENDING', expected_pickup_date__lt=today)
        
        for tx in expired_transactions:
            tx.status = 'CANCELLED'
            tx.save()

            if tx.book_copy:
                tx.book_copy.status = 'AVAILABLE'
                tx.book_copy.save()

            Notification.objects.create(
                user=tx.user,
                message=f"System Notice: Your reservation for '{tx.book_copy.book.title}' was automatically cancelled because the pickup date passed."
            )

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
            pickup_date_str = request.data.get('expected_pickup_date')
            
            if not isbn:
                return Response({"detail": "ISBN is required."}, status=status.HTTP_400_BAD_REQUEST)
            if not pickup_date_str:
                return Response({"detail": "Please select a valid pickup date."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                pickup_date = datetime.strptime(pickup_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({"detail": "Invalid date format."}, status=status.HTTP_400_BAD_REQUEST)
                
            today = timezone.now().date()
            if pickup_date < today:
                 return Response({"detail": "Pickup date cannot be in the past."}, status=status.HTTP_400_BAD_REQUEST)
            if pickup_date > today + timedelta(days=3):
                 return Response({"detail": "Reservation limit exceeded. You must pick up the book within 3 days."}, status=status.HTTP_400_BAD_REQUEST)

            book_copy = BookCopy.objects.filter(book__isbn=isbn, status='AVAILABLE').first()
            
            if not book_copy:
                return Response({"detail": "Sorry, no copies are currently available."}, status=status.HTTP_400_BAD_REQUEST)

            pickup_datetime = timezone.make_aware(datetime.combine(pickup_date, datetime.min.time()))
            default_due_date = pickup_datetime + timedelta(days=7)

            transaction = Transaction.objects.create(
                user=request.user,
                book_copy=book_copy,
                status='PENDING',
                due_date=default_due_date,
                expected_pickup_date=pickup_date
            )

            book_copy.status = 'BORROWED' 
            book_copy.save()

            serializer = self.get_serializer(transaction)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        
        old_instance = self.get_object()
        old_status = old_instance.status

        instance = serializer.save()
        copy = instance.book_copy

        if instance.status in ['RETURNED', 'CANCELLED']:
            copy.status = 'AVAILABLE'
            copy.save()
        elif instance.status == 'LOST':
            copy.status = 'LOST'
            copy.save()

        if old_status == 'PENDING' and instance.status == 'CANCELLED':
            Notification.objects.create(
                user=instance.user,
                message=f"Library Notice: Your reservation request for '{copy.book.title}' was denied by the librarian."
            )
        elif old_status == 'PENDING' and instance.status == 'ACTIVE':
            Notification.objects.create(
                user=instance.user,
                message=f"Library Notice: Good news! Your reservation for '{copy.book.title}' has been approved and issued to you."
            )

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
    
    @action(detail=True, methods=['post'])
    def cancel_reservation(self, request, pk=None):
        transaction = self.get_object()

        if transaction.user != request.user:
            return Response({"detail": "You do not have permission to cancel this reservation."}, status=status.HTTP_403_FORBIDDEN)

        if transaction.status != 'PENDING':
            return Response({"detail": "Only pending reservations can be cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        transaction.status = 'CANCELLED'
        transaction.save()

        if transaction.book_copy:
            transaction.book_copy.status = 'AVAILABLE'
            transaction.book_copy.save()

        return Response({"status": "Reservation cancelled successfully."}, status=status.HTTP_200_OK)