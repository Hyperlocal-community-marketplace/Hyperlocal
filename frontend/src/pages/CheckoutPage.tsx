import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { motion } from "framer-motion";
import {
  CreditCard,
  Lock,
  Loader2,
  Sparkles,
  MapPin,
  Truck,
} from "lucide-react";
import { cartService } from "../lib/cart";
import { orderService } from "../lib/orders";
import { authService } from "../lib/auth";
import { shopService } from "../lib/shop";
import { toast } from "sonner";
import Confetti from "react-confetti";

export function CheckoutPage() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const user = authService.getCurrentUser();
  const seller = shopService.getCurrentSeller();
  const currentUser = user || seller;
  const cart = cartService.getCart();
  const total = cartService.getTotal();

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    zipCode: user?.zipCode || "",
  });

  const [processing, setProcessing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (cart.length === 0) {
      navigate("/cart", { replace: true });
      return;
    }
    if (!user.zipCode) {
      toast.error("Please set your ZIP Code in your profile before checkout");
      navigate("/profile", { replace: true });
      return;
    }
  }, [user, cart.length, navigate]);

  if (!user || cart.length === 0) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent zipCode changes in hyperlocal marketplace
    if (e.target.name === "zipCode") {
      return;
    }
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      toast.error("Stripe has not loaded yet. Please try again in a moment.");
      setProcessing(false);
      return;
    }

    try {
      const { fullName, email, phone, address, zipCode } = formData;
      const finalAmount = Math.round(total * 1.08 * 100);

      const response = await fetch("http://localhost:3000/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount }),
      });

      const { client_secret } = await response.json();
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name: fullName, email, phone },
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
        setProcessing(false);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        await orderService.createOrder(
          cart,
          { fullName, email, phone, address, zipCode },
          currentUser,
          total,
          {
            type: "card",
            status: "succeeded",
            id: result.paymentIntent.id,
          }
        );

        cartService.clearCart();
        setShowConfetti(true);
        toast.success("🎉 Payment successful! Order placed.");
        setTimeout(() => navigate("/orders"), 2000);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong during payment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )}
      <div className="container py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 gradient-text">Checkout</h1>
          <p className="text-lg text-muted-foreground">
            Complete your purchase
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Shipping Info */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg p-8 shadow-xl"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                  <MapPin className="h-6 w-6 text-primary" />
                  Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    ["fullName", "Full Name", "text"],
                    ["email", "Email", "email"],
                    ["phone", "Phone Number", "tel"],
                    ["address", "Street Address", "text"],
                    ["zipCode", "ZIP Code", "text"],
                  ].map(([name, placeholder, type]) => (
                    <input
                      key={name}
                      name={name}
                      type={type}
                      placeholder={placeholder}
                      value={(formData as any)[name]}
                      onChange={handleInputChange}
                      required
                      disabled={name === "zipCode"}
                      className={`px-4 py-3 border-2 border-primary/20 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white dark:bg-gray-800/20 ${
                        name === "zipCode" ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      title={name === "zipCode" ? "ZIP Code cannot be changed in a hyperlocal marketplace" : ""}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800/20 border-2 border-primary/20 rounded-lg p-8 shadow-xl"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-900 dark:text-white">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Payment Information
                </h2>
                <div className="bg-primary/10 p-4 rounded-lg mb-6 flex items-center gap-3 border border-primary/20">
                  <Lock className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Your payment information is secure and encrypted
                  </p>
                </div>

                <div className="border-2 border-primary/20 rounded-lg p-3 bg-white dark:bg-gray-800/20">
                  <CardElement
                    options={{
                      style: {
                        base: { fontSize: "16px", color: "#333" },
                      },
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-24 border-2 border-primary/20 rounded-lg p-8 bg-white dark:bg-gray-800/20 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm p-3 bg-primary/10 rounded-lg"
                    >
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-bold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-primary/20 pt-6 space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax (8%)</span>
                    <span className="font-semibold">
                      ${(total * 0.08).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t-2 border-primary/20 pt-4 flex justify-between text-2xl font-bold">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-primary">
                      ${(total * 1.08).toFixed(2)}
                    </span>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={processing}
                  whileHover={{ scale: processing ? 1 : 1.02 }}
                  whileTap={{ scale: processing ? 1 : 0.98 }}
                  className="w-full mt-6 flex items-center justify-center gap-3 bg-primary text-background-dark px-6 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Place Order
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
