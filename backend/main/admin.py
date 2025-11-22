

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import *

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'role', 'status', 'is_active', 'created_at')
    list_filter = ('role', 'status', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Hardware Review Info', {'fields': ('role', 'avatar', 'bio', 'social_links', 'settings', 'status', 'email_verified')}),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Hardware Review Info', {'fields': ('role', 'avatar', 'bio', 'social_links', 'settings', 'status', 'email_verified')}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'is_active', 'sort_order', 'created_at')
    list_filter = ('is_active', 'parent', 'created_at')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('sort_order', 'name')


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'type')
    list_filter = ('type',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('brand', 'model', 'slug', 'category', 'release_year', 'created_at')
    list_filter = ('brand', 'category', 'release_year', 'created_at')
    search_fields = ('brand', 'model', 'slug', 'description')
    prepopulated_fields = {'slug': ('brand', 'model')}
    ordering = ('-created_at',)


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'status', 'author', 'category', 'published_at', 'created_at')
    list_filter = ('type', 'status', 'author', 'category', 'published_at', 'created_at')
    search_fields = ('title', 'subtitle', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    ordering = ('-published_at', '-created_at')
    date_hierarchy = 'published_at'
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'subtitle', 'excerpt', 'slug', 'type', 'status')
        }),
        ('Content', {
            'fields': ('content', 'hero_image', 'og_image')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'canonical', 'schema_type')
        }),
        ('Relations', {
            'fields': ('author', 'editor', 'category')
        }),
        ('Timestamps', {
            'fields': ('published_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ReviewExtra)
class ReviewExtraAdmin(admin.ModelAdmin):
    list_display = ('article', 'score_numeric', 'total_score', 'performance_score', 'stability_score')
    list_filter = ('article__type', 'article__status')
    search_fields = ('article__title',)


@admin.register(BestListExtra)
class BestListExtraAdmin(admin.ModelAdmin):
    list_display = ('article', 'items_count', 'last_updated')
    list_filter = ('article__type', 'article__status', 'last_updated')
    search_fields = ('article__title',)
    readonly_fields = ('last_updated',)

    def items_count(self, obj):
        return len(obj.items) if obj.items else 0
    items_count.short_description = 'Items Count'


@admin.register(CompareExtra)
class CompareExtraAdmin(admin.ModelAdmin):
    list_display = ('article', 'left_product', 'right_product', 'winner_product')
    list_filter = ('article__type', 'article__status')
    search_fields = ('article__title', 'left_product__brand', 'right_product__brand')


@admin.register(AffiliateLink)
class AffiliateLinkAdmin(admin.ModelAdmin):
    list_display = ('product', 'merchant', 'active', 'created_at')
    list_filter = ('merchant', 'active', 'created_at')
    search_fields = ('product__brand', 'product__model', 'merchant')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('article', 'author_name', 'author_email', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'article__type')
    search_fields = ('content', 'author_name', 'author_email', 'article__title')
    ordering = ('-created_at',)


@admin.register(UserReview)
class UserReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user', 'rating', 'status', 'is_verified', 'created_at')
    list_filter = ('rating', 'status', 'is_verified', 'created_at')
    search_fields = ('product__brand', 'product__model', 'user__email', 'title', 'content')
    ordering = ('-created_at',)


@admin.register(ProductSpec)
class ProductSpecAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'value', 'type', 'is_visible', 'sort_order')
    list_filter = ('type', 'is_visible', 'product__brand')
    search_fields = ('product__brand', 'product__model', 'name', 'value')
    ordering = ('product', 'sort_order', 'name')


@admin.register(PriceHistory)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('product', 'price', 'currency', 'source', 'recorded_at')
    list_filter = ('currency', 'source', 'recorded_at')
    search_fields = ('product__brand', 'product__model', 'source')
    ordering = ('-recorded_at',)


@admin.register(ProductComparison)
class ProductComparisonAdmin(admin.ModelAdmin):
    list_display = ('title', 'left_product', 'right_product', 'winner', 'is_public', 'created_at')
    list_filter = ('is_public', 'created_at')
    search_fields = ('title', 'left_product__brand', 'right_product__brand')
    ordering = ('-created_at',)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'product', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__email', 'product__brand', 'product__model')
    ordering = ('-created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'read_at', 'created_at')
    list_filter = ('type', 'read_at', 'created_at')
    search_fields = ('user__email', 'type')
    ordering = ('-created_at',)


@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'value')
    search_fields = ('key', 'value')