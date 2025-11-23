from rest_framework import serializers
from django.contrib.auth import authenticate

from .models import *
from .models_extra import PriceHistory


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email_verified = serializers.SerializerMethodField()
    authored_articles_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "name",
            "role",
            "avatar",
            "bio",
            "status",
            "email_verified",
            "authored_articles_count",
            "comments_count",
            "created_at",
            "updated_at",
            "date_joined",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "date_joined"]
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
        }

    def get_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        if obj.first_name:
            return obj.first_name
        return obj.username

    def get_email_verified(self, obj):
        return obj.email_verified is not None

    def get_authored_articles_count(self, obj):
        return obj.authored_articles.count()

    def get_comments_count(self, obj):
        return obj.comments.count()


class UserSearchSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "name",
            "role",
            "avatar",
        ]

    def get_name(self, obj):
        if obj.first_name and obj.last_name:
            return f"{obj.first_name} {obj.last_name}"
        if obj.first_name:
            return obj.first_name
        return obj.username

    def get_email(self, obj):
        # E-posta görünürlük kontrolü
        if obj.privacy_settings and obj.privacy_settings.get("email_visible", False):
            return obj.email
        return ""


class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceHistory
        fields = [
            "id",
            "price",
            "currency",
            "source",
            "url",
            "recorded_at",
            "created_at",
        ]
        read_only_fields = ["id", "recorded_at", "created_at"]

    def validate(self, data):
        # Debug log bırakılmış, istersen silebilirsin
        print("=== PRICE HISTORY SERIALIZER VALIDATE ===")
        print(f"Data to validate: {data}")
        print(f"Data types: {[(k, type(v)) for k, v in data.items()]}")
        return data


class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = [
            "id",
            "key",
            "value",
            "description",
            "category",
            "is_file",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    article_count = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "icon",
            "color",
            "is_active",
            "sort_order",
            "parent",
            "children",
            "article_count",
            "product_count",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_children(self, obj):
        if obj.children.exists():
            return CategorySerializer(obj.children.all(), many=True).data
        return []

    def get_article_count(self, obj):
        return obj.article_set.count()

    def get_product_count(self, obj):
        return obj.product_set.count()


class TagSerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "type", "article_count", "product_count"]
        read_only_fields = ["id", "article_count", "product_count"]

    def validate_slug(self, value):
        # Ensure slug is unique
        if self.instance and self.instance.slug == value:
            return value

        if Tag.objects.filter(slug=value).exists():
            raise serializers.ValidationError(
                "A tag with this slug already exists."
            )
        return value

    def get_article_count(self, obj):
        return obj.article_tags.count()

    def get_product_count(self, obj):
        return obj.product_tags.count()


class ProductSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpec
        fields = ["id", "name", "value", "type", "unit", "is_visible", "sort_order"]
        read_only_fields = ["id"]


class ProductSerializer(serializers.ModelSerializer):
    # READ
    specs = serializers.SerializerMethodField()
    category = CategorySerializer(read_only=True)
    product_specs = ProductSpecSerializer(many=True, read_only=True)
    affiliate_links = serializers.SerializerMethodField()
    user_reviews = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    price_history = serializers.SerializerMethodField()
    product_tags = serializers.SerializerMethodField()

    # WRITE
    category_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    affiliate_links_data = serializers.ListField(
        write_only=True, required=False
    )
    tags = serializers.ListField(write_only=True, required=False)
    cover_image_file = serializers.ImageField(write_only=True, required=False)
    # Seeder ve admin'den gelebilen ama modelde olmayan field:
    is_active = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "brand",
            "model",
            "slug",
            "specs",
            "price",
            "release_year",
            "cover_image",
            "cover_image_file",
            "description",
            "category",
            "category_id",
            "product_specs",
            "affiliate_links",
            "affiliate_links_data",
            "user_reviews",
            "review_count",
            "average_rating",
            "price_history",
            "product_tags",
            "tags",
            "is_active",  # sadece yazma için, modele basılmayacak
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "cover_image": {"required": False, "allow_null": True},
            "slug": {"required": False},
            "price": {"required": False, "allow_null": True},
        }

    def validate_cover_image(self, value):
        # Allow null values for cover_image
        if value == "" or value is None:
            return None
        # Eğer string (URL) ise olduğu gibi döndür
        if isinstance(value, str):
            return value
        return value

    # -------- CREATE --------
    def create(self, validated_data):
        print(f"Django Serializer - Received validated_data: {validated_data}")
        print(
            f"Django Serializer - Specs in validated_data: "
            f"{validated_data.get('specs', 'NOT_FOUND')}"
        )
        print(
            f"Django Serializer - Price in validated_data: "
            f"{validated_data.get('price', 'NOT_FOUND')}"
        )
        print(
            f"Django Serializer - Affiliate links data: "
            f"{validated_data.get('affiliate_links_data', 'NOT_FOUND')}"
        )

        # Modelde olmayan is_active'i yut
        validated_data.pop("is_active", None)

        # category_id → category FK
        category_id = validated_data.pop("category_id", None)
        if not category_id and hasattr(self, "initial_data"):
            # Seeder JSON'u 'category' anahtarı ile gönderiyor
            raw_cat = self.initial_data.get("category")
            try:
                if raw_cat not in (None, "", "null"):
                    category_id = int(raw_cat)
            except (TypeError, ValueError):
                pass
        if category_id:
            validated_data["category_id"] = category_id

        # Extract affiliate_links_data, specs, tags, and cover_image_file from validated_data
        affiliate_links_data = validated_data.pop("affiliate_links_data", [])
        specs_data = validated_data.pop("specs", [])
        tags_data = validated_data.pop("tags", [])
        cover_image_file = validated_data.pop("cover_image_file", None)

        # Handle cover image file upload
        if cover_image_file:
            validated_data["cover_image"] = cover_image_file

        # FormData ve JSON için specs / affiliate_links parse
        if hasattr(self, "initial_data") and self.initial_data:
            print(f"Django Serializer - Initial data: {self.initial_data}")

            # JSON body ile gelen specs (liste)
            if not specs_data and isinstance(self.initial_data.get("specs"), list):
                specs_data = self.initial_data.get("specs") or []

            # JSON body ile gelen affiliate_links_data (liste)
            if (
                not affiliate_links_data
                and isinstance(self.initial_data.get("affiliate_links_data"), list)
            ):
                affiliate_links_data = self.initial_data.get("affiliate_links_data") or []

            # FormData'dan affiliate_links_data ve specs'i çek (eski format)
            for key, value in self.initial_data.items():
                # affiliate_links_data[n][field]
                if key.startswith("affiliate_links_data["):
                    parts = key.split("[")
                    if len(parts) >= 3:
                        index = int(parts[1].rstrip("]"))
                        field = parts[2].rstrip("]")

                        while len(affiliate_links_data) <= index:
                            affiliate_links_data.append({})

                        affiliate_links_data[index][field] = value

                # specs[n][field]
                elif key.startswith("specs["):
                    parts = key.split("[")
                    if len(parts) >= 3:
                        index = int(parts[1].rstrip("]"))
                        field = parts[2].rstrip("]")

                        while len(specs_data) <= index:
                            specs_data.append({})

                        specs_data[index][field] = value

        print(f"Django Serializer - Final specs_data: {specs_data}")
        print(f"Django Serializer - Final affiliate_links_data: {affiliate_links_data}")
        print(f"Django Serializer - Final tags_data: {tags_data}")

        # Create the product (Product.specs JSON alanını kullanmıyoruz, ProductSpec tablosunu kullanıyoruz)
        product = super().create(validated_data)
        print(
            f"Django Serializer - Created product: {product.id}, "
            f"specs: {product.specs}, price: {product.price}"
        )

        # Create ProductSpec objects if specs provided
        if specs_data:
            from .models_extra import ProductSpec as ProductSpecModel

            ProductSpecModel.objects.filter(product=product).delete()
            for idx, spec_data in enumerate(specs_data):
                ProductSpecModel.objects.create(
                    product=product,
                    name=spec_data.get("name", ""),
                    value=str(spec_data.get("value", "")),
                    unit=spec_data.get("unit") or "",
                    type=spec_data.get("type", "TEXT"),
                    is_visible=bool(
                        str(spec_data.get("is_visible", "true")).lower() == "true"
                    ),
                    sort_order=int(spec_data.get("sort_order", idx)),
                )
            print(
                f"Django Serializer - Created {len(specs_data)} ProductSpec objects"
            )

        # Create product tags
        if tags_data:
            from .models_extra import ProductTag
            from .models import Tag

            for tag_id in tags_data:
                try:
                    tag = Tag.objects.get(id=tag_id)
                    ProductTag.objects.create(product=product, tag=tag)
                    print(f"Django Serializer - Created product tag: {tag.name}")
                except Tag.DoesNotExist:
                    print(f"Django Serializer - Tag with id {tag_id} not found")

        # Create affiliate links
        from .models import AffiliateLink

        for link_data in affiliate_links_data:
            active_value = link_data.get("active", True)
            if isinstance(active_value, str):
                active_value = active_value.lower() == "true"

            AffiliateLink.objects.create(
                product=product,
                merchant=link_data.get("merchant", ""),
                url_template=link_data.get("url_template", ""),
                active=active_value,
            )

        print(
            f"Django Serializer - Final product specs: "
            f"{product.specs}, price: {product.price}"
        )
        return product

    # -------- UPDATE --------
    def update(self, instance, validated_data):
        # Modelde olmayan is_active'i yut
        validated_data.pop("is_active", None)

        # category_id → category FK
        category_id = validated_data.pop("category_id", None)
        if not category_id and hasattr(self, "initial_data"):
            raw_cat = self.initial_data.get("category")
            try:
                if raw_cat not in (None, "", "null"):
                    category_id = int(raw_cat)
            except (TypeError, ValueError):
                pass
        if category_id:
            validated_data["category_id"] = category_id

        # slug güncellemesi için unique base
        if "slug" in validated_data and validated_data["slug"]:
            brand = validated_data.get("brand", instance.brand).lower()
            model = validated_data.get("model", instance.model).lower()
            base_slug = f"{brand}-{model}".replace(" ", "-")

            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(id=instance.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            validated_data["slug"] = slug

        affiliate_links_data = validated_data.pop("affiliate_links_data", [])

        print("=== AFFILIATE LINKS DEBUG ===")
        print(f"Raw affiliate_links_data: {affiliate_links_data}")
        print(f"Type: {type(affiliate_links_data)}")

        # initial_data'dan QueryDict formatını parse et
        if hasattr(self, "initial_data") and "affiliate_links_data" in self.initial_data:
            raw_data = self.initial_data
            affiliate_links_data = []
            affiliate_keys = [
                key for key in raw_data.keys()
                if key.startswith("affiliate_links_data[")
            ]

            if affiliate_keys:
                links_by_index = {}
                import re

                for key in affiliate_keys:
                    match = re.match(
                        r"affiliate_links_data\[(\d+)\]\[(\w+)\]", key
                    )
                    if match:
                        index = int(match.group(1))
                        field = match.group(2)

                        if index not in links_by_index:
                            links_by_index[index] = {}

                        value = raw_data[key]
                        if isinstance(value, list):
                            value = value[0]

                        links_by_index[index][field] = value

                affiliate_links_data = list(links_by_index.values())
                print(f"Parsed from QueryDict: {affiliate_links_data}")

        # MultiValueDict formatı için dönüştürme
        if isinstance(affiliate_links_data, list) and affiliate_links_data:
            if hasattr(affiliate_links_data[0], "get"):
                processed_links = []
                for link_dict in affiliate_links_data:
                    processed_link = {}
                    for key, value in link_dict.items():
                        clean_key = key.strip("[]")
                        if isinstance(value, list) and value:
                            processed_link[clean_key] = value[0]
                        else:
                            processed_link[clean_key] = value
                    processed_links.append(processed_link)
                affiliate_links_data = processed_links
                print(f"Processed MultiValueDict: {affiliate_links_data}")

        print(f"Final affiliate_links_data: {affiliate_links_data}")
        print("===============================")

        specs_data = validated_data.pop("specs", None)

        # initial_data'dan specs QueryDict formatı
        if hasattr(self, "initial_data") and any(
            key.startswith("specs[") for key in self.initial_data.keys()
        ):
            raw_data = self.initial_data
            specs_data = []
            specs_keys = [key for key in raw_data.keys() if key.startswith("specs[")]

            if specs_keys:
                specs_by_index = {}
                import re

                for key in specs_keys:
                    match = re.match(r"specs\[(\d+)\]\[(\w+)\]", key)
                    if match:
                        index = int(match.group(1))
                        field = match.group(2)

                        if index not in specs_by_index:
                            specs_by_index[index] = {}

                        value = raw_data[key]
                        if isinstance(value, list):
                            value = value[0]

                        specs_by_index[index][field] = value

                specs_data = list(specs_by_index.values())
                print(f"Parsed specs from QueryDict: {specs_data}")

        # JSON body ile gelen specs
        if specs_data is None and hasattr(self, "initial_data"):
            raw_specs = self.initial_data.get("specs")
            if isinstance(raw_specs, list):
                specs_data = raw_specs

        tags_data = validated_data.pop("tags", None)
        cover_image_file = validated_data.pop("cover_image_file", None)

        # cover_image file upload
        if cover_image_file:
            validated_data["cover_image"] = cover_image_file

        # cover_image boş string ise null’a çevir
        if "cover_image" in validated_data and validated_data["cover_image"] == "":
            validated_data["cover_image"] = None

        # Ürünü güncelle
        product = super().update(instance, validated_data)

        # Specs güncelle
        if specs_data is not None:
            from .models_extra import ProductSpec as ProductSpecModel

            ProductSpecModel.objects.filter(product=product).delete()
            for idx, spec_data in enumerate(specs_data):
                is_visible = spec_data.get("is_visible", True)
                if isinstance(is_visible, str):
                    is_visible = is_visible.lower() == "true"

                ProductSpecModel.objects.create(
                    product=product,
                    name=spec_data.get("name", ""),
                    value=str(spec_data.get("value", "")),
                    unit=spec_data.get("unit") or "",
                    type=spec_data.get("type", "TEXT"),
                    is_visible=is_visible,
                    sort_order=int(spec_data.get("sort_order", idx)),
                )

        # Tags güncelle
        from .models_extra import ProductTag
        from .models import Tag

        if tags_data is not None:
            ProductTag.objects.filter(product=product).delete()

            if isinstance(tags_data, str) and tags_data.strip() == "":
                print("Empty tags string received, all tags cleared")
            elif isinstance(tags_data, list) and len(tags_data) == 0:
                print("Empty tags list received, all tags cleared")
            else:
                if isinstance(tags_data, str):
                    tags_data = [
                        tag.strip() for tag in tags_data.split(",") if tag.strip()
                    ]

                for tag_id in tags_data:
                    try:
                        tag = Tag.objects.get(id=int(tag_id))
                        ProductTag.objects.create(product=product, tag=tag)
                        print(f"Created product tag: {tag.name} (ID: {tag_id})")
                    except (Tag.DoesNotExist, ValueError) as e:
                        print(f"Tag with id {tag_id} not found: {e}")
        else:
            print("No tags data provided, keeping existing tags")

        # Affiliate links güncelle
        from .models import AffiliateLink

        if affiliate_links_data is not None:
            AffiliateLink.objects.filter(product=product).delete()

            if isinstance(affiliate_links_data, str) and affiliate_links_data == "[]":
                pass
            elif isinstance(affiliate_links_data, list) and len(
                affiliate_links_data
            ) == 0:
                pass
            else:
                for link_data in affiliate_links_data:
                    active_value = link_data.get("active", True)
                    if isinstance(active_value, str):
                        active_value = active_value.lower() == "true"

                    AffiliateLink.objects.create(
                        product=product,
                        merchant=link_data.get("merchant", ""),
                        url_template=link_data.get("url_template", ""),
                        active=active_value,
                    )

        return product

    # -------- READ helpers --------
    def get_affiliate_links(self, obj):
        return [
            {
                "id": str(link.id),
                "merchant": link.merchant,
                "url_template": link.url_template,
                "active": link.active,
            }
            for link in obj.affiliate_links.all()
        ]

    def get_specs(self, obj):
        # specs field'ını product_specs'ten doldur (basitleştirilmiş görünüm)
        if hasattr(obj, "product_specs") and obj.product_specs.exists():
            return [
                {
                    "name": spec.name,
                    "value": spec.value,
                    "unit": spec.unit or "",
                    "type": spec.type,
                    "is_visible": spec.is_visible,
                    "sort_order": spec.sort_order,
                }
                for spec in obj.product_specs.all()
            ]
        return []

    def get_user_reviews(self, obj):
        reviews = obj.user_reviews.filter(status="APPROVED")
        return [{"rating": review.rating} for review in reviews]

    def get_review_count(self, obj):
        return obj.user_reviews.filter(status="APPROVED").count()

    def get_average_rating(self, obj):
        reviews = obj.user_reviews.filter(status="APPROVED")
        if reviews.exists():
            return round(
                sum(review.rating for review in reviews) / reviews.count(), 1
            )
        return 0

    def get_price_history(self, obj):
        price_histories = obj.price_history.all()[:10]
        return PriceHistorySerializer(price_histories, many=True).data

    def get_product_tags(self, obj):
        return [
            {
                "id": tag.tag.id,
                "name": tag.tag.name,
                "slug": tag.tag.slug,
                "type": tag.tag.type,
            }
            for tag in obj.product_tags.all()
        ]


class ArticleSerializer(serializers.ModelSerializer):
    content = serializers.CharField()
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)
    article_tags = serializers.SerializerMethodField()
    review_extra = serializers.SerializerMethodField()
    review_extra_data = serializers.JSONField(write_only=True, required=False)
    best_list_extra = serializers.SerializerMethodField()
    best_list_extra_data = serializers.JSONField(write_only=True, required=False)
    compare_extra = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    hero_image_file = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = Article
        fields = [
            "id",
            "type",
            "slug",
            "title",
            "subtitle",
            "excerpt",
            "content",
            "status",
            "author",
            "category",
            "category_id",
            "published_at",
            "hero_image",
            "hero_image_file",
            "og_image",
            "meta_title",
            "meta_description",
            "view_count",
            "article_tags",
            "review_extra",
            "review_extra_data",
            "best_list_extra",
            "best_list_extra_data",
            "compare_extra",
            "comment_count",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        category_id = validated_data.pop("category_id", None)
        if category_id:
            validated_data["category_id"] = category_id

        hero_image_file = validated_data.pop("hero_image_file", None)
        if hero_image_file:
            validated_data["hero_image"] = hero_image_file

        if "title" in validated_data:
            import re

            base_slug = re.sub(
                r"[^a-z0-9\s-]", "", validated_data["title"].lower()
            )
            base_slug = re.sub(r"\s+", "-", base_slug).strip("-")
            slug = base_slug
            counter = 1
            while Article.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data["slug"] = slug

        validated_data.pop("review_extra_data", None)
        validated_data.pop("best_list_extra_data", None)

        return super().create(validated_data)

    def update(self, instance, validated_data):
        category_id = validated_data.pop("category_id", None)
        if category_id:
            validated_data["category_id"] = category_id

        hero_image_file = validated_data.pop("hero_image_file", None)
        if hero_image_file:
            validated_data["hero_image"] = hero_image_file

        if "hero_image" in validated_data and validated_data["hero_image"] == "":
            validated_data["hero_image"] = None

        if "title" in validated_data and validated_data["title"] != instance.title:
            import re

            base_slug = re.sub(
                r"[^a-z0-9\s-]", "", validated_data["title"].lower()
            )
            base_slug = re.sub(r"\s+", "-", base_slug).strip("-")
            slug = base_slug
            counter = 1
            while Article.objects.filter(slug=slug).exclude(id=instance.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data["slug"] = slug

        validated_data.pop("review_extra_data", None)
        validated_data.pop("best_list_extra_data", None)

        return super().update(instance, validated_data)

    def get_article_tags(self, obj):
        return [
            {
                "id": tag.tag.id,
                "name": tag.tag.name,
                "slug": tag.tag.slug,
                "type": tag.tag.type,
            }
            for tag in obj.article_tags.all()
        ]

    def get_review_extra(self, obj):
        if hasattr(obj, "review_extra"):
            return {
                "criteria": obj.review_extra.criteria,
                "score_numeric": obj.review_extra.score_numeric,
                "pros": obj.review_extra.pros,
                "cons": obj.review_extra.cons,
                "technical_spec": obj.review_extra.technical_spec,
                "performance_score": obj.review_extra.performance_score,
                "stability_score": obj.review_extra.stability_score,
                "coverage_score": obj.review_extra.coverage_score,
                "software_score": obj.review_extra.software_score,
                "value_score": obj.review_extra.value_score,
                "total_score": obj.review_extra.total_score,
            }
        return None

    def get_best_list_extra(self, obj):
        if hasattr(obj, "best_list_extra"):
            return {
                "items": obj.best_list_extra.items,
                "criteria": obj.best_list_extra.criteria,
                "methodology": obj.best_list_extra.methodology,
                "last_updated": obj.best_list_extra.last_updated,
            }
        return None

    def get_compare_extra(self, obj):
        if hasattr(obj, "compare_extra"):
            return {
                "left_product": ProductSerializer(obj.compare_extra.left_product).data,
                "right_product": ProductSerializer(
                    obj.compare_extra.right_product
                ).data,
                "rounds": obj.compare_extra.rounds,
                "winner_product": ProductSerializer(
                    obj.compare_extra.winner_product
                ).data
                if obj.compare_extra.winner_product
                else None,
            }
        return None

    def get_comment_count(self, obj):
        return obj.comments.filter(status="APPROVED").count()


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(required=False)
    author_email = serializers.EmailField(required=False)
    content = serializers.CharField(required=False)
    article = serializers.PrimaryKeyRelatedField(
        queryset=Article.objects.all(), required=False
    )
    article_detail = serializers.SerializerMethodField(read_only=True)
    article_id = serializers.IntegerField(read_only=True)
    user = UserSerializer(read_only=True)
    status = serializers.ChoiceField(
        choices=[("PENDING", "Pending"), ("APPROVED", "Approved"), ("REJECTED", "Rejected")],
        required=False,
    )
    replies = serializers.SerializerMethodField()
    helpful_count = serializers.SerializerMethodField()
    article_title = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "article",
            "article_detail",
            "article_id",
            "user",
            "content",
            "status",
            "author_name",
            "author_email",
            "parent",
            "replies",
            "helpful_count",
            "article_title",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        if "article" not in validated_data:
            raise serializers.ValidationError(
                {"article": "This field is required for comment creation."}
            )
        return super().create(validated_data)

    def get_replies(self, obj):
        replies = obj.replies.filter(status="APPROVED")
        if replies.exists():
            return CommentSerializer(replies, many=True).data
        return []

    def get_helpful_count(self, obj):
        return obj.helpful_votes.count()

    def get_article_title(self, obj):
        return obj.article.title if obj.article else "Bilinmeyen Makale"

    def get_article_detail(self, obj):
        if obj.article:
            slug = obj.article.slug
            if not slug or slug == "None" or slug.strip() == "":
                slug = None
            return {
                "id": obj.article.id,
                "title": obj.article.title,
                "slug": slug,
                "type": obj.article.type,
            }
        return None


class UserReviewSerializer(serializers.ModelSerializer):
    pros = serializers.JSONField(required=False)
    cons = serializers.JSONField(required=False)
    user = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False)
    rating = serializers.IntegerField(required=False)
    content = serializers.CharField(required=False)
    status = serializers.ChoiceField(
        choices=[("PENDING", "Pending"), ("APPROVED", "Approved"), ("REJECTED", "Rejected")],
        required=False,
    )

    class Meta:
        model = UserReview
        fields = [
            "id",
            "product",
            "product_id",
            "user",
            "rating",
            "title",
            "content",
            "pros",
            "cons",
            "is_verified",
            "is_helpful",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "user", "created_at"]

    def create(self, validated_data):
        if "product_id" in validated_data:
            product_id = validated_data.pop("product_id")
            validated_data["product_id"] = product_id
        return super().create(validated_data)


class AffiliateLinkSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()

    class Meta:
        model = AffiliateLink
        fields = [
            "id",
            "product",
            "product_name",
            "merchant",
            "url_template",
            "active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_product_name(self, obj):
        return f"{obj.product.brand} {obj.product.model}"


class OutboundClickSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutboundClick
        fields = [
            "id",
            "product",
            "article",
            "user",
            "merchant",
            "ip",
            "user_agent",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class FavoriteSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ["id", "user", "product", "product_id", "created_at"]
        read_only_fields = ["id", "user", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    payload = serializers.JSONField()

    class Meta:
        model = Notification
        fields = ["id", "user", "type", "payload", "read_at", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductComparisonSerializer(serializers.ModelSerializer):
    features = serializers.JSONField()
    left_product = ProductSerializer(read_only=True)
    right_product = ProductSerializer(read_only=True)
    winner = ProductSerializer(read_only=True)

    class Meta:
        model = ProductComparison
        fields = [
            "id",
            "left_product",
            "right_product",
            "title",
            "description",
            "features",
            "winner",
            "is_public",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# Authentication serializers
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            attrs["user"] = user
            return attrs
        raise serializers.ValidationError('Must include "email" and "password".')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "marketing_emails",
            "push_notifications",
            "email_notifications",
        ]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Bu e-posta adresi daha önce kullanılmış."
            )
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError("Şifreler eşleşmiyor.")
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        user = User.objects.create_user(**validated_data)
        return user


class ArticleViewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleView
        fields = [
            "id",
            "article",
            "user",
            "ip_address",
            "user_agent",
            "referer",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class MonthlyAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyAnalytics
        fields = [
            "id",
            "year",
            "month",
            "total_views",
            "total_affiliate_clicks",
            "total_users",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscription
        fields = [
            "id",
            "email",
            "is_active",
            "subscribed_at",
            "unsubscribed_at",
            "source",
        ]
        read_only_fields = ["id", "subscribed_at", "unsubscribed_at"]


class PasswordResetCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordResetCode
        fields = ["id", "user", "code", "is_used", "created_at", "expires_at"]
        read_only_fields = ["id", "created_at", "expires_at"]
