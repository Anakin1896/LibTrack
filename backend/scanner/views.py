from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from PIL import Image
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

class OCRScanView(APIView):

    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [] 

    def post(self, request, *args, **kwargs):

        if 'image' not in request.FILES:
            return Response({"error": "No image file provided."}, status=status.HTTP_400_BAD_REQUEST)
        
        image_file = request.FILES['image']
        
        try:
            img = Image.open(image_file)
            extracted_text = pytesseract.image_to_string(img)
            clean_text = "\n".join([line for line in extracted_text.splitlines() if line.strip()])

            return Response({
                "success": True,
                "extracted_text": clean_text
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)