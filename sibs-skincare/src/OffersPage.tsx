import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './components/Footer';
import { ArrowRight, X } from 'lucide-react';
import gsap from 'gsap';
import { getPromotions, type Promotion, getCurrentAuthUser, getStoredAuthToken, updatePromotion } from './api/convex-api';

const fallbackPromotions: Promotion[] = [
  {
    id: 'fallback-1',
    title: 'Glow Membership',
    description: 'Join our monthly membership for continuous care, bespoke treatments, and exclusive member-only perks designed for year-round radiance.',
    code: 'GLOW20',
    imageUrl: 'https://i.pinimg.com/originals/6e/48/e1/6e48e1bfeebc6ddd41b2e45286fa60fc.jpg',
    tag: 'Most Popular',
    discountText: '20% off select services',
    featured: true,
    active: true,
    sortOrder: 1,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    offerType: 'LIMITED_EXCLUSIVE',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'fallback-2',
    title: 'Seasonal Rituals',
    description: "Experience transformative treatments carefully customized for the current season's unique environmental challenges and skin needs.",
    code: 'SEASONAL',
    imageUrl: 'https://i.pinimg.com/736x/3f/83/d4/3f83d4777ddd2ebd201ce376c53af924.jpg',
    tag: 'Limited Time',
    discountText: 'Seasonal curation savings',
    featured: true,
    active: true,
    sortOrder: 2,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    offerType: 'LIMITED_EXCLUSIVE',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'fallback-3',
    title: 'Bundle & Save',
    description: 'Combine multiple signature services and take home our premium retail products for exceptional exclusive savings.',
    code: 'BUNDLE15',
    imageUrl: 'https://i.pinimg.com/1200x/66/7f/71/667f717825dc54f377aa4612c9439609.jpg',
    tag: 'Best Value',
    discountText: 'Bundle package savings',
    featured: true,
    active: true,
    sortOrder: 3,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    offerType: 'CURRENT_SPECIAL',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'fallback-4',
    title: 'First-Time Glow',
    description: '20% off your first signature facial session.',
    code: 'GLOW20',
    imageUrl: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600',
    tag: 'Featured',
    discountText: '20% off first visit',
    featured: false,
    active: true,
    sortOrder: 4,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    offerType: 'CURRENT_SPECIAL',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'fallback-5',
    title: 'Birthday Bliss',
    description: 'Complimentary LED therapy during your birth month.',
    code: 'BDAYSKIN',
    imageUrl: 'https://images.unsplash.com/photo-1583445013765-d3c204c99586?w=600',
    tag: 'Featured',
    discountText: 'Birthday month perk',
    featured: false,
    active: true,
    sortOrder: 5,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    offerType: 'CURRENT_SPECIAL',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'fallback-6',
    title: 'Flash Sale Friday',
    description: 'Book any peel on Friday for special savings.',
    code: 'FRIDAYFLASH',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
    tag: 'Featured',
    discountText: 'Friday treatment deal',
    featured: false,
    active: true,
    sortOrder: 6,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    offerType: 'CURRENT_SPECIAL',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'fallback-7',
    title: 'Elite Referral',
    description: 'Refer a friend and both get a credit.',
    code: 'ELITEREF',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
    tag: 'Featured',
    discountText: 'Referral credit',
    featured: false,
    active: true,
    sortOrder: 7,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    offerType: 'CURRENT_SPECIAL',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const OffersPage = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>(fallbackPromotions);
  const [isAdmin, setIsAdmin] = useState(false);
  const [heroOfferId, setHeroOfferId] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem('heroOfferId');
    } catch {
      return null;
    }
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPromotions = async () => {
      try {
        const items = await getPromotions();
        if (!cancelled && items.length > 0) {
          setPromotions(items);
        }
      } catch {
        if (!cancelled) {
          setPromotions(fallbackPromotions);
        }
      }
    };

    loadPromotions();
    return () => {
      cancelled = true;
    };
  }, []);

  // Limited exclusive promotions (used in hero modal)
  const limitedExclusivePromotions = useMemo(
    () => [...promotions].filter((p) => p.offerType === 'LIMITED_EXCLUSIVE' && p.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [promotions],
  );

  // Featured current specials (shown in the Current Specials section)
  const featuredPromotions = useMemo(
    () => [...promotions].filter((promotion) => promotion.offerType === 'CURRENT_SPECIAL' && promotion.active && promotion.featured),
    [promotions],
  );

  // Hero selection: prefer explicit heroOfferId, then first limited exclusive
  const heroPromotion = useMemo(() => {
    if (heroOfferId) {
      const found = limitedExclusivePromotions.find((p) => p.id === heroOfferId);
      if (found) return found;
    }
    return limitedExclusivePromotions[0] ?? promotions[0] ?? null;
  }, [heroOfferId, limitedExclusivePromotions, promotions]);

  const heroCount = limitedExclusivePromotions.length;

  useEffect(() => {
    window.scrollTo(0, 0);

    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', clearProps: 'transform' },
    );

    // Guard header animation to avoid GSAP warning when the selector isn't present.
    const offersHeader = document.querySelector('.offers-header');
    if (offersHeader) {
      gsap.fromTo(offersHeader,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out', delay: 0.3 },
      );
    }
  }, []);

  useEffect(() => {
    // Check if current user is admin for modal admin controls
    (async () => {
      try {
        const token = getStoredAuthToken();
        if (!token) return setIsAdmin(false);
        const user = await getCurrentAuthUser(token);
        setIsAdmin(Boolean(user && user.role === 'admin'));
      } catch {
        setIsAdmin(false);
      }
    })();
  }, []);

  const handleEditImage = async (promotion: Promotion) => {
    if (!isAdmin) return;
    const newUrl = window.prompt('Enter new image URL for this offer', promotion.imageUrl || '');
    if (!newUrl) return;
    try {
      const token = getStoredAuthToken();
      await updatePromotion({ promotionId: promotion.id, updates: { imageUrl: newUrl }, authToken: token });
      const items = await getPromotions();
      setPromotions(items.length > 0 ? items : fallbackPromotions);
      window.alert('Image updated');
    } catch (e) {
      console.error(e);
      window.alert('Failed to update image');
    }
  };

  const handleSetAsHero = (promotion: Promotion) => {
    try {
      window.localStorage.setItem('heroOfferId', promotion.id);
      setHeroOfferId(promotion.id);
      window.alert('Set as hero image');
    } catch (e) {
      console.error(e);
      window.alert('Unable to set hero image');
    }
  };

  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = 'hidden';

      const tl = gsap.timeline();
      tl.fromTo('.panel-overlay',
        { opacity: 0 },
        { opacity: 1, duration: 0.8, ease: 'power2.inOut' },
      )
        .fromTo('.selection-panel',
          { y: 100, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'expo.out' },
          '-=0.4',
        )
        .fromTo('.offer-card-anim',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, ease: 'power3.out' },
          '-=0.6',
        );
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPanelOpen]);

  return (
    <div ref={containerRef} className='bg-[#FAF9F6] min-h-screen pt-48 opacity-100 overflow-x-hidden'>
      <div className='max-w-7xl mx-auto px-6'>
        <div className='text-center mb-24 offers-header'>
          <h1 className='text-6xl sm:text-7xl md:text-9xl font-display text-[#F2529D] italic font-black mb-12 sm:mb-16 leading-none tracking-tighter'>
            Offers & Promotions
          </h1>

          <div
            className='relative w-full h-[380px] md:h-[600px] rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl cursor-pointer group'
            onClick={() => setIsPanelOpen(true)}
          >
            <img
              src={heroPromotion?.imageUrl ?? 'https://i.pinimg.com/1200x/65/e8/1c/65e81c0a1ab979bd8b005b5cb3cebb13.jpg'}
              className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 brightness-90'
              alt='Hero Banner'
            />
            <div className='absolute inset-0 flex flex-col items-center justify-center text-white bg-black/10 group-hover:bg-black/20 transition-all font-display italic px-6 text-center'>
              <span className='text-[10px] sm:text-xl uppercase tracking-[0.5em] mb-4 font-black italic'>Discover Your Ritual</span>
              <h3 className='text-3xl sm:text-4xl md:text-6xl font-black mb-6 italic max-w-5xl'>
                Click to view {heroCount} Limited Exclusives
              </h3>
              <div className='p-4 border-2 border-white rounded-full group-hover:rotate-45 transition-transform shadow-lg'>
                <ArrowRight size={32} />
              </div>
            </div>
          </div>
        </div>

        <div className='text-center mb-32'>
          <span className='text-lg font-black text-[#BF9C34] tracking-[0.4em] mb-4 block underline decoration-gray-200 underline-offset-8'>CURRENT SPECIALS</span>
          <h2 className='text-5xl sm:text-6xl md:text-8xl font-display text-[#F2529D] italic font-black leading-none tracking-tighter'>Seasonal Rituals</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mt-16 sm:mt-20'>
            {featuredPromotions.length > 0 ? (
              featuredPromotions.map((promotion) => (
                <div key={promotion.id} className='bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 group transition-all hover:scale-[1.02]'>
                  <div className='aspect-square overflow-hidden relative'>
                    <img src={promotion.imageUrl} className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110' alt={promotion.title} />
                    <div className='absolute top-6 left-6 bg-[#F2529D] text-white px-4 py-2 rounded-full text-[8px] font-black tracking-widest uppercase'>
                      {promotion.tag}
                    </div>
                  </div>
                  <div className='p-8 sm:p-10 space-y-5 sm:space-y-6 text-center'>
                    <h3 className='text-3xl sm:text-4xl font-display italic font-black text-gray-900 leading-tight'>{promotion.title}</h3>
                    <p className='text-gray-500 font-medium leading-relaxed'>{promotion.description}</p>
                    <p className='text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]'>{promotion.discountText}</p>
                    <Link to='/booking' className='block w-full py-4 sm:py-5 bg-[#F2529D] text-white text-[12px] sm:text-[14px] font-black tracking-[0.4em] rounded-xl hover:bg-black transition-all shadow-xl'>CLAIM OFFER</Link>
                  </div>
                </div>
              ))
            ) : (
              <div className='col-span-1 md:col-span-3 text-center py-16 text-gray-500'>No current specials yet. Customers will see offers here once an admin adds them.</div>
            )}
          </div>
        </div>
      </div>

      {isPanelOpen && (
        <div className='fixed inset-0 z-[100] bg-black/40 backdrop-blur-3xl flex items-center justify-center p-2 sm:p-4 panel-overlay overflow-x-hidden'>
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F2529D] rounded-full blur-[180px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#BF9C34] rounded-full blur-[180px] animate-pulse delay-1000"></div>
          </div>

          <div className='bg-white w-[calc(100vw-1rem)] sm:w-[95%] max-w-7xl h-[calc(100dvh-1rem)] sm:h-[85vh] rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] overflow-hidden overflow-x-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col selection-panel'>
            <div className='flex-none flex justify-between items-center px-5 sm:px-8 md:px-12 py-4 sm:py-5 md:py-6 border-b border-gray-100 bg-white relative z-10'>
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-1 h-8 bg-[#F2529D] rounded-full"></div>
                <h2 className='text-2xl sm:text-4xl md:text-5xl font-display italic font-black text-black tracking-tighter truncate'>Exclusive Selection</h2>
              </div>
              <button
                onClick={() => {
                  const tl = gsap.timeline();
                  tl.to('.selection-panel', { y: 100, opacity: 0, duration: 0.5, ease: 'power3.in' })
                    .to('.panel-overlay', { opacity: 0, duration: 0.5, onComplete: () => setIsPanelOpen(false) }, '-=0.3');
                }}
                className='bg-black text-white p-2.5 sm:p-3 md:p-4 rounded-full hover:rotate-90 transition-all duration-500 shadow-xl hover:bg-[#F2529D] group shrink-0'
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 group-hover:scale-110" />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-4 sm:py-10 md:py-16 bg-white custom-scrollbar'>
              {limitedExclusivePromotions.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-12'>
                  {limitedExclusivePromotions.map((promotion, idx) => (
                    <div key={promotion.id} className='offer-card-anim group cursor-pointer bg-[#FAF9F6] p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 hover:bg-black transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 relative'>
                      {isAdmin && (
                        <div className='absolute top-3 right-3 z-20 flex gap-2'>
                          <button onClick={() => handleEditImage(promotion)} className='bg-white text-xs px-3 py-1 rounded-full shadow-sm border'>Edit Image</button>
                          <button onClick={() => handleSetAsHero(promotion)} className='bg-[#F2529D] text-white text-xs px-3 py-1 rounded-full shadow-sm'>Set Hero</button>
                        </div>
                      )}
                      <div className='aspect-square rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl mb-5 sm:mb-8 group-hover:scale-105 transition-all duration-700 relative'>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                        <img src={promotion.imageUrl} className='w-full h-full object-cover transition-all duration-1000' alt={promotion.title} />
                      </div>
                      <div className='space-y-3 sm:space-y-4'>
                        <div className='flex justify-between items-start gap-3'>
                          <h4 className='text-2xl sm:text-3xl font-display italic font-black text-gray-900 group-hover:text-[#F2529D] mb-2 uppercase tracking-tight transition-colors duration-500 line-clamp-2'>{promotion.title}</h4>
                          <span className='px-3 py-1 bg-[#F2529D] text-white text-[10px] font-black tracking-widest rounded-full shrink-0 uppercase'>{String(idx + 1).padStart(2, '0')}</span>
                        </div>
                        <p className='text-sm sm:text-base text-gray-500 group-hover:text-white/60 mb-4 sm:mb-6 font-medium leading-relaxed transition-colors duration-500 line-clamp-3'>{promotion.description}</p>
                        <div className='flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 group-hover:border-white/10 gap-3'>
                          <div className='flex flex-col min-w-0'>
                            <span className='text-[10px] font-black tracking-widest text-gray-400 group-hover:text-[#F2529D] uppercase mb-1'>Discount Code</span>
                            <span className='text-lg sm:text-xl font-black text-black group-hover:text-white transition-colors duration-500 truncate'>{promotion.code}</span>
                          </div>
                          <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white group-hover:bg-[#F2529D] flex items-center justify-center transition-all duration-500 shadow-sm shrink-0'>
                            <div className='w-2 h-2 rounded-full bg-[#F2529D] group-hover:bg-white' />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-20 text-gray-500'>No limited exclusives yet. Customers will see offers here once an admin adds them.</div>
              )}
            </div>

            <div className='px-5 sm:px-8 md:px-12 py-4 sm:py-8 md:py-10 bg-white border-t border-gray-100 text-center z-[110] relative'>
              <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
              <Link
                to='/booking'
                onClick={() => {
                  const tl = gsap.timeline();
                  tl.to('.selection-panel', { y: 100, opacity: 0, duration: 0.5, ease: 'power3.in' })
                    .to('.panel-overlay', { opacity: 0, duration: 0.5, onComplete: () => setIsPanelOpen(false) }, '-=0.3');
                }}
                className='inline-block bg-[#F2529D] text-white px-8 sm:px-12 md:px-24 py-4 sm:py-5 md:py-6 rounded-2xl text-[10px] sm:text-[12px] font-black uppercase tracking-[0.35em] sm:tracking-[0.5em] hover:bg-black hover:scale-105 transition-all duration-500 shadow-2xl transform active:scale-95'
              >
                Secure Your Selection
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default OffersPage;

