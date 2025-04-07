from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .forms import CustomLoginForm

urlpatterns = [
    # URLs de autenticación (sin el prefijo 'accounts/' porque ya está en mi_proyecto/urls.py)
    path('login/', auth_views.LoginView.as_view(
        template_name='accounts/login.html',
        authentication_form=CustomLoginForm
    ), name='login'),

    path('logout/', auth_views.LogoutView.as_view(
        template_name='accounts/logout.html',
        extra_context={'redirect_delay': 3}
    ), name='logout'),
    
    # URLs personalizadas
    path('register/', views.register, name='register'),
    path('protegida/', views.vista_protegida, name='vista-protegida'),
    path('inicio/', views.inicio, name='inicio'),
    
    # Opcional: URLs para cambio de contraseña si las necesitas
    path('password_change/', auth_views.PasswordChangeView.as_view(
        template_name='accounts/password_change.html'
    ), name='password_change'),
    
    path('password_change/done/', auth_views.PasswordChangeDoneView.as_view(
        template_name='accounts/password_change_done.html'
    ), name='password_change_done'),
]