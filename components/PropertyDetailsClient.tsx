"use client";

import { AuthProvider } from "@/lib/auth";
import PropertyAuthGuard from "@/components/PropertyAuthGuard";

interface PropertyDetailsClientProps {
  children: React.ReactNode;
  propertyTitle: string;
}

export default function PropertyDetailsClient({
  children,
  propertyTitle,
}: PropertyDetailsClientProps) {
  return (
    <AuthProvider>
      <PropertyAuthGuard propertyTitle={propertyTitle}>
        {children}
      </PropertyAuthGuard>
    </AuthProvider>
  );
}
