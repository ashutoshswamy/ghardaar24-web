"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import LoginModal from "@/components/LoginModal";
import Link from "next/link";
import { Property } from "@/lib/supabase";
import PropertyCard from "@/components/PropertyCard";
import {
  Search,
  Building,
  Bed,
  ChevronRight,
  ArrowRight,
  Home,
  Castle,
  Ruler,
  Store,
  Wallet,
  Building2,
  Calendar,
  Tag,
} from "lucide-react";
import { MotionSection, StaggerContainer, StaggerItem } from "@/lib/motion";
import { ReactNode } from "react";

interface HomeClientProps {
  featuredProperties: Property[];
}

const propertyTypes: { type: string; label: string; icon: ReactNode }[] = [
  {
    type: "apartment",
    label: "Apartments",
    icon: <Building2 className="w-6 h-6" />,
  },
  { type: "house", label: "Houses", icon: <Home className="w-6 h-6" /> },
  { type: "villa", label: "Villas", icon: <Castle className="w-6 h-6" /> },
  { type: "plot", label: "Plots", icon: <Ruler className="w-6 h-6" /> },
  {
    type: "commercial",
    label: "Commercial",
    icon: <Store className="w-6 h-6" />,
  },
];

export default function HomeClient({ featuredProperties }: HomeClientProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string>("/properties");

  const handlePropertyClick = (e: React.MouseEvent, propertyId: string) => {
    if (loading) return;

    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setPendingRedirect(`/properties/${propertyId}`);
      setShowLoginModal(true);
    }
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (loading) return;

    if (!user) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const params = new URLSearchParams();

      formData.forEach((value, key) => {
        if (value && value !== "") {
          params.append(key, value.toString());
        }
      });

      setPendingRedirect(
        `/properties${params.toString() ? `?${params.toString()}` : ""}`
      );
      setShowLoginModal(true);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, url: string) => {
    if (loading) return;

    if (!user) {
      e.preventDefault();
      setPendingRedirect(url);
      setShowLoginModal(true);
    }
  };

  return (
    <>
      {/* Featured Properties */}
      {featuredProperties.length > 0 && (
        <MotionSection className="section featured-section-new">
          <div className="container">
            <StaggerContainer className="section-header">
              <StaggerItem>
                <h2 className="section-title-new">Featured Properties</h2>
              </StaggerItem>
              <StaggerItem>
                <Link
                  href="/properties?featured=true"
                  className="btn-outline-new"
                  onClick={(e) =>
                    handleLinkClick(e, "/properties?featured=true")
                  }
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </StaggerItem>
            </StaggerContainer>

            <div className="properties-grid">
              {featuredProperties.map((property, index) => (
                <div
                  key={property.id}
                  onClick={(e) => handlePropertyClick(e, property.id)}
                  style={{ cursor: "pointer" }}
                >
                  <PropertyCard property={property} index={index} />
                </div>
              ))}
            </div>
          </div>
        </MotionSection>
      )}

      {/* Property Types */}
      <MotionSection className="section types-section">
        <div className="container">
          <StaggerContainer className="section-header">
            <StaggerItem>
              <h2 className="section-title-new">Browse by Property Type</h2>
            </StaggerItem>
          </StaggerContainer>

          <StaggerContainer className="types-grid">
            {propertyTypes.map((item) => (
              <StaggerItem key={item.type}>
                <Link
                  href={`/properties?type=${item.type}`}
                  className="type-card-new"
                  onClick={(e) =>
                    handleLinkClick(e, `/properties?type=${item.type}`)
                  }
                >
                  <span className="type-icon">{item.icon}</span>
                  <span className="type-label">{item.label}</span>
                  <ArrowRight className="w-4 h-4 type-arrow" />
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </MotionSection>

      {/* Login Modal */}
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

// Export HeroSearchBar as a separate component
export function HeroSearchBar() {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string>("/properties");

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (loading) return;

    if (!user) {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const params = new URLSearchParams();

      formData.forEach((value, key) => {
        if (value && value !== "") {
          params.append(key, value.toString());
        }
      });

      setPendingRedirect(
        `/properties${params.toString() ? `?${params.toString()}` : ""}`
      );
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <MotionSection className="hero-search hero-search-horizontal" delay={0.4}>
        <form
          action="/properties"
          className="search-form search-form-horizontal"
          onSubmit={handleSearchSubmit}
        >
          <div className="search-filter">
            <span className="search-filter-label">Type</span>
            <div className="search-filter-value">
              <Building className="w-4 h-4" />
              <select name="type" defaultValue="">
                <option value="">All</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="plot">Plot</option>
              </select>
            </div>
          </div>

          <div className="search-filter">
            <span className="search-filter-label">BHK</span>
            <div className="search-filter-value">
              <Bed className="w-4 h-4" />
              <select name="bedrooms" defaultValue="">
                <option value="">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          <div className="search-filter">
            <span className="search-filter-label">Budget</span>
            <div className="search-filter-value">
              <Wallet className="w-4 h-4" />
              <select name="price_range" defaultValue="">
                <option value="">Any</option>
                <option value="7500000-10000000">₹75L-1Cr</option>
                <option value="10000000-15000000">₹1Cr-1.5Cr</option>
                <option value="15000000-25000000">₹1.5Cr-2.5Cr</option>
                <option value="25000000-">₹2.5Cr+</option>
              </select>
            </div>
          </div>

          <div className="search-filter">
            <span className="search-filter-label">For</span>
            <div className="search-filter-value">
              <Tag className="w-4 h-4" />
              <select name="listing_type" defaultValue="">
                <option value="">All</option>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
                <option value="resale">Resale</option>
              </select>
            </div>
          </div>

          <div className="search-filter">
            <span className="search-filter-label">Possession</span>
            <div className="search-filter-value">
              <Calendar className="w-4 h-4" />
              <select name="possession" defaultValue="">
                <option value="">Any</option>
                <option value="ready">Ready</option>
                <option value="under_construction">Building</option>
              </select>
            </div>
          </div>

          <button type="submit" className="search-button">
            <Search className="w-5 h-5" />
            Search Properties
          </button>
        </form>
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
