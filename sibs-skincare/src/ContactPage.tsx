import { useEffect } from 'react';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

const ContactPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
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
            <div className="max-w-4xl mx-auto px-6 pt-48 pb-16 text-center contact-header">
                <h1 className="text-6xl md:text-8xl font-display text-[#BF9C34] italic font-black mb-6 leading-none">
                    Contact & Location
                </h1>
                <p className="text-gray-600 text-xl font-body italic leading-relaxed max-w-2xl mx-auto">
                    We would love to hear from you. Book an appointment or send us your inquiries.
                </p>
            </div>

            {/* Main Contact Card Container */}
            <div className="max-w-6xl mx-auto px-6 contact-card">
                <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 relative">
                    
                    {/* Hero Image Section with Banner */}
                    <div className="relative h-[450px]">
                        <img 
                            src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2000&auto=format&fit=crop" 
                            className="w-full h-full object-cover brightness-75"
                            alt="Luxury Spa Lounge"
                        />
                        <div className="absolute bottom-12 left-12 text-white">
                            <h2 className="text-4xl md:text-5xl font-display italic font-black mb-4">Sibs Style Beauty Lounge</h2>
                            <div className="flex flex-col gap-2 text-sm md:text-base font-medium opacity-90">
                                <div className="flex items-center gap-2">
                                    <MapPin size={20} className="text-[#F2529D]" />
                                    <span>Al Hashar Building, Salah Al Din St, Office 301, Deira, Dubai</span>
                                </div>
                                <p className="ml-7 text-xs opacity-70">Next to Crowne Plaza Hotel - Muteena</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 p-12 lg:p-20">
                        {/* Form Section */}
                        <div className="space-y-10">
                            <h3 className="text-3xl font-display text-[#BF9C34] italic font-black">Send us a Message</h3>
                            <form className="space-y-8" onClick={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name</label>
                                    <input type="text" placeholder="Jane Doe" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:border-[#F2529D] focus:ring-1 focus:ring-[#F2529D] outline-none transition-all placeholder:text-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email Address</label>
                                    <input type="email" placeholder="jane@example.com" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:border-[#F2529D] focus:ring-1 focus:ring-[#F2529D] outline-none transition-all placeholder:text-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                                    <input type="tel" placeholder="052 906 3016" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:border-[#F2529D] focus:ring-1 focus:ring-[#F2529D] outline-none transition-all placeholder:text-gray-300" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Service Interested In</label>
                                    <select className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:border-[#F2529D] outline-none appearance-none">
                                        <option>Hair Styling</option>
                                        <option>Facial Ritual</option>
                                        <option>Dermal Sculpting</option>
                                        <option>Botanical Infusion</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-gray-400">Message</label>
                                    <textarea rows={4} placeholder="How can we help you?" className="w-full px-6 py-4 bg-white border border-gray-200 rounded-xl focus:border-[#F2529D] focus:ring-1 focus:ring-[#F2529D] outline-none transition-all placeholder:text-gray-300 resize-none"></textarea>
                                </div>
                                <button className="w-full py-5 bg-[#F2529D] text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-black transition-all shadow-xl shadow-pink-100 hover:shadow-none translate-y-0 active:scale-95">
                                    SEND MESSAGE
                                </button>
                            </form>
                        </div>

                        {/* Information & Map Section */}
                        <div className="space-y-16">
                            <div className="space-y-10">
                                <h3 className="text-3xl font-display text-[#BF9C34] italic font-black">Contact Information</h3>
                                <div className="space-y-8">
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
                            <a 
                                href="https://share.google/lWLJiTBONnJlR29z7" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block relative rounded-[2rem] overflow-hidden shadow-inner border border-gray-100 bg-[#E5E7EB] h-[350px] group/map"
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
                                <div className="absolute inset-x-0 bottom-0 bg-white/80 backdrop-blur-md p-4 text-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#F2529D]">Click to Open in Google Maps</span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specialized Footer */}
            <footer className="mt-32 pt-24 pb-12 bg-[#0A0E1A] text-white px-6 contact-footer">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-24 items-start">
                    <div className="space-y-8">
                        <span className="text-4xl font-display italic text-[#F2529D] font-black">Sibs Style</span>
                        <p className="text-gray-400 font-body italic text-lg leading-relaxed">
                            Elevating your natural beauty with premium services in a luxurious, relaxing environment.
                        </p>
                    </div>
                    
                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Quick Links</h4>
                        <div className="flex flex-col gap-4 text-sm font-medium text-gray-400">
                            <Link to="/" className="hover:text-[#F2529D] transition-colors decoration-none">Home</Link>
                            <Link to="/booking" className="hover:text-[#F2529D] transition-colors decoration-none">Treatments</Link>
                            <Link to="/artisans" className="hover:text-[#F2529D] transition-colors decoration-none">Artisans</Link>
                            <Link to="/offers" className="hover:text-[#F2529D] transition-colors decoration-none">Exclusive Selection</Link>
                            <Link to="/testimonials" className="hover:text-[#F2529D] transition-colors decoration-none">Chronicles</Link>
                            <Link to="/contact" className="text-[#F2529D] decoration-none">Contact & Location</Link>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#BF9C34]">Follow Us</h4>
                        <div className="flex gap-10">
                            <Link to="#" className="text-gray-400 hover:text-[#F2529D] transition-transform hover:scale-125">
                                <span className="font-display italic text-2xl">Fb</span>
                            </Link>
                            <Link to="#" className="text-gray-400 hover:text-[#F2529D] transition-transform hover:scale-125">
                                <span className="font-display italic text-2xl">Tw</span>
                            </Link>
                            <Link to="#" className="text-gray-400 hover:text-[#F2529D] transition-transform hover:scale-125">
                                <span className="font-display italic text-2xl">Yt</span>
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto border-t border-white/5 mt-24 pt-12 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">
                    <p>© 2024 SIBS STYLE BEAUTY LOUNGE. ALL RIGHTS RESERVED.</p>
                    <div className="flex gap-8">
                        <span>Privacy Policy</span>
                        <span>Terms of Luxury</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ContactPage;
