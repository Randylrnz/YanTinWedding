"use client";

interface WeddingLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { names: "text-2xl", heart: "text-xl", hashtag: "text-xs", subtitle: "text-xs" },
  md: { names: "text-4xl", heart: "text-3xl", hashtag: "text-sm", subtitle: "text-sm" },
  lg: { names: "text-6xl", heart: "text-5xl", hashtag: "text-base", subtitle: "text-base" },
  xl: { names: "text-8xl", heart: "text-7xl", hashtag: "text-xl", subtitle: "text-xl" },
};

export function WeddingLogo({ size = "lg", className = "" }: WeddingLogoProps) {
  const s = sizeMap[size];
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <p className={`font-lato font-300 tracking-[0.3em] text-champagne-dark uppercase ${s.subtitle}`}>
        Wedding Photobooth
      </p>
      <div className={`font-playfair font-700 text-burgundy leading-none ${s.names}`}>
        Yan{" "}
        <span className={`text-champagne-dark ${s.heart}`}>♥</span>
        {" "}Tin
      </div>
      <p className={`font-lato font-300 tracking-[0.25em] text-brown mt-1 ${s.hashtag}`}>
        #YanIsFinallyForTin
      </p>
    </div>
  );
}
