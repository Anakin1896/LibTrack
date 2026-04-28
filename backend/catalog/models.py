from django.db import models
import uuid

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=20, unique=True, null=True, blank=True)
    category = models.CharField(max_length=100)
    publication_year = models.IntegerField(null=True, blank=True)
    
    def __str__(self):
        return self.title

class BookCopy(models.Model):
    STATUS_CHOICES = (
        ('AVAILABLE', 'Available'),
        ('RESERVED', 'Reserved'),
        ('BORROWED', 'Borrowed'),
        ('MISSING', 'Missing'),
    )

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='copies')
    tracking_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='AVAILABLE')

    class Meta:
        verbose_name_plural = "Book Copies"

    def __str__(self):
        return f"{self.book.title} - Copy ID: {str(self.tracking_uuid)[:8]}"