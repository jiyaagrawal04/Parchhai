import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { cartCount, useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { CATEGORIES, COLLECTIONS } from "@/data/catalog";
import { INSTAGRAM_URL, SITE } from "@/data/site";
import { cx } from "@/lib/format";
import { MIcon } from "@/components/Reveal";
import { Wordmark } from "@/components/Wordmark";
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
  const items = useCart((s) => s.items);
  const { openCart, openSearch, searchOpen, quickViewSlug } = useUI();
  const location = useLocation();
  const count = cartCount(items);
  const isHome = location.pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  // Transparent over the home hero; solid (paper + blur) everywhere else or once scrolled.
  const solid = !isHome || scrolled || menuOpen;
  const textOnDark = isHome && !scrolled && !menuOpen;

  return (
    <div className="flex min-h-screen flex-col paper-grain">
      <div className="grain-overlay" />

      <nav
        className={cx(
          "fixed top-0 z-50 flex h-20 w-full items-center justify-between px-5 transition-all duration-500 md:px-margin-desktop",
          solid ? "bg-[#fffdf8]/95 backdrop-blur-xl border-b border-outline-variant/50 shadow-sm" : "bg-transparent",
        )}
      >
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center" aria-label="Parchhai home">
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
        <div className={cx("flex items-center gap-5 transition-colors md:gap-6", textOnDark ? "text-surface" : "text-primary")}>
          <button onClick={openSearch} aria-label="Search"><MIcon name="search" className="text-2xl hover:opacity-70" /></button>
          <button onClick={openCart} className="relative" aria-label="Cart">
            <MIcon name="shopping_bag" className="text-2xl hover:opacity-70" />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center bg-secondary px-1 text-[10px] font-bold text-surface">{count}</span>
            )}
          </button>
          <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" className="md:hidden"><MIcon name={menuOpen ? "close" : "menu"} className="text-2xl" /></button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-20 z-40 border-b border-outline/10 bg-surface/95 px-5 py-6 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-5">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cx("label-caps text-base", isActive ? "text-secondary" : "text-primary")}>{n.label}</NavLink>
            ))}
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="label-caps text-base text-primary">Instagram · @{SITE.instagramHandle}</a>
          </div>
        </div>
      )}

      <main className={cx("flex-1", !isHome && "pt-20")}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter px-5 py-24 md:grid-cols-4 md:px-margin-desktop">
          <div className="flex flex-col gap-6">
            <Wordmark className="self-start text-4xl" />
            <p className="text-body-md text-on-surface-variant max-w-[220px]">
              Preserving the soul of Indian textiles through editorial silhouettes and unhurried design.
            </p>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p><span className="text-primary">Email:</span> <a href={`mailto:${SITE.email}`} className="hover:text-primary">{SITE.email}</a></p>
              <p>
                <span className="text-primary">Contact:</span>{" "}
                {SITE.phones.map((ph, i) => (
                  <span key={ph}>{i > 0 && ", "}<a href={`tel:${ph.replace(/\s/g, "")}`} className="hover:text-primary">{ph}</a></span>
                ))}
              </p>
              <p><span className="text-primary">Studio:</span> {SITE.studio}</p>
            </div>
          </div>
          <FooterCol
            title="Shop"
            links={[
              ...COLLECTIONS.map((c) => [c.name, `/shop?collection=${c.slug}`] as [string, string]),
              ...CATEGORIES.map((c) => [c.name, `/shop?category=${c.slug}`] as [string, string]),
            ]}
          />
          <FooterCol title="Parchhai" links={[["The Crafts", "/crafts"], ["Our Story", "/story"], ["Contact", "/contact"], ["Your Bag", "/cart"]]} />
          <div className="flex flex-col gap-6">
            <span className="label-caps text-primary">Order on Instagram</span>
            <p className="text-body-md text-on-surface-variant">
              Add pieces to your bag and place the order. It opens a DM with us on Instagram, where we confirm sizing, payment and delivery.
            </p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="label-caps inline-flex items-center gap-2 self-start border-b border-primary pb-1 text-primary hover:text-secondary">
              @{SITE.instagramHandle} <MIcon name="arrow_outward" className="text-[16px]" />
            </a>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-outline/10 px-5 py-8 md:flex-row md:px-margin-desktop">
          <span className="label-caps text-[10px] text-on-surface-variant/60">© {new Date().getFullYear()} Parchhai. Crafted in India.</span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="label-caps text-[10px] text-on-surface-variant/60 hover:text-primary">Instagram · @{SITE.instagramHandle}</a>
        </div>
      </footer>

      {/* Floating overlays, available on every page */}
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
