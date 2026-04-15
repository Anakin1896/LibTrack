from django.db import models
from users.models import User

class LogbookScan(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Processing'),
        ('processed', 'Processed Successfully'),
        ('error', 'Processing Error'),
    )
    scan_image = models.ImageField(upload_to='logbook_scans/')
    extracted_text_json = models.JSONField(null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    def __str__(self):
        return f"Scan {self.id} on {self.uploaded_at.strftime('%Y-%m-%d')}"