import { useEffect, useRef, useState } from 'react';
import {
  Mail, Phone, MapPin, Clock, MessageCircle, Send,
  Navigation, Sparkles, CheckCircle2, Globe, Zap,
} from 'lucide-react';
import Footer from './components/Footer';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import contactHeroImage from './assets/Sibshall2.jpeg';

gsap.registerPlugin(ScrollTrigger);

const ContactPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [formSent, setFormSent] = useState(false);

  // ======== Smooth scroll (Lenis) ========
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

  // ======== Entry + scroll animations (safe pattern) ========
  useEffect(() => {
    window.scrollTo(0, 0);

    // Safety net: force container visible after 2s so page is never stuck invisible.
    const safetyNet = window.setTimeout(() => {
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' });
      }
      gsap.set('.contact-eyebrow, .contact-title, .contact-sub, .contact-hero-img, .contact-hero-cta', {
        opacity: 1, y: 0, scale: 1, clearProps: 'all',
      });
    }, 2000);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' });
        gsap.set('.contact-eyebrow, .contact-title, .contact-sub, .contact-hero-img, .contact-hero-cta', {
          opacity: 1, y: 0, scale: 1, clearProps: 'all',
        });
      },
    });
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.inOut' })
      .fromTo('.contact-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .fromTo('.contact-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out' }, '-=0.5')
      .fromTo('.contact-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.8')
      .fromTo('.contact-hero-img', { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out' }, '-=1.2')
      .fromTo('.contact-hero-cta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');

    // Parallax hero image
    if (heroRef.current) {
      gsap.to('.contact-parallax', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    // Scroll reveals
    const createdTriggers: ScrollTrigger[] = [];
    const revealEls = gsap.utils.toArray<HTMLElement>('.contact-reveal');
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

    return () => {
      window.clearTimeout(safetyNet);
      tl.kill();
      createdTriggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // ======== Handlers ========
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) return;
    // Build a WhatsApp deep link with the message pre-filled.
    const text = encodeURIComponent(`Hi Sibs Style, my name is ${formData.name}. ${formData.message}`);
    window.open(`https://wa.me/971529063016?text=${text}`, '_blank', 'noopener,noreferrer');
    setFormSent(true);
    setFormData({ name: '', message: '' });
    setTimeout(() => setFormSent(false), 5000);
  };

  const navigateToBooking = () => {
    const event = new CustomEvent('trigger-curtain', { detail: { path: '/booking' } });
    window.dispatchEvent(event);
  };

  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen font-body selection:bg-[#F2529D] selection:text-white overflow-x-hidden">
      {/* ==================== HERO ==================== */}
      <section ref={heroRef} className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Eyebrow */}
          <div className="contact-eyebrow flex items-center justify-center gap-4 mb-6 md:mb-8">
            <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Dubai Beauty Lounge</span>
            <span className="h-px w-12 md:w-16 bg-[#BF9C34]" />
          </div>

          {/* Title */}
          <h1 className="contact-title text-center text-4xl sm:text-6xl md:text-9xl font-display italic font-black text-[#F2529D] leading-none tracking-tighter mb-6 md:mb-8">
            Get in Touch
          </h1>

          {/* Subtitle */}
          <p className="contact-sub text-center text-gray-500 text-base md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed mb-12 md:mb-16">
            We would love to hear from you. Reach out for bookings, questions, or just to say hello.
          </p>

          {/* Split hero: image left, quick facts right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
            {/* Hero image with parallax */}
            <div className="lg:col-span-7 contact-hero-img relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[400px] md:min-h-[520px] group">
              <div className="contact-parallax absolute inset-0 scale-110">
                <img
                  src={contactHeroImage}
                  alt="Sibs Style Beauty Lounge interior"
                  className="w-full h-full object-cover brightness-75 transition-transform duration-[1.5s] group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Floating address card */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-[#F2529D]" />
                  <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-[#BF9C34]">Visit Us</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-display italic font-black mb-2 leading-tight drop-shadow-lg">
                  Sibs Style Beauty Lounge
                </h3>
                <p className="text-sm md:text-base text-white/80 max-w-md leading-relaxed mb-1">
                  Al Hashar Building, Salah Al Din St, Office 301
                </p>
                <p className="text-xs md:text-sm text-white/60">
                  Muteena, Deira, Dubai - Next to Crowne Plaza Hotel
                </p>
              </div>

              {/* Hover indicator */}
              <div className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-[#F2529D] group-hover:border-[#F2529D] transition-all duration-500">
                <Navigation className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Right: quick facts + CTA */}
            <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
              {/* Quick facts card */}
              <div className="contact-hero-cta bg-[#0A0E1A] text-white rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#F2529D]/20 rounded-full blur-[60px]" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#BF9C34]/20 rounded-full blur-[60px]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-5 md:mb-6">
                    <Zap className="w-4 h-4 text-[#F2529D]" />
                    <span className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-[#BF9C34]">Quick Facts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <p className="text-3xl md:text-4xl font-display italic font-black text-white leading-none flex items-center gap-1">
                        <Clock className="w-4 h-4 text-[#F2529D]" /> 10
                      </p>
                      <p className="text-[0.55rem] md:text-xs font-black uppercase tracking-[0.2em] text-white/50 mt-1 md:mt-2">Hour Response</p>
                    </div>
                    <div>
                      <p className="text-3xl md:text-4xl font-display italic font-black text-[#F2529D] leading-none flex items-center gap-1">
                        <Globe className="w-4 h-4" /> 2
                      </p>
                      <p className="text-[0.55rem] md:text-xs font-black uppercase tracking-[0.2em] text-white/50 mt-1 md:mt-2">Languages</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-display italic font-black text-white leading-none flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#BF9C34]" /> 7
                      </p>
                      <p className="text-[0.55rem] md:text-xs font-black uppercase tracking-[0.2em] text-white/50 mt-1 md:mt-2">Days a Week</p>
                    </div>
                    <div>
                      <p className="text-2xl md:text-3xl font-display italic font-black text-white leading-none flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-400" /> 100%
                      </p>
                      <p className="text-[0.55rem] md:text-xs font-black uppercase tracking-[0.2em] text-white/50 mt-1 md:mt-2">Care</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/971529063016"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-hero-cta group relative overflow-hidden rounded-[2rem] bg-[#25D366] p-6 md:p-8 text-left hover:scale-[1.02] transition-transform duration-500 shadow-2xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-white/70 mb-2">Fastest Response</p>
                    <p className="text-xl md:text-2xl font-display italic font-black text-white leading-tight">Chat on<br />WhatsApp</p>
                  </div>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 group-hover:bg-white group-hover:rotate-12 transition-all duration-500">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-[#25D366]" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CONTACT METHODS GRID ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="contact-reveal text-center mb-10 md:mb-16">
            <div className="flex items-center justify-center gap-4 mb-4 md:mb-6">
              <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Direct Lines</span>
              <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-7xl font-display italic font-black text-gray-900 leading-none tracking-tighter mb-3">
              Reach Us <span className="text-[#F2529D]">Directly</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 max-w-xl mx-auto font-medium">
              Choose the channel that suits you best. We respond to every message.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* WhatsApp */}
            <a
              href="https://wa.me/971529063016"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-reveal group bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.15)] hover:shadow-[0_40px_80px_-30px_rgba(37,211,102,0.3)] transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mb-5 group-hover:bg-[#25D366] transition-colors duration-500">
                <MessageCircle className="w-7 h-7 text-[#25D366] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display italic font-black text-gray-900 mb-2">WhatsApp</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium mb-4">
                The fastest way to reach us. Send a message and we reply within the hour.
              </p>
              <p className="text-sm font-black text-[#25D366] flex items-center gap-1">
                +971 52 906 3016
                <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </p>
            </a>

            {/* Phone */}
            <a
              href="tel:+971529063016"
              className="contact-reveal group bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.15)] hover:shadow-[0_40px_80px_-30px_rgba(242,82,157,0.3)] transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F2529D]/10 flex items-center justify-center mb-5 group-hover:bg-[#F2529D] transition-colors duration-500">
                <Phone className="w-7 h-7 text-[#F2529D] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display italic font-black text-gray-900 mb-2">Phone Call</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium mb-4">
                Prefer to talk? Call us directly during business hours for instant assistance.
              </p>
              <p className="text-sm font-black text-[#F2529D] flex items-center gap-1">
                052 906 3016
                <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </p>
            </a>

            {/* Email */}
            <a
              href="mailto:mcjalandoni@yahoo.com"
              className="contact-reveal group bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.15)] hover:shadow-[0_40px_80px_-30px_rgba(191,156,52,0.3)] transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#BF9C34]/10 flex items-center justify-center mb-5 group-hover:bg-[#BF9C34] transition-colors duration-500">
                <Mail className="w-7 h-7 text-[#BF9C34] group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-display italic font-black text-gray-900 mb-2">Email</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium mb-4">
                For detailed inquiries, partnerships, or feedback. We reply within 24 hours.
              </p>
              <p className="text-sm font-black text-[#BF9C34] flex items-center gap-1 break-all">
                mcjalandoni@yahoo.com
                <Send className="w-3 h-3 shrink-0 group-hover:translate-x-1 transition-transform" />
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== QUICK MESSAGE FORM + HOURS ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
          {/* Quick message form */}
          <div className="contact-reveal">
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <span className="h-px w-10 md:w-14 bg-[#F2529D]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#F2529D]">Quick Message</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display italic font-black text-gray-900 leading-none tracking-tighter mb-4">
              Send a <span className="text-[#F2529D]">Note</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 mb-8 md:mb-10 font-medium leading-relaxed">
              Type your message below and it will open WhatsApp with everything pre-filled. No account needed.
            </p>

            {formSent ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-[1.5rem] p-6 md:p-8 text-center">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-display italic font-black text-gray-900 mb-2">WhatsApp opened</h3>
                <p className="text-sm text-gray-500 font-medium">Your message is ready to send. Just hit send in WhatsApp.</p>
              </div>
            ) : (
              <form onSubmit={handleQuickSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-[#BF9C34]">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Seraphina Styles"
                    className="w-full bg-[#FAF9F6] border-2 border-gray-100 rounded-2xl px-5 py-4 text-base text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#F2529D] focus:bg-white transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] text-[#BF9C34]">Your Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="I would like to book a facial for this weekend..."
                    className="w-full bg-[#FAF9F6] border-2 border-gray-100 rounded-2xl px-5 py-4 text-base text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#F2529D] focus:bg-white transition-all resize-none leading-relaxed"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F2529D] to-[#BF9C34] transition-transform duration-500 group-hover:scale-105" />
                  <div className="relative flex items-center justify-center gap-3 py-4 text-white font-black italic tracking-[0.2em] uppercase text-xs md:text-sm transition-transform active:scale-95">
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    Send via WhatsApp
                  </div>
                </button>
              </form>
            )}
          </div>

          {/* Hours + location */}
          <div className="contact-reveal">
            <div className="flex items-center gap-4 mb-4 md:mb-6">
              <span className="h-px w-10 md:w-14 bg-[#BF9C34]" />
              <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.45em] text-[#BF9C34]">Visit Us</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display italic font-black text-gray-900 leading-none tracking-tighter mb-4">
              Hours and <span className="text-[#F2529D]">Location</span>
            </h2>
            <p className="text-sm md:text-base text-gray-500 mb-8 md:mb-10 font-medium leading-relaxed">
              Find us in the heart of Deira, Dubai. Walk-ins welcome, bookings preferred.
            </p>

            {/* Hours card */}
            <div className="bg-[#FAF9F6] rounded-[1.5rem] border border-gray-100 p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#F2529D]/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#F2529D]" />
                </div>
                <h3 className="text-lg md:text-xl font-display italic font-black text-gray-900">Opening Hours</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Monday</span>
                  <span className="text-sm font-black text-[#F2529D] uppercase tracking-wider">Closed</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Tuesday to Thursday</span>
                  <span className="text-sm font-black text-gray-900">10:00 AM to 9:00 PM</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-500">Friday to Sunday</span>
                  <span className="text-sm font-black text-gray-900">10:00 AM to 10:00 PM</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-500">Public Holidays</span>
                  <span className="text-sm font-black text-[#BF9C34]">By Appointment</span>
                </div>
              </div>
            </div>

            {/* Address card */}
            <div className="bg-[#0A0E1A] text-white rounded-[1.5rem] p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F2529D]/15 rounded-full blur-[60px]" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F2529D]/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#F2529D]" />
                  </div>
                  <h3 className="text-lg md:text-xl font-display italic font-black">Our Address</h3>
                </div>
                <p className="text-sm md:text-base text-white/80 leading-relaxed mb-2">
                  Al Hashar Building, Salah Al Din St
                </p>
                <p className="text-sm text-white/60 mb-5">
                  Office 301, Muteena, Deira, Dubai, UAE
                </p>
                <a
                  href="https://share.google/lWLJiTBONnJlR29z7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F2529D] hover:bg-white hover:text-black text-white text-[0.6rem] md:text-xs font-black uppercase tracking-[0.3em] transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== MAP EMBED ==================== */}
      <section className="px-4 md:px-8 pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="contact-reveal relative rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
            <iframe
              title="Sibs Style Beauty Lounge location"
              src="https://www.google.com/maps?q=Salah+Al+Din+St+Deira+Dubai&output=embed"
              className="w-full h-[350px] md:h-[450px] grayscale-[0.3] contrast-110"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg border border-gray-100 pointer-events-none">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F2529D]" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-700">Sibs Style Beauty Lounge</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center contact-reveal">
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
                Book your <span className="text-[#F2529D]">ritual</span>
              </h2>
              <p className="text-sm md:text-base text-white/60 max-w-lg mx-auto mb-6 md:mb-8 font-medium">
                Skip the wait and reserve your appointment online in under two minutes.
              </p>
              <button
                onClick={navigateToBooking}
                className="inline-flex items-center gap-3 px-8 md:px-12 py-4 md:py-5 rounded-full bg-[#F2529D] hover:bg-white hover:text-black text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl group"
              >
                Book Your Ritual
                <Send className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
