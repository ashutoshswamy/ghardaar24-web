"use client";

import { motion, staggerContainer, fadeInUp } from "@/lib/motion";
import { MapPin } from "lucide-react";

const localities = [
  { name: "Koregaon Park", city: "Pune" },
  { name: "Baner", city: "Pune" },
  { name: "Hinjewadi", city: "Pune" },
  { name: "Kothrud", city: "Pune" },
  { name: "Viman Nagar", city: "Pune" },
  { name: "Kharadi", city: "Pune" },
  { name: "Aundh", city: "Pune" },
  { name: "Wakad", city: "Pune" },
  { name: "Balewadi", city: "Pune" },
  { name: "Magarpatta", city: "Pune" },
  { name: "Hadapsar", city: "Pune" },
  { name: "Bavdhan", city: "Pune" },
  { name: "Kalyani Nagar", city: "Pune" },
  { name: "Model Colony", city: "Pune" },
  { name: "Prabhat Road", city: "Pune" },
  { name: "Mundhwa", city: "Pune" },
  { name: "Sinhagad Road", city: "Pune" },
  { name: "Warje Malwadi", city: "Pune" },
];

export default function PopularLocalities() {
  return (
    <section className="localities-section">
      <div className="container">
        <motion.div
          className="section-header section-header-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="section-title-new">Popular Localities</h2>
          <p className="section-subtitle">
            Explore properties in the most sought-after neighborhoods
          </p>
        </motion.div>

        <motion.div
          className="localities-grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {localities.map((locality) => (
            <motion.div
              key={locality.name}
              variants={fadeInUp}
              className="locality-card"
            >
              <div className="locality-card-bg" />
              <div className="locality-card-content">
                <div className="locality-icon">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="locality-name">{locality.name}</h3>
                <p className="locality-city">{locality.city}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* And many more statement */}
        <motion.p
          className="text-center text-gray-500 mt-8 text-sm font-medium"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          ...and many more localities across Pune!
        </motion.p>
      </div>
    </section>
  );
}

