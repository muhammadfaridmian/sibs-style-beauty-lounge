import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
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

// Mobile-only gallery: horizontal scroll-pinned carousel.
// As the user scrolls vertically, the images move horizontally (like Apple's product pages).
// This replaces the janky Skiper30 parallax on mobile only — desktop is completely untouched.

const images = [
  nailsImage, cleanserImage, detoxImage, herbalImage,
  vitaminCImage, hairCreamImage, mintpoxImage, mijanImage,
  himalayaImage, sibshall1, sibshall2, sibshall3,
];

const MobileGallery = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        // Total scroll distance = track width minus viewport width
        setTrackWidth(trackRef.current.scrollWidth - window.innerWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Move the track from 0 to -trackWidth (left) as user scrolls down
  const x = useTransform(scrollYProgress, [0, 1], [0, -trackWidth]);

  return (
    <div ref={containerRef} className="bg-[#FAF9F6]" style={{ height: '250vh' }}>
      {/* Sticky viewport — pins while the track scrolls horizontally */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center bg-[#FAF9F6]">
        {/* Section label */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F2529D] animate-pulse" />
            <span className="text-[0.5rem] font-black uppercase tracking-[0.25em] text-gray-500">Swipe Gallery</span>
          </div>
        </div>

        {/* Horizontal track */}
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-4 px-4 will-change-transform"
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="relative shrink-0 w-[75vw] h-[60vh] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src={src}
                alt={`Sibs Style gallery ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Image number badge */}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center">
                <span className="text-[10px] font-black text-white">{String(i + 1).padStart(2, '0')}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-full bg-[#F2529D] origin-left"
          />
        </div>
      </div>
    </div>
  );
};

export default MobileGallery;
