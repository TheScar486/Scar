from django.urls import path
from . import views

app_name = 'distribucion'

urlpatterns = [
    path('', views.index, name='index'),
    path('buscar-productos/', views.buscar_productos, name='buscar_productos'),
    path('api/pedidos/', views.crear_pedido, name='crear_pedido'),
    path('api/pedidos/listar/', views.obtener_pedidos, name='obtener_pedidos'),
    path('generar-pdf-pedido/<int:pedido_id>/', views.generar_pdf_pedido, name='generar_pdf_pedido'),
]