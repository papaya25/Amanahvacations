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
import type { HalalContent } from "./content";

const WA_NUMBER = "529844521184";
const EMAIL = "booking@amanahvacations.com";

const WA_MSG = encodeURIComponent(
  "Hello Amanah Vacations! 👋\n\nI'm interested in the VIP Halal Experience.\n\nPlease help me plan a fully halal, VIP-tailored trip for my family. Thank you!"
);
const EMAIL_SUBJECT = encodeURIComponent("VIP Halal Experience — Request");
const EMAIL_BODY = encodeURIComponent(
  "Hello Amanah Vacations,\n\nI'm interested in the VIP Halal Experience.\n\nPlease help me plan a fully halal, VIP-tailored trip for my family.\n\nThank you!"
);

/* Icons stay in the client, matched by index to the translated text arrays
   delivered from the server (content prop). */
const PILLAR_ICONS = [IconDining, IconMosque, IconVilla, IconFamily, IconWaves];
const PERK_ICONS = [IconNoAlcohol, IconPool, IconBed, IconMosque, IconBell];
const ACTIVITY_ICONS = [IconCenote, IconBeach, IconTemple, IconYacht, IconLeaf, IconPark];

const Ornament = () => (
  <div className="ornament-divider fade-in">
    <div className="ornament-center">
      <div className="ornament-diamond sm" />
      <div className="ornament-diamond" />
      <div className="ornament-diamond sm" />
    </div>
  </div>
);

export default function HalalClient({ content }: { content: HalalContent }) {
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
          <div className="badge">{content.heroBadge}</div>
          <h1>
            {content.heroTitle1} <em>{content.heroTitleEm}</em>
          </h1>
          <p className="hero-sub">{content.heroSub}</p>
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
            <p className="intro-eyebrow">{content.introEyebrow}</p>
            <h2 className="intro-title">
              {content.introTitle1} <em>{content.introTitleEm}</em> {content.introTitle2}
            </h2>
            <p className="intro-text">{content.introText}</p>
            <div className="promise-strip">
              {content.promiseStrip.map((p) => (
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
            <p className="faith-tagline">{content.faithTagline}</p>
            <p className="arabic-text">أمانة</p>
          </div>
        </div>

        <Ornament />

        {/* PILLARS */}
        <div className="section-heading fade-in">
          <p className="eyebrow">{content.pillarsEyebrow}</p>
          <h2>
            {content.pillarsTitle1} <em>{content.pillarsTitleEm}</em>
          </h2>
          <p className="sub-note">{content.pillarsNote}</p>
        </div>
        <div className="pillars-grid fade-in">
          {content.pillars.map((p, i) => (
            <div key={p.title} className="pillar-card">
              <div className="pillar-icon">{PILLAR_ICONS[i]}</div>
              <h3 className="pillar-title">{p.title}</h3>
              <p className="pillar-desc">{p.desc}</p>
            </div>
          ))}
        </div>

        <Ornament />

        {/* DINING */}
        <div className="section-heading fade-in">
          <p className="eyebrow">{content.diningEyebrow}</p>
          <h2>
            {content.diningTitle1} <em>{content.diningTitleEm}</em>
          </h2>
          <p className="sub-note">{content.diningNote}</p>
        </div>
        <div className="dining-section fade-in">
          {content.dining.map((d) => (
            <div key={d.name1} className="dining-card">
              <div className="dining-tag">{d.tag}</div>
              <h3 className="dining-name">
                {d.name1} <em>{d.nameEm}</em>
              </h3>
              <p className="dining-desc">{d.desc}</p>
              <ul className="dining-features">
                {d.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Ornament />

        {/* VILLA */}
        <div className="section-heading fade-in">
          <p className="eyebrow">{content.villaEyebrow}</p>
          <h2>
            {content.villaTitle1} <em>{content.villaTitleEm}</em>
          </h2>
        </div>
        <div className="villa-section fade-in">
          <div className="villa-image-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/luxe/villa.jpg" alt="Private Luxury Villa" />
            <div className="villa-corner">{content.villaCorner}</div>
          </div>
          <div className="villa-content">
            <p className="villa-eyebrow">{content.villaContentEyebrow}</p>
            <h3 className="villa-title">
              {content.villaContentTitle1} <em>{content.villaContentTitleEm}</em>
            </h3>
            <p className="villa-text">{content.villaText}</p>
            <ul className="villa-perks">
              {content.perks.map((p, i) => (
                <li key={p.title}>
                  <span className="perk-icon">{PERK_ICONS[i]}</span>
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
          <p className="eyebrow">{content.activitiesEyebrow}</p>
          <h2>
            {content.activitiesTitle1} <em>{content.activitiesTitleEm}</em>
          </h2>
          <p className="sub-note">{content.activitiesNote}</p>
        </div>
        <div className="activities-grid fade-in">
          {content.activities.map((a, i) => (
            <div key={a.title} className="activity-card">
              <span className="activity-icon">{ACTIVITY_ICONS[i]}</span>
              <h4 className="activity-title">{a.title}</h4>
              <p className="activity-desc">{a.desc}</p>
            </div>
          ))}
        </div>

        {/* TRUST STRIP */}
        <div className="trust-strip fade-in">
          {content.trust.map((t) => (
            <div key={t.n} className="trust-item">
              <div className="trust-number">{t.n}</div>
              <div className="trust-label">
                {t.l1}
                <br />
                {t.l2}
              </div>
            </div>
          ))}
        </div>

        {/* BODY */}
        <div className="vip-body fade-in">
          <div className="body-aside">
            <p className="aside-label">{content.promiseLabel}</p>
            <blockquote className="aside-quote">
              &ldquo;{content.promiseQuote}&rdquo;
            </blockquote>
            <ul className="aside-list">
              {content.promiseList.map((item) => (
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
          <div className="cta-text">
            <p className="cta-eyebrow">{content.ctaEyebrow}</p>
            <h3 className="cta-headline">
              {content.ctaHeadline1} <em>{content.ctaHeadlineEm}</em>
            </h3>
          </div>
          <div className="cta-buttons">
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
      </div>
    </div>
  );
}
