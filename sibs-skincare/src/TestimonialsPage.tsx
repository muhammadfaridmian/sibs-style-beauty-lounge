import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Footer from './components/Footer';
import {
  Star, Quote, Send, CheckCircle2, ChevronLeft, ChevronRight,
  Sparkles, Award, Heart, MessageSquare, TrendingUp,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  getReviews, submitReview, getServices, getStoredAuthToken,
  type Review, type Service,
} from './api/convex-api';

gsap.registerPlugin(ScrollTrigger);

// ==================== HELPERS ====================

// Get initials from a name for the avatar fallback.
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Pick a deterministic accent color from a name so each reviewer gets a stable avatar tint.
const AVATAR_TINTS = ['#F2529D', '#BF9C34', '#F29ABF', '#D4A574', '#E8B4C8'];
const getAvatarTint = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_TINTS[Math.abs(hash) % AVATAR_TINTS.length];
};

// Star rating row, reusable.
const StarRow: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg'; color?: string }> = ({
  rating, size = 'md', color = '#BF9C34',
}) => {
  const sizeClass = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${star <= rating ? 'fill-current' : 'fill-none'}`}
          style={{ color: star <= rating ? color : '#E7DDCB' }}
        />
      ))}
    </div>
  );
};

// Small inline Google "G" mark so we don't depend on an icon that isn't in this lucide version.
const GoogleMark: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
  </svg>
);

// ==================== GOOGLE REVIEW CARD (top showcase, max 5) ====================
const GoogleReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const tint = getAvatarTint(review.name);
  const initials = getInitials(review.name);

  return (
    <article
      className="google-review-card group relative bg-white rounded-[1.75rem] p-6 md:p-8 border border-gray-100 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.12)] hover:shadow-[0_40px_80px_-30px_rgba(242,82,157,0.25)] transition-all duration-500 hover:-translate-y-2 flex flex-col"
    >
      {/* Google badge top-right */}
      <div className="absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-100 shadow-sm">
        <GoogleMark className="w-3 h-3" />
        <span className="text-[0.5rem] font-black tracking-wider text-gray-500 uppercase">Google</span>
      </div>

      {/* Quote icon */}
      <Quote className="w-8 h-8 text-[#F2529D]/15 fill-current mb-3" />

      {/* Stars */}
      <StarRow rating={review.rating} size="sm" />

      {/* Quote text */}
      <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium mt-4 mb-5 flex-1 line-clamp-6">
        {review.mainQuote}
      </p>

      {/* Service tag */}
      {review.serviceName && (
        <span className="inline-block self-start px-3 py-1 rounded-full bg-[#F2529D]/8 text-[#F2529D] text-[0.55rem] font-black tracking-wider uppercase mb-5">
          {review.serviceName}
        </span>
      )}

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
          style={{ backgroundColor: tint }}
        >
          {review.avatarUrl ? (
            <img src={review.avatarUrl} alt={review.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-gray-900 truncate">{review.name}</p>
          <p className="text-[0.55rem] font-black tracking-[0.2em] text-[#BF9C34] uppercase">{review.role || 'Verified Guest'}</p>
        </div>
      </div>
    </article>
  );
};

// ==================== COMMUNITY REVIEW CARD (approved reviews, separate design) ====================
const CommunityReviewCard: React.FC<{ review: Review; index: number }> = ({ review, index }) => {
  const tint = getAvatarTint(review.name);
  const initials = getInitials(review.name);

  return (
    <article
      className="community-review-card group relative bg-[#FAF9F6] rounded-[2rem] p-6 md:p-8 border border-gray-100 hover:border-[#F2529D]/20 transition-all duration-500 hover:shadow-2xl overflow-hidden"
    >
      {/* Decorative number watermark */}
      <span className="absolute top-4 right-5 text-6xl md:text-7xl font-display italic font-black text-gray-100 select-none leading-none">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Header: avatar + name + stars */}
      <div className="relative flex items-start gap-4 mb-5">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shrink-0 shadow-lg"
          style={{ backgroundColor: tint }}
        >
          {review.avatarUrl ? (
            <img src={review.avatarUrl} alt={review.name} className="w-full h-full rounded-2xl object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-base font-black text-gray-900 truncate">{review.name}</p>
          <p className="text-[0.55rem] font-black tracking-[0.2em] text-[#BF9C34] uppercase mb-1.5">{review.role || 'Verified Guest'}</p>
          <StarRow rating={review.rating} size="sm" />
        </div>
      </div>

      {/* Quote */}
      <div className="relative space-y-3">
        <Quote className="w-6 h-6 text-[#F2529D]/20 fill-current" />
        <p className="text-base md:text-lg font-display italic text-gray-800 leading-relaxed font-bold">
          {review.mainQuote}
        </p>
        {review.subQuote1 && (
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            {review.subQuote1}
          </p>
        )}
      </div>

      {/* Footer: service tag */}
      {review.serviceName && (
        <div className="relative mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#F2529D]" />
          <span className="text-[0.6rem] font-black tracking-wider text-gray-400 uppercase">{review.serviceName}</span>
        </div>
      )}
    </article>
  );
};

// ==================== MAIN PAGE ====================
const TestimonialsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const googleScrollRef = useRef<HTMLDivElement>(null);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    serviceId: '',
    mainQuote: '',
    subQuote1: '',
  });
  const authToken = getStoredAuthToken();

  // ======== Load data ========
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [fetchedReviews, fetchedServices] = await Promise.all([getReviews(), getServices()]);
      setReviews(fetchedReviews);
      setServices(fetchedServices);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, []);

  // Split reviews: featured (Google) vs regular approved community reviews.
  // The Google showcase holds a maximum of 5 curated reviews.
  const googleReviews = useMemo(
    () => reviews.filter((r) => r.featured).slice(0, 5),
    [reviews],
  );
  const communityReviews = useMemo(
    () => reviews.filter((r) => !r.featured).sort((a, b) => b.createdAt - a.createdAt),
    [reviews],
  );

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, fiveStar: 0, satisfaction: 0 };
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const avg = sum / total;
    const fiveStar = reviews.filter((r) => r.rating === 5).length;
    const satisfaction = Math.round((reviews.filter((r) => r.rating >= 4).length / total) * 100);
    return { avg, total, fiveStar, satisfaction };
  }, [reviews]);

  // ======== Entry + scroll animations ========
  useEffect(() => {
    window.scrollTo(0, 0);

    // Safety net: force the container visible after a short delay.
    // This prevents the page from being stuck invisible if the GSAP
    // entry animation is interrupted (e.g., React StrictMode remount,
    // browser tab backgrounding, or any timing hiccup).
    const safetyNet = window.setTimeout(() => {
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' });
      }
      gsap.set('.chron-eyebrow, .chron-title, .chron-sub', { opacity: 1, y: 0, clearProps: 'all' });
    }, 2000);

    const tl = gsap.timeline({
      onComplete: () => {
        // Make absolutely sure everything is visible after the timeline finishes.
        gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' });
        gsap.set('.chron-eyebrow, .chron-title, .chron-sub', { opacity: 1, y: 0, clearProps: 'all' });
      },
    });
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.inOut' })
      .fromTo('.chron-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('.chron-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, '-=0.5')
      .fromTo('.chron-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8');

    return () => {
      window.clearTimeout(safetyNet);
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // Scroll reveals (safe pattern: elements visible by default, animate on enter).
  useEffect(() => {
    const createdTriggers: ScrollTrigger[] = [];
    const revealEls = gsap.utils.toArray<HTMLElement>('.chron-reveal');
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
    return () => { createdTriggers.forEach((t) => t.kill()); };
  }, [reviews.length]);

  // Google reviews horizontal scroll
  const scrollGoogle = (dir: 'left' | 'right') => {
    if (!googleScrollRef.current) return;
    const el = googleScrollRef.current;
    const cardWidth = el.querySelector('article')?.getBoundingClientRect().width ?? 320;
    const gap = 24;
    el.scrollBy({ left: (cardWidth + gap) * (dir === 'left' ? -1 : 1), behavior: 'smooth' });
  };

  // ======== Form handlers ========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sessionToken = getStoredAuthToken();
    if (!sessionToken) {
      setSubmitError('Please sign in to share your chronicle first.');
      return;
    }
    setIsSubmitting(true);
    try {
      const selectedService = services.find((s) => s.id === formData.serviceId);
      await submitReview({
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        mainQuote: formData.mainQuote,
        subQuote1: formData.subQuote1,
        serviceId: formData.serviceId,
        serviceName: selectedService?.name || 'General Inquiry',
      }, sessionToken);
      setSubmitSuccess(true);
      setSubmitError(null);
      setFormData({ name: '', email: '', rating: 5, serviceId: '', mainQuote: '', subQuote1: '' });
      setTimeout(() => setSubmitSuccess(false), 6000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  if (isLoading) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#F2529D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen text-[#333] font-serif overflow-x-hidden">
      {/* ==================== HEADER ==================== */}
      <div className="max-w-5xl mx-auto px-4 pt-32 md:pt-48 pb-16 md:pb-24 text-center">
        <div className="chron-eyebrow flex items-center justify-center gap-4 mb-6 md:mb-8">
          <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Dubai Beauty Lounge</span>
          <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
        </div>
        <h1 className="chron-title text-5xl sm:text-7xl md:text-9xl font-display text-[#F2529D] italic font-black mb-6 md:mb-8 leading-none tracking-tighter">
          Client Chronicles
        </h1>
        <p className="chron-sub text-gray-500 text-base md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
          Stories of radiance and transformation from our cherished guests, curated from Google and our community.
        </p>
      </div>

      {/* ==================== STATS STRIP ==================== */}
      {reviews.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 mb-16 md:mb-24 chron-reveal">
          <div className="bg-white rounded-[2rem] shadow-lg border border-gray-100 p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-display italic font-black text-[#F2529D]">{stats.avg.toFixed(1)}</p>
              <p className="text-[0.55rem] md:text-xs font-black uppercase tracking-[0.25em] text-gray-400">Average Rating</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-display italic font-black text-gray-900">{stats.total}</p>
              <p className="text-[0.55rem] md:text-xs font-black uppercase tracking-[0.25em] text-gray-400">Total Reviews</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-display italic font-black text-[#BF9C34]">{stats.fiveStar}</p>
              <p className="text-[0.55rem] md:text-xs font-black uppercase tracking-[0.25em] text-gray-400">Five Star</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl md:text-4xl font-display italic font-black text-green-600">{stats.satisfaction}%</p>
              <p className="text-[0.55rem] md:text-xs font-black uppercase tracking-[0.25em] text-gray-400">Satisfaction</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== GOOGLE REVIEWS SHOWCASE (max 5) ==================== */}
      {googleReviews.length > 0 && (
        <section className="py-12 md:py-20 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="chron-reveal text-center mb-10 md:mb-16">
              <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
                <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34] flex items-center gap-2">
                  <Award className="w-3 h-3" /> Curated from Google
                </span>
                <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
              </div>
              <h2 className="text-4xl md:text-7xl font-display italic font-black text-gray-900 leading-none tracking-tighter mb-3">
                Verified <span className="text-[#F2529D]">Voices</span>
              </h2>
              <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
                Real reviews from real guests, collected from our Google business listing.
              </p>
            </div>

            {/* Horizontal scroll carousel of Google review cards */}
            <div className="chron-reveal relative">
              {/* Nav arrows (desktop) */}
              {googleReviews.length > 3 && (
                <>
                  <button
                    onClick={() => scrollGoogle('left')}
                    className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 items-center justify-center text-[#F2529D] hover:bg-[#F2529D] hover:text-white transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => scrollGoogle('right')}
                    className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-xl border border-gray-100 items-center justify-center text-[#F2529D] hover:bg-[#F2529D] hover:text-white transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              <div
                ref={googleScrollRef}
                className="flex gap-5 md:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {googleReviews.map((review) => (
                  <div
                    key={review.id}
                    className="snap-start shrink-0 w-[280px] sm:w-[340px] md:w-[380px]"
                  >
                    <GoogleReviewCard review={review} />
                  </div>
                ))}
              </div>

              {/* Scroll hint on mobile */}
              <p className="md:hidden text-center text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-300 mt-4">
                Swipe to explore
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ==================== COMMUNITY CHRONICLES (approved customer reviews) ==================== */}
      {communityReviews.length > 0 && (
        <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="chron-reveal text-center mb-10 md:mb-16">
              <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
                <span className="h-px w-10 md:w-14 bg-[#F2529D]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#F2529D] flex items-center gap-2">
                  <Heart className="w-3 h-3" /> Community Stories
                </span>
                <span className="h-px w-10 md:w-14 bg-[#F2529D]" />
              </div>
              <h2 className="text-4xl md:text-7xl font-display italic font-black text-gray-900 leading-none tracking-tighter mb-3">
                More <span className="text-[#F2529D]">Chronicles</span>
              </h2>
              <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
                Verified experiences shared by our guests after their rituals.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {communityReviews.map((review, idx) => (
                <div key={review.id} className="chron-reveal">
                  <CommunityReviewCard review={review} index={idx} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state if no reviews at all */}
      {reviews.length === 0 && (
        <section className="py-20 md:py-32 px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-2xl md:text-3xl font-display italic font-black text-gray-400 mb-2">No chronicles yet</h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto">Be the first to share your Sibs Style story below.</p>
        </section>
      )}

      {/* ==================== SHARE YOUR STORY FORM ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div
            className="bg-[#0A0E1A] rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 lg:p-16 text-white relative overflow-hidden border border-white/5 shadow-2xl chron-reveal"
          >
            {/* Ambient auras */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2529D]/15 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#BF9C34]/15 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-10 md:mb-14">
                <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
                  <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Your Turn</span>
                  <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display italic font-black leading-none tracking-tighter mb-4">
                  Share Your <span className="text-[#F2529D]">Sibs Story</span>
                </h2>
                <p className="text-sm md:text-base text-white/60 max-w-xl mx-auto font-medium leading-relaxed">
                  Your journey toward radiance is our greatest inspiration. Share your experience and it will be published after a quick review.
                </p>
              </div>

              {/* Sign-in gate */}
              {!authToken && (
                <div className="mb-8 md:mb-10 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 md:px-8 py-5 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-[#F2529D] mb-2">Protected submission</p>
                    <p className="text-sm md:text-base text-white/70 leading-relaxed">
                      Sign in to tie your chronicle to a real client account before it goes to moderation.
                    </p>
                  </div>
                  <Link
                    to="/auth?redirect=/testimonials"
                    className="inline-flex items-center justify-center px-5 md:px-7 py-3 md:py-3.5 rounded-full bg-[#F2529D] text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-colors whitespace-nowrap shrink-0"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Form or success */}
              {submitSuccess ? (
                <div className="py-16 md:py-24 text-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#F2529D] rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-[0_0_50px_rgba(242,82,157,0.4)]">
                    <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-display italic font-black mb-3">Thank you, {formData.name || 'friend'}</h3>
                  <p className="text-sm md:text-base text-white/60 max-w-md mx-auto font-medium">
                    Your chronicle has been shared with our team and will be published shortly after a quick review.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                  {submitError && (
                    <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm font-medium flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">!</span>
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Step 1: Identity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#F2529D] flex items-center justify-center text-xs font-black">1</span>
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-[#F2529D]">Tell us who you are</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      <input
                        required
                        type="text"
                        placeholder="Your full name"
                        className="w-full bg-white/[0.04] border-2 border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#F2529D] focus:bg-white/[0.06] transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      <input
                        required
                        type="email"
                        placeholder="email@example.com"
                        className="w-full bg-white/[0.04] border-2 border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-white/30 focus:outline-none focus:border-[#F2529D] focus:bg-white/[0.06] transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Step 2: Service + Rating */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#BF9C34] flex items-center justify-center text-xs font-black text-black">2</span>
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-[#BF9C34]">Rate your ritual</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                      {/* Service dropdown */}
                      <div className="relative">
                        <select
                          required
                          className="w-full bg-white/[0.04] border-2 border-white/10 rounded-2xl px-5 py-4 text-base text-white appearance-none focus:outline-none focus:border-[#BF9C34] focus:bg-white/[0.06] transition-all cursor-pointer"
                          value={formData.serviceId}
                          onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                        >
                          <option value="" className="bg-[#0A0E1A] text-white/30">Choose your treatment</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id} className="bg-[#0A0E1A]">{s.name}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-[#BF9C34] pointer-events-none" />
                      </div>

                      {/* Interactive star rating */}
                      <div className="bg-white/[0.04] border-2 border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFormData({ ...formData, rating: star })}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-all duration-200 hover:scale-125"
                            >
                              <Star
                                className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-200 ${
                                  (hoverRating || formData.rating) >= star ? 'fill-current text-[#BF9C34]' : 'fill-none text-white/15'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#BF9C34] min-w-[70px] text-right">
                          {ratingLabels[hoverRating || formData.rating]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Story */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-xs font-black text-black">3</span>
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Share your story</span>
                    </div>

                    {/* Headline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-white/40">Headline</label>
                        <span className="text-[0.55rem] font-medium text-white/30">{formData.mainQuote.length}/100</span>
                      </div>
                      <input
                        required
                        type="text"
                        maxLength={100}
                        placeholder="e.g., An absolute sanctuary of elegance"
                        className="w-full bg-white/[0.04] border-2 border-white/10 rounded-2xl px-5 py-4 text-base md:text-lg font-display italic text-white placeholder-white/25 focus:outline-none focus:border-white focus:bg-white/[0.06] transition-all"
                        value={formData.mainQuote}
                        onChange={(e) => setFormData({ ...formData, mainQuote: e.target.value })}
                      />
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.25em] text-white/40">Your experience</label>
                        <span className="text-[0.55rem] font-medium text-white/30">{formData.subQuote1.length}/500</span>
                      </div>
                      <textarea
                        required
                        rows={5}
                        maxLength={500}
                        placeholder="Describe the sensations, the service, and the transformation you experienced..."
                        className="w-full bg-white/[0.04] border-2 border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder-white/25 focus:outline-none focus:border-white focus:bg-white/[0.06] transition-all resize-none leading-relaxed"
                        value={formData.subQuote1}
                        onChange={(e) => setFormData({ ...formData, subQuote1: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full overflow-hidden rounded-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#F2529D] to-[#BF9C34] transition-transform duration-500 group-hover:scale-105" />
                      <div className="relative flex items-center justify-center gap-3 py-4 md:py-5 text-white font-black italic tracking-[0.2em] md:tracking-[0.3em] uppercase text-xs md:text-sm transition-transform active:scale-95">
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sharing...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                            <span>Share Your Chronicle</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              )}

              {/* Trust badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-10 md:mt-14 pt-10 md:pt-14 border-t border-white/5">
                {[
                  { icon: TrendingUp, color: '#F2529D', title: 'Shape Our Rituals', desc: 'Your feedback directly improves every future visit.' },
                  { icon: CheckCircle2, color: '#BF9C34', title: 'Verified Authentic', desc: 'Every chronicle is tied to a real client account.' },
                  { icon: Heart, color: '#F2529D', title: 'Community Voice', desc: 'Stories are published after a quick quality review.' },
                ].map((badge) => (
                  <div key={badge.title} className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${badge.color}15` }}>
                      <badge.icon className="w-5 h-5" style={{ color: badge.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black italic mb-1">{badge.title}</p>
                      <p className="text-xs text-white/50 leading-relaxed">{badge.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TestimonialsPage;
