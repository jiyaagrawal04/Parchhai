import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { cx } from "@/lib/format";

const links = [
  { to: "/account/orders", label: "Orders" },
  { to: "/account/returns", label: "Returns" },
  { to: "/account/wishlist", label: "Wishlist" },
  { to: "/account/addresses", label: "Addresses" },
  { to: "/account/profile", label: "Profile" },
];

export const AccountLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="container-px py-12">
      <h1 className="text-4xl text-indigo">My Account</h1>
      <p className="mt-1 text-sm text-muted">Hello, {user?.name}</p>
      <div className="mt-10 grid gap-10 md:grid-cols-[220px_1fr]">
        <aside className="space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cx("block border-l-2 px-4 py-2 text-sm transition-colors", isActive ? "border-rust text-rust" : "border-transparent text-ink hover:text-rust")
              }
            >
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={async () => {
              await logout();
              navigate("/");
            }}
            className="block w-full px-4 py-2 text-left text-sm text-muted hover:text-rust"
          >
            Sign out
          </button>
        </aside>
        <section><Outlet /></section>
      </div>
    </div>
  );
};
