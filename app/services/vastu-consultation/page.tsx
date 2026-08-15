
"use client";

import { useState } from "react";
import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import {
  Compass,
  Home,
  Building2,
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle,
  Sun,
  Wind,
  Droplets,
  Flame,
  Mountain,
  Star,
  Shield,
  TrendingUp,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConsultationFormModal from "@/components/ConsultationFormModal";

const services = [
  {
    icon: Home,
    title: "Residential Vastu",
    description:
      "Complete Vastu analysis for your home including room placements, entrance direction, kitchen positioning, and bedroom layouts for positive energy flow.",
  },
  {
    icon: Building2,
    title: "Commercial Vastu",
    description:
      "Optimize your office, shop, or business premises with Vastu principles to enhance productivity, attract prosperity, and create a harmonious work environment.",
  },
  {
    icon: Compass,
    title: "Plot Selection",
    description:
      "Guidance on selecting the right plot based on Vastu principles including shape, direction, slope, and surrounding environment analysis.",
  },
  {
    icon: Sparkles,
    title: "Vastu Remedies",
    description:
      "Practical, non-demolition remedies to correct Vastu defects in existing properties using colors, mirrors, plants, and energy balancing techniques.",
  },
  {
    icon: TrendingUp,
    title: "Industrial Vastu",
    description:
      "Specialized Vastu consultation for factories, warehouses, and industrial units to improve efficiency, reduce accidents, and boost growth.",
  },
  {
    icon: Shield,
    title: "Vastu Audit",
    description:
      "Comprehensive evaluation of your existing property with detailed report, identifying issues and providing actionable recommendations.",
  },
];

const elements = [
  {
    icon: Droplets,
    name: "Water",
    sanskrit: "Jal",
    direction: "North-East",
    angle: 45,
    description: "Purity, clarity, and spiritual growth",
  },
  {
    icon: Flame,
    name: "Fire",
    sanskrit: "Agni",
    direction: "South-East",
    angle: 135,
    description: "Energy, transformation, and success",
  },
  {
    icon: Mountain,
    name: "Earth",
    sanskrit: "Prithvi",
    direction: "South-West",
    angle: 225,
    description: "Stability, strength, and grounding energy",
  },
  {
    icon: Wind,
    name: "Air",
    sanskrit: "Vayu",
    direction: "North-West",
    angle: 315,
    description: "Movement, freshness, and opportunities",
  },
];

const centerElement = {
  icon: Sun,
  name: "Space",
  sanskrit: "Akash",
  description: "Expansion, consciousness, and balance",
};

const benefits = [
  {
    icon: Heart,
    title: "Health & Well-being",
    description: "Promote physical and mental health through balanced energy in living spaces",
  },
  {
    icon: TrendingUp,
    title: "Financial Prosperity",
    description: "Attract wealth and abundance by optimizing the flow of positive energy",
  },
  {
    icon: Star,
    title: "Harmonious Relationships",
    description: "Create an environment that fosters love, understanding, and peace in family",
  },
  {
    icon: Shield,
    title: "Protection & Security",
    description: "Shield your home from negative energies and create a safe sanctuary",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Initial Consultation",
    description:
      "Share your property details and concerns. We understand your requirements, goals, and any specific issues you're facing.",
  },
  {
    step: "02",
    title: "Site Analysis",
    description:
      "Our Vastu expert visits your property to analyze directions, measurements, placements, and energy patterns using traditional and modern techniques.",
  },
  {
    step: "03",
    title: "Detailed Report",
    description:
      "Receive a comprehensive Vastu analysis report with findings, significance of each observation, and their impact on different life aspects.",
  },
  {
    step: "04",
    title: "Remedial Solutions",
    description:
      "Get practical, implementable remedies - both with and without structural changes. We prioritize non-demolition solutions.",
  },
  {
    step: "05",
    title: "Implementation Support",
    description:
      "Guidance during implementation of remedies. We assist with placement of items, colors, and other Vastu corrections.",
  },
  {
    step: "06",
    title: "Follow-up Review",
    description:
      "Post-implementation review to assess changes and provide any additional recommendations if needed.",
  },
];

const features = [
  "Certified Vastu consultants with 15+ years experience",
  "Scientific approach combined with traditional wisdom",
  "No superstition - only practical solutions",
  "Detailed written reports with diagrams",
  "Both on-site and online consultations available",
  "Affordable pricing with no hidden charges",
  "Post-consultation support included",
  "Privacy and confidentiality guaranteed",
];

const DIRECTIONS = [
  { label: "N", angle: 0 },
  { label: "NE", angle: 45 },
  { label: "E", angle: 90 },
  { label: "SE", angle: 135 },
  { label: "S", angle: 180 },
  { label: "SW", angle: 225 },
  { label: "W", angle: 270 },
  { label: "NW", angle: 315 },
];

function CompassRose() {
  return (
    <motion.svg
      viewBox="0 0 140 140"
      className="vastu-compass"
      initial={{ opacity: 0, scale: 0.85, rotate: -20 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <circle cx="70" cy="70" r="66" fill="none" stroke="rgba(212,160,23,0.35)" strokeWidth="1" />
      <circle cx="70" cy="70" r="48" fill="none" stroke="rgba(212,160,23,0.5)" strokeWidth="1" />
      <circle cx="70" cy="70" r="4" fill="#d4a017" />
      {DIRECTIONS.map(({ label, angle }) => {
        const rad = ((angle - 90) * Math.PI) / 180;
        const x1 = 70 + Math.cos(rad) * 48;
        const y1 = 70 + Math.sin(rad) * 48;
        const x2 = 70 + Math.cos(rad) * 66;
        const y2 = 70 + Math.sin(rad) * 66;
        const lx = 70 + Math.cos(rad) * 78;
        const ly = 70 + Math.sin(rad) * 78;
        return (
          <g key={label}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d4a017" strokeWidth={label.length === 1 ? 1.5 : 1} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={label.length === 1 ? 11 : 8}
              fontWeight={600}
              fill="#faf3e6"
            >
              {label}
            </text>
          </g>
        );
      })}
    </motion.svg>
  );
}

export default function VastuConsultationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="service-page vastu-page">
        {/* Hero Section */}
        <section className="vastu-hero">
          <div className="container vastu-hero-content">
            <CompassRose />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="vastu-eyebrow">
                <Compass className="w-4 h-4" /> Pancha Bhoota &middot; five elements
              </span>
              <h1 className="vastu-hero-title">
                <span className="vastu-hero-title-line1">Align your home</span>
                <span className="vastu-hero-title-line2">with the directions.</span>
              </h1>
              <p className="vastu-hero-subtitle">
                Vastu Shastra reads a space the way a compass reads the
                earth &mdash; entrance, kitchen, bedroom, each with a
                direction that either supports you or works against you.
                Our consultants find which is which, and fix it.
              </p>
              <div className="vastu-hero-cta">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="vastu-btn-primary"
                >
                  Book Consultation
                  <ArrowRight className="w-5 h-5" />
                </button>
                <Link href="/properties" className="vastu-btn-ghost">
                  Browse Vastu-Compliant Homes
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Five Elements Section — arranged at their real Vastu directions */}
        <section className="vastu-wheel-section">
          <div className="container">
            <motion.div
              className="section-header section-header-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label">The Foundation</span>
              <h2 className="section-title-new">
                The Five Elements of Vastu
              </h2>
              <p className="section-subtitle">
                Pancha Bhoota, placed the way they belong &mdash; four
                elements at their direction, Akash holding the centre
              </p>
            </motion.div>

            <motion.div
              className="vastu-wheel"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="vastu-wheel-center">
                <centerElement.icon className="w-7 h-7" />
              </div>
              {elements.map((element) => {
                const rad = ((element.angle - 90) * Math.PI) / 180;
                const x = 50 + Math.cos(rad) * 42;
                const y = 50 + Math.sin(rad) * 42;
                return (
                  <div
                    key={element.name}
                    className="vastu-wheel-node"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className="vastu-wheel-node-icon">
                      <element.icon className="w-5 h-5" />
                    </div>
                    <span className="vastu-wheel-node-name">
                      {element.name} <span style={{ opacity: 0.6, fontWeight: 400 }}>({element.sanskrit})</span>
                    </span>
                    <span className="vastu-wheel-node-direction">{element.direction}</span>
                  </div>
                );
              })}
            </motion.div>

            <div className="elements-legend">
              {[...elements, { ...centerElement, direction: "Center" }].map((element) => (
                <div key={element.name} className="element-legend-item">
                  <div className="element-legend-icon">
                    <element.icon className="w-5 h-5" />
                  </div>
                  <strong>{element.name}</strong>
                  <span>{element.description}</span>
                </div>
              ))}
            </div>
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
              <span className="section-label">Our Services</span>
              <h2 className="section-title-new">
                Comprehensive Vastu Solutions
              </h2>
              <p className="section-subtitle">
                From residential homes to commercial spaces, we provide expert
                Vastu guidance for all property types
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

        {/* Benefits Section */}
        <section className="service-styles">
          <div className="container">
            <motion.div
              className="section-header section-header-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="section-label">Benefits</span>
              <h2 className="section-title-new">Why Vastu Matters</h2>
              <p className="section-subtitle">
                A Vastu-compliant space can positively impact various aspects of your life
              </p>
            </motion.div>

            <motion.div
              className="benefits-showcase"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.map((benefit) => (
                <motion.div
                  key={benefit.title}
                  className="benefit-showcase-card"
                  variants={fadeInUp}
                >
                  <div className="benefit-showcase-icon">
                    <benefit.icon className="w-8 h-8" />
                  </div>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
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
                A systematic approach to analyze and optimize your space
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
              <h2>Why Choose Ghardaar24 Vastu Services?</h2>
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
                <h2>Ready for a Vastu Consultation?</h2>
                <p>
                  Take the first step towards a harmonious living space. Our
                  certified Vastu experts are ready to help you unlock the
                  potential of your property. Schedule a consultation today and
                  experience the positive transformation.
                </p>
              </div>
              <div className="service-contact-cta">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="btn-primary"
                >
                  Book Consultation
                </button>
                <a href="tel:+919673655631" className="btn-secondary">
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
                <a
                  href="https://wa.me/919673655631?text=Hi, I'm interested in Vastu consultation services from Ghardaar24"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  WhatsApp Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
      <ConsultationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceType="vastu_consultation"
      />
    </>
  );
}
