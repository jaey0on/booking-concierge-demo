"use client";

import { useState } from "react";

export interface ServiceCardData {
  service: string;
  stylistTier: string;
  priceRange: string;
  stylistNames: string;
  description: string;
}

interface BookingModalProps {
  service: ServiceCardData;
  onClose: () => void;
}

function BookingModal({ service, onClose }: BookingModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E8E3DA" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{
            background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
          }}
        />
        <h3 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#1a1a1a" }}>
          Booking Confirmed
        </h3>
        <p className="text-sm mb-6" style={{ color: "#5a5248" }}>
          Your request has been received. Our team will reach out to confirm your appointment.
        </p>
        <div
          className="rounded-xl p-4 mb-6 space-y-2"
          style={{ backgroundColor: "#FAF8F4", border: "1px solid #E8E3DA" }}
        >
          <div className="flex justify-between text-sm">
            <span style={{ color: "#D4AF37" }}>Service</span>
            <span style={{ color: "#1a1a1a" }} className="font-medium">{service.service}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#B8962E" }}>Stylist Tier</span>
            <span style={{ color: "#1a1a1a" }}>{service.stylistTier}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span style={{ color: "#B8962E" }}>Price Range</span>
            <span style={{ color: "#1a1a1a" }}>{service.priceRange}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-medium text-sm transition-all duration-200"
          style={{
            backgroundColor: "#D4AF37",
            color: "#0a0a0a",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E8C84A")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D4AF37")}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default function ServiceCard({ data }: { data: ServiceCardData }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className="mt-3 rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E3DA",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, transparent, #D4AF37, transparent)",
          }}
        />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h4 className="font-serif text-base font-semibold" style={{ color: "#1a1a1a" }}>
              {data.service}
            </h4>
            <span
              className="text-sm font-semibold whitespace-nowrap"
              style={{ color: "#D4AF37" }}
            >
              {data.priceRange}
            </span>
          </div>
          <div className="space-y-1 mb-3">
            <p className="text-xs" style={{ color: "#5a5248" }}>
              <span style={{ color: "#B8962E" }}>Tier: </span>
              {data.stylistTier}
            </p>
            <p className="text-xs" style={{ color: "#5a5248" }}>
              <span style={{ color: "#B8962E" }}>Stylists: </span>
              {data.stylistNames}
            </p>
          </div>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: "#5a5248" }}>
            {data.description}
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{ backgroundColor: "#D4AF37", color: "#0a0a0a" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E8C84A")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#D4AF37")}
          >
            Book This Service
          </button>
        </div>
      </div>
      {showModal && (
        <BookingModal service={data} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
