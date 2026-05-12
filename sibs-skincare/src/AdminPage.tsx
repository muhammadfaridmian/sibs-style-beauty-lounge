import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock3,
  ChevronRight,
  ImagePlus,
  LogOut,
  MessageSquare,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Upload,
  XCircle,
} from 'lucide-react';
import {
  clearStoredAuthSession,
  completeAppointment,
  deleteAppointment,
  deleteReview,
  getAdminAppointments,
  getAdminReviews,
  getCurrentAuthUser,
  getStoredAuthToken,
  moderateReview,
  updateAppointmentStatus,
  uploadGalleryItem,
  type AdminAppointment,
  type AdminReview,
  type AuthUser,
} from './api/convex-api';
import OffersManager from './components/OffersManager';

const statusTone: Record<AdminAppointment['status'], string> = {
  pending: 'bg-[#BF9C34]/10 text-[#BF9C34] border-[#BF9C34]/20',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  // The dashboard starts by reading the stored token so it can decide what to show.
  const authToken = getStoredAuthToken();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [recentlyCompletedBookings, setRecentlyCompletedBookings] = useState<(AdminAppointment & { completedAt: number })[]>([]);
  const [recentlyApprovedReviews, setRecentlyApprovedReviews] = useState<(AdminReview & { approvedAt: number })[]>([]);
  const [pendingAction, setPendingAction] = useState<
    | { type: 'booking'; appointment: AdminAppointment }
    | { type: 'review'; review: AdminReview }
    | null
  >(null);
  const [removingAppointmentIds, setRemovingAppointmentIds] = useState<string[]>([]);
  const [removingReviewIds, setRemovingReviewIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: '',
    caption: '',
    altText: '',
    imageUrl: '',
    featured: false,
  });

  const loadDashboard = async () => {
    if (!authToken) {
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      // First we confirm the current user, then we ask Convex for the admin lists.
      // That avoids loading the dashboard data for someone who only has a normal account.
      const user = await getCurrentAuthUser(authToken);
      setCurrentUser(user);

      if (!user || user.role !== 'admin') {
        // A valid customer session still should not reveal the admin queues.
        setAppointments([]);
        setReviews([]);
        return;
      }

      const [appointmentData, reviewData] = await Promise.all([
        getAdminAppointments(authToken),
        getAdminReviews(authToken),
      ]);

      setAppointments(appointmentData);
      setReviews(reviewData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load the admin dashboard.');
      setAppointments([]);
      setReviews([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadDashboard();
  }, []);

  // Auto-remove completed bookings and approved reviews after 60 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const sixtyMinutes = 60 * 60 * 1000;

      // Auto-remove completed bookings that are older than 60 minutes
      setRecentlyCompletedBookings((prev) => {
        return prev.filter((booking) => now - booking.completedAt < sixtyMinutes);
      });

      // Auto-remove approved reviews that are older than 60 minutes
      setRecentlyApprovedReviews((prev) => {
        return prev.filter((review) => now - review.approvedAt < sixtyMinutes);
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshDashboard = async () => {
    // Manual refresh just repeats the same secure load flow.
    setIsRefreshing(true);
    await loadDashboard();
  };

  const handleLogout = () => {
    // Sign out clears the session and sends the admin back to the auth page.
    clearStoredAuthSession();
    navigate('/auth', { replace: true });
  };

  const handleAppointmentStatus = async (appointmentId: string, status: AdminAppointment['status']) => {
    if (!authToken) {
      return;
    }

    setActionMessage(null);

    if (status === 'cancelled') {
      setRemovingAppointmentIds((currentIds) => [...currentIds, appointmentId]);
    }

    try {
      if (status === 'completed') {
        // Move to completedAppointments table instead of just updating status
        const appointmentToComplete = appointments.find((a) => a.id === appointmentId);
        await completeAppointment({ appointmentId, authToken });
        setActionMessage(`Completed booking ${appointmentId.slice(0, 6).toUpperCase()}`);
        
        // Add to recently completed bookings with timestamp
        if (appointmentToComplete) {
          setRecentlyCompletedBookings((prev) => [...prev, { ...appointmentToComplete, completedAt: Date.now() }]);
        }
      } else {
        // For other statuses, update the status normally
        await updateAppointmentStatus({ appointmentId, status, authToken });
        setActionMessage(`Updated booking ${appointmentId.slice(0, 6).toUpperCase()}`);
      }

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );

      if (status === 'cancelled') {
        window.setTimeout(() => {
          setAppointments((currentAppointments) =>
            currentAppointments.filter((appointment) => appointment.id !== appointmentId)
          );
          setRemovingAppointmentIds((currentIds) => currentIds.filter((id) => id !== appointmentId));
        }, 420);
      }

      if (status === 'completed') {
        // Remove from active list after a short delay
        window.setTimeout(() => {
          setAppointments((currentAppointments) =>
            currentAppointments.filter((appointment) => appointment.id !== appointmentId)
          );
        }, 420);
      }

      await refreshDashboard();
    } catch (updateError) {
      if (status === 'cancelled') {
        setRemovingAppointmentIds((currentIds) => currentIds.filter((id) => id !== appointmentId));
      }
      setError(updateError instanceof Error ? updateError.message : 'Unable to update this booking.');
    }
  };

  const handleReviewModeration = async (review: AdminReview, isApproved: boolean) => {
    if (!authToken) {
      return;
    }

    setActionMessage(null);
    try {
      // Review moderation controls whether a testimonial is visible to visitors.
      // The featured flag lets the team promote a review without changing the text.
      await moderateReview({
        reviewId: review.id,
        isApproved,
        featured: review.featured,
        sortOrder: review.sortOrder,
        authToken,
      });
      setActionMessage(`Updated review ${review.name}`);

      setReviews((currentReviews) =>
        currentReviews.map((currentReview) =>
          currentReview.id === review.id
            ? { ...currentReview, isApproved }
            : currentReview
        )
      );

      // If review was just approved, add to recently approved reviews with timestamp
      if (isApproved) {
        setRecentlyApprovedReviews((prev) => [...prev, { ...review, isApproved, approvedAt: Date.now() }]);
      }

      await refreshDashboard();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update this review.');
    }
  };

  const handleDeleteBookingConfirm = async () => {
    if (!pendingAction || pendingAction.type !== 'booking') {
      return;
    }

    const appointmentId = pendingAction.appointment.id;
    setPendingAction(null);
    setRemovingAppointmentIds((currentIds) => [...currentIds, appointmentId]);

    try {
      // Hard delete the appointment from the database
      await deleteAppointment({ appointmentId, authToken });

      window.setTimeout(() => {
        setAppointments((currentAppointments) =>
          currentAppointments.filter((appointment) => appointment.id !== appointmentId)
        );
        setRecentlyCompletedBookings((currentBookings) =>
          currentBookings.filter((booking) => booking.id !== appointmentId)
        );
        setRemovingAppointmentIds((currentIds) => currentIds.filter((id) => id !== appointmentId));
      }, 420);

      setActionMessage(`Deleted booking ${appointmentId.slice(0, 6).toUpperCase()}`);
    } catch (deleteError) {
      setRemovingAppointmentIds((currentIds) => currentIds.filter((id) => id !== appointmentId));
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this booking.');
    }
  };

  const handleDeleteReviewConfirm = async () => {
    if (!pendingAction || pendingAction.type !== 'review') {
      return;
    }

    const reviewId = pendingAction.review.id;
    const reviewName = pendingAction.review.name;
    setPendingAction(null);
    setRemovingReviewIds((currentIds) => [...currentIds, reviewId]);

    try {
      // Hard delete the review from the database
      await deleteReview({ reviewId, authToken });

      window.setTimeout(() => {
        setReviews((currentReviews) => currentReviews.filter((review) => review.id !== reviewId));
        setRecentlyApprovedReviews((currentReviews) =>
          currentReviews.filter((review) => review.id !== reviewId)
        );
        setRemovingReviewIds((currentIds) => currentIds.filter((id) => id !== reviewId));
      }, 420);

      setActionMessage(`Deleted review ${reviewName}`);
    } catch (deleteError) {
      setRemovingReviewIds((currentIds) => currentIds.filter((id) => id !== reviewId));
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this review.');
    }
  };

  const activeAppointments = appointments.filter((appointment) => appointment.status !== 'completed' && appointment.status !== 'cancelled');
  const pendingReviews = reviews.filter((review) => !review.isApproved);

  const handleGalleryUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authToken) {
      return;
    }

    setIsUploading(true);
    setActionMessage(null);
    try {
      // New gallery items are created from the form fields above.
      // This action keeps the gallery and the homepage visual feed in sync.
      await uploadGalleryItem({
        title: galleryForm.title,
        category: galleryForm.category,
        caption: galleryForm.caption,
        altText: galleryForm.altText || galleryForm.title,
        imageUrl: galleryForm.imageUrl,
        featured: galleryForm.featured,
        sortOrder: Date.now(),
        authToken,
      });

      setActionMessage(`Uploaded ${galleryForm.title}`);
      setGalleryForm({
        title: '',
        category: '',
        caption: '',
        altText: '',
        imageUrl: '',
        featured: false,
      });
      await refreshDashboard();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload the gallery item.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#F2529D] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!authToken) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#333] px-4 py-16 sm:py-20 flex items-center justify-center">
        <div className="max-w-2xl w-full rounded-[2rem] sm:rounded-[3rem] bg-white shadow-[0_30px_90px_-30px_rgba(0,0,0,0.2)] border border-white p-6 sm:p-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F2529D]/10 text-[#F2529D] mx-auto">
            <Shield size={28} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-display italic font-black text-[#0A0E1A]">Admin access required</h1>
            <p className="text-gray-500 text-sm sm:text-lg leading-relaxed">
              Sign in with the lounge admin account to open the bookings, reviews, and gallery tools.
            </p>
          </div>
          <Link
            to="/auth?redirect=/admin"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-black px-6 sm:px-8 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors"
          >
            Go to sign in
            <ArrowButtonIcon />
          </Link>
          <Link
            to="/"
            className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-400 hover:text-[#F2529D] transition-colors"
          >
            Back to the site
          </Link>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#333] px-4 py-16 sm:py-20 flex items-center justify-center">
        <div className="max-w-2xl w-full rounded-[2rem] sm:rounded-[3rem] bg-white shadow-[0_30px_90px_-30px_rgba(0,0,0,0.2)] border border-white p-6 sm:p-10 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#BF9C34]/10 text-[#BF9C34] mx-auto">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-display italic font-black text-[#0A0E1A]">Admin account only</h1>
            <p className="text-gray-500 text-sm sm:text-lg leading-relaxed">
              The session is valid, but it does not have admin privileges yet.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-3 rounded-full bg-black px-6 sm:px-8 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors"
          >
            Sign out
            <ArrowButtonIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#333] overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-3xl sm:text-4xl font-display italic font-black text-[#F2529D]">
              Sibs Style
            </Link>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Admin dashboard</p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={refreshDashboard}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 sm:px-5 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-500 hover:text-[#F2529D] transition-colors"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 sm:px-5 py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 space-y-8 sm:space-y-12 lg:space-y-16">
        <section className="mt-8 sm:mt-6 lg:mt-4 rounded-[2rem] sm:rounded-[3rem] bg-[#0A0E1A] text-white p-6 sm:p-8 lg:p-12 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(191,156,52,0.12),transparent_24%)]"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 items-center">
            <div className="space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
                <Sparkles size={16} className="text-[#F2529D]" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50">Protected operations</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display italic font-black leading-[0.95]">
                Welcome back, <span className="text-[#F2529D]">{currentUser.fullName}</span>
              </h1>
              <p className="max-w-3xl text-sm sm:text-lg lg:text-xl text-white/70 leading-relaxed">
                This dashboard is connected to the current Convex deployment and keeps the bookings, reviews, and gallery tools behind admin login.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="Appointments" value={appointments.length} accent="#F2529D" />
              <MetricCard label="Reviews" value={reviews.length} accent="#BF9C34" />
              <MetricCard label="Role" value={currentUser.role.toUpperCase()} accent="#FFFFFF" />
              <MetricCard label="Session" value={currentUser.isActive ? 'Active' : 'Inactive'} accent="#A7F3D0" />
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 sm:px-6 py-4 text-sm sm:text-base text-red-700">
            {error}
          </div>
        )}

        {actionMessage && (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 sm:px-6 py-4 text-sm sm:text-base text-emerald-700">
            {actionMessage}
          </div>
        )}

        <section className="space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-[#F2529D]" size={20} />
            <h2 className="text-3xl sm:text-4xl font-display italic font-black text-[#0A0E1A]">Bookings queue</h2>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {activeAppointments.length === 0 ? (
              <div className="lg:col-span-2 rounded-[2rem] bg-white border border-gray-100 p-8 sm:p-12 text-center text-gray-400">
                No bookings yet.
              </div>
            ) : (
              activeAppointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className={`rounded-[2rem] bg-white border border-gray-100 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.2)] p-5 sm:p-6 space-y-5 transition-all duration-500 ${
                    removingAppointmentIds.includes(appointment.id) ? 'opacity-0 translate-y-2 scale-[0.98]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]">{appointment.serviceName}</p>
                      <h3 className="text-2xl font-display italic font-black text-[#0A0E1A]">{appointment.guestName}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{appointment.guestEmail} Â· {appointment.guestPhone}</p>
                    </div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] ${statusTone[appointment.status]}`}>
                      {appointment.status}
                    </span>
                  </div>

                  <div className="grid gap-3 text-sm text-gray-500 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-[#FAF9F6] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Schedule</p>
                      <p className="mt-2 font-semibold text-gray-800">{appointment.appointmentDate} Â· {appointment.appointmentTimeLabel}</p>
                      <p className="mt-1 text-xs text-gray-500">{appointment.startTimeLabel} to {appointment.endTimeLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#FAF9F6] p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Assigned stylist</p>
                      <p className="mt-2 font-semibold text-gray-800">{appointment.assignedStylistName ?? 'Unassigned'}</p>
                      <p className="mt-1 text-xs text-gray-500">{appointment.location}</p>
                    </div>
                  </div>

                  {appointment.notes && (
                    <div className="rounded-[1.25rem] bg-black/5 p-4 text-sm text-gray-600 leading-relaxed">
                      {appointment.notes}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    {appointment.status !== 'confirmed' && (
                      <button
                        onClick={() => handleAppointmentStatus(appointment.id, 'confirmed')}
                        className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors"
                      >
                        <CheckCircle2 size={14} />
                        Confirm
                      </button>
                    )}
                    {appointment.status !== 'completed' && (
                      <button
                        onClick={() => handleAppointmentStatus(appointment.id, 'completed')}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-gray-500 hover:text-emerald-700 transition-colors"
                      >
                        <Clock3 size={14} />
                        Complete
                      </button>
                    )}
                    {appointment.status !== 'cancelled' && (
                      <button
                        onClick={() => setPendingAction({ type: 'booking', appointment })}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-gray-500 hover:text-red-700 transition-colors"
                      >
                        <XCircle size={14} />
                        Cancel
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600" size={20} />
            <h2 className="text-3xl sm:text-4xl font-display italic font-black text-[#0A0E1A]">Completed bookings</h2>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {recentlyCompletedBookings.length === 0 ? (
              <div className="lg:col-span-2 rounded-[2rem] bg-white border border-gray-100 p-8 sm:p-12 text-center text-gray-400">
                No completed bookings yet.
              </div>
            ) : (
              recentlyCompletedBookings.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-[2rem] border border-emerald-200 bg-emerald-50 shadow-[0_20px_60px_-25px_rgba(16,185,129,0.16)] p-5 sm:p-6 space-y-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600">{appointment.serviceName}</p>
                      <h3 className="text-2xl font-display italic font-black text-emerald-950">{appointment.guestName}</h3>
                      <p className="text-sm text-emerald-900/70 leading-relaxed">{appointment.guestEmail} Â· {appointment.guestPhone}</p>
                    </div>
                    <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700">
                      completed
                    </span>
                  </div>

                  <div className="grid gap-3 text-sm text-emerald-900/70 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">Schedule</p>
                      <p className="mt-2 font-semibold text-emerald-950">{appointment.appointmentDate} Â· {appointment.appointmentTimeLabel}</p>
                      <p className="mt-1 text-xs text-emerald-700/70">{appointment.startTimeLabel} to {appointment.endTimeLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">Assigned stylist</p>
                      <p className="mt-2 font-semibold text-emerald-950">{appointment.assignedStylistName ?? 'Unassigned'}</p>
                      <p className="mt-1 text-xs text-emerald-700/70">{appointment.location}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setRecentlyCompletedBookings((prev) => prev.filter((a) => a.id !== appointment.id))}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600 hover:bg-emerald-100 transition-colors"
                  >
                    <XCircle size={14} />
                    Remove
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-[#F2529D]" size={20} />
            <h2 className="text-3xl sm:text-4xl font-display italic font-black text-[#0A0E1A]">Review moderation</h2>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {pendingReviews.length === 0 ? (
              <div className="lg:col-span-2 rounded-[2rem] bg-white border border-gray-100 p-8 sm:p-12 text-center text-gray-400">
                No pending reviews yet.
              </div>
            ) : (
              pendingReviews.map((review) => (
                <article
                  key={review.id}
                  className={`rounded-[2rem] bg-white border border-gray-100 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.2)] p-5 sm:p-6 space-y-4 transition-all duration-500 ${
                    removingReviewIds.includes(review.id) ? 'opacity-0 translate-y-2 scale-[0.98]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]">{review.serviceName ?? 'General'}</p>
                      <h3 className="text-2xl font-display italic font-black text-[#0A0E1A]">{review.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{review.role} Â· {review.email}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-[#BF9C34]/10 px-3 py-2 text-[#BF9C34]">
                      <Star size={14} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-[0.35em]">{review.rating}/5</span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic">{review.mainQuote}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{review.subQuote1}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{review.subQuote2}</p>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] ${review.isApproved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                        {review.isApproved ? 'Approved' : 'Pending'}
                      </span>
                      {review.featured && (
                        <span className="inline-flex rounded-full border border-[#F2529D]/20 bg-[#F2529D]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D]">
                          Featured
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">{review.avatarUrl ? 'Has avatar' : 'No avatar'}</span>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {!review.isApproved ? (
                      <button
                        onClick={() => handleReviewModeration(review, true)}
                        className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors"
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>
                    ) : null}
                    {!review.isApproved && (
                      <button
                        onClick={() => setPendingAction({ type: 'review', review })}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <XCircle size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-[#BF9C34]" size={20} />
            <h2 className="text-3xl sm:text-4xl font-display italic font-black text-[#0A0E1A]">Approved chronicles</h2>
          </div>

          <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
            {recentlyApprovedReviews.length === 0 ? (
              <div className="lg:col-span-2 rounded-[2rem] bg-white border border-gray-100 p-8 sm:p-12 text-center text-gray-400">
                No approved reviews yet.
              </div>
            ) : (
              recentlyApprovedReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[2rem] border border-[#F2529D]/15 bg-[#FFF7FB] shadow-[0_20px_60px_-25px_rgba(242,82,157,0.14)] p-5 sm:p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]">{review.serviceName ?? 'General'}</p>
                      <h3 className="text-2xl font-display italic font-black text-[#0A0E1A]">{review.name}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{review.role} Â· {review.email}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-[#BF9C34]/10 px-3 py-2 text-[#BF9C34]">
                      <Star size={14} fill="currentColor" />
                      <span className="text-[10px] font-black uppercase tracking-[0.35em]">{review.rating}/5</span>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed italic">{review.mainQuote}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{review.subQuote1}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{review.subQuote2}</p>

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700">
                      Approved
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">{review.avatarUrl ? 'Has avatar' : 'No avatar'}</span>
                  </div>

                  <button
                    onClick={() => setRecentlyApprovedReviews((prev) => prev.filter((r) => r.id !== review.id))}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#F2529D]/30 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D] hover:bg-[#FFF0F8] transition-colors"
                  >
                    <XCircle size={14} />
                    Remove
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        <OffersManager authToken={authToken} />

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] sm:rounded-[3rem] bg-[#0A0E1A] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden border border-white/10 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(191,156,52,0.12),transparent_24%)]"></div>
            <div className="relative z-10 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
                <Upload size={16} className="text-[#BF9C34]" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50">Gallery upload</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display italic font-black leading-tight">
                Add a new editorial frame
              </h2>
              <p className="text-sm sm:text-lg text-white/65 leading-relaxed">
                Upload by image URL to keep the media pipeline simple while the lounge grows.
              </p>
            </div>
          </div>

          <form onSubmit={handleGalleryUpload} className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-gray-100 p-6 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3">
              <ImagePlus className="text-[#F2529D]" size={20} />
              <h3 className="text-2xl sm:text-3xl font-display italic font-black text-[#0A0E1A]">Gallery uploader</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Title</span>
                <input
                  required
                  value={galleryForm.title}
                  onChange={(event) => setGalleryForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-4 text-base focus:outline-none focus:border-[#F2529D]"
                  placeholder="Radiance Bloom"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Category</span>
                <input
                  required
                  value={galleryForm.category}
                  onChange={(event) => setGalleryForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-4 text-base focus:outline-none focus:border-[#F2529D]"
                  placeholder="Product Edit"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Caption</span>
              <textarea
                value={galleryForm.caption}
                onChange={(event) => setGalleryForm((prev) => ({ ...prev, caption: event.target.value }))}
                rows={4}
                className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-4 text-base focus:outline-none focus:border-[#F2529D] resize-none"
                placeholder="A small editorial note about the frame"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Alt text</span>
                <input
                  value={galleryForm.altText}
                  onChange={(event) => setGalleryForm((prev) => ({ ...prev, altText: event.target.value }))}
                  className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-4 text-base focus:outline-none focus:border-[#F2529D]"
                  placeholder="Luxury serum bottle"
                />
              </label>
              <label className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Image URL</span>
                <input
                  value={galleryForm.imageUrl}
                  onChange={(event) => setGalleryForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-4 text-base focus:outline-none focus:border-[#F2529D]"
                  placeholder="https://..."
                />
              </label>
            </div>

            <label className="flex items-center gap-3 rounded-[1.25rem] bg-[#FAF9F6] border border-gray-200 px-4 py-4 text-sm font-medium text-gray-600">
              <input
                type="checkbox"
                checked={galleryForm.featured}
                onChange={(event) => setGalleryForm((prev) => ({ ...prev, featured: event.target.checked }))}
                className="w-4 h-4 accent-[#F2529D]"
              />
              Mark as featured
            </label>

            <button
              disabled={isUploading}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors disabled:opacity-70"
            >
              {isUploading ? 'Uploading...' : 'Upload frame'}
              <ArrowButtonIcon />
            </button>
          </form>
        </section>
      </main>

      {pendingAction ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0A0E1A] p-6 sm:p-8 text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)]">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-[#F2529D]">Confirm action</p>
            <h3 className="mt-3 text-2xl sm:text-3xl font-display italic font-black leading-tight">
              {pendingAction.type === 'booking' ? 'Are you sure you want to delete this booking?' : 'Are you sure you want to delete this review?'}
            </h3>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-white/70">
              {pendingAction.type === 'booking'
                ? 'This removes the booking from the dashboard after the fade animation and keeps the Convex status in sync.'
                : 'This removes the rating from moderation and clears it from the dashboard after the fade animation.'}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setPendingAction(null)}
                className="flex-1 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-white/10 transition-colors"
              >
                No
              </button>
              <button
                onClick={pendingAction.type === 'booking' ? handleDeleteBookingConfirm : handleDeleteReviewConfirm}
                className="flex-1 rounded-full bg-[#F2529D] px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#ff6fb0] transition-colors"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const MetricCard = ({ label, value, accent }: { label: string; value: number | string; accent: string }) => (
  <div className="rounded-[1.75rem] bg-white/5 border border-white/10 p-5 sm:p-6">
    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/45">{label}</p>
    <p className="mt-3 text-2xl sm:text-3xl font-display italic font-black" style={{ color: accent }}>
      {value}
    </p>
  </div>
);

const ArrowButtonIcon = () => <ChevronRight size={14} />;

export default AdminPage;



