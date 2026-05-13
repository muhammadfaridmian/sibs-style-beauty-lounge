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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-36 sm:pt-48 pb-12 sm:pb-16 text-center contact-header">
                <h1 className="text-4xl sm:text-6xl md:text-8xl font-display text-[#BF9C34] italic font-black mb-4 sm:mb-6 leading-none">
                    Contact & Location
                </h1>
                <p className="text-gray-600 text-base sm:text-xl font-body italic leading-relaxed max-w-2xl mx-auto">
                    Connect with the lounge directly on WhatsApp for quick assistance.
                </p>
            </div>

            {/* Main Contact Card Container */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 contact-card">
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 relative">
                    
                    {/* Hero Image Section with Banner */}
                    {/* The banner doubles as the visual anchor and repeats the salon address in one place. */}
                    <div className="relative h-[300px] sm:h-[450px]">
                        <img 
                            src={contactHeroImage}
                            className="w-full h-full object-cover brightness-75"
                            alt="Luxury Spa Lounge"
                        />
                        <div className="absolute bottom-6 left-4 right-4 sm:bottom-12 sm:left-12 sm:right-auto text-white max-w-[calc(100%-2rem)] sm:max-w-none">
                            <h2 className="text-2xl sm:text-4xl md:text-5xl font-display italic font-black mb-3 sm:mb-4 leading-tight">Sibs Style Beauty Lounge</h2>
                            <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-medium opacity-90">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="sm:w-5 sm:h-5 text-[#F2529D] shrink-0" />
                                    <span>Al Hashar Building, Salah Al Din St, Office 301, Deira, Dubai</span>
                                </div>
                                <p className="ml-6 sm:ml-7 text-[10px] sm:text-xs opacity-70">Next to Crowne Plaza Hotel - Muteena</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 p-4 sm:p-8 lg:p-20">
                        {/* WhatsApp CTA */}
                        <div className="space-y-6 sm:space-y-10">
                            <h3 className="text-2xl sm:text-3xl font-display text-[#BF9C34] italic font-black">Message Us on WhatsApp</h3>
                            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                                Tap below to chat with the lounge directly. We usually respond quickly during opening hours.
                            </p>
                            <a
                                href="https://wa.me/971529063016"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 py-4 text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-xl hover:brightness-95 transition-all"
                            >
                                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Open WhatsApp Chat
                            </a>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">
                                WhatsApp: +971 52 906 3016
                            </p>
                        </div>

                        {/* Information & Map Section */}
                        <div className="space-y-10 sm:space-y-16">
                            <div className="space-y-6 sm:space-y-10">
                                <h3 className="text-2xl sm:text-3xl font-display text-[#BF9C34] italic font-black">Contact Information</h3>
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="flex items-start gap-6 group">
                                        <div className="p-3 rounded-full bg-pink-50 text-[#F2529D] group-hover:bg-[#F2529D] group-hover:text-white transition-colors">
                                            <Phone size={24} />
                                        </div>
                                        <div>
                                            <p className="font-display italic text-gray-900 text-xl font-bold">Phone</p>
                                            <p className="text-gray-500 font-medium">052 906 3016</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6 group">
                                        <div className="p-3 rounded-full bg-pink-50 text-[#F2529D] group-hover:bg-[#F2529D] group-hover:text-white transition-colors">
                                            <Mail size={24} />
                                        </div>
                                        <div>
                                            <p className="font-display italic text-gray-900 text-xl font-bold">Email</p>
                                            <p className="text-gray-500 font-medium">mcjalandoni@yahoo.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-6 group">
                                        <div className="p-3 rounded-full bg-pink-50 text-[#F2529D] group-hover:bg-[#F2529D] group-hover:text-white transition-colors">
                                            <Clock size={24} />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-display italic text-gray-900 text-xl font-bold">Opening Hours</p>
                                            <div className="text-sm text-gray-500 font-medium space-y-1">
                                                <div className="flex justify-between gap-8"><span>Mon:</span> <span className="font-black text-[#F2529D]">OFF</span></div>
                                                <div className="flex justify-between gap-8"><span>Tue - Thu:</span> <span>10:00 AM - 9:00 PM</span></div>
                                                <div className="flex justify-between gap-8"><span>Fri - Sun:</span> <span>10:00 AM - 10:00 PM</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Minimal Map UI */}
                            {/* A linked image is lighter than an embedded map and still gives users a clear tap target. */}
                            <a 
                                href="https://share.google/lWLJiTBONnJlR29z7" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block relative rounded-[1.75rem] sm:rounded-[2rem] overflow-hidden shadow-inner border border-gray-100 bg-[#E5E7EB] h-[260px] sm:h-[350px] group/map"
                            >
                                <img 
                                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop" 
                                    className="w-full h-full object-cover opacity-30 grayscale mix-blend-multiply transition-transform duration-700 group-hover/map:scale-110" 
                                    alt="Map Background"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-[#F2529D] rounded-full animate-ping opacity-20 absolute -inset-0"></div>
                                        <MapPin size={48} className="text-[#F2529D] relative z-10 filter drop-shadow-lg" fill="#F2529D" fillOpacity="0.3" />
                                    </div>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-md p-3 sm:p-4 text-center">
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#F2529D]">Click to Open in Google Maps</span>
                                </div>
                            </a>
                        </div>
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
