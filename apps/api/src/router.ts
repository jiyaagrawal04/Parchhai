import { Router } from "express";
import authRoutes from "./modules/auth.routes.js";
import catalogRoutes from "./modules/catalog.routes.js";
import cartRoutes from "./modules/cart.routes.js";
import wishlistRoutes from "./modules/wishlist.routes.js";
import orderRoutes from "./modules/order.routes.js";
import customerRoutes from "./modules/customer.routes.js";
import reviewRoutes from "./modules/review.routes.js";
import paymentRoutes from "./modules/payments.routes.js";
import adminRoutes from "./modules/admin/index.js";

const api = Router();

api.get("/health", (_req, res) => res.json({ data: { status: "ok", service: "parchhai-api" } }));

api.use("/auth", authRoutes);
api.use("/catalog", catalogRoutes);
api.use("/cart", cartRoutes);
api.use("/wishlist", wishlistRoutes);
api.use("/orders", orderRoutes);
api.use("/me", customerRoutes);
api.use("/reviews", reviewRoutes);
api.use("/payments", paymentRoutes);
api.use("/admin", adminRoutes);

export default api;
