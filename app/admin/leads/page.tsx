"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { motion } from "@/lib/motion";
import { Search, Download, User, Mail, Phone, Calendar } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export default function LeadsPage() {
  const { user, loading } = useAdminAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setProfiles(data || []);
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const filteredProfiles = profiles.filter(
    (profile) =>
      profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.phone?.includes(searchTerm)
  );

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Registered Date"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filteredProfiles.map((p) =>
          [
            `"${p.name}"`,
            `"${p.email}"`,
            `"${p.phone}"`,
            `"${new Date(p.created_at).toLocaleDateString()}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || isLoading) {
    return (
      <div className="admin-page">
        <motion.div
          className="admin-loading-inline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Loading leads...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <motion.div
        className="admin-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1>Leads</h1>
          <p>View and manage registered user profiles</p>
        </div>
        <motion.button
          onClick={exportToCSV}
          className="btn-admin-export"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </motion.button>
      </motion.div>

      {/* Stats and Search */}
      <motion.div
        className="leads-stats-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="leads-stat-card">
          <div className="leads-stat-icon">
            <User className="w-6 h-6" />
          </div>
          <div className="leads-stat-info">
            <span className="leads-stat-label">Total Leads</span>
            <span className="leads-stat-value">{profiles.length}</span>
          </div>
        </div>

        <div className="admin-search leads-search">
          <Search className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Mobile Card View & Desktop Table */}
      <motion.div
        className="admin-section-card leads-table-section"
        style={{ padding: 0 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Desktop Table */}
        <div className="admin-table-container leads-table-desktop">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.length > 0 ? (
                filteredProfiles.map((profile, index) => (
                  <motion.tr
                    key={profile.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                  >
                    <td className="table-property-title">
                      {profile.name || "N/A"}
                    </td>
                    <td>{profile.email}</td>
                    <td>{profile.phone || "N/A"}</td>
                    <td>
                      {new Date(profile.created_at).toLocaleDateString(
                        "en-IN",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-state-small">
                    No leads found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="leads-cards-mobile">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile, index) => (
              <motion.div
                key={profile.id}
                className="lead-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="lead-card-header">
                  <div className="lead-avatar">
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="lead-name-wrapper">
                    <span className="lead-name">{profile.name || "N/A"}</span>
                    <span className="lead-date">
                      <Calendar className="w-3 h-3" />
                      {new Date(profile.created_at).toLocaleDateString(
                        "en-IN",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </span>
                  </div>
                </div>
                <div className="lead-card-details">
                  <a href={`mailto:${profile.email}`} className="lead-contact">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </a>
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="lead-contact">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="empty-state-admin">
              <User className="w-12 h-12" />
              <p>No leads found matching your search.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
