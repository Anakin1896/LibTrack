import uuid
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='books')
    description = models.TextField(blank=True)
    cover_image_url = models.URLField(blank=True)
    price = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class BookCopy(models.Model):
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('borrowed', 'Currently Borrowed'),
        ('missing', 'Missing'),
        ('destroyed', 'Destroyed'),
        ('outdated', 'Outdated/Archived'),
        ('new_arrival', 'New Arrival'),
    )
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='copies')
    unique_qr_code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False) 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new_arrival')
    date_acquired = models.DateField(auto_now_add=True)
    condition_notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.book.title} - {str(self.unique_qr_code)[:8]}"
    
    class Meta:
        verbose_name_plural = "Book Copies"