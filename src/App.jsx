import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  MessageCircle,
  Search,
} from "lucide-react";
import { gsap, useGSAP } from "./lib/gsap.js";
import Navbar from "./components/Navbar.jsx";
import TourCard from "./components/TourCard.jsx";
import TourDialog from "./components/TourDialog.jsx";
import { useTours } from "./hooks/useTours.js";
import { usePlaces } from "./hooks/usePlaces.js";
import { Instagram } from "lucide-react";

const categories = ["All trips", "Heritage", "Spiritual", "Nature"];

export default function App() {
  const heroRef = useRef(null);
  const ambientVideoRef = useRef(null);
  const showcaseRef = useRef(null);
  const trackRef = useRef(null);
  const tripsRef = useRef(null);
  const routeRef = useRef(null);
  const routeProgressRef = useRef(null);
  const [search, setSearch] = useState("");
  const [placeSearch, setPlaceSearch] = useState("");
  const [category, setCategory] = useState("All trips");
  const [selectedTour, setSelectedTour] = useState(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const filters = useMemo(
    () => ({
      q: search || undefined,
      category: category === "All trips" ? undefined : category,
    }),
    [search, category],
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
        intro.from(".hero-copy .eyebrow", {
          autoAlpha: 0,
          y: 16,
          duration: 0.6,
          ease: "power3.out",
        });
        intro.from(
          ".hero-line-inner",
          {
            autoAlpha: 0,
            y: 40,
            duration: 1,
            stagger: 0.08,
            ease: "power4.out",
          },
          "-=0.2",
        );
        intro.from(
          ".hero-description",
          { autoAlpha: 0, y: 22, duration: 0.7, ease: "power3.out" },
          "-=0.45",
        );
        intro.from(
          ".hero-search-bar",
          { autoAlpha: 0, y: 30, duration: 0.8, ease: "power3.out" },
          "-=0.25",
        );
        intro.from(
          ".photo-stamp",
          { autoAlpha: 0, scale: 0.75, duration: 0.6, ease: "back.out(1.8)" },
          0.65,
        );
        intro.from(
          ".hero-caption",
          { autoAlpha: 0, y: 8, duration: 0.45, ease: "power2.out" },
          0.7,
        );

        const ambientVideo = ambientVideoRef.current;
        const kenBurns = gsap.fromTo(
          ambientVideo,
          { scale: 1.08 },
          { scale: 1, duration: 36, ease: "none", repeat: -1, yoyo: true },
        );
        const backgroundParallax = gsap.to(ambientVideo, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
        const stampParallax = gsap.to(".photo-stamp", {
          y: -24,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.5,
          },
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
            browseButton,
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
          kenBurns.kill();
          backgroundParallax.kill();
          stampParallax.kill();
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
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const getDistance = () =>
            Math.max(0, track.scrollWidth - showcase.clientWidth);
          if (getDistance() < 1) return undefined;

          const horizontal = gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: showcase,
              start: "top top",
              end: () => `+=${getDistance()}`,
              pin: true,
              scrub: 1.2,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          gsap.utils.toArray(".tour-image", track).forEach((image) => {
            gsap.fromTo(
              image,
              { xPercent: 7 },
              {
                xPercent: -7,
                ease: "none",
                scrollTrigger: {
                  trigger: image.closest(".tour-card"),
                  containerAnimation: horizontal,
                  start: "left right",
                  end: "right left",
                  scrub: 1,
                },
              },
            );
          });
          return () => horizontal.scrollTrigger?.kill();
        },
      );

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
    const timeout = setTimeout(() => setPlaceSearch(trimmedSearch), 1000);
    return () => clearTimeout(timeout);
  }, [trimmedSearch]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = (event) => setPrefersReducedMotion(event.matches);
    setPrefersReducedMotion(preference.matches);
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const video = ambientVideoRef.current;
    if (!video) return;
    if (prefersReducedMotion) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  }, [prefersReducedMotion]);

  function goToTrips() {
    tripsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      id="top"
      className="relative isolate min-h-screen overflow-hidden bg-transparent text-ink"
    >
      <div className="site-video-layer" aria-hidden="true">
        <video
          ref={ambientVideoRef}
          className="ambient-travel-video"
          autoPlay={!prefersReducedMotion}
          muted
          loop
          playsInline
          preload={prefersReducedMotion ? "none" : "metadata"}
          poster="https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Great_Buddha_statue_at_Bodh_Gaya%2C_Bihar%2C_India.jpg/1280px-Great_Buddha_statue_at_Bodh_Gaya%2C_Bihar%2C_India.jpg"
          tabIndex={-1}
        >
          <source
            media="(max-width: 767px)"
            src="https://videos.pexels.com/video-files/36470077/15464664_360_640_30fps.mp4"
            type="video/mp4"
          />
          <source
            src="https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4"
            type="video/mp4"
          />
        </video>
        <div className="site-video-wash" />
      </div>
      <Navbar onExplore={goToTrips} />
      <main>
        <section ref={heroRef} className="cinematic-hero">
          <div className="hero-background" aria-hidden="true">
            <div className="hero-shade" />
          </div>
          <div className="cinematic-hero-inner">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-dot" /> Bihar, India
              </p>
              <h1 aria-label="Explore Bihar.">
                <span className="hero-line" aria-hidden="true">
                  <span className="hero-line-inner">Explore</span>
                </span>
                <span className="hero-line" aria-hidden="true">
                  <em className="hero-line-inner">Bihar.</em>
                </span>
              </h1>
              <p className="hero-description">
                Ancient places, peaceful monasteries and wild forests. Find a
                trip and discover Bihar at your own pace.
              </p>
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
          </div>
          <div className="photo-stamp">
            <span>
              Discover
              <br />
              Bihar
            </span>
          </div>
          <div className="hero-caption">
            <span>BIHAR, INDIA</span>
            <span>Bodh Gaya</span>
          </div>
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
              <div className="tour-showcase" ref={showcaseRef}>
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
          <section ref={routeRef} className="route-section">
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
      <footer id="footer" className="site-footer">
        <div className="footer-inner">
          <div className="footer-main">
            <a
              className="footer-enquiry"
              href="https://wa.me/917004719341?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20a%20Bihar%20trip."
              target="_blank"
              rel="noreferrer"
              aria-label="Enquire about a Bihar trip on WhatsApp"
            >
              <span className="footer-enquiry-icon">
                <MessageCircle size={19} />
              </span>
              <span className="footer-enquiry-copy">
                <strong>Know more about Bihar</strong>
                <small>Enquire with us on WhatsApp</small>
              </span>
              <ArrowUpRight size={18} className="footer-enquiry-arrow" />
            </a>

              <p>Follow on</p>
              <a
                href="https://www.instagram.com/your_username"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-700 hover:text-black transition-colors"
              >
                <Instagram size={22} />
              </a>

            <div className="footer-identity">
              <p className="footer-brand">wander Bihar</p>
              <p className="footer-copyright">
                © {new Date().getFullYear()} wander Bihar. All rights reserved.
              </p>
              <p className="footer-contact">
                Thoughtful journeys across Bihar, planned with local insight.
              </p>
            </div>
          </div>
          {/* <div className="footer-credits">
          <span className="footer-credits-label">Photo credits</span>
          <a href="https://commons.wikimedia.org/wiki/File:Great_Buddha_statue_at_Bodh_Gaya,_Bihar,_India.jpg" target="_blank" rel="noreferrer">K. Venkataramana (CC0)</a>
          <a href="https://commons.wikimedia.org/wiki/File:Another_view_of_the_Stupa_of_ancient_Nalanda_Mahavihara.jpg" target="_blank" rel="noreferrer">Debazoti1985 (CC BY-SA 4.0)</a>
          <a href="https://commons.wikimedia.org/wiki/File:Shanti_Stupa_%40_Vaishali_-_panoramio.jpg" target="_blank" rel="noreferrer">Neil Satyam (CC BY-SA 3.0)</a>
          <a href="https://commons.wikimedia.org/wiki/File:Panthera_tigris_tigris.jpg" target="_blank" rel="noreferrer">U.S. Fish &amp; Wildlife Service (Public Domain)</a>
        </div> */}
        </div>
      </footer>
      <TourDialog tour={selectedTour} onClose={() => setSelectedTour(null)} />
    </div>
  );
}
