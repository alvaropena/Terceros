from rest_framework import viewsets, filters
from .models import Tercero
from .serializers import TerceroSerializer


class TerceroViewSet(viewsets.ModelViewSet):
    queryset = Tercero.objects.all()
    serializer_class = TerceroSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    
    # ¡Añade aquí los nuevos campos!
    filterset_fields = [
        'nombres', 
        'telefono_1', 
        'telefono_2', 
        'pais', 
        'regimen', 
        'autoretenedor', 
        'pos_num'
    ]
    search_fields = ['nit', 'nombres']