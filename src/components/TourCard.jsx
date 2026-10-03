import React, { useRef } from "react";
import { gsap, useGSAP } from "../lib/gsap.js";
import { ArrowUpRight, Clock3, MapPin, Star } from "lucide-react";

const formatter = new Intl.NumberFormat("en-IN");

export default function TourCard({ tour, onSelect }) {
  const cardRef = useRef(null);
  const image =
    tour.images?.[0] ||
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85";
  const isBodhGaya = tour.destination === "Bodh Gaya";
  const isNalanda = tour.slug?.includes("nalanda");
  const fitImage = isBodhGaya || isNalanda;
  const imageFitClass = isBodhGaya ? "bodh-gaya" : "nalanda";
  useGSAP(() => {
    const card = cardRef.current;
    const image = card.querySelector(".tour-image");
    const arrow = card.querySelector(".image-arrow");
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(card, { transformPerspective: 900, transformOrigin: "center" });
      const hover = gsap.timeline({ paused: true })
        .to(card, { y: -8, scale: 1.015, boxShadow: "0 22px 38px -30px rgba(24,51,47,.65)", duration: 0.28, ease: "power3.out" }, 0)
        .to(image, { scale: 1.08, duration: 0.35, ease: "power3.out" }, 0)
        .to(arrow, { y: 0, autoAlpha: 1, duration: 0.18, ease: "power2.out" }, 0);
      const rotateXTo = gsap.quickTo(card, "rotationX", { duration: 0.38, ease: "power3.out" });
      const rotateYTo = gsap.quickTo(card, "rotationY", { duration: 0.38, ease: "power3.out" });
      const onPointerMove = event => {
        if (event.pointerType === "touch") return;
        const bounds = card.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
        rotateXTo(vertical * -5);
        rotateYTo(horizontal * 7);
      };
      const onEnter = () => hover.play();
      const onLeave = () => {
        hover.reverse();
        rotateXTo(0);
        rotateYTo(0);
      };
      const onFocusOut = event => {
        if (!card.contains(event.relatedTarget)) onLeave();
      };
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointermove", onPointerMove);
      card.addEventListener("pointerleave", onLeave);
      card.addEventListener("focusin", onEnter);
      card.addEventListener("focusout", onFocusOut);

      return () => {
        card.removeEventListener("pointerenter", onEnter);
        card.removeEventListener("pointermove", onPointerMove);
        card.removeEventListener("pointerleave", onLeave);
        card.removeEventListener("focusin", onEnter);
        card.removeEventListener("focusout", onFocusOut);
        hover.kill();
      };
    });

    return () => media.revert();
  }, { scope: cardRef });

  return (
    <article
      ref={cardRef}
      className="tour-card group"
    >
      <button
        onClick={() => onSelect(tour)}
        className="block w-full text-left"
        aria-label={`View ${tour.title}`}
      >
        <div
          className={`tour-image-wrap ${fitImage ? `tour-image-wrap-${imageFitClass}` : ""}`}
          style={fitImage ? { "--tour-photo": `url("${image}")` } : undefined}
        >
          <img
            className={`tour-image ${fitImage ? `tour-image-${imageFitClass}` : ""}`}
            src={image}
            alt={tour.title}
            loading="lazy"
          />
          <span className="category-tag">{tour.category}</span>
          <span className="image-arrow">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <div className="px-1 pb-1 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-ink/60">
              <MapPin size={14} className="shrink-0 text-coral" />
              {tour.destination}
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink">
              <Star size={14} fill="currentColor" className="text-coral" />
              {Number(tour.averageRating || 0).toFixed(2)}{" "}
              <span className="font-normal text-ink/45">
                ({tour.reviewCount || 0})
              </span>
            </span>
          </div>
          <h3 className="font-display text-[21px] leading-snug text-ink group-hover:text-leaf">
            {tour.title}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[42px] text-sm leading-relaxed text-ink/60">
            {tour.summary}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3.5">
            <span className="flex items-center gap-1.5 text-xs text-ink/55">
              <Clock3 size={14} />
              {tour.durationDays} {tour.durationDays === 1 ? "day" : "days"}
            </span>
            <span className="text-sm font-semibold text-ink">
              ₹{formatter.format(tour.price)}{" "}
              <span className="font-normal text-ink/50">/ person</span>
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}
