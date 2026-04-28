from django.contrib import admin
from .models import Book, BookCopy

class BookCopyInline(admin.TabularInline):
    model = BookCopy
    extra = 1

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'isbn', 'category')
    search_fields = ('title', 'author', 'isbn')
    inlines = [BookCopyInline]

@admin.register(BookCopy)
class BookCopyAdmin(admin.ModelAdmin):
    list_display = ('book', 'tracking_uuid', 'status')
    list_filter = ('status',)
    search_fields = ('book__title', 'tracking_uuid')