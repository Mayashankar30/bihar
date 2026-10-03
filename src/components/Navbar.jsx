import React, { useState } from 'react';
import { MapPin, Menu, X } from 'lucide-react';

export default function Navbar({ onExplore }) {
  const [open, setOpen] = useState(false);

  function explore() {
    setOpen(false);
    onExplore();
  }

  return (
    <header className="relative z-20 border-b border-ink/10 bg-mist/90 backdrop-blur-md">
      <nav className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main navigation">
        <a href="#top" className="flex items-center gap-2.5 text-ink" aria-label="wanderlust home">
          <span className="grid size-9 place-items-center rounded-full bg-leaf text-white"><MapPin size={19} strokeWidth={1.8} /></span>
          <span className="font-display text-[25px] leading-none">wanderBihar<span className="text-coral">.</span></span>
        </a>
        <div className="hidden items-center gap-9 md:flex">
          {/* <a className="nav-link" href="#trips">Bihar trips</a> */}
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button onClick={explore} className="button-dark">Explore Bihar <span aria-hidden="true">↗</span></button>
        </div>
        <button className="grid size-10 place-items-center rounded-full text-ink hover:bg-ink/5 md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && <div className="absolute inset-x-0 top-full border-b border-ink/10 bg-mist px-5 py-5 shadow-lg md:hidden">
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          <a className="mobile-link" href="#trips" onClick={() => setOpen(false)}>Bihar trips</a>
          <button onClick={explore} className="button-dark mt-3 w-full">Explore Bihar <span aria-hidden="true">↗</span></button>
        </div>
      </div>}
    </header>
  );
}