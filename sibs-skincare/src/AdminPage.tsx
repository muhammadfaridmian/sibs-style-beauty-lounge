import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Calendar, CheckCircle2, Clock3, ChevronRight,
  ImagePlus, LogOut, MessageSquare, RefreshCw, Shield, Sparkles,
  Star, Upload, XCircle, LayoutDashboard, Tag, Package,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
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
  createCollection,
  updateCollection,
  API_BASE,
  type AdminAppointment,
  type AdminReview,
  type AuthUser,
  getAdminCollections,
  deleteCollection,
} from './api/convex-api';
import availableProductAssets from './availableProductAssets';
import OffersManager from './components/OffersManager';

gsap.registerPlugin(ScrollTrigger);

const statusTone: Record<AdminAppointment['status'], string> = {
  pending: 'bg-[#BF9C34]/10 text-[#BF9C34] border-[#BF9C34]/20',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};

type AdminTab = 'overview' | 'bookings' | 'reviews' | 'collections' | 'gallery' | 'offers';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const authToken = getStoredAuthToken();
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [recentlyCompletedBookings, setRecentlyCompletedBookings] = useState<(AdminAppointment & { completedAt: number })[]>([]);
  const [recentlyApprovedReviews, setRecentlyApprovedReviews] = useState<(AdminReview & { approvedAt: number })[]>([]);
  const [pendingAction, setPendingAction] = useState<
    | { type: 'booking'; appointment: AdminAppointment }
    | { type: 'bulk-booking'; appointmentIds: string[] }
    | { type: 'review'; review: AdminReview }
    | null
  >(null);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<string[]>([]);
  const [removingAppointmentIds, setRemovingAppointmentIds] = useState<string[]>([]);
  const [removingReviewIds, setRemovingReviewIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [galleryForm, setGalleryForm] = useState({
    title: '', category: '', caption: '', altText: '', imageUrl: '', featured: false,
  });
  const [collectionForm, setCollectionForm] = useState({
    title: '', description: '', assetKey: '', imageUrl: '',
    priceLabel: '', priceCents: undefined as number | undefined,
    active: true, featured: false,
  });
  const [collectionFile, setCollectionFile] = useState<File | null>(null);
  const [collectionsList, setCollectionsList] = useState<Array<any>>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [editCollectionFile, setEditCollectionFile] = useState<File | null>(null);
  const [editCollectionForm, setEditCollectionForm] = useState({
    title: '', description: '', assetKey: '', imageUrl: '',
    priceLabel: '', priceCents: undefined as number | undefined,
    active: true, featured: false,
  });

  // ======== HANDLERS (ALL PRESERVED EXACTLY) ========

  const handleCollectionCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    try {
      setActionMessage(null);
      let imageUrl: string | undefined = undefined;
      if (collectionFile) {
        const uploadUrl = `${API_BASE}/api/admin/collections/upload`;
        const resp = await fetch(uploadUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: collectionFile,
        });
        if (!resp.ok) {
          const errorText = await resp.text().catch(() => 'unknown error');
          console.error('Upload failed with status', resp.status, ':', errorText);
          throw new Error(`File upload failed (${resp.status})`);
        }
        const responseText = await resp.text();
        console.log('Upload response:', responseText);
        if (responseText.trim()) {
          const payload = JSON.parse(responseText) as { data?: { imageUrl?: string } };
          imageUrl = payload?.data?.imageUrl ?? undefined;
        }
      }
      const itemPayload: any = {
        title: collectionForm.title.trim(),
        description: collectionForm.description.trim(),
        priceLabel: collectionForm.priceLabel || undefined,
        active: collectionForm.active,
        featured: collectionForm.featured,
        sortOrder: Date.now(),
      };
      if (imageUrl) {
        itemPayload.imageUrl = imageUrl;
      } else {
        const customAssetKey = collectionForm.assetKey.trim();
        const customImageUrl = collectionForm.imageUrl.trim();
        if (customImageUrl) {
          itemPayload.imageUrl = customImageUrl;
        } else {
          itemPayload.assetKey = customAssetKey;
        }
      }
      await createCollection({ item: itemPayload, authToken });
      setActionMessage(`Created ${collectionForm.title}`);
      setCollectionForm((prev) => ({ ...prev, title: '', description: '', assetKey: '', imageUrl: '' }));
      setCollectionFile(null);
      await refreshDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create collection item.');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!authToken) return;
    try {
      await deleteCollection({ collectionId, authToken });
      setActionMessage('Collection removed');
      await refreshDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete collection.');
    }
  };

  const populateEditFormFromCollection = (collection: any) => {
    setEditCollectionForm({
      title: collection.title ?? '',
      description: collection.description ?? '',
      assetKey: collection.assetKey ?? '',
      imageUrl: collection.imageUrl ?? '',
      priceLabel: collection.priceLabel ?? '',
      priceCents: typeof collection.priceCents === 'number' ? collection.priceCents : undefined,
      active: Boolean(collection.active),
      featured: Boolean(collection.featured),
    });
  };

  const handleSelectCollectionForEdit = (collectionId: string) => {
    setSelectedCollectionId(collectionId);
    const selected = collectionsList.find((item) => item.id === collectionId);
    if (selected) {
      populateEditFormFromCollection(selected);
      setEditCollectionFile(null);
    }
  };

  const handleUpdateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !selectedCollectionId) return;
    try {
      let uploadedImageUrl: string | undefined;
      if (editCollectionFile) {
        const uploadUrl = `${API_BASE}/api/admin/collections/upload`;
        const resp = await fetch(uploadUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
          body: editCollectionFile,
        });
        if (!resp.ok) {
          const errorText = await resp.text().catch(() => 'unknown error');
          console.error('Upload failed with status', resp.status, ':', errorText);
          throw new Error(`File upload failed (${resp.status})`);
        }
        const responseText = await resp.text();
        console.log('Upload response:', responseText);
        if (responseText.trim()) {
          const payload = JSON.parse(responseText) as { data?: { imageUrl?: string } };
          uploadedImageUrl = payload?.data?.imageUrl ?? undefined;
        }
      }
      await updateCollection({
        collectionId: selectedCollectionId,
        updates: {
          title: editCollectionForm.title.trim(),
          description: editCollectionForm.description.trim(),
          assetKey: editCollectionForm.assetKey.trim() || undefined,
          imageUrl: uploadedImageUrl ?? (editCollectionForm.imageUrl.trim() || undefined),
          priceLabel: editCollectionForm.priceLabel.trim() || undefined,
          priceCents: editCollectionForm.priceCents,
          active: editCollectionForm.active,
          featured: editCollectionForm.featured,
        },
        authToken,
      });
      setActionMessage('Collection updated');
      setEditCollectionFile(null);
      await refreshDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update collection.');
    }
  };

  const handleRemoveSelectedCollection = async () => {
    if (!selectedCollectionId) return;
    await handleDeleteCollection(selectedCollectionId);
    setSelectedCollectionId('');
    setEditCollectionFile(null);
  };

  const loadDashboard = async () => {
    if (!authToken) {
      setIsLoading(false);
      return;
    }
    setError(null);
    try {
      const user = await getCurrentAuthUser(authToken);
      setCurrentUser(user);
      if (!user || user.role !== 'admin') {
        setAppointments([]);
        setReviews([]);
        setCollectionsList([]);
        return;
      }
      const [appointmentData, reviewData] = await Promise.all([
        getAdminAppointments(authToken),
        getAdminReviews(authToken),
      ]);
      try {
        const cols = await getAdminCollections(authToken);
        setCollectionsList(cols);
      } catch (err) {
        console.warn('Unable to load admin collections', err);
        setCollectionsList([]);
      }
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

  useEffect(() => {
    if (collectionsList.length === 0) {
      setSelectedCollectionId('');
      return;
    }
    const current = collectionsList.find((item) => item.id === selectedCollectionId);
    const target = current ?? collectionsList[0];
    setSelectedCollectionId(target.id);
    populateEditFormFromCollection(target);
  }, [collectionsList]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const sixtyMinutes = 60 * 60 * 1000;
      setRecentlyCompletedBookings((prev) => prev.filter((booking) => now - booking.completedAt < sixtyMinutes));
      setRecentlyApprovedReviews((prev) => prev.filter((review) => now - review.approvedAt < sixtyMinutes));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    await loadDashboard();
  };

  const handleLogout = () => {
    clearStoredAuthSession();
    navigate('/auth', { replace: true });
  };

  const handleAppointmentStatus = async (appointmentId: string, status: AdminAppointment['status']) => {
    if (!authToken) return;
    setActionMessage(null);
    if (status === 'cancelled') {
      setRemovingAppointmentIds((currentIds) => [...currentIds, appointmentId]);
    }
    try {
      if (status === 'completed') {
        const appointmentToComplete = appointments.find((a) => a.id === appointmentId);
        await completeAppointment({ appointmentId, authToken });
        setActionMessage(`Completed booking ${appointmentId.slice(0, 6).toUpperCase()}`);
        if (appointmentToComplete) {
          setRecentlyCompletedBookings((prev) => [...prev, { ...appointmentToComplete, completedAt: Date.now() }]);
        }
      } else {
        await updateAppointmentStatus({ appointmentId, status, authToken });
        setActionMessage(`Updated booking ${appointmentId.slice(0, 6).toUpperCase()}`);
      }
      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status } : appointment
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
        window.setTimeout(() => {
          setAppointments((currentAppointments) =>
            currentAppointments.filter((appointment) => appointment.id !== appointmentId)
          );
        }, 420);
      }
      setSelectedAppointmentIds((currentIds) => currentIds.filter((id) => id !== appointmentId));
      await refreshDashboard();
    } catch (updateError) {
      if (status === 'cancelled') {
        setRemovingAppointmentIds((currentIds) => currentIds.filter((id) => id !== appointmentId));
      }
      setError(updateError instanceof Error ? updateError.message : 'Unable to update this booking.');
    }
  };

  const toggleAppointmentSelection = (appointmentId: string) => {
    setSelectedAppointmentIds((currentIds) =>
      currentIds.includes(appointmentId)
        ? currentIds.filter((id) => id !== appointmentId)
        : [...currentIds, appointmentId]
    );
  };

  const handleBulkComplete = async () => {
    if (!authToken || selectedAppointmentIds.length === 0) return;
    setActionMessage(null);
    const idsToComplete = [...selectedAppointmentIds];
    try {
      await Promise.all(
        idsToComplete.map(async (appointmentId) => {
          const appointmentToComplete = appointments.find((a) => a.id === appointmentId);
          await completeAppointment({ appointmentId, authToken });
          if (appointmentToComplete) {
            setRecentlyCompletedBookings((prev) => [...prev, { ...appointmentToComplete, completedAt: Date.now() }]);
          }
        })
      );
      setActionMessage(`Completed ${idsToComplete.length} booking${idsToComplete.length > 1 ? 's' : ''}`);
      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          idsToComplete.includes(appointment.id) ? { ...appointment, status: 'completed' } : appointment
        )
      );
      window.setTimeout(() => {
        setAppointments((currentAppointments) =>
          currentAppointments.filter((appointment) => !idsToComplete.includes(appointment.id))
        );
      }, 420);
      setSelectedAppointmentIds([]);
      await refreshDashboard();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update these bookings.');
    }
  };

  const handleReviewModeration = async (review: AdminReview, isApproved: boolean) => {
    if (!authToken) return;
    setActionMessage(null);
    try {
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
          currentReview.id === review.id ? { ...currentReview, isApproved } : currentReview
        )
      );
      if (isApproved) {
        setRecentlyApprovedReviews((prev) => [...prev, { ...review, isApproved, approvedAt: Date.now() }]);
      }
      await refreshDashboard();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update this review.');
    }
  };

  const handleDeleteBookingConfirm = async () => {
    if (!pendingAction || (pendingAction.type !== 'booking' && pendingAction.type !== 'bulk-booking')) return;
    const appointmentIds =
      pendingAction.type === 'booking' ? [pendingAction.appointment.id] : pendingAction.appointmentIds;
    setPendingAction(null);
    setRemovingAppointmentIds((currentIds) => [...currentIds, ...appointmentIds]);
    try {
      await Promise.all(appointmentIds.map((appointmentId) => deleteAppointment({ appointmentId, authToken })));
      window.setTimeout(() => {
        setAppointments((currentAppointments) =>
          currentAppointments.filter((appointment) => !appointmentIds.includes(appointment.id))
        );
        setRecentlyCompletedBookings((currentBookings) =>
          currentBookings.filter((booking) => !appointmentIds.includes(booking.id))
        );
        setRemovingAppointmentIds((currentIds) => currentIds.filter((id) => !appointmentIds.includes(id)));
      }, 420);
      setSelectedAppointmentIds((currentIds) => currentIds.filter((id) => !appointmentIds.includes(id)));
      setActionMessage(
        appointmentIds.length > 1
          ? `Deleted ${appointmentIds.length} bookings`
          : `Deleted booking ${appointmentIds[0].slice(0, 6).toUpperCase()}`
      );
    } catch (deleteError) {
      setRemovingAppointmentIds((currentIds) => currentIds.filter((id) => !appointmentIds.includes(id)));
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete these bookings.');
    }
  };

  const handleDeleteReviewConfirm = async () => {
    if (!pendingAction || pendingAction.type !== 'review') return;
    const reviewId = pendingAction.review.id;
    const reviewName = pendingAction.review.name;
    setPendingAction(null);
    setRemovingReviewIds((currentIds) => [...currentIds, reviewId]);
    try {
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
    if (!authToken) return;
    setIsUploading(true);
    setActionMessage(null);
    try {
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
      setGalleryForm({ title: '', category: '', caption: '', altText: '', imageUrl: '', featured: false });
      await refreshDashboard();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unable to upload the gallery item.');
    } finally {
      setIsUploading(false);
    }
  };

  // ======== SMOOTH SCROLL (Lenis) ========
  useEffect(() => {
    if (isLoading || !authToken || !currentUser || currentUser.role !== 'admin') return;
    const lenis = new Lenis();
    let rafId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isLoading, authToken, currentUser]);

  // ======== ENTRY ANIMATIONS (safe pattern with safety net) ========
  useEffect(() => {
    if (isLoading || !authToken || !currentUser || currentUser.role !== 'admin') return;

    const safetyNet = window.setTimeout(() => {
      if (containerRef.current) gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' });
      gsap.set('.admin-reveal, .admin-hero, .admin-tab-bar', { opacity: 1, y: 0, clearProps: 'all' });
    }, 2000);

    const tl = gsap.timeline({
      onComplete: () => {
        if (containerRef.current) gsap.set(containerRef.current, { opacity: 1, clearProps: 'all' });
        gsap.set('.admin-reveal, .admin-hero, .admin-tab-bar', { opacity: 1, y: 0, clearProps: 'all' });
      },
    });
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.inOut' })
      .fromTo('.admin-hero', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.4')
      .fromTo('.admin-tab-bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');

    const createdTriggers: ScrollTrigger[] = [];
    const revealEls = gsap.utils.toArray<HTMLElement>('.admin-reveal');
    revealEls.forEach((el) => {
      gsap.set(el, { opacity: 1, y: 0 });
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.fromTo(el, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
        },
      });
      createdTriggers.push(st);
    });
    ScrollTrigger.refresh();

    return () => {
      window.clearTimeout(safetyNet);
      tl.kill();
      createdTriggers.forEach((t) => t.kill());
    };
  }, [isLoading, authToken, currentUser]);

  // ======== EARLY RETURNS (loading, not auth, not admin) ========

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#F2529D] border-t-transparent animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Loading dashboard</p>
        </div>
      </div>
    );
  }

  if (!authToken) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#333] px-4 py-16 flex items-center justify-center">
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
          <Link to="/auth?redirect=/admin" className="inline-flex items-center justify-center gap-3 rounded-full bg-black px-6 sm:px-8 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors">
            Go to sign in <ArrowButtonIcon />
          </Link>
          <Link to="/" className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-400 hover:text-[#F2529D] transition-colors">
            Back to the site
          </Link>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#333] px-4 py-16 flex items-center justify-center">
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
          <button onClick={handleLogout} className="inline-flex items-center justify-center gap-3 rounded-full bg-black px-6 sm:px-8 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors">
            Sign out <ArrowButtonIcon />
          </button>
        </div>
      </div>
    );
  }

  // ======== TAB CONFIG ========
  const tabs: { key: AdminTab; label: string; icon: React.FC<any>; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'bookings', label: 'Bookings', icon: Calendar, count: activeAppointments.length },
    { key: 'reviews', label: 'Reviews', icon: MessageSquare, count: pendingReviews.length },
    { key: 'collections', label: 'Collections', icon: Package, count: collectionsList.length },
    { key: 'gallery', label: 'Gallery', icon: ImagePlus },
    { key: 'offers', label: 'Offers', icon: Tag },
  ];

  // ======== MAIN RENDER ========
  return (
    <div ref={containerRef} className="min-h-screen bg-[#FAF9F6] text-[#333] overflow-x-hidden">
      {/* Top bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-3xl sm:text-4xl font-display italic font-black text-[#F2529D]">
              Sibs Style
            </Link>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Admin dashboard</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={refreshDashboard}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-500 hover:text-[#F2529D] hover:border-[#F2529D]/20 transition-colors"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-black px-4 sm:px-5 py-2.5 sm:py-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 space-y-8 sm:space-y-10">
        {/* Hero welcome */}
        <section className="admin-hero rounded-[2rem] sm:rounded-[3rem] bg-[#0A0E1A] text-white p-6 sm:p-8 lg:p-12 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(191,156,52,0.12),transparent_24%)]" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 items-center">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
                <Sparkles size={16} className="text-[#F2529D]" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50">Protected operations</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display italic font-black leading-[0.95]">
                Welcome back, <span className="text-[#F2529D]">{currentUser.fullName}</span>
              </h1>
              <p className="max-w-3xl text-sm sm:text-lg text-white/70 leading-relaxed">
                Manage bookings, moderate reviews, and curate your gallery from one elegant dashboard.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricCard label="Bookings" value={appointments.length} accent="#F2529D" icon={Calendar} />
              <MetricCard label="Reviews" value={reviews.length} accent="#BF9C34" icon={MessageSquare} />
              <MetricCard label="Role" value={currentUser.role.toUpperCase()} accent="#FFFFFF" icon={Shield} />
              <MetricCard label="Session" value={currentUser.isActive ? 'Active' : 'Inactive'} accent="#A7F3D0" icon={CheckCircle2} />
            </div>
          </div>
        </section>

        {/* Tab navigation */}
        <div className="admin-tab-bar sticky top-0 z-30 -mx-4 px-4 py-3 bg-[#FAF9F6]/90 backdrop-blur-xl">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-white text-gray-500 border border-gray-100 hover:text-gray-800 hover:border-gray-200'
                  }`}
                >
                  <tab.icon size={14} className={isActive ? 'text-[#F2529D]' : ''} />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[0.5rem] ${isActive ? 'bg-[#F2529D] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error / Action messages */}
        {error && (
          <div className="admin-reveal rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-start gap-3">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {actionMessage && (
          <div className="admin-reveal rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700 flex items-start gap-3">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* ====== OVERVIEW TAB ====== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="admin-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <OverviewCard
                icon={Calendar}
                accent="#F2529D"
                label="Active Bookings"
                value={activeAppointments.length}
                action={() => setActiveTab('bookings')}
              />
              <OverviewCard
                icon={MessageSquare}
                accent="#BF9C34"
                label="Pending Reviews"
                value={pendingReviews.length}
                action={() => setActiveTab('reviews')}
              />
              <OverviewCard
                icon={Package}
                accent="#F2529D"
                label="Collections"
                value={collectionsList.length}
                action={() => setActiveTab('collections')}
              />
            </div>

            {/* Quick recent activity */}
            {recentlyCompletedBookings.length > 0 && (
              <div className="admin-reveal">
                <h3 className="text-xl font-display italic font-black text-gray-900 mb-4">Recently Completed</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {recentlyCompletedBookings.slice(0, 4).map((apt) => (
                    <div key={apt.id} className="bg-white rounded-2xl border border-emerald-100 p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate">{apt.guestName}</p>
                        <p className="text-xs text-gray-400 truncate">{apt.serviceName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====== BOOKINGS TAB ====== */}
        {activeTab === 'bookings' && (
          <div className="space-y-8">
            <section className="admin-reveal space-y-5">
              <SectionHeader icon={Calendar} color="#F2529D" title="Bookings Queue" />

              {activeAppointments.length > 1 && (
                <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-gray-100 bg-white p-4">
                  <button
                    onClick={() =>
                      setSelectedAppointmentIds((currentIds) =>
                        currentIds.length === activeAppointments.length ? [] : activeAppointments.map((a) => a.id)
                      )
                    }
                    className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-500 hover:text-[#F2529D] transition-colors"
                  >
                    {selectedAppointmentIds.length === activeAppointments.length ? 'Deselect all' : 'Select all'}
                  </button>
                  {selectedAppointmentIds.length > 0 && (
                    <>
                      <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">
                        {selectedAppointmentIds.length} selected
                      </span>
                      <button
                        onClick={handleBulkComplete}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-gray-500 hover:text-emerald-700 transition-colors"
                      >
                        <Clock3 size={14} /> Complete selected
                      </button>
                      <button
                        onClick={() => setPendingAction({ type: 'bulk-booking', appointmentIds: selectedAppointmentIds })}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-gray-500 hover:text-red-700 transition-colors"
                      >
                        <XCircle size={14} /> Cancel selected
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                {activeAppointments.length === 0 ? (
                  <div className="lg:col-span-2 rounded-[2rem] bg-white border border-gray-100 p-8 sm:p-12 text-center text-gray-400">
                    No active bookings.
                  </div>
                ) : (
                  activeAppointments.map((appointment) => (
                    <article
                      key={appointment.id}
                      className={`rounded-[2rem] bg-white border border-gray-100 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.12)] p-5 sm:p-6 space-y-4 transition-all duration-500 hover:shadow-[0_30px_80px_-30px_rgba(242,82,157,0.15)] ${
                        removingAppointmentIds.includes(appointment.id) ? 'opacity-0 translate-y-2 scale-[0.98]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {activeAppointments.length > 1 && (
                            <input
                              type="checkbox"
                              checked={selectedAppointmentIds.includes(appointment.id)}
                              onChange={() => toggleAppointmentSelection(appointment.id)}
                              aria-label={`Select booking for ${appointment.guestName}`}
                              className="mt-1.5 h-5 w-5 shrink-0 rounded border-gray-300 text-[#F2529D] focus:ring-[#F2529D]"
                            />
                          )}
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]">{appointment.serviceName}</p>
                            <h3 className="text-xl font-display italic font-black text-[#0A0E1A]">{appointment.guestName}</h3>
                            <p className="text-xs text-gray-500">{appointment.guestEmail} / {appointment.guestPhone}</p>
                          </div>
                        </div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] ${statusTone[appointment.status]}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="grid gap-3 text-sm text-gray-500 sm:grid-cols-2">
                        <div className="rounded-[1.25rem] bg-[#FAF9F6] p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Schedule</p>
                          <p className="mt-2 font-semibold text-gray-800">{appointment.appointmentDate} / {appointment.appointmentTimeLabel}</p>
                          <p className="mt-1 text-xs text-gray-500">{appointment.startTimeLabel} to {appointment.endTimeLabel}</p>
                        </div>
                        <div className="rounded-[1.25rem] bg-[#FAF9F6] p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Stylist</p>
                          <p className="mt-2 font-semibold text-gray-800">{appointment.assignedStylistName ?? 'Unassigned'}</p>
                          <p className="mt-1 text-xs text-gray-500">{appointment.location}</p>
                        </div>
                      </div>
                      {appointment.notes && (
                        <div className="rounded-[1.25rem] bg-black/5 p-4 text-sm text-gray-600 leading-relaxed">{appointment.notes}</div>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {appointment.status !== 'confirmed' && (
                          <button onClick={() => handleAppointmentStatus(appointment.id, 'confirmed')} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors">
                            <CheckCircle2 size={14} /> Confirm
                          </button>
                        )}
                        {appointment.status !== 'completed' && (
                          <button onClick={() => handleAppointmentStatus(appointment.id, 'completed')} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-gray-500 hover:text-emerald-700 transition-colors">
                            <Clock3 size={14} /> Complete
                          </button>
                        )}
                        {appointment.status !== 'cancelled' && (
                          <button onClick={() => setPendingAction({ type: 'booking', appointment })} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-gray-500 hover:text-red-700 transition-colors">
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            {recentlyCompletedBookings.length > 0 && (
              <section className="admin-reveal space-y-5">
                <SectionHeader icon={CheckCircle2} color="#10b981" title="Completed Bookings" />
                <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                  {recentlyCompletedBookings.map((appointment) => (
                    <article key={appointment.id} className="rounded-[2rem] border border-emerald-200 bg-emerald-50 p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600">{appointment.serviceName}</p>
                          <h3 className="text-xl font-display italic font-black text-emerald-950">{appointment.guestName}</h3>
                          <p className="text-xs text-emerald-900/70">{appointment.guestEmail} / {appointment.guestPhone}</p>
                        </div>
                        <span className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700">completed</span>
                      </div>
                      <div className="grid gap-3 text-sm text-emerald-900/70 sm:grid-cols-2">
                        <div className="rounded-[1.25rem] bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">Schedule</p>
                          <p className="mt-2 font-semibold text-emerald-950">{appointment.appointmentDate} / {appointment.appointmentTimeLabel}</p>
                        </div>
                        <div className="rounded-[1.25rem] bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-500">Stylist</p>
                          <p className="mt-2 font-semibold text-emerald-950">{appointment.assignedStylistName ?? 'Unassigned'}</p>
                        </div>
                      </div>
                      <button onClick={() => setRecentlyCompletedBookings((prev) => prev.filter((a) => a.id !== appointment.id))} className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-600 hover:bg-emerald-100 transition-colors">
                        <XCircle size={14} /> Remove
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ====== REVIEWS TAB ====== */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <section className="admin-reveal space-y-5">
              <SectionHeader icon={MessageSquare} color="#F2529D" title="Review Moderation" />
              <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                {pendingReviews.length === 0 ? (
                  <div className="lg:col-span-2 rounded-[2rem] bg-white border border-gray-100 p-8 sm:p-12 text-center text-gray-400">
                    No pending reviews.
                  </div>
                ) : (
                  pendingReviews.map((review) => (
                    <article
                      key={review.id}
                      className={`rounded-[2rem] bg-white border border-gray-100 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.12)] p-5 sm:p-6 space-y-4 transition-all duration-500 hover:shadow-[0_30px_80px_-30px_rgba(242,82,157,0.15)] ${
                        removingReviewIds.includes(review.id) ? 'opacity-0 translate-y-2 scale-[0.98]' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]">{review.serviceName ?? 'General'}</p>
                          <h3 className="text-xl font-display italic font-black text-[#0A0E1A]">{review.name}</h3>
                          <p className="text-xs text-gray-500">{review.role} / {review.email}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-[#BF9C34]/10 px-3 py-2 text-[#BF9C34]">
                          <Star size={14} fill="currentColor" />
                          <span className="text-[10px] font-black uppercase tracking-[0.35em]">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed italic">{review.mainQuote}</p>
                      {review.subQuote1 && <p className="text-sm text-gray-500 leading-relaxed">{review.subQuote1}</p>}
                      {review.subQuote2 && <p className="text-sm text-gray-500 leading-relaxed">{review.subQuote2}</p>}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] ${review.isApproved ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                          {review.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        {review.featured && (
                          <span className="inline-flex rounded-full border border-[#F2529D]/20 bg-[#F2529D]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D]">Featured</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {!review.isApproved && (
                          <button onClick={() => handleReviewModeration(review, true)} className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors">
                            <CheckCircle2 size={14} /> Approve
                          </button>
                        )}
                        {!review.isApproved && (
                          <button onClick={() => setPendingAction({ type: 'review', review })} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-red-700 hover:bg-red-50 transition-colors">
                            <XCircle size={14} /> Delete
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>

            {recentlyApprovedReviews.length > 0 && (
              <section className="admin-reveal space-y-5">
                <SectionHeader icon={CheckCircle2} color="#BF9C34" title="Approved Chronicles" />
                <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                  {recentlyApprovedReviews.map((review) => (
                    <article key={review.id} className="rounded-[2rem] border border-[#F2529D]/15 bg-[#FFF7FB] p-5 space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BF9C34]">{review.serviceName ?? 'General'}</p>
                          <h3 className="text-xl font-display italic font-black text-[#0A0E1A]">{review.name}</h3>
                          <p className="text-xs text-gray-500">{review.role} / {review.email}</p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-[#BF9C34]/10 px-3 py-2 text-[#BF9C34]">
                          <Star size={14} fill="currentColor" />
                          <span className="text-[10px] font-black uppercase tracking-[0.35em]">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed italic">{review.mainQuote}</p>
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-emerald-700">Approved</span>
                      </div>
                      <button onClick={() => setRecentlyApprovedReviews((prev) => prev.filter((r) => r.id !== review.id))} className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#F2529D]/30 bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.35em] text-[#F2529D] hover:bg-[#FFF0F8] transition-colors">
                        <XCircle size={14} /> Remove
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ====== COLLECTIONS TAB ====== */}
        {activeTab === 'collections' && (
          <div className="space-y-8">
            <section className="admin-reveal space-y-5">
              <SectionHeader icon={Package} color="#BF9C34" title="Collection Items" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {collectionsList.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-gray-400 rounded-[2rem] bg-white border border-gray-100">No collection items yet.</div>
                ) : (
                  collectionsList.map((c) => (
                    <div key={c.id} className="rounded-[1.5rem] bg-white border border-gray-100 p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
                      <div className="w-16 h-16 bg-[#FAF9F6] rounded-xl overflow-hidden flex-shrink-0">
                        <img src={c.imageUrl ?? (availableProductAssets[c.assetKey]?.src ?? '')} className="w-full h-full object-cover" alt={c.title} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-black text-base truncate">{c.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{c.description}</p>
                      </div>
                      <button onClick={() => handleDeleteCollection(c.id)} className="rounded-full bg-red-50 text-red-700 px-3 py-2 text-xs font-black hover:bg-red-100 transition-colors shrink-0">Delete</button>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Create collection */}
            <section className="admin-reveal space-y-5">
              <SectionHeader icon={ImagePlus} color="#F2529D" title="Create Collection Item" />
              <form onSubmit={handleCollectionCreate} className="rounded-[2rem] bg-white border border-gray-100 p-6 sm:p-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Title</span>
                    <input required value={collectionForm.title} onChange={(e) => setCollectionForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="Product title" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Asset</span>
                    <input value={collectionForm.assetKey} onChange={(e) => setCollectionForm((prev) => ({ ...prev, assetKey: e.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="e.g., himalaya" />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Upload image file</span>
                    <input type="file" accept="image/*" onChange={(event) => setCollectionFile(event.target.files?.[0] ?? null)} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Image URL</span>
                    <input value={collectionForm.imageUrl} onChange={(e) => setCollectionForm((prev) => ({ ...prev, imageUrl: e.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="https://..." />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Description</span>
                  <textarea value={collectionForm.description} onChange={(e) => setCollectionForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] resize-none transition-colors" placeholder="Short product description" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Price</span>
                  <input value={collectionForm.priceLabel} onChange={(e) => setCollectionForm((prev) => ({ ...prev, priceLabel: e.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="e.g., 120 AED" />
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <input type="checkbox" checked={collectionForm.featured} onChange={(event) => setCollectionForm((prev) => ({ ...prev, featured: event.target.checked }))} className="w-4 h-4 accent-[#F2529D]" /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <input type="checkbox" checked={collectionForm.active} onChange={(event) => setCollectionForm((prev) => ({ ...prev, active: event.target.checked }))} className="w-4 h-4 accent-[#F2529D]" /> Active
                  </label>
                </div>
                <button type="submit" className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#BF9C34] transition-colors">
                  Create collection item <ArrowButtonIcon />
                </button>
              </form>
            </section>

            {/* Edit collection */}
            <section className="admin-reveal space-y-5">
              <SectionHeader icon={ImagePlus} color="#0A0E1A" title="Edit Collection Item" />
              <form onSubmit={handleUpdateCollection} className="rounded-[2rem] bg-white border border-gray-100 p-6 sm:p-8 space-y-5">
                <label className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Select collection</span>
                  <select value={selectedCollectionId} onChange={(e) => handleSelectCollectionForEdit(e.target.value)} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors">
                    {collectionsList.map((item) => (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Title</span>
                    <input value={editCollectionForm.title} onChange={(e) => setEditCollectionForm((prev) => ({ ...prev, title: e.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="Product title" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Asset</span>
                    <input value={editCollectionForm.assetKey} onChange={(e) => setEditCollectionForm((prev) => ({ ...prev, assetKey: e.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="Asset key" />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Upload image file</span>
                    <input type="file" accept="image/*" onChange={(event) => setEditCollectionFile(event.target.files?.[0] ?? null)} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Image URL</span>
                    <input value={editCollectionForm.imageUrl} onChange={(e) => setEditCollectionForm((prev) => ({ ...prev, imageUrl: e.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="https://..." />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Description</span>
                  <textarea value={editCollectionForm.description} onChange={(e) => setEditCollectionForm((prev) => ({ ...prev, description: e.target.value }))} rows={3} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] resize-none transition-colors" placeholder="Short product description" />
                </label>
                <label className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Price</span>
                  <input value={editCollectionForm.priceLabel} onChange={(e) => setEditCollectionForm((prev) => ({ ...prev, priceLabel: e.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="e.g., 120 AED" />
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <input type="checkbox" checked={editCollectionForm.featured} onChange={(event) => setEditCollectionForm((prev) => ({ ...prev, featured: event.target.checked }))} className="w-4 h-4 accent-[#F2529D]" /> Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <input type="checkbox" checked={editCollectionForm.active} onChange={(event) => setEditCollectionForm((prev) => ({ ...prev, active: event.target.checked }))} className="w-4 h-4 accent-[#F2529D]" /> Active
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <button type="submit" disabled={!selectedCollectionId} className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#0A0E1A] transition-colors disabled:opacity-50">
                    Save changes <ArrowButtonIcon />
                  </button>
                  <button type="button" onClick={handleRemoveSelectedCollection} disabled={!selectedCollectionId} className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-red-50 border border-red-200 px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50">
                    Remove <XCircle size={14} />
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* ====== GALLERY TAB ====== */}
        {activeTab === 'gallery' && (
          <section className="admin-reveal space-y-5">
            <SectionHeader icon={Upload} color="#BF9C34" title="Gallery Upload" />
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[2rem] bg-[#0A0E1A] text-white p-6 sm:p-8 relative overflow-hidden border border-white/10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(191,156,52,0.12),transparent_24%)]" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
                    <Upload size={16} className="text-[#BF9C34]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50">Gallery upload</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-display italic font-black leading-tight">Add a new editorial frame</h2>
                  <p className="text-sm text-white/65 leading-relaxed">Upload by image URL to keep the media pipeline simple while the lounge grows.</p>
                </div>
              </div>
              <form onSubmit={handleGalleryUpload} className="rounded-[2rem] bg-white border border-gray-100 p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                  <ImagePlus className="text-[#F2529D]" size={20} />
                  <h3 className="text-2xl font-display italic font-black text-[#0A0E1A]">Gallery uploader</h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Title</span>
                    <input required value={galleryForm.title} onChange={(event) => setGalleryForm((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="Radiance Bloom" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Category</span>
                    <input required value={galleryForm.category} onChange={(event) => setGalleryForm((prev) => ({ ...prev, category: event.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="Product Edit" />
                  </label>
                </div>
                <label className="block space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Caption</span>
                  <textarea value={galleryForm.caption} onChange={(event) => setGalleryForm((prev) => ({ ...prev, caption: event.target.value }))} rows={3} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] resize-none transition-colors" placeholder="A small editorial note about the frame" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Alt text</span>
                    <input value={galleryForm.altText} onChange={(event) => setGalleryForm((prev) => ({ ...prev, altText: event.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="Luxury serum bottle" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">Image URL</span>
                    <input value={galleryForm.imageUrl} onChange={(event) => setGalleryForm((prev) => ({ ...prev, imageUrl: event.target.value }))} className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-3.5 text-base focus:outline-none focus:border-[#F2529D] transition-colors" placeholder="https://..." />
                  </label>
                </div>
                <label className="flex items-center gap-3 rounded-[1.25rem] bg-[#FAF9F6] border border-gray-200 px-4 py-3.5 text-sm font-medium text-gray-600">
                  <input type="checkbox" checked={galleryForm.featured} onChange={(event) => setGalleryForm((prev) => ({ ...prev, featured: event.target.checked }))} className="w-4 h-4 accent-[#F2529D]" /> Mark as featured
                </label>
                <button disabled={isUploading} className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-black px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors disabled:opacity-70">
                  {isUploading ? 'Uploading...' : 'Upload frame'} <ArrowButtonIcon />
                </button>
              </form>
            </div>
          </section>
        )}

        {/* ====== OFFERS TAB ====== */}
        {activeTab === 'offers' && (
          <div className="admin-reveal">
            <OffersManager authToken={authToken} />
          </div>
        )}
      </main>

      {/* Confirmation modal */}
      {pendingAction ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[#0A0E1A] p-6 sm:p-8 text-white shadow-[0_40px_100px_-30px_rgba(0,0,0,0.7)]">
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-[#F2529D]">Confirm action</p>
            <h3 className="mt-3 text-2xl sm:text-3xl font-display italic font-black leading-tight">
              {pendingAction.type === 'booking'
                ? 'Are you sure you want to delete this booking?'
                : pendingAction.type === 'bulk-booking'
                ? `Are you sure you want to delete ${pendingAction.appointmentIds.length} bookings?`
                : 'Are you sure you want to delete this review?'}
            </h3>
            <p className="mt-4 text-sm text-white/70 leading-relaxed">
              {pendingAction.type === 'booking' || pendingAction.type === 'bulk-booking'
                ? 'This removes the booking from the dashboard after the fade animation and keeps the Convex status in sync.'
                : 'This removes the rating from moderation and clears it from the dashboard after the fade animation.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => setPendingAction(null)} className="flex-1 rounded-full border border-white/15 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white hover:bg-white/10 transition-colors">
                No
              </button>
              <button
                onClick={pendingAction.type === 'review' ? handleDeleteReviewConfirm : handleDeleteBookingConfirm}
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

// ======== SUB COMPONENTS ========

const MetricCard = ({ label, value, accent, icon: Icon }: { label: string; value: number | string; accent: string; icon: React.FC<any> }) => (
  <div className="rounded-[1.5rem] bg-white/5 border border-white/10 p-4 sm:p-5 flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15` }}>
      <Icon size={18} className="" style={{ color: accent }} />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/45 truncate">{label}</p>
      <p className="text-xl sm:text-2xl font-display italic font-black" style={{ color: accent }}>{value}</p>
    </div>
  </div>
);

const SectionHeader = ({ icon: Icon, color, title }: { icon: React.FC<any>; color: string; title: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
      <Icon size={18} className="" style={{ color }} />
    </div>
    <h2 className="text-2xl sm:text-3xl font-display italic font-black text-[#0A0E1A]">{title}</h2>
  </div>
);

const OverviewCard = ({ icon: Icon, accent, label, value, action }: { icon: React.FC<any>; accent: string; label: string; value: number; action: () => void }) => (
  <button
    onClick={action}
    className="group text-left rounded-[2rem] bg-white border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
        <Icon size={24} className="" style={{ color: accent }} />
      </div>
      <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
    </div>
    <p className="text-3xl font-display italic font-black text-gray-900">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400 mt-1">{label}</p>
  </button>
);

const ArrowButtonIcon = () => <ChevronRight size={14} />;

export default AdminPage;
