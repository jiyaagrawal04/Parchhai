import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useCart } from "@/lib/hooks";
import { useAuth } from "@/store/auth";
import { useUI } from "@/store/ui";
import { cx } from "@/lib/format";
import { MIcon } from "@/components/Reveal";
import { Wordmark } from "@/components/Wordmark";
import { LoginModal } from "@/components/LoginModal";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchModal } from "@/components/SearchModal";
import { QuickViewModal } from "@/components/QuickViewModal";
import { Toast } from "@/components/Toast";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/crafts", label: "Crafts" },
  { to: "/story", label: "Our Story" },
  { to: "/contact", label: "Contact" },
];

export const StorefrontLayout = () => {
  const { data: cart } = useCart();
  const { user, isStaff } = useAuth();
  const { openLogin, openCart, openSearch, searchOpen, quickViewSlug } = useUI();
  const location = useLocation();
  const count = cart?.itemCount ?? 0;
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent over the home hero; solid off-white everywhere else or once scrolled.
  const solid = !isHome || scrolled;
  const textOnDark = isHome && !scrolled;

  return (
    <div className="flex min-h-screen flex-col paper-grain">
      <div className="grain-overlay" />

      <nav
        className={cx(
          "fixed top-0 z-50 flex h-20 w-full items-center justify-between px-5 transition-all duration-500 md:px-margin-desktop",
          solid ? "bg-surface-bright/95 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm" : "bg-transparent",
        )}
      >
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center" aria-label="Parchhai — home">
            <Wordmark light={textOnDark} className="text-2xl md:text-3xl" />
          </Link>
          <div className="hidden gap-8 md:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cx(
                    "label-caps pb-1 transition-colors duration-300 hover:text-secondary",
                    isActive && "border-b border-secondary",
                    textOnDark ? (isActive ? "text-surface" : "text-surface/70") : isActive ? "text-primary" : "text-on-surface-variant",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className={cx("flex items-center gap-6", textOnDark ? "text-surface" : "text-primary")}>
          <button onClick={openSearch} aria-label="Search"><MIcon name="search" className="text-2xl hover:opacity-70" /></button>
          {user ? (
            <Link to="/account/orders" aria-label="Account"><MIcon name="person" className="text-2xl hover:opacity-70" /></Link>
          ) : (
            <button onClick={() => openLogin()} aria-label="Account"><MIcon name="person" className="text-2xl hover:opacity-70" /></button>
          )}
          <button onClick={openCart} className="relative" aria-label="Cart">
            <MIcon name="shopping_bag" className="text-2xl hover:opacity-70" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center bg-secondary px-1 text-[10px] font-bold text-surface">{count}</span>
            )}
          </button>
        </div>
      </nav>

      {isStaff && (
        <div className="fixed top-20 z-40 w-full bg-primary py-1.5 text-center text-xs text-surface">
          Signed in as staff — <Link to="/admin" className="underline">open the admin dashboard</Link>
        </div>
      )}

      <main className={cx("flex-1", !isHome && "pt-20")}>
        <Outlet />
      </main>

      {/* Footer (matches Stitch) */}
      <footer className="border-t border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter px-5 py-24 md:grid-cols-4 md:px-margin-desktop">
          <div className="flex flex-col gap-6">
            <Wordmark className="self-start text-4xl" />
            <p className="text-body-md text-on-surface-variant max-w-[220px]">
              Preserving the soul of Indian textiles through editorial silhouettes and unhurried design.
            </p>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p><span className="text-primary">Email:</span> <a href="mailto:admin@myparchhai.com" className="hover:text-primary">admin@myparchhai.com</a></p>
              <p><span className="text-primary">Contact:</span> <a href="tel:+916201302013" className="hover:text-primary">+91 62013 02013</a>, <a href="tel:+919818097573" className="hover:text-primary">+91 98180 97573</a></p>
              <p><span className="text-primary">Studio:</span> Mathikere, Bengaluru – 560054</p>
            </div>
          </div>
          <FooterCol title="Shop" links={[["New Arrivals", "/shop"], ["Kurtis", "/shop?category=kurtis"], ["Corsets", "/shop?category=corsets"], ["Dresses", "/shop?category=dresses"]]} />
          <FooterCol title="Our Story" links={[["The Crafts", "/crafts"], ["Lookbook", "/lookbook"], ["Contact", "/contact"], ["Provenance", "/story"]]} />
          <div className="flex flex-col gap-6">
            <span className="label-caps text-primary">Newsletter</span>
            <div className="flex border-b border-primary/20 pb-2">
              <input className="w-full bg-transparent text-body-md outline-none placeholder:text-on-surface-variant/50" placeholder="Email Address" type="email" />
              <MIcon name="arrow_forward" className="text-primary" />
            </div>
            <p className="label-caps text-[10px] text-on-surface-variant">Join the craft movement</p>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-outline/10 px-5 py-8 md:flex-row md:px-margin-desktop">
          <span className="label-caps text-[10px] text-on-surface-variant/60">© {new Date().getFullYear()} Parchhai. Crafted in India.</span>
          <div className="flex gap-8">
            <a href="https://instagram.com/parchhai.co" target="_blank" rel="noreferrer" className="label-caps text-[10px] text-on-surface-variant/60 hover:text-primary">Instagram · @parchhai.co</a>
          </div>
        </div>
      </footer>

      {/* Floating overlays — available on every storefront page */}
      <LoginModal />
      <CartDrawer />
      {searchOpen && <SearchModal />}
      {quickViewSlug && <QuickViewModal slug={quickViewSlug} />}
      <Toast />
    </div>
  );
};

const FooterCol = ({ title, links }: { title: string; links: [string, string][] }) => (
  <div className="flex flex-col gap-4">
    <span className="label-caps text-primary">{title}</span>
    <ul className="flex flex-col gap-2">
      {links.map(([label, to]) => (
        <li key={to + label}>
          <Link to={to} className="text-body-md text-on-surface-variant transition-colors hover:text-primary">{label}</Link>
        </li>
      ))}
    </ul>
  </div>
);
