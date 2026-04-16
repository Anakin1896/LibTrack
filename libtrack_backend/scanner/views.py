from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import LogbookScan
from .serializers import LogbookScanSerializer

class LogbookScanViewSet(viewsets.ModelViewSet):
    queryset = LogbookScan.objects.all().order_by('-uploaded_at')
    serializer_class = LogbookScanSerializer
    permission_classes = [IsAuthenticated]

    parser_classes = (MultiPartParser, FormParser) 

    def perform_create(self, serializer):

        scan_instance = serializer.save(uploaded_by=self.request.user)
        