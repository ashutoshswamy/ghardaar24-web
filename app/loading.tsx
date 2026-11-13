import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Route-level fallback so navigations paint instantly instead of hanging
// on the server fetch. Individual routes can override with their own loading.tsx.
export default function Loading() {
  return (
    <>
      <Header />
      <main className="gx-wrap" style={{ padding: "calc(var(--header-offset) + 3rem) 1rem 3rem", minHeight: "70vh" }}>
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-5 w-1/3 mb-10" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[20px]" />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
