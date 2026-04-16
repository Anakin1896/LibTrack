from django.contrib import admin
from .models import Category, Book, BookCopy

admin.site.register(Category)
admin.site.register(Book)
admin.site.register(BookCopy)