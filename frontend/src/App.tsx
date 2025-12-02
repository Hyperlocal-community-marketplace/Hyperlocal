import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Toaster } from "sonner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { ChatPage } from "./pages/ChatPage";
import { LoginPage } from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { ShopsPage } from "./pages/ShopsPage";
import { ShopProfilePage } from "./pages/ShopProfilePage";
import { ProjectDocumentationPage } from "./pages/ProjectDocumentationPage";

import { SellerLayout } from "./layouts/SellerLayout";
import { AdminLayout } from "./layouts/AdminLayout";

import { SellerDashboard } from "./pages/seller/SellerDashboard";
import { SellerProductsPage } from "./pages/seller/SellerProductsPage";
import { SellerProductDetails } from "./pages/seller/SellerProductDetails";
import SellerEditProductPage from "./pages/seller/SellerEditProductPage";
import { SellerOrdersPage } from "./pages/seller/SellerOrdersPage";
import { SellerChatPage } from "./pages/seller/SellerChatPage";
import { SellerSettingsPage } from "./pages/seller/SellerSettingsPage";

import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminShopsPage } from "./pages/admin/AdminShopsPage";
import { AdminProductsPage } from "./pages/admin/AdminProductsPage";
import { AdminOrdersPage } from "./pages/admin/AdminOrdersPage";
import AdminLogin from "./pages/admin/AdminLogin";

import { authService } from "./lib/auth";
import { shopService } from "./lib/shop";
import { adminService } from "./lib/admin";
import { useAuthSync } from "./hooks/useAuthSync";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isUserAuthenticated = authService.isAuthenticated();
  const isSellerAuthenticated = shopService.getCurrentSeller() !== null;

  if (!isUserAuthenticated && !isSellerAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAdminAuthenticated = adminService.isAdmin();
  if (!isAdminAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function BuyerLayout() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="product/:id" element={<ProductDetailPage />} />
          <Route path="shops" element={<ShopsPage />} />
          <Route path="shop/:id" element={<ShopProfilePage />} />
          <Route path="cart" element={<CartPage />} />

          <Route
            path="checkout"
            element={
              <ProtectedRoute>
                <Elements stripe={stripePromise}>
                  <CheckoutPage />
                </Elements>
              </ProtectedRoute>
            }
          />

          <Route
            path="orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="profile/:id"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route path="login" element={<LoginPage />} />
          <Route path="documentation" element={<ProjectDocumentationPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  useAuthSync();

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">

        <Routes>
          <Route path="/*" element={<BuyerLayout />} />
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="dashboard" element={<SellerDashboard />} />
            <Route path="products" element={<SellerProductsPage />} />
            <Route path="products/:id" element={<SellerProductDetails />} />
            <Route path="products/edit/:id" element={<SellerEditProductPage />} />
            <Route path="orders" element={<SellerOrdersPage />} />
            <Route path="messages" element={<SellerChatPage />} />
            <Route path="settings" element={<SellerSettingsPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="shops" element={<AdminShopsPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
          </Route>
        </Routes>

        <Toaster position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
