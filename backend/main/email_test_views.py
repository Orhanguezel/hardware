# hardware/backend/main/email_test_views.py

from typing import TypedDict, Dict

from django.conf import settings as dj_settings
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework import status

from .models import Setting, User


# ----------------- Types ----------------- #

class EmailConfig(TypedDict):
    host: str
    port: int
    use_tls: bool
    use_ssl: bool
    host_user: str
    host_password: str
    default_from_email: str


# ----------------- Permission ----------------- #

class IsAdminOrSuperAdmin(BasePermission):
    """
    Sadece role alanı ADMIN / SUPER_ADMIN olan kullanıcılar için izin verir.
    """
    def has_permission(self, request, view) -> bool:
        user = request.user
        if not isinstance(user, User):
            return False
        if not user.is_authenticated:
            return False

        role = getattr(user, "role", "") or ""
        # İstersen is_staff ve is_superuser'ı da kabul edebilirsin:
        return role in ("ADMIN", "SUPER_ADMIN") or user.is_staff or user.is_superuser


# ----------------- Helpers ----------------- #

EMAIL_SETTING_KEYS: Dict[str, str] = {
    "host": "email.host",
    "port": "email.port",
    "use_tls": "email.use_tls",
    "use_ssl": "email.use_ssl",
    "host_user": "email.host_user",
    "host_password": "email.host_password",
    "default_from_email": "email.default_from_email",
}


def _str_to_bool(value: str | bool | None, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return default
    value_str = str(value).strip().lower()
    return value_str in ("1", "true", "yes", "on")


def _str_to_int(value: str | int | None, default: int) -> int:
    if isinstance(value, int):
        return value
    if value is None:
        return default
    try:
        return int(str(value))
    except (TypeError, ValueError):
        return default


def load_email_config_from_db() -> EmailConfig:
    """
    Setting tablosundan email.* key'lerini okur,
    boş olanları / bulunmayanları Django settings default'ları ile doldurur.
    """

    qs = Setting.objects.filter(key__in=EMAIL_SETTING_KEYS.values())
    raw_map: Dict[str, str] = {s.key: (s.value or "") for s in qs}

    host = raw_map.get(EMAIL_SETTING_KEYS["host"]) or getattr(dj_settings, "EMAIL_HOST", "")
    port_raw = raw_map.get(EMAIL_SETTING_KEYS["port"]) or getattr(dj_settings, "EMAIL_PORT", 587)
    use_tls_raw = raw_map.get(EMAIL_SETTING_KEYS["use_tls"]) or getattr(
        dj_settings, "EMAIL_USE_TLS", True
    )
    use_ssl_raw = raw_map.get(EMAIL_SETTING_KEYS["use_ssl"]) or getattr(
        dj_settings, "EMAIL_USE_SSL", False
    )
    host_user = raw_map.get(EMAIL_SETTING_KEYS["host_user"]) or getattr(
        dj_settings, "EMAIL_HOST_USER", ""
    )
    host_password = raw_map.get(EMAIL_SETTING_KEYS["host_password"]) or getattr(
        dj_settings, "EMAIL_HOST_PASSWORD", ""
    )
    default_from_email = raw_map.get(EMAIL_SETTING_KEYS["default_from_email"]) or getattr(
        dj_settings, "DEFAULT_FROM_EMAIL", ""
    )

    config: EmailConfig = {
        "host": str(host),
        "port": _str_to_int(port_raw, 587),
        "use_tls": _str_to_bool(use_tls_raw, True),
        "use_ssl": _str_to_bool(use_ssl_raw, False),
        "host_user": str(host_user),
        "host_password": str(host_password),
        "default_from_email": str(default_from_email or host_user),
    }
    return config


def apply_email_config(config: EmailConfig) -> None:
    """
    Django runtime settings'ini DB'den gelen konfigurasyona göre override eder.
    Global settings objesini değiştiriyoruz; process bazlı.
    """
    dj_settings.EMAIL_HOST = config["host"]
    dj_settings.EMAIL_PORT = config["port"]
    dj_settings.EMAIL_USE_TLS = config["use_tls"]
    dj_settings.EMAIL_USE_SSL = config["use_ssl"]
    dj_settings.EMAIL_HOST_USER = config["host_user"]
    dj_settings.EMAIL_HOST_PASSWORD = config["host_password"]
    dj_settings.DEFAULT_FROM_EMAIL = config["default_from_email"]


# ----------------- View ----------------- #

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminOrSuperAdmin])
def test_email_view(request):
    """
    POST /api/email/test/

    Body:
    {
        "to": "test@example.com",
        "subject": "Opsiyonel konu",
        "message": "Opsiyonel gövde"
    }
    """
    to = request.data.get("to")
    subject = request.data.get("subject") or "Hardware Review - Test E-postası"
    message = request.data.get("message") or (
        "Merhaba,\n\n"
        "Bu e-posta Donanım İnceleme projesi için SMTP ayarlarının "
        "doğru çalışıp çalışmadığını test etmek amacıyla gönderilmiştir.\n\n"
        "Donanım Puanı"
    )

    if not to:
        return Response(
            {"success": False, "error": '"to" alanı zorunludur.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # DB'den konfigürasyonu çek ve uygula
    config = load_email_config_from_db()

    if not config["host"] or not config["host_user"]:
        return Response(
            {
                "success": False,
                "error": "Email host veya kullanıcı ayarları eksik. Lütfen admin panelden SMTP ayarlarını doldurun.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    apply_email_config(config)

    try:
        sent_count = send_mail(
            subject,
            message,
            config["default_from_email"],
            [to],
            fail_silently=False,
        )
    except Exception as exc:  # noqa: BLE001
        return Response(
            {"success": False, "error": f"Mail gönderilemedi: {exc}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    if sent_count <= 0:
        return Response(
            {"success": False, "error": "Mail gönderilemedi (send_mail 0 döndü)."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {
            "success": True,
            "message": "Test e-postası başarıyla gönderildi.",
        },
        status=status.HTTP_200_OK,
    )
