import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Boxes, ShoppingCart, Users, RotateCcw,
  Megaphone, FileText, Star, BarChart3, Settings as SettingsIcon, LogOut, Palette,
} from "lucide-react";
import { useAuth } from "@/store/auth";
import { cx } from "@/lib/format";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Catalog", icon: Package },
  { to: "/admin/crafts", label: "Crafts", icon: Palette },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/returns", label: "Returns", icon: RotateCcw },
  { to: "/admin/marketing", label: "Marketing", icon: Megaphone },
  { to: "/admin/content", label: "Content", icon: FileText },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-indigo-deep text-ivory">
        <Link to="/admin" className="flex items-center border-b border-white/10 px-6 py-5">
          <img src="/logo.png" alt="Parchhai" className="h-9 w-auto brightness-0 invert" />
        </Link>
        <nav className="flex-1 overflow-y-auto py-4">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cx("flex items-center gap-3 px-6 py-2.5 text-sm transition-colors", isActive ? "bg-white/10 text-gold" : "text-ivory/70 hover:bg-white/5 hover:text-ivory")
              }
            >
              <n.icon size={17} />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 px-6 py-4 text-xs">
          <p className="font-semibold">{user?.name}</p>
          <p className="text-ivory/50">{user?.role}</p>
          <button onClick={async () => { await logout(); navigate("/"); }} className="mt-3 flex items-center gap-2 text-ivory/70 hover:text-gold">
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-8 py-10"><Outlet /></div>
      </main>
    </div>
  );
};
