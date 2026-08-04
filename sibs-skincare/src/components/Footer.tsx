import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail,
  ArrowRight, Heart, ChevronRight,
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
const getOpenStatus = (): { isOpen: boolean; label: string; subLabel: string } => {
  const now = new Date();
  const dubaiParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Dubai',
    weekday: 'short',
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  }).formatToParts(now);

  const weekdayPart = dubaiParts.find((p) => p.type === 'weekday')?.value.toLowerCase() || '';
  const hourPart = dubaiParts.find((p) => p.type === 'hour')?.value || '0';
  const minutePart = dubaiParts.find((p) => p.type === 'minute')?.value || '0';

  const dubaiHour = parseInt(hourPart, 10);
  const dubaiMinute = parseInt(minutePart, 10);
  const totalMinutes = dubaiHour * 60 + dubaiMinute;

  const openAt = 10 * 60; // 10 AM
  const isWeekend = weekdayPart === 'fri' || weekdayPart === 'sat' || weekdayPart === 'sun';
  const closeAt = isWeekend ? 22 * 60 : 21 * 60;

  const formatTime = (mins: number): string => {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  };

  if (weekdayPart === 'mon') {
    return { isOpen: false, label: 'Closed Today', subLabel: 'Opens Tuesday at 10:00 AM' };
  }

  const isOpen = totalMinutes >= openAt && totalMinutes < closeAt;

  if (isOpen) {
    return { isOpen: true, label: 'Open Now', subLabel: `Until ${formatTime(closeAt)}` };
  }

  if (totalMinutes < openAt) {
    return { isOpen: false, label: 'Closed', subLabel: 'Opens at 10:00 AM' };
  }

  return { isOpen: false, label: 'Closed', subLabel: 'Opens tomorrow at 10:00 AM' };
};

export default function Footer() {
  const [currentTime, setCurrentTime] = useState('');
  const [openStatus, setOpenStatus] = useState<{ isOpen: boolean; label: string; subLabel: string }>({
    isOpen: false, label: '', subLabel: '',
  });

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

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Treatments', path: '/booking' },
    { name: 'Offers', path: '/offers' },
    { name: 'Chronicles', path: '/testimonials' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const instagramStrip = [
    { src: nailsImage, alt: 'Nail care' },
    { src: sibshallImage, alt: 'Salon interior' },
    { src: herbalImage, alt: 'Herbal essence' },
    { src: goldImage, alt: 'Gold collection' },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#05070D] text-white">
      {/* ====== OVERSIZED BRAND STATEMENT (top) ====== */}
      {/* This is the "magazine closing page" feel — huge typography as art */}
      <div className="relative border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 md:px-10 pt-12 md:pt-20 pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF9C34] mb-3">
                Sibs Style Beauty Lounge
              </p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display italic font-black leading-[0.9] tracking-tight">
                Where beauty<br />
                meets <span className="text-[#F2529D]">ritual</span>
              </h2>
            </div>

            {/* Live status — compact and integrated */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  {openStatus.isOpen && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${openStatus.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-white/90 leading-none">
                    {openStatus.label}
                  </p>
                  <p className="text-[10px] text-white/35 mt-1">{openStatus.subLabel}</p>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 leading-none">Dubai</p>
                <p className="text-sm font-black text-[#F5D37B] tabular-nums mt-1">{currentTime}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====== MAIN CONTENT GRID ====== */}
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-10 md:py-14">

        {/* Row 1: Logo + tagline | Navigation links */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-6 mb-10 md:mb-14">
          {/* Brand block */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-[#F2529D]/15 bg-white/[0.02] p-1">
                <img src={logo} alt="Sibs Style logo" className="h-10 w-auto rounded-full" />
              </div>
              <div>
                <p className="text-sm font-display italic font-black text-[#F2529D] leading-none">Sibs Style</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/25 mt-1">Beauty Lounge L.L.C</p>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              A curated beauty experience in the heart of Deira, Dubai. Premium services, botanical formulations, and artful care.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.instagram.com/sibsstylebeauty/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group flex items-center justify-center w-9 h-9 rounded-lg border border-white/8 bg-white/[0.02] hover:border-[#F2529D]/40 hover:bg-[#F2529D]/8 transition-all duration-300 hover:scale-105"
              >
                <InstagramIcon size={14} className="text-white/35 group-hover:text-[#F2529D] transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61584300861932"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group flex items-center justify-center w-9 h-9 rounded-lg border border-white/8 bg-white/[0.02] hover:border-[#BF9C34]/40 hover:bg-[#BF9C34]/8 transition-all duration-300 hover:scale-105"
              >
                <FacebookIcon size={14} className="text-white/35 group-hover:text-[#BF9C34] transition-colors" />
              </a>
              <a
                href="https://wa.me/971529063016"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="group flex items-center justify-center w-9 h-9 rounded-lg border border-white/8 bg-white/[0.02] hover:border-[#25D366]/40 hover:bg-[#25D366]/8 transition-all duration-300 hover:scale-105"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-white/35 group-hover:text-[#25D366] transition-colors" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation — split into two columns for visual rhythm */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#BF9C34]/60">Navigate</p>
            <ul className="space-y-0">
              {navLinks.slice(0, 3).map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1.5 py-1.5 text-sm text-white/45 hover:text-[#F2529D] transition-colors duration-300"
                  >
                    <ChevronRight size={10} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#F2529D]" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-transparent">.</p>
            <ul className="space-y-0">
              {navLinks.slice(3).map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1.5 py-1.5 text-sm text-white/45 hover:text-[#F2529D] transition-colors duration-300"
                  >
                    <ChevronRight size={10} className="opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#F2529D]" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact compact */}
          <div className="md:col-span-2 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#BF9C34]/60">Reach Us</p>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="tel:+971529063016" className="group flex items-center gap-2 text-white/45 hover:text-[#F2529D] transition-colors">
                  <Phone size={12} className="text-[#F2529D]/50 shrink-0" />
                  <span className="font-black tracking-wider text-[11px]">052 906 3016</span>
                </a>
              </li>
              <li>
                <a href="mailto:mcjalandoni@yahoo.com" className="group flex items-center gap-2 text-white/45 hover:text-[#F2529D] transition-colors">
                  <Mail size={12} className="text-[#F2529D]/50 shrink-0" />
                  <span className="text-[10px]">Email us</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/35">
                <MapPin size={12} className="text-[#F2529D]/50 shrink-0 mt-0.5" />
                <span className="text-[10px] leading-relaxed">Deira, Dubai</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Row 2: Instagram strip with integrated hours */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 mb-8 md:mb-10">
          {/* Hours — compact inline */}
          <div className="md:col-span-4 flex flex-col justify-center">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#BF9C34]/60 mb-3">Hours</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/35">Mon</span>
                <span className="text-[#F2529D]/70 font-bold text-[10px] uppercase tracking-wider">Closed</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/35">Tue to Thu</span>
                <span className="text-white/55 font-semibold text-[10px]">10:00 to 21:00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/35">Fri to Sun</span>
                <span className="text-white/55 font-semibold text-[10px]">10:00 to 22:00</span>
              </div>
            </div>
          </div>

          {/* Instagram strip — visual interest */}
          <div className="md:col-span-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#BF9C34]/60">Recent Edits</p>
              <a
                href="https://www.instagram.com/sibsstylebeauty/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F2529D]/50 hover:text-[#F2529D] transition-colors flex items-center gap-1"
              >
                View All <ArrowRight size={9} />
              </a>
            </div>
            <div className="grid grid-cols-4 gap-1.5 md:gap-2">
              {instagramStrip.map((img, idx) => (
                <a
                  key={idx}
                  href="https://www.instagram.com/sibsstylebeauty/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-lg overflow-hidden bg-white/[0.02] border border-white/5"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Solid overlay on hover (no gradient) */}
                  <div className="absolute inset-0 bg-[#05070D]/0 group-hover:bg-[#05070D]/70 transition-colors duration-300 flex items-center justify-center">
                    <InstagramIcon size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ====== CTA STRIP ====== */}
        <div className="border-t border-white/5 pt-6 md:pt-8 pb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40 font-medium">
              Ready to begin your ritual?
            </p>
            <Link
              to="/booking"
              className="group inline-flex items-center gap-2 rounded-full bg-[#F2529D] text-white px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95"
            >
              Book Now
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ====== BOTTOM BAR ====== */}
        <div className="border-t border-white/5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
            © 2025 Sibs Style Beauty Lounge
          </p>
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
            <Link to="/contact" className="hover:text-[#F2529D] transition-colors">Contact</Link>
            <span className="text-white/8">/</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart size={8} className="text-[#F2529D]/40 fill-current" /> in Dubai
            </span>
          </div>
        </div>
      </div>

      {/* ====== OVERSIZED LOGO WATERMARK (bottom) ====== */}
      {/* This creates a visual "anchor" at the bottom — like a magazine endmark */}
      <div className="relative overflow-hidden border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-6 md:py-8 flex items-center justify-center">
          <p className="text-[10px] sm:text-xs md:text-sm font-display italic font-black text-white/[0.04] tracking-[0.15em] select-none whitespace-nowrap">
            SIBS STYLE — BEAUTY LOUNGE — DUBAI — EST. 2025 — SIBS STYLE — BEAUTY LOUNGE — DUBAI
          </p>
        </div>
      </div>
    </footer>
  );
}
