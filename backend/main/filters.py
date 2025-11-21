import django_filters
from .models import *


class CategoryFilter(django_filters.FilterSet):
    parent = django_filters.NumberFilter(field_name='parent__id')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Category
        fields = ['parent', 'is_active', 'name']


class TagFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(choices=Tag.TYPE_CHOICES)
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Tag
        fields = ['type', 'name']


class ProductFilter(django_filters.FilterSet):
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='icontains')
    model = django_filters.CharFilter(field_name='model', lookup_expr='icontains')
    category = django_filters.NumberFilter(field_name='category__id')
    category_slug = django_filters.CharFilter(field_name='category__slug')
    release_year = django_filters.NumberFilter(field_name='release_year')
    release_year_min = django_filters.NumberFilter(field_name='release_year', lookup_expr='gte')
    release_year_max = django_filters.NumberFilter(field_name='release_year', lookup_expr='lte')
    price_min = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    price_max = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    class Meta:
        model = Product
        fields = ['brand', 'model', 'category', 'category_slug', 'release_year', 'release_year_min', 'release_year_max', 'price_min', 'price_max']


class ArticleFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(choices=Article.TYPE_CHOICES)
    status = django_filters.ChoiceFilter(choices=Article.STATUS_CHOICES)
    author = django_filters.NumberFilter(field_name='author__id')
    category = django_filters.NumberFilter(field_name='category__id')
    category_slug = django_filters.CharFilter(field_name='category__slug')
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    published_after = django_filters.DateTimeFilter(field_name='published_at', lookup_expr='gte')
    published_before = django_filters.DateTimeFilter(field_name='published_at', lookup_expr='lte')

    class Meta:
        model = Article
        fields = ['type', 'status', 'author', 'category', 'category_slug', 'title', 'published_after', 'published_before']


class CommentFilter(django_filters.FilterSet):
    article = django_filters.NumberFilter(field_name='article__id')
    user = django_filters.NumberFilter(field_name='user__id')
    status = django_filters.ChoiceFilter(choices=Comment.STATUS_CHOICES)
    parent = django_filters.NumberFilter(field_name='parent__id')

    class Meta:
        model = Comment
        fields = ['article', 'user', 'status', 'parent']


class UserReviewFilter(django_filters.FilterSet):
    product = django_filters.NumberFilter(field_name='product__id')
    user = django_filters.NumberFilter(field_name='user__id')
    rating = django_filters.NumberFilter(field_name='rating')
    rating_min = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')
    rating_max = django_filters.NumberFilter(field_name='rating', lookup_expr='lte')
    status = django_filters.ChoiceFilter(choices=UserReview.STATUS_CHOICES)
    is_verified = django_filters.BooleanFilter(field_name='is_verified')

    class Meta:
        model = UserReview
        fields = ['product', 'user', 'rating', 'rating_min', 'rating_max', 'status', 'is_verified']


class UserFilter(django_filters.FilterSet):
    role = django_filters.ChoiceFilter(choices=User.ROLE_CHOICES)
    status = django_filters.ChoiceFilter(choices=User.STATUS_CHOICES)
    email_verified = django_filters.BooleanFilter(field_name='email_verified', lookup_expr='isnull', exclude=True)
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = User
        fields = ['role', 'status', 'email_verified', 'created_after', 'created_before']