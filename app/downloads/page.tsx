"use client";

import { useEffect, useState } from "react";
import { supabase, Brochure } from "@/lib/supabase";
import { DownloadSimple, FileText } from "@phosphor-icons/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function DownloadsPage() {
  const [brochures, setBrochures] = useState<Brochure[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrochures() {
      try {
        const { data } = await supabase
          .from("brochures")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });

        if (data) setBrochures(data);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching brochures:", error);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBrochures();
  }, []);

  const handleDownload = async (brochure: Brochure) => {
    try {
      // 1. Open the file
      window.open(brochure.file_url, "_blank");

      // 2. Increment download count in background
      await supabase.rpc("increment_brochure_download", {
        row_id: brochure.id,
      });
      // Fallback update if RPC doesn't exist yet
      const { data } = await supabase
        .from("brochures")
        .select("download_count")
        .eq("id", brochure.id)
        .single();

      if (data) {
        await supabase
          .from("brochures")
          .update({ download_count: (data.download_count || 0) + 1 })
          .eq("id", brochure.id);
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error handling download:", error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <Header />

      <main className="gx-page">
        <section className="gx-page-head">
          <div className="gx-wrap">
            <h1 className="gx-display gx-page-title">Brochures and guides</h1>
            <p className="gx-lede">
              Project brochures and buying guides for Pune homes. Free to
              download, no sign-up needed.
            </p>
          </div>
        </section>

        <section className="gx-wrap gx-docs-section">
          {loading ? (
            <div className="gx-docs">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-56 w-full rounded-[20px]" />
              ))}
            </div>
          ) : brochures.length > 0 ? (
            <ul className="gx-docs">
              {brochures.map((brochure) => (
                <li key={brochure.id} className="gx-doc">
                  <span className="gx-doc-icon" aria-hidden="true">
                    <FileText size={28} weight="duotone" />
                  </span>
                  <h2>{brochure.title}</h2>
                  <p>
                    {brochure.description ||
                      "Download this document for details and specifications."}
                  </p>
                  <div className="gx-doc-foot">
                    <span>
                      PDF, {formatFileSize(brochure.file_size || 0)}
                      {brochure.download_count > 0 &&
                        `, ${brochure.download_count} downloads`}
                    </span>
                    <button
                      type="button"
                      className="gx-btn gx-btn-ink gx-btn-sm"
                      onClick={() => handleDownload(brochure)}
                    >
                      <DownloadSimple size={18} weight="bold" aria-hidden="true" />
                      Download
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="gx-empty">
              <span className="gx-doc-icon" aria-hidden="true">
                <FileText size={28} weight="duotone" />
              </span>
              <h2>Nothing to download yet</h2>
              <p>New brochures and guides are added regularly. Check back soon.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
