// hardware/src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatScore(score: number): string {
  return score.toFixed(1)
}

export function getScoreColor(score: number): string {
  if (score >= 8.5) return 'text-green-600 dark:text-green-400'
  if (score >= 7) return 'text-green-500 dark:text-green-300'
  if (score >= 4) return 'text-yellow-500 dark:text-yellow-300'
  return 'text-red-500 dark:text-red-300'
}

export function getScoreBgColor(score: number): string {
  if (score >= 8.5) return 'bg-green-600'
  if (score >= 7) return 'bg-green-500'
  if (score >= 4) return 'bg-yellow-500'
  return 'bg-red-500'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function generateMetaTitle(title: string, siteName: string = 'Hardware Review'): string {
  return `${title} | ${siteName}`
}

export function generateMetaDescription(excerpt: string, maxLength: number = 160): string {
  return truncateText(excerpt, maxLength)
}
