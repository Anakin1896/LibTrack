from rest_framework import generics, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer
from .serializers import CustomTokenObtainPairSerializer
from .serializers import NotificationSerializer
from .models import Notification

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(is_superuser=False).order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        raw_password = self.request.data.get('password')
        user = serializer.save()
        
        if raw_password:
            user.set_password(raw_password)
            user.requires_password_change = True
            user.save()

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ChangePasswordView(APIView):

    permission_classes = [AllowAny] 

    def post(self, request):
        username = request.data.get('username')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        user = authenticate(username=username, password=old_password)
        
        if user is not None:
            
            user.set_password(new_password)
            user.requires_password_change = False
            user.save()

            return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid current password."}, status=status.HTTP_400_BAD_REQUEST)
        
class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')