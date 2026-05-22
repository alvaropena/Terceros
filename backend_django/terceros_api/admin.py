# Register your models here.
from django.contrib import admin
from .models import Tercero

@admin.register(Tercero)
class TerceroAdmin(admin.ModelAdmin):
    # Estas son las columnas que se verán en la tabla del panel de Django
    list_display = ('id', 'nit', 'nombres', 'telefono_1', 'ciudad')
    
    # Agregamos una barra de búsqueda interna
    search_fields = ('nit', 'nombres')
    
    # Agregamos un filtro lateral (muy útil para filtrar por ciudad rápidamente)
    list_filter = ('ciudad',)
    
    # Paginación predeterminada en el panel (para que no cargue los 18,000 de golpe)
    list_per_page = 50