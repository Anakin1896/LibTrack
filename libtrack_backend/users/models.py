from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('librarian', 'Librarian'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    school_id = models.CharField(max_length=50, unique=True, null=True, blank=True)
    contact_number = models.CharField(max_length=20, blank=True)
    department_or_grade = models.CharField(max_length=100, blank=True, help_text="e.g., Grade 10, Science Dept")

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.get_role_display()})"