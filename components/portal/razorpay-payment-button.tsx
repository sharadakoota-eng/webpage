"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type RazorpayPaymentButtonProps = {
  invoiceId: string;
  label?: string;
};

async function ensureRazorpayScript() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.Razorpay) {
    return true;
  }

  return await new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayPaymentButton({ invoiceId, label = "Pay now" }: RazorpayPaymentButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleCheckout() {
    setIsPending(true);
    try {
      const scriptReady = await ensureRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        window.alert("Unable to load Razorpay checkout.");
        return;
      }

      const orderResponse = await fetch("/api/parent/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const orderResult = (await orderResponse.json()) as {
        success?: boolean;
        message?: string;
        keyId?: string;
        orderId?: string;
        amount?: number;
        invoiceNumber?: string;
        studentName?: string;
        parentName?: string;
        parentEmail?: string;
      };

      if (!orderResponse.ok || !orderResult.success || !orderResult.keyId || !orderResult.orderId || !orderResult.amount) {
        throw new Error(orderResult.message || "Unable to create Razorpay order.");
      }

      const razorpay = new window.Razorpay({
        key: orderResult.keyId,
        amount: orderResult.amount,
        currency: "INR",
        name: "Sharada Koota Montessori School",
        description: `Fee payment for ${orderResult.studentName ?? "student"}`,
        order_id: orderResult.orderId,
        prefill: {
          name: orderResult.parentName,
          email: orderResult.parentEmail,
        },
        theme: {
          color: "#13294b",
        },
        handler: async (response: Record<string, string>) => {
          const verifyResponse = await fetch("/api/parent/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });

          const verifyResult = (await verifyResponse.json()) as { success?: boolean; message?: string };
          window.alert(verifyResult.message || (verifyResult.success ? "Payment submitted successfully." : "Unable to verify payment."));
          if (verifyResponse.ok && verifyResult.success) {
            router.refresh();
          }
        },
      });

      razorpay.open();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to start the payment.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={isPending}
      className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Preparing..." : label}
    </button>
  );
}
