// src/app/reviews/[slug]/page.tsx

import type { Metadata } from 'next';
import type { ArticleDto } from '@/integrations/hardware/rtk/types/article.types';
import ReviewPageClient from './ReviewPageClient';
import { DJANGO_API_URL_BROWSER } from '@/lib/api-config';

const API_BASE = DJANGO_API_URL_BROWSER.replace(/\/+$/, '');

async function fetchReviewForMeta(slug: string): Promise<ArticleDto | null> {
  if (!slug) return null;

  try {
    const res = await fetch(
      `${API_BASE}/articles/${encodeURIComponent(slug)}/`,
      {
        cache: 'no-store',
      },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as ArticleDto;

    if (data.type !== 'REVIEW' || data.status !== 'PUBLISHED') {
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error fetching review for metadata:', err);
    return null;
  }
}

interface ReviewPageParams {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: ReviewPageParams,
): Promise<Metadata> {
  const slug = params.slug;

  if (!slug) {
    return {
      title: 'İnceleme Bulunamadı',
      description: 'Aradığınız inceleme bulunamadı.',
    };
  }

  const review = await fetchReviewForMeta(slug);

  if (!review) {
    return {
      title: 'İnceleme Bulunamadı',
      description: 'Aradığınız inceleme bulunamadı.',
    };
  }

  const title = review.meta_title || review.title;
  const description = review.meta_description || review.excerpt || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: review.hero_image ? [review.hero_image] : [],
    },
  };
}

export default function Page({ params }: ReviewPageParams) {
  const slug = params.slug;

  return <ReviewPageClient slug={slug} />;
}
