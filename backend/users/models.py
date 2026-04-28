from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Administrator'),
        ('LIBRARIAN', 'Librarian'),
        ('STUDENT', 'Student'),
        ('TEACHER', 'Teacher'),
    )

    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='STUDENT')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    

class StudentProfile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    course = models.CharField(max_length=100, null=True, blank=True)
    year_level = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Student Profile: {self.user.username}"

class TeacherProfile(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    department = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Teacher Profile: {self.user.username}"
    

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.role == 'STUDENT':
            StudentProfile.objects.create(user=instance)
        elif instance.role == 'TEACHER':
            TeacherProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if instance.role == 'STUDENT' and hasattr(instance, 'student_profile'):
        instance.student_profile.save()
    elif instance.role == 'TEACHER' and hasattr(instance, 'teacher_profile'):
        instance.teacher_profile.save()