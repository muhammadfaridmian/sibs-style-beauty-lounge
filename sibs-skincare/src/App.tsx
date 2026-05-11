import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import HomeScreen from './HomePage.tsx';
import BookingPage from './BookingPage.tsx';
import StylistsPage from './StylistsPage.tsx';
import TestimonialsPage from './TestimonialsPage.tsx';
import ExclusiveOffers from './OffersPage.tsx';
import ContactPage from './ContactPage.tsx';
import GalleryPage from './GalleryPage.tsx';
import AuthPage from './AuthPage.tsx';
import AdminPage from './AdminPage.tsx';
import { clearStoredAuthSession, getStoredAuthUser, type AuthUser } from './api/convex-api.ts';

// This keeps every route change feeling like a fresh page instead of a hard jump.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Global Fade-in on route change
    gsap.fromTo('main', 
      { opacity: 0, scale: 0.98 }, 
      { opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out', clearProps: 'all' }
    );
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

  const handleSignOut = () => {
    // Sign out clears the stored session and drops the user back home.
    // The UI also closes the menu so the logout feels like a clean reset.
    clearStoredAuthSession();
    setCurrentUser(null);
    setIsMenuOpen(false);
    navigate('/');
  };

  // These are the main public sections shown in both desktop and mobile navigation.
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Treatments', path: '/booking' },
    { name: 'Artisans', path: '/artisans' },
    { name: 'Offers', path: '/offers' },
    { name: 'Chronicles', path: '/testimonials' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#FAF9F6]/95 md:bg-[#FAF9F6]/92 backdrop-blur-xl md:backdrop-blur-2xl border-b border-gray-100 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-10 h-32 flex items-center justify-between">
          <Link to="/" className="text-4xl font-display font-black italic text-[#F2529D] shrink-0">
            Sibs Style
          </Link>

          <div className="hidden lg:flex items-center space-x-6 xl:space-x-10 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[15px] font-[900] uppercase tracking-[0.45em] transition-all duration-300 whitespace-nowrap ${
                  location.pathname === link.path
                    ? 'text-[#F2529D] underline underline-offset-[14px] decoration-2 scale-105'
                    : 'text-gray-500 hover:text-[#F2529D] hover:scale-105'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {currentUser ? (
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-right shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-400">Signed in</p>
                <p className="mt-1 max-w-[180px] truncate text-sm font-black text-[#0A0E1A]">{currentUser.fullName}</p>
              </div>
            ) : (
              <Link
                to="/auth"
                className="rounded-xl border border-gray-200 bg-white px-6 py-4 text-[13px] font-black uppercase tracking-[0.3em] text-gray-600 hover:border-[#F2529D]/30 hover:text-[#F2529D] transition-all whitespace-nowrap"
              >
                Sign in
              </Link>
            )}

            {/* Reserve uses the curtain transition so booking feels like an intentional reveal. */}
            {/* Using a custom event here keeps the button logic separate from route rendering. */}
            <button
              onClick={() => {
                const event = new CustomEvent('trigger-curtain', { detail: { path: '/booking' } });
                window.dispatchEvent(event);
              }}
              className="bg-black text-white px-10 py-4 rounded-xl text-[13px] font-black uppercase tracking-[0.3em] hover:bg-[#F2529D] transition-all whitespace-nowrap cursor-pointer"
            >
              RESERVE
            </button>

            {currentUser && (
              <button
                onClick={handleSignOut}
                className="rounded-xl border border-gray-200 bg-white px-6 py-4 text-[13px] font-black uppercase tracking-[0.3em] text-gray-600 hover:border-[#F2529D]/30 hover:text-[#F2529D] transition-all whitespace-nowrap"
              >
                Sign out
              </button>
            )}
          </div>

          <button className="lg:hidden text-black" onClick={() => setIsMenuOpen(true)}>
            {/* The mobile icon opens the full-screen menu instead of squeezing links into the header. */}
            <Menu size={32} />
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
        className={`fixed inset-0 z-[100] h-[100dvh] overflow-hidden text-white transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
          isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-full'
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.22),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(191,156,52,0.16),transparent_30%),linear-gradient(180deg,#0A0E1A_0%,#04070F_100%)]" />
        <div className="absolute inset-x-6 top-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="relative flex min-h-full flex-col px-3 py-3 sm:px-6 sm:py-6">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 px-4 py-4 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <span className="block text-3xl font-display italic text-[#F2529D] sm:text-4xl">Sibs Style</span>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.45em] text-white/35">Curated mobile navigation</p>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white transition-transform hover:rotate-90"
                aria-label="Close navigation menu"
              >
                <X size={30} />
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[2rem] border border-[#273147] bg-[#111827] p-4 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.85)]">
            <p className="text-[#F2529D] uppercase tracking-[0.4em] text-[10px] font-black">Navigation</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
              Move through the lounge edit, treatments, stories, and contact details.
            </p>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto py-4 pr-1">
            <div className="space-y-3">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group flex items-center justify-between gap-3 rounded-[1.6rem] border px-4 py-4 transition-all duration-300 sm:px-5 sm:py-5 ${
                      isActive
                        ? 'border-[#F2529D]/60 bg-[#F2529D]/12 shadow-[0_18px_50px_-25px_rgba(242,82,157,0.65)]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-[10px] font-black uppercase tracking-[0.35em] transition-colors ${
                        isActive
                          ? 'border-[#F2529D]/60 bg-[#F2529D]/15 text-[#F2529D]'
                          : 'border-white/10 bg-black/20 text-white/50 group-hover:border-[#F2529D]/30 group-hover:text-[#F2529D]'
                      }`}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="min-w-0">
                        <p className={`truncate font-display italic leading-none text-[clamp(1.7rem,6.4vw,2.45rem)] ${isActive ? 'text-white' : 'text-white/95'}`}>
                          {link.name}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.35em] text-white/30">
                          {isActive ? 'Current page' : 'Open page'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-sm font-black uppercase tracking-[0.35em] transition-colors ${isActive ? 'text-[#F2529D]' : 'text-white/25 group-hover:text-white/55'}`}>
                      <ChevronRight size={18} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#273147] bg-[#111827] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D]">
              Account
            </p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-display italic text-2xl leading-none text-white">
                  {currentUser ? currentUser.fullName : 'Guest access'}
                </p>
                <p className="mt-2 text-sm text-white/60">
                  {currentUser
                    ? currentUser.role === 'admin'
                      ? 'Admin session active.'
                      : 'Customer session active.'
                    : 'Sign in to book, review, and reach the admin area if you have the admin account.'}
                </p>
              </div>

              {currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="shrink-0 rounded-full border border-white/10 bg-black/30 px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:border-[#F2529D]/40 hover:text-[#F2529D] transition-colors"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMenuOpen(false)}
                  className="shrink-0 rounded-full bg-[#F2529D] px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-white hover:text-[#0A0E1A] transition-colors"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/10 pt-4 pb-6 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[#273147] bg-[#111827] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D]">
                Specialty Beauty Lounge
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                Al Hashar Building, Salah Al Din St, Office 301
                <br />
                Muteena, Deira, Dubai
                <br />
                052 906 3016
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-[#F2529D] px-4 py-4 text-white shadow-[0_16px_40px_-20px_rgba(242,82,157,0.75)] transition-transform hover:scale-[1.01]">
              <Link to="/booking" onClick={() => setIsMenuOpen(false)} className="flex h-full items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/70">Reserve</p>
                  <p className="mt-2 font-display italic text-3xl leading-none">Book Now</p>
                </div>
                <ChevronRight size={18} />
              </Link>
            </div>

            <div className="flex items-center justify-between rounded-[1.5rem] border border-[#273147] bg-[#111827] px-4 py-4 sm:col-span-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/40">Stay connected</p>
                <p className="mt-2 text-sm text-white/65">Follow the visual journal for new edits and offers.</p>
              </div>

              <div className="flex gap-3 text-white/60">
                <a href="https://www.instagram.com/sibsstylebeauty?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all hover:border-[#F2529D]/50 hover:text-[#F2529D]">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em]">ig</span>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61584300861932" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition-all hover:border-[#4267B2]/50 hover:text-[#4267B2]">
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
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/artisans" element={<StylistsPage />} />
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
