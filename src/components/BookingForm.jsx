import React, { useState } from 'react';
import { CalendarDays, CheckCircle2, MessageCircle, Printer, Users } from 'lucide-react';
import api from '../lib/api.js';
import { businessWhatsAppNumber } from '../lib/config.js';

const formatter = new Intl.NumberFormat('en-IN');

function localDateValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-razorpay-checkout]');
    if (existingScript) {
      if (existingScript.dataset.failed === 'true') {
        reject(new Error('Payment checkout could not be loaded. Please try again.'));
        return;
      }
      existingScript.addEventListener('load', resolve, { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Payment checkout could not be loaded. Please try again.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.dataset.razorpayCheckout = 'true';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = resolve;
    script.onerror = () => {
      script.dataset.failed = 'true';
      reject(new Error('Payment checkout could not be loaded. Please try again.'));
    };
    document.body.appendChild(script);
  });
}

function displayDate(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

export default function BookingForm({ tour }) {
  const departures = (tour.departures || [])
    .filter(departure =>
      departure.seatsAvailable > 0 &&
      new Date(departure.startDate).getTime() > Date.now()
    )
    .sort((left, right) => new Date(left.startDate) - new Date(right.startDate));
  const [departureId, setDepartureId] = useState(departures[0]?._id || '');
  const [guests, setGuests] = useState(1);
  const [requestedDate, setRequestedDate] = useState(() => localDateValue());
  const [traveler, setTraveler] = useState({ name: '', email: '', phone: '' });
  const [order, setOrder] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedDeparture = departures.find(item => item._id === departureId);
  const isInquiry = tour.isPlaceInquiry || tour.isSample;
  const inquiryMessage = encodeURIComponent([
    'Hello, I would like to enquire about a Bihar trip.',
    `Trip: ${tour.title} - ${tour.destination}`,
    requestedDate ? `Preferred date: ${displayDate(requestedDate)}` : 'Preferred date: flexible',
    `Travelers: ${guests}`,
    tour.isSample
      ? `Illustrative estimate only: INR ${formatter.format(Number(tour.price || 0) * guests)} total. Please confirm actual availability and price.`
      : 'Please share current availability and pricing.'
  ].join('\n'));

  function updateTraveler(event) {
    setTraveler(current => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function openCheckout(checkoutOrder) {
    setError('');
    setIsSubmitting(true);
    try {
      await loadRazorpay();
      const checkout = new window.Razorpay({
        key: checkoutOrder.keyId,
        amount: checkoutOrder.order.amount,
        currency: checkoutOrder.order.currency,
        name: 'WanderBihar',
        description: tour.title,
        order_id: checkoutOrder.order.id,
        prefill: {
          name: traveler.name,
          email: traveler.email,
          contact: traveler.phone
        },
        notes: { bookingId: checkoutOrder.bookingId },
        theme: { color: '#173D32' },
        modal: {
          ondismiss: () => setIsSubmitting(false)
        },
        handler: async response => {
          setIsSubmitting(true);
          setError('');
          try {
            const { data } = await api.post('/bookings/verify-payment', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            if (data.booking?.paymentStatus !== 'paid' || data.booking?.status !== 'confirmed') {
              throw new Error('Payment is still being verified. Please contact support before trying again.');
            }
            setConfirmation(data.booking);
            setOrder(null);
          } catch (verificationError) {
            setError(verificationError.response?.data?.message || verificationError.message || 'Payment verification failed. Your booking is not confirmed.');
          } finally {
            setIsSubmitting(false);
          }
        }
      });
      checkout.on('payment.failed', response => {
        setError(response.error?.description || 'Payment was not completed. You can try again using the same order.');
        setIsSubmitting(false);
      });
      checkout.open();
    } catch (checkoutError) {
      setError(checkoutError.message || 'Unable to start payment. Please try again.');
      setIsSubmitting(false);
    }
  }

  async function createOrder(event) {
    event.preventDefault();
    if (!selectedDeparture) {
      setError('Choose an available departure before continuing.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/bookings/create-order', {
        tourId: tour._id,
        departureId,
        guests,
        traveler
      });
      setOrder(data);
      await openCheckout(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to create your booking. Please try again.');
      setIsSubmitting(false);
    }
  }

  if (confirmation) {
    return (
      <section className="space-y-4 rounded-2xl border border-leaf/20 bg-white p-5" aria-live="polite">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 shrink-0 text-leaf" size={22} />
          <div>
            <h3 className="font-semibold text-ink">Booking confirmed</h3>
            <p className="mt-1 text-sm text-ink/60">Payment verified securely. Your trip is confirmed.</p>
          </div>
        </div>
        <div className="rounded-xl bg-mist p-4 text-sm">
          <p className="font-semibold text-ink">{tour.title}</p>
          <p className="mt-1 text-ink/60">{tour.destination} · {selectedDeparture ? displayDate(selectedDeparture.startDate) : 'Departure selected'}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 border-t border-ink/10 pt-4 text-sm">
          <div><dt className="text-xs text-ink/50">Reference</dt><dd className="mt-1 font-semibold">{confirmation.confirmationCode}</dd></div>
          <div><dt className="text-xs text-ink/50">Status</dt><dd className="mt-1 font-semibold capitalize">{confirmation.status}</dd></div>
          <div><dt className="text-xs text-ink/50">Travelers</dt><dd className="mt-1 font-semibold">{confirmation.guests}</dd></div>
          <div><dt className="text-xs text-ink/50">Amount paid</dt><dd className="mt-1 font-semibold">₹{formatter.format(confirmation.pricing.total)}</dd></div>
          <div><dt className="text-xs text-ink/50">Payment</dt><dd className="mt-1 font-semibold capitalize">{confirmation.paymentStatus}</dd></div>
        </dl>
        <button type="button" onClick={() => window.print()} className="button-outline w-full">
          <Printer size={16} /> Print confirmation
        </button>
      </section>
    );
  }

  if (isInquiry) {
    return (
      <div className="space-y-4">
        {tour.isSample ? (
          <div className="space-y-4 rounded-2xl border border-ink/10 bg-white p-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block min-w-0 text-xs font-semibold text-ink/70">
                <span className="mb-2 flex items-center gap-1.5"><CalendarDays size={15} className="text-leaf" /> Travel date</span>
                <input
                  type="date"
                  min={localDateValue()}
                  value={requestedDate}
                  onChange={event => setRequestedDate(event.target.value)}
                  className="min-h-11 w-full min-w-0 rounded-xl border border-ink/15 bg-white px-2 text-xs font-medium text-ink sm:px-3 sm:text-sm"
                  aria-label="Preferred travel date"
                />
              </label>
              <label className="block min-w-0 text-xs font-semibold text-ink/70">
                <span className="mb-2 flex items-center gap-1.5"><Users size={15} className="text-leaf" /> Travelers</span>
                <select
                  value={guests}
                  onChange={event => setGuests(Number(event.target.value))}
                  className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-2 text-xs font-medium text-ink sm:px-3 sm:text-sm"
                  aria-label="Number of travelers"
                >
                  {Array.from({ length: 20 }, (_, index) => index + 1).map(count => (
                    <option key={count} value={count}>{count} {count === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-xl bg-mist p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-ink/55">Illustrative price per person</p>
                  <p className="mt-1 text-lg font-semibold text-ink">₹{formatter.format(Number(tour.price || 0))}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink/55">Estimated for {guests}</p>
                  <p className="mt-1 text-lg font-semibold text-leaf">₹{formatter.format(Number(tour.price || 0) * guests)}</p>
                </div>
              </div>
            </div>
            {/* <p className="rounded-xl bg-saffron/10 p-3 text-xs leading-relaxed text-ink/70">
              Preview only: the selected date, availability, and price are not live. Send an enquiry to confirm the actual trip details.
            </p> */}
          </div>
        ) : (
          <p className="rounded-xl bg-saffron/10 p-4 text-sm leading-relaxed text-ink/70">
            This location does not currently have a published package. Ask our team about a custom trip.
          </p>
        )}
        <a
          className="button-dark w-full justify-center"
          href={`https://wa.me/${businessWhatsAppNumber}?text=${inquiryMessage}`}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={17} /> Ask about this trip
        </a>
      </div>
    );
  }

  if (!departures.length) {
    return (
      <p className="rounded-xl bg-saffron/10 p-4 text-sm leading-relaxed text-ink/70" role="status">
        There are no bookable departures for this package right now. Please check back later or contact us to enquire about future dates.
      </p>
    );
  }

  const maxGuests = Math.min(20, selectedDeparture?.seatsAvailable || 1);
  const subtotal = order?.pricing?.subtotal ?? Number(tour.price) * guests;
  const tax = order?.pricing?.tax ?? Math.round(subtotal * 0.05);
  const total = order?.pricing?.total ?? subtotal + tax;

  return (
    <form onSubmit={createOrder} className="space-y-4">
      <label className="block text-xs font-semibold text-ink/75">
        Available departure
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm font-medium text-ink"
          value={departureId}
          disabled={Boolean(order) || isSubmitting}
          onChange={event => {
            setDepartureId(event.target.value);
            setGuests(1);
          }}
          required
        >
          {departures.map(departure => (
            <option key={departure._id} value={departure._id}>
              {displayDate(departure.startDate)}
              {departure.endDate && new Date(departure.endDate).toDateString() !== new Date(departure.startDate).toDateString()
                ? ` – ${displayDate(departure.endDate)}`
                : ''} · {departure.seatsAvailable} {departure.seatsAvailable === 1 ? 'seat' : 'seats'}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-xs font-semibold text-ink/75">
        Travelers
        <select
          className="mt-2 min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm text-ink"
          value={guests}
          disabled={Boolean(order) || isSubmitting}
          onChange={event => setGuests(Number(event.target.value))}
        >
          {Array.from({ length: maxGuests }, (_, index) => index + 1).map(count => (
            <option key={count} value={count}>{count} {count === 1 ? 'traveler' : 'travelers'}</option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-semibold text-ink/75">Lead traveler</legend>
        <label className="sr-only" htmlFor="booking-name">Full name</label>
        <input id="booking-name" name="name" autoComplete="name" maxLength={80} required disabled={Boolean(order) || isSubmitting} value={traveler.name} onChange={updateTraveler} placeholder="Full name" className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm disabled:opacity-60" />
        <label className="sr-only" htmlFor="booking-email">Email address</label>
        <input id="booking-email" name="email" type="email" autoComplete="email" maxLength={254} required disabled={Boolean(order) || isSubmitting} value={traveler.email} onChange={updateTraveler} placeholder="Email address" className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm disabled:opacity-60" />
        <label className="sr-only" htmlFor="booking-phone">Mobile number</label>
        <input id="booking-phone" name="phone" type="tel" autoComplete="tel" maxLength={30} required disabled={Boolean(order) || isSubmitting} value={traveler.phone} onChange={updateTraveler} placeholder="Mobile number" className="min-h-11 w-full rounded-xl border border-ink/15 bg-white px-3 text-sm disabled:opacity-60" />
      </fieldset>

      <div className="space-y-2 border-t border-ink/10 pt-4 text-sm">
        <div className="flex justify-between text-ink/60"><span>Package · ₹{formatter.format(tour.price)} × {guests}</span><span>₹{formatter.format(subtotal)}</span></div>
        <div className="flex justify-between text-ink/60"><span>Taxes</span><span>₹{formatter.format(tax)}</span></div>
        <div className="flex justify-between border-t border-ink/10 pt-3 font-semibold text-ink"><span>Total</span><span>₹{formatter.format(total)}</span></div>
        <p className="text-xs text-ink/45">Final pricing is recalculated by the server when your order is created.</p>
      </div>

      {error && <p className="rounded-lg bg-coral/10 p-3 text-sm text-coral" role="alert">{error}</p>}

      {order ? (
        <button type="button" disabled={isSubmitting} onClick={() => openCheckout(order)} className="button-dark w-full justify-center disabled:cursor-wait disabled:opacity-60">
          {isSubmitting ? 'Opening secure checkout…' : 'Continue secure payment'}
        </button>
      ) : (
        <button type="submit" disabled={isSubmitting || !selectedDeparture} className="button-dark w-full justify-center disabled:cursor-wait disabled:opacity-60">
          {isSubmitting ? 'Preparing secure checkout…' : 'Continue to payment'}
        </button>
      )}
      <p className="text-center text-xs text-ink/50">Guest checkout is available. Your booking is confirmed only after server verification of your Razorpay payment.</p>
    </form>
  );
}
