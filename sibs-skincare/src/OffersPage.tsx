import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Footer from './components/Footer';
import {
  ArrowRight, X, Copy, Check, Clock, Tag, Sparkles,
  Calendar, Gift, Percent,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  getPromotions, type Promotion,
  getCurrentAuthUser, getStoredAuthToken, updatePromotion,
} from './api/convex-api';

gsap.registerPlugin(ScrollTrigger);

// ==================== TYPES ====================
type FilterTab = 'all' | 'exclusive' | 'special';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

// ==================== HELPERS ====================

// Parse a numeric discount percent from a promotion's discountText (e.g. "20% off" -> 20).
const parseDiscountPercent = (text: string): number => {
  const match = text.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
};

// Live countdown to an end date. Updates every second.
const useCountdown = (endDate: string): Countdown => {
  const calc = useCallback((): Countdown => {
    const end = new Date(endDate).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
      expired: false,
    };
  }, [endDate]);

  const [countdown, setCountdown] = useState<Countdown>(calc);

  useEffect(() => {
    const id = setInterval(() => setCountdown(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return countdown;
};

// Single countdown component so each card updates independently.
const ExpiryCountdown: React.FC<{ endDate: string; dark?: boolean }> = ({ endDate, dark }) => {
  const c = useCountdown(endDate);
  if (c.expired) {
    return <span className={`text-[0.6rem] font-black uppercase tracking-[0.2em] ${dark ? 'text-red-300' : 'text-red-500'}`}>Expired</span>;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  const showDays = c.days > 0;
  return (
    <div className={`flex items-center gap-1.5 ${dark ? 'text-white/70' : 'text-gray-500'}`}>
      <Clock className={`w-2.5 h-2.5 ${dark ? 'text-[#F2529D]' : 'text-[#BF9C34]'}`} />
      {showDays ? (
        <span className="text-[0.6rem] font-black tabular-nums tracking-wide">
          {c.days}d {pad(c.hours)}h {pad(c.minutes)}m
        </span>
      ) : (
        <span className="text-[0.6rem] font-black tabular-nums tracking-wide">
          {pad(c.hours)}:{pad(c.minutes)}:{pad(c.seconds)}
        </span>
      )}
    </div>
  );
};

// ==================== OFFER CARD (unique editorial design) ====================
interface OfferCardProps {
  promotion: Promotion;
  index: number;
  isAdmin: boolean;
  onEditImage: (p: Promotion) => void;
  onSetHero: (p: Promotion) => void;
  onClaim: (p: Promotion) => void;
}

const OfferCard: React.FC<OfferCardProps> = ({ promotion, index, isAdmin, onEditImage, onSetHero, onClaim }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const discountPercent = parseDiscountPercent(promotion.discountText);
  const isExclusive = promotion.offerType === 'LIMITED_EXCLUSIVE';

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(promotion.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = promotion.code;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
  };

  // Subtle 3D tilt on mouse move (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    if (window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -6, y: x * 6 });
  };
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="offer-card-reveal group relative bg-white rounded-[1.75rem] md:rounded-[2rem] overflow-hidden border border-gray-100 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.15)] transition-all duration-500 hover:shadow-[0_40px_80px_-30px_rgba(242,82,157,0.3)]"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.2s ease-out, box-shadow 0.5s ease',
      }}
    >
      {/* Image section */}
      <div className="relative aspect-[5/4] overflow-hidden bg-[#FAF9F6]">
        <img
          src={promotion.imageUrl}
          alt={promotion.title}
          className="w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />

        {/* Top row: tag + index */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            {promotion.tag && (
              <span className={`px-3 py-1.5 rounded-full text-[0.55rem] font-black tracking-[0.2em] uppercase backdrop-blur-md ${
                isExclusive ? 'bg-[#F2529D] text-white' : 'bg-white/90 text-[#333]'
              }`}>
                {promotion.tag}
              </span>
            )}
            {isExclusive && (
              <span className="px-3 py-1.5 rounded-full text-[0.55rem] font-black tracking-[0.2em] uppercase bg-black/40 backdrop-blur-md text-[#BF9C34] flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Exclusive
              </span>
            )}
          </div>
          <span className="text-[0.6rem] font-black tracking-widest text-white/60 tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Discount badge */}
        {discountPercent > 0 && (
          <div className="absolute top-4 right-4 mt-8 md:mt-10">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#F2529D] flex flex-col items-center justify-center text-white shadow-[0_8px_30px_rgba(242,82,157,0.5)] group-hover:scale-110 transition-transform duration-500">
                <Percent className="w-3 h-3 md:w-4 md:h-4 absolute top-2 md:top-3" />
                <span className="text-xl md:text-2xl font-black leading-none mt-2">{discountPercent}</span>
                <span className="text-[0.5rem] md:text-[0.55rem] font-black uppercase tracking-wider">OFF</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom: title + countdown */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
          <h3 className="text-2xl md:text-3xl font-display italic font-black leading-tight mb-2 drop-shadow-lg">
            {promotion.title}
          </h3>
          <ExpiryCountdown endDate={promotion.endDate} dark />
        </div>
      </div>

      {/* Body section */}
      <div className="p-5 md:p-6 space-y-4">
        <p className="text-sm text-gray-500 leading-relaxed font-medium line-clamp-3 min-h-[3.6rem]">
          {promotion.description}
        </p>

        {/* Promo code reveal + copy */}
        <div className="relative">
          <button
            onClick={handleCopyCode}
            className="w-full group/code relative overflow-hidden rounded-2xl border-2 border-dashed border-[#F2529D]/30 bg-[#FAF9F6] hover:border-[#F2529D] transition-colors duration-300"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Tag className="w-3.5 h-3.5 text-[#F2529D] shrink-0" />
                <div className="min-w-0 text-left">
                  <span className="block text-[0.5rem] font-black uppercase tracking-[0.25em] text-gray-400 mb-0.5">Promo Code</span>
                  <span className="block text-base font-black text-gray-900 tracking-wider truncate font-mono">
                    {promotion.code}
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.55rem] font-black uppercase tracking-wider transition-all duration-300 ${
                copied ? 'bg-green-100 text-green-700' : 'bg-[#F2529D] text-white group-hover/code:bg-black'
              }`}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </div>
            </div>
          </button>
        </div>

        {/* Footer: discount text + claim */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="min-w-0">
            <span className="block text-[0.5rem] font-black uppercase tracking-[0.25em] text-gray-400 mb-0.5">You Save</span>
            <span className="text-sm font-black text-[#BF9C34] truncate block">{promotion.discountText}</span>
          </div>
          <button
            onClick={() => onClaim(promotion)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black text-white text-[0.6rem] font-black uppercase tracking-[0.2em] hover:bg-[#F2529D] transition-all duration-300 group-hover:scale-105 active:scale-95"
          >
            Claim
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Admin controls */}
        {isAdmin && (
          <div className="flex gap-2 pt-2 border-t border-gray-50">
            <button onClick={() => onEditImage(promotion)} className="flex-1 text-[0.55rem] font-black uppercase tracking-wider py-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors">Edit Image</button>
            <button onClick={() => onSetHero(promotion)} className="flex-1 text-[0.55rem] font-black uppercase tracking-wider py-2 rounded-full bg-[#F2529D]/10 text-[#F2529D] hover:bg-[#F2529D] hover:text-white transition-colors">Set Hero</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MAIN PAGE ====================
const OffersPage = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [heroOfferId, setHeroOfferId] = useState<string | null>(() => {
    try { return window.localStorage.getItem('heroOfferId'); } catch { return null; }
  });
  const [selectedOffer, setSelectedOffer] = useState<Promotion | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const tickerRef = useRef<HTMLDivElement>(null);

  // Load promotions from API (empty state handled gracefully)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const items = await getPromotions();
        if (!cancelled) setPromotions(items);
      } catch {
        if (!cancelled) setPromotions([]);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Admin check
  useEffect(() => {
    (async () => {
      try {
        const token = getStoredAuthToken();
        if (!token) return setIsAdmin(false);
        const user = await getCurrentAuthUser(token);
        setIsAdmin(Boolean(user && user.role === 'admin'));
      } catch { setIsAdmin(false); }
    })();
  }, []);

  // Derived data
  const activePromotions = useMemo(() => promotions.filter((p) => p.active), [promotions]);
  const limitedExclusive = useMemo(
    () => activePromotions.filter((p) => p.offerType === 'LIMITED_EXCLUSIVE').sort((a, b) => a.sortOrder - b.sortOrder),
    [activePromotions],
  );
  const currentSpecials = useMemo(
    () => activePromotions.filter((p) => p.offerType === 'CURRENT_SPECIAL').sort((a, b) => a.sortOrder - b.sortOrder),
    [activePromotions],
  );

  const heroPromotion = useMemo(() => {
    if (heroOfferId) {
      const found = limitedExclusive.find((p) => p.id === heroOfferId);
      if (found) return found;
    }
    return limitedExclusive[0] ?? currentSpecials[0] ?? null;
  }, [heroOfferId, limitedExclusive, currentSpecials]);

  const filteredPromotions = useMemo(() => {
    if (activeTab === 'exclusive') return limitedExclusive;
    if (activeTab === 'special') return currentSpecials;
    return [...limitedExclusive, ...currentSpecials];
  }, [activeTab, limitedExclusive, currentSpecials]);

  const stats = useMemo(() => {
    return {
      total: activePromotions.length,
      exclusive: limitedExclusive.length,
      specials: currentSpecials.length,
      maxDiscount: Math.max(0, ...activePromotions.map((p) => parseDiscountPercent(p.discountText))),
    };
  }, [activePromotions, limitedExclusive, currentSpecials]);

  // Entry animation — runs once on mount only (not when promotions load)
  useEffect(() => {
    window.scrollTo(0, 0);

    const tl = gsap.timeline();
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.inOut' })
      .fromTo('.offers-hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('.offers-hero-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, '-=0.5')
      .fromTo('.offers-hero-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8')
      .fromTo('.offers-hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('.offers-hero-image', { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out' }, '-=1.5');

    // Ticker marquee
    if (tickerRef.current) {
      const ticker = tickerRef.current;
      const distance = ticker.scrollWidth / 2;
      gsap.to(ticker, {
        x: -distance,
        duration: 30,
        ease: 'none',
        repeat: -1,
      });
    }

    // Parallax hero image
    if (heroRef.current) {
      gsap.to('.hero-parallax', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  // Scroll reveals — set up whenever promotions change (cards render async).
  // Uses onEnter so elements stay visible by default and only animate when
  // the trigger actually fires. This prevents cards from being stuck invisible
  // if the ScrollTrigger miscalculates its start position after async data loads.
  useEffect(() => {
    const createdTriggers: ScrollTrigger[] = [];
    const revealEls = gsap.utils.toArray<HTMLElement>('.offer-reveal');
    revealEls.forEach((el) => {
      // Safety net: make sure every reveal element is visible by default.
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
    // Refresh so ScrollTrigger recalculates positions after async data render.
    ScrollTrigger.refresh();

    return () => {
      createdTriggers.forEach((t) => t.kill());
    };
  }, [promotions.length, activeTab]);

  // Modal animations
  useEffect(() => {
    if (isPanelOpen) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();
      tl.fromTo('.panel-overlay', { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.inOut' })
        .fromTo('.selection-panel', { y: 60, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out' }, '-=0.3')
        .fromTo('.panel-card-anim', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, '-=0.4');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPanelOpen]);

  // Detail modal animations
  useEffect(() => {
    if (selectedOffer) {
      document.body.style.overflow = 'hidden';
      const tl = gsap.timeline();
      tl.fromTo('.detail-overlay', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.inOut' })
        .fromTo('.detail-panel', { y: 40, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }, '-=0.15');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedOffer]);

  // Handlers
  const handleEditImage = async (promotion: Promotion) => {
    if (!isAdmin) return;
    const newUrl = window.prompt('Enter new image URL for this offer', promotion.imageUrl || '');
    if (!newUrl) return;
    try {
      const token = getStoredAuthToken();
      await updatePromotion({ promotionId: promotion.id, updates: { imageUrl: newUrl }, authToken: token });
      const items = await getPromotions();
      setPromotions(items);
      window.alert('Image updated successfully');
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

  const handleClaim = (promotion: Promotion) => {
    setSelectedOffer(promotion);
  };

  const closePanel = () => {
    const tl = gsap.timeline();
    tl.to('.selection-panel', { y: 60, opacity: 0, scale: 0.97, duration: 0.4, ease: 'power3.in' })
      .to('.panel-overlay', { opacity: 0, duration: 0.3, onComplete: () => setIsPanelOpen(false) }, '-=0.2');
  };

  const closeDetail = () => {
    const tl = gsap.timeline();
    tl.to('.detail-panel', { y: 20, opacity: 0, scale: 0.97, duration: 0.3, ease: 'power3.in' })
      .to('.detail-overlay', { opacity: 0, duration: 0.2, onComplete: () => setSelectedOffer(null) }, '-=0.15');
  };

  const navigateToBooking = () => {
    const event = new CustomEvent('trigger-curtain', { detail: { path: '/booking' } });
    window.dispatchEvent(event);
  };

  // Ticker items (repeat for seamless loop)
  const tickerItems = useMemo(() => {
    const items = activePromotions.length > 0 ? activePromotions : [];
    return [...items, ...items];
  }, [activePromotions]);

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen pt-32 md:pt-40 opacity-0 overflow-x-hidden">
      {/* ==================== HERO SECTION ==================== */}
      <section ref={heroRef} className="relative px-4 sm:px-6 md:px-8 mb-20 md:mb-32">
        <div className="max-w-7xl mx-auto">
          {/* Eyebrow */}
          <div className="offers-hero-eyebrow flex items-center justify-center gap-4 mb-6 md:mb-8">
            <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Dubai Beauty Lounge</span>
            <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
          </div>

          {/* Title */}
          <h1 className="offers-hero-title text-center text-5xl sm:text-7xl md:text-9xl font-display italic font-black text-[#F2529D] leading-none tracking-tighter mb-6 md:mb-8">
            Offers & Promotions
          </h1>

          {/* Split hero: image left, info right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
            {/* Hero image with parallax */}
            <div className="lg:col-span-7 offers-hero-image relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl cursor-pointer group min-h-[400px] md:min-h-[560px]"
              onClick={() => setIsPanelOpen(true)}
            >
              <div className="hero-parallax absolute inset-0 scale-110">
                <img
                  src={heroPromotion?.imageUrl ?? 'https://i.pinimg.com/1200x/65/e8/1c/65e81c0a1ab979bd8b005b5cb3cebb13.jpg'}
                  alt={heroPromotion?.title ?? 'Featured offer'}
                  className="w-full h-full object-cover brightness-75 transition-transform duration-[1.5s] group-hover:scale-105"
                />
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Top badge */}
              <div className="absolute top-5 md:top-8 left-5 md:left-8 flex items-center gap-2">
                <span className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[#F2529D] text-white text-[0.55rem] md:text-[0.65rem] font-black tracking-[0.2em] uppercase flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" /> Limited Exclusive
                </span>
              </div>

              {/* Bottom content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                {heroPromotion ? (
                  <>
                    <h3 className="offers-hero-sub text-3xl md:text-5xl font-display italic font-black mb-3 leading-tight drop-shadow-lg">
                      {heroPromotion.title}
                    </h3>
                    <p className="text-sm md:text-base text-white/80 mb-4 md:mb-6 max-w-md leading-relaxed line-clamp-2">
                      {heroPromotion.description}
                    </p>
                    <div className="offers-hero-cta flex flex-wrap items-center gap-3 md:gap-4">
                      <div className="inline-flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                        <Tag className="w-3 h-3 md:w-4 md:h-4 text-[#F2529D]" />
                        <span className="text-xs md:text-sm font-black tracking-wider font-mono">{heroPromotion.code}</span>
                      </div>
                      {heroPromotion.endDate && <ExpiryCountdown endDate={heroPromotion.endDate} dark />}
                    </div>
                  </>
                ) : (
                  <h3 className="offers-hero-sub text-2xl md:text-4xl font-display italic font-black text-white/70">Featured offer coming soon</h3>
                )}
              </div>

              {/* Hover indicator */}
              <div className="absolute top-1/2 right-5 md:right-8 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:bg-[#F2529D] group-hover:border-[#F2529D] transition-all duration-500 group-hover:rotate-45">
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>

            {/* Right info panel */}
            <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
              {/* Stats card */}
              <div className="offers-hero-sub bg-[#0A0E1A] text-white rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#F2529D]/20 rounded-full blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#BF9C34]/20 rounded-full blur-[60px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4 md:mb-6">
                    <Gift className="w-4 h-4 md:w-5 md:h-5 text-[#F2529D]" />
                    <span className="text-[0.6rem] md:text-[0.7rem] font-black uppercase tracking-[0.3em] text-[#BF9C34]">Live Offers</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <p className="text-3xl md:text-5xl font-display italic font-black text-white leading-none">{stats.total}</p>
                      <p className="text-[0.55rem] md:text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/50 mt-1 md:mt-2">Active Offers</p>
                    </div>
                    <div>
                      <p className="text-3xl md:text-5xl font-display italic font-black text-[#F2529D] leading-none">{stats.maxDiscount > 0 ? `${stats.maxDiscount}%` : '0'}</p>
                      <p className="text-[0.55rem] md:text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/50 mt-1 md:mt-2">Max Savings</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-display italic font-black text-white leading-none">{stats.exclusive}</p>
                      <p className="text-[0.55rem] md:text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/50 mt-1 md:mt-2">Exclusives</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-display italic font-black text-white leading-none">{stats.specials}</p>
                      <p className="text-[0.55rem] md:text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/50 mt-1 md:mt-2">Specials</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* View exclusives button */}
              <button
                onClick={() => setIsPanelOpen(true)}
                className="offers-hero-cta group relative overflow-hidden rounded-[2rem] bg-white border-2 border-[#F2529D]/10 p-6 md:p-8 text-left hover:border-[#F2529D]/30 transition-all duration-500 hover:shadow-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.6rem] md:text-[0.7rem] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-2">Curated Selection</p>
                    <p className="text-xl md:text-2xl font-display italic font-black text-gray-900 leading-tight">View all<br />Limited Exclusives</p>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black flex items-center justify-center shrink-0 group-hover:bg-[#F2529D] group-hover:rotate-45 transition-all duration-500">
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== LIVE TICKER ==================== */}
      {tickerItems.length > 0 && (
        <section className="py-6 md:py-8 bg-[#0A0E1A] overflow-hidden border-y border-white/5">
          <div ref={tickerRef} className="flex items-center gap-8 md:gap-12 whitespace-nowrap">
            {tickerItems.map((promo, idx) => (
              <div key={`${promo.id}-${idx}`} className="flex items-center gap-8 md:gap-12 shrink-0">
                <span className="text-2xl md:text-4xl font-display italic font-black text-white/30 hover:text-[#F2529D] transition-colors duration-300 cursor-default">
                  {promo.title}
                </span>
                <span className="text-[#BF9C34] text-2xl md:text-4xl">/</span>
                <span className="text-sm md:text-lg font-mono font-black text-white/40 tracking-wider">
                  {promo.code}
                </span>
                <span className="text-[#F2529D] text-2xl md:text-4xl">/</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== OFFERS GRID ==================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <div className="offer-reveal text-center mb-10 md:mb-16">
            <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
              <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Browse All</span>
              <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
            </div>
            <h2 className="text-4xl md:text-7xl font-display italic font-black text-gray-900 leading-none tracking-tighter mb-4">
              Every Ritual, <span className="text-[#F2529D]">Rewarded</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Filter, copy your code, and claim your savings in seconds.
            </p>
          </div>

          {/* Filter tabs */}
          {activePromotions.length > 0 && (
            <div className="offer-reveal flex justify-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-1 p-1.5 bg-white rounded-full shadow-lg border border-gray-100">
                {[
                  { key: 'all' as FilterTab, label: 'All Offers', count: activePromotions.length },
                  { key: 'exclusive' as FilterTab, label: 'Exclusives', count: stats.exclusive },
                  { key: 'special' as FilterTab, label: 'Specials', count: stats.specials },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-4 md:px-6 py-2.5 md:py-3 rounded-full text-[0.6rem] md:text-xs font-black uppercase tracking-[0.2em] transition-all duration-400 flex items-center gap-2 ${
                      activeTab === tab.key ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                    <span className={`px-2 py-0.5 rounded-full text-[0.5rem] md:text-[0.55rem] ${
                      activeTab === tab.key ? 'bg-[#F2529D] text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid */}
          {filteredPromotions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredPromotions.map((promotion, idx) => (
                <div key={promotion.id} className="offer-reveal">
                  <OfferCard
                    promotion={promotion}
                    index={idx}
                    isAdmin={isAdmin}
                    onEditImage={handleEditImage}
                    onSetHero={handleSetAsHero}
                    onClaim={handleClaim}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="offer-reveal text-center py-20 md:py-32">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <Gift className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl md:text-3xl font-display italic font-black text-gray-400 mb-2">No offers available right now</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto">Please check back soon for our latest curated offers and exclusive savings.</p>
            </div>
          )}
        </div>
      </section>

      {/* ==================== HOW TO REDEEM ==================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="offer-reveal text-center mb-12 md:mb-20">
            <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
              <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Simple Process</span>
              <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
            </div>
            <h2 className="text-4xl md:text-7xl font-display italic font-black text-gray-900 leading-none tracking-tighter">
              How to <span className="text-[#F2529D]">Redeem</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-[#BF9C34]/20 via-[#F2529D]/20 to-[#BF9C34]/20" />

            {[
              { num: '01', icon: Tag, title: 'Copy Your Code', desc: 'Tap the copy button on any offer card to grab your exclusive promo code instantly.', color: '#F2529D' },
              { num: '02', icon: Calendar, title: 'Book Your Ritual', desc: 'Head to the booking page, choose your service, and select your preferred date and time.', color: '#BF9C34' },
              { num: '03', icon: Check, title: 'Apply at Checkout', desc: 'Paste your code in the discount field during booking or show it at the lounge.', color: '#F2529D' },
            ].map((step) => (
              <div key={step.num} className="offer-reveal relative text-center group">
                <div className="relative inline-flex items-center justify-center mb-6 md:mb-8">
                  <div className="w-24 h-24 md:w-24 md:h-24 rounded-full bg-[#FAF9F6] border-4 border-white shadow-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl">
                    <step.icon className="w-8 h-8 md:w-10 md:h-10 transition-colors duration-500" style={{ color: step.color }} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black text-white flex items-center justify-center text-xs md:text-sm font-black tabular-nums">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-display italic font-black text-gray-900 mb-3 md:mb-4">{step.title}</h3>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-16 md:py-24 px-4 sm:px-6 md:px-8 bg-[#FAF9F6]">
        <div className="max-w-4xl mx-auto text-center offer-reveal">
          <div className="bg-[#0A0E1A] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#F2529D]/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#BF9C34]/20 rounded-full blur-[100px]" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
                <span className="h-px w-10 md:w-12 bg-[#BF9C34]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Ready When You Are</span>
                <span className="h-px w-10 md:w-12 bg-[#BF9C34]" />
              </div>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display italic font-black text-white mb-4 md:mb-6 leading-tight">
                Your ritual <span className="text-[#F2529D]">awaits</span>
              </h2>
              <p className="text-sm md:text-base text-white/60 max-w-lg mx-auto mb-6 md:mb-8 font-medium">
                Book now and apply your offer code at checkout for instant savings on your chosen service.
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

      {/* ==================== EXCLUSIVE SELECTION MODAL ==================== */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 panel-overlay overflow-x-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F2529D] rounded-full blur-[180px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#BF9C34] rounded-full blur-[180px] animate-pulse" />
          </div>

          <div className="bg-white w-[calc(100vw-1rem)] sm:w-[95%] max-w-7xl max-h-[calc(100dvh-1rem)] sm:max-h-[88vh] rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col selection-panel">
            {/* Header */}
            <div className="flex-none flex justify-between items-center px-5 sm:px-8 md:px-12 py-5 md:py-6 border-b border-gray-100 bg-white relative z-10">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-1 h-10 md:h-12 bg-[#F2529D] rounded-full" />
                <div>
                  <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-[#BF9C34] block mb-1">Curated Selection</span>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-display italic font-black text-black tracking-tighter truncate">Exclusive Selection</h2>
                </div>
              </div>
              <button
                onClick={closePanel}
                className="bg-black text-white p-2.5 sm:p-3 md:p-4 rounded-full hover:rotate-90 transition-all duration-500 shadow-xl hover:bg-[#F2529D] group shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 group-hover:scale-110" />
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 md:py-10 bg-[#FAF9F6]">
              {limitedExclusive.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {limitedExclusive.map((promotion, idx) => (
                    <div key={promotion.id} className="panel-card-anim">
                      <OfferCard
                        promotion={promotion}
                        index={idx}
                        isAdmin={isAdmin}
                        onEditImage={handleEditImage}
                        onSetHero={handleSetAsHero}
                        onClaim={handleClaim}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-display italic font-black text-gray-400 mb-2">No exclusives yet</h3>
                  <p className="text-sm text-gray-400">Customers will see offers here once an admin adds them.</p>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="flex-none px-5 sm:px-8 md:px-12 py-4 sm:py-6 md:py-8 bg-white border-t border-gray-100 text-center z-[110] relative">
              <button
                onClick={() => { closePanel(); setTimeout(navigateToBooking, 400); }}
                className="inline-flex items-center gap-3 bg-[#F2529D] text-white px-8 sm:px-12 md:px-16 py-4 md:py-5 rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] sm:tracking-[0.5em] hover:bg-black hover:scale-105 transition-all duration-500 shadow-2xl active:scale-95"
              >
                Secure Your Selection
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== OFFER DETAIL MODAL ==================== */}
      {selectedOffer && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 detail-overlay overflow-y-auto">
          <div className="bg-white w-full max-w-3xl my-auto rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative detail-panel">
            {/* Image header */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img src={selectedOffer.imageUrl} alt={selectedOffer.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                onClick={closeDetail}
                className="absolute top-4 right-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-[#F2529D] hover:rotate-90 transition-all duration-500"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-2 mb-3">
                  {selectedOffer.tag && (
                    <span className="px-3 py-1 rounded-full text-[0.55rem] font-black tracking-[0.2em] uppercase bg-[#F2529D] text-white">
                      {selectedOffer.tag}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[0.55rem] font-black tracking-[0.2em] uppercase ${
                    selectedOffer.offerType === 'LIMITED_EXCLUSIVE' ? 'bg-black/40 text-[#BF9C34]' : 'bg-white/20 text-white'
                  }`}>
                    {selectedOffer.offerType === 'LIMITED_EXCLUSIVE' ? 'Exclusive' : 'Special'}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-display italic font-black drop-shadow-lg">{selectedOffer.title}</h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-10 space-y-6">
              <p className="text-base md:text-lg text-gray-600 leading-relaxed font-medium">{selectedOffer.description}</p>

              {/* Promo code */}
              <CopyableCode code={selectedOffer.code} />

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF9F6] rounded-2xl p-4 md:p-5">
                  <p className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">You Save</p>
                  <p className="text-base md:text-lg font-black text-[#BF9C34]">{selectedOffer.discountText}</p>
                </div>
                <div className="bg-[#FAF9F6] rounded-2xl p-4 md:p-5">
                  <p className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">Valid Until</p>
                  <p className="text-base md:text-lg font-black text-gray-900">{new Date(selectedOffer.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => { closeDetail(); setTimeout(navigateToBooking, 400); }}
                className="w-full inline-flex items-center justify-center gap-3 bg-black hover:bg-[#F2529D] text-white py-4 md:py-5 rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl group"
              >
                Book This Ritual
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// ==================== COPYABLE CODE (for detail modal) ====================
const CopyableCode: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
  };
  return (
    <div className="bg-gradient-to-r from-[#F2529D]/5 to-[#BF9C34]/5 rounded-2xl p-4 md:p-5 border-2 border-dashed border-[#F2529D]/20">
      <p className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-[#BF9C34] mb-2 flex items-center gap-2">
        <Tag className="w-3 h-3" /> Your Promo Code
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xl md:text-2xl font-black font-mono text-gray-900 tracking-wider">{code}</span>
        <button
          onClick={handleCopy}
          className={`px-4 py-2 rounded-full text-[0.6rem] font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
            copied ? 'bg-green-100 text-green-700' : 'bg-[#F2529D] text-white hover:bg-black'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy Code'}
        </button>
      </div>
    </div>
  );
};

export default OffersPage;
