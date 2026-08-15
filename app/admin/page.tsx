"use client";

import { useEffect, useState, useRef } from "react";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  Building,
  MessageSquare,
  Plus,
  Eye,
  ArrowRight,
  Star,
  Clock,
  Camera,
  User,
  Mail,
  Loader2,
  CheckSquare,
  Users,
  ClipboardCheck,
  MapPin,
  UserCog,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalProperties: number;
  featuredProperties: number;
  totalInquiries: number;
  pendingApprovals: number;
  totalLeads: number;
  openTasks: number;
}

interface Inquiry {
  id: string;
  name: string;
  created_at: string;
  property_id: string;
}

interface RecentProperty {
  id: string;
  title: string;
  price: number;
  images: string[];
  created_at: string;
  approval_status?: string;
}

const statCards = [
  {
    key: "totalProperties",
    icon: Building,
    label: "Total Properties",
    accent: "#2563eb",
    bgLight: "#eff6ff",
    href: "/admin/properties",
  },
  {
    key: "featuredProperties",
    icon: Star,
    label: "Featured",
    accent: "#d97706",
    bgLight: "#fffbeb",
    href: "/admin/properties",
  },
  {
    key: "totalInquiries",
    icon: MessageSquare,
    label: "Total Inquiries",
    accent: "#16a34a",
    bgLight: "#f0fdf4",
    href: "/admin/inquiries",
  },
  {
    key: "pendingApprovals",
    icon: ClipboardCheck,
    label: "Pending Approvals",
    accent: "#e85f1f",
    bgLight: "#fff1e8",
    href: "/admin/approvals",
  },
  {
    key: "totalLeads",
    icon: Users,
    label: "Total Leads",
    accent: "#7e22ce",
    bgLight: "#faf5ff",
    href: "/admin/leads",
  },
  {
    key: "openTasks",
    icon: CheckSquare,
    label: "Open Tasks",
    accent: "#be185d",
    bgLight: "#fdf2f8",
    href: "/admin/tasks",
  },
];

const quickActions = [
  { label: "Add Property", icon: Plus, href: "/admin/properties/new" },
  { label: "Approvals", icon: ClipboardCheck, href: "/admin/approvals" },
  { label: "CRM", icon: Users, href: "/admin/crm" },
  { label: "Revenue", icon: TrendingUp, href: "/admin/revenue" },
  { label: "Staff", icon: UserCog, href: "/admin/staff" },
  { label: "Locations", icon: MapPin, href: "/admin/locations" },
  { label: "Tasks", icon: CheckSquare, href: "/admin/tasks" },
  { label: "Invoices", icon: FileSpreadsheet, href: "/admin/invoice-generator" },
];

export default function AdminDashboard() {
  const { adminProfile, refreshProfile } = useAdminAuth();
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    featuredProperties: 0,
    totalInquiries: 0,
    pendingApprovals: 0,
    totalLeads: 0,
    openTasks: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminProfile) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }

    setUploadingPicture(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `admin/${adminProfile.id}/profile.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("admins")
        .update({ profile_picture_url: urlWithCacheBust })
        .eq("id", adminProfile.id);

      if (updateError) throw updateError;

      await refreshProfile();
    } catch (error) {
      if (process.env.NODE_ENV === "development") console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingPicture(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [
          propertiesRes,
          featuredRes,
          inquiriesRes,
          inquiriesListRes,
          pendingApprovalsRes,
          leadsRes,
          openTasksRes,
          recentPropertiesRes,
        ] = await Promise.all([
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("featured", true),
          supabase
            .from("inquiries")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("inquiries")
            .select("id, name, created_at, property_id")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("properties")
            .select("id", { count: "exact", head: true })
            .eq("approval_status", "pending"),
          supabase
            .from("user_profiles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("staff_tasks")
            .select("id", { count: "exact", head: true })
            .neq("status", "completed"),
          supabase
            .from("properties")
            .select("id, title, price, images, created_at, approval_status")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setStats({
          totalProperties: propertiesRes.count || 0,
          featuredProperties: featuredRes.count || 0,
          totalInquiries: inquiriesRes.count || 0,
          pendingApprovals: pendingApprovalsRes.count || 0,
          totalLeads: leadsRes.count || 0,
          openTasks: openTasksRes.count || 0,
        });

        setRecentInquiries(inquiriesListRes.data || []);
        setRecentProperties(recentPropertiesRes.data || []);
      } catch (error) {
        if (process.env.NODE_ENV === "development") console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="space-y-6">
          <Skeleton className="h-8 w-56" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Profile Card */}
      {adminProfile && (
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="profile-card-left">
            <div
              className="profile-avatar-wrapper"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="profile-avatar-img w-20 h-20">
                <AvatarImage src={adminProfile.profile_picture_url || undefined} alt={adminProfile.name || "Admin"} />
                <AvatarFallback className="profile-avatar-placeholder">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="profile-avatar-overlay">
                {uploadingPicture ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: "none" }}
              />
            </div>
            <div className="profile-info">
              <h2 className="profile-name">{adminProfile.name || "Admin"}</h2>
              <div className="profile-detail">
                <Mail className="w-4 h-4" />
                <span>{adminProfile.email}</span>
              </div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Button className="dashboard-cta-btn" render={<Link href="/admin/properties/new" />}>
              <Plus className="w-5 h-5" />
              Add New Property
            </Button>
          </motion.div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        className="dashboard-metric-grid"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.key}
            variants={fadeInUp}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.2 }}
          >
            <Link href={stat.href} className="block">
              <Card
                className="dashboard-metric-card"
                style={
                  {
                    "--metric-accent": stat.accent,
                    "--metric-bg": stat.bgLight,
                  } as React.CSSProperties
                }
              >
                <div className="dashboard-metric-icon">
                  <stat.icon className="w-5 h-5" />
                </div>
                <motion.span
                  className="dashboard-metric-value"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                >
                  {stats[stat.key as keyof Stats]}
                </motion.span>
                <span className="dashboard-metric-label">{stat.label}</span>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Quick Actions</h2>
          </div>
          <div className="dashboard-quick-actions-grid">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="dashboard-quick-action">
                <action.icon className="w-5 h-5" />
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Inquiries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
        <Card className="dashboard-section dashboard-inquiries-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="dashboard-view-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentInquiries.length > 0 ? (
            <div className="dashboard-inquiries-list">
              {recentInquiries.map((inquiry, index) => (
                <motion.div
                  key={inquiry.id}
                  className="dashboard-inquiry-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + index * 0.05 }}
                >
                  <div className="dashboard-inquiry-avatar">
                    {inquiry.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="dashboard-inquiry-info">
                    <span className="dashboard-inquiry-name">
                      {inquiry.name}
                    </span>
                    <span className="dashboard-inquiry-time">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(inquiry.created_at)}
                    </span>
                  </div>
                  <Link
                    href="/admin/inquiries"
                    className="dashboard-inquiry-action"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state small">
              <MessageSquare className="w-8 h-8" />
              <p>No inquiries yet</p>
            </div>
          )}
        </Card>
        </motion.div>

        {/* Recent Properties */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
        <Card className="dashboard-section dashboard-inquiries-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Recent Properties</h2>
            <Link href="/admin/properties" className="dashboard-view-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentProperties.length > 0 ? (
            <div className="dashboard-inquiries-list">
              {recentProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  className="dashboard-inquiry-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  <div className="dashboard-inquiry-avatar" style={{ overflow: "hidden", padding: 0 }}>
                    {property.images?.[0] ? (
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <Building className="w-4 h-4" />
                    )}
                  </div>
                  <div className="dashboard-inquiry-info">
                    <span className="dashboard-inquiry-name">
                      {property.title}
                    </span>
                    <span className="dashboard-inquiry-time">
                      {formatPrice(property.price)} · {formatTimeAgo(property.created_at)}
                    </span>
                  </div>
                  <Link
                    href={`/admin/properties/${property.id}`}
                    className="dashboard-inquiry-action"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty-state small">
              <Building className="w-8 h-8" />
              <p>No properties yet</p>
            </div>
          )}
        </Card>
        </motion.div>
      </div>
    </div>
  );
}
