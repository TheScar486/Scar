from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Catalogo
from django.db import models
import json

def index(request):
    """Vista principal"""
    return render(request, 'distribucion/index.html')

@csrf_exempt
def buscar_productos(request):
    try:
        query = request.GET.get('q', '')
        filter_type = request.GET.get('filter', 'all')  # Nuevo parámetro
        
        print(f"Buscando productos con query: {query} y filtro: {filter_type}")
        
        # Construir la consulta según el tipo de filtro
        q_objects = models.Q()
        
        if query:  # Solo si hay query
            if filter_type == 'all':
                q_objects = (
                    models.Q(Descripcion__icontains=query) |
                    models.Q(Codigo__icontains=query) |
                    models.Q(Proveedor__icontains=query) |
                    models.Q(Categoria__icontains=query)
                )
            elif filter_type == 'category':
                q_objects = models.Q(Categoria__icontains=query)
            elif filter_type == 'provider':
                q_objects = models.Q(Proveedor__icontains=query)
            elif filter_type == 'code':
                q_objects = models.Q(Codigo__icontains=query)
            elif filter_type == 'description':
                q_objects = models.Q(Descripcion__icontains=query)
        
        productos = Catalogo.objects.filter(q_objects).values(
            'ID_Articulo', 'Codigo', 'Descripcion', 
            'Cantidad_Stock', 'Precio_Base', 'Proveedor', 'Categoria'
        )
        
        # Convertir Decimal a float para serialización
        productos_list = list(productos)
        for producto in productos_list:
            if 'Precio_Base' in producto and producto['Precio_Base'] is not None:
                producto['Precio_Base'] = float(producto['Precio_Base'])
        
        print(f"Productos encontrados: {len(productos_list)}")
        return JsonResponse(productos_list, safe=False)
    
    except Exception as e:
        print(f"Error en buscar_productos: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def obtener_producto_por_id(request, id):
    try:
        producto = Catalogo.objects.filter(ID_Articulo=id).values(
            'ID_Articulo', 'Codigo', 'Descripcion', 
            'Precio_Base', 'Proveedor', 'Categoria'
        ).first()
        
        if not producto:
            return JsonResponse({'error': 'Producto no encontrado'}, status=404)
            
        # Convertir Decimal a float
        if producto['Precio_Base'] is not None:
            producto['Precio_Base'] = float(producto['Precio_Base'])
        
        return JsonResponse(producto)
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
        

from .models import Pedido, ItemPedido
from django.db import transaction
from datetime import datetime
from django.contrib.auth.decorators import login_required

@csrf_exempt
@transaction.atomic
def crear_pedido(request):
    # Verificación manual de autenticación para APIs
    if not request.user.is_authenticated:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({'error': 'Authentication required'}, status=401)
        from django.contrib.auth.views import redirect_to_login
        return redirect_to_login(request.path)
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Validación básica
            if not data.get('grupo'):
                return JsonResponse({'error': 'El grupo es requerido'}, status=400)
            
            # Generar número de pedido
            from .models import Pedido
            ultimo_pedido = Pedido.objects.order_by('-id').first()
            nuevo_numero = "PE-001" if not ultimo_pedido else f"PE-{int(ultimo_pedido.numero_pedido.split('-')[1]) + 1:06d}"
            
            # Crear el pedido
            pedido = Pedido.objects.create(
                numero_pedido=nuevo_numero,
                estado='Pendiente',
                creado_por=request.user.username,
                grupo=data['grupo'],
                fecha_creacion=datetime.now()
            )
            
            # Crear items
            from .models import ItemPedido
            items = [
                ItemPedido(
                    pedido=pedido,
                    codigo=item.get('codigo', ''),
                    descripcion=item.get('descripcion', ''),
                    departamento=item.get('departamento', ''),
                    cantidad=item.get('cantidad', 1)
                )
                for item in data.get('items', [])
            ]
            ItemPedido.objects.bulk_create(items)
            
            return JsonResponse({
                'success': True,
                'pedido_id': pedido.id,
                'numero_pedido': pedido.numero_pedido
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

from django.http import JsonResponse
from .models import Pedido  # Asegúrate de importar tu modelo de pedidos
from django.views.decorators.http import require_GET

@require_GET
def obtener_pedidos(request):
    try:
        pedidos = Pedido.objects.all().values(
            'numero_pedido',
            'creado_por',
            'grupo',
            'estado',
            'fecha_creacion'
        ).order_by('-fecha_creacion')  # Ordenar por fecha descendente
        
        # Convertir el QuerySet a lista para JsonResponse
        pedidos_list = list(pedidos)
        
        return JsonResponse(pedidos_list, safe=False)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
from django.http import HttpResponse
from django.template.loader import get_template
from weasyprint import HTML, CSS
from django.shortcuts import get_object_or_404
from django.templatetags.static import static
from .models import Pedido, ItemPedido
import os
from django.conf import settings

def generar_pdf_pedido(request, pedido_id):
    pedido = get_object_or_404(Pedido, id=pedido_id)
    items = ItemPedido.objects.filter(pedido_id=pedido_id).order_by('departamento')  # Ordena por 'departamento'

    context = {
        'pedido': pedido,
        'items': items,
        #'logo_path': request.build_absolute_uri(static('img/logo.png')),
        'fecha': pedido.fecha_creacion.strftime("%d/%m/%Y %H:%M")
    }

    # Renderizar HTML
    template = get_template('pdf/pedido_detalle.html')
    html = template.render(context)

    # Generar respuesta PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="pedido_{pedido.numero_pedido}.pdf"'

    # Ruta para recursos estáticos
    base_url = request.build_absolute_uri('/')

    HTML(string=html, base_url=base_url).write_pdf(response)

    return response
