# models.py
from django.db import models

class Catalogo(models.Model):
    ID_Articulo = models.AutoField(primary_key=True)
    Codigo = models.CharField(max_length=50, unique=True, null=True, blank=True)
    Descripcion = models.CharField(max_length=255)
    Cantidad_Stock = models.IntegerField(default=0)
    Unidad_Base = models.CharField(max_length=50)
    Precio_Compra = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    Precio_Base = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    IVA = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    Caracteristicas = models.TextField(null=True, blank=True)
    Categoria = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    Proveedor = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    Fecha_Registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Catalogo'  # Para mantener el nombre exacto de tu tabla
        verbose_name = 'Artículo del catálogo'
        verbose_name_plural = 'Artículos del catálogo'
        ordering = ['Descripcion']  # Orden por defecto

    def __str__(self):
        return f"{self.Codigo} - {self.Descripcion}" if self.Codigo else self.Descripcion
    

from django.db import models

class Pedido(models.Model):
    numero_pedido = models.CharField(max_length=10, unique=True)
    estado = models.CharField(max_length=20, choices=[
        ('Pendiente', 'Pendiente'),
        ('En revisión', 'En revisión'),
        ('Aprobado', 'Aprobado'),
        ('Rechazado', 'Rechazado'),
        ('Enviado', 'Enviado'),
        ('Completado', 'Completado'),
        ('Cancelado', 'Cancelado')
    ])
    creado_por = models.CharField(max_length=100)
    grupo = models.CharField(max_length=100, blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pedidos'  # Esto hace que Django use tu tabla existente

class ItemPedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, db_column='pedido_id')
    codigo = models.CharField(max_length=50)
    descripcion = models.TextField()
    departamento = models.CharField(max_length=100, blank=True, null=True)
    cantidad = models.IntegerField(default=1)

    class Meta:
        db_table = 'item_pedidos'  # Esto hace que Django use tu tabla existente

    