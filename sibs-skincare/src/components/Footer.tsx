import { Link } from 'react-router-dom';
import logo from '../assets/sibs-logo.svg';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#05070D] text-white pt-20 md:pt-28 pb-12 md:pb-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,82,157,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(199,157,51,0.1),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F2529D]/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-10 space-y-16 md:space-y-20">
        <div className="grid grid-cols-1 gap-12 md:gap-16 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 w-fit">
              <div className="rounded-full border-2 border-[#F2529D]/30 bg-white/8 p-2 shadow-[0_8px_24px_-12px_rgba(242,82,157,0.4)]">
                <img src={logo} alt="Sibs Style logo" className="h-12 w-auto rounded-full" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-[0.4em] text-[#F2529D]">Sibs Style</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mt-0.5">Beauty Lounge L.L.C</p>
              </div>
            </div>

            <p className="text-[15px] leading-7 text-white/70 font-medium">
              Elevating your natural beauty with premium services in a luxurious, relaxing environment.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full border border-[#F2529D]/20 bg-[#F2529D]/8 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#FFB3D0]">Luxury Rituals</span>
              <span className="inline-flex rounded-full border border-[#C79D33]/20 bg-[#C79D33]/8 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#F5D37B]">Curated Care</span>
              <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-white/60">Dubai Based</span>
            </div>
          </div>

          {/* Quick Links Section */}
          <div className="space-y-5">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Quick Links</h4>
              <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-[#F2529D]/60 to-transparent" />
            </div>
            <ul className="space-y-3 text-[15px] text-white/75 font-medium">
              <li><Link to="/" className="hover:text-[#F2529D] transition-colors duration-300">Home</Link></li>
              <li><Link to="/booking" className="hover:text-[#F2529D] transition-colors duration-300">Treatments</Link></li>
              <li><Link to="/offers" className="hover:text-[#F2529D] transition-colors duration-300">Offers</Link></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-5">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Contact</h4>
              <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-[#C79D33]/60 to-transparent" />
            </div>
            <ul className="space-y-3 text-[15px] leading-6 text-white/75 font-medium">
              <li className="text-white/70">Al Hashar Building, Salah Al Din St, Office 301</li>
              <li className="text-white/70">Muteena, Deira, Dubai</li>
              <li className="text-[#F5D37B] font-black tracking-wider">052 906 3016</li>
            </ul>
          </div>

          {/* Follow Section */}
          <div className="space-y-5">
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Follow</h4>
              <div className="mt-3 h-0.5 w-12 bg-gradient-to-r from-[#F2529D]/60 to-transparent" />
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 bg-white/8 hover:border-[#F2529D]/60 hover:bg-[#F2529D]/12 transition-all duration-300">
              <a href="https://www.instagram.com/sibsstylebeauty/" target="_blank" rel="noopener noreferrer" className="text-lg font-black text-white/80 hover:text-[#FFB3D0] transition-colors duration-300">Ig</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 md:pt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-[12px] font-black uppercase tracking-[0.25em] text-white/45">
            <span className="text-[#F2529D]">© 2025 SIBS STYLE BEAUTY LOUNGE.</span>
            <span className="ml-2">ALL RIGHTS RESERVED.</span>
          </p>

          <div className="flex items-center gap-6 text-[12px] font-black uppercase tracking-[0.25em] text-white/50">
            <a href="#" className="hover:text-[#F2529D] transition-colors duration-300">Privacy Policy</a>
            <span className="text-white/20">•</span>
            <a href="#" className="hover:text-[#F2529D] transition-colors duration-300">Terms of Luxury</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
