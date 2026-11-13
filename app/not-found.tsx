import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="gx-page">
        <section className="gx-page-head gx-nf">
          <div className="gx-wrap gx-nf-grid">
            <div>
              <p className="gx-nf-code" aria-hidden="true">404</p>
              <h1 className="gx-display gx-page-title">
                Wrong door. <span>Let&apos;s get you home.</span>
              </h1>
              <p className="gx-lede">
                This page doesn&apos;t exist or has moved. If you followed a link
                to a listing, it may have been sold or taken down.
              </p>
              <div className="gx-hero-cta">
                <Link href="/properties" className="gx-btn gx-btn-orange">
                  <MagnifyingGlass size={20} weight="bold" aria-hidden="true" />
                  Browse properties
                </Link>
                <Link href="/" className="gx-btn gx-btn-line">
                  Back to home
                  <ArrowRight size={20} weight="bold" aria-hidden="true" />
                </Link>
              </div>
              <ul className="gx-areas" aria-label="Popular areas">
                <li className="gx-areas-label">Or start with an area</li>
                {["Baner", "Wakad", "Hinjewadi", "Kharadi", "Hadapsar"].map((area) => (
                  <li key={area}>
                    <Link href={`/properties?search=${area}`}>{area}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="gx-hero-art gx-nf-art">
              <span className="gx-hero-arch-back" aria-hidden="true" />
              <span className="gx-arch gx-arch-hero">
                <Image
                  src="/404.png"
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 30vw, 70vw"
                  style={{ objectFit: "contain", padding: "10% 6% 6%" }}
                />
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
