import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Check, Send } from "lucide-react";
import { logoImg } from "@/data/catalog";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Visit Studio & Contact — AIDAH The Label | Gurugram" },
      {
        name: "description",
        content: "Visit our atelier at Baani City Centre, Sector 63, Gurugram. Book a bridal styling consultation or custom made-to-measure fitting.",
      },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto">
        <p className="eyebrow text-gold">Concierge &amp; Atelier</p>
        <h1 className="display-1 mt-2 text-4xl sm:text-5xl text-foreground">
          Visit Our <em className="italic font-normal text-rose-deep">Gurugram</em> Studio
        </h1>
        <p className="mt-4 text-sm sm:text-base text-cocoa leading-relaxed font-light">
          Whether you seek a bespoke bridal consultation, custom made-to-measure fitting, or simply wish to experience our fabric textures in person, our stylists await you.
        </p>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        {/* Studio Info (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-gold/30 bg-cream/70 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <img src={logoImg} alt="Aidah The Label" className="h-10 w-10 rounded-full object-cover ring-1 ring-gold/40" />
              <div>
                <h3 className="font-display text-xl text-foreground">Aidah Designer House &amp; Boutique</h3>
                <p className="text-[0.65rem] uppercase tracking-widest text-gold font-medium">Flagship Atelier</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-cocoa">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Address</p>
                  <p>Baani City Centre, Sector 63, Gurugram, Haryana 122011, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Hours</p>
                  <p>Monday – Saturday: 11:00 AM – 7:30 PM IST</p>
                  <p>Sunday: By Prior Appointment Only</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Atelier Email</p>
                  <p>concierge@aidah.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Boutique Concierge / WhatsApp</p>
                  <p>+91 (0124) 482-AIDAH</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 text-xs text-cocoa shadow-xs">
            <h4 className="font-semibold text-foreground mb-1">Complimentary Studio Services</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li>One-on-one bridal and trousseau consultations</li>
              <li>Bespoke made-to-measure measurements by master tailors</li>
              <li>Private viewing of archival fabric swatches and resham embroideries</li>
              <li>Complimentary styling refreshments</li>
            </ul>
          </div>
        </div>

        {/* Appointment Form (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-sm">
            <h2 className="font-display text-2xl text-foreground mb-2">Book a Fitting or Consultation</h2>
            <p className="text-xs text-muted-foreground mb-6">
              Fill in your preferred date and requirements. Our boutique concierge will confirm your slot within 4 hours.
            </p>

            {submitted ? (
              <div className="rounded-2xl border border-gold/30 bg-gold-soft/20 p-8 text-center">
                <Check className="mx-auto h-10 w-10 text-gold mb-3" />
                <h3 className="font-display text-xl text-foreground">Appointment Requested</h3>
                <p className="mt-2 text-xs text-cocoa leading-relaxed">
                  Thank you, {form.name}. Our Gurugram concierge has received your request and will contact you at {form.email} to confirm your appointment.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-medium text-foreground mb-1">Your Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Radhika Sharma"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-foreground mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@domain.com"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-medium text-foreground mb-1">Contact Phone / WhatsApp *</label>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-foreground mb-1">Preferred Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-4 py-2.5 outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">Special Notes / Silhouette Interest</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us what you're shopping for (e.g., Sangeet lehenga, linen co-ords, custom bridal blouse...)"
                    className="w-full rounded-xl border border-input bg-background p-4 outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-charcoal py-3.5 text-xs uppercase tracking-wider font-semibold text-ivory hover:bg-rose-deep shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" /> Confirm Appointment Request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
