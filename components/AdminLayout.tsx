"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";
import Link from "next/link";
import Image from "next/image";
import {
  Building,
  MessageSquare,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Plus,
  Settings,
  User,
  Users,
  UserCog,
  CheckCircle,
  MapPin,
  Download,
  ClipboardList,
  Receipt,
  Eye,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/properties", icon: Building, label: "Properties" },
  { href: "/admin/properties/new", icon: Plus, label: "Add Property" },
  { href: "/admin/approvals", icon: CheckCircle, label: "Approvals" },
  { href: "/admin/locations", icon: MapPin, label: "Locations" },
  { href: "/admin/inquiries", icon: MessageSquare, label: "Inquiries" },
  { href: "/admin/leads", icon: User, label: "Leads" },
  { href: "/admin/crm", icon: Users, label: "CRM" },
  { href: "/admin/tasks", icon: ClipboardList, label: "Tasks" },
  { href: "/admin/site-visits", icon: Eye, label: "Site Visits" },
  { href: "/admin/staff", icon: UserCog, label: "Staff Management" },
  { href: "/admin/downloads", icon: Download, label: "Downloads" },
  { href: "/admin/invoice-generator", icon: Receipt, label: "Invoice Gen" },
  { href: "/admin/revenue", icon: TrendingUp, label: "Revenue" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, adminProfile, loading, signOut } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (loading) return;

    if (!user && pathname !== "/admin/login") {
      router.push("/admin/login");
      return;
    }
  }, [user, loading, router, pathname]);

  // Handle sidebar visibility on desktop
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="admin-loading" style={{ padding: '2rem', width: '100%' }}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname?.startsWith(href);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Header */}
      <motion.header
        className="admin-mobile-header"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex"
        >
          <Button
            variant="ghost"
            size="icon"
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
        <span className="admin-brand flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="Ghardaar24"
            width={120}
            height={40}
            className="h-10 w-auto"
            style={{ height: "40px", width: "auto" }}
          />
        </span>
      </motion.header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/admin" className="sidebar-logo">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Image
                src="/logo2.png"
                alt="Ghardaar24"
                width={120}
                height={40}
                style={{ height: "40px", width: "auto" }}
              />
            </motion.div>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className={`sidebar-link ${
                  isActive(item.href) ? "active" : ""
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Admin Info */}
          {adminProfile && (
            <motion.div
              className="sidebar-admin-info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Avatar className="sidebar-admin-avatar after:hidden">
                {adminProfile.profile_picture_url ? (
                  <AvatarImage
                    src={adminProfile.profile_picture_url}
                    alt={adminProfile.name || "Admin"}
                    className="sidebar-admin-avatar-img"
                  />
                ) : (
                  <AvatarFallback className="bg-transparent">
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="sidebar-admin-details">
                <span className="sidebar-admin-name">
                  {adminProfile.name || "Admin"}
                </span>
                <span className="sidebar-admin-email">
                  {adminProfile.email}
                </span>
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              className="sidebar-link justify-start"
              nativeButton={false}
              render={<Link href="/" target="_blank" />}
            >
              <Settings className="w-5 h-5" />
              <span>View Site</span>
            </Button>
          </motion.div>
          <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
            <Button
              variant="ghost"
              onClick={signOut}
              className="sidebar-link logout justify-start"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </Button>
          </motion.div>
        </div>
      </aside>

      {/* Overlay - only show on mobile */}
      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        className="admin-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
