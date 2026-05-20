from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Transaction
from catalog.models import BookCopy

User = get_user_model()

class TransactionUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name']

class TransactionSerializer(serializers.ModelSerializer):
    user = TransactionUserSerializer(read_only=True)
    book_title = serializers.ReadOnlyField(source='book_copy.book.title')
    expected_pickup_date = serializers.DateField(
        required=False, 
        allow_null=True, 
        input_formats=['%Y-%m-%d', 'iso-8601']
    )

    class Meta:
        model = Transaction
        fields = ('id', 'user', 'book_copy', 'book_title', 'reservation_date', 'due_date', 'status', 'return_date', 'expected_pickup_date')

    def validate(self, data):
        book_copy = data.get('book_copy')
        if book_copy and book_copy.status != 'AVAILABLE':
            raise serializers.ValidationError("This specific book copy is currently not available.")
        return data

    def create(self, validated_data):
        transaction = Transaction.objects.create(**validated_data)

        return transaction