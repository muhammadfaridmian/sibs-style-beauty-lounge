import { Link } from 'react-router-dom';
import logo from '../assets/sibs-logo.svg';

export default function Footer() {
  return (
    <footer className="bg-[#05070D] text-white pt-16 md:pt-20 pb-8 md:pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10 md:gap-16">
          <div className="flex-shrink-0 w-full md:w-1/3">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Sibs Style logo" className="h-14 w-auto rounded-full shadow-md" />
            </div>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed max-w-md">
              Elevating your natural beauty with premium services in a luxurious, relaxing environment.
            </p>
          </div>

          <div className="w-full md:w-1/3 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-[#BF9C34] mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-[#F2529D] transition-colors">Home</Link></li>
                <li><Link to="/booking" className="hover:text-[#F2529D] transition-colors">Treatments</Link></li>
                <li><Link to="/artisans" className="hover:text-[#F2529D] transition-colors">Artisans</Link></li>
                <li><Link to="/offers" className="hover:text-[#F2529D] transition-colors">Offers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-wider text-[#BF9C34] mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Al Hashar Building, Salah Al Din St, Office 301</li>
                <li className="truncate">Muteena, Deira, Dubai</li>
                <li>052 906 3016</li>
              </ul>
            </div>
          </div>

          <div className="w-full md:w-1/3">
            <h4 className="text-sm font-black uppercase tracking-wider text-[#BF9C34] mb-3">Follow</h4>
            <div className="flex items-center gap-4 mb-4">
              <a href="#" className="text-gray-300 hover:text-[#F2529D] text-lg">Fb</a>
              <a href="#" className="text-gray-300 hover:text-[#F2529D] text-lg">Ig</a>
              <a href="#" className="text-gray-300 hover:text-[#F2529D] text-lg">Yt</a>
            </div>
            <p className="text-sm text-gray-400">Sign up for our newsletter to receive exclusive offers and stories.</p>
          </div>
        </div>

        <div className="mt-10 md:mt-14 border-t border-white/6 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm md:text-[13px] text-gray-400">© 2024 SIBS STYLE BEAUTY LOUNGE. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-6 text-sm md:text-[13px] text-gray-400">
            <Link to="#" className="hover:text-[#F2529D]">Privacy Policy</Link>
            <Link to="#" className="hover:text-[#F2529D]">Terms of Luxury</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
