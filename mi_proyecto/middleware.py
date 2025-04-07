from django.shortcuts import redirect

class AuthRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.exempt_urls = [
            '/accounts/login/',
            '/accounts/logout/',
            '/accounts/register/',
            '/accounts/inicio/'
        ]

    def __call__(self, request):
        if not request.user.is_authenticated and not any(
            request.path.startswith(url) for url in self.exempt_urls
        ):
            return redirect(f'/accounts/login/?next={request.path}')
        return self.get_response(request)