from rest_framework import serializers
from .models import Transaction
from catalog.models import BookCopy

class TransactionSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    status = serializers.ReadOnlyField()
    book_title = serializers.ReadOnlyField(source='book_copy.book.title')

    class Meta:
        model = Transaction
        fields = ('id', 'user', 'book_copy', 'book_title', 'reservation_date', 'due_date', 'status')

    def validate(self, data):
        book_copy = data.get('book_copy')
        if book_copy and book_copy.status != 'AVAILABLE':
            raise serializers.ValidationError("This specific book copy is currently not available.")
        return data

    def create(self, validated_data):

        transaction = Transaction.objects.create(**validated_data)
        book_copy = validated_data['book_copy']
        book_copy.status = 'RESERVED'
        book_copy.save()
        
        return transaction