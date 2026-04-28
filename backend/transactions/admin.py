from django.contrib import admin
from .models import Transaction

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'book_copy', 'status', 'reservation_date', 'due_date')
    list_filter = ('status', 'reservation_date')
    search_fields = ('user__username', 'book_copy__book__title', 'book_copy__tracking_uuid')
    readonly_fields = ('reservation_date',)