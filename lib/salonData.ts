export const salonInfo = {
  name: "The Atelier Salon",
  tagline: "Where artistry meets transformation.",
  location: "Downtown",
  hours: {
    open: "Tuesday–Sunday, 9am–8pm",
    closed: "Mondays",
  },
  policies: {
    firstTimeColor:
      "First-time color or lightening clients are required to book a complimentary consultation before their service.",
    cancellation: "We kindly ask for 24 hours notice for cancellations.",
    parking: "Complimentary valet parking is available at our downtown location.",
  },
};

export const services = [
  { name: "Haircut", priceRange: "$65–$160", duration: "45–75 min" },
  { name: "Base Color (all over)", priceRange: "$120–$200", duration: "2–3 hrs" },
  { name: "Highlights", priceRange: "$180–$300", duration: "2.5–3.5 hrs" },
  { name: "Balayage", priceRange: "$250–$400", duration: "3–4 hrs" },
  { name: "Bleach & Tone", priceRange: "$300–$500", duration: "3.5–5 hrs" },
  { name: "Keratin Treatment", priceRange: "$200–$400", duration: "2.5–3.5 hrs" },
  { name: "Blowout", priceRange: "$55–$95", duration: "45–60 min" },
];

export const stylistTiers = [
  {
    tier: "Senior Stylist",
    rate: "$160/hr",
    stylists: ["Alex", "Jordan"],
    description: "10+ years experience. Ideal for complex color, special occasions, or those who want the most experienced hands.",
  },
  {
    tier: "Mid-Level Stylist",
    rate: "$110–$125/hr",
    stylists: ["Sam", "Riley", "Casey"],
    description: "5–9 years experience. A great balance of skill and value for all service types.",
  },
  {
    tier: "Junior Stylist",
    rate: "$80–$95/hr",
    stylists: ["Morgan", "Taylor", "Avery"],
    description: "2–4 years experience. Excellent for cuts, blowouts, and straightforward color. Budget-friendly.",
  },
];
