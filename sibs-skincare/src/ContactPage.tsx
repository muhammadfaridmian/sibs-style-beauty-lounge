import { useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import Footer from './components/Footer';
import gsap from 'gsap';
import contactHeroImage from './assets/Sibshall2.jpeg';

const ContactPage = () => {
    // This screen is mostly a contact card and directions page, not a data-heavy flow.
    useEffect(() => {
        // Each route entry starts at the top so the contact header reads like a fresh page.
        window.scrollTo(0, 0);
        // The animation sequence is intentionally simple: hero, card, then footer.
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        
        tl.fromTo('.contact-header', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1.2 }
        )
        .fromTo('.contact-card', 
            { opacity: 0, y: 40 }, 
            { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, 
            '-=0.8'
        )
        .fromTo('.contact-footer', 
            { opacity: 0 }, 
            { opacity: 1, duration: 1 }, 
            '-=0.5'
        );
    }, []);

    return (
        <div className="bg-[#FAF9F6] min-h-screen font-body selection:bg-[#F2529D] selection:text-white pb-0">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 pb-8 sm:pb-12 text-center contact-header">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-display text-[#BF9C34] italic font-black mb-3 sm:mb-4 leading-none">
                    Get in Touch
                </h1>
                <p className="text-gray-600 text-sm sm:text-lg font-body italic leading-relaxed max-w-2xl mx-auto">
                    Reach us directly via WhatsApp for the fastest response.
                </p>
            </div>

            {/* Main Contact Card Container */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 contact-card">
                <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 relative">
                    
                    {/* Hero Image Section with Banner */}
                    <div className="relative h-[240px] sm:h-[320px]">
                        <img 
                            src={contactHeroImage}
                            className="w-full h-full object-cover brightness-75"
                            alt="Luxury Spa Lounge"
                        />
                        <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 text-white">
                            <h2 className="text-xl sm:text-3xl md:text-4xl font-display italic font-black mb-2 leading-tight">Sibs Style Beauty Lounge</h2>
                            <div className="flex flex-col gap-1 text-xs sm:text-sm font-medium opacity-90">
                                <div className="flex items-start gap-2">
                                    <MapPin size={14} className="sm:w-4 sm:h-4 text-[#F2529D] shrink-0 mt-0.5" />
                                    <span className="leading-tight">Al Hashar Building, Salah Al Din St, Office 301, Deira, Dubai</span>
                                </div>
                                <p className="ml-5 sm:ml-6 text-[10px] sm:text-xs opacity-70">Next to Crowne Plaza Hotel - Muteena</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-12 p-6 sm:p-10 lg:p-16">
                        {/* WhatsApp CTA */}
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-xl sm:text-2xl font-display text-[#BF9C34] italic font-black">Message Us</h3>
                            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                Connect with us on WhatsApp for quick assistance.
                            </p>
                            <a
                                href="https://wa.me/971529063016"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 sm:py-4 text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] shadow-lg hover:brightness-95 transition-all"
                            >
                                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                                Open WhatsApp
                            </a>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                                +971 52 906 3016
                            </p>
                        </div>

                        {/* Information Section */}
                        <div className="space-y-6 sm:space-y-10">
                            <h3 className="text-xl sm:text-2xl font-display text-[#BF9C34] italic font-black">Contact Info</h3>
                            <div className="space-y-4 sm:space-y-6">
                                <div className="flex items-start gap-4 group">
                                    <div className="p-2.5 rounded-full bg-pink-50 text-[#F2529D] group-hover:bg-[#F2529D] group-hover:text-white transition-colors shrink-0">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="font-display italic text-gray-900 text-sm sm:text-base font-bold">Phone</p>
                                        <p className="text-gray-500 font-medium text-xs sm:text-sm">052 906 3016</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="p-2.5 rounded-full bg-pink-50 text-[#F2529D] group-hover:bg-[#F2529D] group-hover:text-white transition-colors shrink-0">
                                        <Mail size={18} />
                                    </div>
                                    <div>
                                        <p className="font-display italic text-gray-900 text-sm sm:text-base font-bold">Email</p>
                                        <p className="text-gray-500 font-medium text-xs sm:text-sm">mcjalandoni@yahoo.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 group">
                                    <div className="p-2.5 rounded-full bg-pink-50 text-[#F2529D] group-hover:bg-[#F2529D] group-hover:text-white transition-colors shrink-0">
                                        <Clock size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-display italic text-gray-900 text-sm sm:text-base font-bold">Hours</p>
                                        <div className="text-xs sm:text-sm text-gray-500 font-medium space-y-0.5">
                                            <div className="flex justify-between gap-6"><span>Mon:</span> <span className="font-black text-[#F2529D]">OFF</span></div>
                                            <div className="flex justify-between gap-6"><span>Tue - Thu:</span> <span>10 AM - 9 PM</span></div>
                                            <div className="flex justify-between gap-6"><span>Fri - Sun:</span> <span>10 AM - 10 PM</span></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Compact Map Section */}
                    <div className="px-6 sm:px-10 lg:px-16 pb-6 sm:pb-10 lg:pb-16">
                        <a 
                            href="https://share.google/lWLJiTBONnJlR29z7" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block relative rounded-[1.25rem] sm:rounded-[1.75rem] overflow-hidden shadow-md border border-gray-100 bg-[#E5E7EB] h-[200px] sm:h-[250px] group/map"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop" 
                                className="w-full h-full object-cover opacity-30 grayscale mix-blend-multiply transition-transform duration-700 group-hover/map:scale-110" 
                                alt="Map Background"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-[#F2529D] rounded-full animate-ping opacity-20 absolute -inset-0"></div>
                                    <MapPin size={40} className="text-[#F2529D] relative z-10 filter drop-shadow-lg" fill="#F2529D" fillOpacity="0.3" />
                                </div>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-md p-2 sm:p-3 text-center">
                                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-[#F2529D]">View in Google Maps</span>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <div className="contact-footer">
              <Footer />
            </div>
        </div>
    );
};

export default ContactPage;
