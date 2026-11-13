import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

// Promises that come with every deal
const promises = [
  {
    title: "Verified before you visit",
    icon: "/whyghardaar24/verified.png",
    description: "Our team checks every listing in person before it goes live.",
  },
  {
    title: "Zero brokerage",
    icon: "/whyghardaar24/zerobrokerage.png",
    description: "You pay the property's price and nothing on top. No hidden charges.",
  },
  {
    title: "Quick possession",
    icon: "/whyghardaar24/quickpossession.png",
    description: "We handle the documentation, so handover is fast and hassle-free.",
  },
];

// Optional services, each with its own page
const services = [
  {
    title: "Home loans",
    description: "Compare rates from our banking partners.",
    href: "/services/home-loans",
  },
  {
    title: "Interior design",
    description: "Plan and furnish your new home with our designers.",
    href: "/services/interior-design",
  },
  {
    title: "Vastu consultation",
    description: "Expert guidance on layout and orientation.",
    href: "/services/vastu-consultation",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="gx-why">
      <div className="gx-wrap">
        <div className="gx-why-grid">
          <div className="gx-why-lead">
            <h2 className="gx-h2">
              Buying a home, <span>without the runaround.</span>
            </h2>
            <p>
              One agent from the first visit to the keys in your hand. No
              middlemen and no surprise charges.
            </p>
          </div>

          <ul className="gx-promises">
            {promises.map((p) => (
              <li key={p.title}>
                <span className="gx-arch gx-arch-sm">
                  <Image src={p.icon} alt="" width={160} height={160} />
                </span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="gx-services">
          <h3 className="gx-services-title">When you need more</h3>
          <ul>
            {services.map((s) => (
              <li key={s.href}>
                <Link href={s.href}>
                  <strong>{s.title}</strong>
                  <span>{s.description}</span>
                  <ArrowUpRight size={28} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
