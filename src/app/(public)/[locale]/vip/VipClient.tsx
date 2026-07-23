"use client";

/* Ported from Maher's VIP embed — content and layout preserved; activity
   emojis replaced with line icons; fade-in observer and request modal kept. */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBeach, IconCar, IconCenote, IconChef, IconCompass, IconConcierge,
  IconHeli, IconPark, IconScroll, IconTemple, IconYacht,
} from "@/components/LuxeIcons";

const WA_NUMBER = "529844521184";
const EMAIL = "booking@amanahvacations.com";

const WA_MSG = encodeURIComponent(
  "Hello Amanah Vacations! 👋\n\nI'm interested in the VIP Experience.\n\nPlease help me plan a fully private, VIP-tailored trip. Thank you!"
);
const EMAIL_SUBJECT = encodeURIComponent("VIP Experience — Request");
const EMAIL_BODY = encodeURIComponent(
  "Hello Amanah Vacations,\n\nI'm interested in the VIP Experience.\n\nPlease help me plan a fully private, VIP-tailored trip.\n\nThank you!"
);

const SERVICES = [
  { n: "01", icon: IconCar, title: "Private Transportation", desc: "From the moment you land, luxury vehicles and a personal driver are ready. No waiting, no sharing — just seamless arrivals and departures." },
  { n: "02", icon: IconCompass, title: "Dedicated Local Guide", desc: "Your expert guide unlocks the real Riviera Maya — from hidden ruins to local markets, with stories, knowledge, and access no map can provide." },
  { n: "03", icon: IconConcierge, title: "24/7 Dedicated Concierge", desc: "Your personal concierge handles every request, anticipates every need, and ensures your experience is flawless from start to finish." },
  { n: "04", icon: IconYacht, title: "Yacht & Ocean Experiences", desc: "Private yacht excursions across the Caribbean, exclusive beach setups, and access to the most breathtaking hidden spots in the region." },
  { n: "05", icon: IconChef, title: "Private Chef & Dining", desc: "Gourmet meals prepared exclusively for you — whether beachside, aboard a yacht, or in the privacy of your villa." },
  { n: "06", icon: IconScroll, title: "Custom Itineraries", desc: "No fixed schedules. No limitations. Every day is built around your preferences — adventure, relaxation, celebration, or all three." },
];

const ACTIVITIES = [
  { icon: IconCenote, title: "Private Cenotes", desc: "Descend into the sacred underground rivers of the Yucatán Peninsula — crystal-clear, secluded, and completely private. An experience unlike anywhere else on earth." },
  { icon: IconBeach, title: "Semi-Private Beaches", desc: "Exclusive beach setups with premium loungers and full service. Discover hidden stretches of coastline away from the crowds, reserved just for you." },
  { icon: IconYacht, title: "Private Yacht Snorkeling & Island Exploration", desc: "Set sail on a private yacht and dive into vibrant coral reefs, discover secluded islands, and explore untouched Caribbean waters — all at your own pace." },
  { icon: IconTemple, title: "Mayan Ruins Discovery Experience", desc: "Step back in time with a private guided tour of the Yucatán's most iconic Mayan sites — Chichén Itzá, Tulum, Cobá, and more — with expert storytelling and no crowds." },
  { icon: IconHeli, title: "Helicopter Tours", desc: "Rise above the jungle canopy and Caribbean coast for an aerial perspective that transforms the landscape into art. Tailored routes, private flights." },
  { icon: IconPark, title: "Access to All Xcaret Parks", desc: "Seamlessly arranged access to the full suite of Xcaret experiences — Xcaret, Xplor, Xel-Há, and beyond — all handled and coordinated for you." },
];

const ACCOMS = [
  { img: "/images/luxe/villa.jpg", tag: "", name: "Private Luxury Villas", desc: "Maximum privacy and flexibility for families and groups. Enjoy your own space with a private pool, chef options, and fully personalized services — the ultimate exclusive stay.", ideal: "Families, groups & maximum privacy" },
  { img: "/images/luxe/rosewood.jpg", tag: "Prestige", name: "Rosewood Mayakoba", desc: "One of the most prestigious resorts in the region — ultra-luxury suites and villas with private pools and butler service. The pinnacle of refined elegance and privacy.", ideal: "High-end travelers & top-tier service" },
  { img: "/images/luxe/banyan.jpg", tag: "", name: "Banyan Tree Mayakoba", desc: "A serene villa-only resort surrounded by nature, with private pool villas and a peaceful, exotic atmosphere. Tranquility and privacy in perfect harmony.", ideal: "Couples seeking tranquility & ambiance" },
  { img: "/images/luxe/fairmont.jpg", tag: "", name: "Fairmont Mayakoba", desc: "A premium resort set within lush jungle and waterways, offering a beautiful balance between comfort, nature, and high-end amenities in a spacious setting.", ideal: "Nature lovers who want luxury & space" },
  { img: "/images/luxe/palafitos.jpg", tag: "One of a Kind", name: "Palafitos Overwater Bungalows", desc: "The only overwater bungalows in Mexico — a Maldives-style experience with direct ocean access, private pools, and breathtaking views. Perfect for unforgettable occasions.", ideal: "Couples, honeymoons & special occasions" },
  { img: "/images/luxe/hotel-xcaret.jpg", tag: "", name: "Hotel Xcaret Mexico", desc: "An all-inclusive resort with access to multiple parks, experiences, and entertainment. Dynamic, vibrant, and packed with unforgettable moments all in one place.", ideal: "Families & activity-filled adventures" },
];

function useFadeIn() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 100);
          }
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll("#vip-page .fade-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function VipClient() {
  const [modalOpen, setModalOpen] = useState(false);
  useFadeIn();

  return (
    <div id="vip-page">
      {/* HERO */}
      <div className="vip-hero-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/luxe/vip-hero.jpg" alt="VIP Services – Amanah Vacations Riviera Maya" />
        <div className="hero-image-caption">
          <div className="badge">Exclusive Access</div>
          <h1>
            VIP Experience –<br />
            <em>Luxury Without Limits</em>
          </h1>
          <p className="hero-sub">Riviera Maya · Private · Personalized</p>
        </div>
      </div>

      {/* MAIN */}
      <section className="vip-section">
        <div className="bg-layer" />
        <div className="grain" />
        <div className="deco-line deco-line-1" />
        <div className="deco-line deco-line-2" />
        <div className="deco-circle deco-circle-1" />
        <div className="deco-circle deco-circle-2" />

        {/* INTRO */}
        <div className="vip-intro fade-in">
          <div>
            <h2 className="intro-title">
              A journey built
              <br />
              entirely <em>around you.</em>
            </h2>
            <p className="intro-text">
              Step into a world where every detail is designed around you. The VIP Experience is
              more than a package — it&apos;s a fully personalized journey where comfort,
              exclusivity, and freedom come together to create something truly unforgettable.
            </p>
          </div>
          <div className="logo-box">
            <div className="logo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="Amanah Vacations Logo" />
            </div>
            <p className="logo-tagline">Trust in Adventure.</p>
          </div>
        </div>

        <div className="gold-divider fade-in">
          <span className="divider-icon">✦ ✦ ✦</span>
        </div>

        {/* SERVICES */}
        <div className="section-heading fade-in">
          <p className="eyebrow">What We Offer</p>
          <h2>
            VIP <em>Services</em>
          </h2>
        </div>
        <div className="features-grid fade-in">
          {SERVICES.map((s) => (
            <div key={s.n} className="feature-card">
              <div className="feature-number">{s.n}</div>
              <div className="feature-icon">{s.icon}</div>
              <h3 className="feature-title">{s.title}</h3>
              <p className="feature-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="gold-divider fade-in">
          <span className="divider-icon">✦ ✦ ✦</span>
        </div>

        {/* ACTIVITIES */}
        <div className="section-heading fade-in">
          <p className="eyebrow">Experiences Await</p>
          <h2>
            Exclusive <em>Activities</em>
          </h2>
        </div>
        <div className="activities-section fade-in">
          <div className="activities-grid">
            {ACTIVITIES.map((a) => (
              <div key={a.title} className="activity-card">
                <div className="activity-icon-wrap lux-icon">{a.icon}</div>
                <div className="activity-info">
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="section-browse">
            Browse our curated{" "}
            <Link href="/activities" className="browse-link">
              activities
            </Link>{" "}
            and transform any experience into a fully private, personalized journey.
          </p>
        </div>

        <div className="gold-divider fade-in">
          <span className="divider-icon">✦ ✦ ✦</span>
        </div>

        {/* ACCOMMODATION */}
        <div className="section-heading fade-in">
          <p className="eyebrow">Where You&apos;ll Stay</p>
          <h2>
            Accommodation <em>Options</em>
          </h2>
        </div>
        <div className="accom-section fade-in">
          <div className="accom-grid">
            {ACCOMS.map((a) => (
              <div key={a.name} className="accom-card">
                <div className="accom-img-slot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.img} alt={a.name} loading="lazy" />
                  {a.tag && <span className="accom-tag">{a.tag}</span>}
                </div>
                <div className="accom-body">
                  <h3 className="accom-name">{a.name}</h3>
                  <p className="accom-desc">{a.desc}</p>
                  <p className="accom-ideal">{a.ideal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="gold-divider fade-in">
          <span className="divider-icon">✦ ✦ ✦</span>
        </div>

        {/* BODY */}
        <div className="vip-body fade-in">
          <div className="body-aside">
            <p className="aside-label">What&apos;s Included</p>
            <blockquote className="aside-quote">
              &ldquo;Your experience. Your pace. Your rules.&rdquo;
            </blockquote>
            <ul className="aside-list">
              <li>Private tours &amp; exclusive access</li>
              <li>Luxury beach setups</li>
              <li>Romantic, family &amp; celebration packages</li>
              <li>Customized activities &amp; planning</li>
              <li>Hidden gems of the Riviera Maya</li>
              <li>Seamless, full-service coordination</li>
              <li>Private cenotes &amp; helicopter tours</li>
              <li>Full Xcaret parks access</li>
            </ul>
          </div>
          <div className="body-content">
            <p>
              From the moment you arrive, everything is taken care of. Enjoy private
              transportation, handpicked luxury accommodations in Playa del Carmen, Tulum, or
              beyond, and a dedicated concierge available 24/7 to handle every request.
            </p>
            <p>
              Indulge in private tours, exclusive beach setups, yacht experiences across the
              Caribbean, and access to the most beautiful and hidden locations in the region. From
              a private chef preparing your meals to customized activities and seamless planning,
              every moment is crafted to deliver the highest level of comfort and sophistication.
            </p>
            <p>
              Whether you&apos;re looking for relaxation, adventure, or celebration, your
              experience is built entirely around your preferences. There are no fixed schedules,
              no limitations — only possibilities. Whether it&apos;s a romantic escape, a family
              getaway, or a special celebration, everything can be arranged to match your vision.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="cta-band fade-in">
          <div className="cta-text-block">
            <p className="cta-eyebrow">Begin Your Journey</p>
            <h3 className="cta-headline">
              Ready to experience
              <br />
              the <em>extraordinary?</em>
            </h3>
          </div>
          <div className="cta-rule">
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              Request VIP Experience
            </button>
            <Link href="/activities" className="btn-secondary">
              Explore All Activities
            </Link>
          </div>
        </div>

        {/* MODAL */}
        <div
          className={`vip-modal-ov${modalOpen ? " open" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="vip-modal">
            <button className="vip-modal-close" onClick={() => setModalOpen(false)}>
              ×
            </button>
            <p className="vip-modal-eyebrow">Begin Your Journey</p>
            <h3 className="vip-modal-title">Request Your VIP Experience</h3>
            <p className="vip-modal-text">
              Tell us a little about your trip — dates, group size, and what you&apos;re dreaming
              of — and our team will reach out to design a fully private, VIP-tailored journey
              just for you.
            </p>
            <div className="vip-modal-btns">
              <a
                className="vip-wa-btn"
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Send via WhatsApp
              </a>
              <a className="vip-email-btn" href={`mailto:${EMAIL}?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`}>
                Send via Email
              </a>
            </div>
          </div>
        </div>

        {/* MANTRA */}
        <div className="mantra fade-in">
          <p className="mantra-text">
            <span>Your experience.</span> Your pace. <span>Your rules.</span>
          </p>
        </div>
      </section>
    </div>
  );
}
