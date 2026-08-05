import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// Skiper 30 Parallax — TypeScript port themed for Sibs Style Beauty Lounge.
// Uses the salon's own gallery assets instead of placeholder URLs so the
// parallax columns stay fully on-brand.
//
// Mobile fix: The original component used 4 columns with aggressive negative
// top offsets and large parallax multipliers designed for desktop. On mobile
// this caused images to jump, clip, and leave large gaps. The fix:
// - Show only 2 columns on mobile (instead of 4)
// - Use smaller, mobile-specific parallax multipliers
// - Remove the negative top offsets (they only make sense with 4 columns)
// - Use a taller container on mobile so images have room to parallax
// - Fix image aspect ratios so they're not super tall and skinny

import nailsImage from '../assets/Nails.jpeg';
import cleanserImage from '../assets/Cleanser.jpeg';
import detoxImage from '../assets/Detox.jpeg';
import herbalImage from '../assets/HerbalEssence.jpeg';
import vitaminCImage from '../assets/VitaminC.jpeg';
import hairCreamImage from '../assets/HairCream.jpeg';
import mintpoxImage from '../assets/mintpox.jpeg';
import mijanImage from '../assets/Mijan.jpeg';
import himalayaImage from '../assets/himalaya.jpeg';
import sibshall1 from '../assets/Sibshall.jpeg';
import sibshall2 from '../assets/Sibshall2.jpeg';
import sibshall3 from '../assets/sibshall3.jpeg';

const allImages = [
  nailsImage,
  cleanserImage,
  detoxImage,
  herbalImage,
  vitaminCImage,
  hairCreamImage,
  mintpoxImage,
  mijanImage,
  himalayaImage,
  sibshall1,
  sibshall2,
  sibshall3,
];

const Skiper30 = () => {
  const gallery = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: gallery,
    offset: ['start end', 'end start'],
  });

  const { height } = dimension;

  // Desktop parallax multipliers (original values — smooth on wide screens)
  const y1 = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  // Mobile parallax multipliers (gentler, prevents jumping on small screens)
  const y1Mobile = useTransform(scrollYProgress, [0, 1], [0, height * 0.8]);
  const y2Mobile = useTransform(scrollYProgress, [0, 1], [0, height * 1.2]);

  useEffect(() => {
    // NOTE: Lenis is intentionally NOT instantiated here. The GalleryPage
    // already sets up Lenis smooth scroll, and having two instances caused
    // double-smoothing conflicts on mobile (janky, stuttering scroll).
    // The parallax works perfectly with native scroll + framer-motion.

    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  const isMobile = dimension.width > 0 && dimension.width < 640;

  return (
    <main className="w-full bg-[#FAF9F6] text-black">
      {/* Intro screen */}
      <div className="flex h-screen items-center justify-center gap-2 relative">
        <div className="absolute left-1/2 top-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-black">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-[#FAF9F6] after:to-black after:content-['']">
            scroll down to see
          </span>
        </div>
      </div>

      {/* ====== MOBILE LAYOUT (2 columns, gentle parallax) ====== */}
      {isMobile && (
        <div
          ref={gallery}
          className="relative box-border flex h-[200vh] gap-3 overflow-hidden bg-[#FAF9F6] px-3"
        >
          <ColumnMobile images={[allImages[0], allImages[1], allImages[2], allImages[3]]} y={y1Mobile} />
          <ColumnMobile images={[allImages[4], allImages[5], allImages[6], allImages[7]]} y={y2Mobile} />
        </div>
      )}

      {/* ====== DESKTOP/TABLET LAYOUT (4 columns, full parallax) ====== */}
      {!isMobile && (
        <div
          ref={gallery}
          className="relative box-border flex h-[175vh] gap-[2vw] overflow-hidden bg-[#FAF9F6] p-[2vw]"
        >
          <Column images={[allImages[0], allImages[1], allImages[2]]} y={y1} />
          <Column images={[allImages[3], allImages[4], allImages[5]]} y={y2} />
          <Column images={[allImages[6], allImages[7], allImages[8]]} y={y3} />
          <Column images={[allImages[9], allImages[10], allImages[11]]} y={y4} />
        </div>
      )}

      {/* Outro screen */}
      <div className="relative flex h-screen items-center justify-center gap-2">
        <div className="absolute left-1/2 top-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-black">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-[#FAF9F6] after:to-black after:content-['']">
            scroll up to see
          </span>
        </div>
      </div>
    </main>
  );
};

// ====== DESKTOP COLUMN (original, untouched) ======
type ColumnProps = {
  images: string[];
  y: MotionValue<number>;
};

const Column = ({ images, y }: ColumnProps) => {
  return (
    <motion.div
      className="relative -top-[45%] flex h-full w-1/4 min-w-0 flex-col gap-[2vw] first:top-[-45%] [&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-[-45%] [&:nth-child(4)]:top-[-75%]"
      style={{ y }}
    >
      {images.map((src, i) => (
        <div key={i} className="relative h-full w-full overflow-hidden rounded-2xl shadow-lg">
          <img
            src={src}
            alt="Sibs Style gallery"
            className="pointer-events-none h-full w-full object-cover"
          />
        </div>
      ))}
    </motion.div>
  );
};

// ====== MOBILE COLUMN (new — clean, no negative top offsets) ======
const ColumnMobile = ({ images, y }: ColumnProps) => {
  return (
    <motion.div
      className="relative flex h-full w-1/2 min-w-0 flex-col gap-3"
      style={{ y }}
    >
      {images.map((src, i) => (
        <div key={i} className="relative w-full flex-1 overflow-hidden rounded-2xl shadow-lg min-h-0">
          <img
            src={src}
            alt="Sibs Style gallery"
            className="pointer-events-none h-full w-full object-cover"
          />
        </div>
      ))}
    </motion.div>
  );
};

export { Skiper30 };

/**
 * Skiper 30 Parallax_002 — React + framer motion + lenis
 * Inspired by and adapted from https://www.siena.film/films/my-project-x
 * Free to use and modify. Attribution to Skiper UI required in free version.
 */
