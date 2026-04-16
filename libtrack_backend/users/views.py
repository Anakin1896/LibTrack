from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    """
    React will call this endpoint with a valid token to get the logged-in user's details.
    """
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)