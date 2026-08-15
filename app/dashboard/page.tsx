"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, Property } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

type StatusTab = "all" | "pending" | "approved" | "rejected";

export default function DashboardPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login?redirect=/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.id) {
      fetchUserProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function fetchUserProperties() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("submitted_by", user?.id)
        .order("submission_date", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching properties:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredProperties =
    activeTab === "all"
      ? properties
      : properties.filter((p) => p.approval_status === activeTab);

  const statusCounts = {
    all: properties.length,
    pending: properties.filter((p) => p.approval_status === "pending").length,
    approved: properties.filter((p) => p.approval_status === "approved").length,
    rejected: properties.filter((p) => p.approval_status === "rejected").length,
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="dashboard-status-badge pending"
          >
            <Clock className="w-3 h-3" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="default" className="dashboard-status-badge approved">
            <CheckCircle className="w-3 h-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="dashboard-status-badge rejected"
          >
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-properties-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="dashboard-property-card h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dashboard-header-content">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-2 px-0 hover:bg-transparent h-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </Button>
            <h1>My Dashboard</h1>
            <p>Welcome back, {userProfile?.name || "User"}!</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              render={<Link href="/properties/submit" />}
              className="dashboard-submit-btn h-auto"
            >
              <Plus className="w-5 h-5" />
              Submit New Property
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        className="dashboard-stats"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="dashboard-stat-card">
          <Building2 className="w-8 h-8" />
          <div>
            <span className="stat-value">{statusCounts.all}</span>
            <span className="stat-label">Total Submissions</span>
          </div>
        </Card>
        <Card className="dashboard-stat-card pending">
          <Clock className="w-8 h-8" />
          <div>
            <span className="stat-value">{statusCounts.pending}</span>
            <span className="stat-label">Pending Review</span>
          </div>
        </Card>
        <Card className="dashboard-stat-card approved">
          <CheckCircle className="w-8 h-8" />
          <div>
            <span className="stat-value">{statusCounts.approved}</span>
            <span className="stat-label">Approved</span>
          </div>
        </Card>
        <Card className="dashboard-stat-card rejected">
          <XCircle className="w-8 h-8" />
          <div>
            <span className="stat-value">{statusCounts.rejected}</span>
            <span className="stat-label">Rejected</span>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as StatusTab)}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <TabsList className="dashboard-tabs h-auto bg-transparent p-0">
            <TabsTrigger
              value="all"
              className={`dashboard-tab h-auto ${
                activeTab === "all" ? "active" : ""
              }`}
            >
              All ({statusCounts.all})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className={`dashboard-tab h-auto ${
                activeTab === "pending" ? "active" : ""
              }`}
            >
              <Clock className="w-4 h-4" />
              Pending ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className={`dashboard-tab h-auto ${
                activeTab === "approved" ? "active" : ""
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Approved ({statusCounts.approved})
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className={`dashboard-tab h-auto ${
                activeTab === "rejected" ? "active" : ""
              }`}
            >
              <XCircle className="w-4 h-4" />
              Rejected ({statusCounts.rejected})
            </TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value={activeTab}>
      {/* Properties List */}
      {loading ? (
        <div className="dashboard-properties-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="dashboard-property-card h-72 w-full" />
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <motion.div
          className="dashboard-properties-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence>
            {filteredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="dashboard-property-card">
                <div className="dashboard-property-image">
                  {property.images?.[0] ? (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="dashboard-property-placeholder">
                      <Building2 className="w-10 h-10" />
                    </div>
                  )}
                  {getStatusBadge(property.approval_status)}
                  <Badge
                    variant="secondary"
                    className={`dashboard-listing-badge ${property.listing_type}`}
                  >
                    {property.listing_type === "rent" ? "For Rent" : "Resale"}
                  </Badge>
                </div>

                <div className="dashboard-property-content">
                  <h3 className="dashboard-property-title">{property.title}</h3>

                  <div className="dashboard-property-location">
                    <MapPin className="w-4 h-4" />
                    <span>{property.area}</span>
                  </div>

                  <p className="dashboard-property-price">
                    {formatPrice(property.price)}
                  </p>

                  <div className="dashboard-property-meta">
                    <span className="capitalize">{property.property_type}</span>
                    {property.carpet_area && (
                      <span>{property.carpet_area}</span>
                    )}
                  </div>

                  {property.submission_date && (
                    <div className="dashboard-property-date">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Submitted{" "}
                        {new Date(
                          property.submission_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {property.rejection_reason &&
                    property.approval_status === "rejected" && (
                      <div className="dashboard-rejection-reason">
                        <AlertTriangle className="w-4 h-4" />
                        <div>
                          <strong>Rejection Reason:</strong>
                          <p>{property.rejection_reason}</p>
                        </div>
                      </div>
                    )}

                  {property.approval_status === "approved" && (
                    <div className="dashboard-property-actions">
                      <Button
                        render={<Link href={`/properties/${property.id}`} />}
                        className="dashboard-view-btn h-auto w-full"
                      >
                        View Listing
                      </Button>
                    </div>
                  )}
                </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          className="dashboard-empty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Building2 className="w-16 h-16" />
          <h3>
            {activeTab === "all"
              ? "No Properties Submitted Yet"
              : `No ${activeTab} Properties`}
          </h3>
          <p>
            {activeTab === "all"
              ? "Start by submitting your first property for listing."
              : `You don't have any ${activeTab} properties.`}
          </p>
          <Button
            render={<Link href="/properties/submit" />}
            className="dashboard-empty-btn h-auto"
          >
            Submit Your First Property
          </Button>
        </motion.div>
      )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
