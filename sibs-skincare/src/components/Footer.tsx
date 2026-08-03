import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock,
  ArrowRight, Send, Heart, Sparkles,
  ShieldCheck, Leaf, Award, ChevronRight,
} from 'lucide-react';
import logo from '../assets/Sibs Style BL logo.png';
import nailsImage from '../assets/Nails.jpeg';
import sibshallImage from '../assets/Sibshall.jpeg';
import herbalImage from '../assets/HerbalEssence.jpeg';
import goldImage from '../assets/Goldproducts.jpeg';

// Inline Instagram and Facebook marks (not in this lucide version).
const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const FacebookIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

// Calculate if the salon is currently open based on Dubai time.
const getOpenStatus = (): { isOpen: boolean; closeTime: string } => {
  const now = new Date();
  const dubaiHour = parseInt(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai', hour: '2-digit', hour12: false }));
  const dubaiMinute = parseInt(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai', minute: '2-digit' }));
  const dubaiDay = now.toLocaleString('en-US', { timeZone: 'Asia/Dubai', weekday: 'short' }).toLowerCase();

  const totalMinutes = dubaiHour * 60 + dubaiMinute;
  const openAt = 10 * 60; // 10 AM
  const closeWeekday = 21 * 60; // 9 PM (Tue-Thu)
  const closeWeekend = 22 * 60; // 10 PM (Fri-Sun)

  // Monday is closed
  if (dubaiDay === 'mon') return { isOpen: false, closeTime: 'Tuesday 10 AM' };

  const closeTime = (dubaiDay === 'fri' || dubaiDay === 'sat' || dubaiDay === 'sun') ? closeWeekend : closeWeekday;
  const isOpen = totalMinutes >= openAt && totalMinutes < closeTime;

  const closeHour = Math.floor(closeTime / 60);
  const closePeriod = closeHour >= 12 ? 'PM' : 'AM';
  const closeDisplay = closeHour > 12 ? closeHour - 12 : closeHour;

  return { isOpen, closeTime: `${closeDisplay} ${closePeriod}` };
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [openStatus, setOpenStatus] = useState<{ isOpen: boolean; closeTime: string }>({ isOpen: false, closeTime: '' });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const dubaiTime = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(dubaiTime);
      setOpenStatus(getOpenStatus());
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Treatments', path: '/booking' },
    { name: 'Offers', path: '/offers' },
    { name: 'Chronicles', path: '/testimonials' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: 'Secure Booking' },
    { icon: Leaf, label: 'Vegan Products' },
    { icon: Award, label: 'Certified Stylists' },
  ];

  const instagramStrip = [
    { src: nailsImage, alt: 'Nail care' },
    { src: sibshallImage, alt: 'Salon interior' },
    { src: herbalImage, alt: 'Herbal essence' },
    { src: goldImage, alt: 'Gold collection' },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#05070D] text-white">
      {/* ====== AMBIENT BACKGROUND LAYERS ====== */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(242,82,157,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(191,156,52,0.1),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(124,97,255,0.06),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

      {/* Top gradient accent */}
      <div className="relative h-1 bg-gradient-to-r from-[#F2529D] via-[#BF9C34] to-[#F2529D]" />
      {/* Shimmer on the accent line */}
      <div className="relative h-1 -mt-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_3s_infinite]" style={{ animation: 'shimmer 3s infinite' }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        {/* ====== HERO FOOTER SECTION: Brand + Newsletter in glass card ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 py-16 md:py-20 lg:py-24">
          {/* Brand column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#F2529D]/30 rounded-full blur-xl" />
                <div className="relative rounded-full border-2 border-[#F2529D]/30 bg-white/5 p-2 shadow-[0_8px_40px_-8px_rgba(242,82,157,0.5)]">
                  <img src={logo} alt="Sibs Style logo" className="h-14 w-auto rounded-full sm:h-16 md:h-20" />
                </div>
              </div>
              <div>
                <p className="text-base sm:text-lg font-black uppercase tracking-[0.3em] text-[#F2529D]">Sibs Style</p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/40 mt-1">Beauty Lounge L.L.C</p>
              </div>
            </div>

            <p className="text-sm sm:text-base leading-relaxed text-white/65 font-medium max-w-md">
              Elevating your natural beauty with premium services in a luxurious, relaxing environment in the heart of Dubai.
            </p>

            {/* Live open/closed status */}
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-2.5">
              <span className="relative flex h-2.5 w-2.5">
                {openStatus.isOpen && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${openStatus.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
              </span>
              <span className="text-xs font-black uppercase tracking-[0.25em] text-white/80">
                {openStatus.isOpen ? `Open Now` : `Closed`}
              </span>
              <span className="text-xs text-white/40">
                {openStatus.isOpen ? `until ${openStatus.closeTime}` : `opens ${openStatus.closeTime}`}
              </span>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {trustBadges.map((badge) => (
                <div key={badge.label} className="flex items-center gap-2 text-white/50">
                  <badge.icon size={14} className="text-[#BF9C34]" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter glass card */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 md:p-10 overflow-hidden h-full">
              {/* Card ambient glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2529D]/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#BF9C34]/8 rounded-full blur-[60px] pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF9C34] mb-3 flex items-center gap-2">
                    <Sparkles size={12} /> Stay Connected
                  </p>
                  <h3 className="text-3xl sm:text-4xl md:text-5xl font-display italic font-black leading-[1.05]">
                    Join the<br /><span className="text-[#F2529D]">Ritual Circle</span>
                  </h3>
                  <p className="text-sm text-white/55 mt-4 leading-relaxed max-w-md">
                    Subscribe for exclusive offers, early access to new treatments, and beauty rituals delivered to your inbox.
                  </p>
                </div>

                {subscribed ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4 animate-[fadeIn_0.4s_ease]">
                    <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
                      <ArrowRight size={16} className="text-emerald-950" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-emerald-300">Welcome to the circle</p>
                      <p className="text-xs text-emerald-400/70">Check your inbox for a confirmation.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-white/5 border-2 border-white/10 rounded-full px-5 py-3.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#F2529D] focus:bg-white/10 transition-all"
                    />
                    <button
                      type="submit"
                      className="group relative overflow-hidden rounded-full bg-[#F2529D] hover:bg-white hover:text-black text-white px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer"
                    >
                      <span className="relative z-10 flex items-center gap-2 justify-center">
                        Subscribe
                        <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                      {/* Shimmer sweep */}
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                  </form>
                )}
                <p className="text-[10px] text-white/30 flex items-center gap-1.5">
                  <ShieldCheck size={11} /> No spam. Just beauty. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ====== DIVIDER ====== */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* ====== LINKS + INFO SECTION ====== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 py-12 md:py-16">
          {/* Explore */}
          <div className="space-y-5 col-span-2 md:col-span-1">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34] flex items-center gap-2">
                <span className="w-4 h-px bg-[#BF9C34]" /> Explore
              </h4>
            </div>
            <ul className="space-y-1 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-2 py-1.5 text-white/60 hover:text-[#F2529D] transition-colors duration-300"
                  >
                    <ChevronRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#F2529D]" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit Us */}
          <div className="space-y-5 col-span-2 md:col-span-1">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34] flex items-center gap-2">
                <span className="w-4 h-px bg-[#BF9C34]" /> Visit Us
              </h4>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-white/60">
                <div className="w-7 h-7 rounded-lg bg-[#F2529D]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} className="text-[#F2529D]" />
                </div>
                <div className="leading-relaxed">
                  <p>Al Hashar Building, Salah Al Din St</p>
                  <p>Office 301, Muteena, Deira, Dubai</p>
                </div>
              </li>
              <li>
                <a href="tel:+971529063016" className="group flex items-center gap-3 text-white/60 hover:text-[#F2529D] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#F2529D]/10 flex items-center justify-center shrink-0 group-hover:bg-[#F2529D] transition-colors">
                    <Phone size={13} className="text-[#F2529D] group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-black tracking-wider">052 906 3016</span>
                </a>
              </li>
              <li>
                <a href="mailto:mcjalandoni@yahoo.com" className="group flex items-center gap-3 text-white/60 hover:text-[#F2529D] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-[#F2529D]/10 flex items-center justify-center shrink-0 group-hover:bg-[#F2529D] transition-colors">
                    <Mail size={13} className="text-[#F2529D] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs">mcjalandoni@yahoo.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-5 col-span-2 md:col-span-1">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34] flex items-center gap-2">
                <span className="w-4 h-px bg-[#BF9C34]" /> Opening Hours
              </h4>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/50">Monday</span>
                <span className="text-[#F2529D] font-black text-xs uppercase tracking-wider">Closed</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/50">Tue to Thu</span>
                <span className="text-white/80 font-semibold text-xs">10:00 to 21:00</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-white/50">Fri to Sun</span>
                <span className="text-white/80 font-semibold text-xs">10:00 to 22:00</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-2">
              <Clock size={14} className="text-[#BF9C34]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Dubai Time</span>
              <span className="text-sm font-black text-[#F5D37B] tabular-nums ml-auto">{currentTime}</span>
            </div>
          </div>

          {/* Follow + Instagram strip */}
          <div className="space-y-5 col-span-2 md:col-span-1">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34] flex items-center gap-2">
                <span className="w-4 h-px bg-[#BF9C34]" /> Follow
              </h4>
            </div>
            <div className="flex items-center gap-2.5">
              <a
                href="https://www.instagram.com/sibsstylebeauty/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group flex items-center justify-center w-11 h-11 rounded-2xl border border-white/15 bg-white/5 hover:border-[#F2529D] hover:bg-[#F2529D]/15 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              >
                <InstagramIcon size={18} className="text-white/60 group-hover:text-[#F2529D] transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61584300861932"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group flex items-center justify-center w-11 h-11 rounded-2xl border border-white/15 bg-white/5 hover:border-[#BF9C34] hover:bg-[#BF9C34]/15 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              >
                <FacebookIcon size={18} className="text-white/60 group-hover:text-[#BF9C34] transition-colors" />
              </a>
              <a
                href="https://wa.me/971529063016"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="group flex items-center justify-center w-11 h-11 rounded-2xl border border-white/15 bg-white/5 hover:border-[#25D366] hover:bg-[#25D366]/15 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white/60 group-hover:text-[#25D366] transition-colors" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>

            {/* Instagram-style image strip */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-3">Recent Edits</p>
              <div className="grid grid-cols-4 gap-1.5">
                {instagramStrip.map((img, idx) => (
                  <a
                    key={idx}
                    href="https://www.instagram.com/sibsstylebeauty/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-lg overflow-hidden bg-white/5"
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-[#F2529D]/0 group-hover:bg-[#F2529D]/40 transition-colors duration-300 flex items-center justify-center">
                      <InstagramIcon size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ====== BOOK NOW STRIP ====== */}
        <div className="border-t border-white/10 py-8 md:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34] mb-1">Ready When You Are</p>
              <p className="text-lg md:text-xl font-display italic font-black text-white">
                Book your <span className="text-[#F2529D]">ritual</span> today
              </p>
            </div>
            <Link
              to="/booking"
              className="group inline-flex items-center gap-3 rounded-full bg-white text-black px-8 py-4 text-xs font-black uppercase tracking-[0.25em] hover:bg-[#F2529D] hover:text-white transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              Reserve Now
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ====== BOTTOM BAR ====== */}
        <div className="border-t border-white/10 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/35">
            <span className="text-[#F2529D]">© 2025 Sibs Style Beauty Lounge.</span>
            <span className="ml-2 hidden sm:inline">All Rights Reserved.</span>
          </p>
          <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/35">
            <a href="#" className="hover:text-[#F2529D] transition-colors">Privacy</a>
            <span className="text-white/15">/</span>
            <a href="#" className="hover:text-[#F2529D] transition-colors">Terms</a>
            <span className="text-white/15">/</span>
            <Link to="/contact" className="hover:text-[#F2529D] transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] text-white/25 font-medium italic flex items-center gap-1.5">
            Crafted with <Heart size={10} className="text-[#F2529D] fill-current" /> in Dubai
          </p>
        </div>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </footer>
  );
}
