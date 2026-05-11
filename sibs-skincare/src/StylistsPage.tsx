import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
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

      {/* Simple Footer */}
      {/* The footer stays lighter and more minimal than the hero and cards above it. */}
      <footer className='border-t border-gray-100 bg-white py-24'>
        <div className='max-w-7xl mx-auto px-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-16'>
            <div className='col-span-1 md:col-span-1'>
              <h3 className='text-2xl font-display italic font-bold text-gray-900 mb-6'>Sibs Style</h3>
              <p className='text-sm text-gray-500 leading-relaxed font-medium'>
                An editorial approach to skincare, curated for the modern aesthetic enthusiast.
              </p>
            </div>
            
            <div>
              <h4 className='text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-8'>EXPERIENCE</h4>
              <ul className='space-y-4 text-xs font-bold text-gray-500'>
                <li><Link to='/booking' className='hover:text-[#D14081] transition-colors decoration-none'>Rituals</Link></li>
                <li><Link to='/' className='hover:text-[#D14081] transition-colors decoration-none'>Boutique</Link></li>
                <li><Link to='/artisans' className='hover:text-[#D14081] transition-colors decoration-none'>Our Artisans</Link></li>
              </ul>
            </div>

            <div>
              <h4 className='text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-8'>LEGAL</h4>
              <ul className='space-y-4 text-xs font-bold text-gray-500'>
                <li><a href='#' className='hover:text-[#D14081] transition-colors decoration-none'>Privacy Policy</a></li>
                <li><a href='#' className='hover:text-[#D14081] transition-colors decoration-none'>Terms of Service</a></li>
                <li><a href='#' className='hover:text-[#D14081] transition-colors decoration-none'>Shipping & Returns</a></li>
              </ul>
            </div>

            <div className='md:text-left'>
              <h4 className='text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-8'>CONTACT</h4>
              <ul className='space-y-4 text-xs font-bold text-gray-500'>
                <li><a href='#' className='hover:text-[#D14081] transition-colors decoration-none'>Contact Us</a></li>
                <li className='text-gray-400 italic font-medium mt-6'>London • Paris • New York</li>
              </ul>
            </div>
          </div>
          <div className='mt-24 pt-12 border-t border-gray-50 text-center'>
            <p className='text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase'>
              © 2024 Sibs Style Editorial Beauty. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StylistsPage;
