from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib import messages
from django.contrib.auth.decorators import login_required

def register(request):
    """
    Vista para el registro de nuevos usuarios
    """
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'¡Cuenta creada exitosamente para {username}! Ahora puedes iniciar sesión.')
            return redirect('login')
    else:
        form = UserCreationForm()
    
    return render(request, 'accounts/register.html', {
        'form': form,
        'title': 'Registro de usuario'
    })

@login_required
def vista_protegida(request):
    """
    Vista protegida que requiere autenticación
    """
    return render(request, 'accounts/template_protegido.html', {
        'title': 'Área restringida'
    })

from django.contrib.auth.decorators import login_required

@login_required
def inicio(request):
    context = {
        'usuario': request.user,
        'titulo': 'Bienvenido a tu Dashboard'
    }
    return render(request, 'accounts/inicio.html', context)