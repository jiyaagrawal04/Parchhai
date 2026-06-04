import { useState } from "react";
import { useUI } from "@/store/ui";
import { Reveal, MIcon } from "@/components/Reveal";

const DETAILS = [
  { icon: "mail", label: "Email", value: "admin@myparchhai.com", href: "mailto:admin@myparchhai.com" },
  { icon: "call", label: "Phone", value: "+91 62013 02013 · +91 98180 97573", href: "tel:+916201302013" },
  { icon: "location_on", label: "Studio", value: "Mathikere, Bengaluru – 560054, Karnataka" },
  { icon: "schedule", label: "Hours", value: "Mon–Sat · 10am – 7pm IST" },
];

export default function Contact() {
  const { showToast } = useUI();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    showToast("Message sent ✓ We'll be in touch soon.");
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-surface-container px-5 py-20 text-center md:px-margin-desktop md:py-28">
        <Reveal>
          <span className="label-caps mb-4 block text-secondary">We'd love to hear from you</span>
          <h1 className="font-display-lg text-4xl text-primary md:text-display-lg">Contact</h1>
          <p className="mx-auto mt-5 max-w-xl text-body-md text-on-surface-variant">
            Questions about an order, our crafts, or a custom piece? Send us a note — a real person from the Parchhai studio will reply.
          </p>
        </Reveal>
      </section>

      <section className="container-px grid grid-cols-1 gap-16 py-20 md:grid-cols-2">
        {/* Form */}
        <Reveal>
          <h2 className="font-headline-md text-2xl text-primary">Send a message</h2>
          {sent ? (
            <div className="mt-8 border border-outline-variant bg-surface-container-low p-8 text-center">
              <MIcon name="mark_email_read" className="text-4xl text-secondary" />
              <h3 className="mt-3 font-headline-md text-xl text-primary">Thank you, {form.name || "friend"}.</h3>
              <p className="mt-2 text-sm text-on-surface-variant">Your message is on its way. We typically reply within one business day.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-6 label-caps text-secondary underline underline-offset-4">Send another</button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="label-caps text-on-surface-variant">Name</label>
                  <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label className="label-caps text-on-surface-variant">Email</label>
                  <input type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="label-caps text-on-surface-variant">Subject</label>
                <input className="input mt-1" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div>
                <label className="label-caps text-on-surface-variant">Message</label>
                <textarea rows={5} className="input mt-1 resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
              </div>
              <button className="btn-primary w-full sm:w-auto sm:px-12">Send message</button>
            </form>
          )}
        </Reveal>

        {/* Details */}
        <Reveal className="md:pl-8" delay={150}>
          <h2 className="font-headline-md text-2xl text-primary">Reach us directly</h2>
          <div className="mt-8 space-y-6">
            {DETAILS.map((d) => (
              <div key={d.label} className="flex items-start gap-4">
                <MIcon name={d.icon} className="mt-0.5 text-secondary" />
                <div>
                  <p className="label-caps text-[11px] text-on-surface-variant">{d.label}</p>
                  {d.href ? (
                    <a href={d.href} className="text-body-md text-primary hover:text-secondary">{d.value}</a>
                  ) : (
                    <p className="text-body-md text-primary">{d.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-outline-variant pt-8">
            <p className="label-caps text-[11px] text-on-surface-variant">Follow</p>
            <div className="mt-3 flex gap-6">
              <a href="https://instagram.com/parchhai.co" target="_blank" rel="noreferrer" className="label-caps text-[11px] text-primary hover:text-secondary">Instagram · @parchhai.co</a>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
