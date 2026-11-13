import { supabase } from "@/lib/supabase";
import { MetadataRoute } from "next";
import { PUNE_AREAS } from "@/lib/areas";

const BASE_URL = "https://ghardaar24.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/properties`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calculators`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/real-estate-guide`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/downloads`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // Service pages
    {
      url: `${BASE_URL}/services/interior-design`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services/home-loans`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services/vastu-consultation`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const areaPages: MetadataRoute.Sitemap = PUNE_AREAS.map((a) => ({
    url: `${BASE_URL}/pune/${a.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Dynamic property pages
  const { data: properties } = await supabase
    .from("properties")
    .select("id, updated_at")
    .eq("status", "active")
    // pending / rejected user submissions must not be indexed
    .or("approval_status.eq.approved,approval_status.is.null");

  const propertyPages: MetadataRoute.Sitemap = (properties || []).map(
    (property) => ({
      url: `${BASE_URL}/properties/${property.id}`,
      lastModified: new Date(property.updated_at || new Date()),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  return [...staticPages, ...areaPages, ...propertyPages];
}
