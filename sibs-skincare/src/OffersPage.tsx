import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import gsap from 'gsap';

const OffersPage = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Page entry transition
        gsap.fromTo(containerRef.current, 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
        );

        // Header animation
        gsap.fromTo('.offers-header',
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out', delay: 0.3 }
        );
    }, []);

    useEffect(() => {
        if (isPanelOpen) {
            document.body.style.overflow = 'hidden';
            
            // Refined Panel Entrance
            const tl = gsap.timeline();
            tl.fromTo('.panel-overlay', 
                { opacity: 0 }, 
                { opacity: 1, duration: 0.8, ease: 'power2.inOut' }
            )
            .fromTo('.selection-panel', 
                { y: 100, opacity: 0, scale: 0.95 }, 
                { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'expo.out' }, 
                '-=0.4'
            )
            .fromTo('.offer-card-anim', 
                { y: 40, opacity: 0 }, 
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
                '-=0.6'
            );
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isPanelOpen]);

    const featuredOffers = [
        {
            id: 1,
            title: 'Glow Membership',
            description: 'Join our monthly membership for continuous care, bespoke treatments, and exclusive member-only perks designed for year-round radiance.',
            image: 'https://i.pinimg.com/originals/6e/48/e1/6e48e1bfeebc6ddd41b2e45286fa60fc.jpg',
            tag: 'MOST POPULAR'
        },
        {
            id: 2,
            title: 'Seasonal Rituals',
            description: "Experience transformative treatments carefully customized for the current season's unique environmental challenges and skin needs.",
            image: 'https://i.pinimg.com/736x/3f/83/d4/3f83d4777ddd2ebd201ce376c53af924.jpg',
            tag: 'LIMITED TIME'
        },
        {
            id: 3,
            title: 'Bundle & Save',
            description: 'Combine multiple signature services and take home our premium retail products for exceptional exclusive savings.',
            image: 'https://i.pinimg.com/1200x/66/7f/71/667f717825dc54f377aa4612c9439609.jpg',
            tag: 'BEST VALUE'
        }
    ];

    const allOffers = [
        {
            id: '01',
            image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600',
            title: 'First-Time Glow',
            detail: '20% off your first signature facial session.',
            code: 'GLOW20'
        },
        {
            id: '02',
            image: 'https://images.unsplash.com/photo-1583445013765-d3c204c99586?w=600',
            title: 'Birthday Bliss',
            detail: 'Complimentary LED therapy during your birth month.',
            code: 'BDAYSKIN'
        },
        {
            id: '03',
            image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
            title: 'Flash Sale Friday',
            detail: 'Book any peel on Friday for special savings.',
            code: 'FRIDAYFLASH'
        },
        {
            id: '04',
            image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600',
            title: 'Elite Referral',
            detail: 'Refer a friend and both get a credit.',
            code: 'ELITEREF'
        },
        {
            id: '05',
            image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
            title: 'Product Pairing',
            detail: 'Buy 2 serums, get a custom cleanser free.',
            code: 'SERUMBOOST'
        },
        {
            id: '06',
            image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600',
            title: 'Bridal Suite',
            detail: '15% off packages for bridal parties of 4+.',
            code: 'SIBSBRIDE'
        },
        {
            id: '07',
            image: 'https://images.unsplash.com/photo-1564278047291-5322c032c900?w=600',
            title: 'Early Bird',
            detail: '10% off sessions booked before 10 AM.',
            code: 'EARLYGLOW'
        }
    ];

    return (
        <div ref={containerRef} className='bg-[#FAF9F6] min-h-screen pt-48 opacity-100'>
            <div className='max-w-7xl mx-auto px-6'>
                <div className='text-center mb-24 offers-header'>
                    <h1 className='text-7xl md:text-9xl font-display text-[#F2529D] italic font-black mb-16 leading-none tracking-tighter'>
                        Offers & Promotions
                    </h1>
                    
                    <div 
                        className='relative w-full h-[400px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl cursor-pointer group'
                        onClick={() => setIsPanelOpen(true)}
                    >
                        <img 
                            src='https://i.pinimg.com/1200x/65/e8/1c/65e81c0a1ab979bd8b005b5cb3cebb13.jpg' 
                            className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 brightness-90' 
                            alt='Hero Banner' 
                        />
                        <div className='absolute inset-0 flex flex-col items-center justify-center text-white bg-black/10 group-hover:bg-black/20 transition-all font-display italic'>
                            <span className='text-xl uppercase tracking-[0.5em] mb-4 font-black italic'>Discover Your Ritual</span>
                            <h3 className='text-4xl md:text-6xl font-black mb-6 italic'>Click to view 7 Limited Exclusives</h3>
                            <div className='p-4 border-2 border-white rounded-full group-hover:rotate-45 transition-transform shadow-lg'>
                                <ArrowRight size={32} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='text-center mb-32'>
                    <span className='text-lg font-black text-[#BF9C34] tracking-[0.4em] mb-4 block underline decoration-gray-200 underline-offset-8'>CURRENT SPECIALS</span>
                    <h2 className='text-6xl md:text-8xl font-display text-[#F2529D] italic font-black leading-none tracking-tighter'>Seasonal Rituals</h2>
                    
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-12 mt-20'>
                        {featuredOffers.map((offer) => (
                            <div key={offer.id} className='bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 group transition-all hover:scale-[1.02]'>
                                <div className='aspect-square overflow-hidden relative'>
                                    <img src={offer.image} className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110' alt={offer.title} />
                                    <div className='absolute top-6 left-6 bg-[#F2529D] text-white px-4 py-2 rounded-full text-[8px] font-black tracking-widest'>
                                        {offer.tag}
                                    </div>
                                </div>
                                <div className='p-10 space-y-6 text-center'>
                                    <h3 className='text-4xl font-display italic font-black text-gray-900 leading-tight'>{offer.title}</h3>
                                    <p className='text-gray-500 font-medium leading-relaxed'>{offer.description}</p>
                                    <Link to='/booking' className='block w-full py-5 bg-[#F2529D] text-white text-[14px] font-black tracking-[0.4em] rounded-xl hover:bg-black transition-all shadow-xl'>CLAIM OFFER</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isPanelOpen && (
                <div 
                    className='fixed inset-0 z-[100] bg-black/40 backdrop-blur-3xl flex items-center justify-center p-4 panel-overlay'
                >
                    {/* Animated background particles for luxury feel */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#F2529D] rounded-full blur-[180px] animate-pulse"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#BF9C34] rounded-full blur-[180px] animate-pulse delay-1000"></div>
                    </div>

                    <div 
                        className='bg-white w-[95%] max-w-7xl h-[85vh] rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col selection-panel'
                        style={{ position: 'fixed', top: '7%', left: '50%', transform: 'translateX(-50%)' }}
                    >
                        <div className='flex-none flex justify-between items-center px-8 md:px-12 py-5 md:py-6 border-b border-gray-100 bg-white relative z-10'>
                            <div className="flex items-center gap-4">
                                <div className="w-1 h-8 bg-[#F2529D] rounded-full"></div>
                                <h2 className='text-4xl md:text-5xl font-display italic font-black text-black tracking-tighter'>Exclusive Selection</h2>
                            </div>
                            <button 
                                onClick={() => {
                                    const tl = gsap.timeline();
                                    tl.to('.selection-panel', { y: 100, opacity: 0, duration: 0.5, ease: 'power3.in' })
                                      .to('.panel-overlay', { opacity: 0, duration: 0.5, onComplete: () => setIsPanelOpen(false) }, '-=0.3');
                                }} 
                                className='bg-black text-white p-3 md:p-4 rounded-full hover:rotate-90 transition-all duration-500 shadow-xl hover:bg-[#F2529D] group'
                            >
                                <X className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110" />
                            </button>
                        </div>
                        
                        <div className='flex-1 overflow-y-auto px-8 md:px-12 py-10 md:py-16 bg-white custom-scrollbar'>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12'>
                                {allOffers.map((offer, idx) => (
                                    <div key={idx} className='offer-card-anim group cursor-pointer bg-[#FAF9F6] p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-gray-100 hover:bg-black transition-all duration-700 hover:shadow-2xl hover:-translate-y-2'>
                                        <div className='aspect-square rounded-[2rem] overflow-hidden shadow-2xl mb-8 group-hover:scale-105 transition-all duration-700 relative'>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                                            <img src={offer.image} className='w-full h-full object-cover transition-all duration-1000' alt={offer.title} />
                                        </div>
                                        <div className='space-y-4'>
                                            <div className='flex justify-between items-start'>
                                                <h4 className='text-3xl font-display italic font-black text-gray-900 group-hover:text-[#F2529D] mb-2 uppercase tracking-tight transition-colors duration-500 line-clamp-2'>{offer.title}</h4>
                                                <span className='px-4 py-1 bg-[#F2529D] text-white text-[10px] font-black tracking-widest rounded-full shrink-0 uppercase'>{offer.id}</span>
                                            </div>
                                            <p className='text-base text-gray-500 group-hover:text-white/60 mb-6 font-medium leading-relaxed transition-colors duration-500 line-clamp-3'>{offer.detail}</p>
                                            <div className='flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-white/10'>
                                                <div className='flex flex-col'>
                                                    <span className='text-[10px] font-black tracking-widest text-gray-400 group-hover:text-[#F2529D] uppercase mb-1'>Discount Code</span>
                                                    <span className='text-xl font-black text-black group-hover:text-white transition-colors duration-500'>{offer.code}</span>
                                                </div>
                                                <div className='w-12 h-12 rounded-2xl bg-white group-hover:bg-[#F2529D] flex items-center justify-center transition-all duration-500 shadow-sm'>
                                                    <div className='w-2 h-2 rounded-full bg-[#F2529D] group-hover:bg-white' />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className='px-8 md:px-12 py-8 md:py-10 bg-white border-t border-gray-100 text-center z-[110] relative'>
                            <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                            <Link 
                                to='/booking' 
                                onClick={() => {
                                    const tl = gsap.timeline();
                                    tl.to('.selection-panel', { y: 100, opacity: 0, duration: 0.5, ease: 'power3.in' })
                                      .to('.panel-overlay', { opacity: 0, duration: 0.5, onComplete: () => setIsPanelOpen(false) }, '-=0.3');
                                }} 
                                className='inline-block bg-[#F2529D] text-white px-12 md:px-24 py-5 md:py-6 rounded-2xl text-[12px] font-black uppercase tracking-[0.5em] hover:bg-black hover:scale-105 transition-all duration-500 shadow-2xl transform active:scale-95'
                            >
                                Secure Your Selection
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            <footer className='bg-black py-20 px-6 text-center'>
                <p className='text-[#F2529D] font-display italic font-black text-5xl mb-8 tracking-tighter underline underline-offset-[16px]'>Sibs Style</p>
                <p className='text-[15px] font-black text-gray-500 tracking-[0.6em] uppercase'>© 2024 SIBS STYLE BEAUTY LOUNGE. ALL RIGHTS RESERVED.</p>
                <div className='mt-8 flex justify-center gap-12 text-gray-700 text-[15px] font-black tracking-widest'>
                    <span>PRIVACY</span>
                    <span>TERMS</span>
                    <span>LUXURY ETHOS</span>
                </div>
            </footer>
        </div>
    );
};

export default OffersPage;
