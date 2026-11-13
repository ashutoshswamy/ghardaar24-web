import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { supabase, Property, PUBLIC_PROPERTY_COLUMNS } from "@/lib/supabase";
import { PUNE_AREAS, getArea } from "@/lib/areas";
import siteConfig, { jsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return PUNE_AREAS.map((a) => ({ area: a.slug }));
}

async function getAreaProperties(name: string): Promise<Property[]> {
  const { data } = await supabase
    .from("properties")
    .select(PUBLIC_PROPERTY_COLUMNS)
    .ilike("area", `%${name}%`)
    .or("approval_status.eq.approved,approval_status.is.null")
    .order("created_at", { ascending: false })
    .limit(24);
  return (data as unknown as Property[]) || [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ area: string }>;
}): Promise<Metadata> {
  const { area: slug } = await params;
  const area = getArea(slug);
  if (!area) return { title: "Area not found" };
  const properties = await getAreaProperties(area.name);
  const title = `Flats and Properties in ${area.name}, Pune | Zero Brokerage`;
  const description = `Browse verified flats, houses and villas for sale and rent in ${area.name}, Pune. Zero brokerage, listings checked by the Ghardaar24 team.`;
  return {
    title,
    description,
    alternates: { canonical: `${siteConfig.url}/pune/${area.slug}` },
    openGraph: { title, description, url: `${siteConfig.url}/pune/${area.slug}` },
    // an empty page is thin content; keep it out of the index until it has listings
    robots: properties.length === 0 ? { index: false, follow: true } : undefined,
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ area: string }>;
}) {
  const { area: slug } = await params;
  const area = getArea(slug);
  if (!area) notFound();
  const properties = await getAreaProperties(area.name);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Properties", item: `${siteConfig.url}/properties` },
      { "@type": "ListItem", position: 3, name: `${area.name}, Pune`, item: `${siteConfig.url}/pune/${area.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumb) }}
      />
      <Header />
      <main className="gx-page">
        <section className="gx-page-head">
          <div className="gx-wrap">
            <nav className="plx-breadcrumb gx-crumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/properties">Properties</Link>
              <span aria-hidden="true">/</span>
              <span>{area.name}</span>
            </nav>
            <h1 className="gx-display gx-page-title">
              Properties in {area.name}, Pune
            </h1>
            <p className="gx-lede">
              {area.about} Every listing is checked by our team, and you pay no
              brokerage.
            </p>
          </div>
        </section>

        <section className="gx-wrap gx-docs-section">
          {properties.length > 0 ? (
            <div className="properties-grid">
              {properties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="gx-empty">
              <h2>No listings in {area.name} right now</h2>
              <p>New homes are added often. Browse all of Pune or ask us to find one for you.</p>
              <Link href="/properties" className="gx-btn gx-btn-orange">
                Browse all properties
              </Link>
            </div>
          )}

          <nav className="gx-areas gx-areas-more" aria-label="Other areas in Pune">
            <span className="gx-areas-label">Other areas</span>
            {PUNE_AREAS.filter((a) => a.slug !== area.slug).map((a) => (
              <li key={a.slug} style={{ listStyle: "none" }}>
                <Link href={`/pune/${a.slug}`}>{a.name}</Link>
              </li>
            ))}
          </nav>
        </section>
      </main>
      <Footer />
    </>
  );
}
