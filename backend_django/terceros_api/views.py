from rest_framework import viewsets, filters
from .models import Tercero
from .serializers import TerceroSerializer

class TerceroViewSet(viewsets.ModelViewSet):
    queryset = Tercero.objects.all().order_by('id') # Es buena práctica ordenarlos por ID
    serializer_class = TerceroSerializer
    
    # Encendemos el motor de búsqueda
    filter_backends = [filters.SearchFilter]
    
    # Le decimos en qué columnas puede buscar el texto
    search_fields = ['nombres', 'nit']