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
});

const formatDate = (value: string) => value || '—';

const OffersManager: React.FC<OffersManagerProps> = ({ authToken }) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [draft, setDraft] = useState<PromotionDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      setDraft(emptyDraft());
      return;
    }

    const selected = promotions.find((promotion) => promotion.id === editingId);
    if (selected) {
      setDraft({
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
      });
    }
  }, [editingId, promotions]);

  const featuredCount = useMemo(
    () => promotions.filter((promotion) => promotion.active && promotion.featured).length,
    [promotions],
  );

  const activeCount = useMemo(
    () => promotions.filter((promotion) => promotion.active).length,
    [promotions],
  );

  const savePromotion = async (event: React.FormEvent) => {
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
      };

      if (!payload.title || !payload.description || !payload.code || !payload.imageUrl) {
        throw new Error('Title, description, code, and image are required.');
      }

      if (editingId) {
        await updatePromotion({ promotionId: editingId, updates: payload, authToken });
        setMessage(`Updated ${payload.title}`);
      } else {
        await createPromotion({ promotion: payload, authToken });
        setMessage(`Added ${payload.title}`);
      }

      setEditingId(null);
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
    setMessage(null);
    setError(null);
  };

  const removePromotion = async (promotionId: string) => {
    if (!authToken) {
      return;
    }

    const confirmed = window.confirm('Delete this promotion?');
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
        setDraft(emptyDraft());
      }
      setMessage('Promotion removed');
      await loadPromotions();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete this offer.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraft(emptyDraft());
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
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10">
              <Sparkles size={16} className="text-[#F2529D]" />
              <span className="text-[10px] font-black uppercase tracking-[0.35em] text-white/50">Offers control</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display italic font-black leading-tight">
              Build the offers page exactly how you want it.
            </h2>
            <p className="max-w-2xl text-sm sm:text-lg text-white/70 leading-relaxed">
              The public offers page pulls from these promotions automatically. The active and featured counts drive the hero line and the current specials section.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatCard label="Active" value={activeCount} />
            <StatCard label="Featured" value={featuredCount} accent="#F2529D" />
            <StatCard label="Total" value={promotions.length} accent="#BF9C34" />
          </div>
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

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <form onSubmit={savePromotion} className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-gray-100 p-6 sm:p-8 lg:p-10 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.15)] space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3">
            <Plus className="text-[#F2529D]" size={20} />
            <h3 className="text-2xl sm:text-3xl font-display italic font-black text-[#0A0E1A]">
              {editingId ? 'Edit promotion' : 'Add exclusive discount'}
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title" value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} placeholder="Glow Membership" />
            <Field label="Discount code" value={draft.code} onChange={(value) => setDraft((current) => ({ ...current, code: value.toUpperCase() }))} placeholder="GLOW20" />
          </div>

          <Field
            label="Description"
            value={draft.description}
            onChange={(value) => setDraft((current) => ({ ...current, description: value }))}
            placeholder="Join our monthly membership for continuous care..."
            textarea
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Image URL" value={draft.imageUrl} onChange={(value) => setDraft((current) => ({ ...current, imageUrl: value }))} placeholder="https://..." />
            <Field label="Discount detail" value={draft.discountText} onChange={(value) => setDraft((current) => ({ ...current, discountText: value }))} placeholder="20% off select services" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hero tag" value={draft.tag} onChange={(value) => setDraft((current) => ({ ...current, tag: value }))} placeholder="Most Popular" />
            <Field label="Sort order" value={String(draft.sortOrder)} onChange={(value) => setDraft((current) => ({ ...current, sortOrder: Number(value) || 1 }))} placeholder="1" type="number" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" value={draft.startDate} onChange={(value) => setDraft((current) => ({ ...current, startDate: value }))} type="date" />
            <Field label="End date" value={draft.endDate} onChange={(value) => setDraft((current) => ({ ...current, endDate: value }))} type="date" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleButton
              label="Featured"
              active={draft.featured}
              onClick={() => setDraft((current) => ({ ...current, featured: !current.featured }))}
              accent="#F2529D"
            />
            <ToggleButton
              label="Active"
              active={draft.active}
              onClick={() => setDraft((current) => ({ ...current, active: !current.active }))}
              accent="#BF9C34"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setDraft((current) => ({ ...current, tag }))}
                className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${draft.tag === tag ? 'border-[#F2529D] bg-[#F2529D]/10 text-[#F2529D]' : 'border-gray-200 bg-white text-gray-500 hover:border-[#F2529D]/40 hover:text-[#F2529D]'}`}
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
              {isSaving ? 'Saving...' : editingId ? 'Update promotion' : 'Create promotion'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-gray-500 hover:text-[#F2529D] transition-colors"
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>

        <div className="rounded-[2rem] sm:rounded-[3rem] bg-[#0A0E1A] text-white p-6 sm:p-8 lg:p-10 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] border border-white/10 space-y-5 sm:space-y-6">
          <div>
            <h3 className="text-2xl sm:text-3xl font-display italic font-black">Current offers</h3>
            <p className="mt-2 text-sm sm:text-base text-white/65">Edit any card to change the public offers page instantly.</p>
          </div>

          <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-1">
            {promotions.map((promotion) => (
              <article key={promotion.id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <img src={promotion.imageUrl} alt={promotion.title} className="h-24 w-24 rounded-[1.25rem] object-cover flex-shrink-0" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[#F2529D]/30 bg-[#F2529D]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#FFB3D0]">{promotion.tag}</span>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] ${promotion.active ? 'border-emerald-300 bg-emerald-400/10 text-emerald-300' : 'border-white/15 bg-white/5 text-white/45'}`}>
                        {promotion.active ? 'Active' : 'Hidden'}
                      </span>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] ${promotion.featured ? 'border-[#BF9C34]/40 bg-[#BF9C34]/10 text-[#F5D37B]' : 'border-white/15 bg-white/5 text-white/45'}`}>
                        {promotion.featured ? 'Featured' : 'Standard'}
                      </span>
                    </div>
                    <h4 className="text-xl font-display italic font-black leading-tight text-white">{promotion.title}</h4>
                    <p className="text-sm leading-6 text-white/65">{promotion.description}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/45">Code: <span className="text-[#F5D37B]">{promotion.code}</span></p>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-[11px] font-black uppercase tracking-[0.3em] text-white/45">
                  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-3">Discount: <span className="text-white/75">{promotion.discountText}</span></div>
                  <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-3">Dates: <span className="text-white/75">{formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}</span></div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => startEditing(promotion)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black hover:bg-[#F2529D] hover:text-white transition-colors"
                  >
                    <PencilLine size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => removePromotion(promotion.id)}
                    disabled={isDeletingId === promotion.id}
                    className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    {isDeletingId === promotion.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}

            {promotions.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-white/55">
                No promotions yet. Create the first exclusive discount above.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] sm:rounded-[3rem] bg-white border border-gray-100 p-6 sm:p-8 lg:p-10 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-[#BF9C34]" size={20} />
          <h3 className="text-2xl sm:text-3xl font-display italic font-black text-[#0A0E1A]">How this drives the public page</h3>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3 text-sm text-gray-600 leading-relaxed">
          <div className="rounded-[1.25rem] bg-[#FAF9F6] p-5 border border-gray-100">
            The hero line becomes the live count of featured promotions, so the title updates automatically when the admin adds or removes exclusives.
          </div>
          <div className="rounded-[1.25rem] bg-[#FAF9F6] p-5 border border-gray-100">
            Current specials show the featured promotions in their own cards with the image, title, description, and tag that you set here.
          </div>
          <div className="rounded-[1.25rem] bg-[#FAF9F6] p-5 border border-gray-100">
            The full exclusive selection list uses all active promotions, so new offers appear on the offers page without any extra manual wiring.
          </div>
        </div>
      </div>
    </section>
  );
};

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

const StatCard = ({ label, value, accent = '#FFFFFF' }: { label: string; value: number; accent?: string }) => (
  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 sm:p-5 text-center">
    <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/45">{label}</p>
    <p className="mt-3 text-3xl sm:text-4xl font-display italic font-black" style={{ color: accent }}>{value}</p>
  </div>
);

export default OffersManager;
