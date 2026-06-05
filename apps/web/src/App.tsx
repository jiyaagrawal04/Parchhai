import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { PageLoader } from "@/components/ui";
import { StorefrontLayout } from "@/components/StorefrontLayout";
import { AccountLayout } from "@/components/AccountLayout";
import { AdminLayout } from "@/components/AdminLayout";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Crafts from "@/pages/Crafts";
import CraftDetail from "@/pages/CraftDetail";
import Lookbook from "@/pages/Lookbook";
import Story from "@/pages/Story";
import Journal from "@/pages/Journal";
import JournalPost from "@/pages/JournalPost";
import Contact from "@/pages/Contact";
import Search from "@/pages/Search";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";

import AccountOrders from "@/pages/account/Orders";
import AccountOrderDetail from "@/pages/account/OrderDetail";
import AccountReturns from "@/pages/account/Returns";
import AccountAddresses from "@/pages/account/Addresses";
import AccountProfile from "@/pages/account/Profile";
import AccountWishlist from "@/pages/account/Wishlist";

import Dashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminProductEdit from "@/pages/admin/ProductEdit";
import AdminCrafts from "@/pages/admin/Crafts";
import AdminInventory from "@/pages/admin/Inventory";
import AdminOrders from "@/pages/admin/Orders";
import AdminOrderDetail from "@/pages/admin/OrderDetail";
import AdminCustomers from "@/pages/admin/Customers";
import AdminReturns from "@/pages/admin/Returns";
import AdminMarketing from "@/pages/admin/Marketing";
import AdminContent from "@/pages/admin/Content";
import AdminReviews from "@/pages/admin/Reviews";
import AdminReports from "@/pages/admin/Reports";
import AdminSettings from "@/pages/admin/Settings";

const RequireAuth = ({ children, staff }: { children: JSX.Element; staff?: boolean }) => {
  const { user, isStaff, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (staff && !isStaff) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login signup />} />

      <Route element={<StorefrontLayout />}>
        <Route index element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/crafts" element={<Crafts />} />
        <Route path="/crafts/:slug" element={<CraftDetail />} />
        <Route path="/lookbook" element={<Lookbook />} />
        <Route path="/story" element={<Story />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/:slug" element={<JournalPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/search" element={<Search />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />

        <Route path="/account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="orders/:id" element={<AccountOrderDetail />} />
          <Route path="returns" element={<AccountReturns />} />
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="wishlist" element={<AccountWishlist />} />
        </Route>
      </Route>

      <Route path="/admin" element={<RequireAuth staff><AdminLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/:id" element={<AdminProductEdit />} />
        <Route path="crafts" element={<AdminCrafts />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="returns" element={<AdminReturns />} />
        <Route path="marketing" element={<AdminMarketing />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
