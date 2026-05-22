from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TerceroViewSet

# El router genera automáticamente rutas como: /api/terceros/ y /api/terceros/<id>/
router = DefaultRouter()
router.register(r'terceros', TerceroViewSet, basename='tercero')

urlpatterns = [
    path('', include(router.urls)),
]