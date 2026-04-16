from rest_framework import serializers
from .models import BorrowTransaction
from catalog.serializers import BookCopySerializer
from users.serializers import UserSerializer

class BorrowTransactionSerializer(serializers.ModelSerializer):

    book_details = BookCopySerializer(source='book_copy', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = BorrowTransaction
        fields = [
            'id', 'user', 'user_details', 'book_copy', 'book_details', 
            'request_date', 'borrow_date', 'due_date', 'return_date', 
            'status', 'remarks', 'is_overdue'
        ]
        read_only_fields = ['request_date']

    def get_is_overdue(self, obj):
        return obj.is_overdue()