import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext.tsx";
import { Navbar } from "./components/Navbar.tsx";
import { HomeView } from "./components/HomeView.tsx";
import { ProductsView } from "./components/ProductsView.tsx";
import { DetailsView } from "./components/DetailsView.tsx";
import { CartView } from "./components/CartView.tsx";
import { LoginView } from "./components/LoginView.tsx";
import { UserDashboardView } from "./components/UserDashboardView.tsx";
import { SellerDashboardView } from "./components/SellerDashboardView.tsx";
import { AdminDashboardView } from "./components/AdminDashboardView.tsx";
import { WhatsAppButton } from "./components/WhatsAppButton.tsx";

function MainAppContent() {
  const { 
    view, 
    onNavigate, 
    selectedDetailsId, 
    setToken, 
    setUser, 
    token, 
    user, 
    clearCart,
    ToastComponent,
    login
  } = useApp();

  // Primary agricultural data models
  const [products, setProducts] = useState<any[]>([]);
  const [deliveryDistricts, setDeliveryDistricts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); // for Admin management

  // Fetch Crops products database
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  // Fetch Delivery Regions
  const fetchDeliveryDistricts = async () => {
    try {
      const res = await fetch("/api/admin/delivery-charges");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDeliveryDistricts(data);
      }
    } catch (err) {
      console.error("Error loading delivery charges:", err);
    }
  };

  // Fetch orders (Specific to current user if Buyer, or entire list if Admin/Seller)
  const fetchOrders = async () => {
    if (!token) return;
    try {
      const headers: { [key: string]: string } = { "Authorization": `Bearer ${token}` };
      const res = await fetch("/api/orders", { headers });
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  // Fetch users array (Admin Only)
  const fetchUsers = async () => {
    if (!token || user?.role !== "admin") return;
    try {
      const headers: { [key: string]: string } = { "Authorization": `Bearer ${token}` };
      const res = await fetch("/api/admin/users", { headers });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Error loading users list:", err);
    }
  };

  // Bootstrapping initial fetches on load or token transitions
  useEffect(() => {
    fetchProducts();
    fetchDeliveryDistricts();
  }, []);

  useEffect(() => {
    if (token) {
      fetchOrders();
      if (user?.role === "admin") {
        fetchUsers();
      }
    } else {
      setOrders([]);
      setUsers([]);
    }
  }, [token, user]);

  // Auth Operations
  const handleLoginSubmit = async (credentials: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Authentication failed.");
        return false;
      }

      login(data.user, data.token);
      onNavigate(data.user.role === "admin" ? "admin" : data.user.role === "seller" ? "seller" : "dashboard");
      return true;
    } catch (err) {
      console.error("Login call error:", err);
      alert("Network login failure.");
      return false;
    }
  };

  const handleRegisterSubmit = async (formData: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Registration validation failed.");
        return false;
      }

      alert("Vanakkam! Account registration requested successfully. Log in using your email.");
      return true;
    } catch (err) {
      console.error("Registration error:", err);
      alert("Network registration failure.");
      return false;
    }
  };

  // Product CRUD (Sellers Only)
  const handleAddProduct = async (formData: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not list harvest.");
        return false;
      }

      fetchProducts();
      alert("Produce listed in the marketplace!");
      return true;
    } catch (err) {
      console.error("Add crop error:", err);
      return false;
    }
  };

  const handleEditProduct = async (id: string, formData: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not edit harvest.");
        return false;
      }

      fetchProducts();
      alert("Produce details modified!");
      return true;
    } catch (err) {
      console.error("Edit crop error:", err);
      return false;
    }
  };

  const handleDeleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not delete harvest item.");
        return false;
      }

      fetchProducts();
      alert("Produce item removed.");
      return true;
    } catch (err) {
      console.error("Delete crop error:", err);
      return false;
    }
  };

  // Submit Comments / Reviews
  const handleReviewSubmit = async (pId: string, rating: number, comment: string) => {
    try {
      const res = await fetch(`/api/products/${pId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ rating, comment })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to post comment.");
        return;
      }

      fetchProducts();
      alert("Thank you for your rating! Feedback recorded.");
    } catch (err) {
      console.error("Review posting error:", err);
    }
  };

  // Checkout submit
  const handleCheckoutSubmit = async (checkoutData: any) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(checkoutData)
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to finalize checkout.");
        return;
      }

      // If Razorpay, simulate Gateway callback
      if (checkoutData.paymentMethod === "Razorpay") {
        alert("🔒 Redirecting to Razorpay checkout portal... Simulated Payment Authorized!");
        
        // Call simulated Razorpay callback verification API
        await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            orderId: data.orderId,
            razorpayPaymentId: "pay_" + Math.random().toString(36).substring(4),
            razorpayOrderId: "order_" + Math.random().toString(36).substring(4)
          })
        });
      } else {
        alert("✨ GPay screenshot uploaded to admin queue successfully. Awaiting UPI Ref validation.");
      }

      clearCart();
      fetchOrders();
      onNavigate("dashboard");
    } catch (err) {
      console.error("Checkout process error:", err);
    }
  };

  // Seller dispatch updates status directly
  const handleUpdateOrderStatus = async (id: string, nextStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ status: nextStatus })
      });
      
      if (res.ok) {
        fetchOrders();
        alert("Status updated successfully!");
      }
    } catch (err) {
      console.error("Update status error:", err);
    }
  };

  // Admin controls
  const handleToggleBlockUser = async (uId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${uId}/block`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchUsers();
        alert("Customer suspension state toggled!");
      }
    } catch (err) {
      console.error("Block user error:", err);
    }
  };

  const handleApproveSeller = async (sId: string, isApproved: boolean) => {
    try {
      const res = await fetch(`/api/admin/sellers/${sId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ isApproved })
      });
      if (res.ok) {
        fetchUsers();
        alert("Farmer store certificate verification completed!");
      }
    } catch (err) {
      console.error("Approve farmer error:", err);
    }
  };

  const handleVerifyQRReceiptPayment = async (orderId: string, verified: boolean, txnId?: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ verified, txnId })
      });
      if (res.ok) {
        fetchOrders();
        alert("Manual Google Pay receipt verifications approved!");
      }
    } catch (err) {
      console.error("Verify receipt error:", err);
    }
  };

  const handleUpdateDeliveryChargeSettings = async (chargeData: any): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/delivery-charges", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(chargeData)
      });
      if (res.ok) {
        fetchDeliveryDistricts();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Update shipping setting error:", err);
      return false;
    }
  };

  const handleUpdateGPayMerchantConfig = async (gpayData: any): Promise<boolean> => {
    try {
      await fetch("/api/admin/gpay-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(gpayData)
      });
      return true;
    } catch (err) {
      console.error("Update UPI merchant error:", err);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 pb-16 relative">
      
      {/* Dynamic Navbar header */}
      <Navbar onNavigate={onNavigate} />

      {/* Main Orchestrator Routes layout Switcher */}
      <main className="animate-fade-in">
        {view === "home" && (
          <HomeView onNavigate={onNavigate} products={products} />
        )}

        {view === "catalog" && (
          <ProductsView onNavigate={onNavigate} products={products} />
        )}

        {view === "details" && selectedDetailsId && (
          <DetailsView
            productId={selectedDetailsId}
            onNavigate={onNavigate}
            products={products}
            onReviewSubmit={handleReviewSubmit}
            deliveryDistricts={deliveryDistricts}
          />
        )}

        {view === "cart" && (
          <CartView
            onNavigate={onNavigate}
            deliveryDistricts={deliveryDistricts}
            onCheckoutSubmit={handleCheckoutSubmit}
          />
        )}

        {view === "login" && (
          <LoginView
            onNavigate={onNavigate}
            onLoginSubmit={handleLoginSubmit}
            onRegisterSubmit={handleRegisterSubmit}
            deliveryDistricts={deliveryDistricts}
          />
        )}

        {view === "dashboard" && (
          <UserDashboardView
            orders={orders}
            onNavigate={onNavigate}
          />
        )}

        {view === "seller" && (
          <SellerDashboardView
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            deliveryDistricts={deliveryDistricts}
          />
        )}

        {view === "admin" && (
          <AdminDashboardView
            users={users}
            orders={orders}
            products={products}
            onToggleBlockUser={handleToggleBlockUser}
            onApproveSeller={handleApproveSeller}
            onVerifyPayment={handleVerifyQRReceiptPayment}
            onUpdateDeliveryCharge={handleUpdateDeliveryChargeSettings}
            onUpdateGPayConfig={handleUpdateGPayMerchantConfig}
            deliveryCharges={deliveryDistricts}
          />
        )}
      </main>

      {/* Persistent agricultural widgets */}
      <WhatsAppButton />
      <ToastComponent />

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
