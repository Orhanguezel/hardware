# Auth
api/auth/login/
api/auth/register/
api/auth/logout/
api/auth/verify-email/
api/auth/resend-verification/
api/auth/check-verification-status/
api/auth/request-password-reset/
api/auth/verify-reset-code/
api/auth/reset-password/

# Kategori & Tag
api/categories/
api/categories/<slug:slug>/
api/categories/id/<int:pk>/
api/tags/
api/tags/<slug:slug>/

# Product
api/products/
api/products/<slug:slug>/
api/products/id/<int:pk>/
api/products/<int:product_id>/reviews/
api/products/slug/<slug:slug>/reviews/
api/products/<slug:slug>/price-history/
...

# Article
api/articles/
api/articles/<slug:slug>/
api/articles/id/<int:pk>/

# Comment / Review
api/comments/
api/comments/<int:pk>/
api/reviews/
api/reviews/<int:pk>/

# Favorites & User
api/favorites/
api/favorites/<int:pk>/
api/users/
api/users/<int:pk>/
api/users/<int:pk>/profile/
api/users/<int:user_id>/favorites/
api/users/<int:user_id>/stats/
api/users/<int:user_id>/stats/public/
api/users/<int:user_id>/settings/
api/users/<int:user_id>/activity/
api/users/<int:user_id>/change-password/

# Site settings
api/settings/
api/settings/bulk/
api/settings/public/      ← front için çok önemli

# Diğer
api/search/
api/affiliate-links/
api/analytics/
api/outbound/
api/article-view/
api/analytics/monthly/
api/database/stats/
api/newsletter/subscribe/
api/newsletter/unsubscribe/
api/newsletter/subscribers/
api/auth/... şifre reset vs.
api/   (DRF api-root)
