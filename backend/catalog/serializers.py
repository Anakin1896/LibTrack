from rest_framework import serializers
from .models import Book, BookCopy

class BookCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCopy
        fields = '__all__'

class BookSerializer(serializers.ModelSerializer):
    copies = BookCopySerializer(many=True, read_only=True)
    available_copies_count = serializers.SerializerMethodField()

    active_copies_count = serializers.SerializerMethodField() 

    class Meta:
        model = Book
        fields = ('id', 'title', 'author', 'isbn', 'category', 'publication_year', 'copies', 'available_copies_count', 'active_copies_count')

    def get_available_copies_count(self, obj):
        return obj.copies.filter(status='AVAILABLE').count()

    def get_active_copies_count(self, obj):
        return obj.copies.exclude(status='LOST').count()