import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";
import { apiError } from "@/lib/api";
import { Modal } from "@/components/Overlay";

export function LoginModal() {
  const { loginOpen, loginRedirect, closeLogin, showToast } = useUI();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loginOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "signup") await signup(form.name, form.email, form.password, form.phone || undefined);
      else await login(form.email, form.password);
      const redirect = loginRedirect;
      closeLogin();
      showToast(mode === "signup" ? "Welcome to Parchhai ✓" : "Welcome back ✓");
      if (redirect) navigate(redirect);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal onClose={closeLogin} className="w-full max-w-md p-8 md:p-10">
      <span className="font-display-lg text-2xl tracking-tighter text-primary">Parchhai</span>
      <h1 className="mt-6 font-headline-md text-2xl text-primary">{mode === "signup" ? "Create account" : "Welcome back"}</h1>
      <p className="mt-1 text-sm text-on-surface-variant">{mode === "signup" ? "Join us in keeping block-print crafts alive." : "Sign in to continue."}</p>

      {error && <p className="mt-4 border border-secondary/40 bg-secondary/5 px-3 py-2 text-sm text-secondary">{error}</p>}

      <form onSubmit={submit} className="mt-6 space-y-5">
        {mode === "signup" && (
          <div>
            <label className="label-caps text-on-surface-variant">Full name</label>
            <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
        )}
        <div>
          <label className="label-caps text-on-surface-variant">Email</label>
          <input type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        {mode === "signup" && (
          <div>
            <label className="label-caps text-on-surface-variant">Phone (optional)</label>
            <input className="input mt-1" placeholder="+91…" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        )}
        <div>
          <label className="label-caps text-on-surface-variant">Password</label>
          <input type="password" className="input mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
      </form>

      <p className="mt-6 text-sm text-on-surface-variant">
        {mode === "signup" ? "Already have an account? " : "New here? "}
        <button onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); }} className="text-secondary hover:underline">
          {mode === "signup" ? "Sign in" : "Create one"}
        </button>
      </p>
      {mode === "signin" && (
        <p className="mt-6 border-t border-outline-variant pt-4 text-xs text-on-surface-variant">
          Demo — customer: aanya@example.com · admin: admin@parchhai.example · password: Password123!
        </p>
      )}
    </Modal>
  );
}
