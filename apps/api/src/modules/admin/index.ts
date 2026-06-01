import { Router } from "express";
import { requireAuth, requireStaff } from "../../middleware/auth.js";
import catalogAdmin from "./catalog.admin.js";
import ordersAdmin from "./orders.admin.js";
import crmAdmin from "./crm.admin.js";
import marketingAdmin from "./marketing.admin.js";
import cmsAdmin from "./cms.admin.js";
import shippingAdmin from "./shipping.admin.js";
import reportsAdmin from "./reports.admin.js";
import settingsAdmin from "./settings.admin.js";

const router = Router();

// Every admin route requires a valid token + a staff role.
router.use(requireAuth, requireStaff);

router.use(catalogAdmin); // products, inventory, crafts, categories, collections
router.use("/orders", ordersAdmin); // orders + returns
router.use("/customers", crmAdmin);
router.use("/marketing", marketingAdmin); // coupons, banners, abandoned carts
router.use("/cms", cmsAdmin); // journal + review moderation
router.use("/shipping", shippingAdmin);
router.use("/reports", reportsAdmin);
router.use(settingsAdmin); // settings, staff, audit, uploads

export default router;
