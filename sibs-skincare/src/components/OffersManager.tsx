import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, PencilLine, Plus, Sparkles, Trash2 } from 'lucide-react';
import {
  createPromotion,
  deletePromotion,
  getAdminPromotions,
  updatePromotion,
  type Promotion,
} from '../api/convex-api';

interface OffersManagerProps {
  authToken: string | null;
}

type PromotionDraft = {
  title: string;
  description: string;
  code: string;
  imageUrl: string;
  tag: string;
  discountText: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  startDate: string;
  endDate: string;
  useAsHero?: boolean;
};

const quickTags = ['Most Popular', 'Best Value', 'Limited Time', 'Featured'];

const emptyDraft = (): PromotionDraft => ({
  title: '',
  description: '',
  code: '',
  imageUrl: '',
  tag: 'Featured',
  discountText: '',
  featured: true,
  active: true,
  sortOrder: 1,
  startDate: '2025-01-01',
  endDate: '2026-12-31',
  useAsHero: false,
});

const OffersManager: React.FC<OffersManagerProps> = ({ authToken }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [limitedDraft, setLimitedDraft] = useState<PromotionDraft>(emptyDraft());
  const [currentDraft, setCurrentDraft] = useState<PromotionDraft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<'LIMITED_EXCLUSIVE' | 'CURRENT_SPECIAL' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadPromotions = async () => {
    if (!authToken) {
      setIsLoading(false);
      return;
    }

    setError(null);
    try {
      setIsLoading(true);
      const items = await getAdminPromotions(authToken);
      setPromotions(items.sort((left, right) => left.sortOrder - right.sortOrder));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load offers.');
      setPromotions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, [authToken]);

  useEffect(() => {
    if (!editingId) {
      setLimitedDraft(emptyDraft());
      setCurrentDraft(emptyDraft());
      return;
    }

    const selected = promotions.find((promotion) => promotion.id === editingId);
    if (selected) {
      const draft = {
        title: selected.title,
        description: selected.description,
        code: selected.code,
        imageUrl: selected.imageUrl,
        tag: selected.tag,
        discountText: selected.discountText,
        featured: selected.featured,
        active: selected.active,
        sortOrder: selected.sortOrder,
        startDate: selected.startDate,
        endDate: selected.endDate,
      };
      if (selected.offerType === 'LIMITED_EXCLUSIVE') {
        setLimitedDraft(draft);
        setEditingType('LIMITED_EXCLUSIVE');
      } else {
        setCurrentDraft(draft);
        setEditingType('CURRENT_SPECIAL');
      }
    }
  }, [editingId, promotions]);

  const limitedPromotions = useMemo(
    () => promotions.filter((p) => p.offerType === 'LIMITED_EXCLUSIVE').sort((a, b) => a.sortOrder - b.sortOrder),
    [promotions],
  );

  const currentPromotions = useMemo(
    () => promotions.filter((p) => p.offerType === 'CURRENT_SPECIAL').sort((a, b) => a.sortOrder - b.sortOrder),
    [promotions],
  );

  const saveLimitedPromotion = async (event: React.FormEvent) => {
    await savePromotionHandler(event, limitedDraft, 'LIMITED_EXCLUSIVE', setLimitedDraft);
  };

  const saveCurrentPromotion = async (event: React.FormEvent) => {
    await savePromotionHandler(event, currentDraft, 'CURRENT_SPECIAL', setCurrentDraft);
  };

  const savePromotionHandler = async (
    event: React.FormEvent,
    draft: PromotionDraft,
    offerType: 'LIMITED_EXCLUSIVE' | 'CURRENT_SPECIAL',
    setDraft: React.Dispatch<React.SetStateAction<PromotionDraft>>,
  ) => {
    event.preventDefault();
    if (!authToken) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        code: draft.code.trim().toUpperCase(),
        imageUrl: draft.imageUrl.trim(),
        tag: draft.tag.trim() || 'Featured',
        discountText: draft.discountText.trim(),
        featured: draft.featured,
        active: draft.active,
        sortOrder: Number.isFinite(draft.sortOrder) ? draft.sortOrder : 1,
        startDate: draft.startDate,
        endDate: draft.endDate,
        offerType,
      };

      if (!payload.title || !payload.description || !payload.code || !payload.imageUrl) {
        throw new Error('Title, description, code, and image are required.');
      }

      if (editingId && editingType === offerType) {
        await updatePromotion({ promotionId: editingId, updates: payload, authToken });
        setMessage(`Updated ${payload.title}`);
        // If admin flagged as hero, persist selection
        if (offerType === 'LIMITED_EXCLUSIVE' && draft.useAsHero) {
          try { localStorage.setItem('heroOfferId', editingId); } catch {}
        }
      } else if (!editingId || editingType !== offerType) {
        const created = await createPromotion({ promotion: payload, authToken });
        setMessage(`Added ${payload.title}`);
        if (offerType === 'LIMITED_EXCLUSIVE' && draft.useAsHero) {
          try { localStorage.setItem('heroOfferId', (created as any).id); } catch {}
        }
      }

      setEditingId(null);
      setEditingType(null);
      setDraft(emptyDraft());
      await loadPromotions();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this offer.');
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (promotion: Promotion) => {
    setEditingId(promotion.id);
    setEditingType(promotion.offerType);
    setMessage(null);
    setError(null);
  };

  const removePromotion = async (promotionId: string) => {
    if (!authToken) {
      return;
    }

    const confirmed = window.confirm('Delete this offer?');
    if (!confirmed) {
      return;
    }

    setIsDeletingId(promotionId);
    setError(null);
    setMessage(null);

    try {
      await deletePromotion({ promotionId, authToken });
      if (editingId === promotionId) {
        setEditingId(null);
        setEditingType(null);
        setLimitedDraft(emptyDraft());
        setCurrentDraft(emptyDraft());
      }
      setMessage('Offer removed');
      await loadPromotions();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this offer.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingType(null);
    setLimitedDraft(emptyDraft());
    setCurrentDraft(emptyDraft());
  };

  

  if (isLoading) {
    return (
      <section className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-gray-100 p-8 sm:p-10 text-center text-gray-500 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.15)]">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#F2529D] border-t-transparent" />
        Loading offers...
      </section>
    );
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="rounded-[2rem] sm:rounded-[3rem] bg-[#0A0E1A] text-white p-6 sm:p-8 lg:p-10 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] border border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,82,157,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(191,156,52,0.12),transparent_24%)]" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
            <Sparkles size={16} className="text-[#F2529D]" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50">Offers control</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display italic font-black leading-tight">
            Manage Your Exclusive Offers & Specials
          </h2>
          <p className="max-w-2xl text-sm sm:text-lg text-white/70 leading-relaxed">
            Create limited-time exclusive offers and current specials separately. Each appears in its own section on the public offers page.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {/* LIMITED EXCLUSIVES SECTION */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={saveLimitedPromotion} className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-gray-100 p-6 sm:p-8 lg:p-10 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.15)] space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Plus className="text-[#F2529D]" size={20} />
            <h3 className="text-2xl sm:text-3xl font-display italic font-black text-[#0A0E1A]">
              {editingType === 'LIMITED_EXCLUSIVE' ? 'Edit Limited Exclusive' : 'Add Limited Exclusive'}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" value={limitedDraft.title} onChange={(value) => setLimitedDraft((current) => ({ ...current, title: value }))} placeholder="Glow Membership" />
            <Field label="Discount code" value={limitedDraft.code} onChange={(value) => setLimitedDraft((current) => ({ ...current, code: value.toUpperCase() }))} placeholder="GLOW20" />
          </div>

          <Field
            label="Description"
            value={limitedDraft.description}
            onChange={(value) => setLimitedDraft((current) => ({ ...current, description: value }))}
            placeholder="Join our monthly membership for continuous care..."
            textarea
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Image URL" value={limitedDraft.imageUrl} onChange={(value) => setLimitedDraft((current) => ({ ...current, imageUrl: value }))} placeholder="https://..." />
            <Field label="Discount detail" value={limitedDraft.discountText} onChange={(value) => setLimitedDraft((current) => ({ ...current, discountText: value }))} placeholder="20% off select services" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero tag" value={limitedDraft.tag} onChange={(value) => setLimitedDraft((current) => ({ ...current, tag: value }))} placeholder="Limited Time" />
            <Field label="Sort order" value={String(limitedDraft.sortOrder)} onChange={(value) => setLimitedDraft((current) => ({ ...current, sortOrder: Number(value) || 1 }))} placeholder="1" type="number" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" value={limitedDraft.startDate} onChange={(value) => setLimitedDraft((current) => ({ ...current, startDate: value }))} type="date" />
            <Field label="End date" value={limitedDraft.endDate} onChange={(value) => setLimitedDraft((current) => ({ ...current, endDate: value }))} type="date" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleButton
              label="Featured"
              active={limitedDraft.featured}
              onClick={() => setLimitedDraft((current) => ({ ...current, featured: !current.featured }))}
              accent="#F2529D"
            />
            <ToggleButton
              label="Active"
              active={limitedDraft.active}
              onClick={() => setLimitedDraft((current) => ({ ...current, active: !current.active }))}
              accent="#BF9C34"
            />
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const result = reader.result as string | null;
                    if (result) setLimitedDraft((cur) => ({ ...cur, imageUrl: result }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            <div>
              <ToggleButton
                label="Use as hero image"
                active={Boolean(limitedDraft.useAsHero)}
                onClick={() => setLimitedDraft((cur) => ({ ...cur, useAsHero: !cur.useAsHero }))}
                accent="#BF9C34"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setLimitedDraft((current) => ({ ...current, tag }))}
                className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${limitedDraft.tag === tag ? 'border-[#F2529D] bg-[#F2529D]/10 text-[#F2529D]' : 'border-gray-200 bg-white text-gray-500 hover:border-[#F2529D]/40 hover:text-[#F2529D]'}`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#F2529D] transition-colors disabled:opacity-70"
            >
              <CheckCircle2 size={14} />
              {isSaving ? 'Saving...' : editingType === 'LIMITED_EXCLUSIVE' ? 'Update offer' : 'Create offer'}
            </button>
            {editingType === 'LIMITED_EXCLUSIVE' && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-500 hover:text-[#F2529D] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-[2rem] sm:rounded-[3rem] bg-[#0A0E1A] text-white p-6 sm:p-8 lg:p-10 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] border border-white/10 space-y-5 sm:space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-display italic font-black">Limited Exclusives</h3>
            <p className="mt-2 text-sm sm:text-base text-white/65">Your current limited-time offers</p>
          </div>

          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {limitedPromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} onEdit={startEditing} onDelete={removePromotion} isDeletingId={isDeletingId} />
            ))}

            {limitedPromotions.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-white/55">
                No limited exclusives yet. Create one using the form.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CURRENT SPECIALS SECTION */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={saveCurrentPromotion} className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-gray-100 p-6 sm:p-8 lg:p-10 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.15)] space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Plus className="text-[#BF9C34]" size={20} />
            <h3 className="text-2xl sm:text-3xl font-display italic font-black text-[#0A0E1A]">
              {editingType === 'CURRENT_SPECIAL' ? 'Edit Current Special' : 'Add Current Special'}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" value={currentDraft.title} onChange={(value) => setCurrentDraft((current) => ({ ...current, title: value }))} placeholder="Seasonal Rituals" />
            <Field label="Discount code" value={currentDraft.code} onChange={(value) => setCurrentDraft((current) => ({ ...current, code: value.toUpperCase() }))} placeholder="SEASONAL" />
          </div>

          <Field
            label="Description"
            value={currentDraft.description}
            onChange={(value) => setCurrentDraft((current) => ({ ...current, description: value }))}
            placeholder="Discover our current seasonal specials..."
            textarea
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Image URL" value={currentDraft.imageUrl} onChange={(value) => setCurrentDraft((current) => ({ ...current, imageUrl: value }))} placeholder="https://..." />
            <Field label="Discount detail" value={currentDraft.discountText} onChange={(value) => setCurrentDraft((current) => ({ ...current, discountText: value }))} placeholder="Seasonal curated savings" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero tag" value={currentDraft.tag} onChange={(value) => setCurrentDraft((current) => ({ ...current, tag: value }))} placeholder="Current Special" />
            <Field label="Sort order" value={String(currentDraft.sortOrder)} onChange={(value) => setCurrentDraft((current) => ({ ...current, sortOrder: Number(value) || 1 }))} placeholder="1" type="number" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" value={currentDraft.startDate} onChange={(value) => setCurrentDraft((current) => ({ ...current, startDate: value }))} type="date" />
            <Field label="End date" value={currentDraft.endDate} onChange={(value) => setCurrentDraft((current) => ({ ...current, endDate: value }))} type="date" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleButton
              label="Featured"
              active={currentDraft.featured}
              onClick={() => setCurrentDraft((current) => ({ ...current, featured: !current.featured }))}
              accent="#BF9C34"
            />
            <ToggleButton
              label="Active"
              active={currentDraft.active}
              onClick={() => setCurrentDraft((current) => ({ ...current, active: !current.active }))}
              accent="#F2529D"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setCurrentDraft((current) => ({ ...current, tag }))}
                className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${currentDraft.tag === tag ? 'border-[#BF9C34] bg-[#BF9C34]/10 text-[#BF9C34]' : 'border-gray-200 bg-white text-gray-500 hover:border-[#BF9C34]/40 hover:text-[#BF9C34]'}`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-white hover:bg-[#BF9C34] transition-colors disabled:opacity-70"
            >
              <CheckCircle2 size={14} />
              {isSaving ? 'Saving...' : editingType === 'CURRENT_SPECIAL' ? 'Update offer' : 'Create offer'}
            </button>
            {editingType === 'CURRENT_SPECIAL' && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-500 hover:text-[#BF9C34] transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="rounded-[2rem] sm:rounded-[3rem] bg-[#0A0E1A] text-white p-6 sm:p-8 lg:p-10 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] border border-white/10 space-y-5 sm:space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-display italic font-black">Current Specials</h3>
            <p className="mt-2 text-sm sm:text-base text-white/65">Your active featured offers</p>
          </div>

          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-1">
            {currentPromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} onEdit={startEditing} onDelete={removePromotion} isDeletingId={isDeletingId} />
            ))}

            {currentPromotions.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-white/55">
                No current specials yet. Create one using the form.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-gray-100 p-6 sm:p-8 lg:p-10 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-[#BF9C34]" size={20} />
          <h3 className="text-2xl sm:text-3xl font-display italic font-black text-[#0A0E1A]">How this works</h3>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 text-sm text-gray-600 leading-relaxed">
          <div className="rounded-[1.25rem] bg-[#FAF9F6] p-5 border border-gray-100">
            <p className="font-black text-[#0A0E1A] mb-2">Limited Exclusives</p>
            Limited-time offers appear in their own section on the public offers page, perfect for time-limited deals.
          </div>
          <div className="rounded-[1.25rem] bg-[#FAF9F6] p-5 border border-gray-100">
            <p className="font-black text-[#0A0E1A] mb-2">Current Specials</p>
            Featured current offers display as your main promotions, showing in the current specials section.
          </div>
        </div>
      </div>
    </section>
  );
};

interface PromotionCardProps {
  promotion: Promotion;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotionId: string) => void;
  isDeletingId: string | null;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, onEdit, onDelete, isDeletingId }) => (
  <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-4">
    <div className="flex items-start gap-4">
      <img src={promotion.imageUrl} alt={promotion.title} className="h-20 w-20 rounded-[1rem] object-cover flex-shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#F2529D]/30 bg-[#F2529D]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] text-[#FFB3D0]">{promotion.tag}</span>
          <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.25em] ${promotion.active ? 'border-emerald-300 bg-emerald-400/10 text-emerald-300' : 'border-white/15 bg-white/5 text-white/45'}`}>
            {promotion.active ? 'Active' : 'Hidden'}
          </span>
        </div>
        <h4 className="text-lg font-display italic font-black leading-tight text-white">{promotion.title}</h4>
        <p className="text-xs leading-5 text-white/65 line-clamp-2">{promotion.description}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onEdit(promotion)}
        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-black hover:bg-[#F2529D] hover:text-white transition-colors"
      >
        <PencilLine size={12} />
        Edit
      </button>
      <button
        type="button"
        onClick={() => onDelete(promotion.id)}
        disabled={isDeletingId === promotion.id}
        className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-white px-3 py-2 text-[9px] font-black uppercase tracking-[0.3em] text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        <Trash2 size={12} />
        {isDeletingId === promotion.id ? '...' : 'Delete'}
      </button>
    </div>
  </article>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  textarea,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) => (
  <label className="space-y-2">
    <span className="text-[10px] font-black uppercase tracking-[0.35em] text-gray-400">{label}</span>
    {textarea ? (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-4 text-base focus:outline-none focus:border-[#F2529D] resize-none"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[1.25rem] border border-gray-200 bg-[#FAF9F6] px-4 py-4 text-base focus:outline-none focus:border-[#F2529D]"
        placeholder={placeholder}
      />
    )}
  </label>
);

const ToggleButton = ({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-[1.25rem] border px-4 py-4 text-left transition-all ${active ? 'bg-black text-white border-black' : 'bg-[#FAF9F6] text-gray-600 border-gray-200 hover:border-gray-300'}`}
  >
    <span className="block text-[10px] font-black uppercase tracking-[0.35em]" style={{ color: active ? accent : '#9CA3AF' }}>
      {label}
    </span>
    <span className="mt-2 block text-sm font-medium">{active ? 'Enabled' : 'Disabled'}</span>
  </button>
);

export default OffersManager;
