from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.contrib.auth import authenticate
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from datetime import timedelta
from .models import User
from .models_extra import PasswordResetCode
from .serializers import PasswordResetCodeSerializer
from .email_utils import generate_password_reset_code, send_password_reset_email


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def request_password_reset_view(request):
    """Request password reset code"""
    email = request.data.get('email')
    
    if not email:
        return Response({
            'success': False,
            'error': 'E-posta adresi gerekli'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate email format
    try:
        validate_email(email)
    except ValidationError:
        return Response({
            'success': False,
            'error': 'Geçerli bir e-posta adresi girin'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Check if user exists
        user = User.objects.get(email=email)
        
        # Generate 6-digit code
        code = generate_password_reset_code()
        
        # Set expiration time (15 minutes)
        expires_at = timezone.now() + timedelta(minutes=15)
        
        # Deactivate any existing codes for this user
        PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Create new password reset code
        reset_code = PasswordResetCode.objects.create(
            user=user,
            code=code,
            expires_at=expires_at,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        # Send email
        email_sent = send_password_reset_email(user, code)
        
        if email_sent:
            return Response({
                'success': True,
                'message': 'Şifre sıfırlama kodu e-posta adresinize gönderildi',
                'expires_in_minutes': 15
            })
        else:
            return Response({
                'success': False,
                'error': 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except User.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response({
            'success': True,
            'message': 'E-posta adresiniz sistemde kayıtlıysa, şifre sıfırlama kodu gönderilmiştir'
        })
    except Exception as e:
        print(f"Password reset request error: {e}")
        return Response({
            'success': False,
            'error': 'Bir hata oluştu. Lütfen tekrar deneyin'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_reset_code_view(request):
    """Verify password reset code"""
    email = request.data.get('email')
    code = request.data.get('code')
    
    if not email or not code:
        return Response({
            'success': False,
            'error': 'E-posta adresi ve kod gerekli'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Find valid reset code
        reset_code = PasswordResetCode.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).first()
        
        if not reset_code:
            return Response({
                'success': False,
                'error': 'Geçersiz veya kullanılmış kod'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if reset_code.is_expired():
            return Response({
                'success': False,
                'error': 'Kod süresi dolmuş. Lütfen yeni kod talep edin'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': True,
            'message': 'Kod doğrulandı. Yeni şifrenizi belirleyebilirsiniz',
            'code_id': reset_code.id
        })
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Kullanıcı bulunamadı'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Verify reset code error: {e}")
        return Response({
            'success': False,
            'error': 'Bir hata oluştu. Lütfen tekrar deneyin'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password_view(request):
    """Reset password with code"""
    email = request.data.get('email')
    code = request.data.get('code')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')
    
    if not all([email, code, new_password, confirm_password]):
        return Response({
            'success': False,
            'error': 'Tüm alanlar gerekli'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate passwords match
    if new_password != confirm_password:
        return Response({
            'success': False,
            'error': 'Şifreler eşleşmiyor'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password length
    if len(new_password) < 6:
        return Response({
            'success': False,
            'error': 'Şifre en az 6 karakter olmalıdır'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Find valid reset code
        reset_code = PasswordResetCode.objects.filter(
            user=user,
            code=code,
            is_used=False
        ).first()
        
        if not reset_code:
            return Response({
                'success': False,
                'error': 'Geçersiz veya kullanılmış kod'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if reset_code.is_expired():
            return Response({
                'success': False,
                'error': 'Kod süresi dolmuş. Lütfen yeni kod talep edin'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        # Mark code as used
        reset_code.is_used = True
        reset_code.save()
        
        return Response({
            'success': True,
            'message': 'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz'
        })
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Kullanıcı bulunamadı'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Reset password error: {e}")
        return Response({
            'success': False,
            'error': 'Bir hata oluştu. Lütfen tekrar deneyin'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
