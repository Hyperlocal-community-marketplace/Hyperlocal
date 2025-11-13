import { SellerSidebar } from "../components/seller/SellerSidebar";
import { Header } from "../components/Header";
import { Outlet, Navigate } from "react-router-dom";
import { shopService } from "../lib/shop";
import { useState, useEffect } from "react";

export function SellerLayout() {
  const [seller, setSeller] = useState(() => shopService.getCurrentSeller());

  useEffect(() => {
    setSeller(shopService.getCurrentSeller());

    const interval = setInterval(() => {
      const s = shopService.getCurrentSeller();
      setSeller(s ?? null);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (seller === undefined) {
    return <div className="p-6">Loading...</div>;
  }

  if (!seller) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Header />
      <div className="flex flex-1 mt-20">
        <SellerSidebar />
        <main className="flex-1 ml-64 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
