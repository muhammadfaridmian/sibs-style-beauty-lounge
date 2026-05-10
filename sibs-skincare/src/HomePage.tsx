import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Flower2, Droplets, Eye, ArrowRight, X, Heart, Star, ShoppingBag } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  const isMobileViewport = () => window.innerWidth < 768;

  useEffect(() => {
    let tl: gsap.core.Timeline | undefined;

    if (isCollectionOpen) {
      const isMobile = isMobileViewport();
      document.body.style.overflow = 'hidden';
      
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
        tl.fromTo('.product-card-anim', 
            { y: 60, opacity: 0, rotate: 5 }, 
            { y: 0, opacity: 1, rotate: 0, duration: 1, stagger: 0.1, ease: 'power4.out' },
            '-=0.8'
        );
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCollectionOpen]);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Page Entry Transition
    gsap.fromTo(containerRef.current, 
      { opacity: 0 }, 
      { opacity: 1, duration: 1.2, ease: 'power2.inOut' }
    );

    // Initial positioning for hero elements
    gsap.set(['.hero-title', '.hero-p', '.hero-btn', '.hero-img-wrap', '.hero-img-bg'], { 
      opacity: 0,
      y: 50,
      visibility: 'visible'
    });

    const tl = gsap.timeline({ 
      defaults: { ease: 'power4.out' },
      delay: 0.2
    });

    tl.to('.hero-title', { y: 0, opacity: 1, duration: 1.5, clearProps: 'all' })
      .to('.hero-p', { y: 0, opacity: 1, duration: 1 }, '-=1.2')
      .to('.hero-btn', { y: 0, opacity: 1, duration: 1 }, '-=1')
      .to('.hero-img-wrap, .hero-img-bg', { y: 0, opacity: 1, duration: 1.8, clearProps: 'opacity,visibility' }, '-=1.5');

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
      gsap.to('.parallax-img', {
        x: (e.clientX - window.innerWidth / 2) / 60,
        y: (e.clientY - window.innerHeight / 2) / 60,
        duration: 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const addToRefs = (el: HTMLDivElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const collections = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Luminous Serum',
      desc: 'An elixir of illuminating botanicals for ethereal radiance.',
      btn: 'Shop Elixir'
    },
    {
      icon: <Flower2 className="w-6 h-6" />,
      title: 'Floral Facelift',
      desc: 'Restorative ritual utilizing rare floral extracts to rejuvenate.',
      btn: 'Explore Ritual'
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: 'Velvet Mask',
      desc: 'Nourishing mask that restores optimal moisture balance.',
      btn: 'Shop Mask'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Celestial Eye',
      desc: 'Potent formula to brighten and reduce fine lines.',
      btn: 'Shop Creme'
    }
  ];

  const products = [
    { name: 'Aurora Serum', price: '$89', img: 'https://images.unsplash.com/photo-1596462502278-27ec8229babb?q=80&w=800', note: 'Hyaluronic Infusion', rating: '5.0' },
    { name: 'Orchid Cleanser', price: '$54', img: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800', note: 'Botanical Base', rating: '4.9' },
    { name: 'Moonlight Mask', price: '$72', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800', note: 'Ethereal Clay', rating: '4.8' },
    { name: 'Solaris Mist', price: '$45', img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800', note: 'Rosewater Essence', rating: '5.0' },
    { name: 'Velvet Elixir', price: '$126', img: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5c?q=80&w=800', note: 'Bakuchiol Blend', rating: '4.9' },
    { name: 'Crystal Toner', price: '$38', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800', note: 'Crystal Infused', rating: '4.7' },
    { name: 'Glow Nectar', price: '$94', img: 'https://images.unsplash.com/photo-1621607512214-68297480165e?q=80&w=800', note: 'Vitamin C Complex', rating: '5.0' },
    { name: 'Sage Ritual', price: '$65', img: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800', note: 'Detoxifying Oil', rating: '4.8' },
    { name: 'Lumiere Creme', price: '$110', img: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800', note: 'Silk Peptide', rating: '4.9' },
    { name: 'Prism Polish', price: '$58', img: 'https://images.unsplash.com/photo-1556227834-09f19db7875e?q=80&w=800', note: 'Fine Sand Enzyme', rating: '4.8' }
  ];

  useEffect(() => {
    let cancelled = false;
    const supportsIdleCallback = typeof window.requestIdleCallback === 'function';

    const preloadImages = () => {
      if (cancelled) return;

      products.forEach((product) => {
        const image = new Image();
        image.decoding = 'async';
        image.src = product.img;
      });
    };

    const idleCallback = window.requestIdleCallback
      ? window.requestIdleCallback(preloadImages, { timeout: 1500 })
      : window.setTimeout(preloadImages, 600);

    return () => {
      cancelled = true;
      if (supportsIdleCallback) {
        window.cancelIdleCallback(idleCallback as number);
      } else {
        window.clearTimeout(idleCallback as number);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] selection:bg-[#F2529D] selection:text-white pb-16 md:pb-32 opacity-100">
      {/* Hero Section */}
      <header className="min-h-[50vh] md:min-h-screen flex items-center px-4 md:px-6 bg-[#FAF9F6] pt-36 sm:pt-40 md:pt-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center w-full relative">
          <div className="relative z-0 space-y-8 md:space-y-12">
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
          <div className="hero-img-wrap relative block !opacity-100 !visible z-0 mt-10 md:mt-0">
            <div className="aspect-square md:aspect-[3/4] shadow-2xl relative z-10 overflow-hidden rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-white bg-white">
              <img 
                src="https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2000" 
                className="w-full h-full object-cover parallax-img scale-105" 
                alt="Hero" 
              />
            </div>
            <div className="absolute -top-10 -right-10 w-48 md:w-96 h-48 md:h-96 bg-[#F29ABF] rounded-full mix-blend-multiply filter blur-[50px] md:blur-[100px] opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-48 md:w-96 h-48 md:h-96 bg-[#F2529D] rounded-full mix-blend-multiply filter blur-[50px] md:blur-[100px] opacity-20"></div>
          </div>
        </div>
      </header>

      {/* Collection Modal Panel */}
      {isCollectionOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 md:bg-black/60 backdrop-blur-none md:backdrop-blur-3xl flex items-center justify-center p-2 md:p-4 collection-overlay" style={{ willChange: 'opacity, transform' }}>
            {/* Animated background auras */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
                <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-[#F2529D]/10 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-[#BF9C34]/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
            </div>

            <div 
              className="bg-[#FAF9F6] w-full max-w-7xl h-[90vh] md:h-[85vh] rounded-[2rem] md:rounded-[5rem] shadow-[0_0_60px_rgba(0,0,0,0.35)] md:shadow-[0_0_120px_rgba(0,0,0,0.6)] relative flex flex-col collection-panel overflow-hidden md:[transform:perspective(1000px)]"
              style={{ position: 'fixed', top: isMobileViewport() ? '2%' : '5%', willChange: 'transform, opacity' }}
            >
                {/* Header */}
                <div className="flex-none p-6 md:p-14 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl relative z-10">
                    <div>
                        <span className="text-[9px] md:text-[10px] font-black tracking-[0.5em] text-[#F2529D] uppercase block mb-2 md:mb-3">CURATED SELECTION</span>
                        <h2 className="text-3xl md:text-6xl font-display italic font-black text-black tracking-tighter">The Botanical Lab</h2>
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
                        className="bg-black text-white p-3 md:p-6 rounded-full hover:bg-[#F2529D] transition-all hover:rotate-90 shadow-2xl group shrink-0 ml-4"
                    >
                        <X className="w-5 h-5 md:w-8 md:h-8 group-hover:scale-110" />
                    </button>
                </div>

                {/* Grid View */}
                <div className="flex-1 overflow-y-auto p-6 md:p-20 custom-scrollbar relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-16">
                        {products.map((product, idx) => (
                            <div key={idx} className="product-card-anim group">
                                <div className="aspect-[4/5] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white shadow-xl mb-4 md:mb-8 relative group-hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.15)] transition-all duration-700">
                                  <img src={product.img} loading="eager" decoding="async" className="w-full h-full object-cover grayscale-[0.2] md:group-hover:grayscale-0 md:group-hover:scale-110 transition-all duration-1000" alt={product.name} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 md:p-10">
                                        <button className="w-full py-4 md:py-5 bg-white/90 md:bg-white text-black text-[10px] md:text-xs font-black tracking-[0.2em] uppercase rounded-xl hover:bg-[#F2529D] hover:text-white transition-all transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 duration-500">
                                            Quick View
                                        </button>
                                    </div>
                                    <div className="absolute top-4 right-4 md:top-8 md:right-8 p-2 md:p-3 bg-white/20 backdrop-blur-md rounded-full text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <Heart size={16} fill="white" className="md:w-5 md:h-5" />
                                    </div>
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                    <div className="flex flex-col sm:flex-row justify-between sm:items-center text-[10px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.3em] text-[#F2529D] uppercase gap-2 sm:gap-0">
                                        <span>{product.note}</span>
                                        <div className="flex items-center gap-1.5 bg-[#BF9C34]/5 px-2 py-1 md:px-3 md:py-1 rounded-full w-fit">
                                            <Star size={10} fill="#BF9C34" color="#BF9C34" className="md:w-3 md:h-3" />
                                            <span className="text-[#BF9C34] font-black">{product.rating}</span>
                                        </div>
                                    </div>
                                    <h4 className="text-xl md:text-3xl font-display italic font-black text-black group-hover:text-[#F2529D] transition-colors leading-tight">{product.name}</h4>
                                    <p className="text-sm md:text-xl font-black text-gray-500 font-mono tracking-tighter">{product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Section */}
                <div className="flex-none p-6 md:p-14 bg-white/80 backdrop-blur-md border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8">
                    <p className="text-sm md:text-xl font-medium text-gray-500 italic max-w-2xl text-center md:text-left leading-relaxed">
                        Our botanical formulations are hand-crafted in small batches to preserve nutrient integrity and enzymatic activity.
                    </p>
                    <button className="w-full md:w-auto flex justify-center items-center gap-4 md:gap-6 bg-black text-white px-8 md:px-14 py-4 md:py-6 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black tracking-[0.2em] md:tracking-[0.3em] uppercase hover:bg-[#BF9C34] transition-all shadow-xl active:scale-95 group shrink-0">
                        EXPLORE FULL CATALOGUE
                        <ShoppingBag size={18} className="md:w-[22px] md:h-[22px] group-hover:animate-bounce" />
                    </button>
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
                src="https://i.pinimg.com/1200x/1c/50/15/1c50159eea9cf20752fba1401f90a8ec.jpg" 
                className="w-full h-[400px] md:h-[700px] object-cover" 
                alt="Texture" 
              />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white p-12 rounded-3xl shadow-2xl border border-gray-50 hidden lg:block">
              <span className="text-7xl text-[#F2529D] font-display italic block">100%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Botanical Essence</span>
            </div>
          </div>
          <div ref={addToRefs} className="space-y-8 md:space-y-12">
            <div className="w-16 md:w-20 h-[2px] bg-[#BF9C34]"></div>
            <h2 className="text-4xl md:text-8xl italic leading-tight text-gray-900 font-light font-display">
              Our Philosophy <span className="text-[#BF9C34]">of Beauty</span>
            </h2>
            <div className="space-y-6 md:space-y-8 text-gray-500 leading-relaxed text-base md:text-xl font-light">
              <p>True radiance comes from a harmony of nature's finest ingredients and the artful application of sophisticated rituals.</p>
              <p>Our curation represents the pinnacle of <span className="text-pink-400 italic font-display">botanical luxury</span>, transforming routines into ceremonies.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-20 md:py-48 px-6 bg-[#FAF9F6] overflow-hidden">
        <div ref={addToRefs} className="max-w-7xl mx-auto text-center mb-16 md:mb-36">
          <p className="text-[#BF9C34] uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-[13px] font-black mb-3 md:mb-5">Signature Curation</p>
          <h2 className="text-4xl md:text-[6.5rem] italic font-black font-display leading-none tracking-tighter text-black">Curated Collections</h2>
        </div>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {collections.map((item, i) => (
            <div 
              key={i} 
              ref={addToRefs}
              className="group relative p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] bg-white text-center md:hover:translate-y-[-24px] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.06)] md:hover:shadow-[0_60px_100px_-30px_rgba(0,0,0,0.15)] border-2 border-transparent md:hover:border-[#BF9C34]/10 transition-all duration-700 cursor-pointer flex flex-col items-center overflow-hidden"
            >
              {/* Subtle glass background effect on hover */}
              <div className="absolute inset-0 bg-[#BF9C34]/[0.02] opacity-0 md:group-hover:opacity-100 transition-opacity duration-700 rounded-[4rem]"></div>
              
              {/* Decorative corner accent */}
              <div className="absolute -top-10 -right-10 w-24 h-24 md:w-32 md:h-32 bg-[#F2529D]/5 rounded-full blur-2xl md:blur-3xl md:group-hover:bg-[#F2529D]/10 transition-colors duration-700"></div>

              <div className="relative z-10 w-16 h-16 md:w-24 md:h-24 bg-gray-50 rounded-2xl md:rounded-3xl mb-8 md:mb-12 flex items-center justify-center md:group-hover:bg-black md:group-hover:rotate-[15deg] transition-all duration-700 text-[#F2529D] shadow-sm transform-gpu">
                {item.icon}
                {/* Floating particle detail */}
                <div className="absolute -top-2 -right-2 w-3 h-3 md:w-4 md:h-4 bg-[#BF9C34] rounded-full scale-0 md:group-hover:scale-100 transition-transform delay-300 duration-500"></div>
              </div>

              <div className="relative z-10 space-y-3 md:space-y-4 flex-grow">
                <h3 className="text-2xl md:text-3xl lg:text-4xl text-black md:group-hover:text-[#F2529D] italic font-black font-display leading-[1.1] transition-colors duration-500 px-2">{item.title}</h3>
                
                {/* Visual Separator */}
                <div className="w-8 h-[2px] md:w-12 md:h-[2px] bg-gray-100 mx-auto md:group-hover:w-20 md:group-hover:bg-[#BF9C34] transition-all duration-700"></div>
                
                <p className="text-sm md:text-lg text-gray-400 md:group-hover:text-gray-600 leading-relaxed font-bold transition-colors duration-500 mt-2 md:mt-4 px-2 md:px-4">{item.desc}</p>
              </div>

              <div className="relative z-10 w-full mt-8 md:mt-12 overflow-hidden rounded-full">
                <button className="w-full py-4 md:py-6 rounded-full text-[10px] md:text-[13px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] bg-gray-50 text-gray-400 md:group-hover:bg-[#F2529D] md:group-hover:text-white transition-all duration-500 shadow-sm active:scale-95 border border-transparent hover:shadow-lg">
                  {item.btn}
                </button>
              </div>
              
              {/* Background text decoration */}
              <div className="absolute -bottom-4 -left-4 text-7xl md:text-9xl font-display italic text-gray-50 opacity-0 md:group-hover:opacity-100 transition-opacity duration-1000 select-none pointer-events-none -z-10 hidden md:block">
                0{i + 1}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer-like CTA */}
      <section className="py-24 md:py-40 px-6 bg-[#0A0E1A] text-white overflow-hidden relative -mb-35 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-20">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8 md:space-y-12">
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-display italic text-balance">Ready to Begin Your Ritual?</h2>
            <p className="text-gray-400 text-base md:text-xl max-w-2xl font-light px-4">Experience the synergy of botanical science and artistic beauty at Sibs Style.</p>
            <button 
                onClick={() => {
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