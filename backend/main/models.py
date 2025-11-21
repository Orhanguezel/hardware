from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import json


class User(AbstractUser):
    """Custom User model extending Django's AbstractUser"""
    ROLE_CHOICES = [
        ('MEMBER', 'Member'),
        ('EDITOR', 'Editor'),
        ('ADMIN', 'Admin'),
        ('SUPER_ADMIN', 'Super Admin'),
    ]
    
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('BANNED', 'Banned'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='MEMBER')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True, null=True)
    social_links = models.JSONField(default=dict, blank=True)
    settings = models.JSONField(default=dict, blank=True)
    privacy_settings = models.JSONField(default=dict, blank=True)
    notification_settings = models.JSONField(default=dict, blank=True)
    marketing_emails = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    email_verified = models.DateTimeField(null=True, blank=True)
    email_verification_token = models.CharField(max_length=100, blank=True, null=True)
    email_verification_token_created = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'main_user'

    def __str__(self):
        return f"{self.email} ({self.role})"


class Category(models.Model):
    """Hierarchical category system"""
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True)
    color = models.CharField(max_length=7, blank=True, null=True)  # Hex color
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name


class Tag(models.Model):
    """Tag system for articles and products"""
    TYPE_CHOICES = [
        ('GENERAL', 'General'),
        ('BRAND', 'Brand'),
        ('FEATURE', 'Feature'),
        ('PRICE_RANGE', 'Price Range'),
    ]
    
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='GENERAL')

    def __str__(self):
        return self.name


class Product(models.Model):
    """Product information and specifications"""
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    specs = models.JSONField(default=dict, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    release_year = models.IntegerField(null=True, blank=True)
    cover_image = models.ImageField(upload_to='products/', null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand} {self.model}"


class Article(models.Model):
    """Content management system for reviews, comparisons, guides, etc."""
    TYPE_CHOICES = [
        ('REVIEW', 'Review'),
        ('BEST_LIST', 'Best List'),
        ('COMPARE', 'Compare'),
        ('GUIDE', 'Guide'),
        ('NEWS', 'News'),
    ]
    
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PUBLISHED', 'Published'),
        ('ARCHIVED', 'Archived'),
    ]
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='REVIEW')
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True, null=True)
    excerpt = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='authored_articles')
    editor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='edited_articles')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    hero_image = models.ImageField(upload_to='articles/', null=True, blank=True)
    og_image = models.ImageField(upload_to='articles/og/', null=True, blank=True)
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    canonical = models.URLField(blank=True, null=True)
    schema_type = models.CharField(max_length=50, blank=True, null=True)
    view_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # Check if this is a new article being published
        is_new_article = self.pk is None
        was_published = False
        
        if not is_new_article:
            # Check if status changed to PUBLISHED
            try:
                old_article = Article.objects.get(pk=self.pk)
                was_published = old_article.status == 'PUBLISHED'
            except Article.DoesNotExist:
                pass
        
        if self.status == 'PUBLISHED' and not self.published_at:
            self.published_at = timezone.now()
        
        super().save(*args, **kwargs)
        
        # Send newsletter email if this is a new published article
        if self.status == 'PUBLISHED' and (is_new_article or not was_published):
            try:
                from .email_utils import send_newsletter_email
                from .models_extra import NewsletterSubscription
                
                # Send newsletter email asynchronously (in production, use Celery)
                send_newsletter_email(None, self)
            except Exception as e:
                print(f"Failed to send newsletter email: {e}")


# Import all models from models_extra.py
from .models_extra import *