import AdminLayout from "@/components/AdminLayout";
import { AdminAuthProvider } from "@/lib/admin-auth";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthProvider>
  );
}
