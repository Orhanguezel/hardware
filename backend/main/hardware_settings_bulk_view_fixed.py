from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt

from .models import Setting


@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([permissions.IsAuthenticated])
def settings_bulk_view(request):
    """Bulk get/set settings"""
    print("=== DJANGO SETTINGS BULK VIEW DEBUG ===")
    print(f"Request method: {request.method}")
    print(f"Request path: {request.path}")
    print(f"Request user: {request.user}")
    print(f"User role: {getattr(request.user, 'role', 'NO_ROLE')}")
    print(f"User authenticated: {request.user.is_authenticated}")

    if getattr(request.user, "role", None) not in ["ADMIN", "SUPER_ADMIN"]:
        print(
            f"Permission denied for user {request.user} with role "
            f"{getattr(request.user, 'role', 'NO_ROLE')}"
        )
        return Response(
            {"error": "Admin or Super Admin access required"},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "GET":
        # Get all settings grouped by category
        settings = Setting.objects.all().order_by("category", "key")
        grouped_settings: dict[str, dict[str, dict]] = {}

        for setting in settings:
            if setting.category not in grouped_settings:
                grouped_settings[setting.category] = {}

            cleaned_value = setting.value

            # ✅ Güvenli string kontrolü: None veya bool gelirse patlamasın
            if isinstance(cleaned_value, str) and (
                cleaned_value.startswith("{'value':")
                or cleaned_value.startswith('{"value":')
            ):
                # This looks like a nested object stored as string, try to extract the actual value
                try:
                    import json
                    import ast

                    # Try JSON first
                    try:
                        nested_obj = json.loads(cleaned_value.replace("'", '"'))
                        if isinstance(nested_obj, dict) and "value" in nested_obj:
                            cleaned_value = nested_obj["value"]
                            print(
                                f"Cleaned nested JSON value for {setting.key}: "
                                f"{cleaned_value}"
                            )
                    except Exception:
                        # Try ast.literal_eval for Python dict strings
                        try:
                            nested_obj = ast.literal_eval(cleaned_value)
                            if isinstance(nested_obj, dict) and "value" in nested_obj:
                                cleaned_value = nested_obj["value"]
                                print(
                                    f"Cleaned nested dict value for {setting.key}: "
                                    f"{cleaned_value}"
                                )
                        except Exception:
                            print(
                                f"Could not clean nested value for {setting.key}: "
                                f"{cleaned_value}"
                            )
                except Exception as e:
                    print(f"Error cleaning value for {setting.key}: {e}")

            grouped_settings[setting.category][setting.key] = {
                "value": cleaned_value,
                "description": setting.description,
                "is_file": setting.is_file,
            }

        # Ensure default categories exist with default values
        default_settings = {
            "general": {
                "site_name": {
                    "value": "Hardware Review",
                    "description": "Site name displayed in header and footer",
                    "is_file": False,
                },
                "site_description": {
                    "value": "Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.",
                    "description": "Site description displayed in footer",
                    "is_file": False,
                },
                "user_registration": {
                    "value": "true",
                    "description": "Allow user registration",
                    "is_file": False,
                },
                "affiliate_tracking": {
                    "value": "false",
                    "description": "Enable affiliate tracking",
                    "is_file": False,
                },
                "logo": {
                    "value": "",
                    "description": "Site logo file",
                    "is_file": True,
                },
                "favicon": {
                    "value": "",
                    "description": "Site favicon file",
                    "is_file": True,
                },
            },
            "appearance": {
                "primary_color": {
                    "value": "#3b82f6",
                    "description": "Primary theme color",
                    "is_file": False,
                },
                "secondary_color": {
                    "value": "#64748b",
                    "description": "Secondary theme color",
                    "is_file": False,
                },
                "custom_css": {
                    "value": "",
                    "description": "Custom CSS code",
                    "is_file": False,
                },
            },
            "seo": {
                "seo_title": {
                    "value": "Hardware Review - En İyi Donanım Rehberleri",
                    "description": "SEO title",
                    "is_file": False,
                },
                "seo_description": {
                    "value": "Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.",
                    "description": "SEO description",
                    "is_file": False,
                },
                "seo_keywords": {
                    "value": "donanım, router, modem, wifi, inceleme",
                    "description": "SEO keywords",
                    "is_file": False,
                },
            },
            "notifications": {
                "email_notifications": {
                    "value": "true",
                    "description": "Enable email notifications",
                    "is_file": False,
                },
                "comment_moderation": {
                    "value": "true",
                    "description": "Enable comment moderation",
                    "is_file": False,
                },
            },
            "integrations": {
                "google_analytics": {
                    "value": "",
                    "description": "Google Analytics tracking ID",
                    "is_file": False,
                },
                "facebook_pixel": {
                    "value": "",
                    "description": "Facebook Pixel tracking ID",
                    "is_file": False,
                },
            },
            "advanced": {
                "custom_js": {
                    "value": "",
                    "description": "Custom JavaScript code",
                    "is_file": False,
                },
            },
        }

        # Merge existing settings with defaults
        for category, category_settings in default_settings.items():
            if category not in grouped_settings:
                grouped_settings[category] = {}
            for key, default_data in category_settings.items():
                if key not in grouped_settings[category]:
                    grouped_settings[category][key] = default_data

        return Response({"success": True, "data": grouped_settings})

    # ---------- POST (bulk update) ----------
    from django.core.files.storage import default_storage
    from django.core.files.base import ContentFile
    import os
    import json

    print("=== SETTINGS BULK UPDATE DEBUG ===")
    print(f"Request content type: {request.content_type}")
    print(f"Request data keys: {list(request.data.keys())}")
    print(f"Request FILES keys: {list(request.FILES.keys())}")

    # Handle FormData - settings comes as JSON string
    settings_json = request.data.get("settings")
    if isinstance(settings_json, str):
        try:
            settings_data = json.loads(settings_json)
            print(f"Parsed settings data: {settings_data}")
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            return Response(
                {"success": False, "error": "Invalid settings JSON format"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        settings_data = settings_json or {}

    updated_settings: dict[str, dict[str, str]] = {}

    # Handle file uploads for logo and favicon
    logo_file = request.FILES.get("logo_file")
    favicon_file = request.FILES.get("favicon_file")

    print(f"Logo file: {logo_file}")
    print(f"Favicon file: {favicon_file}")

    for category, category_settings in settings_data.items():
        updated_settings[category] = {}
        for key, value in category_settings.items():
            is_file = False
            final_value = str(value)

            # Handle logo removal (empty string means remove)
            if key == "logo" and str(value) == "" and not logo_file:
                try:
                    old_setting = Setting.objects.get(key="logo")
                    if old_setting.value and old_setting.is_file:
                        old_file_path = old_setting.value.replace("/media/", "")
                        if default_storage.exists(old_file_path):
                            default_storage.delete(old_file_path)
                            print(f"Deleted old logo file: {old_file_path}")
                except Setting.DoesNotExist:
                    pass
                final_value = ""
                is_file = True

            # Handle favicon removal (empty string means remove)
            elif key == "favicon" and str(value) == "" and not favicon_file:
                try:
                    old_setting = Setting.objects.get(key="favicon")
                    if old_setting.value and old_setting.is_file:
                        old_file_path = old_setting.value.replace("/media/", "")
                        if default_storage.exists(old_file_path):
                            default_storage.delete(old_file_path)
                            print(f"Deleted old favicon file: {old_file_path}")
                except Setting.DoesNotExist:
                    pass
                final_value = ""
                is_file = True

            # Handle file uploads (logo)
            elif key == "logo" and logo_file:
                file_extension = os.path.splitext(logo_file.name)[1]
                unique_filename = f"settings/logo{file_extension}"

                try:
                    old_setting = Setting.objects.get(key="logo")
                    if old_setting.value and old_setting.is_file:
                        old_file_path = old_setting.value.replace("/media/", "")
                        if default_storage.exists(old_file_path):
                            default_storage.delete(old_file_path)
                except Setting.DoesNotExist:
                    pass

                file_path = default_storage.save(
                    unique_filename, ContentFile(logo_file.read())
                )
                if file_path.startswith("settings/"):
                    final_value = f"/media/{file_path}"
                else:
                    final_value = f"/media/settings/{file_path}"
                is_file = True
                print(f"Logo saved to: {final_value}")

            # Handle file uploads (favicon)
            elif key == "favicon" and favicon_file:
                file_extension = os.path.splitext(favicon_file.name)[1]
                unique_filename = f"settings/favicon{file_extension}"

                try:
                    old_setting = Setting.objects.get(key="favicon")
                    if old_setting.value and old_setting.is_file:
                        old_file_path = old_setting.value.replace("/media/", "")
                        if default_storage.exists(old_file_path):
                            default_storage.delete(old_file_path)
                except Setting.DoesNotExist:
                    pass

                file_path = default_storage.save(
                    unique_filename, ContentFile(favicon_file.read())
                )
                if file_path.startswith("settings/"):
                    final_value = f"/media/{file_path}"
                else:
                    final_value = f"/media/settings/{file_path}"
                is_file = True
                print(f"Favicon saved to: {final_value}")

            # Create or update setting
            setting, created = Setting.objects.get_or_create(
                key=key,
                defaults={
                    "category": category,
                    "value": final_value,
                    "is_file": is_file,
                },
            )
            if not created:
                setting.value = final_value
                setting.category = category
                setting.is_file = is_file
                setting.save()

            updated_settings[category][key] = setting.value

    return Response(
        {
            "success": True,
            "message": "Settings updated successfully",
            "data": updated_settings,
        }
    )
