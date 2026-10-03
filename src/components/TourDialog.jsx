import React, { useEffect, useRef } from 'react';
import { gsap, useGSAP } from '../lib/gsap.js';
import { CalendarDays, MapPin, Star, X } from 'lucide-react';
import BookingForm from './BookingForm.jsx';

export default function TourDialog({ tour, onClose }) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const imageRef = useRef(null);
  const closingRef = useRef(false);

  const { contextSafe } = useGSAP(() => {
    closingRef.current = false;
    if (!tour) return undefined;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const entrance = gsap.timeline();
      entrance.fromTo(overlayRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22, ease: 'power1.out' });
      entrance.fromTo(panelRef.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' }, 0);
      if (imageRef.current) entrance.fromTo(imageRef.current, { autoAlpha: 0, scale: 1.025 }, { autoAlpha: 1, scale: 1, duration: 0.65, ease: 'power2.out' }, 0.1);
      return () => entrance.kill();
    });
    return () => media.revert();
  }, { scope: overlayRef, dependencies: [tour], revertOnUpdate: true });

  const closeDialog = contextSafe(() => {
    if (!tour || closingRef.current) return;
    closingRef.current = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onClose();
      return;
    }
    gsap.timeline({ onComplete: onClose })
      .to(panelRef.current, { autoAlpha: 0, y: 20, duration: 0.18, ease: 'power2.in' })
      .to(overlayRef.current, { autoAlpha: 0, duration: 0.16, ease: 'power1.in' }, 0);
  });
  const closeDialogRef = useRef(closeDialog);
  closeDialogRef.current = closeDialog;

  useEffect(() => {
    if (!tour) return undefined;
    const handleKey = event => event.key === 'Escape' && closeDialogRef.current();
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [tour]);

  return tour && <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event => event.target === event.currentTarget && closeDialogRef.current()}>
      <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="tour-dialog-title" className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-t-2xl bg-mist shadow-2xl sm:rounded-2xl">
        <div className="relative grid md:grid-cols-[1.1fr_.9fr]">
          <button onClick={() => closeDialogRef.current()} aria-label="Close tour details" className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow"><X size={19} /></button>
          <div className="min-h-[280px] bg-ink/10 md:min-h-[620px]">
            {tour.isPlaceInquiry && tour.coordinates ? <iframe title={`Map of ${tour.destination}`} className="h-full min-h-[280px] w-full md:min-h-[620px]" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${tour.coordinates.longitude - 0.08}%2C${tour.coordinates.latitude - 0.05}%2C${tour.coordinates.longitude + 0.08}%2C${tour.coordinates.latitude + 0.05}&layer=mapnik&marker=${tour.coordinates.latitude}%2C${tour.coordinates.longitude}`} /> : <img ref={imageRef} src={tour.images?.[0]} alt={tour.title} className="h-full min-h-[280px] w-full object-cover md:min-h-[620px]" />}
          </div>
          <div className="p-5 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.12em] text-leaf"><MapPin size={14} />{tour.destination}</div>
            <h2 id="tour-dialog-title" className="mt-3 font-display text-3xl leading-tight text-ink">{tour.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/65">{tour.summary}</p>
            {!tour.isPlaceInquiry && <div className="mt-4 flex items-center gap-4 text-sm text-ink/65"><span className="flex items-center gap-1.5"><Star size={15} fill="currentColor" className="text-coral" />{Number(tour.averageRating || 0).toFixed(2)} ({tour.reviewCount || 0} reviews)</span><span className="flex items-center gap-1.5"><CalendarDays size={15} />{tour.durationDays} days</span></div>}
            {!tour.isPlaceInquiry && tour.coordinates?.latitude && <a className="mt-5 block overflow-hidden rounded-xl border border-ink/10" href={`https://www.openstreetmap.org/?mlat=${tour.coordinates.latitude}&mlon=${tour.coordinates.longitude}#map=9/${tour.coordinates.latitude}/${tour.coordinates.longitude}`} target="_blank" rel="noreferrer" aria-label={`Open ${tour.destination} on OpenStreetMap`}>
              <iframe title={`${tour.destination} map`} className="pointer-events-none h-36 w-full" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${tour.coordinates.longitude - 0.4}%2C${tour.coordinates.latitude - 0.25}%2C${tour.coordinates.longitude + 0.4}%2C${tour.coordinates.latitude + 0.25}&layer=mapnik&marker=${tour.coordinates.latitude}%2C${tour.coordinates.longitude}`} />
            </a>}
            <div className="my-6 border-t border-ink/10" />
            <BookingForm tour={tour} onClose={onClose} />
          </div>
        </div>
      </section>
    </div>;
}