// components/ui/BentoGrid.tsx
"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import LightningEffect from "./Animations/LightningEffect";
import Globe from "./Animations/Globe";
import ShimmerButton from "@/components/Buttons/ShimmerButton";
import { IoCopy } from "react-icons/io5";
import Image from "next/image";
import { BifrostGradient } from "./Animations/BifrostGradients";
import { ColorfulText } from "@/components/ui/TextEffects/ColorfulText";
import { GlowingEffect } from "./Animations/GlowingEffect";
import Lottie from "lottie-react";
import Singularity from "./Animations/Singularity";
import { getAssetUrls } from '@/lib/cdn-config';
import { TechCardGrid } from "./Cards/TechCardGrid";


export const BentoGrid = ({
  className,
  children,
  mobileOrder,
}: {
  className?: string;
  children?: React.ReactNode;
  mobileOrder?: number[];
}) => {
  const assets = getAssetUrls();
  const childArray = React.Children.toArray(children);
  const mobileChildren = mobileOrder
    ? mobileOrder.map(i => childArray[i]).filter(Boolean)
    : childArray;

  return (
    <>
      {/* MOBILE — WIDER, REORDERABLE */}
      <div className="grid grid-cols-1 gap-6 px-1 md:hidden">
        {mobileChildren.map((child, i) => (
          <div key={i} className="min-h-56">{child}</div>
        ))}
      </div>

      {/* TABLET — 2 COLUMN, TALLER */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-8 px-8">
        {React.Children.map(children, (child) => (
          <div className="h-96 min-h-96 w-48 min-w-full">{child}</div>
        ))}
      </div>

      {/* DESKTOP — ORIGINAL PERFECT LAYOUT */}
      <div
        className={cn(
          "hidden md:grid md:grid-cols-6 lg:grid-cols-5 gap-4 mx-auto px-10",
          className
        )}
      >
        {children}
      </div>
    </>
  );
};

export interface BentoGridItemProps {
  className?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  id?: number;
  img?: string;
  imgClassName?: string;
  titleClassName?: string;
  contentType?: string;
}
export const BentoGridItem = ({
  className,
  title,
  description,
  id,
  img,
  imgClassName,
  titleClassName,
  contentType,
}: BentoGridItemProps) => {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const assets = getAssetUrls();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("contact@mjolnirdesignstudios.com");
    setCopied(true);
  };

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-3xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none justify-between flex flex-col space-y-4 border-2 border-white/[0.15]",
        className
      )}
      style={{
        background: "rgb(13,13,13)",
        backgroundColor: "linear-gradient(90deg, rgba(22,22,22,1) 0%, rgba(64,0,0,1) 70%, rgba(80,80,80,1) 100%)",
      }}
    >
      <div className={`${id === 6 && "flex justify-center"} h-full`}>
        {/* Background Image */}
        {img && (
          <Image
            src={img}
            alt={img}
            fill
            className={cn(imgClassName, "object-contain object-center")}
          />
        )}

        {/* Custom Content Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {id === 1 && (
            <div className="w-full h-full">
              <LightningEffect
              />
              <div className="absolute top-4 left-4">
                <div className="group-hover/bento:translate-x-8 transition duration-200">
                  <div className="font-bold text-3xl lg:text-3xl text-white z-10">
                    {title}
                  </div>
                  <div className="font-extralight text-gold text-lg lg:text-base z-10">
                    {description}
                  </div>
                </div>
              </div>
            </div>
          )}

          {id === 2 && (
            <div className="w-full h-full">
              {/* Static Accretion Disk Fallback Image */}
              <Image
                src="/Images/Backgrounds/Singularity.png"
                alt="Singularity"
                fill
                priority
                className="object-cover object-center scale-80"
              />

              <div className="absolute top-4 left-4">
                  <div className="group-hover/bento:translate-x-4 transition duration-200">
                    <div className="font-bold text-2xl lg:text-3xl text-white z-10">
                      {title}
                    </div>
                    <div className="font-extralight text-gold text-lg lg:text-base z-10">
                      {description}
                    </div>
                  </div>
                </div>
            </div>
          )}

          {id === 3 && (
          <div className="relative w-full h-full rounded-3xl overflow-hidden">
            <Image
              src="/Images/Backgrounds/bg.png"
              alt="Asgardian Tech"
              fill
              priority
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

            {/* Mini TechCardGrid — lower 60% of card */}
            <div className="absolute bottom-0 left-0 right-0 h-[62%] overflow-hidden opacity-85 pointer-events-none">
              <TechCardGrid />
            </div>

            <div className="absolute top-4 left-4 z-10">
              <div className="group-hover/bento:translate-x-4 transition-all duration-500 ease-out">
                <h3 className="font-black text-2xl md:text-3xl lg:text-3xl text-white drop-shadow-2xl tracking-tight">
                  {title}
                </h3>
                <p className="font-extralight text-gold text-md md:text-lg lg:text-lg drop-shadow-lg">
                  {description}
                </p>
              </div>
            </div>
          </div>
          )}

          {id === 4 && (
          <div className="relative w-full h-full overflow-hidden rounded-3xl">
            {/* MJÖLNIR — fill container, anchor to top on mobile */}
            <Image
              src="/Images/Mjolnir.jpeg"
              alt="Mjolnir"
              fill
              priority
              className="object-cover object-top"
            />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

            {/* Text */}
            <div className="absolute top-4 left-4 z-10">
              <div className="group-hover/bento:translate-x-4 transition-all duration-500 ease-out">
                <h3 className="font-black text-2xl md:text-3xl lg:text-3xl text-white drop-shadow-2xl tracking-tight">
                  {title}
                </h3>
                <p className="font-extralight text-gold text-md md:text-lg lg:text-lg drop-shadow-lg">
                  {description}
                </p>
              </div>
            </div>

            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-radial from-white/20 to-transparent blur-3xl" />
            </div>
          </div>
        )}

          {id === 5 && (
          <div className="w-full h-full relative">
            <div className="absolute inset-0">
              <Globe
                dark
                scale={isMobile ? 1.1 : 1.2}
                offsetX={isMobile ? 160 : 200}
                offsetY={isMobile ? 280 : 1200}
                className="w-full h-full"
              />
            </div>
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
              <div className="group-hover/bento:translate-x-4 transition duration-200">
                <div className="font-bold text-2xl lg:text-3xl text-white">
                  {title}
                </div>
                <div className="font-extralight text-gold text-lg lg:text-base">
                  {description}
                </div>
              </div>
            </div>
          </div>
        )}

          {id === 6 && (
            <div className="w-full h-full overflow-hidden rounded-3xl">
              {/* BIFROST BACKGROUND */}
              <BifrostGradient
                speed={1.3}
                intensity={1.6}
                size="100%"
                interactive={true}
                className="absolute inset-0"
              />

              {/* CONTENT */}
              <div className="absolute top-4 items-center w-full">
                <div className="group-hover/bento:translate-y-2 transition duration-200">
                  <div className="relative z-10 flex h-full flex-col justify-end px-5 text-center">
                    <div className="font-sans font-bold text-3xl lg:text-4xl text-white z-10">
                      Open the
                      <ColorfulText text=" Bifrost!" className="inline-block text-3xl md:text-2xl lg:text-3xl">
                      </ColorfulText>
                    </div>

                    {/* Description — clamped to 1 line */}
                    <div className="font-sans font-bold text-gold text-lg md:text-base lg:text-lg z-10 mb-2 truncate">
                      {description || "Contact Mjolnir Design Studios"}
                    </div>
                  </div>
                </div>
                <div className="relative flex z-20 items-center justify-center mt-2 mb-2 pointer-events-auto">
                  <ShimmerButton
                    title={copied ? "Email copied" : "Copy Email"}
                    icon={<IoCopy />}
                    position="left"
                    otherClasses="mx-auto relative z-10"
                    handleClick={() => {
                      handleCopy();
                    }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>

          {/* Text */}
          <div
            className={cn(
              titleClassName,
              "group-hover/bento:translate-x-2 transition duration-200 relative p-4 lg:p-10 flex flex-col"
            )}
          >

          </div>
      </div>
    </div>
  );
};
