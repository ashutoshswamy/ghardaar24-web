"use client";

import InvoiceGenerator from "@/components/admin/InvoiceGenerator";
import { useStaffAuth } from "@/lib/staff-auth";
import { Card, CardContent } from "@/components/ui/card";

export default function StaffInvoiceGeneratorPage() {
  const { staffProfile } = useStaffAuth();

  if (!staffProfile?.can_generate_invoices) {
    return (
      <Card className="m-8">
        <CardContent className="text-center py-8">
          <h2 className="text-xl font-semibold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground mt-2">You do not have permission to generate invoices.</p>
        </CardContent>
      </Card>
    );
  }

  return <InvoiceGenerator userId={staffProfile.id} userName={staffProfile.name} />;
}
