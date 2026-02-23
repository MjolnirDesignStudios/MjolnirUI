// components/Hero.tsx
"use client";


import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";
import ShimmerButton from './Buttons/ShimmerButton';
import { TextReveal } from "@/components/ui/TextReveal";
import { AuroraText } from "@/components/ui/AuroraText";
import { Hammer, Box } from "lucide-react";

const defaultVariants = {
  blurInLeft: {
    hidden: { opacity: 0, filter: "blur(8px)", x: -40 },
    visible: { opacity: 1, filter: "blur(0px)", x: 0 },
  },
  blurInUp: {
    hidden: { opacity: 0, filter: "blur(8px)", y: 40 },
    visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  },
};

export default function Hero() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleAuthAction = () => {
    if (!session) {
      router.push('/auth/signin');
    }
  };

  return (
    <section className="flex flex-col items-center justify-center relative overflow-hidden py-16 px-4 mt-14 sm:mt-16 md:mt-20 lg:mt-24">
      {/* Staggered, book-like text reveal sequence */}
      <TextReveal
        as="h1"
        className="text-2xl md:text-4xl font-extrabold text-white mb-2 text-center"
        animation="blurInLeft"
        by="character"
        duration={0.8}
      >
        WHOSOEVER HOLDS THIS HAMMER...
      </TextReveal>
      <TextReveal
        as="h1"
        className="text-2xl md:text-4xl font-extrabold text-white mb-2 text-center"
        animation="blurInLeft"
        by="character"
        delay={0.85}
        duration={0.8}
      >
        IF HE BE WORTHY, SHALL POSSESS THE POWER OF
      </TextReveal>
      <div className="my-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={defaultVariants.blurInUp}
          transition={{
            delay: 2.0,
            duration: 0.5,
            ease: "easeOut",
          }}
          className="inline-block text-6xl md:text-8xl font-black mb-4"
        >
          <AuroraText
            colors={["#fff700","#ffe066","#ffd700","#ffb300","#ff8c00","#ffea00","#fff700","#b87333"]}
            speed={2.5}
            className="drop-shadow-[0_0_32px_#00BFFF]"
          >
            THOR!
          </AuroraText>
        </motion.div>
      </div>
      <TextReveal
        as="p"
        className="text-lg md:text-2xl text-gray-200 mb-2 text-center"
        animation="blurInLeft"
        by="character"
        delay={3.0}
        duration={0.7}
      >
        Mjolnir, forged in the heart of a dying star...
      </TextReveal>
      <TextReveal
        as="p"
        className="text-lg md:text-2xl text-gray-200 mb-2 text-center"
        animation="blurInLeft"
        by="character"
        delay={4.2}
        duration={0.7}
      >
        A weapon to destroy...
      </TextReveal>
      <div className="mb-8 flex flex-col items-center justify-center">
        <motion.p
          className="text-lg md:text-2xl inline-block text-center"
          initial="hidden"
          animate="visible"
          variants={defaultVariants.blurInLeft}
          transition={{
            delay: 5.4,
            duration: 0.7,
            ease: "easeOut",
          }}
        >
          <span className="text-yellow-400">Or a tool to build!</span> <span className="text-white">~ODIN</span>
        </motion.p>
      </div>
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
        <div onClick={handleAuthAction}>
          <ShimmerButton
            title="Wield Mjolnir!"
            variant="gold"
            icon={<Hammer className="w-6 h-6 text-yellow-300" />}
            position="right"
            otherClasses="text-lg px-8 py-4 border border-yellow-400/80"
          />
        </div>
        <div onClick={handleAuthAction}>
          <ShimmerButton
            title="View Blocks"
            variant="silver"
            icon={<Box className="w-6 h-6 text-white" />}
            position="right"
            otherClasses="text-lg px-8 py-4 border border-white/80 text-white bg-white/10 hover:bg-white/20"
          />
        </div>
      </div>
    </section>
  );
}