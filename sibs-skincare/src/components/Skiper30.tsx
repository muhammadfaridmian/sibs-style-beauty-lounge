import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';
import Lenis from 'lenis';
import { useEffect, useRef, useState } from 'react';

// Skiper 30 Parallax — TypeScript port themed for Sibs Style Beauty Lounge.
// Uses the salon's own gallery assets instead of placeholder URLs so the
// parallax columns stay fully on-brand.

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

const images = [
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
  const y = useTransform(scrollYProgress, [0, 1], [0, height * 2]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, height * 3.3]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, height * 1.25]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, height * 3]);

  useEffect(() => {
    const lenis = new Lenis();

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    const resize = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', resize);
    requestAnimationFrame(raf);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
      lenis.destroy();
    };
  }, []);

  return (
    <main className="w-full bg-[#FAF9F6] text-black">
      <div className="flex h-screen items-center justify-center gap-2 relative">
        <div className="absolute left-1/2 top-[10%] grid -translate-x-1/2 content-start justify-items-center gap-6 text-center text-black">
          <span className="relative max-w-[12ch] text-xs uppercase leading-tight opacity-40 after:absolute after:left-1/2 after:top-full after:h-16 after:w-px after:bg-gradient-to-b after:from-[#FAF9F6] after:to-black after:content-['']">
            scroll down to see
          </span>
        </div>
      </div>

      <div
        ref={gallery}
        className="relative box-border flex h-[175vh] gap-[2vw] overflow-hidden bg-[#FAF9F6] p-[2vw]"
      >
        <Column images={[images[0], images[1], images[2]]} y={y} />
        <Column images={[images[3], images[4], images[5]]} y={y2} />
        <Column images={[images[6], images[7], images[8]]} y={y3} />
        <Column images={[images[9], images[10], images[11]]} y={y4} />
      </div>
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

type ColumnProps = {
  images: string[];
  y: MotionValue<number>;
};

const Column = ({ images, y }: ColumnProps) => {
  return (
    <motion.div
      className="relative top-0 sm:-top-[45%] flex h-full w-1/2 sm:w-1/3 md:w-1/4 min-w-0 flex-col gap-[2vw] first:top-0 sm:first:top-[-45%] [&:nth-child(2)]:top-0 sm:[&:nth-child(2)]:top-[-95%] [&:nth-child(3)]:top-0 sm:[&:nth-child(3)]:top-[-45%] [&:nth-child(3)]:hidden sm:[&:nth-child(3)]:flex [&:nth-child(4)]:top-0 sm:[&:nth-child(4)]:top-[-75%] [&:nth-child(4)]:hidden md:[&:nth-child(4)]:flex"
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

export { Skiper30 };

/**
 * Skiper 30 Parallax_002 — React + framer motion + lenis
 * Inspired by and adapted from https://www.siena.film/films/my-project-x
 * Free to use and modify. Attribution to Skiper UI required in free version.
 */
