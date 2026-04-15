from django.db import models
from django.utils import timezone
from users.models import User
from catalog.models import BookCopy

class BorrowTransaction(models.Model):
    TRANSACTION_STATUS = (
        ('pending', 'Pending Approval'),
        ('active', 'Borrowed (Active)'),
        ('returned', 'Returned'),
        ('cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    book_copy = models.ForeignKey(BookCopy, on_delete=models.CASCADE)
    
    request_date = models.DateTimeField(auto_now_add=True)
    borrow_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    return_date = models.DateTimeField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=TRANSACTION_STATUS, default='pending')
    remarks = models.TextField(blank=True)

    def is_overdue(self):
        if self.status == 'active' and self.due_date:
            return timezone.now() > self.due_date
        return False

    def __str__(self):
        return f"{self.user.username} borrowed {self.book_copy.book.title} - {self.get_status_display()}"