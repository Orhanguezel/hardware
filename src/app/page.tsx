import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedReviews } from "@/components/sections/featured-reviews";
import { LatestArticles } from "@/components/sections/latest-articles";
import { NewsletterSignup } from "@/components/sections/newsletter-signup";

export default async function HomePage() {
  return (
    <div className="flex flex-col">
      <div className="animate-fade-in">
        <HeroSection />
      </div>
      <div className="animate-slide-in">
        <FeaturedReviews />
      </div>
      <div className="animate-scale-in">
        <LatestArticles />
      </div>
      <div className="animate-slide-in">
        <NewsletterSignup />
      </div>
    </div>
  );
}
