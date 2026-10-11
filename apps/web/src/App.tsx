import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { StorefrontLayout } from "@/components/StorefrontLayout";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Crafts from "@/pages/Crafts";
import CraftDetail from "@/pages/CraftDetail";
import Story from "@/pages/Story";
import Contact from "@/pages/Contact";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";

/** Scroll to top on every route change (static SPA). */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0 }), [pathname]);
  return null;
};

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<StorefrontLayout />}>
          <Route index element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/crafts" element={<Crafts />} />
          <Route path="/crafts/:slug" element={<CraftDetail />} />
          <Route path="/story" element={<Story />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
