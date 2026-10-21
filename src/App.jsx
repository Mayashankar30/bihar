import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Headset,
  Instagram,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Analytics } from '@vercel/analytics/react';
import { gsap, useGSAP } from "./lib/gsap.js";
import Navbar from "./components/Navbar.jsx";
import AnnouncementRibbon from "./components/AnnouncementRibbon.jsx";
import TourCard from "./components/TourCard.jsx";
import TourDialog from "./components/TourDialog.jsx";
import { useTours } from "./hooks/useTours.js";
import { usePlaces } from "./hooks/usePlaces.js";
import { businessWhatsAppNumber } from "./lib/config.js";
import { sampleTours } from "./data/sampleTours.js";

const categories = ["All trips", "Heritage", "Spiritual", "Nature"];
const contactPhoneNumbers = [
  { display: "+91 70047 19341", telephone: "+917004719341" },
  { display: "+91 70500 54006", telephone: "+917050054006" },
  { display: "+91 79832 90465", telephone: "+917983290465" },
];
const heroImages = [
  {
    src: sampleTours[0].images[0],
    alt: "Great Buddha statue at Bodh Gaya, Bihar",
    label: "Sacred Bodh Gaya",
    className: "hero-image-tall",
  },
  {
    src: sampleTours[3].images[0],
    alt: "Wild tiger in its natural habitat",
    label: "Wild Bihar",
    className: "hero-image-short",
  },
];

export default function App() {
  const heroRef = useRef(null);
  const showcaseRef = useRef(null);
  const trackRef = useRef(null);
  const tripsRef = useRef(null);
  const routeRef = useRef(null);
  const routeProgressRef = useRef(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [placeSearch, setPlaceSearch] = useState("");
  const [category, setCategory] = useState("All trips");
  const [selectedTour, setSelectedTour] = useState(null);
  const filters = useMemo(
    () => ({
      q: debouncedSearch || undefined,
      category: category === "All trips" ? undefined : category,
    }),
    [debouncedSearch, category],
  );
  const { data: tours = [], isFetching } = useTours(filters);
  const trimmedSearch = search.trim();
  const canSearchPlaces =
    trimmedSearch.length >= 2 && !isFetching && tours.length === 0;
  const {
    data: places = [],
    isFetching: isSearchingPlaces,
    isError: placeSearchFailed,
  } = usePlaces(placeSearch, canSearchPlaces && placeSearch === trimmedSearch);
  const featuredTour =
    tours.find((tour) => tour.itinerary?.length > 1) ||
    tours.find((tour) => tour.itinerary?.length);
  const itinerary = featuredTour?.itinerary || [];
  const tourKey = tours.map((tour) => tour._id).join("|");
  const itineraryKey = itinerary
    .map((stop) => `${stop.day}:${stop.title}:${stop.location || ""}`)
    .join("|");

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline();
        intro.from(".adventure-eyebrow", {
          autoAlpha: 0,
          y: 16,
          duration: 0.6,
          ease: "power3.out",
        });
        intro.from(
          ".adventure-script",
          {
            autoAlpha: 0,
            y: 24,
            duration: 0.7,
            ease: "power4.out",
          },
          "-=0.2",
        );
        intro.from(
          ".adventure-title",
          { autoAlpha: 0, y: 32, duration: 0.85, ease: "power3.out" },
          "-=0.45",
        );
        intro.from(
          ".adventure-description",
          { autoAlpha: 0, y: 18, duration: 0.65, ease: "power3.out" },
          "-=0.45",
        );
        intro.from(
          ".adventure-actions",
          { autoAlpha: 0, y: 18, duration: 0.65, ease: "power3.out" },
          "-=0.3",
        );
        intro.from(
          ".hero-search-bar",
          { autoAlpha: 0, y: 30, duration: 0.8, ease: "power3.out" },
          "-=0.25",
        );

        gsap.from(".hero-photo-frame", {
          autoAlpha: 0,
          y: 38,
          duration: 0.9,
          stagger: 0.16,
          ease: "power3.out",
          delay: 0.2,
        });
        const searchButton = heroRef.current.querySelector(
          ".hero-search-submit",
        );
        const ripple = searchButton.querySelector(".button-ripple");
        const xTo = gsap.quickTo(searchButton, "x", {
          duration: 0.35,
          ease: "power3.out",
        });
        const yTo = gsap.quickTo(searchButton, "y", {
          duration: 0.35,
          ease: "power3.out",
        });
        const onPointerMove = (event) => {
          if (event.pointerType === "touch") return;
          const bounds = searchButton.getBoundingClientRect();
          xTo((event.clientX - bounds.left - bounds.width / 2) * 0.12);
          yTo((event.clientY - bounds.top - bounds.height / 2) * 0.16 - 2);
        };
        const onPointerLeave = () => {
          xTo(0);
          yTo(0);
        };
        const onPointerDown = (event) => {
          const bounds = searchButton.getBoundingClientRect();
          const diameter = Math.max(bounds.width, bounds.height) * 1.8;
          gsap.set(ripple, {
            width: diameter,
            height: diameter,
            x: event.clientX - bounds.left - diameter / 2,
            y: event.clientY - bounds.top - diameter / 2,
            scale: 0,
            autoAlpha: 0.3,
          });
          gsap.to(ripple, {
            scale: 1,
            autoAlpha: 0,
            duration: 0.55,
            ease: "power2.out",
            overwrite: true,
          });
          gsap.fromTo(
            searchButton,
            { scale: 0.97 },
            {
              scale: 1,
              duration: 0.38,
              ease: "back.out(2)",
              overwrite: "auto",
            },
          );
        };
        searchButton.addEventListener("pointermove", onPointerMove);
        searchButton.addEventListener("pointerleave", onPointerLeave);
        searchButton.addEventListener("pointerdown", onPointerDown);

        return () => {
          searchButton.removeEventListener("pointermove", onPointerMove);
          searchButton.removeEventListener("pointerleave", onPointerLeave);
          searchButton.removeEventListener("pointerdown", onPointerDown);
          intro.kill();
        };
      });
      return () => media.revert();
    },
    { scope: heroRef },
  );

  useGSAP(
    () => {
      if (!tours.length || !showcaseRef.current || !trackRef.current)
        return undefined;
      const showcase = showcaseRef.current;
      const track = trackRef.current;
      const media = gsap.matchMedia();

      media.add(
        "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        () => {
          const cards = gsap.utils.toArray(".tour-card", track);
          gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 26, scale: 0.985 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: showcase,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            },
          );
        },
      );

      return () => media.revert();
    },
    { scope: showcaseRef, dependencies: [tourKey], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      if (!itinerary.length || !routeRef.current || !routeProgressRef.current)
        return undefined;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          routeProgressRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: routeRef.current,
              start: "top 70%",
              end: "bottom 70%",
              scrub: 1,
            },
          },
        );
        gsap.fromTo(
          ".route-stop",
          { autoAlpha: 0, x: -22 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            stagger: 0.16,
            ease: "power3.out",
            scrollTrigger: {
              trigger: routeRef.current,
              start: "top 76%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
      return () => media.revert();
    },
    { scope: routeRef, dependencies: [itineraryKey], revertOnUpdate: true },
  );

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".section-heading > div", {
          autoAlpha: 0,
          y: 26,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: tripsRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
        gsap.from(".filter-row", {
          autoAlpha: 0,
          y: 18,
          duration: 0.65,
          ease: "power3.out",
          scrollTrigger: {
            trigger: tripsRef.current,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
        });
      });
      return () => media.revert();
    },
    { scope: tripsRef },
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(trimmedSearch), 300);
    return () => clearTimeout(timeout);
  }, [trimmedSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => setPlaceSearch(trimmedSearch), 1000);
    return () => clearTimeout(timeout);
  }, [trimmedSearch]);

  function goToTrips() {
    tripsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      id="top"
      className="relative isolate min-h-screen overflow-hidden bg-mist text-ink"
    >
      <Navbar onExplore={goToTrips} />
      <AnnouncementRibbon />
      <main>
        <section ref={heroRef} className="adventure-hero">
          <div className="adventure-hero-inner">
            <div className="adventure-copy">
              <p className="adventure-eyebrow">Come &amp; discover</p>
              <p className="adventure-script">The heart of Bihar</p>
              <h1 className="adventure-title">
                Adventure begins
                <br />
                <span>in Bihar.</span>
              </h1>
              <p className="adventure-description">
                From sacred Bodh Gaya to wild forest trails, find your own
                adventure through Bihar’s living history and beautiful places.
              </p>
              <div className="adventure-actions">
                <button
                  className="adventure-action-primary"
                  onClick={goToTrips}
                >
                  Explore our trips <ArrowRight size={17} />
                </button>
                <a
                  className="adventure-action-secondary"
                  href={`https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent("Hi, I'd like to plan a custom trip in Bihar.")}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Plan a custom trip
                </a>
              </div>
              <form
                className="hero-search-bar"
                onSubmit={(event) => {
                  event.preventDefault();
                  goToTrips();
                }}
              >
                <label className="hero-search-field">
                  <MapPin size={18} />
                  <span className="sr-only">Search Bihar destinations</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Where in Bihar?"
                  />
                </label>
                <button
                  className="button-dark hero-search-submit"
                  type="submit"
                >
                  <span className="button-ripple" aria-hidden="true" />
                  <span className="relative z-10">Find a trip</span>
                  <ArrowRight className="relative z-10" size={16} />
                </button>
              </form>
            </div>
            <div className="adventure-gallery" aria-label="Bihar travel highlights">
              {heroImages.map((image) => (
                <figure
                  className={`hero-photo-frame ${image.className}`}
                  key={image.label}
                >
                  <img src={image.src} alt={image.alt} loading="eager" />
                  <figcaption>{image.label}</figcaption>
                </figure>
              ))}
              <span className="gallery-note" aria-hidden="true">
                <span>38°</span>
                <span>Places to find yourself</span>
              </span>
            </div>
          </div>
          <a className="hero-scroll-cue" href="#trips">
            Scroll to explore <span aria-hidden="true">↓</span>
          </a>
        </section>

        <section
          id="trips"
          ref={tripsRef}
          className="mx-auto max-w-7xl scroll-mt-6 px-5 pb-12 pt-20 sm:px-8 lg:pt-28"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow text-coral">Local trips across Bihar</p>
              <h2 className="section-title">
                Choose your next stop<span className="text-coral">.</span>
              </h2>
            </div>
          </div>
          <div className="filter-row">
            <div
              className="category-tabs"
              role="tablist"
              aria-label="Filter by trip category"
            >
              {categories.map((item) => (
                <button
                  key={item}
                  role="tab"
                  aria-selected={category === item}
                  className={`category-tab ${category === item ? "category-tab-active" : ""}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            {isFetching && (
              <div className="absolute -top-5 right-0 text-xs text-leaf">
                Updating trips
              </div>
            )}
            {!!tours.length && (
              <div
                className="tour-showcase"
                ref={showcaseRef}
                role="region"
                aria-label="Tour packages; scroll horizontally to browse"
                tabIndex={0}
              >
                <div className="tour-track" ref={trackRef}>
                  {tours.map((tour) => (
                    <TourCard
                      key={tour._id}
                      tour={tour}
                      onSelect={setSelectedTour}
                    />
                  ))}
                </div>
              </div>
            )}
            {!tours.length && (
              <div className="py-12 text-center">
                <p className="font-display text-2xl">
                  {trimmedSearch.length >= 2
                    ? "Here are your next stops."
                    : "No trips found."}
                </p>
                <p className="mt-2 text-sm text-ink/55">
                  {trimmedSearch.length < 2
                    ? "Search for a Bihar place to request a custom trip."
                    : places.length
                      ? "Matching places in Bihar are shown below."
                      : isSearchingPlaces
                        ? "Looking up places in Bihar…"
                        : "Try another Bihar destination or category."}
                </p>
              </div>
            )}
            {canSearchPlaces && (
              <div className="mt-8">
                {isSearchingPlaces && (
                  <p className="py-5 text-center text-sm text-ink/55">
                    Searching places in Bihar…
                  </p>
                )}
                {placeSearchFailed && (
                  <p
                    role="status"
                    className="py-5 text-center text-sm text-coral"
                  >
                    Place search is unavailable right now. Please try again.
                  </p>
                )}
                {!!places.length && (
                  <>
                    <h3 className="mb-3 font-display text-xl">
                      Other places in Bihar
                    </h3>
                    <ul className="divide-y divide-ink/10 border-y border-ink/10">
                      {places.map((place) => (
                        <li key={place.id}>
                          <button
                            className="flex w-full items-center gap-4 py-4 text-left hover:bg-ink/[.03]"
                            onClick={() =>
                              setSelectedTour({
                                _id: `place-${place.id}`,
                                title: place.name,
                                destination: place.name,
                                summary: place.address,
                                coordinates: {
                                  latitude: place.latitude,
                                  longitude: place.longitude,
                                },
                                isPlaceInquiry: true,
                              })
                            }
                          >
                            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-leaf/10 text-leaf">
                              <MapPin size={18} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold text-ink">
                                {place.name}
                              </span>
                              <span className="mt-1 block truncate text-xs text-ink/55">
                                {place.address}
                              </span>
                            </span>
                            <span className="shrink-0 text-xs font-semibold text-leaf">
                              Request trip <span aria-hidden="true">↗</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-right text-xs text-ink/45">
                      Place data ©{" "}
                      <a
                        className="underline underline-offset-2"
                        href="https://www.openstreetmap.org/copyright"
                        target="_blank"
                        rel="noreferrer"
                      >
                        OpenStreetMap contributors
                      </a>
                    </p>
                  </>
                )}
                {!isSearchingPlaces && !placeSearchFailed && !places.length && (
                  <p className="py-5 text-center text-sm text-ink/55">
                    No places matched. Try a different name.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
        {!!itinerary.length && (
        <section id="route" ref={routeRef} className="route-section">
            <div className="route-heading">
              <p className="eyebrow text-coral">The route</p>
              <h2 className="section-title">
                {featuredTour.title}
                <span className="text-coral">.</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink/60">
                A day-by-day look at this Bihar journey.
              </p>
            </div>
            <ol className="route-list">
              <span className="route-line" aria-hidden="true">
                <span ref={routeProgressRef} className="route-progress" />
              </span>
              {itinerary.map((stop) => (
                <li
                  className="route-stop"
                  key={`${featuredTour._id}-${stop.day}`}
                >
                  <span className="route-marker" aria-hidden="true">
                    {String(stop.day).padStart(2, "0")}
                  </span>
                  <div className="route-copy">
                    <p className="route-day">
                      DAY {String(stop.day).padStart(2, "0")}{" "}
                      <span>{stop.location || featuredTour.destination}</span>
                    </p>
                    <h3>{stop.title}</h3>
                    <p>{stop.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>
      <section
        id="contact"
        className="contact-section"
        style={{ "--contact-image": `url("${sampleTours[0].images[0]}")` }}
        aria-labelledby="contact-title"
      >
        <div className="contact-banner">
          <p>Feel free to</p>
          <h2 id="contact-title">Contact us</h2>
        </div>
        <div className="contact-content">
          <article className="contact-card">
            <div className="contact-card-title">
              <span className="contact-icon"><MapPin size={25} /></span>
              <h3>Find us</h3>
            </div>
            <h4>Journeys across Bihar</h4>
            <p>
              We plan local trips throughout Bihar. Starting points and meeting
              locations are shared with each available tour.
            </p>
            <a href="#trips" className="contact-text-link">Explore destinations</a>
          </article>
          <article className="contact-card">
            <div className="contact-card-title">
              <span className="contact-icon"><Headset size={25} /></span>
              <h3>Reach Out</h3>
            </div>
            <h4>Trip enquiries</h4>
            <p>Talk to our team about package details, travel dates, and availability.</p>
            <div className="grid justify-items-start gap-2">
              {contactPhoneNumbers.map(({ display, telephone }) => (
                <a className="contact-text-link" href={`tel:${telephone}`} key={telephone}>
                  {display}
                </a>
              ))}
            </div>
            <h4 className="contact-subheading">Custom &amp; group trips</h4> 
            <a
              className="contact-text-link"
              href={`https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent("Hi, I would like to plan a custom or group trip in Bihar.")}`}
              target="_blank"
              rel="noreferrer"
            >
              Message us on WhatsApp
            </a>
          </article>
          <article className="contact-card">
            <div className="contact-card-title">
              <span className="contact-icon"><MessageCircle size={25} /></span>
              <h3>Write to us</h3>
            </div>
            <h4>Support &amp; trip planning</h4>
            <p>
              Need a detailed quote or have a question? Send us your destination
              and travel plans and our team will get back to you.
            </p>
            <a
              className="contact-text-link"
              href={`https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent("Hello WanderBihar, I have a question about a trip.")}`}
              target="_blank"
              rel="noreferrer"
            >
              Start a WhatsApp conversation
            </a>
            <p className="contact-note">We’re happy to help with custom itineraries and group enquiries.</p>
          </article>
        </div>
      </section>
      <footer
        id="footer"
        className="site-footer adventure-footer"
        style={{ "--footer-image": `url("${sampleTours[0].images[0]}")` }}
      >
        <div className="footer-inner">
          <div className="footer-main">
            <div className="footer-column footer-brand-column">
              <a href="#top" className="footer-brand-link" aria-label="WanderBihar home">
                <span className="footer-brand-mark"><MapPin size={22} /></span>
                <span>Wander<span>Bihar</span></span>
              </a>
              <p className="footer-about">
                Thoughtful journeys through Bihar’s sacred landmarks, living
                heritage, and wild landscapes—planned with local insight.
              </p>
              <a
                className="footer-whatsapp-link"
                href={`https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent("Hi, I'd like to enquire about a Bihar trip.")}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} /> Chat with our trip team
              </a>
              <div className="footer-socials" aria-label="Connect with WanderBihar">
                <a href="#top" aria-label="Back to top"><ArrowUpRight size={17} /></a>
                <a
                  href={`https://wa.me/${businessWhatsAppNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={17} />
                </a>
                <a
                  href="https://www.instagram.com/wander__bihar"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram size={17} />
                </a>
              </div>
            </div>

            <div className="footer-column">
              <h2 className="footer-heading"><ArrowUpRight size={17} /> Important links</h2>
              <ul className="footer-link-list">
                <li><a href="#top"><ArrowRight size={17} /> Home</a></li>
                <li><a href="#trips"><ArrowRight size={17} /> Explore trips</a></li>
                <li><a href="#route"><ArrowRight size={17} /> Buddhist circuit</a></li>
                <li><a href="#trips"><ArrowRight size={17} /> Trip categories</a></li>
                <li><a href="#contact"><ArrowRight size={17} /> Contact us</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h2 className="footer-heading"><ArrowUpRight size={17} /> Bihar highlights</h2>
              <ul className="footer-link-list">
                {["Bodh Gaya", "Rajgir", "Nalanda", "Patna", "Vaishali", "Valmiki Tiger Reserve"].map(destination => (
                  <li key={destination}>
                    <a
                      href="#trips"
                      onClick={() => {
                        setSearch(destination);
                        setCategory("All trips");
                      }}
                    >
                      <ArrowRight size={17} /> {destination}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-column footer-contact-column">
              <h2 className="footer-heading"><ArrowUpRight size={17} /> Reach us</h2>
              <div className="footer-contact-card">
                <MapPin size={19} />
                <p>Local journeys, across Bihar, India.</p>
              </div>
              {contactPhoneNumbers.map(({ display, telephone }) => (
                <a className="footer-contact-card" href={`tel:${telephone}`} key={telephone}>
                  <Phone size={19} />
                  <p>{display}<span>Call our trip team</span></p>
                </a>
              ))}
              <a
                className="footer-contact-card"
                href={`https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent("Hi, I have a question about travelling in Bihar.")}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={19} />
                <p>WhatsApp support<span>Ask us about your journey</span></p>
              </a>
              <div className="footer-payment-note">
                <span>Secure checkout powered by</span>
                <strong>Razorpay</strong>
                <span>Payment options shown at checkout</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} WanderBihar. All rights reserved.</span>
            <span>Made for meaningful journeys across Bihar.</span>
          </div>
        </div>
      </footer>
      <a
        className="floating-whatsapp"
        href={`https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent("Hi, I have a question about travelling in Bihar.")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with WanderBihar on WhatsApp"
      >
        <MessageCircle size={25} />
      </a>
      <TourDialog tour={selectedTour} onClose={() => setSelectedTour(null)} />
      <Analytics />
    </div>
  );
}
