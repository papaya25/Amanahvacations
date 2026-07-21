const PLACES = [
  "Hidden Cenotes",
  "Tulum Ruins",
  "Holbox Island",
  "White-Sand Beaches",
  "Sian Ka'an",
  "Coral Reefs",
  "Mayan Jungle",
  "Xcaret",
  "Akumal Turtles",
  "Chichén Itzá",
];

export default function PostcardDivider() {
  const row = PLACES.map((p) => (
    <span key={p} className="mx-6 inline-flex items-center gap-12 whitespace-nowrap">
      <span className="font-serif text-[clamp(20px,2vw,28px)] font-medium italic text-forest/80">
        {p}
      </span>
      <span aria-hidden className="text-[13px] text-gold">
        ✦
      </span>
    </span>
  ));

  return (
    <div id="postcard-divider" aria-hidden className="relative overflow-hidden bg-cream">
      {/* Drifting destinations */}
      <div className="marquee flex w-max items-center py-7">
        <div className="flex items-center">{row}</div>
        <div className="flex items-center">{row}</div>
      </div>

      {/* Soft wave flowing into the dark section below */}
      <svg
        className="block w-full"
        viewBox="0 0 1440 72"
        preserveAspectRatio="none"
        style={{ height: "clamp(34px, 5vw, 72px)" }}
      >
        <path
          d="M0,44 C240,76 480,10 720,26 C960,42 1200,70 1440,30 L1440,72 L0,72 Z"
          fill="#0a1a10"
        />
        <path
          d="M0,52 C260,80 500,22 740,36 C980,50 1220,74 1440,40"
          fill="none"
          stroke="#e8a84b"
          strokeOpacity="0.55"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
