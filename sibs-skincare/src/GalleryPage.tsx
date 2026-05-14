import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import Footer from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

// The gallery is mostly a visual story page, so the motion work does most of the talking.
// Import local gallery assets
import nailsImage from './assets/Nails.jpeg';
import cleanserImage from './assets/Cleanser.jpeg';
import detoxImage from './assets/Detox.jpeg';
import herbalImage from './assets/HerbalEssence.jpeg';
import vitaminCImage from './assets/VitaminC.jpeg';
import hairCreamImage from './assets/HairCream.jpeg';
import mintpoxImage from './assets/mintpox.jpeg';
import mijanImage from './assets/Mijan.jpeg';
import himalayaImage from './assets/himalaya.jpeg';
import btesnceImage from './assets/btesnce.png';
import craftedImage from './assets/craftedprecision.png';
import sibshall1 from './assets/Sibshall.jpeg';
import sibshall2 from './assets/Sibshall2.jpeg';
import sibshall3 from './assets/sibshall3.jpeg';

const images = [
  {
    url: nailsImage,
    title: 'Precision Beauty',
    category: 'Nail Care',
    span: 'md:row-span-2'
  },
  {
    url: cleanserImage,
    title: 'Pure Essence',
    category: 'Skincare',
    span: 'col-span-1'
  },
  {
    url: detoxImage,
    title: 'Detox Ritual',
    category: 'Treatment',
    span: 'col-span-1'
  },
  {
    url: herbalImage,
    title: 'Herbal Infusion',
    category: 'Botanical',
    span: 'md:row-span-1'
  },
  {
    url: vitaminCImage,
    title: 'Radiant Glow',
    category: 'Product',
    span: 'col-span-1'
  },
  {
    url: hairCreamImage,
    title: 'Hair Luxe',
    category: 'Hair Care',
    span: 'md:row-span-2'
  },
  {
    url: mintpoxImage,
    title: 'Refresh & Revive',
    category: 'Signature',
    span: 'md:col-span-2'
  },
  {
    url: mijanImage,
    title: 'Artisan Blend',
    category: 'Premium',
    span: 'col-span-1'
  },
  {
    url: himalayaImage,
    title: 'Mountain Pure',
    category: 'Natural',
    span: 'md:col-span-2'
  },
  {
    url: 'https://images.unsplash.com/photo-1552046122-03184de85e08?q=80&w=800&auto=format&fit=crop', // Minimalist bathroom/skincare
    title: 'The Shelfie',
    category: 'Minimalism',
    span: 'col-span-1 aspect-square md:translate-y-12'
  },
  {
    url: btesnceImage, // Botanical Essence
    title: 'Botanical Essence',
    category: 'Micro Edit',
    span: 'col-span-1 rounded-full p-4 grayscale hover:grayscale-0 transition-all'
  },
  {
    url: craftedImage, // Crafted Precision
    title: 'Crafted Precision',
    category: 'Tools',
    span: 'col-span-1'
  }
];

// Behind the Canvas: show four curated images from assets
const behindCanvasImages = [
  {
    kind: 'image',
    src: sibshall1,
    title: 'Studio Frame 1',
    copy: 'A quiet behind-the-scenes moment.',
    span: 'sm:col-span-2'
  },
  {
    kind: 'image',
    src: sibshall2,
    title: 'Studio Frame 2',
    copy: 'Lighting study and texture.',
    span: 'col-span-1'
  },
  {
    kind: 'image',
    src: sibshall3,
    title: 'Studio Frame 3',
    copy: 'Gesture and motion captured.',
    span: 'col-span-1'
  },
  {
    kind: 'image',
    src: craftedImage,
    title: 'Tools & Craft',
    copy: 'Precision and thoughtful tools.',
    span: 'sm:col-span-2'
  }
];

const GalleryPage = () => {
  // The horizontal section uses this ref to pin and move the gallery track.
  // The same ref is what the ScrollTrigger animation uses to slide the whole storyboard sideways.
  const scrollRef = useRef(null);
  // This wrapper starts hidden so the initial route swap does not flash.
  // Hiding the page for a beat prevents the user from seeing the old route tear down.
  const pageWrapperRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Initial state: hidden for a split second to avoid flash
    gsap.set(pageWrapperRef.current, { visibility: 'hidden', opacity: 0 });

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // The title and cards fade in first, then the wide gallery section starts its scroll trick.
      // Delay to ensure previous page has unmounted and layout is settled
      gsap.to(pageWrapperRef.current, {
        visibility: 'visible',
        opacity: 1,
        duration: 0.8,
        delay: 0.2, // The "split second" blank state
        ease: "power2.inOut"
      });

      // Header Animation
      gsap.fromTo('.gallery-title', 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.5, 
          delay: 0.4,
          ease: "power4.out" 
        }
      );

      // Grid Stagger Animation
      gsap.fromTo('.gallery-item', 
        { opacity: 0, scale: 0.95, y: 30 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 1.2,
          stagger: 0.1,
          delay: 0.5,
          ease: "expo.out",
          scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 80%',
          }
        }
      );

      // Lateral Scroll Animation for the "Extended Curation"
      mm.add('(min-width: 768px)', () => {
        // Desktop gets the full horizontal storyboard; mobile keeps the layout vertical.
        // On desktop, each panel becomes one slice of a long horizontal storyboard.
        // The sideways track only exists on larger screens because it needs the extra width.
        const sections = gsap.utils.toArray(".lateral-item");
        if (sections.length > 0) {
          // This is the sideways scroll bit. It makes the gallery feel more like a magazine spread.
          gsap.to(sections, {
            xPercent: -100 * (sections.length - 1),
            ease: "none",
            scrollTrigger: {
              trigger: ".lateral-container",
              pin: true,
              scrub: 1,
              snap: 1 / (sections.length - 1),
              end: () => "+=" + (window.innerWidth * sections.length),
              invalidateOnRefresh: true,
              onToggle: (self) => {
                gsap.to('nav', { 
                  yPercent: self.isActive ? -100 : 0, 
                  opacity: self.isActive ? 0 : 1, 
                  duration: 0.5, 
                  ease: 'power2.inOut' 
                });
              }
            }
          });
        }
      });
    });

    return () => {
      // Reverting the GSAP context matters because the page pins content while scrolling.
      // Killing the ScrollTriggers keeps the next page from inheriting the gallery animations.
      mm.revert();
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div 
      ref={pageWrapperRef} 
      className="bg-[#FAF9F6] min-h-screen font-body selection:bg-[#F2529D] selection:text-white"
    >
      
      {/* Header Section */}
      <header className="pt-48 pb-20 text-center px-6 gallery-title">
        <h1 className="text-4xl sm:text-6xl md:text-9xl font-display italic font-black text-[#0A0E1A] mb-4">
          The Visual Edit
        </h1>
        <p className="text-gray-500 font-body italic text-xl max-w-2xl mx-auto">
          A curation of radiance and refined beauty rituals.
        </p>
        <div className="w-24 h-px bg-gray-200 mx-auto mt-12"></div>
      </header>

      {/* Main Grid Section - Exactly like screenshot */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 gallery-grid">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 auto-rows-[220px] sm:auto-rows-[260px] md:auto-rows-[300px]">
          {images.map((img, i) => (
            <div 
              key={i} 
              className={`gallery-item group relative overflow-hidden rounded-sm cursor-crosshair border border-black/5 ${img.span}`}
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 sm:p-8">
                <span className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.3em] text-[#F2529D] mb-2">{img.category}</span>
                <span className="text-lg sm:text-2xl font-display italic text-white">{img.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lateral / Unique Sideways Scroll Section */}
      <section className="md:hidden mt-20 px-4 sm:px-6 pb-12 bg-[#FAF9F6]">
        {/* The mobile version keeps the story compact so the images do not feel cramped. */}
        {/* Mobile keeps the narrative stacked so each image still gets a little breathing room. */}
        <div className="rounded-[2rem] bg-[#0A0E1A] p-6 sm:p-8 shadow-2xl border border-white/10">
          <p className="text-[#F2529D] uppercase tracking-[0.35em] text-[10px] sm:text-xs font-black mb-3">Extended Curation</p>
          <h2 className="text-3xl sm:text-5xl font-display italic text-white leading-tight">Behind The Canvas</h2>
          <p className="text-gray-400 text-sm sm:text-base italic leading-relaxed mt-4">
            Exploring the delicate intersection of chemistry and artistry. Every product we choose is a testament to purity.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {behindCanvasImages.map((frame, index) => (
            <div key={`frame-${index}`} className={`${frame.span} relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]`}>
              <img src={frame.src} alt={frame.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-[0.55rem] sm:text-[0.7rem] font-black tracking-[0.35em] uppercase text-[#F2529D] mb-2">{frame.title}</p>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed">{frame.copy}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 sm:mt-6 rounded-[2rem] sm:rounded-[3rem] bg-[#FAF9F6] p-6 sm:p-8 border border-gray-100 shadow-xl text-center">
          <h3 className="text-2xl sm:text-4xl font-display italic font-black text-[#0A0E1A]">The Essence of Eternity</h3>
          <p className="text-gray-500 text-sm sm:text-base italic mt-3 leading-relaxed">
            A softer mobile narrative that keeps every image visible and balanced.
          </p>
          <Link to="/booking" className="inline-block mt-5 px-8 py-4 bg-[#F2529D] text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] rounded-full hover:bg-black transition-colors">
            BOOK THE EXPERIENCE
          </Link>
        </div>
      </section>

      <section className="hidden md:block mt-20 sm:mt-40 overflow-hidden lateral-container relative w-full h-auto md:h-screen">
        {/* Desktop gets the full sideways gallery because the wider screen can support it. */}
        {/* The pinned desktop layout turns scrolling into a guided magazine-style walkthrough. */}
        <div className="flex w-[1200vw] h-auto md:h-screen bg-[#0A0E1A] absolute top-0 left-0" ref={scrollRef}>
          <div className="lateral-item w-screen min-h-[80vh] md:h-full flex items-center justify-center p-4 sm:p-8 md:p-20 shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-20 w-full max-w-7xl px-4 sm:px-6 md:px-0">
              <div className="space-y-4 sm:space-y-8 flex flex-col justify-center">
                <h2 className="text-3xl sm:text-5xl md:text-7xl font-display italic text-white">Behind The Canvas</h2>
                <p className="text-gray-400 text-base sm:text-xl font-body italic leading-relaxed">
                  Exploring the delicate intersection of chemistry and artistry. Every product we choose is a testament to purity.
                </p>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop" 
                className="w-full h-[280px] sm:h-[420px] md:h-[600px] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-1000"
                alt="Laboratory aesthetic"
              />
            </div>
          </div>

          {/* Frame 1 */}
          <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0d1321] shrink-0 p-8">
            <img src={sibshall1} alt="Studio Frame 1" className="w-full max-h-[95vh] object-cover rounded-sm shadow-2xl" />
          </div>

          {/* Frame 2 */}
          <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0b0f1a] shrink-0 p-8">
            <img src={sibshall2} alt="Studio Frame 2" className="w-full max-h-[95vh] object-cover rounded-sm shadow-2xl" />
          </div>

          {/* Frame 3 */}
          <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0d1321] shrink-0 p-8">
            <img src={sibshall3} alt="Studio Frame 3" className="w-full max-h-[95vh] object-cover rounded-sm shadow-2xl" />
          </div>

          {/* Frame 4 */}
          <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0d1321] shrink-0 p-8">
            <img src={craftedImage} alt="Tools & Craft" className="w-full max-h-[95vh] object-cover rounded-sm shadow-2xl" />
          </div>

          <div className="lateral-item w-screen h-full flex items-center justify-center p-20 bg-white shrink-0">
            <div className="text-center space-y-12">
              <h3 className="text-3xl sm:text-5xl md:text-8xl lg:text-[12rem] font-display italic font-black leading-none text-[#0A0E1A] opacity-20">Sibs Style</h3>
              <p className="text-2xl font-body italic tracking-widest uppercase text-[#0A0E1A]">The Essence of Eternity</p>
              <Link to="/booking" className="inline-block px-12 py-5 bg-[#F2529D] text-white text-[12px] font-black uppercase tracking-[0.5em] rounded-full hover:bg-black hover:text-white transition-all">
                BOOK THE EXPERIENCE
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GalleryPage;
