from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import newsletter_views
from . import password_reset_views
from . import email_test_views 

# Create router for ViewSets (if needed in future)
router = DefaultRouter()

urlpatterns = [
    # Authentication
    path('auth/login/', views.login_view, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/logout/', views.logout_view, name='logout'),
    
    # Email Verification
    path('auth/verify-email/', views.verify_email_view, name='verify-email'),
    path('auth/resend-verification/', views.resend_verification_email_view, name='resend-verification'),
    path('auth/check-verification-status/', views.check_email_verification_status_view, name='check-verification-status'),
    
    # Categories
    # ÖNCE public endpoint (slug pattern'inden önce olmalı)
    path('categories/public/', views.public_categories_view, name='category-public'),
    # Sonra list
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list'),
    # ID üzerinden detay
    path('categories/id/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail-by-id'),
    # EN SON slug detail (public & id'yi yutmaması için)
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # Tags
    path('tags/', views.TagListCreateView.as_view(), name='tag-list'),
    path('tags/<slug:slug>/', views.TagDetailView.as_view(), name='tag-detail'),
    path('tags/id/<int:pk>/', views.TagDetailView.as_view(), name='tag-detail-by-id'),
    
    # Products
    path('products/', views.ProductListCreateView.as_view(), name='product-list'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/id/<int:pk>/', views.ProductDetailByIdView.as_view(), name='product-detail-by-id'),
    path('products/<int:product_id>/reviews/', views.ProductReviewsView.as_view(), name='product-reviews'),
    path('products/slug/<slug:slug>/reviews/', views.ProductReviewsBySlugView.as_view(), name='product-reviews-by-slug'),
    
    # Price History
    path('products/<slug:slug>/price-history/', views.PriceHistoryListCreateView.as_view(), name='price-history-list'),
    path('products/slug/<slug:slug>/price-history/', views.PriceHistoryListCreateView.as_view(), name='price-history-list-by-slug'),
    path('products/<slug:slug>/price-history/<int:pk>/', views.PriceHistoryDetailView.as_view(), name='price-history-detail'),
    path('products/slug/<slug:slug>/price-history/<int:pk>/', views.PriceHistoryDetailView.as_view(), name='price-history-detail-by-slug'),
    
    # Articles
    path('articles/', views.ArticleListCreateView.as_view(), name='article-list'),
    path('articles/<slug:slug>/', views.ArticleDetailView.as_view(), name='article-detail'),
    path('articles/id/<int:pk>/', views.ArticleDetailByIdView.as_view(), name='article-detail-by-id'),
    
    # Comments
    path('comments/', views.CommentListCreateView.as_view(), name='comment-list'),
    path('comments/<int:pk>/', views.CommentDetailView.as_view(), name='comment-detail'),
    path('comments/<int:comment_id>/helpful/', views.helpful_vote_view, name='comment-helpful-vote'),
    
    # User Reviews
    path('reviews/', views.UserReviewListCreateView.as_view(), name='review-list'),
    path('reviews/<int:pk>/', views.UserReviewDetailView.as_view(), name='review-detail'),
    
    # Favorites
    path('favorites/', views.FavoriteListCreateView.as_view(), name='favorite-list'),
    path('favorites/<int:pk>/', views.FavoriteDetailView.as_view(), name='favorite-detail'),
    
    # Users
    path('users/', views.UserListCreateView.as_view(), name='user-list'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    path('users/<int:pk>/profile/', views.UserProfileView.as_view(), name='user-profile'),
    
    # Settings
    path('settings/', views.SettingListCreateView.as_view(), name='setting-list'),
    path('settings/bulk/', views.settings_bulk_view, name='settings-bulk'),
    path('settings/public/', views.public_settings_view, name='public-settings'),
    path('settings/<str:key>/', views.SettingDetailView.as_view(), name='setting-detail'),
    
    # User-specific endpoints
    path('users/<int:user_id>/favorites/', views.UserFavoritesView.as_view(), name='user-favorites'),
    path('users/<int:user_id>/stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('users/<int:user_id>/stats/public/', views.UserPublicStatsView.as_view(), name='user-public-stats'),
    path('users/<int:user_id>/settings/', views.UserSettingsView.as_view(), name='user-settings'),
    path('users/<int:user_id>/activity/', views.UserActivityView.as_view(), name='user-activity'),
    path('users/<int:user_id>/change-password/', views.change_password_view, name='user-change-password'),
    
    # Search
    path('search/', views.search_view, name='search'),
    
    # Affiliate Links
    path('affiliate-links/', views.AffiliateLinkListView.as_view(), name='affiliate-link-list'),
    path('affiliate-links/<int:pk>/', views.AffiliateLinkDetailView.as_view(), name='affiliate-link-detail'),
    
    # Analytics
    path('analytics/', views.analytics_view, name='analytics'),
    
    # Outbound Click Tracking
    path('outbound/', views.track_outbound_click, name='outbound-click'),
    
    # Article View Tracking
    path('article-view/', views.track_article_view, name='article-view'),
    
    # Monthly Analytics
    path('analytics/monthly/', views.monthly_analytics_view.as_view(), name='monthly-analytics'),
    
    # Database Statistics
    path('database/stats/', views.DatabaseStatsView.as_view(), name='database-stats'),
    
    # Newsletter
    path('newsletter/subscribe/', newsletter_views.newsletter_subscribe_view, name='newsletter-subscribe'),
    path('newsletter/unsubscribe/', newsletter_views.newsletter_unsubscribe_view, name='newsletter-unsubscribe'),
    path('newsletter/subscribers/', newsletter_views.newsletter_subscribers_view, name='newsletter-subscribers'),
    
    # Password Reset
    path('auth/request-password-reset/', password_reset_views.request_password_reset_view, name='request-password-reset'),
    path('auth/verify-reset-code/', password_reset_views.verify_reset_code_view, name='verify-reset-code'),
    path('auth/reset-password/', password_reset_views.reset_password_view, name='reset-password'),

    # Test email
    path('email/test/', email_test_views.test_email_view, name='email-test'),

    # Include router URLs
    path('', include(router.urls)),
]
