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
  // Tue-Thu close at 9 PM (21:00), Fri-Sun close at 10 PM (22:00)
  const isWeekend = weekdayPart === 'fri' || weekdayPart === 'sat' || weekdayPart === 'sun';
  const closeAt = isWeekend ? 22 * 60 : 21 * 60;

  const formatTime = (mins: number): string => {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
  };

  // Monday is closed
  if (weekdayPart === 'mon') {
    return { isOpen: false, label: 'Closed Today', subLabel: 'Opens Tuesday at 10:00 AM' };
  }

  const isOpen = totalMinutes >= openAt && totalMinutes < closeAt;

  if (isOpen) {
    return { isOpen: true, label: 'Open Now', subLabel: `Until ${formatTime(closeAt)}` };
  }

  // Before opening
  if (totalMinutes < openAt) {
    return { isOpen: false, label: 'Closed', subLabel: `Opens at 10:00 AM` };
  }

  // After closing
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
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(242,82,157,0.12),transparent),radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(191,156,52,0.08),transparent)]" />

      {/* Top gradient line */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-[#F2529D]/40 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">

        {/* ====== TOP: Brand + Status ====== */}
        <div className="py-12 md:py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full border-2 border-[#F2529D]/20 bg-white/5 p-1.5 shadow-[0_4px_30px_-8px_rgba(242,82,157,0.3)]">
                <img src={logo} alt="Sibs Style logo" className="h-12 w-auto rounded-full sm:h-14" />
              </div>
              <div>
                <p className="text-lg font-display italic font-black text-[#F2529D] leading-none">Sibs Style</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/30 mt-1.5">Beauty Lounge L.L.C</p>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-sm">
              Elevating your natural beauty with premium services in the heart of Dubai.
            </p>
          </div>

          {/* Live status badge */}
          <div className="inline-flex items-center gap-3 self-start rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm px-5 py-3">
            <span className="relative flex h-2 w-2">
              {openStatus.isOpen && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${openStatus.isOpen ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </span>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/90 leading-none">
                {openStatus.label}
              </p>
              <p className="text-[10px] text-white/40 mt-1">{openStatus.subLabel}</p>
            </div>
            <div className="h-8 w-px bg-white/10 mx-1" />
            <div className="text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 leading-none">Dubai</p>
              <p className="text-sm font-black text-[#F5D37B] tabular-nums mt-1">{currentTime}</p>
            </div>
          </div>
        </div>

        {/* ====== MIDDLE: Links + Contact + Hours + Social ====== */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6 py-10 md:py-12 border-t border-white/5">

          {/* Explore links */}
          <div className="col-span-1 md:col-span-3 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34]">Explore</p>
            <ul className="space-y-0.5">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group flex items-center gap-1.5 py-1.5 text-sm text-white/50 hover:text-[#F2529D] transition-colors duration-300"
                  >
                    <ChevronRight size={11} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-[#F2529D]" />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-300">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1 md:col-span-4 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34]">Visit Us</p>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5 text-white/50">
                <MapPin size={14} className="text-[#F2529D]/60 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Al Hashar Building, Salah Al Din St<br />Office 301, Muteena, Deira, Dubai</span>
              </li>
              <li>
                <a href="tel:+971529063016" className="group flex items-center gap-2.5 text-white/50 hover:text-[#F2529D] transition-colors">
                  <Phone size={14} className="text-[#F2529D]/60 shrink-0" />
                  <span className="font-black tracking-wider">052 906 3016</span>
                </a>
              </li>
              <li>
                <a href="mailto:mcjalandoni@yahoo.com" className="group flex items-center gap-2.5 text-white/50 hover:text-[#F2529D] transition-colors">
                  <Mail size={14} className="text-[#F2529D]/60 shrink-0" />
                  <span className="text-xs">mcjalandoni@yahoo.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="col-span-2 md:col-span-3 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34]">Hours</p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center justify-between py-1">
                <span className="text-white/40">Monday</span>
                <span className="text-[#F2529D]/80 font-bold">Closed</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span className="text-white/40">Tue to Thu</span>
                <span className="text-white/70 font-semibold">10:00 to 21:00</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span className="text-white/40">Fri to Sun</span>
                <span className="text-white/70 font-semibold">10:00 to 22:00</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="col-span-2 md:col-span-2 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#BF9C34]">Follow</p>
            <div className="flex items-center gap-2">
              <a
                href="https://www.instagram.com/sibsstylebeauty/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#F2529D]/50 hover:bg-[#F2529D]/10 transition-all duration-300 hover:scale-105"
              >
                <InstagramIcon size={15} className="text-white/40 group-hover:text-[#F2529D] transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61584300861932"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#BF9C34]/50 hover:bg-[#BF9C34]/10 transition-all duration-300 hover:scale-105"
              >
                <FacebookIcon size={15} className="text-white/40 group-hover:text-[#BF9C34] transition-colors" />
              </a>
              <a
                href="https://wa.me/971529063016"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="group flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/[0.03] hover:border-[#25D366]/50 hover:bg-[#25D366]/10 transition-all duration-300 hover:scale-105"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-white/40 group-hover:text-[#25D366] transition-colors" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ====== INSTAGRAM STRIP ====== */}
        <div className="py-8 border-t border-white/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Recent Edits</p>
            <a
              href="https://www.instagram.com/sibsstylebeauty/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F2529D]/60 hover:text-[#F2529D] transition-colors flex items-center gap-1"
            >
              View All <ArrowRight size={10} />
            </a>
          </div>
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {instagramStrip.map((img, idx) => (
              <a
                key={idx}
                href="https://www.instagram.com/sibsstylebeauty/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-white/5"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <InstagramIcon size={12} className="text-white/80" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* ====== BOTTOM BAR ====== */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
            <span className="text-[#F2529D]/60">© 2025 Sibs Style Beauty Lounge</span>
            <span className="mx-2 text-white/10">/</span>
            <span>All Rights Reserved</span>
          </p>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
            <Link to="/contact" className="hover:text-[#F2529D] transition-colors">Contact</Link>
            <span className="text-white/10">/</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart size={9} className="text-[#F2529D]/50 fill-current" /> in Dubai
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
