"use client";

import { AuthProvider } from "@/lib/auth";
import PropertyAuthGuard from "@/components/PropertyAuthGuard";

interface PropertyDetailsClientProps {
  children: React.ReactNode;
  propertyTitle: string;
  teaser?: React.ReactNode;
}

export default function PropertyDetailsClient({
  children,
  propertyTitle,
  teaser,
}: PropertyDetailsClientProps) {
  return (
    <AuthProvider>
      <PropertyAuthGuard propertyTitle={propertyTitle} teaser={teaser}>
        {children}
      </PropertyAuthGuard>
    </AuthProvider>
  );
}
