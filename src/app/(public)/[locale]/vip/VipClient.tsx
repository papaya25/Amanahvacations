"use client";

/* Ported from Maher's VIP embed — content and layout preserved; activity
   emojis replaced with line icons; fade-in observer and request modal kept. */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  IconBeach, IconCar, IconCenote, IconChef, IconCompass, IconConcierge,
  IconHeli, IconPark, IconScroll, IconTemple, IconYacht,
} from "@/components/LuxeIcons";
import type { VipContent } from "./content";

const WA_NUMBER = "529844521184";
const EMAIL = "booking@amanahvacations.com";

const WA_MSG = encodeURIComponent(
  "Hello Amanah Vacations! 👋\n\nI'm interested in the VIP Experience.\n\nPlease help me plan a fully private, VIP-tailored trip. Thank you!"
);
const EMAIL_SUBJECT = encodeURIComponent("VIP Experience — Request");
const EMAIL_BODY = encodeURIComponent(
  "Hello Amanah Vacations,\n\nI'm interested in the VIP Experience.\n\nPlease help me plan a fully private, VIP-tailored trip.\n\nThank you!"
);

/* Icons and static images stay in the client, matched by index to the
   translated text arrays delivered from the server (content prop). */
const SERVICE_ICONS = [IconCar, IconCompass, IconConcierge, IconYacht, IconChef, IconScroll];
const SERVICE_NUMBERS = ["01", "02", "03", "04", "05", "06"];
const ACTIVITY_ICONS = [IconCenote, IconBeach, IconYacht, IconTemple, IconHeli, IconPark];
const ACCOM_IMAGES = [
  "/images/luxe/villa.jpg",
  "/images/luxe/rosewood.jpg",
  "/images/luxe/banyan.jpg",
  "/images/luxe/fairmont.jpg",
  "/images/luxe/palafitos.jpg",
  "/images/luxe/hotel-xcaret.jpg",
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

export default function VipClient({ content }: { content: VipContent }) {
  const [modalOpen, setModalOpen] = useState(false);
  useFadeIn();

  return (
    <div id="vip-page">
      {/* HERO */}
      <div className="vip-hero-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/luxe/vip-hero.jpg" alt="VIP Services – Amanah Vacations Riviera Maya" />
        <div className="hero-image-caption">
          <div className="badge">{content.heroBadge}</div>
          <h1>
            {content.heroTitle1}<br />
            <em>{content.heroTitleEm}</em>
          </h1>
          <p className="hero-sub">{content.heroSub}</p>
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
              {content.introTitle1} <em>{content.introTitleEm}</em>
            </h2>
            <p className="intro-text">{content.introText}</p>
          </div>
          <div className="logo-box">
            <div className="logo-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.png" alt="Amanah Vacations Logo" />
            </div>
            <p className="logo-tagline">{content.logoTagline}</p>
          </div>
        </div>

        <div className="gold-divider fade-in">
          <span className="divider-icon">✦ ✦ ✦</span>
        </div>

        {/* SERVICES */}
        <div className="section-heading fade-in">
          <p className="eyebrow">{content.servicesEyebrow}</p>
          <h2>
            {content.servicesTitle1} <em>{content.servicesTitleEm}</em>
          </h2>
        </div>
        <div className="features-grid fade-in">
          {content.services.map((s, i) => (
            <div key={SERVICE_NUMBERS[i]} className="feature-card">
              <div className="feature-number">{SERVICE_NUMBERS[i]}</div>
              <div className="feature-icon">{SERVICE_ICONS[i]}</div>
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
          <p className="eyebrow">{content.activitiesEyebrow}</p>
          <h2>
            {content.activitiesTitle1} <em>{content.activitiesTitleEm}</em>
          </h2>
        </div>
        <div className="activities-section fade-in">
          <div className="activities-grid">
            {content.activities.map((a, i) => (
              <div key={a.title} className="activity-card">
                <div className="activity-icon-wrap lux-icon">{ACTIVITY_ICONS[i]}</div>
                <div className="activity-info">
                  <h4>{a.title}</h4>
                  <p>{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="section-browse">
            {content.browseBefore}{" "}
            <Link href="/activities" className="browse-link">
              {content.browseLink}
            </Link>{" "}
            {content.browseAfter}
          </p>
        </div>

        <div className="gold-divider fade-in">
          <span className="divider-icon">✦ ✦ ✦</span>
        </div>

        {/* ACCOMMODATION */}
        <div className="section-heading fade-in">
          <p className="eyebrow">{content.accomEyebrow}</p>
          <h2>
            {content.accomTitle1} <em>{content.accomTitleEm}</em>
          </h2>
        </div>
        <div className="accom-section fade-in">
          <div className="accom-grid">
            {content.accoms.map((a, i) => (
              <div key={a.name} className="accom-card">
                <div className="accom-img-slot">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ACCOM_IMAGES[i]} alt={a.name} loading="lazy" />
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
            <p className="aside-label">{content.includedLabel}</p>
            <blockquote className="aside-quote">
              &ldquo;{content.includedQuote}&rdquo;
            </blockquote>
            <ul className="aside-list">
              {content.includedList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="body-content">
            {content.bodyParas.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="cta-band fade-in">
          <div className="cta-text-block">
            <p className="cta-eyebrow">{content.ctaEyebrow}</p>
            <h3 className="cta-headline">
              {content.ctaHeadline1} <em>{content.ctaHeadlineEm}</em>
            </h3>
          </div>
          <div className="cta-rule">
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              {content.ctaPrimary}
            </button>
            <Link href="/activities" className="btn-secondary">
              {content.ctaSecondary}
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
            <p className="vip-modal-eyebrow">{content.modalEyebrow}</p>
            <h3 className="vip-modal-title">{content.modalTitle}</h3>
            <p className="vip-modal-text">{content.modalText}</p>
            <div className="vip-modal-btns">
              <a
                className="vip-wa-btn"
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content.modalWhatsApp}
              </a>
              <a className="vip-email-btn" href={`mailto:${EMAIL}?subject=${EMAIL_SUBJECT}&body=${EMAIL_BODY}`}>
                {content.modalEmail}
              </a>
            </div>
          </div>
        </div>

        {/* MANTRA */}
        <div className="mantra fade-in">
          <p className="mantra-text">
            <span>{content.mantra1}</span> {content.mantra2} <span>{content.mantra3}</span>
          </p>
        </div>
      </section>
    </div>
  );
}
