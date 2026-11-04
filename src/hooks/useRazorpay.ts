import { useState } from "react";
import { createOrderFn, verifyPaymentFn } from "@/lib/server/checkout";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
}

interface CheckoutItem {
  productId?: string;
  productSlug: string;
  productTitle: string;
  size?: string;
  color?: string;
  unitPrice: number; // In paise
  quantity: number;
}

interface UseRazorpayOptions {
  onSuccess: (orderNumber: string) => void;
  onFailure?: (error: string) => void;
}

export function useRazorpay({ onSuccess, onFailure }: UseRazorpayOptions) {
  const [isLoading, setIsLoading] = useState(false);

  const loadScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processCheckout = async (params: {
    customer: CheckoutCustomer;
    items: CheckoutItem[];
    promoCode?: string;
  }) => {
    setIsLoading(true);

    try {
      // 1. Create Order on Backend
      const orderRes = await createOrderFn({
        data: {
          customerEmail: params.customer.email,
          customerPhone: params.customer.phone,
          shippingAddress: {
            type: "SHIPPING",
            name: params.customer.name,
            street: params.customer.street,
            city: params.customer.city,
            state: params.customer.state,
            postalCode: params.customer.postalCode,
            country: "India",
            phone: params.customer.phone,
            isDefault: false,
          },
          items: params.items,
          promoCode: params.promoCode || undefined,
        },
      });

      const { gatewayOrder, orderNumber } = orderRes;

      // 2. Handle Mock Gateway (zero-credential local test mode)
      if (gatewayOrder.keyId === "rzp_test_MOCK_LOCAL_KEY") {
        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSignature = `sig_mock_${Date.now()}`;

        // Verify simulated payment
        const verifyRes = await verifyPaymentFn({
          data: {
            orderNumber,
            razorpayOrderId: gatewayOrder.gatewayOrderId,
            razorpayPaymentId: mockPaymentId,
            razorpaySignature: mockSignature,
          },
        });

        if (verifyRes.success) {
          toast.success("Order confirmed via Atelier Test Gateway");
          onSuccess(orderNumber);
        } else {
          throw new Error("Payment verification failed");
        }
        setIsLoading(false);
        return;
      }

      // 3. Live / Real Razorpay Gateway
      const scriptLoaded = await loadScript();
      if (!scriptLoaded) {
        throw new Error(
          "Unable to initialize secure Razorpay gateway. Please check your connection.",
        );
      }

      const options = {
        key: gatewayOrder.keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency,
        name: "AIDAH — The Label",
        description: `Order ${orderNumber} · Luxury Designer Wear`,
        image: "/logo.jpg",
        order_id: gatewayOrder.gatewayOrderId,
        prefill: {
          name: params.customer.name,
          email: params.customer.email,
          contact: params.customer.phone,
        },
        theme: {
          color: "#8D2644", // AIDAH Rose Deep luxury brand color
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await verifyPaymentFn({
              data: {
                orderNumber,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
            });

            if (verifyRes.success) {
              toast.success("Payment completed successfully!");
              onSuccess(orderNumber);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (err: any) {
            let errorMsg = err?.message || "Failed to verify payment";
            try {
              const parsed = JSON.parse(errorMsg);
              if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
                errorMsg = parsed.map((p: any) => p.message).join(". ");
              }
            } catch {
              // Non-JSON error message string, keep original errorMsg
            }
            toast.error(errorMsg);
            onFailure?.(errorMsg);
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            toast.info("Payment was cancelled. Your bag remains saved.");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setIsLoading(false);
      let errorMsg = err?.message || "Could not complete checkout";
      try {
        const parsed = JSON.parse(errorMsg);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.message) {
          errorMsg = parsed.map((p: any) => p.message).join(". ");
        }
      } catch {
        // Non-JSON error message string, keep original errorMsg
      }
      toast.error(errorMsg);
      onFailure?.(errorMsg);
    }
  };

  return {
    processCheckout,
    isLoading,
  };
}
