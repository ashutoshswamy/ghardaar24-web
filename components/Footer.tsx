import Link from "next/link";
import Image from "next/image";
import { PUNE_AREAS } from "@/lib/areas";
import {
  InstagramLogo,
  FacebookLogo,
  YoutubeLogo,
  Phone,
  EnvelopeSimple,
  MapPin,
} from "@phosphor-icons/react/dist/ssr";

const areaLinks = PUNE_AREAS.map((a) => ({ href: `/pune/${a.slug}`, label: a.name }));

const linkGroups = [
  {
    title: "Explore",
    links: [
      { href: "/properties", label: "All properties" },
      { href: "/properties?listing_type=sale", label: "Buy property" },
      { href: "/properties?listing_type=rent", label: "Rent property" },
      { href: "/calculators", label: "Calculators" },
      { href: "/real-estate-guide", label: "Real estate guide" },
      { href: "/downloads", label: "Downloads" },
    ],
  },
  {
    title: "Property types",
    links: [
      { href: "/properties?property_type=apartment", label: "Apartments" },
      { href: "/properties?property_type=house", label: "Houses" },
      { href: "/properties?property_type=villa", label: "Villas" },
      { href: "/properties?property_type=plot", label: "Plots" },
      { href: "/properties?property_type=commercial", label: "Commercial" },
    ],
  },
  {
    title: "Areas in Pune",
    links: areaLinks,
  },
  {
    title: "Services",
    links: [
      { href: "/services/home-loans", label: "Home loans" },
      { href: "/services/interior-design", label: "Interior design" },
      { href: "/services/vastu-consultation", label: "Vastu consultation" },
    ],
  },
];

const socials = [
  { href: "https://www.instagram.com/ghardaar24", label: "Instagram", icon: InstagramLogo },
  { href: "https://www.facebook.com/share/1BsxSR87Pm/?mibextid=wwXIfr", label: "Facebook", icon: FacebookLogo },
  { href: "https://www.youtube.com/channel/UCGZv7IVyfV61fH_mq1O4WHQ", label: "YouTube", icon: YoutubeLogo },
];

export default function Footer() {
  return (
    <footer className="gx-footer">
      <div className="gx-wrap">
        <div className="gx-footer-top">
          <div className="gx-footer-brand">
            <Link href="/" aria-label="Ghardaar24 home">
              <Image
                src="/logo3.png"
                alt="Ghardaar24"
                width={160}
                height={52}
                style={{ height: "48px", width: "auto" }}
              />
            </Link>
            <p>Verified homes to buy and rent in Pune, with zero brokerage.</p>
            <ul className="gx-footer-contact">
              <li>
                <a href="tel:+919673655631">
                  <Phone size={18} aria-hidden="true" /> +91 96736 55631
                </a>
              </li>
              <li>
                <a href="mailto:ghardaar24@gmail.com">
                  <EnvelopeSimple size={18} aria-hidden="true" /> ghardaar24@gmail.com
                </a>
              </li>
              <li>
                <address className="gx-footer-address">
                  <MapPin size={18} aria-hidden="true" />
                  Pancard Club Rd, Baner, Pune, Maharashtra 411069
                </address>
              </li>
            </ul>
          </div>

          <div className="gx-footer-links">
            {linkGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h4>{group.title}</h4>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="gx-footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Ghardaar24. RERA No. A31262500989
          </p>
          <ul className="gx-footer-social">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  <s.icon size={20} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p>
            Made by{" "}
            <a
              href="https://anahat-entertainment.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Anahat Entertainment
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
