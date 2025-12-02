import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  DollarSign,
} from "lucide-react";
import api from "../../lib/api";
import { toast } from "sonner";
import type { Order, Shop } from "../../types";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<(Order & { shop?: Shop | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/orders");
      const ordersData: Order[] = response.data.orders || [];

      const shopCache: Record<number, Shop> = {};

      const ordersWithShops = await Promise.all(
        ordersData.map(async (order) => {
          const shopId = order.shopId;

          if (!shopId) return { ...order, shop: null };

          if (shopCache[shopId]) {
            return { ...order, shop: shopCache[shopId] };
          }

          try {
            const shopRes = await api.get(`/shop/get-shop-info/${shopId}`);
            const shop: Shop = shopRes.data.shop;

            shopCache[shopId] = shop;

            return { ...order, shop };
          } catch (err) {
            console.warn("Failed to load shop", shopId);
            return { ...order, shop: null };
          }
        })
      );

      setOrders(ordersWithShops);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase();

    if (s.includes("pending"))
      return { color: "bg-yellow-500", icon: Clock, text: "Pending" };
    if (s.includes("confirmed"))
      return { color: "bg-blue-500", icon: CheckCircle2, text: "Confirmed" };
    if (s.includes("shipped"))
      return { color: "bg-purple-500", icon: Truck, text: "Shipped" };
    if (s.includes("delivered"))
      return { color: "bg-green-500", icon: CheckCircle2, text: "Delivered" };
    if (s.includes("cancelled"))
      return { color: "bg-red-500", icon: XCircle, text: "Cancelled" };

    return { color: "bg-gray-500", icon: Package, text: status };
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) =>
          order.status.toLowerCase().includes(filter.toLowerCase())
        );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Order Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Monitor and manage all platform orders
        </p>
      </div>

      <div className="flex gap-4">
        {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? "bg-primary text-background-dark"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {status[0].toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-12 text-center bg-white dark:bg-gray-800 border rounded-xl"
        >
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No orders found</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const cart =
              typeof order.cart === "string" ? JSON.parse(order.cart) : order.cart;

            const user =
              typeof order.user === "string" ? JSON.parse(order.user) : order.user;

            const shop = order.shop;
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl border"
              >
                <div className="flex justify-between">
                  <div>
                    <h2 className="font-bold text-lg">Order #{order.id}</h2>
                    <p className="text-gray-600">Customer: {user?.name}</p>
                    <p className="text-gray-600 mt-1">
                      Seller:{" "}
                      {shop?.name
                        ? `${shop.name} (${shop.email})`
                        : "Unknown Seller"}
                    </p>

                    {shop && (
                      <p className="text-gray-500 text-sm mt-1">
                        {shop.address || ""}
                      </p>
                    )}

                    <p className="text-gray-600 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div
                    className={`${statusInfo.color} text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                  >
                    <StatusIcon className="h-4 w-4" />
                    <span>{statusInfo.text}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {cart.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.name || item.productName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity || item.qty} × ₹
                          {Number(item.price).toFixed(2)}
                        </div>
                      </div>

                      <div className="font-bold">
                        ₹
                        {(
                          Number(item.price) *
                          Number(item.quantity || item.qty)
                        ).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-4 pt-4 flex justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="text-primary" />
                    <span className="font-bold text-xl">
                      ₹{Number(order.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}