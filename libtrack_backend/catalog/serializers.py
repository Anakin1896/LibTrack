from rest_framework import serializers
from .models import Category, Book, BookCopy

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class BookCopySerializer(serializers.ModelSerializer):
    class Meta:
        model = BookCopy
        fields = ['id', 'unique_qr_code', 'status', 'date_acquired', 'condition_notes']

class BookSerializer(serializers.ModelSerializer):

    category_name = serializers.ReadOnlyField(source='category.name')
    copies = BookCopySerializer(many=True, read_only=True)
    available_copies_count = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'category', 'category_name', 
                  'description', 'cover_image_url', 'price', 'created_at', 
                  'copies', 'available_copies_count']

    def get_available_copies_count(self, obj):
        return obj.copies.filter(status='available').count()