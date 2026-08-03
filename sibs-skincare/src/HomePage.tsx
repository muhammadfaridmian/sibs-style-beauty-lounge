import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowRight, X } from 'lucide-react';
import silkyCoolProductsImage from './assets/Silkycoolproducts.jpeg';
import goldProductsImage from './assets/Goldproducts.jpeg';
import nailsImage from './assets/Nails.jpeg';
import sibshallImage from './assets/Sibshall.jpeg';
import sibshall2Image from './assets/Sibshall2.jpeg';
import herbalEssenceImage from './assets/HerbalEssence.jpeg';
import { getCollections, getCurrentAuthUser, getStoredAuthToken, type CollectionItem } from './api/convex-api';
import availableProductAssets from './availableProductAssets';
import FlowingMenu, { type FlowingMenuItem } from './components/FlowingMenu';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  // This page is the front window of the site, so most of it is about mood and first impressions.
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isAdminViewer, setIsAdminViewer] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string; imageUrl: string; description: string; price: string }>>([]);

  // A couple of animation branches depend on whether the screen is small.
  // The modal moves differently on mobile because there is less room for the product grid.
  const isMobileViewport = () => window.innerWidth < 768;

  // The FlowingMenu drives the same curtain transition the nav and the Book Now
  // button already use, so every route change on the home page feels identical.
  const handleFlowingNavigate = (path: string) => {
    const event = new CustomEvent('trigger-curtain', { detail: { path } });
    window.dispatchEvent(event);
  };

  // Each entry pairs a destination route with one of the salon's own product
  // images so the hover marquee stays fully on-brand.
  const flowingMenuItems: FlowingMenuItem[] = [
    { link: '/booking', text: 'Treatments', image: nailsImage },
    { link: '/gallery', text: 'Gallery', image: sibshallImage },
    { link: '/offers', text: 'Offers', image: goldProductsImage },
    { link: '/testimonials', text: 'Chronicles', image: herbalEssenceImage },
    { link: '/contact', text: 'Contact', image: sibshall2Image },
  ];

  useEffect(() => {
    let tl: gsap.core.Timeline | undefined;

    if (isCollectionOpen) {
      // The modal feels like a little product gallery, so the body stops scrolling behind it.
      const isMobile = isMobileViewport();
      // Locking scroll keeps the modal centered and prevents the page from drifting underneath it.
      document.body.style.overflow = 'hidden';
      
      // The open animation starts with the dark veil, then lifts the panel forward.
      // Sequencing the overlay first helps the modal feel like it belongs to the page.
      tl = gsap.timeline();
      tl.fromTo('.collection-overlay', 
          { opacity: 0 }, 
          { opacity: 1, duration: isMobile ? 0.14 : 0.8, ease: isMobile ? 'power2.out' : 'power2.inOut' }
      )
      .fromTo('.collection-panel', 
          isMobile
            ? { y: 18, opacity: 0 }
            : { y: 100, opacity: 0, scale: 0.9, rotateX: -20 }, 
          isMobile
            ? { y: 0, opacity: 1, duration: 0.22, ease: 'power2.out' }
            : { y: 0, opacity: 1, scale: 1, rotateX: 0, duration: 1.2, ease: 'expo.out' }, 
          isMobile ? '-=0.05' : '-=0.4'
      );

      if (!isMobile) {
        const productCards = gsap.utils.toArray('.product-card-anim');
        if (productCards.length) {
          tl.fromTo(productCards,
            { y: 60, opacity: 0, rotate: 5 },
            { y: 0, opacity: 1, rotate: 0, duration: 1, stagger: 0.1, ease: 'power4.out' },
            '-=0.8'
          );
        }
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCollectionOpen]);

  // Smooth scroll (Lenis)
  useEffect(() => {
    const lenis = new Lenis();
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Page Entry Transition
    // This is the first impression animation when the home page mounts.
    gsap.fromTo(containerRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 1.2, ease: 'power2.inOut' }
    );

    // Initial positioning for hero elements (guard selectors to avoid GSAP warnings)
    const heroElems = gsap.utils.toArray('.hero-title, .hero-eyebrow, .hero-p, .hero-btn, .hero-img-wrap, .hero-img-bg, .hero-scroll-cue');
    if (heroElems.length) {
      gsap.set(heroElems, {
        opacity: 0,
        y: 50,
        visibility: 'visible'
      });
    }

    const tl = gsap.timeline({ 
      defaults: { ease: 'power4.out' },
      delay: 0.2
    });

    tl.to('.hero-eyebrow', { y: 0, opacity: 1, duration: 0.8, clearProps: 'all' })
      .to('.hero-title', { y: 0, opacity: 1, duration: 1.5, clearProps: 'all' }, '-=0.5')
      .to('.hero-p', { y: 0, opacity: 1, duration: 1 }, '-=1.2')
      .to('.hero-btn', { y: 0, opacity: 1, duration: 1 }, '-=1')
      .to('.hero-img-wrap, .hero-img-bg', { y: 0, opacity: 1, duration: 1.8, clearProps: 'opacity,visibility' }, '-=1.5')
      .to('.hero-scroll-cue', { y: 0, opacity: 1, duration: 1, clearProps: 'all' }, '-=0.6');

    revealRefs.current.forEach((el) => {
      if (el) {
        gsap.fromTo(
          el,
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.5,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
          }
        );
      }
    });

    const handleMouseMove = (e: MouseEvent) => {
      // The image gets a tiny parallax shift so the hero feels more alive.
      const targets = gsap.utils.toArray('.parallax-img');
      if (targets.length) {
        gsap.to(targets, {
          x: (e.clientX - window.innerWidth / 2) / 60,
          y: (e.clientY - window.innerHeight / 2) / 60,
          duration: 1,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      // Each section gets added once so it can fade in as the user scrolls.
      // Keeping the list unique avoids replaying the reveal animation on the same card.
      revealRefs.current.push(el);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadCollectionsAndRole = async () => {
      try {
        const items = await getCollections();
        if (cancelled) return;

        // Each database row becomes one public product card here.
        // If the row has a custom image or asset key, we use that first.
        const mapped = (items as CollectionItem[]).map((item) => {
          const mappedAsset = item.assetKey ? availableProductAssets[item.assetKey] : undefined;
          const imageUrl = item.imageUrl || mappedAsset?.src || silkyCoolProductsImage;

          return {
            id: item.id,
            name: item.title,
            imageUrl,
            description: item.description || 'Botanical luxury for your ritual.',
            price: item.priceLabel || (typeof item.priceCents === 'number' ? `${item.priceCents}` : 'Price on request'),
          };
        });

        setProducts(mapped);
      } catch {
        if (!cancelled) setProducts([]);
      }

      const token = getStoredAuthToken();
      if (!token) {
        if (!cancelled) setIsAdminViewer(false);
        return;
      }

      try {
        const user = await getCurrentAuthUser(token);
        if (!cancelled) setIsAdminViewer(Boolean(user && user.role === 'admin'));
      } catch {
        if (!cancelled) setIsAdminViewer(false);
      }
    };

    loadCollectionsAndRole();
    return () => {
      cancelled = true;
    };
  }, []);

  

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] selection:bg-[#F2529D] selection:text-white pb-16 md:pb-32 opacity-100 overflow-x-hidden">
      {/* Hero Section */}
      <header className="min-h-[50vh] md:min-h-screen flex items-center px-4 md:px-6 bg-[#FAF9F6] pt-36 sm:pt-40 md:pt-0 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center w-full relative">
          <div className="relative z-0 space-y-6 md:space-y-10">
            <div className="hero-eyebrow flex items-center gap-4 !opacity-100 !visible">
              <span className="h-px w-10 md:w-16 bg-[#BF9C34]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">
                Dubai · Beauty Lounge
              </span>
            </div>
            <h1 className="hero-title text-5xl md:text-[8rem] leading-[1] md:leading-[0.85] text-black font-display font-black tracking-tighter !opacity-100 !visible mb-10 md:mb-30">
              The Art <br className="hidden md:block"/> <span className="text-[#F2529D] italic font-black">of Radiant</span>
            </h1>
            <p className="hero-p text-black text-xl md:text-2xl max-w-md italic font-black leading-relaxed !opacity-100 !visible mb-10 md:mb-20">
              Elevating everyday routines into moments of pure botanical luxury.
            </p>
            <button 
                onClick={() => setIsCollectionOpen(true)}
                className="hero-btn bg-black text-white px-8 md:px-12 py-4 md:py-5 rounded-full text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] hover:bg-[#F2529D] transition-all transform hover:-translate-y-1 shadow-2xl !opacity-100 !visible relative z-50 overflow-hidden group"
            >
              <span className="relative z-10">Discover Collection</span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>
          <div className="hero-img-wrap relative block !opacity-100 !visible z-0 mt-10 md:mt-0 lg:w-[460px] xl:w-[500px] lg:justify-self-end lg:self-start">
            <div className="aspect-square md:aspect-[4/5] lg:aspect-[3/4] shadow-2xl relative z-10 overflow-hidden rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-white bg-white">
              <img 
                src={silkyCoolProductsImage}
                className="w-full h-full object-cover parallax-img scale-105" 
                alt="Hero" 
              />
            </div>
            <div className="absolute -top-10 -right-10 w-48 md:w-96 h-48 md:h-96 bg-[#F29ABF] rounded-full mix-blend-multiply filter blur-[50px] md:blur-[100px] opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-48 md:w-96 h-48 md:h-96 bg-[#F2529D] rounded-full mix-blend-multiply filter blur-[50px] md:blur-[100px] opacity-20"></div>
          </div>
        </div>

        {/* Scroll cue — a quiet invitation to keep moving down the page. */}
        <div className="hero-scroll-cue absolute left-1/2 -translate-x-1/2 bottom-6 md:bottom-10 hidden md:flex flex-col items-center gap-2 !opacity-100 !visible">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/40">Scroll</span>
          <span className="block w-px h-10 bg-gradient-to-b from-black/40 to-transparent" />
        </div>
      </header>

      {/* Collection Modal Panel */}
      {isCollectionOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 md:bg-black/60 backdrop-blur-none md:backdrop-blur-3xl flex items-center justify-center p-2 md:p-4 collection-overlay overflow-x-hidden" style={{ willChange: 'opacity, transform' }}>
            {/* Animated background auras */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-[#F2529D]/10 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-[#BF9C34]/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
            </div>

            <div 
              className="bg-[#FAF9F6] w-[calc(100vw-1rem)] md:w-full max-w-7xl h-[calc(100dvh-1rem)] md:h-[85vh] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[5rem] shadow-[0_0_60px_rgba(0,0,0,0.35)] md:shadow-[0_0_120px_rgba(0,0,0,0.6)] relative flex flex-col collection-panel overflow-hidden overflow-x-hidden md:[transform:perspective(1000px)]"
            >
                {/* Header */}
            <div className="flex-none p-4 sm:p-6 md:p-14 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl relative z-10">
                    <div>
                <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black tracking-[0.45em] sm:tracking-[0.5em] text-[#F2529D] uppercase block mb-2 md:mb-3">CURATED SELECTION</span>
                <h2 className="text-2xl sm:text-3xl md:text-6xl font-display italic font-black text-black tracking-tighter">The Botanical Lab</h2>
                    </div>
                    <button 
                        onClick={() => {
                            const isMobile = isMobileViewport();
                            const tl = gsap.timeline();
                            if (isMobile) {
                              tl.to('.collection-panel', { y: 12, opacity: 0, duration: 0.16, ease: 'power2.in' })
                                .to('.collection-overlay', { opacity: 0, duration: 0.12, onComplete: () => setIsCollectionOpen(false) }, '-=0.06');
                              return;
                            }

                            tl.to('.product-card-anim', { y: 20, opacity: 0, stagger: 0.05, duration: 0.3, ease: 'power2.in' })
                              .to('.collection-panel', { y: 50, opacity: 0, scale: 0.95, duration: 0.4, ease: 'expo.in' }, '-=0.1')
                              .to('.collection-overlay', { opacity: 0, duration: 0.3, onComplete: () => setIsCollectionOpen(false) }, '-=0.2');
                        }}
                        className="bg-black text-white p-2.5 sm:p-3 md:p-6 rounded-full hover:bg-[#F2529D] transition-all hover:rotate-90 shadow-2xl group shrink-0 ml-3 sm:ml-4"
                    >
                        <X className="w-5 h-5 md:w-8 md:h-8 group-hover:scale-110" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-20 custom-scrollbar relative">
                  {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                      {products.map((product) => (
                        <article key={product.id} className="product-card-anim rounded-[1.5rem] bg-white border border-gray-100 overflow-hidden shadow-[0_20px_50px_-25px_rgba(0,0,0,0.2)]">
                          <div className="aspect-[3/2] overflow-hidden bg-[#FAF9F6] flex items-center justify-center p-4">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="p-4 md:p-6 space-y-2">
                            <h4 className="text-xl md:text-2xl font-display italic font-black text-black">{product.name}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
                            <p className="text-sm md:text-base font-black text-[#F2529D]">{product.price}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-2xl text-center space-y-4 sm:space-y-6 mx-auto">
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[#F2529D]">Discover Collection</p>
                      {isAdminViewer ? (
                        <>
                          <h3 className="text-3xl sm:text-5xl font-display italic font-black text-black">Collection hidden for now</h3>
                          <p className="text-sm sm:text-lg text-gray-500 leading-relaxed">
                            The container is intentionally empty until you want to bring the product cards back.
                          </p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-3xl sm:text-5xl font-display italic font-black text-black">No products available right now</h3>
                          <p className="text-sm sm:text-lg text-gray-500 leading-relaxed">
                            Please check back soon for our latest curated collection.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                <div className="flex-none p-4 sm:p-6 md:p-14 bg-white/80 backdrop-blur-md border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 md:gap-8">
                  <p className="text-xs sm:text-sm md:text-xl font-medium text-gray-500 italic max-w-2xl text-center md:text-left leading-relaxed">
                        Our botanical formulations are hand-crafted in small batches to preserve nutrient integrity and enzymatic activity.
                    </p>
                </div>
            </div>
        </div>
      )}

      {/* Philosophy Section */}
      <section className="py-20 md:py-48 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 md:gap-32 items-center">
          <div ref={addToRefs} className="relative">
            <div className="shadow-2xl overflow-hidden rounded-[2rem]">
              <img 
                src={goldProductsImage} 
                className="w-full h-[400px] md:h-[700px] object-cover" 
                alt="Texture" 
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white p-10 md:p-12 rounded-3xl shadow-2xl border border-gray-50 hidden lg:block">
              <span className="text-6xl md:text-7xl text-[#F2529D] font-display italic block leading-none">100%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Botanical Essence</span>
            </div>
          </div>
          <div ref={addToRefs} className="space-y-8 md:space-y-12">
            <div className="flex items-center gap-4">
              <span className="w-16 md:w-20 h-[2px] bg-[#BF9C34]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Our Philosophy</span>
            </div>
            <h2 className="text-4xl md:text-8xl italic leading-tight text-gray-900 font-light font-display">
              Our Philosophy <span className="text-[#BF9C34]">of Beauty</span>
            </h2>
            <div className="space-y-6 md:space-y-8 text-gray-500 leading-relaxed text-base md:text-xl font-light">
              <p>True radiance comes from a harmony of nature's finest ingredients and the artful application of sophisticated rituals.</p>
              <p>Our curation represents the pinnacle of <span className="text-[#F2529D] italic font-display">botanical luxury</span>, transforming routines into ceremonies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Explore / FlowingMenu Section — interactive navigation into the rest of the lounge.
          The dark backdrop flows straight into the CTA below so the page ends on one
          continuous, dramatic finale. */}
      <section ref={addToRefs} className="bg-[#0A0E1A] relative overflow-hidden">
        {/* Soft brand auras keep the dark zone from feeling flat. */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#F2529D]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#BF9C34]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 md:pt-32 pb-6 md:pb-10 text-center relative">
          <div className="flex items-center justify-center gap-4 mb-5 md:mb-7">
            <span className="h-px w-10 md:w-16 bg-[#BF9C34]" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">The Lounge</span>
            <span className="h-px w-10 md:w-16 bg-[#BF9C34]" />
          </div>
          <h2 className="text-4xl md:text-7xl font-display italic text-[#FAF9F6] leading-tight">
            Explore the <span className="text-[#F2529D]">Experience</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-lg max-w-xl mx-auto mt-4 md:mt-6 font-light">
            Every door opens into a different ritual. Hover, drift, and step inside.
          </p>
        </div>

        <div className="h-[60vh] min-h-[440px] md:h-[600px] w-full relative">
          <FlowingMenu
            items={flowingMenuItems}
            speed={18}
            textColor="#FAF9F6"
            bgColor="#0A0E1A"
            marqueeBgColor="#F2529D"
            marqueeTextColor="#FAF9F6"
            borderColor="rgba(250,249,246,0.10)"
            onNavigate={handleFlowingNavigate}
          />
        </div>
      </section>

      {/* Footer-like CTA */}
      <section className="py-24 md:py-40 px-6 bg-[#0A0E1A] text-white overflow-hidden relative -mb-35 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8 md:space-y-12">
            <div className="flex items-center gap-4">
              <span className="h-px w-10 md:w-16 bg-[#BF9C34]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Begin Your Journey</span>
              <span className="h-px w-10 md:w-16 bg-[#BF9C34]" />
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display italic text-balance">Ready to Begin Your Ritual?</h2>
            <p className="text-gray-400 text-base md:text-xl max-w-2xl font-light px-4">Experience the synergy of botanical science and artistic beauty at Sibs Style.</p>
            <button 
                onClick={() => {
                    // This CTA uses the same curtain event as the nav so the handoff feels consistent.
                  const event = new CustomEvent('trigger-curtain', { detail: { path: '/booking' } });
                  window.dispatchEvent(event);
                }}
                className="bg-[#F2529D] text-white px-10 md:px-16 py-4 md:py-6 rounded-xl font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-white hover:text-black transition-all flex items-center space-x-3 md:space-x-4 group cursor-pointer text-xs md:text-base"
            >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 md:group-hover:translate-x-2 transition-transform" />
            </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
