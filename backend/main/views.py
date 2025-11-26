# hardware/backend/main/views.py

import json
from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q, Count, Avg
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import *
from .serializers import *
from .models_extra import (
    PriceHistory,
    NewsletterSubscription,
    ArticleTag,
    ReviewExtra,
    BestListExtra,
)
from .filters import *
from .email_utils import send_verification_email, is_verification_token_valid, verify_user_email

def parse_tags(raw):
    """
    Frontend'den gelen tags input'unu integer id listesine çevirir.
    Örn:
      - "1,2,3"
      - "[1,2,3]"
      - ["1","2"]
      - [1, 2]
    hepsini [1,2,3] şeklinde döndürür.
    """
    if raw is None:
        return []

    # Örn. JSON string ya da comma-separated string
    if isinstance(raw, str):
        raw = raw.strip()
        if not raw:
            return []

        # Önce JSON array mi diye deneyelim
        try:
            data = json.loads(raw)
            if isinstance(data, list):
                result = []
                for x in data:
                    s = str(x).strip()
                    if not s:
                        continue
                    try:
                        result.append(int(s))
                    except ValueError:
                        continue
                return result
        except Exception:
            # JSON değilse; "1,2,3" gibi düşün
            parts = [p.strip() for p in raw.split(",") if p.strip()]
            result = []
            for p in parts:
                try:
                    result.append(int(p))
                except ValueError:
                    continue
            return result

    # Liste / tuple ise
    if isinstance(raw, (list, tuple)):
        result = []
        for x in raw:
            s = str(x).strip()
            if not s:
                continue
            try:
                result.append(int(s))
            except ValueError:
                continue
        return result

    # Diğer tipler için string'e çevirip tekrar dene
    try:
        return parse_tags(str(raw))
    except Exception:
        return []



# Authentication Views

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])  # 🔴 Burada global auth'u override ediyoruz
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']

        # Email doğrulama kontrolü
        if not getattr(user, "email_verified", False):
            return Response(
                {
                    "success": False,
                    "error": "E-posta adresiniz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin ve doğrulama linkine tıklayın.",
                    "email_verification_required": True,
                    "email": user.email,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "success": True,
                "token": token.key,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )

    # Geçersiz credential ya da serializer error
    return Response(
        {
            "success": False,
            "error": "Geçersiz giriş bilgileri.",
            "detail": serializer.errors,
        },
        status=status.HTTP_400_BAD_REQUEST,
    )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
@authentication_classes([])  # 🔴 Burada global auth'u override ediyoruz
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Send verification email
        email_sent = send_verification_email(user)
        
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'success': True,
            'token': token.key,
            'user': UserSerializer(user).data,
            'email_sent': email_sent,
            'message': 'Kayıt başarılı! E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.'
        }, status=status.HTTP_201_CREATED)
    
    # Hata mesajlarını düzgün formatta döndür
    error_messages = []
    for field, errors in serializer.errors.items():
        if isinstance(errors, list):
            for error in errors:
                error_messages.append(str(error))
        else:
            error_messages.append(str(errors))
    
    # Ana hata mesajını belirle
    main_error = 'Kayıt sırasında bir hata oluştu'
    if error_messages:
        main_error = error_messages[0]
    
    return Response({
        'success': False,
        'error': main_error,
        'details': error_messages,
        'field_errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    try:
        request.user.auth_token.delete()
        return Response({'success': True, 'message': 'Successfully logged out.'})
    except:
        return Response({'success': False, 'message': 'Error logging out.'}, status=status.HTTP_400_BAD_REQUEST)


# Email Verification Views
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def verify_email_view(request):
    """Verify user email with token"""
    token = request.data.get('token')
    email = request.data.get('email')
    
    if not token or not email:
        return Response({
            'success': False,
            'error': 'Token ve e-posta adresi gerekli'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Kullanıcı bulunamadı'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if not is_verification_token_valid(user, token):
        return Response({
            'success': False,
            'error': 'Geçersiz veya süresi dolmuş doğrulama kodu'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify user email
    verify_user_email(user)
    
    return Response({
        'success': True,
        'message': 'E-posta adresiniz başarıyla doğrulandı!',
        'user': UserSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def resend_verification_email_view(request):
    """Resend verification email to authenticated user"""
    user = request.user
    
    if user.email_verified:
        return Response({
            'success': False,
            'error': 'E-posta adresiniz zaten doğrulanmış'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    email_sent = send_verification_email(user)
    
    if email_sent:
        return Response({
            'success': True,
            'message': 'Doğrulama e-postası tekrar gönderildi'
        })
    else:
        return Response({
            'success': False,
            'error': 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_email_verification_status_view(request):
    """Check if user's email is verified"""
    user = request.user
    
    return Response({
        'success': True,
        'email_verified': user.email_verified is not None,
        'email_verified_at': user.email_verified,
        'user': UserSerializer(user).data
    })


# Category Views
class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = CategoryFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'sort_order', 'created_at']
    ordering = ['sort_order', 'name']


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_object(self):
        # Check if we're using ID-based lookup
        print(f"CategoryDetailView - kwargs: {self.kwargs}")
        if 'pk' in self.kwargs:
            print(f"Using ID lookup for category: {self.kwargs['pk']}")
            self.lookup_field = 'pk'
        else:
            print(f"Using slug lookup for category: {self.kwargs.get('slug', 'not found')}")
        return super().get_object()


# Tag Views
class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = TagFilter
    search_fields = ['name']
    ordering_fields = ['name', 'type']
    ordering = ['name']
    
    def perform_create(self, serializer):
        # Only authenticated users can create tags
        if not self.request.user.is_authenticated:
            raise permissions.PermissionDenied("Authentication required to create tags")
        serializer.save()


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_object(self):
        # Check if we're using ID-based lookup
        print(f"TagDetailView - kwargs: {self.kwargs}")
        if 'pk' in self.kwargs:
            print(f"Using ID lookup for tag: {self.kwargs['pk']}")
            self.lookup_field = 'pk'
        else:
            print(f"Using slug lookup for tag: {self.kwargs.get('slug', 'not found')}")
        return super().get_object()
    
    def perform_update(self, serializer):
        # Only authenticated users can update tags
        if not self.request.user.is_authenticated:
            raise permissions.PermissionDenied("Authentication required to update tags")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only authenticated users can delete tags
        if not self.request.user.is_authenticated:
            raise permissions.PermissionDenied("Authentication required to delete tags")
        instance.delete()


# Product Views
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['brand', 'model', 'description']
    ordering_fields = ['brand', 'model', 'release_year', 'created_at']
    ordering = ['-created_at']

    def create(self, request, *args, **kwargs):
        print(f"ProductListCreateView - Request content type: {request.content_type}")
        print(f"ProductListCreateView - Request data: {request.data}")
        
        return super().create(request, *args, **kwargs)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class ProductDetailByIdView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'pk'

    def update(self, request, *args, **kwargs):
        print(f"ProductDetailByIdView UPDATE - Request content type: {request.content_type}")
        print(f"ProductDetailByIdView UPDATE - Request data: {request.data}")
        print(f"ProductDetailByIdView UPDATE - User: {request.user}")
        print(f"ProductDetailByIdView UPDATE - PK: {kwargs.get('pk')}")
        
        try:
            response = super().update(request, *args, **kwargs)
            print(f"ProductDetailByIdView UPDATE - Success: {response.data}")
            return response
        except Exception as e:
            print(f"ProductDetailByIdView UPDATE - Error: {str(e)}")
            raise

class ArticleListCreateView(generics.ListCreateAPIView):
    queryset = Article.objects.filter(status="PUBLISHED")
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ArticleFilter
    search_fields = ["title", "subtitle", "excerpt", "content"]
    ordering_fields = ["title", "published_at", "created_at"]
    ordering = ["-published_at", "-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        # Admin, super admin and editors can see all articles
        user = self.request.user
        if user.is_authenticated and getattr(user, "role", None) in [
            "ADMIN",
            "SUPER_ADMIN",
            "EDITOR",
        ]:
            queryset = Article.objects.all()
        return queryset

    def perform_create(self, serializer):
        # Automatically set the author to the current user
        article = serializer.save(author=self.request.user)

        # --- DEBUG LOGS (isteğe bağlı) ---
        print(
            f"All serializer initial_data keys: {list(serializer.initial_data.keys())}"
        )
        print(f"Tags in initial_data: {'tags' in serializer.initial_data}")
        if "tags" in serializer.initial_data:
            print(f"Raw tags data: {serializer.initial_data['tags']}")

        # ---------- TAGS ----------
        raw_tags = serializer.initial_data.get("tags")
        tags_data = parse_tags(raw_tags)
        print(f"Parsed tags_data: {tags_data}")

        if tags_data:
            created_count = 0
            for tag_id in tags_data:
                try:
                    tag = Tag.objects.get(id=int(tag_id))
                    ArticleTag.objects.create(article=article, tag=tag)
                    created_count += 1
                    print(f"Created tag: {tag.name} (ID: {tag_id})")
                except (Tag.DoesNotExist, ValueError) as e:
                    print(f"Tag with id {tag_id} not found or invalid: {e}")
            print(f"Total created tags: {created_count}")

        # ---------- REVIEW EXTRA ----------
        if (
            article.type == "REVIEW"
            and "review_extra_data" in serializer.initial_data
        ):
            review_extra_data = serializer.initial_data["review_extra_data"]

            if isinstance(review_extra_data, str):
                try:
                    review_extra_data = json.loads(review_extra_data)
                except json.JSONDecodeError:
                    print("Invalid review_extra_data JSON, skipping.")
                    review_extra_data = {}

            if not isinstance(review_extra_data, dict):
                review_extra_data = {}

            ReviewExtra.objects.create(
                article=article,
                criteria=review_extra_data.get("criteria", {}),
                pros=review_extra_data.get("pros", []),
                cons=review_extra_data.get("cons", []),
                technical_spec=review_extra_data.get("technical_spec", {}),
                performance_score=review_extra_data.get(
                    "performance_score", 0
                ),
                stability_score=review_extra_data.get("stability_score", 0),
                coverage_score=review_extra_data.get("coverage_score", 0),
                software_score=review_extra_data.get("software_score", 0),
                value_score=review_extra_data.get("value_score", 0),
                total_score=review_extra_data.get("total_score", 0),
                score_numeric=review_extra_data.get("score_numeric", 0),
            )

        # ---------- BEST LIST EXTRA ----------
        if (
            article.type == "BEST_LIST"
            and "best_list_extra_data" in serializer.initial_data
        ):
            best_list_extra_data = serializer.initial_data[
                "best_list_extra_data"
            ]

            if isinstance(best_list_extra_data, str):
                try:
                    best_list_extra_data = json.loads(best_list_extra_data)
                except json.JSONDecodeError:
                    print("Invalid best_list_extra_data JSON, skipping.")
                    best_list_extra_data = {}

            if not isinstance(best_list_extra_data, dict):
                best_list_extra_data = {}

            items = best_list_extra_data.get("items", []) or []
            processed_items = []

            for index, item in enumerate(items):
                processed_item = dict(item) if isinstance(item, dict) else {}
                image_file_key = f"best_list_item_{index}_image_file"

                if image_file_key in serializer.initial_data:
                    image_file = serializer.initial_data[image_file_key]
                    if (
                        image_file
                        and hasattr(image_file, "size")
                        and image_file.size > 0
                    ):
                        from django.core.files.storage import default_storage
                        from django.core.files.base import ContentFile
                        import os
                        import uuid

                        file_extension = os.path.splitext(image_file.name)[1]
                        unique_filename = (
                            f"best_list_items/{uuid.uuid4()}{file_extension}"
                        )

                        file_path = default_storage.save(
                            unique_filename, ContentFile(image_file.read())
                        )
                        image_url = default_storage.url(file_path)

                        if not image_url.startswith("http"):
                            base_url = "http://localhost:8000"
                            image_url = f"{base_url}{image_url}"

                        processed_item["image"] = image_url

                processed_items.append(processed_item)

            BestListExtra.objects.create(
                article=article,
                items=processed_items,
                criteria=best_list_extra_data.get("criteria", {}),
                methodology=best_list_extra_data.get("methodology", ""),
            )



class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)

        if hasattr(response, "data") and response.data:
            article_data = response.data
            print("=== ARTICLE DETAIL VIEW DEBUG ===")
            print(f"Article ID: {article_data.get('id')}")
            print(f"Article Title: {article_data.get('title')}")
            print(f"Meta Title: {article_data.get('meta_title', 'Not set')}")
            print(
                f"Meta Description: {article_data.get('meta_description', 'Not set')}"
            )
            print("=================================")

        return response


class ArticleDetailByIdView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "pk"  # Use primary key instead of slug

    def perform_update(self, serializer):
        article = serializer.save()

        print(f"Article {article.id} updated. New status: {article.status}")
        print(f"Update data: {serializer.initial_data}")

        # ---------- TAGS UPDATE ----------
        if "tags" in serializer.initial_data:
            raw_tags = serializer.initial_data["tags"]
            tags_data = parse_tags(raw_tags)
            print(f"Parsed tags_data in update: {tags_data}")

            # Eski bütün tag’leri sil
            ArticleTag.objects.filter(article=article).delete()

            if tags_data:
                valid_tags = [
                    tag_id
                    for tag_id in tags_data
                    if tag_id and str(tag_id).strip()
                ]
                print(f"Valid tags after filtering: {valid_tags}")

                for tag_id in valid_tags:
                    try:
                        tag = Tag.objects.get(id=int(tag_id))
                        ArticleTag.objects.create(article=article, tag=tag)
                        print(f"Created tag: {tag.name} (ID: {tag_id})")
                    except (Tag.DoesNotExist, ValueError) as e:
                        print(f"Tag with id {tag_id} not found: {e}")
            else:
                print("No tags provided, all tags removed")
        else:
            print("No 'tags' field in update; tags unchanged")

    def perform_destroy(self, instance):
        user = self.request.user
        if not hasattr(user, "role") or user.role not in [
            "ADMIN",
            "SUPER_ADMIN",
            "EDITOR",
        ]:
            raise permissions.PermissionDenied(
                "Admin, Super Admin, or Editor access required to delete articles"
            )
        instance.delete()



# Comment Views
class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = CommentFilter
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Check if admin parameter is passed
        admin_request = self.request.query_params.get('admin') == 'true'
        is_admin = hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN'
        
        # For admin requests, show all comments
        if admin_request or is_admin:
            return queryset
        # Only show APPROVED comments for public access
        elif not self.request.user.is_authenticated or self.request.user.role not in ['ADMIN', 'EDITOR']:
            queryset = queryset.filter(status='APPROVED')
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            ip_address=self.get_client_ip()
        )

    def get_client_ip(self):
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip


class CommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Check if admin parameter is passed or user is admin
        admin_request = self.request.query_params.get('admin') == 'true'
        is_admin = hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN'
        
        if admin_request or is_admin:
            return Comment.objects.all()
        else:
            # Users can only access their own comments
            return Comment.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        # Only allow status updates for non-admin users
        admin_request = self.request.query_params.get('admin') == 'true'
        is_admin = hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN'
        
        if not (admin_request or is_admin):
            # Non-admin users can only update status
            if 'status' not in request.data or len(request.data) > 1:
                return Response(
                    {'error': 'You can only update comment status'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return super().update(request, *args, **kwargs)


# User Review Views
class UserReviewListCreateView(generics.ListCreateAPIView):
    queryset = UserReview.objects.all()
    serializer_class = UserReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = UserReviewFilter
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        # Check if admin parameter is passed
        admin_request = self.request.query_params.get('admin') == 'true'
        
        # For public access, only show APPROVED reviews
        # For authenticated users, show all their reviews
        # For admin requests, show all reviews
        if admin_request or (self.request.user.is_authenticated and hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN'):
            return UserReview.objects.all()
        elif self.request.user.is_authenticated:
            # If user is filtering by their own user ID, show all their reviews
            user_id = self.request.query_params.get('user')
            if user_id and str(user_id) == str(self.request.user.id):
                return UserReview.objects.all()
        # Default: only show APPROVED reviews
        return UserReview.objects.filter(status='APPROVED')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserReview.objects.all()
    serializer_class = UserReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Check if admin parameter is passed or user is admin
        admin_request = self.request.query_params.get('admin') == 'true'
        is_admin = hasattr(self.request.user, 'role') and self.request.user.role == 'ADMIN'
        
        if admin_request or is_admin:
            return UserReview.objects.all()
        else:
            # Users can only access their own reviews
            return UserReview.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)


# Favorite Views
class FavoriteListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


# Search View
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_view(request):
    query = request.GET.get('q', '')
    print(f"=== SEARCH DEBUG ===")
    print(f"Query: {query}")
    
    if not query:
        return Response({'success': False, 'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Search in articles
    articles = Article.objects.filter(
        Q(title__icontains=query) | 
        Q(subtitle__icontains=query) | 
        Q(excerpt__icontains=query),
        status='PUBLISHED'
    )[:10]

    # Search in products
    products = Product.objects.filter(
        Q(brand__icontains=query) | 
        Q(model__icontains=query) | 
        Q(description__icontains=query)
    )[:10]

    # Search in categories
    categories = Category.objects.filter(
        Q(name__icontains=query) | 
        Q(description__icontains=query),
        is_active=True
    )[:10]

    # Search in users (only if profile is visible)
    # Önce tüm kullanıcıları bul
    all_users = User.objects.filter(
        Q(first_name__icontains=query) | 
        Q(last_name__icontains=query) |
        Q(username__icontains=query)
    )
    
    # Sonra privacy ayarlarına göre filtrele
    users = []
    for user in all_users:
        # Eğer privacy_settings yoksa veya profile_visible True ise ekle
        if not user.privacy_settings or user.privacy_settings.get('profile_visible', True):
            users.append(user)
            if len(users) >= 10:
                break

    print(f"Found {len(users)} users")
    for user in users:
        print(f"User: {user.first_name} {user.last_name} - Privacy: {user.privacy_settings}")

    return Response({
        'success': True,
        'data': {
            'articles': ArticleSerializer(articles, many=True).data,
            'products': ProductSerializer(products, many=True).data,
            'categories': CategorySerializer(categories, many=True).data,
            'users': UserSearchSerializer(users, many=True).data,
        }
    })


# Analytics Views
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def analytics_view(request):
    role = getattr(request.user, "role", None)
    if role not in ["ADMIN", "SUPER_ADMIN", "EDITOR"]:
        return Response(
            {"success": False, "error": "Permission denied"},
            status=status.HTTP_403_FORBIDDEN,
        )

    from django.db.models import Count

    # ---- Overview sayıları ----
    total_articles = Article.objects.count()
    total_products = Product.objects.count()
    total_users = User.objects.count()
    total_reviews = UserReview.objects.count()
    total_affiliate_links = AffiliateLink.objects.count()
    total_comments = Comment.objects.filter(status="APPROVED").count()

    published_articles = Article.objects.filter(status="PUBLISHED").count()

    avg_reviews_per_product = (
        round(total_reviews / total_products, 2) if total_products > 0 else 0
    )
    avg_comments_per_article = (
        round(total_comments / published_articles, 2) if published_articles > 0 else 0
    )

    # ---- Son makaleler ----
    recent_articles_qs = (
        Article.objects.select_related("author")
        .order_by("-created_at")[:5]
    )

    recent_articles = []
    for a in recent_articles_qs:
        comments_count = Comment.objects.filter(
            article=a, status="APPROVED"
        ).count()
        recent_articles.append(
            {
                "id": a.id,
                "title": a.title,
                "author": (
                    a.author.get_full_name()
                    if getattr(a, "author", None)
                    else ""
                ),
                "createdAt": a.created_at.isoformat() if a.created_at else "",
                "commentsCount": comments_count,
            }
        )

    # ---- Son ürünler ----
    recent_products_qs = (
        Product.objects.select_related("category")
        .order_by("-created_at")[:5]
    )

    recent_products = []
    for p in recent_products_qs:
        reviews_count = UserReview.objects.filter(
            product=p, status="APPROVED"
        ).count()
        affiliate_links_count = AffiliateLink.objects.filter(
            product=p, active=True
        ).count()
        recent_products.append(
            {
                "id": p.id,
                "brand": p.brand,
                "model": p.model,
                "category": p.category.name if getattr(p, "category", None) else "",
                "createdAt": p.created_at.isoformat() if p.created_at else "",
                "reviewsCount": reviews_count,
                "affiliateLinksCount": affiliate_links_count,
            }
        )

    # ---- Top kategoriler ----
    top_categories = []
    for c in Category.objects.all():
        articles_count = Article.objects.filter(
            category=c, status="PUBLISHED"
        ).count()
        products_count = Product.objects.filter(category=c).count()
        total_content = articles_count + products_count
        top_categories.append(
            {
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "articlesCount": articles_count,
                "productsCount": products_count,
                "totalContent": total_content,
            }
        )

    # totalContent’e göre sırala
    top_categories.sort(key=lambda x: x["totalContent"], reverse=True)

    # ---- Affiliate merchant istatistikleri ----
    merchants = (
        AffiliateLink.objects.values("merchant")
        .annotate(links_count=Count("id"))
        .order_by("-links_count")[:10]
    )
    affiliate_merchants = [
        {"name": m["merchant"], "linksCount": m["links_count"]}
        for m in merchants
    ]

    data = {
        "overview": {
            "totalArticles": total_articles,
            "totalProducts": total_products,
            "totalUsers": total_users,
            "totalReviews": total_reviews,
            "totalAffiliateLinks": total_affiliate_links,
            "totalComments": total_comments,
            "avgReviewsPerProduct": avg_reviews_per_product,
            "avgCommentsPerArticle": avg_comments_per_article,
        },
        "recentContent": {
            "articles": recent_articles,
            "products": recent_products,
        },
        "topCategories": top_categories,
        "affiliateMerchants": affiliate_merchants,
    }

    return Response({"success": True, "data": data})



# Outbound Click Tracking
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_outbound_click(request):
    serializer = OutboundClickSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(
            user=request.user if request.user.is_authenticated else None,
            ip=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        return Response({'success': True})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Article View Tracking
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def track_article_view(request):
    from datetime import datetime, timedelta
    from django.utils import timezone
    
    serializer = ArticleViewSerializer(data=request.data)
    if serializer.is_valid():
        article_id = serializer.validated_data.get('article')
        ip_address = request.META.get('REMOTE_ADDR', '')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Save every view - no duplicate restrictions
        serializer.save(
            user=request.user if request.user.is_authenticated else None,
            ip_address=ip_address,
            user_agent=user_agent,
            referer=request.META.get('HTTP_REFERER', '')
        )
        return Response({'success': True})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Affiliate Links
class AffiliateLinkListView(generics.ListAPIView):
    """List all affiliate links"""
    serializer_class = AffiliateLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = PageNumberPagination
    
    def get_queryset(self):
        queryset = AffiliateLink.objects.all()
        
        # Filter by active status
        active = self.request.query_params.get('active', None)
        if active is not None:
            active_bool = active.lower() == 'true'
            queryset = queryset.filter(active=active_bool)
        
        return queryset.order_by('-created_at')


class AffiliateLinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete an affiliate link"""
    queryset = AffiliateLink.objects.all()
    serializer_class = AffiliateLinkSerializer
    permission_classes = [permissions.IsAuthenticated]


# Monthly Analytics
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def monthly_analytics_view(request):
    year = request.GET.get('year')
    month = request.GET.get('month')
    
    if not year or not month:
        return Response({'error': 'Year and month parameters are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        year = int(year)
        month = int(month)
    except ValueError:
        return Response({'error': 'Invalid year or month format'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get or create monthly analytics record
    analytics, created = MonthlyAnalytics.objects.get_or_create(
        year=year,
        month=month,
        defaults={
            'total_views': 0,
            'total_affiliate_clicks': 0,
            'total_users': 0
        }
    )
    
    # Calculate actual counts for this month
    from django.db.models import Count
    from datetime import datetime, timezone
    
    # Count article views for this month
    start_date = datetime(year, month, 1, tzinfo=timezone.utc)
    if month == 12:
        end_date = datetime(year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end_date = datetime(year, month + 1, 1, tzinfo=timezone.utc)
    
    views_count = ArticleView.objects.filter(
        created_at__gte=start_date,
        created_at__lt=end_date
    ).count()
    
    # Count affiliate clicks for this month
    clicks_count = OutboundClick.objects.filter(
        created_at__gte=start_date,
        created_at__lt=end_date
    ).count()
    
    # Count new users for this month
    users_count = User.objects.filter(
        created_at__gte=start_date,
        created_at__lt=end_date
    ).count()
    
    # Update analytics record
    analytics.total_views = views_count
    analytics.total_affiliate_clicks = clicks_count
    analytics.total_users = users_count
    analytics.save()
    
    serializer = MonthlyAnalyticsSerializer(analytics)
    return Response(serializer.data)


# User-specific views
class UserFavoritesView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user_id = self.kwargs['user_id']
        # Only allow users to access their own favorites
        if self.request.user.id != user_id:
            return Favorite.objects.none()
        
        queryset = Favorite.objects.filter(user_id=user_id).select_related('product', 'product__category')
        
        # Filter by product if product parameter is provided
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class UserStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        # Only allow users to access their own stats
        if request.user.id != user_id:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        stats = {
            'favorites_count': Favorite.objects.filter(user_id=user_id).count(),
            'reviews_count': UserReview.objects.filter(user_id=user_id).count(),
            'comments_count': Comment.objects.filter(user_id=user_id).count(),
            'authoredArticles': Article.objects.filter(author_id=user_id).count(),
        }
        return Response(stats)


# Public User Stats View
class UserPublicStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        try:
            user = User.objects.get(pk=user_id)
            
            # Check if profile is visible
            if not user.privacy_settings or not user.privacy_settings.get('profile_visible', True):
                return Response({'error': 'Profile is private'}, status=status.HTTP_403_FORBIDDEN)
            
            print(f"=== USER STATS DEBUG ===")
            print(f"User ID: {user_id} (type: {type(user_id)})")
            print(f"User: {user.first_name} {user.last_name}")
            
            # Convert user_id to int if it's a string
            user_id_int = int(user_id)
            
            favorites_count = Favorite.objects.filter(user_id=user_id_int).count()
            reviews_count = UserReview.objects.filter(user_id=user_id_int).count()
            comments_count = Comment.objects.filter(user_id=user_id_int).count()
            authored_articles = Article.objects.filter(author_id=user_id_int).count()
            
            print(f"Favorites: {favorites_count}")
            print(f"Reviews: {reviews_count}")
            print(f"Comments: {comments_count}")
            print(f"Articles: {authored_articles}")
            
            stats = {
                'favorites_count': favorites_count,
                'reviews_count': reviews_count,
                'comments_count': comments_count,
                'authoredArticles': authored_articles,
            }
            return Response(stats)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class UserSettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        # Only allow users to access their own settings
        if request.user.id != user_id:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        user = request.user
        settings = {
            'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            'email': user.email,
            'bio': user.bio or '',
            'avatar': user.avatar.url if user.avatar else '',
            'email_notifications': user.notification_settings.get('email_notifications', True) if user.notification_settings else True,
            'push_notifications': user.notification_settings.get('push_notifications', True) if user.notification_settings else True,
            'marketing_emails': user.notification_settings.get('marketing_emails', False) if user.notification_settings else False,
            'profile_visible': user.privacy_settings.get('profile_visible', True) if user.privacy_settings else True,
            'email_visible': user.privacy_settings.get('email_visible', False) if user.privacy_settings else False,
            'theme': user.settings.get('theme', 'light') if user.settings else 'light',
            'language': user.settings.get('language', 'tr') if user.settings else 'tr',
        }
        return Response(settings)

    def put(self, request, user_id):
        # Only allow users to update their own settings
        if request.user.id != user_id:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        print(f"=== USER SETTINGS UPDATE DEBUG ===")
        print(f"Request data: {request.data}")
        print(f"User: {request.user.email}")
        
        user = request.user
        
        # Update profile fields
        if 'name' in request.data:
            name_parts = request.data['name'].strip().split(' ', 1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        
        if 'email' in request.data:
            user.email = request.data['email']
        
        if 'bio' in request.data:
            user.bio = request.data['bio']
        
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']
        elif 'remove_avatar' in request.data and request.data['remove_avatar'] == 'true':
            user.avatar = None
        
        # Update notification settings
        if not user.notification_settings:
            user.notification_settings = {}
        
        notification_data = {
            'email_notifications': request.data.get('email_notifications', 'true').lower() == 'true',
            'push_notifications': request.data.get('push_notifications', 'true').lower() == 'true',
            'marketing_emails': request.data.get('marketing_emails', 'false').lower() == 'true',
        }
        
        print(f"Notification data: {notification_data}")
        user.notification_settings.update(notification_data)
        
        # Update privacy settings
        if not user.privacy_settings:
            user.privacy_settings = {}
        
        privacy_data = {
            'profile_visible': request.data.get('profile_visible', 'true').lower() == 'true',
            'email_visible': request.data.get('email_visible', 'false').lower() == 'true',
        }
        
        print(f"Privacy data: {privacy_data}")
        user.privacy_settings.update(privacy_data)
        
        # Update general settings
        if not user.settings:
            user.settings = {}
        
        settings_data = {
            'theme': request.data.get('theme', user.settings.get('theme', 'light')),
            'language': request.data.get('language', user.settings.get('language', 'tr')),
        }
        
        user.settings.update(settings_data)
        user.save()
        
        return Response({
            'success': True, 
            'settings': {
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
                'email': user.email,
                'bio': user.bio or '',
                'avatar': user.avatar.url if user.avatar else '',
                'email_notifications': user.notification_settings.get('email_notifications', True),
                'push_notifications': user.notification_settings.get('push_notifications', True),
                'marketing_emails': user.notification_settings.get('marketing_emails', False),
                'profile_visible': user.privacy_settings.get('profile_visible', True),
                'email_visible': user.privacy_settings.get('email_visible', False),
                'theme': user.settings.get('theme', 'light'),
                'language': user.settings.get('language', 'tr'),
            }
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password_view(request, user_id):
    """Change user password"""
    # Only allow users to change their own password
    if request.user.id != user_id:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
    
    current_password = request.data.get('currentPassword')
    new_password = request.data.get('newPassword')
    
    if not current_password or not new_password:
        return Response({'error': 'Current password and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify current password
    if not request.user.check_password(current_password):
        return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate new password
    if len(new_password) < 6:
        return Response({'error': 'New password must be at least 6 characters long'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Set new password
    request.user.set_password(new_password)
    request.user.save()
    
    return Response({'success': True, 'message': 'Password changed successfully'})


class UserActivityView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get(self, request, user_id):
        # Only allow users to access their own activity
        if request.user.id != user_id:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get recent activity (favorites, reviews, comments)
        recent_favorites = Favorite.objects.filter(user_id=user_id).select_related('product')[:5]
        recent_reviews = UserReview.objects.filter(user_id=user_id).select_related('product')[:5]
        recent_comments = Comment.objects.filter(user_id=user_id).select_related('article')[:5]
        
        activity = []
        
        for fav in recent_favorites:
            activity.append({
                'type': 'favorite',
                'action': 'added',
                'item': fav.product.brand + ' ' + fav.product.model,
                'date': fav.created_at
            })
        
        for review in recent_reviews:
            activity.append({
                'type': 'review',
                'action': 'created',
                'item': review.product.brand + ' ' + review.product.model,
                'date': review.created_at
            })
        
        for comment in recent_comments:
            activity.append({
                'type': 'comment',
                'action': 'created',
                'item': comment.article.title,
                'date': comment.created_at
            })
        
        # Sort by date
        activity.sort(key=lambda x: x['date'], reverse=True)
        
        return Response(activity[:20])  # Return last 20 activities


# Helpful Vote Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def helpful_vote_view(request, comment_id):
    """Vote for a comment as helpful"""
    try:
        comment = Comment.objects.get(id=comment_id)
        
        # Check if user already voted
        existing_vote = HelpfulVote.objects.filter(
            comment=comment,
            user=request.user
        ).first()
        
        if existing_vote:
            # Remove existing vote
            existing_vote.delete()
            action = 'removed'
        else:
            # Create new vote
            HelpfulVote.objects.create(
                comment=comment,
                user=request.user,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            action = 'added'
        
        # Get updated helpful count
        helpful_count = comment.helpful_votes.count()
        
        return Response({
            'success': True,
            'action': action,
            'helpful_count': helpful_count
        })
        
    except Comment.DoesNotExist:
        return Response(
            {'error': 'Comment not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Users View
class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = UserFilter
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'username', 'email']
    ordering = ['-created_at']
    # Enable pagination to return proper count
    page_size = 100  # Set a reasonable page size

    def get_queryset(self):
        # Only admin or super admin can see all users
        if not hasattr(self.request.user, 'role') or self.request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return User.objects.none()
        return User.objects.prefetch_related('authored_articles', 'comments').all()
    
    def list(self, request, *args, **kwargs):
        # Use the parent class's list method to get paginated response
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        # Only admin or super admin can create users
        if not hasattr(self.request.user, 'role') or self.request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            raise permissions.PermissionDenied("Admin or Super Admin access required")
        serializer.save()


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only admin or super admin can access user details
        if not hasattr(self.request.user, 'role') or self.request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return User.objects.none()
        return super().get_queryset()

    def update(self, request, *args, **kwargs):
        # Only admin or super admin can update users
        if not hasattr(request.user, 'role') or request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({'error': 'Admin or Super Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get the user instance
        instance = self.get_object()
        
        # ADMIN cannot modify SUPER_ADMIN users
        if instance.role == 'SUPER_ADMIN' and request.user.role == 'ADMIN':
            return Response({'error': 'Admin cannot modify Super Admin users'}, status=status.HTTP_403_FORBIDDEN)
        
        # Handle partial updates
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        # Only admin or super admin can delete users
        if not hasattr(request.user, 'role') or request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            return Response({'error': 'Admin or Super Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get the user instance
        instance = self.get_object()
        
        # ADMIN cannot delete SUPER_ADMIN users
        if instance.role == 'SUPER_ADMIN' and request.user.role == 'ADMIN':
            return Response({'error': 'Admin cannot delete Super Admin users'}, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent deleting own account
        if request.user.id == kwargs.get('pk'):
            return Response({'error': 'Cannot delete your own account'}, status=status.HTTP_400_BAD_REQUEST)
        
        return super().destroy(request, *args, **kwargs)


# Public User Profile View
class UserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            
            # Check if profile is visible
            if not user.privacy_settings or not user.privacy_settings.get('profile_visible', True):
                return Response({'error': 'Profile is private'}, status=status.HTTP_403_FORBIDDEN)
            
            # Get recent articles
            recent_articles = Article.objects.filter(
                author_id=user.id,
                status='PUBLISHED'
            ).select_related('category').order_by('-published_at')[:5]
            
            # Get recent comments
            recent_comments = Comment.objects.filter(
                user_id=user.id,
                status='APPROVED'
            ).select_related('article').order_by('-created_at')[:5]
            
            # Return public profile data
            profile_data = {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'name': f"{user.first_name or ''} {user.last_name or ''}".strip() or user.username,
                'email': user.email if (user.privacy_settings and user.privacy_settings.get('email_visible', False)) else '',
                'bio': user.bio or '',
                'avatar': user.avatar.url if user.avatar else '',
                'role': user.role,
                'created_at': user.date_joined,
                'privacy_settings': user.privacy_settings or {},
                'notification_settings': user.notification_settings or {},
                'recent_articles': [
                    {
                        'id': article.id,
                        'title': article.title,
                        'slug': article.slug,
                        'type': article.type,
                        'published_at': article.published_at,
                        'category': {
                            'name': article.category.name,
                            'slug': article.category.slug
                        }
                    } for article in recent_articles
                ],
                'recent_comments': [
                    {
                        'id': comment.id,
                        'content': comment.content,
                        'created_at': comment.created_at,
                        'article': {
                            'title': comment.article.title,
                            'slug': comment.article.slug,
                            'type': comment.article.type
                        }
                    } for comment in recent_comments
                ]
            }
            
            return Response(profile_data)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# Settings Views
class SettingListCreateView(generics.ListCreateAPIView):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['key', 'description']
    filterset_fields = ['category']
    ordering_fields = ['key', 'category', 'created_at']
    ordering = ['category', 'key']

    def get_queryset(self):
        # Only admin and editor can access settings
        if not self.request.user.role in ['ADMIN', 'EDITOR']:
            return Setting.objects.none()
        return super().get_queryset()


class SettingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'key'

    def get_queryset(self):
        # Only admin and editor can access settings
        if not self.request.user.role in ['ADMIN', 'EDITOR']:
            return Setting.objects.none()
        return super().get_queryset()


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


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_settings_view(request):
    """Get public settings that can be accessed without authentication"""
    try:
        # Define which settings are public
        public_setting_keys = [
            'site_name',
            'site_description', 
            'logo',
            'favicon',
            'user_registration',
            'affiliate_tracking',
            'primary_color',
            'secondary_color',
            'seo_title',
            'seo_description',
            'seo_keywords'
        ]
        
        settings = Setting.objects.filter(key__in=public_setting_keys)
        public_settings = {}
        
        for setting in settings:
            public_settings[setting.key] = {
                'value': setting.value,
                'is_file': setting.is_file
            }
        
        # Set default values if settings don't exist
        defaults = {
            'site_name': 'Hardware Review',
            'site_description': 'Donanım incelemeleri, karşılaştırmaları ve rehberleri ile en doğru seçimi yapın.',
            'logo': '',
            'favicon': '',
            'user_registration': 'true',
            'affiliate_tracking': 'false',
            'primary_color': '#3b82f6',
            'secondary_color': '#64748b',
            'seo_title': 'Hardware Review - En İyi Donanım Rehberleri',
            'seo_description': 'Router, modem ve ağ donanımları hakkında detaylı incelemeler ve rehberler.',
            'seo_keywords': 'donanım, router, modem, wifi, inceleme'
        }
        
        for key, default_value in defaults.items():
            if key not in public_settings:
                public_settings[key] = {
                    'value': default_value,
                    'is_file': key in ['logo', 'favicon']
                }
        
        return Response({
            'success': True,
            'data': public_settings
        })
        
    except Exception as e:
        print(f"Error getting public settings: {e}")
        return Response({
            'success': False,
            'error': 'Failed to get public settings'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Price History Views
class PriceHistoryListCreateView(generics.ListCreateAPIView):
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.AllowAny]  # Herkes görüntüleyebilir
    
    def create(self, request, *args, **kwargs):
        print("=== PRICE HISTORY CREATE VIEW DEBUG ===")
        print(f"Request method: {request.method}")
        print(f"Request data: {request.data}")
        print(f"User authenticated: {request.user.is_authenticated}")
        print(f"User: {request.user}")
        print(f"User role: {getattr(request.user, 'role', 'NO_ROLE')}")
        
        # POST işlemi için authentication kontrolü
        if not request.user.is_authenticated:
            print("ERROR: User not authenticated")
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Admin/Super Admin kontrolü
        if not hasattr(request.user, 'role') or request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
            print(f"ERROR: User role {getattr(request.user, 'role', 'NO_ROLE')} not allowed")
            return Response(
                {'error': 'Admin or Super Admin access required'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        slug = kwargs.get('slug')
        print(f"Looking for product with slug: {slug}")
        
        try:
            product = Product.objects.get(slug=slug)
            print(f"Found product: {product.brand} {product.model}")
            
            # Serializer validation'ı tamamen bypass et ve doğrudan model oluştur
            try:
                # Manuel validation
                price = request.data.get('price')
                if not price:
                    return Response({'error': 'Price is required'}, status=status.HTTP_400_BAD_REQUEST)
                
                source = request.data.get('source')
                if not source:
                    return Response({'error': 'Source is required'}, status=status.HTTP_400_BAD_REQUEST)
                
                # PriceHistory objesini doğrudan oluştur
                price_history = PriceHistory.objects.create(
                    product=product,
                    price=float(price),
                    currency=request.data.get('currency', 'TRY'),
                    source=source,
                    url=request.data.get('url')
                )
                print("Price history created successfully")
                
                # Response için serializer'ı oluştur
                response_serializer = self.get_serializer(price_history)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
                
            except ValueError as e:
                print(f"Value error: {e}")
                return Response({'error': 'Invalid price value'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print(f"Error creating price history: {e}")
                return Response({'error': f'Error creating price history: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
                
        except Product.DoesNotExist:
            print(f"ERROR: Product with slug {slug} not found")
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"ERROR creating price history: {e}")
            print(f"Exception type: {type(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error creating price history: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def get_queryset(self):
        slug = self.kwargs['slug']
        try:
            product = Product.objects.get(slug=slug)
            return PriceHistory.objects.filter(product=product).order_by('-recorded_at')
        except Product.DoesNotExist:
            return PriceHistory.objects.none()
    


class PriceHistoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PriceHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        slug = self.kwargs['slug']
        try:
            product = Product.objects.get(slug=slug)
            return PriceHistory.objects.filter(product=product)
        except Product.DoesNotExist:
            return PriceHistory.objects.none()


class ProductReviewsView(generics.ListCreateAPIView):
    serializer_class = UserReviewSerializer
    permission_classes = [permissions.AllowAny]  # Public access for reading reviews
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        try:
            product = Product.objects.get(id=product_id)
            return UserReview.objects.filter(product=product, status='APPROVED').order_by('-created_at')
        except Product.DoesNotExist:
            return UserReview.objects.none()
    
    def create(self, request, *args, **kwargs):
        print(f"=== PRODUCT REVIEWS CREATE DEBUG ===")
        print(f"Request method: {request.method}")
        print(f"Request data: {request.data}")
        print(f"User: {request.user}")
        print(f"Product ID from URL: {self.kwargs['product_id']}")
        
        product_id = self.kwargs['product_id']
        
        try:
            product = Product.objects.get(id=product_id)
            print(f"Product found: {product}")
            
            # Request data'dan gerekli alanları al
            rating = request.data.get('rating')
            title = request.data.get('title')
            content = request.data.get('content')
            pros = request.data.get('pros', [])
            cons = request.data.get('cons', [])
            
            print(f"Rating: {rating}")
            print(f"Title: {title}")
            print(f"Content: {content}")
            print(f"Pros: {pros}")
            print(f"Cons: {cons}")
            
            # Validation
            if not rating:
                return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not title:
                return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not content:
                return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Direkt model oluştur
            review = UserReview.objects.create(
                product=product,
                user=request.user,
                rating=rating,
                title=title,
                content=content,
                pros=pros,
                cons=cons,
                status='PENDING'
            )
            
            print(f"Review created successfully: {review.id}")
            
            # Serializer ile response döndür
            serializer = UserReviewSerializer(review)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Product.DoesNotExist:
            print(f"ERROR: Product with ID {product_id} not found")
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"ERROR creating review: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Error creating review: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


# Database Statistics View
class DatabaseStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Check if user is admin or super admin
            if not hasattr(request.user, 'role') or request.user.role not in ['ADMIN', 'SUPER_ADMIN']:
                return Response({'error': 'Admin or Super Admin access required'}, status=status.HTTP_403_FORBIDDEN)
            
            from django.db import connection
            from django.apps import apps
            
            # Get all models from main app
            models = apps.get_app_config('main').get_models()
            
            stats = []
            
            for model in models:
                try:
                    count = model.objects.count()
                    stats.append({
                        'name': model.__name__,
                        'count': count,
                        'table_name': model._meta.db_table
                    })
                except Exception as e:
                    print(f"Error counting {model.__name__}: {e}")
                    stats.append({
                        'name': model.__name__,
                        'count': 0,
                        'table_name': model._meta.db_table,
                        'error': str(e)
                    })
            
            # Get database info
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                db_version = cursor.fetchone()[0]
                
                cursor.execute("SELECT pg_database_size(current_database());")
                db_size = cursor.fetchone()[0]
            
            return Response({
                'success': True,
                'tables': stats,
                'database_info': {
                    'version': db_version,
                    'size_bytes': db_size,
                    'size_mb': round(db_size / (1024 * 1024), 2)
                }
            })
            
        except Exception as e:
            print(f"Error getting database stats: {e}")
            return Response({'error': f'Error getting database stats: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductReviewsBySlugView(generics.ListCreateAPIView):
    serializer_class = UserReviewSerializer
    permission_classes = [permissions.AllowAny]  # Public access for reading reviews
    
    def get_queryset(self):
        slug = self.kwargs['slug']
        print(f"=== PRODUCT REVIEWS BY SLUG GET DEBUG ===")
        print(f"Slug from URL: {slug}")
        print(f"Request method: {self.request.method}")
        
        try:
            product = Product.objects.get(slug=slug)
            print(f"Product found: {product}")
            reviews = UserReview.objects.filter(product=product, status='APPROVED').order_by('-created_at')
            print(f"Approved reviews found: {reviews.count()}")
            for review in reviews:
                print(f"Review: {review.id} - Status: {review.status} - Title: {review.title}")
            return reviews
        except Product.DoesNotExist:
            print(f"ERROR: Product with slug {slug} not found")
            return UserReview.objects.none()
        except Exception as e:
            print(f"ERROR in get_queryset: {e}")
            return UserReview.objects.none()
    
    def create(self, request, *args, **kwargs):
        print(f"=== PRODUCT REVIEWS BY SLUG CREATE DEBUG ===")
        print(f"Request method: {request.method}")
        print(f"Request data: {request.data}")
        print(f"User: {request.user}")
        print(f"Slug from URL: {self.kwargs['slug']}")
        
        slug = self.kwargs['slug']
        
        try:
            product = Product.objects.get(slug=slug)
            print(f"Product found: {product}")
            
            # Request data'dan gerekli alanları al
            rating = request.data.get('rating')
            title = request.data.get('title')
            content = request.data.get('content')
            pros = request.data.get('pros', [])
            cons = request.data.get('cons', [])
            
            print(f"Rating: {rating}")
            print(f"Title: {title}")
            print(f"Content: {content}")
            print(f"Pros: {pros}")
            print(f"Cons: {cons}")
            
            # Validation
            if not rating:
                return Response({'error': 'Rating is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not title:
                return Response({'error': 'Title is required'}, status=status.HTTP_400_BAD_REQUEST)
            if not content:
                return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Direkt model oluştur
            review = UserReview.objects.create(
                product=product,
                user=request.user,
                rating=rating,
                title=title,
                content=content,
                pros=pros,
                cons=cons,
                status='PENDING'
            )
            
            print(f"Review created successfully: {review.id}")
            
            # Serializer ile response döndür
            serializer = UserReviewSerializer(review)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Product.DoesNotExist:
            print(f"ERROR: Product with slug {slug} not found")
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"ERROR creating review: {e}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'Error creating review: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

