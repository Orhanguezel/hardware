from django.db import models
from django.utils import timezone
from .models import User, Article, Product, Category, Tag


class ArticleTag(models.Model):
    """Many-to-many relationship between articles and tags"""
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='article_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='article_tags')

    class Meta:
        unique_together = ['article', 'tag']

    def __str__(self):
        return f"{self.article.title} - {self.tag.name}"


class ArticleProduct(models.Model):
    """Many-to-many relationship between articles and products"""
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='article_products')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='article_products')
    position = models.IntegerField(null=True, blank=True)

    class Meta:
        unique_together = ['article', 'product']

    def __str__(self):
        return f"{self.article.title} - {self.product.brand} {self.product.model}"


class ReviewExtra(models.Model):
    """Additional data for review articles"""
    article = models.OneToOneField(Article, on_delete=models.CASCADE, related_name='review_extra')
    criteria = models.JSONField(default=dict, blank=True)
    score_numeric = models.FloatField(null=True, blank=True)
    pros = models.JSONField(default=list, blank=True)
    cons = models.JSONField(default=list, blank=True)
    technical_spec = models.JSONField(default=dict, blank=True)
    performance_score = models.FloatField(null=True, blank=True)
    stability_score = models.FloatField(null=True, blank=True)
    coverage_score = models.FloatField(null=True, blank=True)
    software_score = models.FloatField(null=True, blank=True)
    value_score = models.FloatField(null=True, blank=True)
    total_score = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"Review Extra for {self.article.title}"


class PriceHistory(models.Model):
    """Price history tracking for products"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='price_history')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='TRY')
    source = models.CharField(max_length=100)  # Amazon, Teknosa, etc.
    url = models.URLField(max_length=500, null=True, blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-recorded_at']
        verbose_name_plural = 'Price Histories'

    def __str__(self):
        return f"{self.product.brand} {self.product.model} - {self.currency} {self.price} ({self.source})"


class BestListExtra(models.Model):
    """Additional data for best list articles"""
    article = models.OneToOneField(Article, on_delete=models.CASCADE, related_name='best_list_extra')
    items = models.JSONField(default=list, blank=True)  # List of best list items
    criteria = models.JSONField(default=dict, blank=True)  # Selection criteria
    methodology = models.TextField(blank=True, null=True)  # How the list was created
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Best List Extra for {self.article.title}"


class CompareExtra(models.Model):
    """Additional data for comparison articles"""
    article = models.OneToOneField(Article, on_delete=models.CASCADE, related_name='compare_extra')
    left_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='compare_left_comparisons')
    right_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='compare_right_comparisons')
    rounds = models.JSONField(default=list, blank=True)
    winner_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='compare_won_comparisons')

    def __str__(self):
        return f"Compare Extra for {self.article.title}"


class AffiliateLink(models.Model):
    """Affiliate link management"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='affiliate_links')
    merchant = models.CharField(max_length=100)
    url_template = models.URLField()
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.brand} {self.product.model} - {self.merchant}"


class OutboundClick(models.Model):
    """Click tracking for affiliate links"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True, related_name='outbound_clicks')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, null=True, blank=True, related_name='outbound_clicks')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='outbound_clicks')
    merchant = models.CharField(max_length=100)
    ip = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Click on {self.merchant} - {self.created_at}"


class Comment(models.Model):
    """Comment system for articles"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='comments')
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    author_name = models.CharField(max_length=100, blank=True, null=True)
    author_email = models.EmailField(blank=True, null=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.author_name or self.user.email} on {self.article.title}"


class HelpfulVote(models.Model):
    """Voting system for comments"""
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='helpful_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='helpful_votes')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['comment', 'user'], ['comment', 'ip_address']]

    def __str__(self):
        return f"Vote for comment {self.comment.id}"


class Notification(models.Model):
    """User notification system"""
    TYPE_CHOICES = [
        ('COMMENT_REPLY', 'Comment Reply'),
        ('ARTICLE_PUBLISHED', 'Article Published'),
        ('SYSTEM', 'System'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    payload = models.JSONField(default=dict, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.email} - {self.type}"


class Setting(models.Model):
    """Site settings model"""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, default='general')
    is_file = models.BooleanField(default=False)  # Indicates if this setting stores a file path
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'main_setting'
        ordering = ['category', 'key']

    def __str__(self):
        return f"{self.key}: {self.value[:50]}"

    @classmethod
    def get_setting(cls, key, default=None):
        """Get a setting value by key"""
        try:
            setting = cls.objects.get(key=key)
            return setting.value
        except cls.DoesNotExist:
            return default

    @classmethod
    def set_setting(cls, key, value, description=None, category='general'):
        """Set a setting value by key"""
        setting, created = cls.objects.get_or_create(
            key=key,
            defaults={
                'value': value,
                'description': description,
                'category': category
            }
        )
        if not created:
            setting.value = value
            setting.description = description
            setting.category = category
            setting.save()
        return setting


class ProductSpec(models.Model):
    """Product specifications"""
    TYPE_CHOICES = [
        ('TEXT', 'Text'),
        ('NUMBER', 'Number'),
        ('BOOLEAN', 'Boolean'),
        ('SELECT', 'Select'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_specs')
    name = models.CharField(max_length=100)
    value = models.CharField(max_length=500)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='TEXT')
    unit = models.CharField(max_length=20, blank=True, null=True)
    is_visible = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['product', 'name']
        ordering = ['sort_order', 'name']

    def __str__(self):
        return f"{self.product.brand} {self.product.model} - {self.name}"




class UserReview(models.Model):
    """User reviews for products"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='user_reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    title = models.CharField(max_length=200, blank=True, null=True)
    content = models.TextField()
    pros = models.JSONField(default=list, blank=True)
    cons = models.JSONField(default=list, blank=True)
    is_verified = models.BooleanField(default=False)
    is_helpful = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', 'rating']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Review by {self.user.email} for {self.product.brand} {self.product.model}"


class ProductTag(models.Model):
    """Many-to-many relationship between products and tags"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='product_tags')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['product', 'tag']

    def __str__(self):
        return f"{self.product.brand} {self.product.model} - {self.tag.name}"


class ProductComparison(models.Model):
    """Product comparison system"""
    left_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_left_comparisons')
    right_product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_right_comparisons')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    features = models.JSONField(default=dict, blank=True)
    winner = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='product_won_comparisons')
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['left_product']),
            models.Index(fields=['right_product']),
            models.Index(fields=['is_public']),
        ]

    def __str__(self):
        return f"{self.left_product.brand} {self.left_product.model} vs {self.right_product.brand} {self.right_product.model}"


class Favorite(models.Model):
    """User favorites for products"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['product']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.product.brand} {self.product.model}"


class ArticleView(models.Model):
    """Track article page views for analytics"""
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='views')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='article_views')
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True, null=True)
    referer = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['article', 'created_at']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"View of {self.article.title} - {self.created_at}"


class MonthlyAnalytics(models.Model):
    """Monthly analytics data"""
    year = models.IntegerField()
    month = models.IntegerField()
    total_views = models.IntegerField(default=0)
    total_affiliate_clicks = models.IntegerField(default=0)
    total_users = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', '-month']
        unique_together = [['year', 'month']]

    def __str__(self):
        return f"Analytics {self.year}-{self.month:02d}: {self.total_views} views, {self.total_affiliate_clicks} clicks"


class NewsletterSubscription(models.Model):
    """Newsletter subscription model"""
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    source = models.CharField(max_length=100, blank=True, null=True)  # Where they subscribed from
    
    class Meta:
        ordering = ['-subscribed_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
            models.Index(fields=['subscribed_at']),
        ]

    def __str__(self):
        return f"Newsletter: {self.email} ({'Active' if self.is_active else 'Inactive'})"


class PasswordResetCode(models.Model):
    """Password reset code model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_codes')
    code = models.CharField(max_length=6)  # 6 haneli kod
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'code']),
            models.Index(fields=['is_used']),
            models.Index(fields=['expires_at']),
        ]

    def __str__(self):
        return f"Password Reset: {self.user.email} - {self.code} ({'Used' if self.is_used else 'Active'})"
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.is_used and not self.is_expired()