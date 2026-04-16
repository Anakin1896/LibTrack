from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import BorrowTransaction
from .serializers import BorrowTransactionSerializer

class BorrowTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = BorrowTransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter transactions based on the user's role.
        """
        user = self.request.user

        if user.role in ['admin', 'librarian']:
            return BorrowTransaction.objects.all().order_by('-request_date')

        return BorrowTransaction.objects.filter(user=user).order_by('-request_date')