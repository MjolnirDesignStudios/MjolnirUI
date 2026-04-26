// components/About.tsx — MDS BentoGrid with Animations
"use client";
import React from "react";
import { motion } from "framer-motion";
import { gridItems } from "@/data";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";

export default function About() {
  return (
    <section id="about" className="py-4 mb-20 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Wield the Power of{" "}
            <span className="text-gold">MjolnirUI!</span>
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto">
            Thunderous UI/UX Components Built for Asgardians!
          </p>
        </motion.div>

        <BentoGrid mobileOrder={[0, 3, 1, 2, 4, 5]}>
          {gridItems.map((item) => (
            <BentoGridItem
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              className={item.className}
              img={item.img}
              imgClassName={item.imgClassName}
              titleClassName={item.titleClassName}
              contentType={item.contentType}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
