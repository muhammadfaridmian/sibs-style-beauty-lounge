import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight, Mail as MailIcon, Phone, MapPin, Calendar as CalendarIcon, User, ArrowRight, AlertCircle, Sparkles, Info } from 'lucide-react';
import gsap from 'gsap';
import { getServices, getAvailability, createAppointment, formatPrice, formatDuration, getStoredAuthToken, type Service } from './api/convex-api';

const BookingPage: React.FC = () => {
  // ==================== STATE ====================
  // These state values keep the booking flow step by step and easy to follow.
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [viewingService, setViewingService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: 'Downtown Sibs Lounge',
    info: ''
  });
  const containerRef = React.useRef<HTMLDivElement>(null);
  // The calendar header uses the current month as the visual anchor for the booking flow.
  const currentMonth = new Date();
  const authToken = getStoredAuthToken();

  // ==================== LOAD SERVICES ====================
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoading(true);
        // The service cards come from Convex so the booking page always matches the live menu.
        const data = await getServices();
        setServices(data);
      } catch (error) {
        console.error("Failed to load services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadServices();
  }, []);

  // ==================== LOAD AVAILABILITY ====================
  useEffect(() => {
    if (!selectedService) return;

    const loadAvailability = async () => {
      // We ask Convex for open slots after the service and date are chosen.
      try {
        setIsLoadingAvailability(true);
        const dateStr = selectedDate.toISOString().split('T')[0];
        const data = await getAvailability(dateStr, selectedService);
        setAvailability(data);
      } catch (error) {
        console.error("Failed to load availability:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    loadAvailability();
  }, [selectedService, selectedDate]);

  // ==================== ANIMATIONS ====================
  useEffect(() => {
    window.scrollTo(0, 0);
    const tl = gsap.timeline();
    
    gsap.set(containerRef.current, { opacity: 0 });

    tl.to(containerRef.current, { 
      opacity: 1, 
      duration: 1.2, 
      ease: 'power2.inOut',
      delay: 0.1
    })
    .fromTo('.booking-header', 
      { opacity: 0, scale: 1.1 }, 
      { opacity: 1, scale: 1, duration: 1.5, ease: 'expo.out' },
      '-=0.8'
    )
    .fromTo('.step-card', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }, 
      '-=1'
    )
    .fromTo('.experience-section', 
      { opacity: 0, x: -50 }, 
      { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }, 
      '-=0.5'
    );
  }, []);

  // ==================== HANDLERS ====================
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    // Booking is protected so every appointment stays tied to a real account.
    const sessionToken = getStoredAuthToken();
    if (!sessionToken) {
      setSubmitError("Please sign in to book a ritual first.");
      return;
    }

    if (!selectedService || !selectedTime) {
      setSubmitError("Please select a service and time slot first.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // The selected service is used here to build the final appointment payload.
      const service = services.find(s => s.id === selectedService);
      if (!service) {
        throw new Error("Service not found");
      }

      const appointmentData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        serviceId: selectedService,
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: selectedTime,
        location: formData.location,
        info: formData.info,
      };

      const result = await createAppointment(appointmentData, sessionToken);
      if (result) {
        alert(`✨ Booking Confirmed! ✨\n\nYour appointment for ${service.name} has been booked!\nThank you for choosing Sibs Style Beauty Lounge.`);
        setFormData({ fullName: '', email: '', phone: '', location: 'Downtown Sibs Lounge', info: '' });
        setSelectedService(null);
        setSelectedTime(null);
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      setSubmitError(error instanceof Error ? error.message : "Failed to create appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== DATA ====================
  const activeServiceData = services.find(s => s.id === viewingService);
  // Availability only shows the slots that Convex marked as open for the selected day.
  const timeSlots = availability?.slots?.filter((slot: any) => slot.available) || [];

  // ==================== RENDER ====================
  return (
    <div ref={containerRef} className="bg-[#FAF9F6] min-h-screen text-[#333] font-serif overflow-x-hidden opacity-100">
      {/* Service Detail Overlay Panel */}
      {viewingService && activeServiceData && (
        // The overlay lets a visitor inspect a treatment before they commit to booking it.
        <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center px-2 sm:px-4 py-4 overflow-y-auto">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" 
            onClick={() => setViewingService(null)}
          ></div>
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative z-10 animate-in zoom-in-95 slide-in-from-bottom-20 duration-700 ease-out border-4 sm:border-[1rem] border-white">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative h-[260px] sm:h-[320px] md:h-full overflow-hidden">
                <img 
                  src={activeServiceData.imageUrl}
                  alt={activeServiceData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-8 md:p-12">
                   <div className="flex items-center space-x-3 bg-[#F2529D] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full w-fit mb-3 sm:mb-4">
                      <Clock size={16} className="sm:w-5 sm:h-5" />
                      <span className="text-[0.65rem] sm:text-sm font-black tracking-[0.25em] sm:tracking-widest uppercase whitespace-nowrap">{formatDuration(activeServiceData.durationMinutes)}</span>
                   </div>
                   <h2 className="text-2xl sm:text-4xl md:text-5xl font-display italic text-white font-black leading-tight max-w-[90%]">{activeServiceData.name}</h2>
                </div>
              </div>
              <div className="p-5 sm:p-8 md:p-20 flex flex-col relative">
                <button 
                  onClick={() => setViewingService(null)}
                  className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all group"
                >
                  <ChevronLeft className="rotate-180 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <div className="mb-8 sm:mb-12 pt-10 sm:pt-0">
                  <span className="text-[0.65rem] sm:text-xs font-black text-[#BF9C34] tracking-[0.3em] sm:tracking-[0.5em] uppercase mb-3 sm:mb-4 block">Service Ritual</span>
                  <div className="h-1 w-16 sm:w-24 bg-[#BF9C34] mb-6 sm:mb-12"></div>
                  <p className="text-base sm:text-xl md:text-2xl text-gray-800 leading-[1.6] font-medium italic mb-6 sm:mb-10">
                    "{activeServiceData.shortDescription}"
                  </p>
                  <p className="text-sm sm:text-lg text-gray-600 leading-relaxed mb-8 sm:mb-12">
                    {activeServiceData.fullDescription}
                  </p>
                </div>

                <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t-2 border-gray-50 pt-6 sm:pt-10">
                  <div className="flex flex-col">
                    <span className="text-[0.65rem] sm:text-xs font-black text-gray-400 tracking-widest uppercase mb-1">Price Investment</span>
                    <span className="text-3xl sm:text-5xl font-display italic text-[#F2529D] font-black">{formatPrice(activeServiceData.priceCents)}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedService(viewingService);
                      setViewingService(null);
                    }}
                    className="bg-black text-white w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 rounded-[1.5rem] sm:rounded-[2rem] text-xs sm:text-sm font-black uppercase tracking-[0.25em] sm:tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    SELECT RITUAL
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-[700px] w-full overflow-hidden booking-header">
        <img 
          src="https://i.pinimg.com/1200x/8b/cf/ba/8bcfba4e073d6a55ddd55680b7d283d2.jpg" 
          alt="Luxury Skincare" 
          className="w-full h-full object-cover brightness-[0.7]"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-8xl font-display text-white mb-9 drop-shadow-xl font-bold">Curate Your Glow</h1>
          <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-full border border-white/20">
            <p className="text-[#F2529D] font-display text-2xl md:text-4xl italic drop-shadow-lg font-bold leading-tight">Bespoke beauty services tailored for you</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20">
        
        {/* The Sibs Experience Section */}
        <div className="mb-40 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center experience-section">
          <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] group border-[2rem] border-white">
            <img 
              src="https://plus.unsplash.com/premium_photo-1681364365252-387c05c06c40?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
              alt="Sibs Experience" 
              className="w-full h-[540px] object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          </div>
          <div className="space-y-10">
            <h2 className="text-5xl md:text-6xl font-display italic text-[#F2529D] font-black mb-8 leading-none tracking-tighter">The Sibs Experience</h2>
            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-black max-w-xl">
              Every visit is a curated journey through texture, scent, and scientific precision.
            </p>
            <div className="grid grid-cols-1 gap-8">
              <div className="p-8 md:p-10 bg-white rounded-[3rem] shadow-xl border-l-[10px] border-[#BF9C34] group hover:scale-[1.02] transition-all duration-500">
                <h4 className="text-3xl md:text-4xl font-display text-[#BF9C34] italic font-black mb-4">Sustainable</h4>
                <p className="text-base md:text-lg text-gray-700 font-semibold leading-relaxed">Eco-conscious packaging and 100% ethically sourced ingredients.</p>
              </div>
              <div className="p-8 md:p-10 bg-white rounded-[3rem] shadow-xl border-l-[10px] border-[#F2529D] group hover:scale-[1.02] transition-all duration-500">
                <h4 className="text-3xl md:text-4xl font-display text-[#F2529D] italic font-black mb-4">Artisanal</h4>
                <p className="text-base md:text-lg text-gray-700 font-semibold leading-relaxed">Hand-mixed serums prepared moments before your service.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Registry */}
        <div className="flex flex-col gap-24">
          
          {!authToken && (
            // Signed-out visitors can browse everything, but the final booking still needs a session.
            <div className="rounded-[2rem] sm:rounded-[3rem] border border-[#F2529D]/10 bg-white/85 p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.35em] text-[#F2529D]">Protected booking</p>
                <p className="text-sm sm:text-lg text-gray-700 font-medium leading-relaxed max-w-3xl">
                  Booking now requires a signed in account so your appointment can be tied to the right customer record.
                </p>
              </div>
              <Link
                to="/auth?redirect=/booking"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-black text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] hover:bg-[#F2529D] transition-colors whitespace-nowrap"
              >
                Sign In or Register
              </Link>
            </div>
          )}

          {/* Step 1: Services */}
          <section className="bg-white p-4 sm:p-6 md:p-20 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-50 step-card relative overflow-hidden group/card">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2529D]/5 rounded-full blur-[100px] -mr-48 -mt-48 transition-colors duration-1000 group-hover/card:bg-[#BF9C34]/5"></div>
            
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 relative z-10">
              <div className="flex flex-col md:flex-row md:items-baseline space-y-2 md:space-y-0 space-x-0 md:space-x-8">
                <span className="text-3xl sm:text-4xl md:text-9xl font-display text-[#F2529D]/10 font-black leading-none">01</span>
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.2em] text-gray-900 mb-3 md:mb-4">SERVICES</h2>
                  <p className="text-[#BF9C34] font-display italic text-2xl sm:text-3xl md:text-4xl font-bold">Choose your ritual</p>
                </div>
              </div>
              <div className="h-1 w-full md:w-64 bg-gradient-to-r from-[#BF9C34] to-transparent hidden md:block mb-6"></div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg font-semibold">Loading services...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 sm:gap-8 md:gap-12 relative z-10 max-w-full sm:max-w-[95%] mx-auto">
                {services.map((service) => (
                  <div 
                    key={service.id} 
                    onClick={() => {
                      // Clicking a card both highlights it and opens the service detail overlay.
                      setSelectedService(service.id);
                      setViewingService(service.id);
                    }}
                    className={`group cursor-pointer transition-all duration-700 p-4 sm:p-6 md:p-16 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] border-4 relative overflow-hidden flex flex-col justify-between h-auto ${
                      selectedService === service.id 
                      ? 'bg-black border-black text-white scale-[1.02] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.5)] z-20' 
                      : 'bg-white border-white hover:border-[#F2529D]/20 hover:translate-y-[-10px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6 sm:gap-8 mb-8 sm:mb-10">
                      <div className="space-y-3 sm:space-y-4 w-full sm:max-w-[75%]">
                        <span className={`text-[0.65rem] sm:text-[0.75rem] md:text-[0.85rem] font-black tracking-[0.35em] sm:tracking-[0.5em] md:tracking-[0.6em] uppercase transition-colors duration-500 ${selectedService === service.id ? 'text-[#F2529D]' : 'text-[#BF9C34]'}`}>
                          Treatment Ritual 0{service.sortOrder}
                        </span>
                        <h3 className={`text-2xl sm:text-3xl md:text-5xl font-display italic font-black leading-[1.1] transition-colors duration-500 ${selectedService === service.id ? 'text-white' : 'text-gray-900 group-hover:text-[#F2529D]'}`}>
                          {service.name}
                        </h3>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className={`text-2xl sm:text-3xl md:text-5xl font-black transition-colors duration-500 ${selectedService === service.id ? 'text-white' : 'text-[#333]'}`}>
                          {formatPrice(service.priceCents).split(' ')[0]}
                        </span>
                        <span className={`text-[0.65rem] sm:text-sm font-black tracking-widest ${selectedService === service.id ? 'text-[#F2529D]' : 'text-[#BF9C34]'}`}>
                           AED
                        </span>
                      </div>
                    </div>

                    <div className={`h-1 w-20 sm:w-24 bg-gradient-to-r mb-8 sm:mb-10 transition-all duration-700 ${selectedService === service.id ? 'from-[#F2529D] to-transparent' : 'from-[#BF9C34]/20 to-transparent group-hover:w-48 group-hover:from-[#F2529D]'}`}></div>

                    <p className={`text-base sm:text-xl md:text-3xl leading-relaxed mb-8 sm:mb-12 font-bold italic transition-colors duration-500  ${selectedService === service.id ? 'text-white/90' : 'text-gray-700'}`}>
                      "{service.shortDescription}"
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-auto">
                      <div className={`flex items-center space-x-3 sm:space-x-6 px-4 sm:px-6 md:px-10 py-3 sm:py-5 md:py-6 rounded-full transition-all duration-700 ${
                        selectedService === service.id ? 'bg-[#F2529D] text-white shadow-lg' : 'bg-[#FAF9F6] text-gray-700 border-2 border-gray-100 group-hover:shadow-md'
                      }`}>
                        <Clock size={20} className={selectedService === service.id ? "animate-pulse" : ""} />
                        <span className="text-[0.65rem] sm:text-xs md:text-lg font-black tracking-[0.18em] sm:tracking-[0.25em] md:tracking-[0.3em] uppercase">{formatDuration(service.durationMinutes)}</span>
                      </div>
                      
                      <div className={`flex items-center gap-3 sm:gap-6 group-hover:translate-x-2 transition-transform duration-500 ${selectedService === service.id ? 'text-[#F2529D]' : 'text-gray-400'}`}>
                        <span className="text-[0.6rem] sm:text-[0.8rem] font-black uppercase tracking-[0.2em] sm:tracking-widest">Select Treatment</span>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ${selectedService === service.id ? 'bg-white shadow-xl' : 'bg-white border-2 border-gray-50'}`}>
                          <ArrowRight size={20} className={selectedService === service.id ? 'text-black' : 'text-gray-200'} />
                        </div>
                      </div>
                    </div>

                    {/* Decorative Background Element */}
                    <span className={`hidden sm:block absolute -right-4 -bottom-4 sm:-right-8 sm:-bottom-8 text-[5rem] sm:text-[8rem] md:text-[12rem] font-display font-black opacity-[0.02] italic pointer-events-none transition-all duration-1000 ${selectedService === service.id ? 'opacity-[0.08] scale-110 -rotate-12' : 'group-hover:opacity-[0.05] group-hover:rotate-6'}`}>
                      0{service.sortOrder}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-24">
            {/* Step 2: Availability */}
            <div className="bg-white p-4 sm:p-6 md:p-24 rounded-[1.75rem] sm:rounded-[2.5rem] md:rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-50 step-card relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[50%] bg-gradient-to-b from-[#FAF9F6] to-transparent opacity-50"></div>
              
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 relative z-10">
                <div className="flex flex-col md:flex-row md:items-baseline space-y-2 md:space-y-0 space-x-0 md:space-x-8">
                  <span className="text-3xl sm:text-5xl md:text-9xl font-display text-[#BF9C34]/20 font-black leading-none">02</span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[0.08em] sm:tracking-[0.15em] md:tracking-[0.2em] text-gray-900 mb-2 border-b-4 border-[#BF9C34]/30 pb-1 sm:pb-2 inline-block leading-tight">AVAILABILITY</h2>
                    <p className="text-[#F2529D] font-display italic text-base sm:text-xl md:text-3xl font-bold">Secure your sanctuary</p>
                  </div>
                </div>
                <div className="h-1 w-full md:w-64 bg-gradient-to-r from-[#BF9C34] to-transparent hidden md:block mb-6"></div>
              </div>
              
              {!selectedService ? (
                <div className="text-center py-20 relative z-10">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl">
                    <Sparkles className="w-10 h-10 text-gray-300 animate-pulse" />
                  </div>
                    <p className="text-gray-400 text-base sm:text-2xl font-black italic tracking-[0.2em] sm:tracking-widest uppercase px-4">Select a Ritual Excellence first</p>
                </div>
              ) : (
                <div className="flex flex-col gap-24 relative z-10">
                  <div className={`absolute inset-0 z-20 flex items-center justify-center rounded-[2rem] sm:rounded-[3rem] md:rounded-[5rem] bg-white/75 pointer-events-none transition-none ${isLoadingAvailability ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="text-center space-y-4 px-4">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 border-4 border-[#F2529D]/20 border-t-[#F2529D] rounded-full animate-spin mx-auto"></div>
                      <p className="text-[#F2529D] text-xs sm:text-sm md:text-base font-black tracking-[0.25em] sm:tracking-[0.4em] uppercase">Updating availability</p>
                    </div>
                  </div>
                  {/* Calendar Excellence - FULL WIDTH */}
                    <div className="bg-white/60 p-4 sm:p-8 md:p-24 rounded-[2rem] sm:rounded-[3rem] md:rounded-[5rem] border-8 border-white shadow-2xl backdrop-blur-xl group hover:shadow-[0_60px_100px_-30px_rgba(191,156,52,0.15)] transition-all duration-700 w-full">
                      <div className="flex flex-col md:flex-row justify-between items-center mb-12 sm:mb-16 md:mb-24 px-4 sm:px-8 gap-6 sm:gap-8">
                        <div className="flex items-center gap-4 sm:gap-10">
                          <div className="p-4 sm:p-8 bg-[#BF9C34] rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl">
                            <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                        </div>
                        <div>
                            <span className="text-[0.65rem] sm:text-[1rem] font-black text-[#BF9C34] uppercase tracking-[0.4em] sm:tracking-[0.8em] mb-2 block">Ritual Cycle Selection</span>
                            <span className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tight text-[#333]">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-[#FAF9F6] px-10 py-5 rounded-full border-2 border-white shadow-inner">
                        <div className="w-3 h-3 rounded-full bg-black"></div>
                          <span className="text-sm font-black uppercase tracking-widest text-gray-400">Selected Date:</span>
                          <span className="text-xl font-black text-black">{selectedDate.getDate()}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-x-1 sm:gap-x-2 md:gap-x-4 gap-y-4 sm:gap-y-8 md:gap-y-12 text-center w-full">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                        <span key={i} className="text-[0.55rem] sm:text-[0.8rem] md:text-[0.95rem] font-black text-gray-900 tracking-[0.12em] sm:tracking-[0.2em] pb-4 sm:pb-8 border-b-2 border-gray-100">{day}</span>
                      ))}
                      {/* Blank spaces for Sunday/Monday/Tuesday start */}
                      {[0, 1, 2].map(i => <div key={`blank-${i}`} className="h-12 sm:h-24"></div>)}
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((date) => {
                        const isSelected = date === selectedDate.getDate();
                        const isAvailable = date >= new Date().getDate();
                        
                        return (
                          <div 
                            key={date} 
                            onPointerDown={() => isAvailable && setIsLoadingAvailability(true)}
                            onClick={() => isAvailable && setSelectedDate(new Date(2026, 3, date))}
                            className={`text-base sm:text-xl md:text-3xl font-black h-12 sm:h-16 md:h-24 flex items-center justify-center rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] transition-colors duration-200 relative cursor-pointer group/date ${
                              isSelected 
                              ? 'text-white' 
                              : isAvailable 
                                ? 'text-gray-800 hover:bg-[#F2529D]/5 md:hover:scale-105' 
                                : 'text-gray-100 pointer-events-none'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute inset-x-0 h-full bg-black rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] shadow-2xl z-0"></div>
                            )}
                            <span className="relative z-10">
                              {date}
                            </span>
                            {!isSelected && isAvailable && (
                               <div className="absolute bottom-1 sm:bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-[#BF9C34]/30 rounded-full group-hover/date:bg-[#BF9C34] transition-colors duration-200"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slots Excellence - FULL WIDTH */}
                  <div className="space-y-12 w-full">
                    <div className="bg-white/60 p-4 sm:p-8 rounded-[2rem] sm:rounded-[4rem] border-8 border-white shadow-2xl backdrop-blur-xl">
                      <div className="flex flex-col md:flex-row items-center justify-between mb-10 sm:mb-16 gap-4 sm:gap-8 border-b-4 border-gray-50 pb-8 sm:pb-12">
                         <h4 className="text-[0.6rem] sm:text-[0.8rem] font-black tracking-[0.35em] sm:tracking-[0.8em] text-gray-400 uppercase flex items-center text-center md:text-left">
                          <Clock className="w-6 h-6 sm:w-10 sm:h-10 mr-3 sm:mr-8 text-[#BF9C34]" />SELECT RITUAL TIME
                        </h4>
                        <div className="flex items-center gap-3 sm:gap-6 px-4 sm:px-10 py-3 sm:py-4 bg-white rounded-full shadow-lg border-2 border-[#F2529D]/20">
                           <div className="w-4 h-4 rounded-full bg-[#F2529D] animate-ping"></div>
                           <span className="text-[0.55rem] sm:text-[0.7rem] font-bold text-[#F2529D] tracking-[0.25em] sm:tracking-[0.4em] uppercase text-center">Specialized Availability</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-10">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot: any) => (
                            <button 
                              key={slot.timeLabel} 
                              onClick={() => setSelectedTime(slot.timeLabel)}
                              className={`group relative py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-8 transition-all duration-700 rounded-[2rem] sm:rounded-[3rem] border-4 flex flex-col items-center justify-center gap-2 sm:gap-4 ${
                                selectedTime === slot.timeLabel
                                ? 'bg-[#F2529D] border-[#F2529D] text-white shadow-[0_40px_80px_-20px_rgba(242,82,157,0.4)] scale-110 z-20' 
                                : 'bg-white border-white text-gray-900 hover:border-[#F2529D]/20 hover:shadow-2xl hover:-translate-y-2'
                              }`}
                            >
                              <span className={`text-[0.55rem] sm:text-[0.7rem] font-black tracking-widest uppercase transition-colors duration-500 ${selectedTime === slot.timeLabel ? 'text-white/70' : 'text-[#BF9C34]'}`}>
                                {slot.timeLabel.split(' ')[1]}
                              </span>
                              <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter">{slot.timeLabel.split(' ')[0]}</span>
                              {selectedTime === slot.timeLabel && (
                                <div className="absolute top-3 sm:top-6 right-3 sm:right-6">
                                   <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                                </div>
                              )}
                            </button>
                          ))
                        ) : (
                          // When there are no open times, the UI explains why instead of leaving the grid empty.
                          <div className="col-span-full py-16 sm:py-32 text-center bg-gray-50/50 rounded-[2rem] sm:rounded-[5rem] border-8 border-white border-dashed">
                            <p className="text-gray-300 text-base sm:text-3xl font-black italic tracking-[0.2em] sm:tracking-widest uppercase px-4">No available ritual slots</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-8 md:p-20 rounded-[2rem] sm:rounded-[4rem] border-8 border-white shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#F2529D]/3 rounded-bl-full blur-[120px] -mr-96 -mt-96"></div>
                      <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-10 md:gap-16 relative z-10 w-full text-center md:text-left">
                        <div className="p-5 sm:p-10 bg-black rounded-[2rem] sm:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-[#F2529D]/30">
                          <Info className="w-10 h-10 sm:w-16 sm:h-16 text-[#F2529D]" />
                        </div>
                        <div className="flex-1 space-y-4 px-2">
                          <h4 className="text-[0.55rem] sm:text-[0.8rem] font-bold text-gray-400 uppercase tracking-[0.35em] sm:tracking-[0.8em]">Essential Ritual Preparation</h4>
                          <div className="flex flex-col md:flex-row md:items-baseline gap-3 sm:gap-6 justify-center md:justify-start">
                            <p className="text-[#333] text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter">
                              {formatDuration(services.find(s => s.id === selectedService)?.durationMinutes || 0)}
                            </p>
                            <span className="text-base sm:text-xl font-display italic text-[#F2529D] font-black tracking-widest">Total Ritual Time</span>
                          </div>
                          <p className="text-base sm:text-xl text-gray-400 font-medium leading-relaxed max-w-4xl">
                            Our studio will be curated and prepared 15 minutes prior to your arrival. Please arrive on time to undergo our full sensory sequence without rush.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Details */}
            <div className="bg-[#FAF9F6] p-4 sm:p-8 md:p-32 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] shadow-[inset_0_2px_10px_rgba(0,0,0,0.03)] border-2 border-white step-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#BF9C34]/5 rounded-bl-full blur-[100px]"></div>
              
              <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-24 relative z-10">
                <div className="flex flex-col md:flex-row md:items-baseline space-y-2 md:space-y-0 space-x-0 md:space-x-10">
                  <span className="text-5xl sm:text-7xl md:text-9xl font-display text-[#333]/10 font-black leading-none">03</span>
                  <div>
                    <h2 className="text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-[0.08em] sm:tracking-[0.1em] text-[#333] border-b-4 sm:border-b-8 border-white pb-2 sm:pb-3 inline-block leading-tight">YOUR DETAILS</h2>
                    <p className="text-[#F2529D] font-display italic text-base sm:text-xl md:text-4xl font-bold mt-2">The final touch</p>
                  </div>
                </div>
                <div className="h-1 w-full md:w-48 bg-white hidden md:block mb-8"></div>
              </div>
              
              <form className="space-y-10 sm:space-y-12 md:space-y-16 relative z-10" onSubmit={handleBooking}>
                {submitError && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mt-1 flex-shrink-0" />
                    <p className="text-red-800 font-semibold">{submitError}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-20">
                  <div className="space-y-4 sm:space-y-8 group">
                    <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1.25rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] md:tracking-[0.6em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-3 sm:mr-4 md:mr-6" />FULL NAME
                    </label>
                    <input 
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder="e.g. Seraphina Styles" 
                      className="w-full bg-white px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] text-base sm:text-lg md:text-2xl font-black text-gray-900 border-4 sm:border-6 md:border-8 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-2xl group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] placeholder:text-gray-200" 
                    />
                  </div>

                  <div className="space-y-4 sm:space-y-8 group">
                    <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1.25rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] md:tracking-[0.6em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                      <MailIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-3 sm:mr-4 md:mr-6" />EMAIL ADDRESS
                    </label>
                    <input 
                      required
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="glow@sibsstyle.com" 
                      className="w-full bg-white px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] text-base sm:text-lg md:text-2xl font-black text-gray-900 border-4 sm:border-6 md:border-8 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-2xl group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] placeholder:text-gray-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-20">
                  <div className="space-y-4 sm:space-y-8 group">
                    <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1.25rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] md:tracking-[0.6em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-3 sm:mr-4 md:mr-6" />PHONE NUMBER
                    </label>
                    <input 
                      required
                      name="phone"
                      type="tel" 
                      value={formData.phone}
                      onChange={handleFormChange}
                      placeholder="+971 50 000 0000" 
                      className="w-full bg-white px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] text-base sm:text-lg md:text-2xl font-black text-gray-900 border-4 sm:border-6 md:border-8 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-2xl group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] placeholder:text-gray-200"
                    />
                  </div>

                  <div className="space-y-4 sm:space-y-8 group">
                    <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1.25rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] md:tracking-[0.6em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-3 sm:mr-4 md:mr-6" />LOUNGE LOCATION
                    </label>
                    <div className="relative">
                      <select 
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        className="w-full bg-white px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] text-base sm:text-lg md:text-2xl font-black text-gray-900 border-4 sm:border-6 md:border-8 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-2xl appearance-none cursor-pointer group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]"
                      >
                        <option>Dubai, Sibs Main Lounge</option>
                        <option>Deira Wellness Center</option>
                        <option>Marina Studio Lounge</option>
                      </select>
                      <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 pointer-events-none text-[#BF9C34]"><ChevronRight className="rotate-90 w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" /></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-8 group">
                  <label className="text-[0.7rem] sm:text-[0.85rem] md:text-[1.25rem] font-black text-[#BF9C34] flex items-center tracking-[0.3em] sm:tracking-[0.45em] md:tracking-[0.6em] uppercase transition-colors group-focus-within:text-[#F2529D]">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-3 sm:mr-4 md:mr-6" />ADDITIONAL NOTES
                  </label>
                  <textarea 
                    rows={6} 
                    name="info"
                    value={formData.info}
                    onChange={handleFormChange}
                    placeholder="Describe your skin goals or any ritual preferences..." 
                    className="w-full bg-white px-4 sm:px-6 md:px-12 py-4 sm:py-6 md:py-10 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[4rem] text-base sm:text-lg md:text-2xl font-medium text-gray-900 border-4 sm:border-6 md:border-8 border-white focus:border-[#F2529D]/20 outline-none transition-all shadow-2xl resize-none group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] leading-relaxed placeholder:text-gray-200"
                  />
                </div>

                <div className="pt-10 sm:pt-16 md:pt-24 flex flex-col items-center gap-4 sm:gap-6 md:gap-10 bg-white/40 p-4 sm:p-8 md:p-16 rounded-[2rem] md:rounded-[4rem] border-8 border-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#F2529D]/5 to-transparent"></div>
                  
                  <div className="flex flex-col items-center space-y-2 relative z-10">
                    {/* The summary restates the chosen ritual so the final confirmation is obvious. */}
                    <span className="text-[0.55rem] sm:text-[0.65rem] font-black text-gray-400 tracking-[0.5em] sm:tracking-[0.8em] uppercase">RITUAL INVESTMENT</span>
                    <p className="text-[#333] font-black text-lg sm:text-xl md:text-2xl italic tracking-tighter text-center px-4">
                      {selectedService ? services.find(s => s.id === selectedService)?.name : 'Awaiting Selection'}
                    </p>
                    <span className="text-4xl sm:text-6xl md:text-7xl font-display italic text-[#F2529D] font-black drop-shadow-lg leading-none pt-2 sm:pt-4">
                      {selectedService ? formatPrice(services.find(s => s.id === selectedService)?.priceCents || 0) : '$0'}
                    </span>
                  </div>

                  <div className="relative z-10 w-full flex justify-center">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-black hover:bg-[#F2529D] disabled:bg-gray-400 text-white px-6 sm:px-10 md:px-16 py-4 sm:py-6 md:py-8 rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] text-xs sm:text-sm md:text-lg font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] shadow-xl flex items-center gap-3 sm:gap-4 md:gap-6 transition-all hover:scale-[1.05] active:scale-[0.95] disabled:cursor-not-allowed group border-4 border-black hover:border-[#F2529D]"
                    >
                      {isSubmitting ? "INITIATING..." : "CONFIRM RITUAL"} <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 transition-transform group-hover:translate-x-2" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-[#555]">
          <div>
            <h3 className="text-3xl font-display italic font-bold text-[#F2529D]">Sibs Style</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mt-4">© 2024 SIBS STYLE BEAUTY LOUNGE.</p>
          </div>
          <div className="flex space-x-12 text-[10px] font-black uppercase tracking-widest text-gray-400 mt-10 md:mt-0">
            <a href="#" className="hover:text-[#F2529D] transition-colors">PRIVACY POLICY</a>
            <a href="#" className="hover:text-[#F2529D] transition-colors">TERMS OF SERVICE</a>
            <a href="#" className="hover:text-[#F2529D] transition-colors">CONTACT</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
