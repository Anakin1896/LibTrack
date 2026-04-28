from django.db import models
from django.conf import settings
from catalog.models import BookCopy
from django.utils import timezone
from datetime import timedelta

def get_default_due_date():
    return timezone.now() + timedelta(days=7) 

class Transaction(models.Model):
    STATUS_CHOICES = (
        ('RESERVED', 'Reserved'), 
        ('ACTIVE', 'Active'),     
        ('RETURNED', 'Returned'), 
        ('OVERDUE', 'Overdue'),   
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    book_copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE, related_name='transactions')
    reservation_date = models.DateTimeField(auto_now_add=True)
    activation_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(default=get_default_due_date)
    return_date = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='RESERVED')

    def __str__(self):
        return f"{self.user.username} - {self.book_copy.book.title} ({self.status})"