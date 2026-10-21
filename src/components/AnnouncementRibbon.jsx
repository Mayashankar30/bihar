import React from 'react';
import { Flame, Compass, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { businessWhatsAppNumber } from '../lib/config';

// Fallback number if config is ever undefined
const WHATSAPP_PHONE = businessWhatsAppNumber || '917004719341';

const ANNOUNCEMENTS = [
  {
    badge: 'HOT DEAL',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    icon: Flame,
    iconColor: 'text-rose-400',
    text: 'Guided Bihar day tours starting',
    highlight: 'under ₹999!',
    linkText: 'Claim deal',
    whatsappText: 'Hi WanderBihar! I would like to claim the exclusive day tour offer under ₹999. Please share package details and availability.'
  },
  {
    badge: 'POPULAR',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: Compass,
    iconColor: 'text-amber-400',
    text: 'Explore Bodh Gaya, Nalanda & Rajgir with',
    highlight: 'verified local guides.',
    linkText: 'Explore',
    whatsappText: 'Hi WanderBihar! I am interested in exploring Bodh Gaya, Nalanda, and Rajgir with a guide. Please share the itinerary options.'
  },
  {
    badge: 'EASY BOOKING',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    icon: MessageCircle,
    iconColor: 'text-emerald-400',
    text: 'Instant WhatsApp assistance & custom itinerary planning',
    highlight: '24/7 available.',
    linkText: 'Chat now',
    whatsappText: 'Hi WanderBihar! I need help planning a custom trip to Bihar. Could you help me with an itinerary?'
  },
  {
    badge: 'GROUP SPECIAL',
    badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    icon: Sparkles,
    iconColor: 'text-teal-400',
    text: 'Weekend group packages:',
    highlight: 'Save up to 20% off!',
    linkText: 'View tours',
    whatsappText: 'Hi WanderBihar! I want to enquire about the 20% discount on weekend group tour packages.'
  }
];

export default function AnnouncementRibbon() {
  return (
    <aside 
      className="relative w-full overflow-hidden bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950 text-slate-100 py-2 text-xs sm:text-sm font-medium border-y border-amber-500/20 shadow-md select-none"
      aria-label="Promotional announcements"
    >
      {/* Edge gradient fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-slate-950 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-slate-950 to-transparent z-10" />

      {/* Embedded CSS animation */}
      <style>{`
        @keyframes scrollLtr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: scrollLtr 32s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-track flex items-center gap-10 whitespace-nowrap">
        {[...ANNOUNCEMENTS, ...ANNOUNCEMENTS].map((item, index) => {
          const Icon = item.icon;
          const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(item.whatsappText)}`;

          return (
            <a
              key={index}
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-3 py-1 rounded-lg group hover:bg-white/10 transition-colors cursor-pointer"
              title={`Chat on WhatsApp about ${item.badge}`}
            >
              {/* Category Pill Badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider border ${item.badgeClass}`}>
                <Icon size={12} className={`${item.iconColor} animate-pulse`} aria-hidden="true" />
                {item.badge}
              </span>

              {/* Main Text & Highlight */}
              <span className="text-slate-200">
                {item.text} <strong className="text-amber-400 font-bold underline decoration-amber-500/50 underline-offset-2">{item.highlight}</strong>
              </span>

              {/* Clickable link text */}
              <span className="inline-flex items-center text-teal-300 font-semibold text-xs group-hover:text-amber-300 group-hover:translate-x-1 transition-all ml-1">
                {item.linkText} <ArrowRight size={11} className="ml-0.5" />
              </span>

              {/* Divider dot */}
              <span className="text-slate-600 ml-6 select-none">•</span>
            </a>
          );
        })}
      </div>
    </aside>
  );
}
