import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { apiError } from "@/lib/api";
import { ErrorNote } from "@/components/ui";

export default function Login({ signup }: { signup?: boolean }) {
  const { login, signup: doSignup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (signup) await doSignup(form.name, form.email, form.password, form.phone || undefined);
      else await login(form.email, form.password);
      navigate(location.state?.from ?? "/account/orders");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-indigo-deep md:block">
        <img src="https://picsum.photos/seed/parchhai-auth/1200/1600" alt="" className="h-full w-full object-cover opacity-80" />
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-serif text-3xl font-bold text-indigo">Parchhai</Link>
          <h1 className="mt-8 text-3xl text-indigo">{signup ? "Create account" : "Welcome back"}</h1>
          <p className="mt-2 text-sm text-muted">
            {signup ? "Join us in keeping block-print crafts alive." : "Sign in to continue."}
          </p>

          {error && <div className="mt-4"><ErrorNote message={error} /></div>}

          <form onSubmit={submit} className="mt-6 space-y-5">
            {signup && (
              <div>
                <label className="label-caps text-muted">Full name</label>
                <input className="input mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
            )}
            <div>
              <label className="label-caps text-muted">Email</label>
              <input type="email" className="input mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            {signup && (
              <div>
                <label className="label-caps text-muted">Phone (optional)</label>
                <input className="input mt-1" placeholder="+91…" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            )}
            <div>
              <label className="label-caps text-muted">Password</label>
              <input type="password" className="input mt-1" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</button>
          </form>

          <p className="mt-6 text-sm text-muted">
            {signup ? "Already have an account? " : "New here? "}
            <Link to={signup ? "/login" : "/signup"} className="text-rust hover:underline">{signup ? "Sign in" : "Create one"}</Link>
          </p>
          {!signup && (
            <p className="mt-6 border-t border-line pt-4 text-xs text-muted">
              Demo — customer: aanya@example.com · admin: admin@parchhai.example · password: Password123!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
