"use client";

import { useStaffAuth } from "@/lib/staff-auth";
import { motion } from "@/lib/motion";
import { User, Printer, IdCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffIdCardPage() {
  const { staffProfile, loading } = useStaffAuth();

  if (loading) {
    return (
      <div className="admin-page">
        <Skeleton className="h-8 w-56 mb-6" />
        <Skeleton className="h-64 w-full max-w-sm" />
      </div>
    );
  }

  if (!staffProfile) return null;

  if (!staffProfile.id_card_issued_at) {
    return (
      <div className="admin-page">
        <div style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}>
          <IdCard className="w-10 h-10 mx-auto mb-3" style={{ color: "#9ca3af" }} />
          <p>Your ID card hasn&apos;t been generated yet. Please contact your admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <div>
          <h1>My ID Card</h1>
          <p>Your official Ghardaar24 employee ID</p>
        </div>
        <Button onClick={() => window.print()} className="btn-admin-primary print-hide">
          <Printer className="w-4 h-4" />
          Print
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: "22rem",
          maxWidth: "100%",
          borderRadius: "1rem",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          background: "#fff",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, var(--primary, #f36a2a) 0%, #c2410c 100%)",
            padding: "1.25rem 1.5rem",
            color: "#fff",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "0.02em" }}>GHARDAAR24</div>
          <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>Employee Identity Card</div>
        </div>

        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
          <Avatar style={{ width: "5.5rem", height: "5.5rem", border: "3px solid #f3f4f6" }}>
            {staffProfile.profile_picture_url ? (
              <AvatarImage src={staffProfile.profile_picture_url} alt={staffProfile.name} />
            ) : (
              <AvatarFallback>
                <User className="w-8 h-8" style={{ color: "#9ca3af" }} />
              </AvatarFallback>
            )}
          </Avatar>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: "1.125rem", color: "#111827" }}>{staffProfile.name}</div>
            {staffProfile.designation && (
              <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{staffProfile.designation}</div>
            )}
          </div>

          <div style={{ width: "100%", borderTop: "1px dashed #e5e7eb", margin: "0.25rem 0" }} />

          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.8125rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>Employee ID</span>
              <span style={{ fontWeight: 600, color: "#374151" }}>{staffProfile.employee_code || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>Email</span>
              <span style={{ fontWeight: 600, color: "#374151" }}>{staffProfile.email}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#9ca3af" }}>Issued On</span>
              <span style={{ fontWeight: 600, color: "#374151" }}>
                {new Date(staffProfile.id_card_issued_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0.75rem 1.5rem", background: "#f9fafb", fontSize: "0.6875rem", color: "#9ca3af", textAlign: "center" }}>
          This card is the property of Ghardaar24. If found, please return to the nearest office.
        </div>
      </motion.div>
    </div>
  );
}
