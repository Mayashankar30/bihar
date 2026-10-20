import React, { useState } from 'react';
import { ArrowUpRight, MapPin, Menu, X } from 'lucide-react';

export default function Navbar({ onExplore }) {
  const [open, setOpen] = useState(false);

  function explore() {
    setOpen(false);
    onExplore();
  }

  return (
    <header className="adventure-navbar">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main navigation">
        <a href="#top" className="adventure-brand" aria-label="WanderBihar home">
          <span className="adventure-brand-mark"><MapPin size={19} strokeWidth={1.8} /></span>
          <span>Wander<span>Bihar</span></span>
        </a>
        <div className="adventure-nav-links">
          <a href="#top" className="adventure-nav-link">Home</a>
          <a href="#trips" className="adventure-nav-link">Destinations</a>
          <a href="#trips" className="adventure-nav-link">Bihar trips</a>
          <a href="#route" className="adventure-nav-link">Buddhist circuit</a>
          <a href="#contact" className="adventure-nav-link">Contact</a>
        </div>
        <div className="adventure-nav-cta">
          <button onClick={explore} className="adventure-nav-button">Plan your trip <ArrowUpRight size={16} /></button>
        </div>
        <button className="adventure-menu-button" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && <div className="adventure-mobile-menu">
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          <a className="adventure-mobile-link" href="#top" onClick={() => setOpen(false)}>Home</a>
          <a className="adventure-mobile-link" href="#trips" onClick={() => setOpen(false)}>Destinations &amp; trips</a>
          <a className="adventure-mobile-link" href="#route" onClick={() => setOpen(false)}>Buddhist circuit</a>
          <a className="adventure-mobile-link" href="#contact" onClick={() => setOpen(false)}>Contact</a>
          <button onClick={explore} className="adventure-nav-button mt-2 w-full">Plan your trip <ArrowUpRight size={16} /></button>
        </div>
      </div>}
    </header>
  );
}