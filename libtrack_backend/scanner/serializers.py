from rest_framework import serializers
from .models import LogbookScan

class LogbookScanSerializer(serializers.ModelSerializer):
    uploader_name = serializers.ReadOnlyField(source='uploaded_by.username')

    class Meta:
        model = LogbookScan
        fields = ['id', 'scan_image', 'extracted_text_json', 'uploaded_by', 'uploader_name', 'uploaded_at', 'status']
        read_only_fields = ['extracted_text_json', 'status', 'uploaded_by']