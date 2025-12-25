import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Ghardaar24",
  description:
    "Create your Ghardaar24 account to explore premium properties in Pune",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
