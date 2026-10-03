import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Minus, Plus } from 'lucide-react';

function getDateKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Date(`${getDateKey(value)}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    timeZone: 'UTC'
  });
}

export default function BookingForm({ tour, onClose }) {
  const dates = tour.departures || [];
  const availableDepartures = dates.filter(date => date.seatsAvailable > 0 && !Number.isNaN(new Date(date.startDate).getTime()));
  const firstDeparture = availableDepartures[0];
  const departureByDate = new Map(availableDepartures.map(date => [getDateKey(date.startDate), date]));
  const [selectedDate, setSelectedDate] = useState(firstDeparture ? getDateKey(firstDeparture.startDate) : '');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const date = firstDeparture ? new Date(getDateKey(firstDeparture.startDate)) : new Date();
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  });
  const [guests, setGuests] = useState(2);
  const departure = departureByDate.get(selectedDate);
  const formattedDate = selectedDate ? formatDate(selectedDate) : 'Please choose a date';
  const estimatedTotal = new Intl.NumberFormat('en-IN').format(tour.price * guests);
  const whatsappMessage = [
    'Hello, I would like to request a booking.',
    `Trip: ${tour.title} - ${tour.destination}, Bihar`,
    `Start date: ${formattedDate}`,
    `People: ${guests}`,
    tour.isPlaceInquiry
      ? 'Please share the available options and price.'
      : departure
        ? `Estimated amount: INR ${estimatedTotal}`
        : 'This date is not listed; please confirm availability and the final price.',
    'Please confirm availability and the final price.'
  ].join('\n');
  const whatsappUrl = `https://wa.me/917004719341?text=${encodeURIComponent(whatsappMessage)}`;
  const year = calendarMonth.getUTCFullYear();
  const month = calendarMonth.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const calendarCells = Array.from({ length: 42 }, (_, index) => {
    const day = index - firstWeekday + 1;
    return day < 1 || day > daysInMonth ? null : new Date(Date.UTC(year, month, day));
  });
  const today = new Date();
  const currentMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const isCurrentMonth = year === currentMonth.getUTCFullYear() && month === currentMonth.getUTCMonth();

  function changeMonth(offset) {
    setCalendarMonth(new Date(Date.UTC(year, month + offset, 1)));
  }

  function sendBookingRequest(event) {
    event.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <form onSubmit={sendBookingRequest} className="space-y-4">
      <fieldset className="min-w-0">
        <legend className="mb-2 text-xs font-semibold text-ink/75">Choose your date</legend>
        <div className="rounded-xl border border-ink/10 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className="grid size-8 place-items-center rounded-full text-ink hover:bg-ink/5 disabled:opacity-30" onClick={() => changeMonth(-1)} disabled={isCurrentMonth} aria-label="Previous month"><ChevronLeft size={18} /></button>
            <p className="text-sm font-semibold text-ink">{calendarMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
            <button type="button" className="grid size-8 place-items-center rounded-full text-ink hover:bg-ink/5" onClick={() => changeMonth(1)} aria-label="Next month"><ChevronRight size={18} /></button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-[10px] font-medium text-ink/45" aria-hidden="true">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <span key={day} className="py-1">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1" role="group" aria-label="Choose a travel date">
            {calendarCells.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} className="aspect-square" aria-hidden="true" />;
              const dateKey = date.toISOString().slice(0, 10);
              const availableDeparture = departureByDate.get(dateKey);
              const isPastDate = dateKey < new Date().toISOString().slice(0, 10);
              const selected = dateKey === selectedDate;
              return <button
                key={dateKey}
                type="button"
                disabled={isPastDate}
                aria-pressed={selected}
                aria-label={availableDeparture ? `${formatDate(dateKey)}, ${availableDeparture.seatsAvailable} spots available` : `${formatDate(dateKey)}, request availability`}
                onClick={() => setSelectedDate(dateKey)}
                className={`relative aspect-square rounded-lg text-xs transition-colors disabled:cursor-not-allowed disabled:text-ink/25 ${selected ? 'bg-leaf font-semibold text-white' : 'font-medium text-ink hover:bg-leaf/10'}`}
              >{date.getUTCDate()}{availableDeparture && <span className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${selected ? 'bg-white' : 'bg-coral'}`} aria-hidden="true" />}</button>;
            })}
          </div>
          <p className="mt-3 border-t border-ink/10 pt-2 text-xs text-ink/55" aria-live="polite">{selectedDate ? `${formattedDate}${departure ? ` · ${departure.seatsAvailable} spots left` : ' · availability on request'}` : 'Select a future date'}</p>
          {availableDepartures.length > 0 && <p className="mt-1 text-[10px] text-ink/45">Marked dates have scheduled departures; other dates can be requested.</p>}
        </div>
      </fieldset>
      <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink">People</p>
          <p className="mt-0.5 text-xs text-ink/55">How many are travelling?</p>
        </div>
        <div className="flex h-10 items-center gap-3">
          <button type="button" className="grid size-9 place-items-center rounded-full border border-ink/15 text-ink hover:bg-ink/5 disabled:opacity-40" onClick={() => setGuests(Math.max(1, guests - 1))} aria-label="Remove one person" disabled={guests <= 1}><Minus size={15} /></button>
          <span className="min-w-5 text-center text-sm font-semibold" aria-live="polite">{guests}</span>
          <button type="button" className="grid size-9 place-items-center rounded-full border border-ink/15 text-ink hover:bg-ink/5 disabled:opacity-40" onClick={() => setGuests(Math.min(20, guests + 1))} aria-label="Add one person" disabled={guests >= 20}><Plus size={15} /></button>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
        <span className="text-ink/60">{tour.isPlaceInquiry ? 'Price' : `Estimated · ₹${new Intl.NumberFormat('en-IN').format(tour.price)} / person`}</span>
        <span className="font-semibold text-ink">{tour.isPlaceInquiry ? 'Quote on request' : `₹${estimatedTotal}`}</span>
      </div>
      <button type="submit" disabled={!selectedDate} className="button-dark w-full justify-center disabled:cursor-not-allowed disabled:opacity-60">
        <MessageCircle size={17} /> {tour.isPlaceInquiry ? 'Request this destination' : 'Request booking on WhatsApp'}
      </button>
      <p className="text-center text-xs text-ink/50">WhatsApp will open with your trip details. Booking is confirmed after we reply.</p>
      <button type="button" className="sr-only" onClick={onClose}>Close booking</button>
    </form>
  );
}