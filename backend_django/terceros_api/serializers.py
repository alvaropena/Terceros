from rest_framework import serializers
from .models import Tercero

class TerceroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tercero
        # Esto le dice a Django que envíe todos los campos al Frontend
        fields = '__all__'