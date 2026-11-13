import { supabase, Property, PUBLIC_PROPERTY_COLUMNS } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicators from "@/components/TrustIndicators";
import WhyChooseUs from "@/components/WhyChooseUs";
import AgentProfile from "@/components/AgentProfile";

import HomeClient, { HeroSearchBar } from "@/components/HomeClient";
import Link from "next/link";
import Image from "next/image";
import { MagnifyingGlass, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import IntroTour from "@/components/IntroTour";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Ghardaar24 | Best Real Estate Agent in Pune | Zero Brokerage Properties",
  },
  description:
    "Looking for flats in Pune? Ghardaar24 offers verified properties for sale and rent in Baner, Wakad, Hinjewadi & more with Zero Brokerage. Contact us now!",
  alternates: {
    canonical: "https://ghardaar24.com",
  },
};

async function getFeaturedProperties(): Promise<Property[]> {
  // Get only explicitly featured properties (approved ones)
  const { data: featured, error: featuredError } = await supabase
    .from("properties")
    .select(PUBLIC_PROPERTY_COLUMNS)
    .eq("featured", true)
    .or("approval_status.eq.approved,approval_status.is.null")
    .order("created_at", { ascending: false })
    .limit(6);

  if (featuredError) {
    if (process.env.NODE_ENV === "development") console.error("Error fetching featured properties:", featuredError);
    return [];
  }

  return (featured as unknown as Property[]) || [];
}

export default async function HomePage() {
  const featuredProperties = await getFeaturedProperties();

  return (
    <>
      <Header />
      <IntroTour />

      {/* Hero */}
      <section className="gx-hero">
        <div className="gx-wrap gx-hero-grid">
          <div className="gx-hero-copy">
            <h1 className="gx-display">
              Where every door <span>leads home.</span>
            </h1>
            <p className="gx-lede">
              Verified flats and villas in Pune to buy or rent, shown by an
              agent with 10+ years here. You pay zero brokerage.
            </p>
            <div className="gx-hero-cta">
              <Link href="/properties" className="gx-btn gx-btn-orange">
                <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
                Browse properties
              </Link>
              <Link href="#consultation" className="gx-btn gx-btn-line">
                Talk to an expert
                <ArrowRight size={20} weight="bold" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <figure className="gx-hero-art">
            <span className="gx-hero-arch-back" aria-hidden="true" />
            <span className="gx-arch gx-arch-hero">
              <Image
                src="/hero.png"
                alt="Residential towers and villas at dusk with lit windows, palms and landscaped gardens"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 80vw"
              />
            </span>
          </figure>
        </div>

        <div id="intro-search" className="gx-wrap">
          <HeroSearchBar />
        </div>
      </section>

      <TrustIndicators />

      {/* Featured + property types (client, login-gated links) */}
      <div id="intro-featured">
        <HomeClient featuredProperties={featuredProperties} />
      </div>

      <WhyChooseUs />

      {/* Consultation form */}
      <div id="intro-contact">
        <AgentProfile />
      </div>

      {/* Closing band */}
      <section className="gx-close">
        <div className="gx-wrap gx-close-inner">
          <h2 className="gx-close-title">
            Find your home in Pune, without paying brokerage.
          </h2>
          <div className="gx-close-actions">
            <Link href="/properties" className="gx-btn gx-btn-ink">
              Browse properties
              <ArrowRight size={20} weight="bold" aria-hidden="true" />
            </Link>
            <Link href="/properties?listing_type=rent" className="gx-btn gx-btn-line-ink">
              Explore rentals
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
