const facts = [
  { value: "₹0", label: "brokerage you pay" },
  { value: "500+", label: "properties listed" },
  { value: "10+", label: "years in Pune real estate" },
  { value: "100%", label: "listings verified" },
];

export default function TrustIndicators() {
  return (
    <section className="gx-facts" aria-label="Ghardaar24 at a glance">
      <ul className="gx-wrap gx-facts-list">
        {facts.map((f) => (
          <li key={f.label}>
            <strong>{f.value}</strong> {f.label}
          </li>
        ))}
      </ul>
    </section>
  );
}
