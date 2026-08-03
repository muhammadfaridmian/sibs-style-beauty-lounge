import React, { useState, useEffect, useMemo, useRef } from 'react';
import Footer from './components/Footer';
import { Link } from 'react-router-dom';
import {
  Clock, ChevronRight, ChevronLeft, Mail as MailIcon, Phone, MapPin,
  Calendar as CalendarIcon, User, ArrowRight, AlertCircle, Sparkles,
  Info, Tag, Gift, X, Check, Leaf, ShieldCheck, Timer,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  getServices, getAvailability, createAppointment,
  formatPrice, formatDuration, formatDate,
  getStoredAuthToken, getCurrentAuthUser,
  getPromotions, type Service, type Promotion,
} from './api/convex-api';
import bookingHeroImage from './assets/Sibshall.jpeg';
import experienceImage from './assets/Jikai.jpeg';

gsap.registerPlugin(ScrollTrigger);

// ==================== HELPERS ====================

// Format a Date as YYYY-MM-DD using the local timezone.
// This avoids the UTC drift that toISOString() introduces for users ahead of UTC.
const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Estimate the end time from a start label like "10:00 AM" plus a duration.
const getEstimatedEndTime = (timeLabel: string, durationMinutes: number): string => {
  const parts = timeLabel.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!parts) return timeLabel;
  let hours = parseInt(parts[1], 10);
  const minutes = parseInt(parts[2], 10);
  const period = parts[3].toUpperCase();
  let total = hours % 12 * 60 + minutes;
  if (period === 'PM') total += 12 * 60;
  total += durationMinutes;
  const endHours24 = Math.floor(total / 60) % 24;
  const endMinutes = total % 60;
  const endPeriod = endHours24 >= 12 ? 'PM' : 'AM';
  const displayHours = endHours24 === 0 ? 12 : endHours24 > 12 ? endHours24 - 12 : endHours24;
  return `${displayHours}:${String(endMinutes).padStart(2, '0')} ${endPeriod}`;
};

// Parse a numeric discount percentage from a promotion's discountText.
const parseDiscountPercent = (text: string): number => {
  const match = text.match(/(\d+)%/);
  return match ? parseInt(match[1], 10) : 0;
};

const BookingPage: React.FC = () => {
  // ==================== STATE ====================
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<{
    serviceName: string; date: string; time: string; endTime: string;
    price: string; location: string; reference: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: 'Downtown Sibs Lounge',
    info: '',
  });

  // Promotions
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<Promotion | null>(null);
  const [claimedOffers, setClaimedOffers] = useState<Promotion[]>([]);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Calendar month being viewed (starts at current month)
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const offersRef = useRef<HTMLDivElement>(null);

  const authToken = getStoredAuthToken();
  const serviceSectionOrder = ['Hair Services', 'Nail Care', 'Eyelash', 'Facial & Threading', 'Waxing', 'Relaxing Massage'];

  // ==================== LOAD SERVICES + PREFILL ====================
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        const data = await getServices();
        setServices(data);
      } catch (error) {
        console.error('Failed to load services:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, []);

  // Prefill the form from the signed-in user's profile so they do not retype everything.
  useEffect(() => {
    if (!authToken) return;
    getCurrentAuthUser(authToken)
      .then((user) => {
        if (!user) return;
        setFormData((prev) => ({
          ...prev,
          fullName: user.fullName || prev.fullName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
        }));
      })
      .catch(() => {});
  }, [authToken]);

  // ==================== LOAD PROMOTIONS ====================
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        const data = await getPromotions();
        setPromotions(data.filter((p: Promotion) => p.active));
      } catch (error) {
        console.error('Failed to load promotions:', error);
      }
    };
    loadPromotions();
  }, []);

  // ==================== LOAD AVAILABILITY ====================
  useEffect(() => {
    if (!selectedService) return;
    const loadAvailability = async () => {
      try {
        setIsLoadingAvailability(true);
        const dateStr = formatDateForApi(selectedDate);
        const data = await getAvailability(dateStr, selectedService);
        setAvailability(data);
      } catch (error) {
        console.error('Failed to load availability:', error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };
    loadAvailability();
  }, [selectedService, selectedDate]);

  // ==================== AUTO-SCROLL ON SERVICE SELECT ====================
  useEffect(() => {
    if (selectedService && availabilityRef.current) {
      const timer = setTimeout(() => {
        availabilityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [selectedService]);

  // ==================== SMOOTH SCROLL (Lenis) ====================
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

  // ==================== ANIMATIONS ====================
  useEffect(() => {
    window.scrollTo(0, 0);
    const tl = gsap.timeline();
    gsap.set(containerRef.current, { opacity: 0 });

    tl.to(containerRef.current, {
      opacity: 1, duration: 1.2, ease: 'power2.inOut', delay: 0.1,
    })
      .fromTo('.booking-header', { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out' }, '-=0.8')
      .fromTo('.step-card', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }, '-=1')
      .fromTo('.experience-section', { opacity: 0, x: -50 }, { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, '-=0.5');

    // Scroll-triggered reveals for every element marked with .reveal-on-scroll
    const revealEls = gsap.utils.toArray<HTMLElement>('.reveal-on-scroll');
    revealEls.forEach((el) => {
      gsap.fromTo(el, { y: 60, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // ==================== HANDLERS ====================
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const sessionToken = getStoredAuthToken();
    if (!sessionToken) {
      setSubmitError('Please sign in to book a ritual first.');
      return;
    }
    if (!selectedService || !selectedTime) {
      setSubmitError('Please select a service and time slot first.');
      return;
    }
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const service = services.find((s) => s.id === selectedService);
      if (!service) throw new Error('Service not found');

      const appointmentData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        serviceId: selectedService,
        appointmentDate: formatDateForApi(selectedDate),
        appointmentTime: selectedTime,
        location: formData.location,
        info: formData.info,
      };

      const result = await createAppointment(appointmentData, sessionToken);
      if (result) {
        const finalPrice = appliedDiscount
          ? formatPrice(getDiscountedPrice(service.priceCents))
          : (service.priceLabel ?? formatPrice(service.priceCents));
        const endTime = getEstimatedEndTime(selectedTime, service.durationMinutes);
        const reference = `SIBS-${result.id.slice(-6).toUpperCase()}`;
        setBookingSuccess({
          serviceName: service.name,
          date: appointmentData.appointmentDate,
          time: selectedTime,
          endTime,
          price: finalPrice,
          location: formData.location,
          reference,
        });
        setFormData({ fullName: '', email: '', phone: '', location: 'Downtown Sibs Lounge', info: '' });
        setSelectedService(null);
        setSelectedTime(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== DATA ====================
  const timeSlots = availability?.slots?.filter((slot: any) => slot.available) || [];

  const selectedServiceObj = useMemo(
    () => services.find((s) => s.id === selectedService) || null,
    [services, selectedService],
  );

  // ==================== DISCOUNT HANDLING ====================
  const applyPromoCode = () => {
    if (!promoCode.trim()) { setPromoError('Please enter a discount code'); return; }
    const matchedPromo = promotions.find((p: Promotion) => p.code.toLowerCase() === promoCode.toLowerCase() && p.active);
    if (!matchedPromo) { setPromoError('Invalid or expired discount code'); setPromoCode(''); return; }
    if (claimedOffers.some((o) => o.id === matchedPromo.id)) { setPromoError('You have already redeemed this offer'); return; }
    const endDate = new Date(matchedPromo.endDate);
    if (new Date() > endDate) { setPromoError('This offer has expired'); return; }
    if (matchedPromo.offerType === 'LIMITED_EXCLUSIVE') {
      setAppliedDiscount(matchedPromo);
      setPromoSuccess(`Great! Applied ${matchedPromo.discountText} to your services`);
    } else {
      setClaimedOffers([...claimedOffers, matchedPromo]);
      setPromoSuccess(`Claimed: ${matchedPromo.discountText}`);
    }
    setPromoError(null);
    setPromoCode('');
    setTimeout(() => setPromoSuccess(null), 4000);
  };

  const removeAppliedDiscount = () => { setAppliedDiscount(null); setPromoError(null); };
  const removeClaimedOffer = (offerId: string) => setClaimedOffers(claimedOffers.filter((o) => o.id !== offerId));

  const getDiscountedPrice = (priceCents: number): number => {
    if (!appliedDiscount) return priceCents;
    const discountPercent = parseDiscountPercent(appliedDiscount.discountText);
    if (!discountPercent) return priceCents;
    return priceCents - (priceCents * discountPercent) / 100;
  };

  const getSavingsAmount = (priceCents: number): number => {
    if (!appliedDiscount) return 0;
    return priceCents - getDiscountedPrice(priceCents);
  };

  const groupedServices = useMemo(() => {
    return serviceSectionOrder
      .map((category) => ({
        category,
        services: services.filter((s) => s.category === category).sort((a, b) => a.sortOrder - b.sortOrder),
      }))
      .filter((section) => section.services.length > 0);
  }, [serviceSectionOrder, services]);

  // ==================== CALENDAR HELPERS ====================
  const today = useMemo(() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; }, []);
  const firstDayOfMonth = calendarMonth.getDay();
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isDateDisabled = (day: number) => {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };
  const isDateSelected = (day: number) =>
    selectedDate.getFullYear() === calendarMonth.getFullYear() &&
    selectedDate.getMonth() === calendarMonth.getMonth() &&
    selectedDate.getDate() === day;
  const isToday = (day: number) =>
    today.getFullYear() === calendarMonth.getFullYear() &&
    today.getMonth() === calendarMonth.getMonth() &&
    today.getDate() === day;

  const goToPrevMonth = () => {
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    if (prev >= currentMonthStart) setCalendarMonth(prev);
  };
  const goToNextMonth = () => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));

  const canGoPrev = (() => {
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return prev >= currentMonthStart;
  })();

  // ==================== PROGRESS TRACKER ====================
  const currentStep = selectedService ? (selectedTime ? (formData.fullName ? 4 : 3) : 2) : 1;
  const steps = [
    { num: '01', label: 'Service', ref: servicesRef },
    { num: '02', label: 'Schedule', ref: availabilityRef },
    { num: '03', label: 'Offers', ref: offersRef },
    { num: '04', label: 'Details', ref: detailsRef },
  ];

  const scrollToStep = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ==================== RENDER ====================
  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen text-[#333] font-serif overflow-x-hidden opacity-100">
      {/* Hero Section */}
      <div className="relative h-[600px] md:h-[700px] w-full overflow-hidden booking-header">
        <img src={bookingHeroImage} alt="Luxury Skincare" className="w-full h-full object-cover brightness-[0.65]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FAF9F6]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34] mb-4 md:mb-6 block">
            Dubai Beauty Lounge
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-display text-white mb-6 md:mb-9 drop-shadow-xl font-bold">
            Curate Your Glow
          </h1>
          <div className="bg-white/10 backdrop-blur-md px-8 md:px-10 py-3 md:py-4 rounded-full border border-white/20">
            <p className="text-[#F2529D] font-display text-xl md:text-4xl italic drop-shadow-lg font-bold leading-tight">
              Bespoke beauty services tailored for you
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-20">
        {/* The Sibs Experience Section */}
        <div className="mb-20 md:mb-40 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center experience-section">
          <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] group border-[2rem] border-white">
            <img src={experienceImage} alt="Sibs Experience" className="w-full h-[540px] object-cover transition-transform duration-1000 group-hover:scale-110" />
          </div>
          <div className="flex justify-center lg:justify-start">
            <div className="space-y-8 md:space-y-10 max-w-xl text-center lg:text-left">
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <span className="h-px w-12 bg-[#BF9C34]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">The Experience</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-display italic text-[#F2529D] font-black leading-none tracking-tighter">
                The Sibs Experience
              </h2>
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-black max-w-xl">
                Every visit is a curated journey through texture, scent, and scientific precision.
              </p>
              <div className="flex justify-center lg:justify-start">
                <div className="max-w-2xl w-full p-8 md:p-10 bg-white rounded-[3rem] shadow-xl border-l-[10px] border-[#BF9C34] group hover:scale-[1.02] transition-all duration-500">
                  <h4 className="text-3xl md:text-4xl font-display text-[#BF9C34] italic font-black mb-4">Sustainable</h4>
                  <p className="text-base md:text-lg text-gray-700 font-semibold leading-relaxed">Eco-conscious packaging and 100 percent ethically sourced ingredients.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="mb-16 md:mb-24 reveal-on-scroll">
          <div className="flex items-center justify-between max-w-3xl mx-auto bg-white rounded-full shadow-lg border border-gray-100 p-2 md:p-3 overflow-x-auto">
            {steps.map((step, idx) => (
              <React.Fragment key={step.num}>
                <button
                  onClick={() => scrollToStep(step.ref)}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-6 py-2 md:py-3 rounded-full transition-all duration-500 whitespace-nowrap ${
                    currentStep >= idx + 1 ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className={`text-xs md:text-sm font-black ${currentStep >= idx + 1 ? 'text-[#F2529D]' : 'text-gray-300'}`}>{step.num}</span>
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">{step.label}</span>
                  {currentStep > idx + 1 && <Check className="w-3 h-3 md:w-4 md:h-4 text-[#BF9C34]" />}
                </button>
                {idx < steps.length - 1 && (
                  <div className={`hidden md:block flex-1 h-px mx-2 ${currentStep > idx + 1 ? 'bg-[#BF9C34]' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Booking Registry */}
        <div className="flex flex-col gap-16 md:gap-24">
          {!authToken && (
            <div className="rounded-[2rem] sm:rounded-[3rem] border border-[#F2529D]/10 bg-white/85 p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 reveal-on-scroll">
              <div className="space-y-2">
                <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.35em] text-[#F2529D]">Protected booking</p>
                <p className="text-sm sm:text-lg text-gray-700 font-medium leading-relaxed max-w-3xl">
                  Booking now requires a signed in account so your appointment can be tied to the right customer record.
                </p>
              </div>
              <Link to="/auth?redirect=/booking" className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-black text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] hover:bg-[#F2529D] transition-colors whitespace-nowrap">
                Sign In or Register
              </Link>
            </div>
          )}

          {bookingSuccess && (
            <div className="rounded-[2rem] sm:rounded-[3rem] bg-[#0A0E1A] text-white p-6 sm:p-10 border border-white/10 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] relative overflow-hidden reveal-on-scroll">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(191,156,52,0.1),transparent_22%)]" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#F2529D] flex items-center justify-center shadow-[0_0_30px_rgba(242,82,157,0.5)]">
                    <Check className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-[#F2529D]">Ritual Confirmed</p>
                    <h3 className="text-2xl sm:text-4xl font-display italic font-black">Your appointment is booked</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-2">Service</p>
                    <p className="text-lg md:text-xl font-display italic font-black">{bookingSuccess.serviceName}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-2">Date and Time</p>
                    <p className="text-base md:text-lg font-black">{formatDate(bookingSuccess.date)}</p>
                    <p className="text-sm text-white/70 font-medium">{bookingSuccess.time} to {bookingSuccess.endTime}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-2">Location</p>
                    <p className="text-base md:text-lg font-black">{bookingSuccess.location}</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 md:p-6 border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-2">Investment</p>
                    <p className="text-xl md:text-2xl font-display italic font-black text-[#F2529D]">{bookingSuccess.price}</p>
                    <p className="text-xs text-white/50 mt-1">Pay at the lounge after your service</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Reference</p>
                    <p className="text-lg font-black tracking-wider text-[#BF9C34]">{bookingSuccess.reference}</p>
                  </div>
                  <button type="button" onClick={() => setBookingSuccess(null)} className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-white hover:text-black transition-colors">
                    Book Another Ritual
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Services */}
          <section ref={servicesRef} className="bg-white p-4 sm:p-6 md:p-20 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-50 step-card relative overflow-hidden group/card scroll-mt-24">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2529D]/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-colors duration-1000 group-hover/card:bg-[#BF9C34]/5" />
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 relative z-10">
              <div className="flex flex-col md:flex-row md:items-baseline space-y-2 md:space-y-0 space-x-0 md:space-x-8">
                <span className="text-3xl sm:text-4xl md:text-9xl font-display text-[#F2529D]/10 font-black leading-none">01</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.2em] text-gray-900 mb-3 md:mb-4">SERVICES</h2>
                  <p className="text-[#BF9C34] font-display italic text-2xl sm:text-3xl md:text-4xl font-bold">Choose your ritual</p>
                </div>
              </div>
              <div className="h-1 w-full md:w-64 bg-gradient-to-r from-[#BF9C34] to-transparent hidden md:block mb-6" />
            </div>

            {isLoading ? (
              <div className="space-y-6 relative z-10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-6 rounded-[2rem] border-2 border-gray-50">
                    <div className="flex-1 space-y-3">
                      <div className="h-3 w-24 bg-gray-100 rounded-full" />
                      <div className="h-6 w-48 bg-gray-100 rounded-full" />
                      <div className="h-4 w-72 bg-gray-50 rounded-full" />
                    </div>
                    <div className="h-12 w-12 bg-gray-100 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-12 md:space-y-16 relative z-10 max-w-full mx-auto">
                {groupedServices.map((section, sectionIndex) => (
                  <div key={section.category} className="space-y-6 sm:space-y-8" id={`cat-${section.category.replace(/\s+/g, '-').toLowerCase()}`}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <span className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.35em] text-[#BF9C34] block mb-2">Section {String(sectionIndex + 1).padStart(2, '0')}</span>
                        <h3 className="text-3xl sm:text-4xl md:text-6xl font-display italic font-black text-gray-900 leading-none">{section.category}</h3>
                      </div>
                      <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-400">{section.services.length} services</p>
                    </div>
                    <div className="grid gap-4 sm:gap-5 md:gap-6">
                      {section.services.map((service) => {
                        const isSelected = selectedService === service.id;
                        const discountPercent = appliedDiscount ? parseDiscountPercent(appliedDiscount.discountText) : 0;
                        const hasDiscount = appliedDiscount && discountPercent > 0;
                        return (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => setSelectedService(service.id)}
                            className={`group text-left transition-all duration-700 p-4 sm:p-5 md:p-6 rounded-[2rem] border-2 relative overflow-hidden flex flex-col md:flex-row md:items-center gap-4 sm:gap-5 ${
                              isSelected ? 'bg-black border-black text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]' : 'bg-white border-gray-100 hover:border-[#F2529D]/20 hover:shadow-2xl hover:-translate-y-1'
                            }`}
                          >
                            <div className="min-w-0 space-y-2 flex-1">
                              <span className={`text-[0.6rem] sm:text-[0.7rem] font-black tracking-[0.35em] uppercase transition-colors duration-500 ${isSelected ? 'text-[#F2529D]' : 'text-[#BF9C34]'}`}>
                                Treatment Ritual {String(service.sortOrder).padStart(2, '0')}
                              </span>
                              <h4 className={`text-xl sm:text-2xl md:text-3xl font-display italic font-black leading-tight transition-colors duration-500 ${isSelected ? 'text-white' : 'text-gray-900 group-hover:text-[#F2529D]'}`}>
                                {service.name}
                              </h4>
                              <p className={`text-sm sm:text-base leading-relaxed transition-colors duration-500 ${isSelected ? 'text-white/75' : 'text-gray-600'}`}>
                                {service.shortDescription}
                              </p>
                              {/* Key benefits as small pills */}
                              {service.keyBenefits && service.keyBenefits.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                  {service.keyBenefits.slice(0, 4).map((benefit, i) => (
                                    <span key={i} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[0.6rem] sm:text-[0.65rem] font-black uppercase tracking-[0.15em] transition-colors duration-500 ${isSelected ? 'bg-white/10 text-white/70' : 'bg-[#FAF9F6] text-gray-500 group-hover:bg-[#F2529D]/5 group-hover:text-[#F2529D]'}`}>
                                      <Leaf className="w-2.5 h-2.5" /> {benefit}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4 md:gap-6">
                              <div className="text-left md:text-right space-y-1">
                                {hasDiscount ? (
                                  <>
                                    <span className={`block text-sm md:text-base font-black line-through opacity-50 ${isSelected ? 'text-white' : 'text-[#333]'}`}>
                                      {service.priceLabel ?? formatPrice(service.priceCents)}
                                    </span>
                                    <span className={`block text-xl sm:text-2xl md:text-4xl font-black transition-colors duration-500 ${isSelected ? 'text-green-300' : 'text-green-600'}`}>
                                      {formatPrice(getDiscountedPrice(service.priceCents))}
                                    </span>
                                    <span className="block text-[0.6rem] font-black uppercase tracking-widest text-green-500">
                                      Save {formatPrice(getSavingsAmount(service.priceCents))}
                                    </span>
                                  </>
                                ) : (
                                  <span className={`block text-xl sm:text-2xl md:text-4xl font-black transition-colors duration-500 ${isSelected ? 'text-white' : 'text-[#333]'}`}>
                                    {service.priceLabel ?? formatPrice(service.priceCents)}
                                  </span>
                                )}
                                <span className={`flex items-center gap-1 justify-end text-[0.65rem] sm:text-xs font-black tracking-widest uppercase ${isSelected ? 'text-[#F2529D]' : 'text-[#BF9C34]'}`}>
                                  <Clock className="w-3 h-3" /> {formatDuration(service.durationMinutes)}
                                </span>
                              </div>
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500 shrink-0 ${isSelected ? 'bg-white shadow-xl' : 'bg-[#FAF9F6] border border-gray-100 group-hover:bg-[#F2529D] group-hover:text-white'}`}>
                                {isSelected ? <Check size={20} className="text-black" /> : <ArrowRight size={20} className="text-gray-400 group-hover:text-white" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-16 md:gap-24">
            {/* Step 2: Availability */}
            <div ref={availabilityRef} className="bg-white p-4 sm:p-6 md:p-24 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-50 step-card relative overflow-hidden scroll-mt-24">
              <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-[#FAF9F6] to-transparent opacity-50" />
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 relative z-10">
                <div className="flex flex-col md:flex-row md:items-baseline space-y-2 md:space-y-0 space-x-0 md:space-x-8">
                  <span className="text-3xl sm:text-5xl md:text-9xl font-display text-[#BF9C34]/20 font-black leading-none">02</span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[0.08em] sm:tracking-[0.15em] md:tracking-[0.2em] text-gray-900 mb-2 border-b-4 border-[#BF9C34]/30 pb-1 sm:pb-2 inline-block leading-tight">AVAILABILITY</h2>
                    <p className="text-[#F2529D] font-display italic text-base sm:text-xl md:text-3xl font-bold">Secure your sanctuary</p>
                  </div>
                </div>
                <div className="h-1 w-full md:w-64 bg-gradient-to-r from-[#BF9C34] to-transparent hidden md:block mb-6" />
              </div>

              {!selectedService ? (
                <div className="text-center py-20 relative z-10">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                    <Sparkles className="w-10 h-10 text-gray-300 animate-pulse" />
                  </div>
                  <p className="text-gray-400 text-base sm:text-2xl font-black italic tracking-[0.2em] sm:tracking-widest uppercase px-4">Select a ritual above first</p>
                </div>
              ) : (
                <div className="flex flex-col gap-12 md:gap-16 relative z-10">
                  {isLoadingAvailability && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[2rem] sm:rounded-[3rem] md:rounded-[5rem] bg-white/75 backdrop-blur-sm">
                      <div className="text-center space-y-4 px-4">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 border-4 border-[#F2529D]/20 border-t-[#F2529D] rounded-full animate-spin mx-auto" />
                        <p className="text-[#F2529D] text-xs sm:text-sm md:text-base font-black tracking-[0.25em] sm:tracking-[0.4em] uppercase">Updating availability</p>
                      </div>
                    </div>
                  )}

                  {/* Calendar */}
                  <div className="bg-white/60 p-4 sm:p-8 md:p-16 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] border-4 md:border-8 border-white shadow-2xl backdrop-blur-xl">
                    {/* Calendar header with month navigation */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 sm:mb-12 md:mb-16 gap-4 sm:gap-6">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="p-3 sm:p-4 bg-[#BF9C34] rounded-[1rem] sm:rounded-[1.5rem] shadow-xl">
                          <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                          <span className="text-[0.65rem] sm:text-[0.85rem] font-black text-[#BF9C34] uppercase tracking-[0.35em] sm:tracking-[0.5em] block mb-1">Ritual Cycle</span>
                          <span className="text-xl sm:text-2xl md:text-4xl font-black uppercase tracking-tight text-[#333]">
                            {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          onClick={goToPrevMonth}
                          disabled={!canGoPrev}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-[#F2529D] hover:text-white hover:border-[#F2529D] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={goToNextMonth}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-[#F2529D] hover:text-white hover:border-[#F2529D] transition-all"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Selected date indicator */}
                    <div className="flex items-center gap-3 sm:gap-4 bg-[#FAF9F6] px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-white shadow-inner mb-6 sm:mb-8 w-fit mx-auto">
                      <div className="w-3 h-3 rounded-full bg-[#F2529D]" />
                      <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-400">Selected:</span>
                      <span className="text-base sm:text-lg font-black text-black">{formatDate(formatDateForApi(selectedDate))}</span>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-x-1 sm:gap-x-2 md:gap-x-4 gap-y-2 sm:gap-y-4 text-center mb-2 sm:mb-4">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                        <span key={i} className="text-[0.55rem] sm:text-[0.8rem] md:text-[0.95rem] font-black text-gray-900 tracking-[0.12em] sm:tracking-[0.2em] pb-2 sm:pb-4 border-b-2 border-gray-100">{day}</span>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-x-1 sm:gap-x-2 md:gap-x-4 gap-y-2 sm:gap-y-4 md:gap-y-6 text-center">
                      {blankDays.map((i) => <div key={`blank-${i}`} className="h-12 sm:h-16 md:h-20" />)}
                      {calendarDays.map((day) => {
                        const isSelected = isDateSelected(day);
                        const isDisabled = isDateDisabled(day);
                        const isTodayFlag = isToday(day);
                        return (
                          <button
                            key={day}
                            onClick={() => !isDisabled && setSelectedDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day))}
                            disabled={isDisabled}
                            className={`text-base sm:text-xl md:text-2xl font-black h-12 sm:h-16 md:h-20 flex items-center justify-center rounded-[0.75rem] sm:rounded-[1rem] md:rounded-[1.5rem] transition-all duration-200 relative group/date ${
                              isSelected
                                ? 'text-white'
                                : isDisabled
                                  ? 'text-gray-200 cursor-not-allowed'
                                  : 'text-gray-800 hover:bg-[#F2529D]/5 hover:scale-105 cursor-pointer'
                            }`}
                          >
                            {isSelected && <div className="absolute inset-0 bg-black rounded-[0.75rem] sm:rounded-[1rem] md:rounded-[1.5rem] shadow-2xl" />}
                            <span className="relative z-10">{day}</span>
                            {isTodayFlag && !isSelected && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#F2529D] rounded-full" />}
                            {!isSelected && !isDisabled && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#BF9C34]/30 rounded-full group-hover/date:bg-[#BF9C34] transition-colors" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-8 md:space-y-12 w-full">
                    <div className="bg-white/60 p-4 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-4 md:border-8 border-white shadow-2xl backdrop-blur-xl">
                      <div className="flex flex-col md:flex-row items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-6 border-b-4 border-gray-50 pb-6 sm:pb-10">
                        <h4 className="text-[0.6rem] sm:text-[0.8rem] font-black tracking-[0.35em] sm:tracking-[0.6em] text-gray-400 uppercase flex items-center text-center md:text-left">
                          <Clock className="w-5 h-5 sm:w-8 sm:h-8 mr-3 sm:mr-6 text-[#BF9C34]" /> SELECT RITUAL TIME
                        </h4>
                        <div className="flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-full shadow-lg border-2 border-[#F2529D]/20">
                          <div className="w-3 h-3 rounded-full bg-[#F2529D] animate-pulse" />
                          <span className="text-[0.55rem] sm:text-[0.7rem] font-bold text-[#F2529D] tracking-[0.25em] sm:tracking-[0.35em] uppercase">Live Availability</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5 md:gap-8">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot: any) => {
                            const isSlotSelected = selectedTime === slot.timeLabel;
                            const endTime = selectedServiceObj ? getEstimatedEndTime(slot.timeLabel, selectedServiceObj.durationMinutes) : null;
                            return (
                              <button
                                key={slot.timeLabel}
                                onClick={() => setSelectedTime(slot.timeLabel)}
                                className={`group relative py-5 sm:py-6 md:py-8 px-3 sm:px-4 transition-all duration-500 rounded-[1.5rem] sm:rounded-[2rem] border-2 md:border-4 flex flex-col items-center justify-center gap-1 sm:gap-2 ${
                                  isSlotSelected
                                    ? 'bg-[#F2529D] border-[#F2529D] text-white shadow-[0_30px_60px_-15px_rgba(242,82,157,0.45)] scale-105 z-20'
                                    : 'bg-white border-white text-gray-900 hover:border-[#F2529D]/20 hover:shadow-xl hover:-translate-y-1'
                                }`}
                              >
                                <span className={`text-[0.5rem] sm:text-[0.65rem] font-black tracking-widest uppercase transition-colors ${isSlotSelected ? 'text-white/70' : 'text-[#BF9C34]'}`}>
                                  {slot.timeLabel.split(' ')[1]}
                                </span>
                                <span className="text-lg sm:text-xl md:text-2xl font-black tracking-tighter">{slot.timeLabel.split(' ')[0]}</span>
                                {isSlotSelected && endTime && (
                                  <span className="text-[0.55rem] sm:text-[0.65rem] font-bold text-white/60">until {endTime}</span>
                                )}
                                {isSlotSelected && (
                                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                  </div>
                                )}
                              </button>
                            );
                          })
                        ) : (
                          <div className="col-span-full py-12 sm:py-20 text-center bg-gray-50/50 rounded-[2rem] sm:rounded-[3rem] border-4 border-white border-dashed">
                            <Clock className="w-10 h-10 sm:w-14 sm:h-14 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-300 text-base sm:text-2xl font-black italic tracking-[0.2em] sm:tracking-widest uppercase px-4">No available slots for this date</p>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium mt-2">Try selecting a different day</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ritual prep summary */}
                    {selectedServiceObj && (
                      <div className="bg-white p-4 sm:p-8 md:p-12 rounded-[2rem] sm:rounded-[3rem] border-4 md:border-8 border-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#F2529D]/3 rounded-bl-full blur-[120px] -mr-48 -mt-48" />
                        <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 md:gap-12 relative z-10 w-full text-center md:text-left">
                          <div className="p-4 sm:p-6 md:p-8 bg-black rounded-[1.5rem] sm:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-2 border-[#F2529D]/30 shrink-0">
                            <Timer className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#F2529D]" />
                          </div>
                          <div className="flex-1 space-y-3 px-2">
                            <h4 className="text-[0.55rem] sm:text-[0.75rem] font-bold text-gray-400 uppercase tracking-[0.35em] sm:tracking-[0.5em]">Essential Ritual Preparation</h4>
                            <div className="flex flex-col md:flex-row md:items-baseline gap-2 sm:gap-4 justify-center md:justify-start">
                              <p className="text-[#333] text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter">
                                {formatDuration(selectedServiceObj.durationMinutes)}
                              </p>
                              <span className="text-sm sm:text-lg font-display italic text-[#F2529D] font-black tracking-widest">Total Ritual Time</span>
                            </div>
                            <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed max-w-3xl">
                              Our studio will be prepared 15 minutes prior to your arrival. Please arrive on time to undergo our full sensory sequence without rush.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Offers & Discounts */}
            <div ref={offersRef} className="bg-white p-4 sm:p-6 md:p-20 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-50 step-card relative overflow-hidden group/card scroll-mt-24">
              <div className="absolute top-0 left-0 w-96 h-96 bg-[#BF9C34]/5 rounded-full blur-[100px] -ml-48 -mt-48 transition-colors duration-1000 group-hover/card:bg-[#F2529D]/5" />
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 sm:gap-8 mb-10 sm:mb-14 md:mb-16 relative z-10">
                <div className="flex flex-col md:flex-row md:items-baseline space-y-2 md:space-y-0 space-x-0 md:space-x-8">
                  <span className="text-3xl sm:text-4xl md:text-9xl font-display text-[#F2529D]/10 font-black leading-none">03</span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.2em] text-gray-900 mb-2 md:mb-3">OFFERS and PROMOTIONS</h2>
                    <p className="text-[#BF9C34] font-display italic text-lg sm:text-xl md:text-3xl font-bold">Unlock exclusive savings</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 sm:space-y-8 relative z-10">
                <div className="bg-gradient-to-r from-[#F2529D]/5 to-[#BF9C34]/5 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-[#F2529D]/10">
                  <label className="text-[0.7rem] sm:text-[0.85rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] uppercase mb-4">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> APPLY DISCOUNT CODE
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(null); }}
                      placeholder="Enter code (e.g., GLOW20)"
                      className="flex-1 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-full text-base sm:text-lg font-black text-gray-900 border-2 border-[#F2529D]/20 focus:border-[#F2529D] outline-none transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={applyPromoCode}
                      className="px-6 sm:px-10 py-3 sm:py-4 bg-[#F2529D] hover:bg-[#F2529D]/90 text-white rounded-full text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      Apply Code
                    </button>
                  </div>
                  {promoError && (
                    <div className="mt-3 flex items-center gap-2 text-red-600 text-xs sm:text-sm font-semibold">
                      <AlertCircle size={16} /> {promoError}
                    </div>
                  )}
                  {promoSuccess && (
                    <div className="mt-3 flex items-center gap-2 text-green-600 text-xs sm:text-sm font-semibold">
                      <Check size={16} /> {promoSuccess}
                    </div>
                  )}
                </div>

                {appliedDiscount && (
                  <div className="bg-gradient-to-r from-[#F2529D]/10 to-[#BF9C34]/10 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-[#F2529D]/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-[#F2529D]/20 rounded-full blur-lg -mr-10 -mt-10" />
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <span className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.35em] text-[#F2529D] block flex items-center gap-2">
                          <Sparkles className="w-3 h-3" /> ACTIVE DISCOUNT
                        </span>
                        <h4 className="text-lg sm:text-2xl font-display italic text-gray-900 font-black">{appliedDiscount.title}</h4>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{appliedDiscount.description}</p>
                        <div className="pt-2 space-y-1">
                          <p className="text-xs sm:text-sm font-black text-[#BF9C34]">{appliedDiscount.discountText}</p>
                          <p className="text-[0.7rem] sm:text-xs text-gray-500">Valid until {new Date(appliedDiscount.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button onClick={removeAppliedDiscount} className="p-2 sm:p-3 rounded-full bg-white hover:bg-red-50 transition-colors shrink-0">
                        <X size={20} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}

                {claimedOffers.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-[0.2em] text-[#BF9C34] flex items-center gap-2">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5" /> Claimed Offers ({claimedOffers.length})
                    </h3>
                    <div className="space-y-3">
                      {claimedOffers.map((offer) => (
                        <div key={offer.id} className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-[1.25rem] border-2 border-green-200 flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base sm:text-lg font-display italic text-gray-900 font-black mb-1">{offer.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 font-semibold">{offer.discountText}</p>
                            <p className="text-[0.65rem] sm:text-xs text-green-700 font-black mt-1">Expires {new Date(offer.endDate).toLocaleDateString()}</p>
                          </div>
                          <button onClick={() => removeClaimedOffer(offer.id)} className="flex-shrink-0 p-2 hover:bg-red-100 rounded-full transition-colors">
                            <X size={18} className="text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {promotions.length > 0 && !appliedDiscount && claimedOffers.length === 0 && (
                  <div className="text-center py-4 text-gray-500 text-xs sm:text-sm italic">
                    Have a promo code? Enter it above to unlock exclusive savings or special offers.
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Details */}
            <div ref={detailsRef} className="bg-[#FAF9F6] p-4 sm:p-8 md:p-20 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)] border-2 border-white step-card relative overflow-hidden scroll-mt-24">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#BF9C34]/5 rounded-bl-full blur-[100px]" />
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 relative z-10">
                <div className="flex flex-col md:flex-row md:items-baseline space-y-2 md:space-y-0 space-x-0 md:space-x-8">
                  <span className="text-5xl sm:text-7xl md:text-9xl font-display text-[#333]/10 font-black leading-none">04</span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[0.08em] sm:tracking-[0.1em] text-[#333] border-b-4 sm:border-b-8 border-white pb-2 sm:pb-3 inline-block leading-tight">YOUR DETAILS</h2>
                    <p className="text-[#F2529D] font-display italic text-base sm:text-xl md:text-4xl font-bold mt-2">The final touch</p>
                  </div>
                </div>
                <div className="h-1 w-full md:w-48 bg-white hidden md:block mb-8" />
              </div>

              <form className="space-y-10 sm:space-y-12 md:space-y-16 relative z-10" onSubmit={handleBooking}>
                {submitError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-1 flex-shrink-0" />
                    <p className="text-red-800 font-semibold">{submitError}</p>
                  </div>
                )}

                {/* Price Breakdown Card */}
                {selectedServiceObj && (
                  <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border-2 border-[#F2529D]/10 overflow-hidden shadow-lg">
                    <div className="bg-gradient-to-r from-[#F2529D]/5 to-[#BF9C34]/5 px-6 sm:px-8 py-4 border-b border-[#F2529D]/10">
                      <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.35em] text-[#F2529D] flex items-center gap-2">
                        <Info className="w-3 h-3" /> RITUAL INVESTMENT BREAKDOWN
                      </p>
                    </div>
                    <div className="p-6 sm:p-8 space-y-3">
                      <div className="flex justify-between items-center text-sm sm:text-base">
                        <span className="text-gray-500 font-medium">{selectedServiceObj.name}</span>
                        <span className="font-black text-gray-900">{selectedServiceObj.priceLabel ?? formatPrice(selectedServiceObj.priceCents)}</span>
                      </div>
                      {appliedDiscount && (
                        <>
                          <div className="flex justify-between items-center text-sm sm:text-base">
                            <span className="text-green-600 font-medium flex items-center gap-2">
                              <Tag className="w-3 h-3" /> {appliedDiscount.discountText}
                            </span>
                            <span className="font-black text-green-600">- {formatPrice(getSavingsAmount(selectedServiceObj.priceCents))}</span>
                          </div>
                          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                            <span className="text-sm sm:text-base font-black uppercase tracking-widest text-gray-400">Total Investment</span>
                            <span className="text-2xl sm:text-3xl font-display italic font-black text-green-600">{formatPrice(getDiscountedPrice(selectedServiceObj.priceCents))}</span>
                          </div>
                        </>
                      )}
                      {!appliedDiscount && (
                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                          <span className="text-sm sm:text-base font-black uppercase tracking-widest text-gray-400">Total Investment</span>
                          <span className="text-2xl sm:text-3xl font-display italic font-black text-[#F2529D]">{selectedServiceObj.priceLabel ?? formatPrice(selectedServiceObj.priceCents)}</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 pt-2 border-t border-gray-50">Payment is completed at the lounge after your service. No upfront charge.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
                  <div className="space-y-4 sm:space-y-6 group">
                    <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-3 sm:mr-4" />FULL NAME
                    </label>
                    <input
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="e.g. Seraphina Styles"
                      className="w-full bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-base sm:text-lg md:text-xl font-black text-gray-900 border-2 sm:border-4 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-lg group-hover:shadow-xl placeholder:text-gray-200"
                    />
                  </div>
                  <div className="space-y-4 sm:space-y-6 group">
                    <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                      <MailIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-3 sm:mr-4" />EMAIL ADDRESS
                    </label>
                    <input
                      required
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="glow@sibsstyle.com"
                      className="w-full bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-base sm:text-lg md:text-xl font-black text-gray-900 border-2 sm:border-4 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-lg group-hover:shadow-xl placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
                  <div className="space-y-4 sm:space-y-6 group">
                    <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-3 sm:mr-4" />PHONE NUMBER
                    </label>
                    <input
                      required
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+971 50 000 0000"
                      className="w-full bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-base sm:text-lg md:text-xl font-black text-gray-900 border-2 sm:border-4 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-lg group-hover:shadow-xl placeholder:text-gray-200"
                    />
                  </div>
                  <div className="space-y-4 sm:space-y-6 group">
                    <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-3 sm:mr-4" />LOUNGE LOCATION
                    </label>
                    <div className="relative">
                      <select
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        className="w-full bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-base sm:text-lg md:text-xl font-black text-gray-900 border-2 sm:border-4 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-lg appearance-none cursor-pointer group-hover:shadow-xl"
                      >
                        <option>Dubai, Sibs Main Lounge</option>
                        <option>Deira Wellness Center</option>
                        <option>Marina Studio Lounge</option>
                      </select>
                      <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#BF9C34]">
                        <ChevronRight className="rotate-90 w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6 group">
                  <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-3 sm:mr-4" />ADDITIONAL NOTES
                  </label>
                  <textarea
                    rows={5}
                    name="info"
                    value={formData.info}
                    onChange={handleFormChange}
                    placeholder="Describe your skin goals, allergies, or any ritual preferences..."
                    className="w-full bg-white px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-base sm:text-lg md:text-xl font-medium text-gray-900 border-2 sm:border-4 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-lg resize-none group-hover:shadow-xl leading-relaxed placeholder:text-gray-200"
                  />
                </div>

                {/* Confirm button */}
                <div className="pt-8 sm:pt-12 md:pt-16 flex flex-col items-center gap-4 sm:gap-6 md:gap-8 bg-white/40 p-4 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border-4 md:border-8 border-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#F2529D]/5 to-transparent" />
                  <div className="flex flex-col items-center space-y-2 relative z-10">
                    <span className="text-[0.55rem] sm:text-[0.65rem] font-black text-gray-400 tracking-[0.5em] sm:tracking-[0.8em] uppercase">RITUAL INVESTMENT</span>
                    <p className="text-[#333] font-black text-lg sm:text-xl md:text-2xl italic tracking-tighter text-center px-4">
                      {selectedServiceObj ? selectedServiceObj.name : 'Awaiting Selection'}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 pt-2 sm:pt-4">
                      {appliedDiscount && selectedServiceObj && (
                        <>
                          <span className="text-xl sm:text-3xl font-display italic text-gray-400 font-black line-through opacity-60">
                            {selectedServiceObj.priceLabel ?? formatPrice(selectedServiceObj.priceCents)}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            {appliedDiscount.discountText}
                          </span>
                        </>
                      )}
                      <span className={`text-4xl sm:text-5xl md:text-6xl font-display italic font-black drop-shadow-lg leading-none ${appliedDiscount ? 'text-green-600' : 'text-[#F2529D]'}`}>
                        {selectedServiceObj ? (
                          appliedDiscount
                            ? formatPrice(getDiscountedPrice(selectedServiceObj.priceCents))
                            : (selectedServiceObj.priceLabel ?? formatPrice(selectedServiceObj.priceCents))
                        ) : '0 AED'}
                      </span>
                    </div>
                  </div>
                  <div className="relative z-10 w-full flex justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black hover:bg-[#F2529D] disabled:bg-gray-400 text-white px-6 sm:px-10 md:px-16 py-4 sm:py-5 md:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-xs sm:text-sm md:text-base font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] shadow-xl flex items-center gap-3 sm:gap-4 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed group border-2 border-black hover:border-[#F2529D]"
                    >
                      {isSubmitting ? 'INITIATING...' : 'CONFIRM RITUAL'} <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-2" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* What to Expect Section */}
          <section className="reveal-on-scroll py-12 md:py-20">
            <div className="text-center mb-12 md:mb-16">
              <div className="flex items-center justify-center gap-4 mb-4">
                <span className="h-px w-12 bg-[#BF9C34]" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Before You Arrive</span>
                <span className="h-px w-12 bg-[#BF9C34]" />
              </div>
              <h2 className="text-3xl md:text-6xl font-display italic font-black text-gray-900">What to Expect</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg border border-gray-50 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-[#F2529D]/10 flex items-center justify-center mb-6 group-hover:bg-[#F2529D] transition-colors duration-500">
                  <Clock className="w-7 h-7 text-[#F2529D] group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-display italic font-black text-gray-900 mb-3">Arrival</h3>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
                  Please arrive 10 minutes before your scheduled time. This allows our team to prepare your personalized ritual and offer you a welcome beverage.
                </p>
              </div>
              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg border border-gray-50 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-[#BF9C34]/10 flex items-center justify-center mb-6 group-hover:bg-[#BF9C34] transition-colors duration-500">
                  <Leaf className="w-7 h-7 text-[#BF9C34] group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-display italic font-black text-gray-900 mb-3">During</h3>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
                  Your ritual begins with a brief consultation. Our specialists use botanical formulations and precise techniques tailored to your skin and hair goals.
                </p>
              </div>
              <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg border border-gray-50 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-[#F2529D]/10 flex items-center justify-center mb-6 group-hover:bg-[#F2529D] transition-colors duration-500">
                  <ShieldCheck className="w-7 h-7 text-[#F2529D] group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-display italic font-black text-gray-900 mb-3">Aftercare</h3>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium">
                  Post ritual, you receive personalized aftercare guidance. Cancellation is free with 24 hours notice. Payment is settled at the lounge.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Sticky Booking Summary Bar */}
      {selectedService && !bookingSuccess && (
        <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
          <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-3 sm:pb-4 pointer-events-auto">
            <div className="bg-[#0A0E1A] text-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4">
                {/* Left: Service info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F2529D]/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#F2529D]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.55rem] sm:text-[0.65rem] font-black uppercase tracking-[0.3em] text-[#BF9C34] truncate">
                      {selectedServiceObj ? selectedServiceObj.name : 'Service Selected'}
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 mt-0.5">
                      <span className="text-xs sm:text-sm font-black text-white">
                        {selectedTime ? selectedTime : 'Pick a time'}
                      </span>
                      <span className="text-white/30 hidden sm:inline">|</span>
                      <span className="text-xs sm:text-sm font-medium text-white/60 hidden sm:inline">
                        {formatDate(formatDateForApi(selectedDate))}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Right: Price + CTA */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[0.55rem] font-black uppercase tracking-[0.3em] text-white/40">Total</p>
                    <p className={`text-lg sm:text-xl font-display italic font-black ${appliedDiscount ? 'text-green-400' : 'text-[#F2529D]'}`}>
                      {selectedServiceObj ? (
                        appliedDiscount
                          ? formatPrice(getDiscountedPrice(selectedServiceObj.priceCents))
                          : (selectedServiceObj.priceLabel ?? formatPrice(selectedServiceObj.priceCents))
                      ) : '0 AED'}
                    </p>
                  </div>
                  <button
                    onClick={() => scrollToStep(detailsRef)}
                    className="bg-[#F2529D] hover:bg-white hover:text-black text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    {selectedTime ? 'Confirm' : 'Continue'}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default BookingPage;
