"use client";

interface HeroProps {
  onOpenChat: () => void;
}

export default function Hero({ onOpenChat }: HeroProps) {
  return (
    <section
      className="relative flex flex-col items-center justify-center text-center min-h-screen px-6"
      style={{ backgroundColor: "#FAF8F4" }}
    >
      {/* Subtle radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(212,175,55,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Gold top line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20"
        style={{ background: "linear-gradient(to bottom, #D4AF37, transparent)" }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Eyebrow */}
        <p
          className="text-xs tracking-[0.3em] uppercase mb-8 font-medium"
          style={{ color: "#B8962E" }}
        >
          Downtown · Est. 2018
        </p>

        {/* Salon name */}
        <h1
          className="font-serif text-5xl sm:text-6xl md:text-7xl font-semibold mb-6 leading-tight"
          style={{ color: "#1a1a1a" }}
        >
          The Atelier
          <br />
          <span style={{ color: "#D4AF37" }}>Salon</span>
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16" style={{ backgroundColor: "#DDD8CF" }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "#D4AF37" }} />
          <div className="h-px w-16" style={{ backgroundColor: "#DDD8CF" }} />
        </div>

        {/* Tagline */}
        <p
          className="font-serif text-xl sm:text-2xl italic mb-4"
          style={{ color: "#5a5248" }}
        >
          Where artistry meets transformation.
        </p>

        <p
          className="text-sm mb-12 max-w-md mx-auto leading-relaxed"
          style={{ color: "#8a8078" }}
        >
          Expert stylists. Curated services. An experience designed entirely around you.
        </p>

        {/* CTA Button */}
        <button
          onClick={onOpenChat}
          className="group inline-flex items-center gap-3 px-8 py-4 rounded-full text-sm font-medium tracking-wide transition-all duration-300"
          style={{
            backgroundColor: "#1a1a1a",
            color: "#FAF8F4",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#D4AF37";
            e.currentTarget.style.color = "#1a1a1a";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(212, 175, 55, 0.4)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#1a1a1a";
            e.currentTarget.style.color = "#FAF8F4";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.15)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
              fill="currentColor"
            />
          </svg>
          Chat with our Booking Concierge
        </button>

        <p className="mt-6 text-xs" style={{ color: "#aaa49c" }}>
          Tue–Sun · 9am–8pm · Closed Mondays
        </p>
      </div>

      {/* Services strip */}
      <div
        className="absolute bottom-0 left-0 right-0 py-5 px-6 border-t"
        style={{ borderColor: "#E8E3DA" }}
      >
        <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
          {["Haircut", "Color", "Balayage", "Keratin", "Blowout"].map((service) => (
            <span
              key={service}
              className="text-xs tracking-widest uppercase"
              style={{ color: "#b0a99f" }}
            >
              {service}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
