@echo off
REM Activar el entorno virtual
call "%USERPROFILE%\Desktop\My App\env\Scripts\activate.bat"

REM Navegar al directorio del proyecto
cd /d "%USERPROFILE%\Desktop\My App"

REM Iniciar el servidor de Django en segundo plano (sin abrir ventana adicional)
start /B python manage.py runserver

REM Abrir el navegador en la URL del servidor local
start http://127.0.0.1:8000

pause
