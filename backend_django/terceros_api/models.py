# Create your models here.
from django.db import models

class Tercero(models.Model):
    # Clave primaria
    id = models.AutoField(primary_key=True)
    
    # Datos de identificación
    nit = models.BigIntegerField(null=True, blank=True, verbose_name="NIT")
    digito = models.IntegerField(null=True, blank=True, verbose_name="Dígito de Verificación")
    tipo_identificacion = models.TextField(null=True, blank=True, verbose_name="Tipo de Identificación")
    nombres = models.TextField(null=True, blank=True, verbose_name="Nombres / Razón Social")
    
    # Datos de contacto y ubicación
    direccion = models.TextField(null=True, blank=True, verbose_name="Dirección")
    ciudad = models.TextField(null=True, blank=True, verbose_name="Ciudad")
    telefono_1 = models.TextField(null=True, blank=True, verbose_name="Teléfono 1")
    telefono_2 = models.TextField(null=True, blank=True, verbose_name="Teléfono 2")
    fax = models.TextField(null=True, blank=True, verbose_name="Fax")
    apartado_aereo = models.TextField(null=True, blank=True, verbose_name="Apartado Aéreo")
    pais = models.TextField(null=True, blank=True, verbose_name="País")
    mail = models.TextField(null=True, blank=True, verbose_name="Correo Electrónico")
    
    # Datos tributarios y contables
    gran_contribuyente = models.IntegerField(null=True, blank=True, verbose_name="Gran Contribuyente")
    autoretenedor = models.IntegerField(null=True, blank=True, verbose_name="Autorretenedor")
    pos_num = models.IntegerField(null=True, blank=True, verbose_name="POS Num")
    regimen = models.TextField(null=True, blank=True, verbose_name="Régimen")

    class Meta:
        # El nombre exacto de la tabla según tu captura de pgAdmin
        db_table = 'Terceros'
        # Crucial para no afectar los datos existentes
        managed = False 

    def __str__(self):
        return f"{self.nit} - {self.nombres}"