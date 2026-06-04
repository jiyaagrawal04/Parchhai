import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AddressInput, CouponPreview, PaymentInitDTO, OrderDTO } from "@parchhai/types";
import { useAddresses, useCart } from "@/lib/hooks";
import { api, apiError, unwrap } from "@/lib/api";
import { formatINR, cx } from "@/lib/format";
import { ErrorNote, PageLoader } from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";

const emptyAddress: AddressInput = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", type: "HOME", isDefault: false };

export default function Checkout() {
  const { data: cart, isLoading } = useCart();
  const { data: addresses } = useAddresses();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [addressId, setAddressId] = useState<string>("");
  const [newAddr, setNewAddr] = useState<AddressInput>(emptyAddress);
  const [useNew, setUseNew] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">("RAZORPAY");
  const [coupon, setCoupon] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isLoading) return <PageLoader />;
  if (!cart || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }

  const defaultAddr = addresses?.find((a) => a.isDefault) ?? addresses?.[0];
  const selectedId = addressId || defaultAddr?.id || "";
  const discount = couponPreview?.valid ? couponPreview.discount : 0;
  const freeShip = couponPreview?.freeShipping || cart.subtotal - discount >= 99900;
  const shipping = freeShip ? 0 : 7900;
  const total = cart.subtotal - discount + shipping;

  const applyCoupon = async () => {
    if (!coupon) return;
    try {
      const preview = unwrap<CouponPreview>(await api.post("/orders/coupon/preview", { code: coupon }));
      setCouponPreview(preview);
    } catch (e) {
      setError(apiError(e));
    }
  };

  const placeOrder = async () => {
    setError("");
    if (!useNew && !selectedId) return setError("Select or add a shipping address.");
    setBusy(true);
    try {
      const payload: Record<string, unknown> = { paymentMethod, couponCode: couponPreview?.valid ? coupon : undefined };
      if (useNew) payload.address = newAddr;
      else payload.addressId = selectedId;

      const res = await api.post("/orders", payload);
      const { order, payment } = res.data.data as { order: OrderDTO; payment: PaymentInitDTO | null };

      if (paymentMethod === "COD" || !payment) {
        await finish(order.id);
        return;
      }
      // Stub provider auto-confirms; Razorpay would open the widget here.
      if (payment.provider === "stub") {
        await api.post("/orders/payment/verify", {
          orderId: order.id,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: `pay_stub_${order.id}`,
          razorpaySignature: "stub-signature",
        });
        await finish(order.id);
      } else {
        await openRazorpay(payment, order.id);
      }
    } catch (e) {
      setError(apiError(e));
      setBusy(false);
    }
  };

  const finish = async (orderId: string) => {
    await qc.invalidateQueries({ queryKey: ["cart"] });
    await qc.invalidateQueries({ queryKey: ["orders"] });
    navigate(`/account/orders/${orderId}`);
  };

  const openRazorpay = (payment: PaymentInitDTO, orderId: string) =>
    new Promise<void>((resolve) => {
      const RZ = (window as unknown as { Razorpay?: new (o: object) => { open: () => void } }).Razorpay;
      if (!RZ) {
        setError("Razorpay SDK not loaded.");
        setBusy(false);
        return resolve();
      }
      const rz = new RZ({
        key: payment.razorpayKeyId,
        amount: payment.amount,
        currency: payment.currency,
        order_id: payment.razorpayOrderId,
        name: "Parchhai",
        handler: async (r: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          await api.post("/orders/payment/verify", {
            orderId,
            razorpayOrderId: r.razorpay_order_id,
            razorpayPaymentId: r.razorpay_payment_id,
            razorpaySignature: r.razorpay_signature,
          });
          await finish(orderId);
          resolve();
        },
      });
      rz.open();
    });

  const field = (key: keyof AddressInput, label: string, required = true) => (
    <div>
      <label className="label-caps text-muted">{label}</label>
      <input className="input mt-1" value={String(newAddr[key] ?? "")} onChange={(e) => setNewAddr({ ...newAddr, [key]: e.target.value })} required={required} />
    </div>
  );

  return (
    <div className="container-px py-12">
      <h1 className="text-4xl text-indigo">Checkout</h1>
      {error && <div className="mt-4"><ErrorNote message={error} /></div>}
      <div className="mt-10 grid gap-12 md:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {/* Address */}
          <section>
            <h2 className="font-serif text-2xl text-indigo">Shipping address</h2>
            <div className="mt-4 space-y-3">
              {addresses?.map((a) => (
                <label key={a.id} className={cx("flex cursor-pointer gap-3 border p-4", !useNew && selectedId === a.id ? "border-indigo" : "border-line")}>
                  <input type="radio" checked={!useNew && selectedId === a.id} onChange={() => { setUseNew(false); setAddressId(a.id); }} />
                  <div className="text-sm">
                    <p className="font-semibold">{a.name} · {a.phone}</p>
                    <p className="text-muted">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}</p>
                  </div>
                </label>
              ))}
              <label className={cx("flex cursor-pointer gap-3 border p-4", useNew ? "border-indigo" : "border-line")}>
                <input type="radio" checked={useNew} onChange={() => setUseNew(true)} />
                <span className="text-sm font-semibold">Use a new address</span>
              </label>
            </div>

            {useNew && (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {field("name", "Full name")}
                {field("phone", "Phone")}
                <div className="md:col-span-2">{field("line1", "Address line 1")}</div>
                <div className="md:col-span-2">{field("line2", "Address line 2", false)}</div>
                {field("city", "City")}
                {field("state", "State")}
                {field("pincode", "Pincode")}
              </div>
            )}
          </section>

          {/* Payment */}
          <section>
            <h2 className="font-serif text-2xl text-indigo">Payment</h2>
            <div className="mt-4 space-y-3">
              {([["RAZORPAY", "Pay online (UPI / Card / Netbanking)"], ["COD", "Cash on delivery"]] as const).map(([val, label]) => (
                <label key={val} className={cx("flex cursor-pointer gap-3 border p-4", paymentMethod === val ? "border-indigo" : "border-line")}>
                  <input type="radio" checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit card p-6">
          <h2 className="font-serif text-xl text-indigo">Order summary</h2>
          <div className="mt-4 max-h-48 space-y-3 overflow-y-auto">
            {cart.items.map((it) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span className="text-muted">{it.productName} ×{it.qty}</span>
                <span>{formatINR(it.lineTotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-line pt-4">
            <div className="flex gap-2">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="Coupon code" className="input" />
              <button onClick={applyCoupon} className="btn-ghost border border-line shrink-0">Apply</button>
            </div>
            {couponPreview && <p className={cx("mt-2 text-xs", couponPreview.valid ? "text-green-700" : "text-rust")}>{couponPreview.valid ? `Applied — you save ${formatINR(couponPreview.discount)}` : couponPreview.message}</p>}
          </div>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatINR(cart.subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>−{formatINR(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{shipping === 0 ? "Free" : formatINR(shipping)}</span></div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg font-semibold"><span>Total</span><span>{formatINR(total)}</span></div>
          <button onClick={placeOrder} disabled={busy} className="btn-rust mt-6 w-full">{busy ? "Placing order…" : `Place order · ${formatINR(total)}`}</button>
        </aside>
      </div>
    </div>
  );
}
