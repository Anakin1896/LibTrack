from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentProfile, TeacherProfile

class CustomUserAdmin(UserAdmin):

    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('LibTrack Role Info', {'fields': ('role',)}),
    )

admin.site.register(User, CustomUserAdmin)


admin.site.register(StudentProfile)
admin.site.register(TeacherProfile)