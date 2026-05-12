import { Link } from 'react-router-dom';
import logo from '../assets/sibs-logo.svg';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#05070D] text-white pt-16 md:pt-24 pb-8 md:pb-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,82,157,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(199,157,51,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(124,97,255,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02)_0%,transparent_26%,rgba(255,255,255,0.02)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F2529D]/60 via-[#C79D33]/60 to-transparent" />
      <div className="pointer-events-none absolute left-[-5rem] top-12 h-44 w-44 rounded-full bg-[#F2529D]/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] bottom-0 h-56 w-56 rounded-full bg-[#C79D33]/12 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8">
        <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(145deg,rgba(11,15,26,0.96)_0%,rgba(4,6,11,0.98)_100%)] p-6 md:p-8 shadow-[0_30px_100px_-40px_rgba(0,0,0,0.95)] backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-[1.15fr_0.95fr_0.95fr_1.1fr]">
            <div className="space-y-5 md:pr-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full border border-[#F2529D]/35 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,255,255,0.72))] p-1 shadow-[0_10px_30px_-14px_rgba(242,82,157,0.9)]">
                  <img src={logo} alt="Sibs Style logo" className="h-14 w-auto rounded-full" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.45em] text-[#BF9C34]">Sibs Style</p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.3em] text-white/50">Beauty Lounge L.L.C</p>
                </div>
              </div>

              <p className="max-w-sm text-[15px] md:text-[16px] leading-7 text-white/78">
                Elevating your natural beauty with premium services in a luxurious, relaxing environment.
              </p>

              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border border-[#F2529D]/25 bg-[#F2529D]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#FF9BC2]">Luxury rituals</span>
                <span className="rounded-full border border-[#C79D33]/25 bg-[#C79D33]/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-[#F5D37B]">Curated care</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/70">Dubai based</span>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 md:p-6 shadow-[0_16px_48px_-26px_rgba(0,0,0,0.75)]">
              <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-[#BF9C34]">Quick Links</h4>
              <div className="mt-5 h-px bg-gradient-to-r from-[#F2529D]/40 via-[#C79D33]/30 to-transparent" />
              <ul className="mt-4 grid gap-2 text-[15px] text-white/78">
                <li><Link to="/" className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition-all hover:border-[#F2529D]/25 hover:bg-[#F2529D]/8 hover:text-white"><span>Home</span><span className="text-[#F2529D] opacity-0 transition-opacity group-hover:opacity-100">↗</span></Link></li>
                <li><Link to="/booking" className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition-all hover:border-[#F2529D]/25 hover:bg-[#F2529D]/8 hover:text-white"><span>Treatments</span><span className="text-[#F2529D] opacity-0 transition-opacity group-hover:opacity-100">↗</span></Link></li>
                <li><Link to="/artisans" className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition-all hover:border-[#F2529D]/25 hover:bg-[#F2529D]/8 hover:text-white"><span>Artisans</span><span className="text-[#F2529D] opacity-0 transition-opacity group-hover:opacity-100">↗</span></Link></li>
                <li><Link to="/offers" className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition-all hover:border-[#F2529D]/25 hover:bg-[#F2529D]/8 hover:text-white"><span>Offers</span><span className="text-[#F2529D] opacity-0 transition-opacity group-hover:opacity-100">↗</span></Link></li>
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-5 md:p-6 shadow-[0_16px_48px_-26px_rgba(0,0,0,0.75)]">
              <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-[#BF9C34]">Contact</h4>
              <div className="mt-5 h-px bg-gradient-to-r from-[#C79D33]/35 via-[#F2529D]/25 to-transparent" />
              <ul className="mt-4 space-y-4 text-[15px] leading-7 text-white/78">
                <li className="rounded-xl border border-white/6 bg-black/15 px-3 py-3">Al Hashar Building, Salah Al Din St, Office 301</li>
                <li className="rounded-xl border border-white/6 bg-black/15 px-3 py-3">Muteena, Deira, Dubai</li>
                <li className="rounded-xl border border-white/6 bg-black/15 px-3 py-3 text-[#F5D37B]">052 906 3016</li>
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-white/8 bg-[linear-gradient(180deg,rgba(242,82,157,0.12)_0%,rgba(199,157,51,0.06)_42%,rgba(255,255,255,0.03)_100%)] p-5 md:p-6 shadow-[0_16px_48px_-26px_rgba(0,0,0,0.75)]">
              <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-[#BF9C34]">Follow</h4>
              <div className="mt-5 h-px bg-gradient-to-r from-[#F2529D]/35 via-[#C79D33]/35 to-transparent" />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 transition-all hover:-translate-y-1 hover:border-[#F2529D]/50 hover:bg-[#F2529D]/15 hover:text-[#FFB3D0]">Fb</a>
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 transition-all hover:-translate-y-1 hover:border-[#F2529D]/50 hover:bg-[#F2529D]/15 hover:text-[#FFB3D0]">Ig</a>
                <a href="#" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/85 transition-all hover:-translate-y-1 hover:border-[#F2529D]/50 hover:bg-[#F2529D]/15 hover:text-[#FFB3D0]">Yt</a>
              </div>

              <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#F2529D]">Newsletter</p>
                <p className="mt-2 text-[14px] leading-6 text-white/75">
                  Sign up for our newsletter to receive exclusive offers and stories.
                </p>
                <div className="mt-4 flex gap-2">
                  <div className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-[13px] text-white/45">Your email</div>
                  <div className="shrink-0 rounded-full bg-gradient-to-r from-[#F2529D] via-[#D36D2C] to-[#C79D33] px-4 py-3 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-[0_10px_24px_-12px_rgba(242,82,157,0.75)]">Join</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 md:mt-10 flex flex-col gap-5 border-t border-white/8 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-[12px] md:text-[13px] font-black uppercase tracking-[0.3em] text-white/45">
              <span className="text-[#F2529D]">© 2024 SIBS STYLE BEAUTY LOUNGE.</span>
              <span>All rights reserved.</span>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-[12px] md:text-[13px] font-black uppercase tracking-[0.28em] text-white/50">
              <Link to="#" className="transition-colors hover:text-[#F2529D]">Privacy Policy</Link>
              <Link to="#" className="transition-colors hover:text-[#F2529D]">Terms of Luxury</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
