"use client";

import { useState } from "react";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Palette,
  Sofa,
  Lightbulb,
  Phone,
  ArrowRight,
  CheckCircle,
  Bed,
  UtensilsCrossed,
  Bath,
  Tv,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsultationFormModal from "@/components/ConsultationFormModal";

const services = [
  {
    icon: Sofa,
    title: "Living Room Design",
    description:
      "Create a stunning living space that's perfect for entertaining guests and relaxing with family. Modern sofas, accent pieces, and curated décor.",
  },
  {
    icon: Bed,
    title: "Bedroom Interiors",
    description:
      "Transform your bedroom into a luxurious retreat with custom wardrobes, elegant beds, ambient lighting, and calming color schemes.",
  },
  {
    icon: UtensilsCrossed,
    title: "Modular Kitchen",
    description:
      "Functional and stylish modular kitchens with smart storage, premium fittings, and designs that make cooking a joy.",
  },
  {
    icon: Bath,
    title: "Bathroom Design",
    description:
      "Spa-like bathrooms with quality tiles, modern fittings, vanities, and smart storage solutions.",
  },
  {
    icon: Tv,
    title: "Entertainment Units",
    description:
      "Custom TV units, home theaters, and entertainment centers designed for your viewing pleasure.",
  },
  {
    icon: Lightbulb,
    title: "Lighting Design",
    description:
      "Create the perfect ambiance with layered lighting - accent, task, and ambient lights for every room.",
  },
];

const designStyles = [
  {
    name: "Contemporary",
    description: "Clean lines, neutral colors, open spaces",
    swatch: "#d8cfc0",
    text: "#2a2420",
  },
  {
    name: "Minimalist",
    description: "Less is more - simple, functional, clutter-free",
    swatch: "#eee7db",
    text: "#2a2420",
  },
  {
    name: "Traditional Indian",
    description: "Rich colors, wooden elements, cultural motifs",
    swatch: "#9a5230",
    text: "#f6efe6",
  },
  {
    name: "Modern Luxury",
    description: "Premium materials, statement pieces, sophisticated",
    swatch: "#2a2420",
    text: "#f6efe6",
  },
  {
    name: "Scandinavian",
    description: "Light woods, whites, cozy textiles, functional",
    swatch: "#c9ba9c",
    text: "#2a2420",
  },
  {
    name: "Industrial",
    description: "Raw textures, exposed elements, urban chic",
    swatch: "#6b6459",
    text: "#f6efe6",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Free Consultation",
    description:
      "Meet our designers to discuss your vision, preferences, budget, and timeline. We visit your space to understand it better.",
  },
  {
    step: "02",
    title: "Design Concept",
    description:
      "Receive detailed 3D renders and mood boards. Visualize your space before any work begins. Unlimited revisions until you're satisfied.",
  },
  {
    step: "03",
    title: "Material Selection",
    description:
      "Choose from curated premium materials, finishes, and products. We guide you through options that fit your budget.",
  },
  {
    step: "04",
    title: "Execution",
    description:
      "Our skilled craftsmen bring the design to life. Regular updates and quality checks at every stage.",
  },
  {
    step: "05",
    title: "Quality Assurance",
    description:
      "Rigorous quality checks before handover. We ensure every detail meets our high standards.",
  },
  {
    step: "06",
    title: "Handover & Support",
    description:
      "Final walkthrough and handover. 1-year warranty on all work with dedicated after-sales support.",
  },
];

const features = [
  "Customized designs tailored to your lifestyle",
  "End-to-end project management",
  "Premium quality materials and finishes",
  "Transparent pricing with no hidden costs",
  "On-time project delivery guaranteed",
  "1-year warranty on all work",
  "Dedicated project manager",
  "Post-completion support",
];

export default function InteriorDesignPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="service-page id-page">
        {/* Hero Section */}
        <section className="id-hero">
          <div className="container id-hero-inner">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="id-eyebrow">
                <Palette className="w-4 h-4" /> Interior design, end to end
              </span>
              <h1 className="id-hero-title">
                <span className="id-hero-title-line1">A home that</span>
                <span className="id-hero-title-line2">finally looks like you.</span>
              </h1>
              <p className="id-hero-subtitle">
                Our designers pair your taste with a plan we can actually
                build &mdash; mood boards, material lists, and a crew that
                shows up. From first sketch to final walkthrough.
              </p>
              <div className="id-hero-cta">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="id-btn-primary"
                >
                  Get Free Quote
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link href="/properties" className="id-btn-ghost">
                  Find Your Home First
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Material Filmstrip — the signature element */}
        <section className="id-filmstrip-section">
          <div className="container">
            <motion.div
              className="id-filmstrip"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {designStyles.map((style, i) => (
                <motion.div
                  key={style.name}
                  className="id-swatch"
                  variants={fadeInUp}
                  style={{ background: style.swatch, color: style.text }}
                >
                  <span className="id-swatch-hole" />
                  <span className="id-swatch-index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="id-swatch-name">{style.name}</span>
                  <span className="id-swatch-desc">{style.description}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Services Section */}
        <section className="service-benefits">
          <div className="container">
            <motion.div
              className="section-header section-header-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label">Our Expertise</span>
              <h2 className="section-title-new">
                Complete Home Interior Solutions
              </h2>
              <p className="section-subtitle">
                From living rooms to bathrooms, we design every corner of your
                home with equal care and attention
              </p>
            </motion.div>

            <motion.div
              className="service-benefits-grid extended"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {services.map((service) => (
                <motion.div
                  key={service.title}
                  className="service-benefit-card"
                  variants={fadeInUp}
                >
                  <div className="service-benefit-icon">
                    <service.icon className="w-6 h-6" />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section className="service-process hlw-section">
          <div className="container">
            <motion.div
              className="section-header section-header-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label">Our Process</span>
              <h2 className="section-title-new">How We Work</h2>
              <p className="section-subtitle">
                A transparent, step-by-step approach to bring your vision to
                life
              </p>
            </motion.div>

            <motion.div
              className="hlw-track"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {processSteps.map((item, i) => {
                const isLast = i === processSteps.length - 1;
                return (
                  <motion.div
                    key={item.step}
                    className={`hlw-card${isLast ? " hlw-card--stamped" : ""}`}
                    variants={fadeInUp}
                  >
                    <span className="hlw-number">{item.step}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Features List */}
        <section className="service-features-list">
          <div className="container">
            <motion.div
              className="features-list-content"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2>Why Choose Ghardaar24 Interior Design?</h2>
              <div className="features-checklist">
                {features.map((feature) => (
                  <div key={feature} className="feature-check-item">
                    <CheckCircle className="w-5 h-5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="service-contact">
          <div className="container">
            <motion.div
              className="service-contact-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="service-contact-content">
                <h2>Ready to Transform Your Space?</h2>
                <p>
                  Get a free consultation with our interior design experts.
                  We&apos;ll visit your home, understand your requirements, and
                  provide a detailed quote - all at no cost. Let&apos;s bring
                  your vision to life.
                </p>
              </div>
              <div className="service-contact-cta">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary"
                >
                  Get Free Consultation
                </button>
                <a href="tel:+919673655631" className="btn-secondary">
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Consultation Form Modal */}
      <ConsultationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="interior_design"
      />
    </>
  );
}

