# hardware/backend/main/analytics_view.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions

from .models import Article, Product, User, Comment
from .serializers import ArticleSerializer, ProductSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_dashboard_view(request):
    # Sadece admin/editor erişsin
    if getattr(request.user, 'role', None) not in ['ADMIN', 'SUPER_ADMIN', 'EDITOR']:
        return Response(
            {'success': False, 'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN,
        )

    total_articles = Article.objects.count()
    published_articles = Article.objects.filter(status='PUBLISHED').count()
    total_products = Product.objects.count()
    total_users = User.objects.count()
    total_comments = Comment.objects.count()
    approved_comments = Comment.objects.filter(status='APPROVED').count()

    recent_articles = Article.objects.order_by('-created_at')[:5]
    recent_products = Product.objects.order_by('-created_at')[:5]

    data = {
        'overview': {
            'total_articles': total_articles,
            'published_articles': published_articles,
            'total_products': total_products,
            'total_users': total_users,
            'total_comments': total_comments,
            'approved_comments': approved_comments,
        },
        'recent_articles': ArticleSerializer(recent_articles, many=True).data,
        'recent_products': ProductSerializer(recent_products, many=True).data,
    }

    return Response({'success': True, 'data': data})
