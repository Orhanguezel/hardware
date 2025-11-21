from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models_extra import NewsletterSubscription
from .serializers import NewsletterSubscriptionSerializer


# Newsletter Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def newsletter_subscribe_view(request):
    """Subscribe to newsletter"""
    email = request.data.get('email')
    source = request.data.get('source', 'website')
    
    if not email:
        return Response({
            'success': False,
            'error': 'E-posta adresi gerekli'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate email format
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    
    try:
        validate_email(email)
    except ValidationError:
        return Response({
            'success': False,
            'error': 'Geçerli bir e-posta adresi girin'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Check if already subscribed
        subscription, created = NewsletterSubscription.objects.get_or_create(
            email=email,
            defaults={
                'is_active': True,
                'source': source,
                'ip_address': request.META.get('REMOTE_ADDR', ''),
                'user_agent': request.META.get('HTTP_USER_AGENT', '')
            }
        )
        
        if not created:
            if subscription.is_active:
                return Response({
                    'success': False,
                    'error': 'Bu e-posta adresi zaten bültene abone'
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Reactivate subscription
                subscription.is_active = True
                subscription.unsubscribed_at = None
                subscription.source = source
                subscription.ip_address = request.META.get('REMOTE_ADDR', '')
                subscription.user_agent = request.META.get('HTTP_USER_AGENT', '')
                subscription.save()
        
        return Response({
            'success': True,
            'message': 'Bültene başarıyla abone oldunuz!'
        })
        
    except Exception as e:
        print(f"Newsletter subscription error: {e}")
        return Response({
            'success': False,
            'error': 'Abone olma sırasında bir hata oluştu'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def newsletter_unsubscribe_view(request):
    """Unsubscribe from newsletter"""
    email = request.data.get('email')
    
    if not email:
        return Response({
            'success': False,
            'error': 'E-posta adresi gerekli'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        subscription = NewsletterSubscription.objects.get(email=email)
        subscription.is_active = False
        subscription.unsubscribed_at = timezone.now()
        subscription.save()
        
        return Response({
            'success': True,
            'message': 'Bülten aboneliğiniz iptal edildi'
        })
        
    except NewsletterSubscription.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Bu e-posta adresi bültene abone değil'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Newsletter unsubscription error: {e}")
        return Response({
            'success': False,
            'error': 'Abonelik iptal etme sırasında bir hata oluştu'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def newsletter_subscribers_view(request):
    """Get newsletter subscribers (admin only)"""
    if not hasattr(request.user, 'role') or request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    
    active_only = request.GET.get('active', 'true').lower() == 'true'
    queryset = NewsletterSubscription.objects.all()
    
    if active_only:
        queryset = queryset.filter(is_active=True)
    
    serializer = NewsletterSubscriptionSerializer(queryset, many=True)
    return Response({
        'success': True,
        'data': serializer.data,
        'count': queryset.count()
    })
