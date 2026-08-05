import { useEffect, useRef, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from './components/Footer';
import { Skiper30 } from './components/Skiper30';
import MobileGallery from './components/MobileGallery';
import DomeGallery from './components/DomeGallery';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Gallery assets — reused across both components and the surrounding design.
import nailsImage from './assets/Nails.jpeg';
import cleanserImage from './assets/Cleanser.jpeg';
import detoxImage from './assets/Detox.jpeg';
import herbalImage from './assets/HerbalEssence.jpeg';
import vitaminCImage from './assets/VitaminC.jpeg';
import hairCreamImage from './assets/HairCream.jpeg';
import mintpoxImage from './assets/mintpox.jpeg';
import mijanImage from './assets/Mijan.jpeg';
import himalayaImage from './assets/himalaya.jpeg';
import sibshall1 from './assets/Sibshall.jpeg';
import sibshall2 from './assets/Sibshall2.jpeg';
import sibshall3 from './assets/sibshall3.jpeg';

// The DomeGallery needs a flat list of image URLs (strings).
const domeImages: string[] = [
  nailsImage, cleanserImage, detoxImage, herbalImage, vitaminCImage,
  hairCreamImage, mintpoxImage, mijanImage, himalayaImage,
  sibshall1, sibshall2, sibshall3,
];

// A small editorial grid used in the closing "Behind the Canvas" section.
const behindCanvasImages = [
  { src: sibshall1, title: 'Studio Frame 01', copy: 'A quiet behind-the-scenes moment.' },
  { src: sibshall2, title: 'Studio Frame 02', copy: 'Lighting study and texture.' },
  { src: sibshall3, title: 'Studio Frame 03', copy: 'Gesture and motion captured.' },
  { src: detoxImage, title: 'Detail Study', copy: 'Botanical precision up close.' },
];

const GalleryPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Entry + scroll animations — safe pattern (elements visible by default,
  // animate on enter). Never depends on JS to make content visible.
  useEffect(() => {
    window.scrollTo(0, 0);

    // Safety net: force container visible after a short delay so the page
    // is never stuck invisible if the GSAP timeline is interrupted.
    const safetyNet = window.setTimeout(() => {
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' });
      }
      gsap.set('.gallery-title, .gallery-eyebrow, .gallery-sub', { opacity: 1, y: 0, clearProps: 'all' });
    }, 2000);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' });
        gsap.set('.gallery-title, .gallery-eyebrow, .gallery-sub', { opacity: 1, y: 0, clearProps: 'all' });
      },
    });
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.inOut' })
      .fromTo('.gallery-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('.gallery-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, '-=0.5')
      .fromTo('.gallery-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8');

    // Scroll reveals
    const createdTriggers: ScrollTrigger[] = [];
    const revealEls = gsap.utils.toArray<HTMLElement>('.gallery-reveal');
    revealEls.forEach((el) => {
      gsap.set(el, { opacity: 1, y: 0 });
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.fromTo(el, { y: 60, opacity: 0 }, {
            y: 0, opacity: 1, duration: 1, ease: 'power3.out',
          });
        },
      });
      createdTriggers.push(st);
    });
    ScrollTrigger.refresh();

    return () => {
      window.clearTimeout(safetyNet);
      tl.kill();
      createdTriggers.forEach((t) => t.kill());
    };
  }, []);

  const navigateToBooking = () => {
    const event = new CustomEvent('trigger-curtain', { detail: { path: '/booking' } });
    window.dispatchEvent(event);
  };

  // Memoize the dome image list so it doesn't rebuild on every render.
  const domeImagesMemo = useMemo(() => domeImages, []);

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen overflow-x-hidden">
      {/* ==================== HEADER ==================== */}
      <div className="max-w-5xl mx-auto px-4 pt-32 md:pt-48 pb-16 md:pb-24 text-center">
        <div className="gallery-eyebrow flex items-center justify-center gap-4 mb-6 md:mb-8">
          <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">The Visual Edit</span>
          <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
        </div>
        <h1 className="gallery-title text-4xl sm:text-6xl md:text-9xl font-display italic font-black text-[#F2529D] leading-none tracking-tighter mb-6 md:mb-8">
          The Gallery
        </h1>
        <p className="gallery-sub text-gray-500 text-base md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
          A curation of radiance, texture, and the quiet moments behind every ritual.
        </p>
      </div>

      {/* ==================== SECTION 1: SKiper30 PARALLAX ==================== */}
      <section className="gallery-reveal">
        {/* Section label above the parallax — desktop only */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-8 mb-8 md:mb-12 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-gray-100 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#F2529D] animate-pulse" />
            <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-gray-500">Scroll Parallax</span>
          </div>
        </div>
        {/* Desktop: Skiper30 parallax (untouched). Mobile: horizontal swipe gallery. */}
        <div className="hidden md:block">
          <Skiper30 />
        </div>
        <div className="md:hidden">
          <MobileGallery />
        </div>
      </section>

      {/* ==================== TRANSITION DIVIDER ==================== */}
      <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-center gallery-reveal">
        <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
          <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Interactive</span>
          <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
        </div>
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-display italic font-black text-gray-900 leading-none tracking-tighter mb-4">
          Step <span className="text-[#F2529D]">Inside</span>
        </h2>
        <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
          Drag to rotate the dome. Click any image to enlarge it.
        </p>
      </div>

      {/* ==================== SECTION 2: DOME GALLERY ==================== */}
      <section className="gallery-reveal relative">
        {/* Dark themed backdrop so the dome's overlay blur blends with the page. */}
        <div className="absolute inset-0 bg-[#0A0E1A]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#F2529D]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#BF9C34]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 h-[80vh] sm:h-[100vh] min-h-[500px] sm:min-h-[600px] w-full">
          <DomeGallery
            images={domeImagesMemo}
            fit={0.85}
            minRadius={350}
            maxVerticalRotationDeg={8}
            segments={26}
            dragDampening={3.4}
            grayscale={false}
            overlayBlurColor="#0A0E1A"
            imageBorderRadius="12px"
            openedImageBorderRadius="16px"
            openedImageWidth="300px"
            openedImageHeight="420px"
          />
        </div>

        {/* Drag hint */}
        <div className="relative z-10 text-center pb-12 md:pb-20">
          <p className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-white/30">
            Click and drag to explore
          </p>
        </div>
      </section>

      {/* ==================== BEHIND THE CANVAS (editorial grid) ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto">
          <div className="gallery-reveal text-center mb-10 md:mb-16">
            <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
              <span className="h-px w-10 md:w-14 bg-[#F2529D]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#F2529D]">Behind the Canvas</span>
              <span className="h-px w-10 md:w-14 bg-[#F2529D]" />
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-display italic font-black text-gray-900 leading-none tracking-tighter mb-3">
              Studio <span className="text-[#F2529D]">Moments</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Quiet frames from inside the lounge, where every ritual is prepared.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {behindCanvasImages.map((item, idx) => (
              <div
                key={idx}
                className={`gallery-reveal group relative overflow-hidden rounded-[2rem] shadow-lg ${idx % 2 === 1 ? 'md:translate-y-12' : ''}`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <h3 className="text-xl md:text-2xl font-display italic font-black mb-1">{item.title}</h3>
                  <p className="text-sm text-white/70">{item.copy}</p>
                </div>
                <span className="absolute top-4 right-4 text-[0.55rem] font-black tracking-widest text-white/40 uppercase">
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto text-center gallery-reveal">
          <div className="bg-[#0A0E1A] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#F2529D]/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#BF9C34]/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
                <span className="h-px w-10 md:w-12 bg-[#BF9C34]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Your Turn</span>
                <span className="h-px w-10 md:w-12 bg-[#BF9C34]" />
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display italic font-black text-white mb-4 md:mb-6 leading-tight">
                Become part of <span className="text-[#F2529D]">the edit</span>
              </h2>
              <p className="text-sm md:text-base text-white/60 max-w-lg mx-auto mb-6 md:mb-8 font-medium">
                Book a ritual and let your transformation join the gallery.
              </p>
              <button
                onClick={navigateToBooking}
                className="inline-flex items-center gap-3 px-8 md:px-12 py-4 md:py-5 rounded-full bg-[#F2529D] hover:bg-white hover:text-black text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl group"
              >
                Book Your Ritual
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GalleryPage;
