from django.urls import path
from .views import OCRScanView

urlpatterns = [
    path('extract/', OCRScanView.as_view(), name='ocr_extract'),
]