from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookViewSet, BookCopyViewSet

router = DefaultRouter()
router.register(r'books', BookViewSet, basename='book')
router.register(r'copies', BookCopyViewSet, basename='bookcopy')

urlpatterns = [
    path('', include(router.urls)),
]