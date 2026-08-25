import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetailsLoading() {
  return (
    <>
      <Header />
      <main className="property-details-page">
        <div className="container" style={{ padding: "2rem 1rem" }}>
          <Skeleton className="h-[400px] w-full rounded-xl mb-6" />
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
