from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from main.models import *
import json

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with initial data'

    def handle(self, *args, **options):
        self.stdout.write('🌱 Seeding database...')

        # Create categories
        networking_category = Category.objects.create(
            slug='networking',
            name='Networking',
            description='Network equipment and accessories'
        )

        gaming_category = Category.objects.create(
            slug='gaming',
            name='Gaming',
            description='Gaming network equipment'
        )

        enterprise_category = Category.objects.create(
            slug='enterprise',
            name='Enterprise',
            description='Enterprise network solutions'
        )

        security_category = Category.objects.create(
            slug='security',
            name='Security',
            description='Network security equipment'
        )

        storage_category = Category.objects.create(
            slug='storage',
            name='Storage',
            description='Network storage solutions'
        )

        # Sub-categories under Networking
        router_category = Category.objects.create(
            slug='router',
            name='Router',
            parent=networking_category,
            description='Wi-Fi routers and access points'
        )

        modem_category = Category.objects.create(
            slug='modem',
            name='Modem',
            parent=networking_category,
            description='Modems and gateways'
        )

        switch_category = Category.objects.create(
            slug='switch',
            name='Switch',
            parent=networking_category,
            description='Network switches'
        )

        # Sub-categories under Gaming
        gaming_router_category = Category.objects.create(
            slug='gaming-router',
            name='Gaming Router',
            parent=gaming_category,
            description='Gaming-optimized routers'
        )

        # Create tags
        wifi6_tag = Tag.objects.create(
            slug='wifi-6',
            name='Wi-Fi 6',
            type='FEATURE'
        )

        wifi6e_tag = Tag.objects.create(
            slug='wifi-6e',
            name='Wi-Fi 6E',
            type='FEATURE'
        )

        gaming_tag = Tag.objects.create(
            slug='gaming',
            name='Gaming',
            type='FEATURE'
        )

        enterprise_tag = Tag.objects.create(
            slug='enterprise',
            name='Enterprise',
            type='FEATURE'
        )

        budget_tag = Tag.objects.create(
            slug='budget',
            name='Budget',
            type='PRICE_RANGE'
        )

        premium_tag = Tag.objects.create(
            slug='premium',
            name='Premium',
            type='PRICE_RANGE'
        )

        # Brand tags
        asus_tag = Tag.objects.create(
            slug='asus',
            name='ASUS',
            type='BRAND'
        )

        tpLink_tag = Tag.objects.create(
            slug='tp-link',
            name='TP-Link',
            type='BRAND'
        )

        netgear_tag = Tag.objects.create(
            slug='netgear',
            name='Netgear',
            type='BRAND'
        )

        # Create author user
        author_user = User.objects.create_user(
            username='author',
            email='author@hardware-review.com',
            password='password123',
            first_name='Ahmet',
            last_name='Yılmaz',
            role='AUTHOR',
            email_verified='2024-01-01T00:00:00Z'
        )

        # Create products
        asus_router = Product.objects.create(
            brand='ASUS',
            model='RT-AX88U Pro',
            slug='asus-rt-ax88u-pro',
            release_year=2023,
            specs={
                'wifiStandard': 'Wi-Fi 6E',
                'bands': ['2.4GHz', '5GHz', '6GHz'],
                'maxSpeed': '6000 Mbps',
                'ports': {
                    'wan': 1,
                    'lan': 8
                },
                'features': ['MU-MIMO', 'OFDMA', 'Beamforming']
            },
            category=router_category,
            description='High-performance tri-band Wi-Fi 6E router with advanced features'
        )

        tpLink_router = Product.objects.create(
            brand='TP-Link',
            model='Archer AX73',
            slug='tp-link-archer-ax73',
            release_year=2022,
            specs={
                'wifiStandard': 'Wi-Fi 6',
                'bands': ['2.4GHz', '5GHz'],
                'maxSpeed': '5400 Mbps',
                'ports': {
                    'wan': 1,
                    'lan': 4
                },
                'features': ['MU-MIMO', 'OFDMA', 'Beamforming']
            },
            category=router_category,
            description='Affordable Wi-Fi 6 router with excellent performance'
        )

        # Create product specs
        ProductSpec.objects.create(
            product=asus_router,
            name='Wi-Fi Standard',
            value='Wi-Fi 6E',
            type='TEXT',
            sort_order=1
        )

        ProductSpec.objects.create(
            product=asus_router,
            name='Max Speed',
            value='6000',
            type='NUMBER',
            unit='Mbps',
            sort_order=2
        )

        ProductSpec.objects.create(
            product=tpLink_router,
            name='Wi-Fi Standard',
            value='Wi-Fi 6',
            type='TEXT',
            sort_order=1
        )

        ProductSpec.objects.create(
            product=tpLink_router,
            name='Max Speed',
            value='5400',
            type='NUMBER',
            unit='Mbps',
            sort_order=2
        )

        # Create affiliate links
        AffiliateLink.objects.create(
            product=asus_router,
            merchant='Trendyol',
            url_template='https://www.trendyol.com/asus-rt-ax88u-pro'
        )

        AffiliateLink.objects.create(
            product=asus_router,
            merchant='Hepsiburada',
            url_template='https://www.hepsiburada.com/asus-rt-ax88u-pro'
        )

        AffiliateLink.objects.create(
            product=tpLink_router,
            merchant='Amazon',
            url_template='https://www.amazon.com.tr/tp-link-archer-ax73'
        )

        # Create articles
        review_article = Article.objects.create(
            title='ASUS RT-AX88U Pro İncelemesi - Wi-Fi 6E Gücü',
            subtitle='Yüksek performanslı tri-band router ile ev ağınızı geleceğe taşıyın',
            excerpt='ASUS RT-AX88U Pro, Wi-Fi 6E desteği ve güçlü donanımı ile ev ve ofis kullanımı için mükemmel bir seçim. Detaylı incelememizde tüm özelliklerini test ettik.',
            content={
                'blocks': [
                    {
                        'type': 'paragraph',
                        'content': 'ASUS RT-AX88U Pro, Wi-Fi 6E standardını destekleyen yüksek performanslı bir router modeli. Bu incelememizde router\'ın tüm özelliklerini, performansını ve kullanım deneyimini detaylı olarak ele alacağız.'
                    },
                    {
                        'type': 'heading',
                        'content': 'Tasarım ve Donanım'
                    },
                    {
                        'type': 'paragraph',
                        'content': 'Router, ASUS\'un klasik tasarım dilini yansıtan siyah renkte ve modern bir görünüme sahip. 8 adet gigabit LAN portu ve 1 adet WAN portu ile geniş bağlantı seçenekleri sunuyor.'
                    }
                ]
            },
            type='REVIEW',
            slug='asus-rt-ax88u-pro-inceleme',
            author=author_user,
            category=router_category,
            status='PUBLISHED',
            meta_title='ASUS RT-AX88U Pro İncelemesi | Hardware Review',
            meta_description='ASUS RT-AX88U Pro detaylı incelemesi. Wi-Fi 6E desteği, performans testleri ve kullanıcı deneyimi hakkında kapsamlı analiz.',
            schema_type='Review'
        )

        # Create review extra data
        ReviewExtra.objects.create(
            article=review_article,
            criteria={
                'performance': 9.5,
                'stability': 9.0,
                'coverage': 8.5,
                'software': 9.0,
                'price': 7.5
            },
            score_numeric=8.7,
            pros=[
                'Mükemmel Wi-Fi 6E performansı',
                'Güçlü ve stabil sinyal',
                'Gelişmiş QoS özellikleri',
                'Kolay kurulum ve yönetim'
            ],
            cons=[
                'Yüksek fiyat',
                'Büyük boyut',
                'Güç tüketimi yüksek'
            ],
            technical_spec={
                'Wi-Fi Standardı': 'Wi-Fi 6E',
                'Maksimum Hız': '6000 Mbps',
                'Bantlar': '2.4GHz, 5GHz, 6GHz',
                'LAN Portları': '8x Gigabit',
                'WAN Portları': '1x Gigabit'
            },
            performance_score=9.5,
            stability_score=9.0,
            coverage_score=8.5,
            software_score=9.0,
            value_score=7.5,
            total_score=8.7
        )

        # Link article to products
        ArticleProduct.objects.create(
            article=review_article,
            product=asus_router,
            position=1
        )

        # Link article to tags
        ArticleTag.objects.create(
            article=review_article,
            tag=wifi6e_tag
        )

        ArticleTag.objects.create(
            article=review_article,
            tag=asus_tag
        )

        # Create a comparison article
        compare_article = Article.objects.create(
            title='ASUS RT-AX88U Pro vs TP-Link Archer AX73 Karşılaştırması',
            subtitle='İki popüler Wi-Fi 6 router arasında detaylı karşılaştırma',
            excerpt='ASUS RT-AX88U Pro ve TP-Link Archer AX73 routerları arasında kapsamlı karşılaştırma. Performans, özellikler ve fiyat analizi.',
            content={
                'blocks': [
                    {
                        'type': 'paragraph',
                        'content': 'Bu karşılaştırmada iki popüler Wi-Fi 6 router modelini detaylı olarak inceliyoruz. Her iki model de farklı kullanıcı ihtiyaçlarına hitap ediyor.'
                    }
                ]
            },
            type='COMPARE',
            slug='asus-rt-ax88u-pro-vs-tp-link-archer-ax73',
            author=author_user,
            category=router_category,
            status='PUBLISHED'
        )

        CompareExtra.objects.create(
            article=compare_article,
            left_product=asus_router,
            right_product=tpLink_router,
            rounds=[
                {
                    'category': 'Performans',
                    'leftScore': 9.5,
                    'rightScore': 8.0,
                    'winner': 'left'
                },
                {
                    'category': 'Fiyat',
                    'leftScore': 7.0,
                    'rightScore': 9.0,
                    'winner': 'right'
                },
                {
                    'category': 'Özellikler',
                    'leftScore': 9.5,
                    'rightScore': 8.5,
                    'winner': 'left'
                }
            ],
            winner_product=asus_router
        )

        # Link comparison article to products
        ArticleProduct.objects.create(
            article=compare_article,
            product=asus_router,
            position=1
        )

        ArticleProduct.objects.create(
            article=compare_article,
            product=tpLink_router,
            position=2
        )

        self.stdout.write(
            self.style.SUCCESS('✅ Database seeded successfully!')
        )
