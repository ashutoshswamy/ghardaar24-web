import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Shared header for every admin + staff page: title,
// one-line description, optional back link and actions on the right.
export default function PageHeader({
  title,
  description,
  back,
  actions,
}: {
  /** accepted for existing callers; not rendered */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}) {
  return (
    <header className="bo-head">
      {back && (
        <Link href={back.href} className="bo-back">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="bo-head-row">
        <div className="bo-head-copy">
          <h1 className="bo-title">{title}</h1>
          {description && <p className="bo-desc">{description}</p>}
        </div>
        {actions && <div className="bo-actions">{actions}</div>}
      </div>
    </header>
  );
}
