import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from './components/Footer';
import { ChevronLeft, ChevronRight, Star, Quote, Send, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { getReviews, submitReview, getServices, getStoredAuthToken } from './api/convex-api';
import type { Review, Service } from './api/convex-api';

const TestimonialsPage: React.FC = () => {
  // This page has two jobs: show reviews and let signed-in clients share a new one.
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const testimonialRef = useRef<HTMLDivElement>(null);

  // Form State
  // The form stays controlled so every field can be reset after a successful submission.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    serviceId: '',
    mainQuote: '',
    subQuote1: ''
  });
  const authToken = getStoredAuthToken();

  const loadData = async () => {
    try {
      setIsLoading(true);
      // The review carousel and the submit form both need the latest service list.
      // We fetch both together so the page does not show mismatched testimonial data.
      // Loading both resources in parallel keeps the page snappy without changing the content.
      const [fetchedReviews, fetchedServices] = await Promise.all([
        getReviews(),
        getServices()
      ]);
      setReviews(fetchedReviews);
      setServices(fetchedServices);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();

    const tl = gsap.timeline();
    // Guard animations so missing selectors don't produce console warnings.
    const heading = document.querySelector('.heading-anim');
    const reviewBoxes = gsap.utils.toArray('.review-box-anim');
    if (heading) {
      tl.fromTo(heading,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      );
    }
    if (reviewBoxes.length) {
      tl.fromTo(reviewBoxes,
        { opacity: 0, y: 50, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'expo.out' },
        heading ? '-=0.8' : undefined
      );
    }
  }, []);

  const changeTestimonial = (newIndex: number) => {
    if (reviews.length === 0) return;
    // The card animates out before the next review slides into the same spot.
    // The direction tells the animation which side to leave from.
    // That tiny directional cue keeps the carousel feeling continuous.
    const direction = newIndex > currentIndex ? 1 : -1;
    
    gsap.to(testimonialRef.current, {
      opacity: 0,
      x: -50 * direction,
      duration: 0.4,
      onComplete: () => {
        setCurrentIndex(newIndex);
        gsap.fromTo(testimonialRef.current, 
          { opacity: 0, x: 50 * direction },
          { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }
        );
      }
    });
  };

  // These helpers keep the review carousel looping in both directions.
  // Wrapping around the ends makes the component feel like a proper infinite reel.
  const next = () => changeTestimonial((currentIndex + 1) % reviews.length);
  const prev = () => changeTestimonial((currentIndex - 1 + reviews.length) % reviews.length);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Review submission is protected so the stored client account stays tied to the post.
    const sessionToken = getStoredAuthToken();
    if (!sessionToken) {
      setSubmitError('Please sign in to share a chronicle first.');
      return;
    }

    setIsSubmitting(true);
    try {
      // The selected service name helps moderation staff understand which ritual the story refers to.
      const selectedService = services.find(s => s.id === formData.serviceId);
      // The service lookup is optional, so a general inquiry can still be submitted cleanly.
      await submitReview({
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        mainQuote: formData.mainQuote,
        subQuote1: formData.subQuote1,
        serviceId: formData.serviceId,
        serviceName: selectedService?.name || 'General Inquiry'
      }, sessionToken);
      // A successful post swaps the form for a short thank-you state.
      // The reset clears the controlled fields so the next submission starts clean.
      setSubmitSuccess(true);
      setSubmitError(null);
      setFormData({ name: '', email: '', rating: 5, serviceId: '', mainQuote: '', subQuote1: '' });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='bg-[#FAF9F6] min-h-screen flex items-center justify-center'>
        {/* The spinner is just a simple loading shell while reviews and services arrive. */}
        <div className='w-12 h-12 border-4 border-[#F2529D] border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <div className='bg-[#FAF9F6] min-h-screen text-[#333] font-serif overflow-hidden select-none'>
      {/* Page Header */}
      <div className='max-w-4xl mx-auto px-4 pt-48 pb-24 text-center heading-anim'>
        <h1 className='text-4xl sm:text-5xl md:text-8xl font-display text-[#F2529D] italic font-black mb-8 leading-none tracking-tighter'>Client Chronicles</h1>
        <div className='w-24 h-1 bg-[#BF9C34] mx-auto mb-10'></div>
        <p className='text-gray-500 text-lg md:text-xl font-medium italic tracking-wide'>
          Stories of radiance and transformation from our cherished guests.
        </p>
      </div>

      {/* Testimonial Section */}
      <div className='max-w-7xl mx-auto px-4 py-16 relative flex flex-col items-center justify-center'>
        
        {reviews.length > 0 && (
          <div className='relative w-full flex items-center justify-center mb-24'>
            {/* Navigation Arrows */}
            {/* These arrows let the carousel move without losing the current review's focus. */}
            {/* The card itself stays centered so the reader can focus on one voice at a time. */}
            <button 
              onClick={prev}
              className='absolute -left-4 sm:left-0 lg:left-20 z-10 w-10 h-10 md:w-16 md:h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-[#F2529D] hover:bg-[#F2529D] hover:text-white transition-all hover:scale-110 active:scale-95 group'
            >
              <ChevronLeft className='w-8 h-8 transition-transform group-hover:-translate-x-1' />
            </button>

            <button 
              onClick={next}
              className='absolute -right-4 sm:right-0 lg:right-20 z-10 w-10 h-10 md:w-16 md:h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-[#F2529D] hover:bg-[#F2529D] hover:text-white transition-all hover:scale-110 active:scale-95 group'
            >
              <ChevronRight className='w-8 h-8 transition-transform group-hover:translate-x-1' />
            </button>

            {/* Testimonial Card */}
            <div 
              ref={testimonialRef}
              className='w-full max-w-4xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.08)] p-4 sm:p-8 md:p-20 relative review-box-anim'
            >
              <div className='absolute -top-6 -left-6 text-[#EBE7E2]'>
                <Quote className='w-24 h-24 fill-current opacity-30 transform -rotate-12' />
              </div>

              <div className='text-center space-y-6 sm:space-y-8'>
                {/* Stars */}
                <div className='flex flex-wrap justify-center gap-2 sm:gap-3 text-[#BF9C34] px-4'>
                  {[...Array(reviews[currentIndex]?.rating || 5)].map((_, i) => <Star key={i} className='w-5 h-5 sm:w-6 sm:h-6 fill-current' />)}
                </div>

                {/* Main Quote */}
                    <h2 className='text-base sm:text-xl md:text-3xl font-display italic text-[#333] leading-[1.5] font-bold px-4 sm:px-12 sm:px-16'>
                  {reviews[currentIndex]?.mainQuote}
                </h2>

                {/* Service Badge */}
                {reviews[currentIndex]?.serviceName && (
                  <div className='inline-block px-4 py-1.5 bg-[#F2529D]/10 text-[#F2529D] rounded-full text-sm font-bold tracking-widest uppercase'>
                    {reviews[currentIndex]?.serviceName}
                  </div>
                )}

                {/* Sub Quotes */}
                    <div className='space-y-4 sm:space-y-6 text-gray-500 text-sm sm:text-base md:text-xl font-medium leading-[1.8] max-w-2xl mx-auto px-4 sm:px-12'>
                  <p>{reviews[currentIndex]?.subQuote1}</p>
                  {reviews[currentIndex]?.subQuote2 && <p>{reviews[currentIndex]?.subQuote2}</p>}
                </div>

                {/* Author Info */}
                <div className='pt-8 border-t border-gray-100 mt-8'>
                  <span className='block text-2xl font-display text-[#333] font-black italic tracking-tight'>
                    {reviews[currentIndex]?.name}
                  </span>
                  <span className='block text-[#BF9C34] text-xs font-bold tracking-[0.3em] uppercase mt-2'>
                    {reviews[currentIndex]?.role || 'VERIFIED GUEST'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Your Story Form Section */}
          {/* The sign-in gate keeps the story tied to a verified customer account. */}
          {/* That gate is what prevents anonymous submissions from polluting the testimonial stream. */}
            <div className='w-full max-w-6xl bg-[#0D0D0D] rounded-[2rem] sm:rounded-[4rem] p-4 sm:p-8 md:p-12 lg:p-20 text-white relative overflow-hidden mt-32 border border-white/5 shadow-2xl mx-auto'>
          {/* Ambient Background Elements */}
          <div className='absolute top-0 right-0 w-[40rem] h-[40rem] bg-[#F2529D] opacity-[0.03] blur-[120px] -mr-80 -mt-80'></div>
          <div className='absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-[#BF9C34] opacity-[0.03] blur-[120px] -ml-80 -mb-80'></div>

          <div className='relative z-10 flex flex-col space-y-20'>
            {/* Header Content - Centered & Wide */}
            <div className='max-w-3xl mx-auto text-center space-y-6 sm:space-y-8'>
              <h3 className='text-3xl sm:text-5xl md:text-8xl font-display font-black italic leading-tight tracking-tighter px-2'>
                Share Your <span className='text-[#F2529D]'>Sibs Story</span>
              </h3>
              <p className='text-gray-400 text-base sm:text-lg md:text-2xl font-medium leading-relaxed italic px-2'>
                Your journey toward radiance is our greatest inspiration. Help us maintain our standards of excellence by sharing your experience.
              </p>
            </div>

            {!authToken && (
              <div className='max-w-4xl mx-auto w-full rounded-[2rem] sm:rounded-[3rem] border border-white/10 bg-white/[0.04] px-5 sm:px-8 py-5 sm:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                <div>
                  <p className='text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.35em] text-[#F2529D] mb-2'>Protected review submission</p>
                  <p className='text-sm sm:text-lg text-gray-300 leading-relaxed'>
                    Signing in keeps every chronicle tied to a real client account before it goes to moderation.
                  </p>
                </div>
                <Link
                  to='/auth?redirect=/testimonials'
                  className='inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-[#F2529D] text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] hover:bg-white hover:text-black transition-colors whitespace-nowrap'
                >
                  Sign In or Register
                </Link>
              </div>
            )}

            {/* Main Form Layout - Spacious Grid */}
                  <div className='bg-white/[0.02] rounded-[2rem] sm:rounded-[4rem] p-4 sm:p-6 md:p-10 lg:p-16 border border-white/[0.05] backdrop-blur-sm'>
              {submitSuccess ? (
                <div className='py-32 text-center animate-in fade-in zoom-in duration-700'>
                  <div className='w-32 h-32 bg-[#F2529D] rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(242,82,157,0.3)]'>
                    <CheckCircle2 className='w-16 h-16 text-white' />
                  </div>
                  <h4 className='text-4xl md:text-5xl font-display font-bold italic mb-6'>Thank You, {formData.name}</h4>
                  <p className='text-gray-400 text-xl font-medium'>Your chronicle has been shared with our keepers and will be published shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className='space-y-10 sm:space-y-12 md:space-y-16'>
                  {submitError && (
                    <div className='rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-200 text-sm sm:text-base font-medium leading-relaxed'>
                      {submitError}
                    </div>
                  )}

                  {/* Identity Section */}
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-8 sm:gap-y-10'>
                    <div className='space-y-4'>
                      <label className='text-xs font-black uppercase tracking-[0.3em] text-[#F2529D] ml-2'>Official Identity</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Your Full Name"
                        className='w-full bg-white/[0.03] border-b-2 border-white/10 rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl text-white placeholder-white/40 focus:outline-none focus:border-[#F2529D] focus:bg-white/[0.05] transition-all'
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className='space-y-4'>
                      <label className='text-xs font-black uppercase tracking-[0.3em] text-[#F2529D] ml-2'>Digital Post</label>
                      <input 
                        required
                        type="email" 
                        placeholder="email@example.com"
                        className='w-full bg-white/[0.03] border-b-2 border-white/10 rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl text-white placeholder-white/40 focus:outline-none focus:border-[#F2529D] focus:bg-white/[0.05] transition-all'
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Experience Selection Section */}
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-8 sm:gap-y-10 items-end'>
                    <div className='space-y-4'>
                      <label className='text-xs font-black uppercase tracking-[0.3em] text-[#BF9C34] ml-2'>Selected Ritual</label>
                      <div className='relative'>
                        <select 
                          required
                          className='w-full bg-white/[0.03] border-b-2 border-white/10 rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl text-white appearance-none focus:outline-none focus:border-[#BF9C34] focus:bg-white/[0.05] transition-all'
                          value={formData.serviceId}
                          onChange={(e) => setFormData({...formData, serviceId: e.target.value})}
                        >
                          <option value="" className='bg-[#0D0D0D] text-white/40'>Choose Your Treatment</option>
                          {services.map(s => (
                            <option key={s.id} value={s.id} className='bg-[#0D0D0D]'>{s.name}</option>
                          ))}
                        </select>
                        <div className='absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 pointer-events-none text-[#BF9C34]'>
                          <ChevronRight className='rotate-90 w-5 h-5 sm:w-6 sm:h-6' />
                        </div>
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <label className='text-xs font-black uppercase tracking-[0.3em] text-[#BF9C34] ml-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2'>
                        <span>Satisfaction Rating</span>
                        <span className='text-[#BF9C34] opacity-50 text-[0.65rem] sm:text-xs'>{formData.rating}/5 Stars</span>
                      </label>
                      <div className='flex flex-wrap items-center justify-center gap-2 sm:gap-4 bg-white/[0.03] border-b-2 border-white/10 rounded-2xl px-4 sm:px-8 py-4 sm:py-5'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({...formData, rating: star})}
                            className={`transition-all duration-300 hover:scale-125 ${formData.rating >= star ? 'text-[#BF9C34] drop-shadow-[0_0_8px_rgba(191,156,52,0.4)]' : 'text-white/10'}`}
                          >
                            <Star className={`w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 ${formData.rating >= star ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Narrative Section - Full Width */}
                  <div className='space-y-12 pt-8'>
                    <div className='space-y-4'>
                      <label className='text-xs font-black uppercase tracking-[0.3em] text-gray-500 ml-2'>The Essential Proclamation (Title)</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g., 'An absolute sanctuary of elegance...'"
                        className='w-full bg-white/[0.03] border-b-2 border-white/10 rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-base sm:text-lg md:text-2xl font-display italic text-white placeholder-white/40 focus:outline-none focus:border-white focus:bg-white/[0.05] transition-all'
                        value={formData.mainQuote}
                        onChange={(e) => setFormData({...formData, mainQuote: e.target.value})}
                      />
                    </div>

                    <div className='space-y-4'>
                      <label className='text-xs font-black uppercase tracking-[0.3em] text-gray-500 ml-2'>The Unfolded Chronicle (Details)</label>
                      <textarea 
                        required
                        rows={6}
                        placeholder="Describe the sensations, the service, and the transformation..."
                        className='w-full bg-white/[0.03] border-b-2 border-white/10 rounded-2xl px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 text-base sm:text-lg md:text-xl text-white placeholder-white/40 focus:outline-none focus:border-white focus:bg-white/[0.05] transition-all resize-none leading-relaxed'
                        value={formData.subQuote1}
                        onChange={(e) => setFormData({...formData, subQuote1: e.target.value})}
                      ></textarea>
                    </div>
                  </div>

                  <div className='pt-10'>
                    <button 
                      disabled={isSubmitting}
                      className='group relative w-full overflow-hidden rounded-2xl'
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-[#F2529D] to-[#BF9C34] transition-transform duration-500 group-hover:scale-105'></div>
                      <div className='relative flex items-center justify-center gap-2 sm:gap-4 py-4 sm:py-6 md:py-8 px-4 sm:px-8 md:px-12 text-white font-black italic tracking-[0.15em] sm:tracking-[0.2em] uppercase text-sm sm:text-lg md:text-2xl transition-transform active:scale-95'>
                        {isSubmitting ? (
                          <div className='w-6 h-6 sm:w-8 sm:h-8 border-4 border-white border-t-transparent rounded-full animate-spin'></div>
                        ) : (
                          <>
                            <Send className='w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform' />
                            <span>Immortalize Your Story</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Trust Badges - Wide Layout */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-10 pt-10'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-6 sm:p-8 rounded-[2rem] sm:rounded-3xl bg-white/[0.02] border border-white/5'>
                <div className='w-16 h-16 sm:w-20 sm:h-20 bg-[#F2529D]/10 rounded-full flex items-center justify-center shrink-0'>
                  <Star className='w-8 h-8 sm:w-10 sm:h-10 text-[#F2529D] fill-current' />
                </div>
                <div className='space-y-1 sm:space-y-2'>
                  <h4 className='text-lg sm:text-xl font-bold italic'>Sensory Feedback</h4>
                  <p className='text-gray-500 text-sm sm:text-lg leading-snug'>Help us curate the future of Sibs rituals with your unique perspective.</p>
                </div>
              </div>
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 p-6 sm:p-8 rounded-[2rem] sm:rounded-3xl bg-white/[0.02] border border-white/5'>
                <div className='w-16 h-16 sm:w-20 sm:h-20 bg-[#BF9C34]/10 rounded-full flex items-center justify-center shrink-0'>
                  <CheckCircle2 className='w-8 h-8 sm:w-10 sm:h-10 text-[#BF9C34]' />
                </div>
                <div className='space-y-1 sm:space-y-2'>
                  <h4 className='text-lg sm:text-xl font-bold italic'>Verified Authenticity</h4>
                  <p className='text-gray-500 text-sm sm:text-lg leading-snug'>Every chronicle is reviewed by our artisans to ensure genuine storytelling.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TestimonialsPage;