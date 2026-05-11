import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight, Sparkles, Lock } from 'lucide-react';
import {
  getCurrentAuthUser,
  getStoredAuthToken,
  login,
  register,
} from './api/convex-api';

const splitList = (value: string) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // This keeps the user on the page they originally wanted after they sign in.
  const redirectParam = new URLSearchParams(location.search).get('redirect') ?? '/booking';
  const safeRedirect = redirectParam.startsWith('/') ? redirectParam : '/booking';
  const resolveRedirect = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      return '/admin';
    }

    return safeRedirect === '/admin' ? '/booking' : safeRedirect;
  };

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    preferredLocation: '',
    skinPreferences: '',
    allergies: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const checkSession = async () => {
      // If a valid token already exists, skip the form and go straight in.
      const authToken = getStoredAuthToken();
      if (!authToken) {
        setIsLoadingSession(false);
        return;
      }

      const currentUser = await getCurrentAuthUser(authToken);
      if (currentUser) {
        navigate(resolveRedirect(currentUser.role), { replace: true });
        return;
      }

      setIsLoadingSession(false);
    };

    checkSession();
  }, [navigate, safeRedirect]);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Login returns a token plus the safe public user profile.
      const session = await login(loginData);
      navigate(resolveRedirect(session.user.role), { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Registration creates the account and signs the visitor in immediately.
      const session = await register({
        fullName: registerData.fullName,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        preferredLocation: registerData.preferredLocation,
        skinPreferences: splitList(registerData.skinPreferences),
        allergies: splitList(registerData.allergies),
      });

      navigate(resolveRedirect(session.user.role), { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to create your account right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#F2529D] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#333] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,82,157,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(191,156,52,0.12),transparent_30%)]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-3xl sm:text-4xl font-display italic font-black text-[#F2529D]">
            Sibs Style
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-500 hover:text-[#F2529D] transition-colors"
          >
            Back home <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 sm:gap-8 lg:gap-10 items-stretch">
          <div className="rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] bg-[#0A0E1A] text-white p-6 sm:p-8 lg:p-12 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.45)] border border-white/10 overflow-hidden relative">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#F2529D]/20 blur-[120px]"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#BF9C34]/15 blur-[140px]"></div>

            <div className="relative z-10 space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <Lock size={16} className="text-[#F2529D]" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white/50">Protected access</span>
              </div>

              <div className="space-y-4 sm:space-y-6 max-w-xl">
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display italic font-black leading-[0.95]">
                  Welcome to your ritual <span className="text-[#F2529D]">gateway</span>
                </h1>
                <p className="text-sm sm:text-lg lg:text-xl text-white/65 leading-relaxed">
                  Sign in to book appointments, share reviews, and keep every client record tied to the right account.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/5 border border-white/10 p-5 sm:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D]">Login</p>
                  <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed">
                    Returning guests can go straight back to booking and testimonials.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white/5 border border-white/10 p-5 sm:p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]">Register</p>
                  <p className="mt-3 text-sm sm:text-base text-white/70 leading-relaxed">
                    New clients can add skin preferences and allergies so the lounge keeps the record personal.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`rounded-full px-5 sm:px-6 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] transition-colors ${mode === 'login' ? 'bg-[#F2529D] text-white' : 'bg-white/5 text-white/60 border border-white/10'}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`rounded-full px-5 sm:px-6 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] transition-colors ${mode === 'register' ? 'bg-[#BF9C34] text-black' : 'bg-white/5 text-white/60 border border-white/10'}`}
                >
                  Register
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] sm:rounded-[3rem] lg:rounded-[4rem] bg-white shadow-[0_30px_90px_-30px_rgba(0,0,0,0.25)] border border-white/60 p-5 sm:p-8 lg:p-10 xl:p-12">
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D]">Sign in</p>
                  <h2 className="text-3xl sm:text-4xl font-display italic font-black text-[#0A0E1A]">Access your account</h2>
                </div>

                {submitError && (
                  <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 sm:px-5 py-4 text-sm sm:text-base text-red-700">
                    {submitError}
                  </div>
                )}

                <label className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Email</span>
                  <input
                    required
                    type="email"
                    value={loginData.email}
                    onChange={(event) => setLoginData((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D]"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Password</span>
                  <input
                    required
                    type="password"
                    value={loginData.password}
                    onChange={(event) => setLoginData((prev) => ({ ...prev, password: event.target.value }))}
                    className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D]"
                    placeholder="Enter your password"
                  />
                </label>

                <button
                  disabled={isSubmitting}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white transition-colors hover:bg-[#F2529D] disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in...' : 'Continue to your ritual'}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-6 sm:space-y-8">
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]">Register</p>
                  <h2 className="text-3xl sm:text-4xl font-display italic font-black text-[#0A0E1A]">Create a client profile</h2>
                </div>

                {submitError && (
                  <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 sm:px-5 py-4 text-sm sm:text-base text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="grid gap-4 sm:gap-5">
                  <label className="block space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Full name</span>
                    <input
                      required
                      type="text"
                      value={registerData.fullName}
                      onChange={(event) => setRegisterData((prev) => ({ ...prev, fullName: event.target.value }))}
                      className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D]"
                      placeholder="Your full name"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Email</span>
                      <input
                        required
                        type="email"
                        value={registerData.email}
                        onChange={(event) => setRegisterData((prev) => ({ ...prev, email: event.target.value }))}
                        className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D]"
                        placeholder="you@example.com"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Phone</span>
                      <input
                        required
                        type="tel"
                        value={registerData.phone}
                        onChange={(event) => setRegisterData((prev) => ({ ...prev, phone: event.target.value }))}
                        className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D]"
                        placeholder="052 000 0000"
                      />
                    </label>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Password</span>
                    <input
                      required
                      type="password"
                      value={registerData.password}
                      onChange={(event) => setRegisterData((prev) => ({ ...prev, password: event.target.value }))}
                      className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D]"
                      placeholder="Create a password"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Preferred location</span>
                    <input
                      type="text"
                      value={registerData.preferredLocation}
                      onChange={(event) => setRegisterData((prev) => ({ ...prev, preferredLocation: event.target.value }))}
                      className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D]"
                      placeholder="Downtown Sibs Lounge"
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Skin preferences</span>
                      <textarea
                        rows={4}
                        value={registerData.skinPreferences}
                        onChange={(event) => setRegisterData((prev) => ({ ...prev, skinPreferences: event.target.value }))}
                        className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D] resize-none"
                        placeholder="Hydration, glow, sensitivity support"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Allergies</span>
                      <textarea
                        rows={4}
                        value={registerData.allergies}
                        onChange={(event) => setRegisterData((prev) => ({ ...prev, allergies: event.target.value }))}
                        className="w-full rounded-[1.5rem] border border-gray-200 bg-[#FAF9F6] px-4 sm:px-5 py-4 text-base sm:text-lg focus:outline-none focus:border-[#F2529D] resize-none"
                        placeholder="Fragrance, nuts, retinol"
                      />
                    </label>
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#F2529D] px-6 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white transition-colors hover:bg-black disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating account...' : 'Join the lounge'}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-400">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="hover:text-[#F2529D] transition-colors"
              >
                {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
              </button>
              <span className="inline-flex items-center gap-2 text-[#BF9C34]">
                <Sparkles size={14} />
                Protected routes stay tied to your account
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
