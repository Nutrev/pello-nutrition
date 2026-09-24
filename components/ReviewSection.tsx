"use client";

import { useState, useEffect, useCallback } from "react";
import type { Review, AttributeAverages } from "@/lib/supabase";
import { Category } from "@/lib/products";

interface ReviewSectionProps {
  productId: string;
  category?: Category;
}

// Which attributes to show based on category
function getAttributesForCategory(category?: Category): {
  key: string;
  label: string;
  field: string;
}[] {
  const isFuelling = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration"].includes(category ?? "");
  const isProtein = category === "Protein";
  const isSupplement = ["Creatine", "Supplement", "Probiotic", "Omega-3", "Vitamin", "Mineral", "Recovery & Sleep"].includes(category ?? "");

  if (isFuelling) {
    return [
      { key: "taste", label: "Taste", field: "tasteRating" },
      { key: "gi_comfort", label: "GI comfort", field: "giComfortRating" },
      { key: "energy", label: "Energy effect", field: "energyRating" },
      { key: "value", label: "Value for money", field: "valueRating" },
    ];
  }
  if (isProtein) {
    return [
      { key: "taste", label: "Taste", field: "tasteRating" },
      { key: "effectiveness", label: "Effectiveness", field: "effectivenessRating" },
      { key: "mixability", label: "Mixability", field: "mixabilityRating" },
      { key: "value", label: "Value for money", field: "valueRating" },
    ];
  }
  if (isSupplement) {
    return [
      { key: "effectiveness", label: "Effectiveness", field: "effectivenessRating" },
      { key: "gi_comfort", label: "GI comfort", field: "giComfortRating" },
      { key: "value", label: "Value for money", field: "valueRating" },
    ];
  }
  return [
    { key: "taste", label: "Taste", field: "tasteRating" },
    { key: "effectiveness", label: "Effectiveness", field: "effectivenessRating" },
    { key: "value", label: "Value for money", field: "valueRating" },
  ];
}

function StarRating({
  rating,
  onRate,
  interactive = false,
  size = "md",
}: {
  rating: number;
  onRate?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const textSize = size === "sm" ? "text-base" : "text-xl";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={() => interactive && onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${textSize} transition-colors ${interactive ? "cursor-pointer" : "cursor-default"} ${
            star <= (hovered || rating) ? "text-amber" : "text-sand"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function AttributeBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null;
  const pct = ((value - 1) / 4) * 100;
  const color = pct >= 70 ? "#2D4A2D" : pct >= 45 ? "#C8860A" : "#B84C2E";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-mono font-medium">{value.toFixed(1)}/5</span>
      </div>
      <div className="h-1.5 bg-sand rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ReviewSection({ productId, category }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [attributeAverages, setAttributeAverages] = useState<AttributeAverages | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const attributes = getAttributesForCategory(category);

  // Form state
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [attrRatings, setAttrRatings] = useState<Record<string, number>>({});

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setAttributeAverages(data.attributeAverages ?? null);
    } catch {
      setReviews([]);
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select an overall star rating"); return; }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name,
          rating,
          comment,
          tasteRating: attrRatings["tasteRating"] ?? null,
          giComfortRating: attrRatings["giComfortRating"] ?? null,
          energyRating: attrRatings["energyRating"] ?? null,
          valueRating: attrRatings["valueRating"] ?? null,
          effectivenessRating: attrRatings["effectivenessRating"] ?? null,
          mixabilityRating: attrRatings["mixabilityRating"] ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); setSubmitting(false); return; }
      setSubmitted(true);
      setShowForm(false);
      setName(""); setRating(0); setComment(""); setAttrRatings({});
      await fetchReviews();
    } catch {
      setError("Could not submit review. Please try again.");
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const hasAttributeData = attributeAverages && Object.entries(attributeAverages)
    .some(([k, v]) => k !== "count" && v !== null);

  return (
    <div className="max-w-5xl mx-auto px-6 mt-6">
      <div className="card">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display font-semibold text-base mb-1">Community reviews</h2>
            {avgRating ? (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(Number(avgRating))} size="sm" />
                <span className="font-display font-bold text-2xl">{avgRating}</span>
                <span className="text-xs text-muted">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
              </div>
            ) : (
              <p className="text-sm text-muted">No reviews yet — be the first!</p>
            )}
          </div>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setSubmitted(false); }} className="btn-primary text-xs py-1.5 px-3">
              Write a review
            </button>
          )}
        </div>

        {/* Rating breakdown */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Star breakdown */}
            <div className="space-y-1.5">
              {ratingCounts.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted w-4">{star}</span>
                  <span className="text-amber text-xs">★</span>
                  <div className="flex-1 h-1.5 bg-sand rounded-full overflow-hidden">
                    <div className="h-full bg-amber rounded-full transition-all"
                      style={{ width: reviews.length ? `${(count / reviews.length) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-xs font-mono text-muted w-4">{count}</span>
                </div>
              ))}
            </div>

            {/* Attribute averages */}
            {hasAttributeData && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Community ratings</div>
                {attributes.map((attr) => (
                  <AttributeBar
                    key={attr.key}
                    label={attr.label}
                    value={(attributeAverages as any)[attr.key]}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Success message */}
        {submitted && (
          <div className="bg-moss/10 border border-moss/20 rounded-xl p-4 mb-4 text-sm text-moss font-medium">
            ✓ Thanks for your review! It's now live.
          </div>
        )}

        {/* Review form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-sand/30 rounded-xl p-5 mb-6">
            <h3 className="font-display font-semibold text-sm mb-4">Your review</h3>

            {/* Overall rating */}
            <div className="mb-4">
              <label className="text-xs text-muted font-mono mb-1 block">Overall rating</label>
              <StarRating rating={rating} onRate={setRating} interactive />
            </div>

            {/* Attribute ratings */}
            {attributes.length > 0 && (
              <div className="mb-4">
                <label className="text-xs text-muted font-mono mb-2 block">Rate specific aspects (optional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attributes.map((attr) => (
                    <div key={attr.key} className="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
                      <span className="text-xs text-muted">{attr.label}</span>
                      <StarRating
                        rating={attrRatings[attr.field] ?? 0}
                        onRate={(r) => setAttrRatings((prev) => ({ ...prev, [attr.field]: r }))}
                        interactive
                        size="sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Name */}
            <div className="mb-3">
              <label className="text-xs text-muted font-mono mb-1 block">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex T."
                maxLength={50}
                required
                className="w-full bg-white/80 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted font-body placeholder:text-muted"
              />
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label className="text-xs text-muted font-mono mb-1 block">Your review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think? How did it work for you?"
                rows={4}
                minLength={10}
                maxLength={2000}
                required
                className="w-full bg-white/80 border border-sand rounded-lg px-3 py-2 text-sm outline-none focus:border-muted font-body placeholder:text-muted resize-none"
              />
            </div>

            {error && <p className="text-xs text-rust mb-3">{error}</p>}

            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary text-sm flex items-center gap-2">
                {submitting
                  ? <><span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-cream/40 border-t-cream rounded-full" />Submitting...</>
                  : "Submit review"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews list */}
        {loading ? (
          <div className="text-center py-8 text-muted text-sm">
            <span className="animate-spin inline-block w-4 h-4 border-2 border-sand border-t-muted rounded-full mr-2" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <p className="text-sm">No community reviews yet.</p>
            <p className="text-xs mt-1">Be the first to share your experience.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reviews.map((review) => (
              <div key={review.id} className="pb-5 border-b border-sand last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <span className="font-medium text-sm">{review.name}</span>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <span className="text-xs font-mono text-muted">{timeAgo(review.created_at)}</span>
                </div>

                {/* Attribute ratings on individual review */}
                {attributes.some((a) => (review as any)[`${a.key}_rating`] != null) && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {attributes.map((attr) => {
                      const val = (review as any)[`${attr.key}_rating`];
                      if (!val) return null;
                      return (
                        <span key={attr.key} className="text-xs bg-sand px-2 py-0.5 rounded-md font-mono">
                          {attr.label}: {val}/5
                        </span>
                      );
                    })}
                  </div>
                )}

                <p className="text-sm leading-relaxed text-ink/80 mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}