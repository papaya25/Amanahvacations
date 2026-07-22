"use client";

/* Ported from Maher's Halal Travel embed — content and layout preserved;
   emoji icons replaced with line icons; fade-in observer and modal kept. */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBeach, IconBed, IconBell, IconCenote, IconDining, IconFamily, IconLeaf,
  IconMosque, IconNoAlcohol, IconPark, IconPool, IconTemple, IconVilla,
  IconWaves, IconYacht,
} from "@/components/LuxeIcons";

const WA_NUMBER = "529844521184";
const EMAIL = "booking@amanahvacations.com";

const WA_MSG = encodeURIComponent(
  "Hello Amanah Vacations! 👋\n\nI'm interested in the VIP Halal Experience.\n\nPlease help me plan a fully halal, VIP-tailored trip for my family. Thank you!"
);
const EMAIL_SUBJECT = encodeURIComponent("VIP Halal Experience — Request");
const EMAIL_BODY = encodeURIComponent(
  "Hello Amanah Vacations,\n\nI'm interested in the VIP Halal Experience.\n\nPlease help me plan a fully halal, VIP-tailored trip for my family.\n\nThank you!"
);

const PILLARS = [
  { icon: IconDining, title: "Halal Food & Dining", desc: "Access to halal-certified restaurants and private chef services using only halal-sourced ingredients." },
  { icon: IconMosque, title: "Prayer & Qibla", desc: "Prayer time schedules, Qibla direction, dedicated prayer space in your villa, and nearest mosque guidance." },
  { icon: IconVilla, title: "Alcohol-Free Villas", desc: "Private luxury villas with no alcohol on the premises — a fully halal-friendly environment for you and your family." },
  { icon: IconFamily, title: "Family-First", desc: "Activities, spaces, and itineraries designed with families in mind — comfortable, joyful, and respectful of your values." },
  { icon: IconWaves, title: "Modest Beach & Pool", desc: "Private beach and pool setups that offer full privacy — enjoy the Caribbean in a space that's entirely yours." },
];

const PERKS = [
  { icon: IconNoAlcohol, title: "Alcohol-free environment", desc: "No alcohol is brought into or stored on the property — guaranteed from the moment you arrive." },
  { icon: IconPool, title: "Private pool & outdoor space", desc: "Your pool, your terrace, your garden — fully private with no shared facilities." },
  { icon: IconBed, title: "Spacious family layouts", desc: "Multiple bedrooms, living areas, and communal spaces ideal for families and groups." },
  { icon: IconMosque, title: "Prayer-ready setup", desc: "Prayer mats, Qibla direction marked, and daily prayer times provided in every villa." },
  { icon: IconBell, title: "24/7 halal-aware concierge", desc: "A dedicated concierge who understands your needs and is available around the clock." },
];

const ACTIVITIES = [
  { icon: IconCenote, title: "Private Cenotes", desc: "Explore the Yucatán's sacred underground rivers in complete privacy — no public crowds, fully secluded, and perfectly suited for families who value modesty." },
  { icon: IconBeach, title: "Private Beach Setups", desc: "A dedicated stretch of Caribbean coastline reserved just for your group — premium loungers, full service, and the privacy your family deserves." },
  { icon: IconTemple, title: "Mayan Ruins Discovery", desc: "A private guided journey through Chichén Itzá, Tulum, or Cobá — deeply educational, awe-inspiring, and a wonderful experience for children and adults alike." },
  { icon: IconYacht, title: "Private Yacht Excursions", desc: "Sail the Caribbean on a private yacht with your family — snorkeling, island-hopping, and breathtaking views in a space that is entirely your own." },
  { icon: IconLeaf, title: "Nature & Eco Experiences", desc: "From jungle walks to wildlife sanctuaries and eco-parks, we design nature-based adventures that kids love and parents appreciate — wholesome and memorable." },
  { icon: IconPark, title: "Xcaret Parks Access", desc: "Fully arranged access to Xcaret, Xel-Há, Xplor, and more — some of Mexico's most spectacular family-friendly parks, seamlessly coordinated for you." },
];

const Ornament = () => (
  <div className="ornament-divider fade-in">
    <div className="ornament-center">
      <div className="ornament-diamond sm" />
      <div className="ornament-diamond" />
      <div className="ornament-diamond sm" />
    </div>
  </div>
);

export default function HalalClient() {
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), i * 90);
          }
        });
      },
      { threshold: 0.07 }
    );
    document.querySelectorAll("#halal-page .fade-in").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div id="halal-page">
      {/* HERO */}
      <div className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/luxe/halal-hero.jpg" alt="Halal Travel – Amanah Vacations Riviera Maya" />
        <div className="hero-caption">
          <div className="badge">Muslim-Friendly Travel</div>
          <h1>
            Travel With <em>Peace of Mind</em>
          </h1>
          <p className="hero-sub">Halal · Riviera Maya · Tailored for You</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="page">
        <div className="bg-layer" />
        <div className="grain" />
        <div className="pattern-overlay" />
        <div className="deco-circle deco-circle-1" />
        <div className="deco-circle deco-circle-2" />
        <div className="deco-circle deco-circle-3" />

        {/* INTRO */}
        <div className="intro fade-in">
          <div>
            <p className="intro-eyebrow">A Journey Rooted in Trust</p>
            <h2 className="intro-title">
              Luxury travel that <em>honors your faith</em> and your family.
            </h2>
            <p className="intro-text">
              At Amanah Vacations, we understand that for Muslim travelers, a perfect trip is
              about more than beautiful destinations — it&apos;s about feeling at ease, respected,
              and at home wherever you are. We handle every detail so you can focus on what truly
              matters: creating meaningful memories with the people you love, without compromise.
            </p>
            <div className="promise-strip">
              {[
                "Halal-certified dining & private chef options",
                "Private villas — fully alcohol-free environments",
                "Prayer space, Qibla direction & Friday Jumu'ah guidance",
                "Family-first experiences, modest beach & pool setups",
                "A concierge who understands your needs",
              ].map((p) => (
                <div key={p} className="promise-item">
                  <div className="promise-dot" />
                  {p}
                </div>
              ))}
            </div>
          </div>
          <div className="faith-visual">
            <div className="crescent-wrap">
              <div className="crescent-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/logo.png" alt="Amanah Vacations Logo" />
              </div>
            </div>
            <p className="faith-tagline">Trust in Adventure.</p>
            <p className="arabic-text">أمانة</p>
          </div>
        </div>

        <Ornament />

        {/* PILLARS */}
        <div className="section-heading fade-in">
          <p className="eyebrow">Our Commitment</p>
          <h2>
            What We <em>Ensure for You</em>
          </h2>
          <p className="sub-note">
            Every element of your trip is thoughtfully arranged with halal principles and your
            family&apos;s comfort in mind.
          </p>
        </div>
        <div className="pillars-grid fade-in">
          {PILLARS.map((p) => (
            <div key={p.title} className="pillar-card">
              <div className="pillar-icon">{p.icon}</div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>

        <Ornament />

        {/* DINING */}
        <div className="section-heading fade-in">
          <p className="eyebrow">Halal Dining</p>
          <h2>
            Eat Well, <em>Eat Halal</em>
          </h2>
          <p className="sub-note">
            Great food is central to any great trip. We make sure every meal meets your standards
            — without sacrificing flavor or experience.
          </p>
        </div>
        <div className="dining-section fade-in">
          <div className="dining-card">
            <div className="dining-tag">Halal Certified · Playa del Carmen</div>
            <h3 className="dining-name">
              Al Rayan <em>Restaurant</em>
            </h3>
            <p className="dining-desc">
              One of the few halal-certified restaurants in the Riviera Maya, Al Rayan offers a
              warm, welcoming atmosphere with a menu rooted in Middle Eastern flavors and freshly
              prepared halal ingredients. A trusted choice for Muslim families in the heart of
              Playa del Carmen.
            </p>
            <ul className="dining-features">
              <li>Fully halal-certified kitchen</li>
              <li>Middle Eastern &amp; international cuisine</li>
              <li>Alcohol-free dining environment</li>
              <li>Family-friendly atmosphere</li>
              <li>Conveniently located in Playa del Carmen</li>
            </ul>
          </div>
          <div className="dining-card">
            <div className="dining-tag">Private Service · Any Location</div>
            <h3 className="dining-name">
              Private Chef with <em>Halal Meat</em>
            </h3>
            <p className="dining-desc">
              Prefer to dine at your villa? We arrange a dedicated private chef who sources only
              halal-certified meats and ingredients — cooking for you at home, beachside, or
              wherever your day takes you. Fully customized menus, dietary preferences honored,
              and no compromises on quality or faith.
            </p>
            <ul className="dining-features">
              <li>Halal-sourced meat &amp; ingredients only</li>
              <li>Custom menus tailored to your preferences</li>
              <li>Breakfast, lunch, dinner &amp; special occasions</li>
              <li>Served at your villa, beach, or yacht</li>
              <li>Available throughout your stay</li>
            </ul>
          </div>
        </div>

        <Ornament />

        {/* VILLA */}
        <div className="section-heading fade-in">
          <p className="eyebrow">Where You&apos;ll Stay</p>
          <h2>
            Private Villas — <em>Your Space, Your Rules</em>
          </h2>
        </div>
        <div className="villa-section fade-in">
          <div className="villa-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/luxe/villa.jpg" alt="Private Luxury Villa" />
            <div className="villa-corner">Alcohol-Free</div>
          </div>
          <div className="villa-content">
            <p className="villa-eyebrow">Muslim-Friendly Accommodations</p>
            <h3 className="villa-title">
              Luxury villas chosen for <em>comfort and privacy.</em>
            </h3>
            <p className="villa-text">
              Rather than recommending hotels where alcohol is present and shared spaces are
              unavoidable, we exclusively place our halal clients in private luxury villas. These
              are fully self-contained retreats where you control the environment — no alcohol on
              the premises, no unwanted intrusions, and complete freedom to live as you wish.
            </p>
            <ul className="villa-perks">
              {PERKS.map((p) => (
                <li key={p.title}>
                  <span className="perk-icon">{p.icon}</span>
                  <div>
                    <strong>{p.title}</strong>
                    {p.desc}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Ornament />

        {/* ACTIVITIES */}
        <div className="section-heading fade-in">
          <p className="eyebrow">Family Experiences</p>
          <h2>
            Activities for <em>Every Member</em>
          </h2>
          <p className="sub-note">
            From young children to grandparents, we curate experiences that bring families
            together — always respectful, always memorable.
          </p>
        </div>
        <div className="activities-grid fade-in">
          {ACTIVITIES.map((a) => (
            <div key={a.title} className="activity-card">
              <span className="activity-icon">{a.icon}</span>
              <h4 className="activity-title">{a.title}</h4>
              <p className="activity-desc">{a.desc}</p>
            </div>
          ))}
        </div>

        {/* TRUST STRIP */}
        <div className="trust-strip fade-in">
          {[
            ["100%", "Halal dining", "guaranteed"],
            ["24/7", "Dedicated", "concierge"],
            ["0", "Alcohol on", "your premises"],
            ["∞", "Memories made", "with family"],
          ].map(([n, l1, l2]) => (
            <div key={n} className="trust-item">
              <div className="trust-number">{n}</div>
              <div className="trust-label">
                {l1}
                <br />
                {l2}
              </div>
            </div>
          ))}
        </div>

        {/* BODY */}
        <div className="vip-body fade-in">
          <div className="body-aside">
            <p className="aside-label">Our Promise</p>
            <blockquote className="aside-quote">
              &ldquo;Travel that honors your faith, your family, and your freedom.&rdquo;
            </blockquote>
            <ul className="aside-list">
              <li>Halal food &amp; private chef</li>
              <li>Prayer facilities in every villa</li>
              <li>Alcohol-free private accommodations</li>
              <li>Modest private beach &amp; pool</li>
              <li>Family-oriented activities</li>
              <li>Muslim-aware concierge team</li>
              <li>Full trip planning &amp; coordination</li>
            </ul>
          </div>
          <div className="body-content">
            <p>
              We believe that Muslim families deserve to travel with the same freedom, luxury, and
              joy as anyone else — without having to compromise their values at every turn.
              That&apos;s why Amanah Vacations was built with trust at its core.
            </p>
            <p>
              From the moment you reach out to us, our team gets to know your family&apos;s
              needs, preferences, and expectations. We handle everything — the villa, the meals,
              the prayer arrangements, the activities — so that by the time you arrive, the only
              thing left to do is enjoy.
            </p>
            <p>
              The Riviera Maya is one of the most beautiful destinations in the world, and we want
              every Muslim traveler to experience it fully, comfortably, and with complete peace
              of mind. Whether it&apos;s your first time visiting Mexico or your fifth, we&apos;ll
              make it the trip you remember forever.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="cta-band fade-in">
          <div className="cta-text">
            <p className="cta-eyebrow">Plan Your Halal Journey</p>
            <h3 className="cta-headline">
              Ready to travel <em>without compromise?</em>
            </h3>
          </div>
          <div className="cta-buttons">
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
            <p className="vip-modal-eyebrow">Plan Your Halal Journey</p>
            <h3 className="vip-modal-title">Request Your VIP Experience</h3>
            <p className="vip-modal-text">
              Tell us a little about your trip — dates, group size, and what matters most to your
              family — and our team will reach out to design a fully halal, VIP-tailored journey
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
            <span>Your faith.</span> Your family. <span>Your adventure.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
