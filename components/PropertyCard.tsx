"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Ruler } from "@phosphor-icons/react";
import { Property } from "@/lib/supabase";
import { formatPrice, formatPriceRange } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";

interface PropertyCardProps {
  property: Property;
  index?: number;
  /** "lead" renders the large spotlight variant used on the home page */
  variant?: "default" | "lead";
  className?: string;
}

const LISTING_LABEL: Record<string, string> = {
  sale: "For sale",
  resale: "Resale",
  rent: "For rent",
};

export default function PropertyCard({
  property,
  index = 0,
  variant = "default",
  className = "",
}: PropertyCardProps) {
  const reduce = useReducedMotion();
  const mainImage = property.images?.[0] || "/placeholder-property.svg";
  const listing = LISTING_LABEL[property.listing_type] ?? "For sale";
  const price =
    property.min_price || property.max_price
      ? formatPriceRange(property.min_price, property.max_price)
      : formatPrice(property.price);

  return (
    <motion.div
      className={`gx-card-wrap ${className}`}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.06, 0.24),
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <Link
        href={`/properties/${property.id}`}
        className={`gx-card ${variant === "lead" ? "gx-card-lead" : ""}`}
      >
        <span className="gx-card-media">
          <Image
            src={mainImage}
            alt={property.title}
            fill
            sizes={
              variant === "lead"
                ? "(max-width: 768px) 100vw, 50vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            className="gx-card-img"
            loading={index < 3 ? "eager" : "lazy"}
          />
        </span>

        <span className="gx-card-body">
          <span className="gx-card-meta">
            {listing}
            {property.featured && <strong>Featured</strong>}
          </span>
          <span className="gx-card-price">
            {price}
            {property.listing_type === "rent" && <small>/mo</small>}
          </span>
          <span className="gx-card-title">{property.title}</span>
          <span className="gx-card-foot">
            <span>
              <MapPin size={16} aria-hidden="true" />
              {property.area}
            </span>
            {property.carpet_area && (
              <span>
                <Ruler size={16} aria-hidden="true" />
                {property.carpet_area}
              </span>
            )}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
