from rest_framework import viewsets, permissions
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'LIBRARIAN']:
            return Transaction.objects.all().order_by('-reservation_date')

        return Transaction.objects.filter(user=user).order_by('-reservation_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)