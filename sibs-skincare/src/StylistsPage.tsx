import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './components/Footer';
import gsap from 'gsap';

const StylistsPage: React.FC = () => {
  // The page fade starts from the outer wrapper so the layout appears as one curated spread.
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const tl = gsap.timeline();
    
    // This page is mostly a clean showcase, so the intro just fades the cards in nicely.
    gsap.set(containerRef.current, { opacity: 0 });

    tl.to(containerRef.current, { 
      opacity: 1, 
      duration: 1.2, 
      ease: 'power2.inOut',
      delay: 0.1 // Tiny pause for "blank page" effect
    })
    .fromTo('.stylist-header', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
      '-=0.8'
    )
    .fromTo('.stylist-card', 
      { opacity: 0, scale: 0.95, y: 40 }, 
      { opacity: 1, scale: 1, y: 0, duration: 1, stagger: 0.3, ease: 'expo.out' }, 
      '-=0.8'
    )
    .fromTo('.quote-section', 
      { opacity: 0 }, 
      { opacity: 1, duration: 1, ease: 'power2.inOut' }, 
      '-=0.5'
    );
  }, []);

  const stylists = [
    // These bios are written like editorial profiles rather than plain staff records.
    {
      name: 'Elena Vance',
      role: 'MASTER AESTHETICIAN',
      image: 'https://images.unsplash.com/photo-1594744803329-a584af1cae02?q=80&w=800&auto=format&fit=crop',
      bio: 'With over 15 years in luxury skincare, Elena specializes in dermal sculpting and bespoke botanical infusions. Her philosophy centers on cellular regeneration and long-term vitality.'
    },
    {
      name: 'Julian Thorne',
      role: 'SKIN HEALTH CONSULTANT',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&auto=format&fit=crop',
      bio: 'Julian approaches beauty through the lens of chemistry and wellness. His curative sessions focus on inflammatory balance and protective barriers for sensitive complexions.'
    },
    {
      name: 'Sienna Rose',
      role: 'RITUAL ARCHITECT',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop',
      bio: 'The creator of our signature "Luminous Flow," Sienna bridges the gap between holistic meditation and advanced facials to create a transcendental beauty experience.'
    }
  ];

  return (
    <div ref={containerRef} className='bg-[#FAF9F6] min-h-screen text-[#333] font-serif overflow-x-hidden select-none opacity-100'>
      {/* Page Header */}
      <div className='max-w-4xl mx-auto px-4 pt-48 pb-24 text-center stylist-header'>
        <h1 className='text-6xl md:text-8xl font-display text-[#F2529D] italic font-black mb-8 leading-none tracking-tighter'>Our Master Artisans</h1>
        <p className='text-gray-500 text-lg md:text-xl font-medium leading-[1.8] max-w-2xl mx-auto'>
          Meet the visionary curators behind Sibs Style Beauty Lounge. Our artisans blend ancient rituals with modern skin science to reveal your inherent radiance.
        </p>
        <div className='mt-8 flex items-center justify-center gap-4'>
          <div className='h-[1px] w-12 bg-gray-200'></div>
          <span className='text-[10px] font-black tracking-[0.4em] text-gray-400'>ESTABLISHED 2024</span>
          <div className='h-[1px] w-12 bg-gray-200'></div>
        </div>
      </div>

      {/* Stylist List */}
      <div className='max-w-5xl mx-auto px-4 space-y-12 pb-32'>
        {stylists.map((stylist, index) => (
          <div 
            key={index} 
            className='stylist-card bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col md:flex-row items-center p-8 md:p-12 gap-12 group transition-all hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)]'
          >
            <div className='w-full md:w-1/3 aspect-square relative rounded-xl overflow-hidden shadow-xl'>
              <img 
                src={stylist.image} 
                alt={stylist.name} 
                className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110'
              />
              <div className='absolute inset-0 ring-1 ring-inset ring-black/5 rounded-xl'></div>
            </div>
            
            <div className='flex-1 text-center md:text-left'>
              <span className='text-[10px] font-black tracking-[0.3em] text-[#BF9C34] mb-3 block italic'>{stylist.role}</span>
              <h2 className='text-4xl md:text-5xl font-display text-gray-900 mb-6 font-bold'>{stylist.name}</h2>
              <p className='text-gray-600 leading-relaxed font-medium text-lg mb-10 md:max-w-md'>
                {stylist.bio}
              </p>
              <Link 
                to='/booking' 
                className='inline-block px-10 py-4 bg-[#D14081] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-sm shadow-lg hover:bg-[#B21E5D] transition-all hover:-translate-y-1 active:scale-95 decoration-none'
              >
                BOOK RITUAL
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quote Section */}
      <div className='quote-section max-w-4xl mx-auto px-4 py-32 text-center'>
        {/* The quote gives the page a closing note so it reads like a magazine feature. */}
        <div className='flex justify-center mb-8'>
            <div className='text-[#BF9C34] scale-150 transform rotate-12'>✦</div>
            <div className='text-[#BF9C34] scale-100 transform -translate-y-4 -rotate-12 ml-1'>✦</div>
        </div>
        <p className='text-3xl md:text-4xl font-display italic text-gray-800 leading-[1.6] max-w-2xl mx-auto'>
          "Beauty is the illumination of your soul through the vessel of your skin."
        </p>
      </div>

      <Footer />
    </div>
  );
};

export default StylistsPage;
