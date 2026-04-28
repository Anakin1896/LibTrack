from rest_framework import serializers
from .models import Book, BookCopy

class BookCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCopy
        fields = ('id', 'tracking_uuid', 'status')

class BookSerializer(serializers.ModelSerializer):

    available_copies_count = serializers.SerializerMethodField()
    copies = BookCopySerializer(many=True, read_only=True)

    class Meta:
        model = Book
        fields = ('id', 'title', 'author', 'isbn', 'category', 'publication_year', 'available_copies_count', 'copies')

    def get_available_copies_count(self, obj):
        return obj.copies.filter(status='AVAILABLE').count()