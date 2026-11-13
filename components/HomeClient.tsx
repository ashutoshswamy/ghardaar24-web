"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";
import PropertyCard from "@/components/PropertyCard";
import Link from "next/link";
import Image from "next/image";
import { Property, supabase } from "@/lib/supabase";
import {
  MagnifyingGlass,
  ArrowRight,
} from "@phosphor-icons/react";
import { PUNE_AREAS } from "@/lib/areas";
import { MotionSection, StaggerContainer, StaggerItem } from "@/lib/motion";

interface HomeClientProps {
  featuredProperties: Property[];
}

const propertyTypes: {
  type: string;
  label: string;
  desc: string;
}[] = [
  {
    type: "apartment",
    label: "Apartments",
    desc: "Flats in gated societies",
  },
  {
    type: "house",
    label: "Houses",
    desc: "Independent and row houses",
  },
  {
    type: "villa",
    label: "Villas",
    desc: "Bungalows with gardens",
  },
  {
    type: "plot",
    label: "Plots",
    desc: "Land to build on",
  },
  {
    type: "commercial",
    label: "Commercial",
    desc: "Offices and shops",
  },
];

function TypeArch({ item }: { item: (typeof propertyTypes)[number] }) {
  return (
    <>
      <span className="gx-arch gx-arch-type">
        <Image
          src={`/property/${item.type}.png`}
          alt=""
          fill
          sizes="(min-width: 900px) 18vw, 42vw"
        />
      </span>
      <span className="gx-type-label">{item.label}</span>
      <span className="gx-type-desc">{item.desc}</span>
    </>
  );
}

function FeaturedSection({ properties }: { properties: Property[] }) {
  if (properties.length === 0) return null;
  const lead = properties.length === 3 || properties.length === 6;
  return (
    <MotionSection className="gx-section" id="featured">
      <div className="gx-wrap">
        <div className="gx-section-head">
          <h2 className="gx-h2">Featured properties</h2>
          <Link href="/properties?featured=true" className="gx-link-arrow">
            View all <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
        <div className="gx-featured-grid" data-count={properties.length}>
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              index={index}
              variant={lead && index === 0 ? "lead" : "default"}
              className={lead && index === 0 ? "gx-lead" : ""}
            />
          ))}
        </div>
      </div>
    </MotionSection>
  );
}

export default function HomeClient({ featuredProperties }: HomeClientProps) {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string>("/properties");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const isReady = mounted && !loading;

  const handleLoginRequired = (redirectUrl: string) => {
    setPendingRedirect(redirectUrl);
    setShowLoginModal(true);
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    if (!isReady) return;

    if (!user) {
      e.preventDefault();
      handleLoginRequired(url);
    }
  };

  const typesSection = (
    <MotionSection className="gx-section gx-types-section">
      <div className="gx-wrap">
        <div className="gx-section-head">
          <h2 className="gx-h2">Find the door that fits</h2>
        </div>
        {isReady ? (
          <StaggerContainer className="gx-types">
            {propertyTypes.map((item) => (
              <StaggerItem key={item.type}>
                <Link
                  href={`/properties?property_type=${item.type}`}
                  className="gx-type"
                  onClick={(e) =>
                    handleLinkClick(e, `/properties?property_type=${item.type}`)
                  }
                >
                  <TypeArch item={item} />
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="gx-types">
            {propertyTypes.map((item) => (
              <div key={item.type} className="gx-type">
                <TypeArch item={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </MotionSection>
  );

  return (
    <>
      <FeaturedSection properties={featuredProperties} />
      {typesSection}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl={pendingRedirect}
        title="Login to Continue"
        subtitle="Please login to browse properties and view details"
      />
    </>
  );
}

const listingOptions = [
  { value: "sale", label: "Buy" },
  { value: "rent", label: "Rent" },
  { value: "resale", label: "Resale" },
];
const typeOptions = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "plot", label: "Plot" },
];
const budgetOptions = [
  { value: "7500000-10000000", label: "₹75L to 1Cr" },
  { value: "10000000-15000000", label: "₹1Cr to 1.5Cr" },
  { value: "15000000-25000000", label: "₹1.5Cr to 2.5Cr" },
  { value: "25000000-", label: "₹2.5Cr+" },
];

// Export HeroSearchBar as a separate component
export function HeroSearchBar() {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string>("/properties");
  const [locations, setLocations] = useState<{ state: string; city: string }[]>(
    []
  );
  const [selectedCity, setSelectedCity] = useState("");
  const [listing, setListing] = useState("");
  const [ptype, setPtype] = useState("");
  const [budget, setBudget] = useState("");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase
        .from("locations")
        .select("state, city")
        .eq("is_active", true);
      if (data) setLocations(data);
    }
    fetchLocations();
  }, []);

  const availableCities = Array.from(
    new Set(locations.map((l) => l.city))
  ).sort();

  // Use router for navigation
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!mounted || loading) return;

    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity);
    if (listing) params.set("listing_type", listing);
    if (ptype) params.set("property_type", ptype);
    if (budget) {
      const [min, max] = budget.split("-");
      if (min) params.set("min_price", min);
      if (max) params.set("max_price", max);
    }

    const url = `/properties?${params.toString()}`;

    if (!user) {
      setPendingRedirect(url);
      setShowLoginModal(true);
    } else {
      router.push(url);
    }
  };

  return (
    <>
      <MotionSection className="gx-search-wrap" delay={0.3}>
        <form className="gx-bar" onSubmit={handleSubmit}>
          <div className="gx-bar-seg" role="radiogroup" aria-label="Listing type">
            {listingOptions.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={listing === o.value}
                onClick={() => setListing(listing === o.value ? "" : o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label className="gx-bar-field">
            <span>City</span>
            <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              <option value="">All cities</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="gx-bar-field">
            <span>Property</span>
            <select value={ptype} onChange={(e) => setPtype(e.target.value)}>
              <option value="">Any type</option>
              {typeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <label className="gx-bar-field">
            <span>Budget</span>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              <option value="">Any budget</option>
              {budgetOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="gx-btn gx-btn-orange gx-bar-btn">
            <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
            Search
          </button>
        </form>

        <ul className="gx-areas" aria-label="Popular areas">
          <li className="gx-areas-label">Popular areas</li>
          {PUNE_AREAS.slice(0, 5).map((area) => (
            <li key={area.slug}>
              <Link href={`/pune/${area.slug}`}>{area.name}</Link>
            </li>
          ))}
        </ul>
      </MotionSection>

      {/* Login Modal for Search */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectUrl={pendingRedirect}
        title="Login to Search"
        subtitle="Please login to search and browse properties"
      />
    </>
  );
}
