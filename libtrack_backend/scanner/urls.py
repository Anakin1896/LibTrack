from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LogbookScanViewSet

router = DefaultRouter()
router.register(r'uploads', LogbookScanViewSet, basename='scan-upload')

urlpatterns = [
    path('', include(router.urls)),
]