import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password as django_validate_password
from .models import User, StudentProfile, TeacherProfile
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import PermissionDenied

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ('student_id_number', 'course', 'year_level')

class TeacherProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherProfile
        fields = ('employee_id', 'department')

class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    teacher_profile = TeacherProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'student_profile', 'teacher_profile')

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role')

    def validate(self, data):
        username = data.get('username')
        role = data.get('role', 'STUDENT')

        if role == 'STUDENT':

            if not re.match(r'^\d{4}-\d{5}$', username):
                raise serializers.ValidationError({"username": "Student ID must follow the format YYYY-NNNNN (e.g., 2024-12345)."})
        elif role in ['TEACHER', 'LIBRARIAN']:

            if not re.match(r'^EMP-\d{4}$', username):
                raise serializers.ValidationError({"username": "Employee ID must follow the format EMP-NNNN (e.g., EMP-0012)."})

        return data

    def validate_password(self, value):
        """
        Custom password validation to enforce specific rules.
        """

        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")

        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least 1 uppercase letter.")

        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least 1 number.")

        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least 1 symbol.")
            
        django_validate_password(value)
        
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'STUDENT')
        )
        return user
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):

        data = super().validate(attrs)

        if self.user.requires_password_change:

            raise PermissionDenied(detail="password_change_required")
            
        return data