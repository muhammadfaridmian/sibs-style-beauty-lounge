import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { X, ChevronRight, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import logo from './assets/Sibs Style BL logo.png';
import HomeScreen from './HomePage.tsx';
import BookingPage from './BookingPage.tsx';
import TestimonialsPage from './TestimonialsPage.tsx';
import ExclusiveOffers from './OffersPage.tsx';
import ContactPage from './ContactPage.tsx';
import GalleryPage from './GalleryPage.tsx';
import AuthPage from './AuthPage.tsx';
import AdminPage from './AdminPage.tsx';
import { clearStoredAuthSession, getStoredAuthUser, type AuthUser } from './api/convex-api.ts';

// This keeps every route change feeling like a fresh page instead of a hard jump.
// It also gives the site one place to reset scroll and page animations.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Global Fade-in on route change
    const mainEl = document.querySelector('main');
    if (mainEl) {
      gsap.fromTo(
        mainEl,
        { opacity: 0, scale: 0.98 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out', clearProps: 'all' }
      );
    }
  }, [pathname]);

  return null;
};

const CurtainTransition = ({ onMidpoint, onComplete }: { onMidpoint: () => void, onComplete: () => void }) => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const onMidpointRef = useRef(onMidpoint);
  const onCompleteRef = useRef(onComplete);

  // Keep the latest callbacks here so the animation does not restart on every render.
  useEffect(() => {
    onMidpointRef.current = onMidpoint;
    onCompleteRef.current = onComplete;
  }, [onMidpoint, onComplete]);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onCompleteRef.current();
      }
    });

    // The curtain closes first, then the page changes, then it opens again.
    gsap.set(containerRef.current, { visibility: 'visible' });
    gsap.set(textRef.current, { scale: 0.98, opacity: 0, y: 12 });
    
    tl.to(leftRef.current, { x: '0%', duration: 0.8, ease: "expo.inOut" })
      .to(rightRef.current, { x: '0%', duration: 0.8, ease: "expo.inOut" }, "<")
      .to(textRef.current, { scale: 1, opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.15")
      .add(() => {
         // Switch the page content while the curtains are fully closed
         onMidpointRef.current();
      })
      // Delay opening to allow the page render
      .to(leftRef.current, { x: '-100%', duration: 0.8, ease: "expo.inOut", delay: 0.4 })
      .to(rightRef.current, { x: '100%', duration: 0.8, ease: "expo.inOut" }, "<")
      .to(textRef.current, { opacity: 0, y: -8, scale: 0.99, duration: 0.35, ease: "power2.in" }, "<")
      .set(containerRef.current, { visibility: 'hidden' });
    
    return () => {
      tl.kill(); // Cleanup timeline if unmounted
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] pointer-events-none flex invisible">
      <div 
        ref={leftRef} 
        className="w-1/2 h-full bg-[#0A0E1A] -translate-x-full border-r border-[#F2529D]/20"
      />
      <div 
        ref={rightRef} 
        className="w-1/2 h-full bg-[#0A0E1A] translate-x-full border-l border-[#F2529D]/20"
      />
      
      {/* Centered Text Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <div ref={textRef} className="flex w-full max-w-[90vw] flex-col items-center justify-center gap-1 text-center sm:max-w-none sm:flex-row sm:gap-6">
           <span className="block font-display italic text-[clamp(3.5rem,13vw,5.75rem)] font-black leading-none tracking-[-0.04em] text-[#F2529D] drop-shadow-2xl sm:text-8xl md:text-9xl">Sibs</span>
           <span className="block font-display italic text-[clamp(3.5rem,13vw,5.75rem)] font-black leading-none tracking-[-0.04em] text-white drop-shadow-2xl sm:text-8xl md:text-9xl">Style</span>
        </div>
      </div>
    </div>
  );
};

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  // Boot from localStorage so the header knows the user state before any network calls finish.
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleTrigger = (e: any) => {
      // The curtain event carries the next route path from whichever button fired it.
      // That lets the reserve button and the nav buttons share the same transition logic.
      setPendingRoute(e.detail.path);
      setShowCurtain(true);
    };
    window.addEventListener('trigger-curtain', handleTrigger);
    return () => window.removeEventListener('trigger-curtain', handleTrigger);
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      // This keeps the header and mobile menu in sync with localStorage.
      // It is the reason the nav updates immediately after login or logout.
      setCurrentUser(getStoredAuthUser());
    };

    window.addEventListener('sibs-style-auth-change', syncAuthState);
    syncAuthState();

    return () => window.removeEventListener('sibs-style-auth-change', syncAuthState);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const handleSignOut = () => {
    // Sign out clears the stored session and drops the user back home.
    // The UI also closes the menu so the logout feels like a clean reset.
    clearStoredAuthSession();
    setCurrentUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  // These are the main public sections shown in both desktop and mobile navigation.
  // The app keeps the menu simple so guests can move around the salon site fast.
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Treatments', path: '/booking' },
    { name: 'Offers', path: '/offers' },
    { name: 'Chronicles', path: '/testimonials' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 group/nav">
        {/* Glass background that intensifies on scroll */}
        <div className="absolute inset-0 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-gray-100/50 transition-all duration-500" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F2529D]/40 to-transparent" />

        <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-20 lg:h-24 flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group/logo" aria-label="Sibs Style home">
            <div className="relative">
              <div className="absolute inset-0 bg-[#F2529D]/20 rounded-full blur-md opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
              <img
                src={logo}
                alt="Sibs Style logo"
                className="relative h-12 sm:h-14 lg:h-16 xl:h-20 w-auto rounded-full border-2 border-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] transition-transform duration-500 group-hover/logo:scale-105"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#F2529D] leading-none">Sibs Style</p>
              <p className="text-[8px] lg:text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mt-1">Beauty Lounge</p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center flex-1 justify-center">
            <div className="flex items-center gap-1 bg-white/60 backdrop-blur-md rounded-full p-1.5 border border-gray-100 shadow-[0_4px_30px_-10px_rgba(0,0,0,0.08)]">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`group/link relative flex items-center justify-center px-4 xl:px-5 py-2.5 rounded-full transition-all duration-400 transform ${
                      isActive
                        ? 'bg-[#0A0E1A] text-white shadow-[0_4px_20px_-6px_rgba(0,0,0,0.4)]'
                        : 'text-gray-600 hover:text-[#0A0E1A] hover:bg-white'
                    }`}
                  >
                    <span className="text-[12px] xl:text-[13px] font-black uppercase tracking-[0.15em] pointer-events-none transition-transform group-hover/link:scale-105">{link.name}</span>
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F2529D]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side: Auth + Reserve */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {currentUser && currentUser.role === 'admin' && (
              <Link
                to="/admin"
                className="group/admin flex items-center gap-2 rounded-full border border-[#F2529D]/30 bg-[#F2529D]/5 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.25em] text-[#F2529D] hover:bg-[#F2529D]/10 hover:border-[#F2529D]/60 transition-all whitespace-nowrap"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#F2529D] animate-pulse" />
                Admin
              </Link>
            )}

            {currentUser ? (
              <>
                <div className="group/user flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm hover:border-[#F2529D]/30 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F2529D] to-[#BF9C34] flex items-center justify-center text-white text-[10px] font-black">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 leading-none">Signed in</p>
                    <p className="mt-0.5 max-w-[120px] truncate text-xs font-black text-[#0A0E1A]">{currentUser.fullName}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="ml-1 text-gray-400 hover:text-[#F2529D] transition-colors text-[10px] font-black uppercase tracking-wider"
                    aria-label="Sign out"
                  >
                    Exit
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/auth"
                className="group/signin flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.25em] text-gray-600 hover:border-[#F2529D]/40 hover:text-[#F2529D] hover:shadow-[0_4px_20px_-8px_rgba(242,82,157,0.3)] transition-all whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Sign in
              </Link>
            )}

            {/* Reserve button */}
            <button
              onClick={() => {
                const event = new CustomEvent('trigger-curtain', { detail: { path: '/booking' } });
                window.dispatchEvent(event);
              }}
              className="group/reserve relative overflow-hidden rounded-full bg-[#0A0E1A] text-white px-6 xl:px-8 py-3 text-[11px] font-black uppercase tracking-[0.25em] hover:bg-[#F2529D] transition-all whitespace-nowrap cursor-pointer shadow-[0_4px_20px_-6px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_30px_-8px_rgba(242,82,157,0.5)] hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Reserve
                <ArrowRight size={13} className="group-hover/reserve:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/reserve:translate-x-full transition-transform duration-700" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-full bg-white border border-gray-100 shadow-sm text-black ml-auto hover:border-[#F2529D]/30 transition-colors"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className="block w-5 h-0.5 bg-current rounded-full transition-all" />
              <span className="block w-5 h-0.5 bg-current rounded-full transition-all" />
              <span className="block w-3.5 h-0.5 bg-current rounded-full ml-auto transition-all" />
            </div>
          </button>
        </div>
      </nav>

      {showCurtain && (
        // The transition overlay only appears while the route handoff is happening.
        <CurtainTransition 
          onMidpoint={() => {
            if (pendingRoute) navigate(pendingRoute);
          }}
          onComplete={() => {
            setShowCurtain(false);
          }} 
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] h-[100dvh] overflow-y-auto overscroll-contain touch-pan-y bg-[#05070D] text-white transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
          isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'
        }`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.26),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(199,157,51,0.14),transparent_30%),radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_42%),linear-gradient(180deg,#05070D_0%,#0A0E1A_45%,#04060B_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_18%,rgba(255,255,255,0.03)_36%,transparent_54%,rgba(255,255,255,0.02)_72%,transparent_86%)] opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,97,255,0.08),transparent_40%)] opacity-60" />
        <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-[#F2529D]/45 to-[#C79D33]/25" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#F2529D]/20 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#C79D33]/16 to-transparent" />
        <div className="absolute left-[-16%] top-[8%] h-60 w-60 rounded-full bg-[#F2529D]/10 blur-3xl" />
        <div className="absolute right-[-14%] bottom-[8%] h-72 w-72 rounded-full bg-[#C79D33]/10 blur-3xl" />

        <div className="relative flex min-h-[100dvh] w-full flex-col bg-transparent px-3 py-3 sm:px-6 sm:py-6">
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-[#273147] bg-[linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(7,10,18,0.98)_100%)] px-4 py-4 shadow-[0_30px_90px_-35px_rgba(0,0,0,0.92)] backdrop-blur-md">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.14),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(124,97,255,0.08),transparent_30%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#F2529D]/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-[#C79D33]/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="block text-3xl font-display italic text-[#F2529D] sm:text-4xl">Sibs Style</span>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.45em] text-[#9CA3AF]">Curated mobile navigation</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-1.5 w-10 rounded-full bg-[#F2529D]" />
                  <span className="h-1.5 w-5 rounded-full bg-[#C79D33]" />
                  <span className="h-1.5 w-3 rounded-full bg-[#7C61FF]" />
                  <span className="h-1.5 w-2 rounded-full bg-white/70" />
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#273147] bg-[linear-gradient(145deg,rgba(11,15,26,0.96)_0%,rgba(31,41,55,0.92)_100%)] text-white transition-transform hover:rotate-90"
                aria-label="Close navigation menu"
              >
                <X size={30} />
              </button>
            </div>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-[2rem] border border-[#273147] bg-[linear-gradient(145deg,rgba(17,24,39,0.95)_0%,rgba(7,10,18,0.97)_100%)] p-4 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.9)] backdrop-blur-md">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.1),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(199,157,51,0.06),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_38%,rgba(255,255,255,0.02)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F2529D]/35 via-[#C79D33]/30 to-transparent" />
            <div className="relative">
              <p className="text-[#F2529D] uppercase tracking-[0.4em] text-[10px] font-black">Navigation</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#D1D5DB]">
                Move through the lounge edit, treatments, stories, and contact details.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="h-1.5 w-12 rounded-full bg-[#F2529D]" />
                <span className="h-1.5 w-6 rounded-full bg-[#C79D33]" />
                <span className="h-1.5 w-4 rounded-full bg-[#7C61FF]" />
              </div>
            </div>
          </div>

          <div className="relative flex-1 min-h-0 w-full overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(242,82,157,0.06),transparent_32%),radial-gradient(circle_at_bottom,rgba(199,157,51,0.05),transparent_28%),linear-gradient(180deg,rgba(10,14,26,0.18)_0%,rgba(10,14,26,0.72)_100%)] py-4 pr-1">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#05070D] via-[#05070D]/80 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#05070D] via-[#05070D]/80 to-transparent" />
            <div className="pointer-events-none absolute right-2 top-8 h-[calc(100%-4rem)] w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <div className="relative space-y-3">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group flex items-center justify-between gap-3 rounded-[1.6rem] border px-4 py-4 transition-all duration-300 sm:px-5 sm:py-5 ${
                      isActive
                        ? 'border-[#F2529D]/80 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.18),transparent_30%),linear-gradient(135deg,rgba(58,16,41,0.94)_0%,rgba(26,18,32,0.98)_100%)] shadow-[0_18px_50px_-24px_rgba(242,82,157,0.62)]'
                        : 'border-[#273147] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_32%),linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(8,12,22,0.98)_100%)] hover:border-[#F2529D]/70 hover:bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.14),transparent_30%),linear-gradient(145deg,rgba(20,27,43,0.98)_0%,rgba(36,16,34,0.98)_100%)]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[10px] font-black uppercase tracking-[0.35em] transition-colors ${
                        isActive
                          ? 'border-[#F2529D]/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_45%),linear-gradient(145deg,rgba(59,16,41,0.98)_0%,rgba(92,24,62,0.96)_100%)] text-[#F2529D]'
                          : 'border-[#273147] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%),linear-gradient(145deg,rgba(11,15,26,0.95)_0%,rgba(20,26,39,0.98)_100%)] text-[#D1D5DB] group-hover:border-[#F2529D]/70 group-hover:text-[#F2529D]'
                      }`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <p className={`truncate font-display italic leading-none text-[clamp(1.7rem,6.4vw,2.45rem)] ${isActive ? 'text-white' : 'text-[#F9FAFB]'}`}>
                          {link.name}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.35em] text-[#9CA3AF]">
                          {isActive ? 'Current page' : 'Open page'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-sm font-black uppercase tracking-[0.35em] transition-colors ${isActive ? 'text-[#F2529D]' : 'text-[#9CA3AF] group-hover:text-white'}`}>
                      <ChevronRight size={18} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="relative isolate overflow-hidden rounded-[1.5rem] border border-[#273147] bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.1),transparent_36%),linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(11,15,26,0.98)_100%)] p-4 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.92)] backdrop-blur-md">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_30%,rgba(255,255,255,0.02)_100%)]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F2529D]/35 via-[#C79D33]/30 to-transparent" />
            <div className="pointer-events-none absolute -right-6 top-[-1.5rem] h-24 w-24 rounded-full bg-[#F2529D]/10 blur-2xl" />
            <div className="relative space-y-3">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D]">
                Account
              </p>
              
              {currentUser && currentUser.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-[#F2529D]/50 bg-[linear-gradient(145deg,rgba(242,82,157,0.12)_0%,rgba(26,18,32,0.98)_100%)] px-4 py-3 transition-all hover:border-[#F2529D]/80 hover:bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.2),transparent_30%),linear-gradient(145deg,rgba(58,16,41,0.96)_0%,rgba(36,16,34,0.98)_100%)]"
                >
                  <div>
                    <p className="text-sm font-black text-[#F2529D]">Admin Panel</p>
                    <p className="text-[10px] text-[#9CA3AF]">Manage bookings & reviews</p>
                  </div>
                  <ChevronRight size={16} className="text-[#F2529D]" />
                </Link>
              )}

              <div className="flex flex-col gap-2 pt-2">
                {currentUser ? (
                  <>
                    <div className="rounded-lg border border-[#273147] bg-[linear-gradient(145deg,rgba(11,15,26,0.96)_0%,rgba(20,26,39,0.98)_100%)] px-4 py-3">
                      <p className="text-[9px] font-black uppercase tracking-[0.35em] text-[#9CA3AF]">Signed in as</p>
                      <p className="mt-1 text-sm font-black text-white truncate">{currentUser.fullName}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="rounded-lg border border-[#273147] bg-[linear-gradient(145deg,rgba(11,15,26,0.96)_0%,rgba(20,26,39,0.98)_100%)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:border-[#F2529D]/70 hover:text-[#F2529D] transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMenuOpen(false)}
                    className="rounded-lg bg-[#F2529D] px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#FF6FB0] transition-colors text-center"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="grid w-full gap-4 border-t border-[#273147] bg-[#0A0E1A] pt-4 pb-6 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[#273147] bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.08),transparent_36%),linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(11,15,26,0.98)_100%)] p-4 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.92)] backdrop-blur-md">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D]">
                Specialty Beauty Lounge
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#D1D5DB]">
                Al Hashar Building, Salah Al Din St, Office 301
                <br />
                Muteena, Deira, Dubai
                <br />
                052 906 3016
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#F2529D]/80 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_26%),linear-gradient(135deg,#F2529D_0%,#FF6FB0_45%,#D36D2C_100%)] px-4 py-4 text-white shadow-[0_16px_40px_-20px_rgba(242,82,157,0.86)] transition-transform hover:scale-[1.01]">
              <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="flex h-full items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/70">Reserve</p>
                  <p className="mt-2 font-display italic text-3xl leading-none">Book Now</p>
                </div>
                <ChevronRight size={18} />
              </Link>
            </div>

            <div className="flex items-center justify-between rounded-[1.5rem] border border-[#273147] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.04),transparent_34%),linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(11,15,26,0.98)_100%)] px-4 py-4 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.92)] backdrop-blur-md sm:col-span-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#9CA3AF]">Stay connected</p>
                <p className="mt-2 text-sm text-[#D1D5DB]">Follow the visual journal for new edits and offers.</p>
              </div>

              <div className="flex gap-3 text-[#D1D5DB]">
                <a href="https://www.instagram.com/sibsstylebeauty?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#273147] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%),linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(11,15,26,0.98)_100%)] transition-all hover:border-[#F2529D]/70 hover:text-[#F2529D]">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em]">ig</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61584300861932" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#273147] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_45%),linear-gradient(145deg,rgba(17,24,39,0.96)_0%,rgba(11,15,26,0.98)_100%)] transition-all hover:border-[#4267B2]/70 hover:text-[#4267B2]">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em]">fb</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


function App() {
  return (
    <Router>
      <div className="relative bg-[#FAF9F6] min-h-screen overflow-x-hidden">
        <ScrollToTop />
        <Navigation />
        {/* The route switch below is the single-page app handoff point. */}
        {/* Each page component owns its own data loading and animation details. */}
        <main>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/admin/*" element={<AdminPage />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />
            <Route path="/offers" element={<ExclusiveOffers />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
