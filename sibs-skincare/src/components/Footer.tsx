import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, Clock,
  ArrowRight, Send, Heart, Sparkles,
} from 'lucide-react';
import logo from '../assets/Sibs Style BL logo.png';

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

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Live Dubai time for the footer clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dubaiTime = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dubai',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setCurrentTime(dubaiTime);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Treatments', path: '/booking' },
    { name: 'Offers', path: '/offers' },
    { name: 'Chronicles', path: '/testimonials' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#05070D] text-white">
      {/* Ambient background layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,82,157,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(191,156,52,0.12),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F2529D]/60 to-transparent" />
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 bg-[#F2529D]/8 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 w-96 h-96 bg-[#BF9C34]/8 rounded-full blur-[120px]" />

      {/* Top accent bar */}
      <div className="relative h-1 bg-gradient-to-r from-[#F2529D] via-[#BF9C34] to-[#F2529D]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 md:px-10">
        {/* ====== TOP SECTION: Brand + Newsletter ====== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 py-16 md:py-24 border-b border-white/10">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full border-2 border-[#F2529D]/30 bg-white/5 p-2 shadow-[0_8px_30px_-8px_rgba(242,82,157,0.4)]">
                <img src={logo} alt="Sibs Style logo" className="h-14 w-auto rounded-full sm:h-16 md:h-20" />
              </div>
              <div>
                <p className="text-base sm:text-lg font-black uppercase tracking-[0.3em] text-[#F2529D]">Sibs Style</p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/40 mt-1">Beauty Lounge L.L.C</p>
              </div>
            </div>
            <p className="text-sm sm:text-base leading-relaxed text-white/70 font-medium max-w-md">
              Elevating your natural beauty with premium services in a luxurious, relaxing environment in the heart of Dubai.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F2529D]/20 bg-[#F2529D]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFB3D0]">
                <Sparkles size={10} /> Luxury Rituals
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BF9C34]/20 bg-[#BF9C34]/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#F5D37B]">
                <Heart size={10} /> Curated Care
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                Dubai Based
              </span>
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:pl-10 lg:border-l lg:border-white/10">
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF9C34] mb-2">Stay Connected</p>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-display italic font-black leading-tight">
                  Join the <span className="text-[#F2529D]">Ritual</span>
                </h3>
                <p className="text-sm text-white/60 mt-3 leading-relaxed max-w-sm">
                  Subscribe for exclusive offers, new treatments, and beauty tips delivered to your inbox.
                </p>
              </div>
              {subscribed ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-5 py-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
                    <ArrowRight size={16} className="text-emerald-950" />
                  </div>
                  <p className="text-sm font-black text-emerald-300">You are on the list. Welcome to the lounge.</p>
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
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#F2529D] hover:bg-white hover:text-black text-white px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    Subscribe
                    <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
              <p className="text-[10px] text-white/30">No spam. Just beauty. Unsubscribe anytime.</p>
            </div>
          </div>
        </div>

        {/* ====== MIDDLE SECTION: Links + Contact + Hours ====== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 py-12 md:py-16">
          {/* Quick Links */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Explore</h4>
              <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-[#F2529D]/60 to-transparent" />
            </div>
            <ul className="space-y-2.5 text-sm font-medium">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="group inline-flex items-center gap-2 text-white/70 hover:text-[#F2529D] transition-colors duration-300"
                  >
                    <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Visit Us</h4>
              <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-[#BF9C34]/60 to-transparent" />
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-white/70">
                <MapPin size={16} className="text-[#F2529D] shrink-0 mt-0.5" />
                <div>
                  <p>Al Hashar Building, Salah Al Din St</p>
                  <p>Office 301, Muteena, Deira, Dubai</p>
                </div>
              </li>
              <li>
                <a href="tel:+971529063016" className="flex items-center gap-3 text-white/70 hover:text-[#F2529D] transition-colors group">
                  <Phone size={16} className="text-[#F2529D] shrink-0" />
                  <span className="font-black tracking-wider group-hover:tracking-widest transition-all">052 906 3016</span>
                </a>
              </li>
              <li>
                <a href="mailto:mcjalandoni@yahoo.com" className="flex items-center gap-3 text-white/70 hover:text-[#F2529D] transition-colors">
                  <Mail size={16} className="text-[#F2529D] shrink-0" />
                  <span>mcjalandoni@yahoo.com</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Opening Hours</h4>
              <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-[#F2529D]/60 to-transparent" />
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between text-white/70">
                <span>Monday</span>
                <span className="text-[#F2529D] font-black text-xs uppercase">Closed</span>
              </li>
              <li className="flex items-center justify-between text-white/70">
                <span>Tue to Thu</span>
                <span className="font-semibold">10 AM to 9 PM</span>
              </li>
              <li className="flex items-center justify-between text-white/70">
                <span>Fri to Sun</span>
                <span className="font-semibold">10 AM to 10 PM</span>
              </li>
            </ul>
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <Clock size={14} className="text-[#BF9C34]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Dubai Time</span>
              <span className="text-xs font-black text-[#F5D37B] tabular-nums ml-auto">{currentTime}</span>
            </div>
          </div>

          {/* Follow */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Follow</h4>
              <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-[#BF9C34]/60 to-transparent" />
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              Follow our visual journal for new edits, offers, and behind-the-scenes moments.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/sibsstylebeauty/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="group flex items-center justify-center w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:border-[#F2529D] hover:bg-[#F2529D]/15 transition-all duration-300 hover:scale-110"
              >
                <InstagramIcon size={18} className="text-white/70 group-hover:text-[#F2529D] transition-colors" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61584300861932"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="group flex items-center justify-center w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:border-[#BF9C34] hover:bg-[#BF9C34]/15 transition-all duration-300 hover:scale-110"
              >
                <FacebookIcon size={18} className="text-white/70 group-hover:text-[#BF9C34] transition-colors" />
              </a>
              <a
                href="https://wa.me/971529063016"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="group flex items-center justify-center w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:border-[#25D366] hover:bg-[#25D366]/15 transition-all duration-300 hover:scale-110"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white/70 group-hover:text-[#25D366] transition-colors" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.247-.694.247-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ====== BOTTOM BAR ====== */}
        <div className="border-t border-white/10 py-6 md:py-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
            <span className="text-[#F2529D]">© 2025 Sibs Style Beauty Lounge.</span>
            <span className="ml-2">All Rights Reserved.</span>
          </p>
          <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
            <a href="#" className="hover:text-[#F2529D] transition-colors">Privacy</a>
            <span className="text-white/20">/</span>
            <a href="#" className="hover:text-[#F2529D] transition-colors">Terms</a>
            <span className="text-white/20">/</span>
            <Link to="/contact" className="hover:text-[#F2529D] transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] text-white/30 font-medium italic">
            Crafted with care in Dubai
          </p>
        </div>
      </div>
    </footer>
  );
}
