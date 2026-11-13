"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  List,
  X,
  SignOut,
  Plus,
  SquaresFour,
  ShieldCheck,
  CaretDown,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { useStaffAuth } from "@/lib/staff-auth";

const propertyLinks = [
  { href: "/properties", label: "All properties" },
  { href: "/properties?listing_type=sale", label: "Buy" },
  { href: "/properties?listing_type=rent", label: "Rent" },
  { href: "/properties?listing_type=resale", label: "Resale" },
];

const serviceLinks = [
  { href: "/services/home-loans", label: "Home loans" },
  { href: "/services/interior-design", label: "Interior design" },
  { href: "/services/vastu-consultation", label: "Vastu" },
];

const resourceLinks = [
  { href: "/calculators", label: "Calculators" },
  { href: "/real-estate-guide", label: "Real estate guide" },
  { href: "/downloads", label: "Downloads" },
];

function Dropdown({
  label,
  links,
  id,
}: {
  label: string;
  links: { href: string; label: string }[];
  id?: string;
}) {
  return (
    <div className="gx-dd" id={id}>
      <button type="button" className="gx-nav-link" aria-haspopup="true">
        {label}
        <CaretDown size={14} weight="bold" aria-hidden="true" />
      </button>
      <div className="gx-dd-menu">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, userProfile, isAdmin, loading, signOut } = useAuth();
  const { staffProfile } = useStaffAuth();

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  // lock page scroll while the mobile sheet is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const close = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    close();
  };

  const name = userProfile?.name || "Account";

  return (
    <header className="gx-header">
      <div className="gx-header-inner">
        <Link href="/" className="gx-logo" id="intro-logo" onClick={close}>
          <Image
            src="/logo2.png"
            alt="Ghardaar24"
            width={120}
            height={40}
            priority
            style={{ height: "36px", width: "auto" }}
          />
        </Link>

        <nav className="gx-nav" aria-label="Primary">
          <Dropdown label="Properties" links={propertyLinks} id="intro-properties" />
          <div className="gx-nav-group" id="intro-services">
            {serviceLinks.map((l) => (
              <Link key={l.href} href={l.href} className="gx-nav-link">
                {l.label}
              </Link>
            ))}
          </div>
          <Dropdown label="Resources" links={resourceLinks} />
        </nav>

        <div className="gx-actions">
          {mounted && !loading && (
            <>
              {user ? (
                <div className="gx-profile" id="intro-user-menu">
                  <button
                    type="button"
                    className="gx-avatar-btn"
                    onClick={() => setProfileOpen((v) => !v)}
                    aria-expanded={profileOpen}
                    aria-label="Account menu"
                  >
                    <span className="gx-avatar">{name.charAt(0).toUpperCase()}</span>
                    <span className="gx-avatar-name">{name}</span>
                  </button>
                  {profileOpen && (
                    <>
                      <button
                        type="button"
                        className="gx-scrim"
                        aria-label="Close menu"
                        onClick={() => setProfileOpen(false)}
                      />
                      <div className="gx-profile-menu">
                        <Link href="/dashboard" onClick={close}>
                          <SquaresFour size={18} aria-hidden="true" />
                          Dashboard
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" onClick={close}>
                            <ShieldCheck size={18} aria-hidden="true" />
                            Admin panel
                          </Link>
                        )}
                        {staffProfile && (
                          <Link href="/staff/crm" onClick={close}>
                            <ShieldCheck size={18} aria-hidden="true" />
                            Staff panel
                          </Link>
                        )}
                        <Link href="/properties/submit" onClick={close}>
                          <Plus size={18} aria-hidden="true" />
                          Submit a property
                        </Link>
                        <button type="button" onClick={handleLogout}>
                          <SignOut size={18} aria-hidden="true" />
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="gx-auth" id="intro-auth">
                  <Link href="/auth/login" className="gx-login">
                    Log in
                  </Link>
                  <Link href="/auth/signup" className="gx-btn gx-btn-ink gx-btn-sm">
                    Sign up
                  </Link>
                </div>
              )}
            </>
          )}

          <button
            type="button"
            className="gx-burger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="gx-sheet">
          <p className="gx-sheet-label">Properties</p>
          {propertyLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={close}>
              {l.label}
            </Link>
          ))}
          <p className="gx-sheet-label">Services</p>
          {serviceLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={close}>
              {l.label}
            </Link>
          ))}
          <p className="gx-sheet-label">Resources</p>
          {resourceLinks.map((l) => (
            <Link key={l.href} href={l.href} onClick={close}>
              {l.label}
            </Link>
          ))}

          <div className="gx-sheet-auth">
            {user ? (
              <>
                <Link href="/dashboard" onClick={close}>
                  Dashboard
                </Link>
                <Link href="/properties/submit" onClick={close}>
                  Submit a property
                </Link>
                <button type="button" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={close}>
                  Log in
                </Link>
                <Link href="/auth/signup" className="gx-btn gx-btn-orange" onClick={close}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
