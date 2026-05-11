import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

// The gallery is mostly a visual story page, so the motion work does most of the talking.
const images = [
  {
    url: 'https://i.pinimg.com/1200x/a3/43/df/a343dfb6e615e0e65a48411ab0ab833a.jpg', // Luxury Serum Bottle
    title: 'Radiance Elixir',
    category: 'Product Edit',
    span: 'md:row-span-2'
  },
  {
    url: 'https://i.pinimg.com/1200x/66/23/9a/66239a1485de08d7c9d73f52e4ca2408.jpg', // Cream Texture
    title: 'Satin Touch',
    category: 'Texture Study',
    span: 'col-span-1'
  },
  {
    url: 'https://i.pinimg.com/736x/b8/ec/cb/b8eccbefb90d0b642f1152624fa09459.jpg', // Aesthetic Spa Interior
    title: 'The Sanctuary',
    category: 'Space',
    span: 'col-span-1'
  },
  {
    url: 'https://i.pinimg.com/1200x/a3/20/48/a320481f501bec266ffc9c8c494cff69.jpg', // Face Oil / Amber Glass
    title: 'Golden Hour',
    category: 'Oil Infusion',
    span: 'md:row-span-1'
  },
  {
    url: 'https://i.pinimg.com/736x/26/8d/22/268d22a96e65f8e21b6ea4836e1a3644.jpg', // Spa Lounge dark velvet
    title: 'Velvet Lounge',
    category: 'Interior',
    span: 'col-span-1'
  },
  {
    url: 'https://i.pinimg.com/1200x/67/fb/63/67fb63d99a2ea5fce9cb0a074d6b73ba.jpg', // Woman applying cream
    title: 'The Ritual',
    category: 'Self Care',
    span: 'md:row-span-2'
  },
  {
    url: 'https://i.pinimg.com/736x/5c/16/eb/5c16eb439f95a147912e87c8f4a297d1.jpg', // Collection of bottles
    title: 'Curated Essentials',
    category: 'Collection',
    span: 'md:col-span-2'
  },
  {
    url: 'https://i.pinimg.com/736x/74/3e/7e/743e7e91713fd66db2f223afe5c2255e.jpg', // Abstract light/glow
    title: 'Inner Glow',
    category: 'Abstract',
    span: 'col-span-1'
  },
  {
    url: 'src/assets/btesnce.png', // Dropper/Oil
    title: 'Botanical Essence',
    category: 'Micro Edit',
    span: 'md:col-span-2'
  },
  {
    url: 'https://images.unsplash.com/photo-1552046122-03184de85e08?q=80&w=800&auto=format&fit=crop', // Minimalist bathroom/skincare
    title: 'The Shelfie',
    category: 'Minimalism',
    span: 'col-span-1 aspect-square md:translate-y-12'
  },
  {
    url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800&auto=format&fit=crop', // Close up skin
    title: 'Raw Texture',
    category: 'Skin Study',
    span: 'col-span-1 rounded-full p-4 grayscale hover:grayscale-0 transition-all'
  },
  {
    url: 'src/assets/craftedprecision.png', // Luxury spa tools
    title: 'Crafted Precision',
    category: 'Tools',
    span: 'col-span-1'
  }
];

const behindCanvasMobileFrames = [
  {
    kind: 'text',
    title: 'Behind The Canvas',
    copy: 'Exploring the delicate intersection of chemistry and artistry. Every product we choose is a testament to purity.',
    span: 'sm:col-span-2'
  },
  {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    title: 'Laboratory Aesthetic',
    copy: 'Clean lines, soft light, and a clinical calm.',
    span: 'sm:col-span-2 aspect-[4/5]'
  },
  {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=2000&auto=format&fit=crop',
    title: 'Purity',
    copy: 'Natural botanicals only.',
    span: 'col-span-1 aspect-[4/5]'
  },
  {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1200&auto=format',
    title: 'Ritual Form',
    copy: 'A precise, serene product study.',
    span: 'col-span-1 aspect-[4/5]'
  },
  {
    kind: 'image',
    src: 'https://i.pinimg.com/736x/e8/0d/7a/e80d7a19a4f9af15c80092a051cc448a.jpg',
    title: 'Texture Layer',
    copy: 'Soft contrast and depth.',
    span: 'col-span-1 aspect-square'
  },
  {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1620916566398-39f114387c9b?q=80&w=1200&auto=format',
    title: 'Surface Study',
    copy: 'A calm visual pause.',
    span: 'col-span-1 aspect-square'
  },
  {
    kind: 'image',
    src: 'https://i.pinimg.com/1200x/6c/52/bc/6c52bccbcfb4a44f11d8813cca6ba059.jpg',
    title: 'Botanical Macro',
    copy: 'Close, luminous detail.',
    span: 'sm:col-span-2 aspect-[16/10]'
  },
  {
    kind: 'image',
    src: 'https://i.pinimg.com/1200x/6a/b3/8d/6ab38d01a89bf76b5421a3256bf1062f.jpg',
    title: 'Glow Texture',
    copy: 'A soft visual veil.',
    span: 'col-span-1 aspect-[4/5]'
  },
  {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1582213752795-ef2642d17ad8?q=80&w=1200&auto=format',
    title: 'Molecular Perfection',
    copy: 'Exploring the delicate intersection of chemistry and artistry.',
    span: 'sm:col-span-2 aspect-[4/5]'
  },
  {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop',
    title: 'Model Ritual',
    copy: 'A softer cinematic finish.',
    span: 'sm:col-span-2 aspect-[16/10]'
  },
  {
    kind: 'image',
    src: 'https://images.unsplash.com/photo-1512496011951-a62340ae4b22?q=80&w=1200&auto=format&fit=crop',
    title: 'Final Portrait',
    copy: 'The closing frame of the story.',
    span: 'sm:col-span-2 aspect-[4/5]'
  }
];

const GalleryPage = () => {
  const scrollRef = useRef(null);
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
        <div className="rounded-[2rem] bg-[#0A0E1A] p-6 sm:p-8 shadow-2xl border border-white/10">
          <p className="text-[#F2529D] uppercase tracking-[0.35em] text-[10px] sm:text-xs font-black mb-3">Extended Curation</p>
          <h2 className="text-3xl sm:text-5xl font-display italic text-white leading-tight">Behind The Canvas</h2>
          <p className="text-gray-400 text-sm sm:text-base italic leading-relaxed mt-4">
            Exploring the delicate intersection of chemistry and artistry. Every product we choose is a testament to purity.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {behindCanvasMobileFrames.map((frame, index) =>
            frame.kind === 'text' ? null : (
              <div key={`${frame.kind}-${index}`} className={`${frame.span} relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-black shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)]`}>
                <img src={frame.src} alt={frame.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <p className="text-[0.55rem] sm:text-[0.7rem] font-black tracking-[0.35em] uppercase text-[#F2529D] mb-2">{frame.title}</p>
                  <p className="text-white/80 text-xs sm:text-sm leading-relaxed">{frame.copy}</p>
                </div>
              </div>
            )
          )}
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

          {/* New Lateral Section 1 - Macro Ritual */}
          <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#FAF9F6] shrink-0 p-4 sm:p-8 md:p-32">
            <div className="relative w-full h-full border-[20px] border-white shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1590439471364-192aa70c0b53?q=80&w=2000&auto=format&fit=crop" 
                className="w-full h-full object-cover"
                alt="Cream ritual"
              />
              <div className="absolute top-10 right-10 bg-black text-white p-8 max-w-xs">
                 <p className="font-display italic text-3xl">Purity</p>
                 <p className="text-xs uppercase tracking-widest mt-2">Natural botanicals only.</p>
              </div>
            </div>
          </div>

          {/* New Lateral Section 2 - Product Array Split 1 */}
           <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0d1321] shrink-0 p-4 sm:p-8 md:p-20">
             <img src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1200&auto=format" className="w-full h-full object-cover rounded-sm" />
          </div>

          {/* New Lateral Section 2 - Product Array Split 2 */}
           <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0b0f1a] shrink-0 p-4 sm:p-8 md:p-20">
             <img src="https://i.pinimg.com/736x/e8/0d/7a/e80d7a19a4f9af15c80092a051cc448a.jpg" className="w-full h-full object-cover rounded-sm" />
          </div>

          {/* New Lateral Section 2 - Product Array Split 3 */}
           <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0d1321] shrink-0 p-4 sm:p-8 md:p-20">
             <img src="https://images.unsplash.com/photo-1620916566398-39f114387c9b?q=80&w=1200&auto=format" className="w-full h-full object-cover rounded-sm" />
          </div>

          {/* New Lateral Section 5 - Botanical Macro */}
           <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0d1321] shrink-0 p-4 sm:p-8 md:p-20">
             <img src="https://i.pinimg.com/1200x/6c/52/bc/6c52bccbcfb4a44f11d8813cca6ba059.jpg" className="w-full h-full object-cover rounded-sm" />
          </div>

          {/* New Lateral Section 6 - Glow Texture */}
           <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#0b0f1a] shrink-0 p-4 sm:p-8 md:p-20">
             <img src="https://i.pinimg.com/1200x/6a/b3/8d/6ab38d01a89bf76b5421a3256bf1062f.jpg" className="w-full h-full object-cover rounded-sm" />
          </div>

          {/* New Lateral Section 3 - The Lab */}
          <div className="lateral-item w-screen h-full flex items-center justify-center bg-white shrink-0">
             <div className="flex flex-col items-center px-4">
               <img src="https://images.unsplash.com/photo-1582213752795-ef2642d17ad8?q=80&w=1200&auto=format" className="w-[70vw] sm:w-[50vw] grayscale blur-sm hover:blur-none transition-all duration-1000" />
               <h3 className="text-2xl sm:text-4xl font-display italic mt-6 sm:mt-8 text-center">Molecular Perfection</h3>
             </div>
          </div>

          {/* New Lateral Section 4 - Full Span Landscape */}
          <div className="lateral-item w-screen h-full flex items-center justify-center shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2000&auto=format&fit=crop" 
              className="w-full h-full object-cover brightness-50"
              alt="Model ritual"
            />
          </div>

          <div className="lateral-item w-screen h-full flex items-center justify-center bg-[#FAF9F6] shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1512496011951-a62340ae4b22?q=80&w=1200&auto=format&fit=crop" 
              className="w-[80vw] h-[70vh] object-cover shadow-2xl"
              alt="Model ritual"
            />
          </div>

          <div className="lateral-item w-screen h-full flex items-center justify-center p-20 text-[#FAF9F6] shrink-0">
            <div className="text-center space-y-12">
              <h3 className="text-3xl sm:text-5xl md:text-8xl lg:text-[12rem] font-display italic font-black leading-none opacity-20">Sibs Style</h3>
              <p className="text-2xl font-body italic tracking-widest uppercase">The Essence of Eternity</p>
              <Link to="/booking" className="inline-block px-12 py-5 bg-[#F2529D] text-white text-[12px] font-black uppercase tracking-[0.5em] rounded-full hover:bg-white hover:text-black transition-all">
                BOOK THE EXPERIENCE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer from Screenshot */}
      <footer className="bg-black text-white pt-32 pb-12 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-20 mb-12">
           <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 md:mb-0">
             <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
             <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
           </div>
           
           <h4 className="text-5xl font-display italic font-black">Sibs Style</h4>

           <div className="flex gap-8 text-white/50">
             <span className="cursor-pointer hover:text-[#F2529D] transition-colors font-display italic text-2xl">Fb</span>
             <span className="cursor-pointer hover:text-[#F2529D] transition-colors font-display italic text-2xl">Ig</span>
           </div>
        </div>
        <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
          © 2024 SIBS STYLE BEAUTY LOUNGE. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};

export default GalleryPage;
