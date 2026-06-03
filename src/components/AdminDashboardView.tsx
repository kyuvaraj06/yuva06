import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { User, ShieldAlert, Award, Grid, DollarSign, Settings, Check, X, Shield, RefreshCw, BarChart, Plus, Edit, Trash2, ArrowLeft, Layers, ShoppingBag } from "lucide-react";

interface AdminDashboardViewProps {
  users: any[];
  orders: any[];
  products: any[];
  onToggleBlockUser: (id: string) => void;
  onApproveSeller: (id: string, isApproved: boolean) => void;
  onVerifyPayment: (orderId: string, verified: boolean, txnId?: string) => void;
  onUpdateDeliveryCharge: (chargeData: any) => Promise<boolean>;
  onUpdateGPayConfig: (gpayData: any) => Promise<boolean>;
  deliveryCharges: any[];
  onAddProduct?: (formData: any) => Promise<boolean>;
  onEditProduct?: (id: string, formData: any) => Promise<boolean>;
  onDeleteProduct?: (id: string) => Promise<boolean>;
}

const CATEGORY_IMAGES: Record<string, string> = {
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600",
  cashew: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=600",
  jackfruit: "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?q=80&w=600",
  groundnuts: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=600",
  vegetables: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600",
  local_products: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600",
};

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  orders,
  products,
  onToggleBlockUser,
  onApproveSeller,
  onVerifyPayment,
  onUpdateDeliveryCharge,
  onUpdateGPayConfig,
  deliveryCharges,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  const { t, language, token } = useApp();

  // Mode tabs
  const [adminTab, setAdminTab] = useState<"analytics" | "verifications" | "sellers" | "users" | "config" | "database" | "produce">("analytics");

  // Local config states
  const [gpayId, setGpayId] = useState("tamilagro@okhdfcbank");
  const [qrImageUrl, setQrImageUrl] = useState("https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=tamilagro@okhdfcbank&pn=Tamil%20Agro%20Mart&am=1.00&cu=INR");

  // Shipping cost editor states
  const [shippingDistrict, setShippingDistrict] = useState("");
  const [shippingDistrictTA, setShippingDistrictTA] = useState("");
  const [shippingCharge, setShippingCharge] = useState("");
  const [shippingDays, setShippingDays] = useState("2");

  // Database Inspect states
  const [dbData, setDbData] = useState<{ users: any[]; products: any[]; orders: any[] }>({ users: [], products: [], orders: [] });
  const [dbLoading, setDbLoading] = useState(false);
  const [dbSearch, setDbSearch] = useState("");
  const [dbFileTab, setDbFileTab] = useState<"users" | "products" | "orders">("users");
  const [dbError, setDbError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Admin Product Catalog Management states
  const [editingProduceId, setEditingProduceId] = useState<string | null>(null);
  const [prodFormOpen, setProdFormOpen] = useState(false);
  const [nameEN, setNameEN] = useState("");
  const [nameTA, setNameTA] = useState("");
  const [descriptionEN, setDescriptionEN] = useState("");
  const [descriptionTA, setDescriptionTA] = useState("");
  const [category, setCategory] = useState("banana");
  const [price, setPrice] = useState("");
  const [availableStock, setAvailableStock] = useState("");
  const [availableStockUnitEN, setAvailableStockUnitEN] = useState("kg(s)");
  const [availableStockUnitTA, setAvailableStockUnitTA] = useState("கிலோ");
  const [images, setImages] = useState<string[]>(["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600"]);
  const [healthBenefitsEN, setHealthBenefitsEN] = useState("");
  const [healthBenefitsTA, setHealthBenefitsTA] = useState("");
  const [deliveryAvailability, setDeliveryAvailability] = useState(true);

  useEffect(() => {
    const isStandardPreset = images.length === 0 || images.some(img => Object.values(CATEGORY_IMAGES).includes(img));
    if (isStandardPreset && CATEGORY_IMAGES[category]) {
      setImages([CATEGORY_IMAGES[category]]);
    }
  }, [category]);

  const resetProduceFormFields = () => {
    setNameEN("");
    setNameTA("");
    setDescriptionEN("");
    setDescriptionTA("");
    setCategory("banana");
    setPrice("");
    setAvailableStock("");
    setAvailableStockUnitEN("kg(s)");
    setAvailableStockUnitTA("கிலோ");
    setImages(["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600"]);
    setHealthBenefitsEN("");
    setHealthBenefitsTA("");
    setDeliveryAvailability(true);
    setEditingProduceId(null);
    setProdFormOpen(false);
  };

  const handleAdminCreateProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEN || !nameTA || !price || !availableStock) {
      alert("Required metadata missing.");
      return;
    }
    if (!onAddProduct || !onEditProduct) return;

    const payload = {
      nameEN,
      nameTA,
      descriptionEN,
      descriptionTA,
      category,
      price: Number(price),
      availableStock: Number(availableStock),
      availableStockUnitEN,
      availableStockUnitTA,
      images,
      healthBenefitsEN,
      healthBenefitsTA,
      deliveryAvailability
    };

    let success = false;
    if (editingProduceId) {
      success = await onEditProduct(editingProduceId, payload);
    } else {
      success = await onAddProduct(payload);
    }

    if (success) {
      resetProduceFormFields();
    }
  };

  const startAdminEditProduce = (prod: any) => {
    setEditingProduceId(prod.id);
    setNameEN(prod.nameEN);
    setNameTA(prod.nameTA);
    setDescriptionEN(prod.descriptionEN);
    setDescriptionTA(prod.descriptionTA);
    setCategory(prod.category);
    setPrice(String(prod.price));
    setAvailableStock(String(prod.availableStock));
    setAvailableStockUnitEN(prod.availableStockUnitEN);
    setAvailableStockUnitTA(prod.availableStockUnitTA);
    setImages(prod.images || ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600"]);
    setHealthBenefitsEN(prod.healthBenefitsEN || "");
    setHealthBenefitsTA(prod.healthBenefitsTA || "");
    setDeliveryAvailability(prod.deliveryAvailability !== false);
    setProdFormOpen(true);
  };

  // Helper trigger to load raw database files
  const fetchDbRaw = async () => {
    setDbLoading(true);
    setDbError(null);
    try {
      const response = await fetch("/api/admin/database-raw", {
        headers: { "Authorization": `Bearer ${token || localStorage.getItem("agro_token")}` }
      });
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      const data = await response.json();
      setDbData(data);
    } catch (err: any) {
      console.error("Failed to load raw databases:", err);
      setDbError(err.message || "Failed to retrieve raw backend storage files.");
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (adminTab === "database") {
      fetchDbRaw();
    }
  }, [adminTab]);

  // Analytics API buffer
  const [analytics, setAnalytics] = useState<any>({
    metrics: {
      totalRevenue: 12450.00,
      totalCommission: 249.00,
      verifiedOrdersCount: 14,
      pendingQRVerificationCount: 0,
      usersCount: 8,
      sellersCount: 3,
      productsCount: 12
    },
    dailySalesReport: [],
    categoryBreakdown: []
  });

  // Calculate analytics in real-time or pull from API
  useEffect(() => {
    fetch("/api/admin/analytics", {
      headers: { "Authorization": `Bearer ${token || localStorage.getItem("agro_token")}` }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.metrics) {
          setAnalytics(data);
        }
      })
      .catch((err) => console.error("Error fetching analytics:", err));
  }, [orders, users, products]);

  const handleUpdateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingDistrict || !shippingDistrictTA || !shippingCharge) return;

    const success = await onUpdateDeliveryCharge({
      districtEN: shippingDistrict,
      districtTA: shippingDistrictTA,
      charge: Number(shippingCharge),
      estimatedDays: Number(shippingDays)
    });

    if (success) {
      setShippingDistrict("");
      setShippingDistrictTA("");
      setShippingCharge("");
      alert("Delivery flat-rate configured successfully.");
    }
  };

  const handleSaveGPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpayId || !qrImageUrl) return;

    const success = await onUpdateGPayConfig({ gpayId, qrImageUrl });
    if (success) {
      alert("GPay static merchant details updated!");
    }
  };

  const pendingSellers = users.filter((u) => u.role === "seller" && !u.isApprovedSeller);
  const registeredSellers = users.filter((u) => u.role === "seller" && u.isApprovedSeller);
  const standardBuyers = users.filter((u) => u.role === "user");

  // Filter GPay orders waiting for admin screenshot validation
  const pendingPaymentsOrders = orders.filter((o) => o.paymentMethod === "GPayQR" && !o.paymentVerified);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-zinc-150/70 dark:border-zinc-800">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            {t("adminPanel")} Dashboard
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Superuser agricultural control panel & payments desk
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border">
          <button
            onClick={() => setAdminTab("analytics")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === "analytics" ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm" : "text-zinc-500"
            }`}
          >
            📊 Analytics
          </button>
          
          <button
            onClick={() => setAdminTab("verifications")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
              adminTab === "verifications" ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm" : "text-zinc-500"
            }`}
          >
            💳 QR Receipts
            {pendingPaymentsOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold w-4 h-4 text-[9px] rounded-full flex items-center justify-center">
                {pendingPaymentsOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab("sellers")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all relative cursor-pointer ${
              adminTab === "sellers" ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm" : "text-zinc-500"
            }`}
          >
            🚜 Sellers
            {pendingSellers.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-500 text-zinc-950 font-bold w-4 h-4 text-[9px] rounded-full flex items-center justify-center">
                {pendingSellers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setAdminTab("users")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === "users" ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm" : "text-zinc-500"
            }`}
          >
            👥 Buyers
          </button>

          <button
            onClick={() => setAdminTab("produce")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === "produce" ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm" : "text-zinc-500"
            }`}
          >
            🌾 Produce Catalog
          </button>

          <button
            onClick={() => setAdminTab("config")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === "config" ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm" : "text-zinc-500"
            }`}
          >
            ⚙️ Config
          </button>

          <button
            onClick={() => setAdminTab("database")}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              adminTab === "database" ? "bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-400 shadow-sm" : "text-zinc-500"
            }`}
          >
            🗄️ Database
          </button>
        </div>
      </div>

      {/* TABS SWITCH LAYOUT */}
      {adminTab === "analytics" && (
        <div className="space-y-10">
          
          {/* Metrics grid row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 rounded-2xl p-5 space-y-2">
              <span className="text-zinc-300 font-bold text-[10px] uppercase tracking-wider block">Gross Sales</span>
              <div className="flex items-center gap-1">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">₹{analytics.metrics.totalRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 rounded-2xl p-5 space-y-2">
              <span className="text-zinc-300 font-bold text-[10px] uppercase tracking-wider block">{t("commissionMetric")}</span>
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <DollarSign className="w-5 h-5" />
                <span className="text-2xl font-black">₹{analytics.metrics.totalCommission.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 rounded-2xl p-5 space-y-2">
              <span className="text-zinc-300 font-bold text-[10px] uppercase tracking-wider block">Buyers</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{analytics.metrics.usersCount}</span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 rounded-2xl p-5 space-y-2">
              <span className="text-zinc-300 font-bold text-[10px] uppercase tracking-wider block">Live Sellers</span>
              <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{analytics.metrics.sellersCount}</span>
            </div>

          </div>

          {/* HIGH-FIDELITY CUSTOM SVG SALES CHART */}
          <section className="bg-white dark:bg-zinc-900 border border-zinc-150/70 p-6 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <BarChart className="w-5 h-5 text-emerald-600" />
              {t("dailySalesReport")}
            </h3>

            {analytics.dailySalesReport.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-xs">No sales registered yet to plot graphs.</div>
            ) : (
              <div className="space-y-4">
                
                {/* Visual Chart rendering using Premium SVG columns */}
                <div className="relative h-64 border-b border-l border-zinc-200 dark:border-zinc-800 pb-2 pl-2">
                  
                  {/* Dynamic SVG Drawing */}
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    
                    {analytics.dailySalesReport.map((stat: any, idx: number) => {
                      const len = analytics.dailySalesReport.length;
                      const colWidth = 100 / len;
                      const xPercent = (idx * colWidth) + (colWidth / 2);

                      // Normalize pricing scale
                      const maxPrice = Math.max(...analytics.dailySalesReport.map((s: any) => s.revenue), 1000);
                      const barHeightPercent = (stat.revenue / maxPrice) * 100;
                      
                      return (
                        <g key={idx} className="group">
                          {/* Main Volume Bar */}
                          <rect
                            x={`${idx * colWidth}%`}
                            y={`${100 - barHeightPercent}%`}
                            width={`${colWidth - 4}%`}
                            height={`${barHeightPercent}%`}
                            fill="url(#greenGrad)"
                            rx={4}
                            className="transition-all hover:opacity-85 cursor-pointer"
                          />

                          {/* Hover Value Labels */}
                          <text
                            x={`${xPercent}%`}
                            y={`${100 - barHeightPercent - 8}%`}
                            textAnchor="middle"
                            fill="#10b981"
                            fontSize="9"
                            fontWeight="bold"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ₹{stat.revenue}
                          </text>

                          {/* Axis Subtitle label date */}
                          <text
                            x={`${xPercent}%`}
                            y="110%"
                            textAnchor="middle"
                            fill="#8c8c8c"
                            fontSize="8"
                          >
                            {stat.date.substring(5)}
                          </text>
                        </g>
                      );
                    })}

                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                    </defs>
                  </svg>

                </div>

                <p className="text-[10px] text-zinc-400 text-center font-bold pt-4">
                  X-Axis: Month-Date • Y-Axis: Harvest subtotal volume (INR)
                </p>

              </div>
            )}
          </section>

          {/* Table displaying numeric daily sale metrics */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 overflow-hidden">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-3">Payout Summary logs</h4>
            <div className="overflow-x-auto text-xs sm:text-sm">
              <table className="w-full text-left font-medium">
                <thead>
                  <tr className="border-b text-zinc-400 text-xs font-bold">
                    <th className="py-2.5 px-3">Transaction Date</th>
                    <th className="py-2.5 px-3">Orders count</th>
                    <th className="py-2.5 px-3 text-right">Total Revenue Volume</th>
                    <th className="py-2.5 px-3 text-right">Market Commission (2%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-semibold">
                  {analytics.dailySalesReport.map((stat: any, idx: number) => (
                    <tr key={idx} className="hover:bg-zinc-50/50">
                      <td className="py-2.5 px-3 font-mono">{stat.date}</td>
                      <td className="py-2.5 px-3 text-zinc-600">{stat.ordersCount} purchase(s)</td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 dark:text-emerald-400 font-bold">₹{stat.revenue}</td>
                      <td className="py-2.5 px-3 text-right text-lime-650 font-black">₹{stat.commission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {adminTab === "verifications" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Grid className="w-5 h-5 text-emerald-600" />
            UPI QR Screenshot Verifications Center
          </h3>

          {pendingPaymentsOrders.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 font-medium text-sm">
              ✅ All Google Pay transactions are verified completely.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingPaymentsOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-5 border border-zinc-150 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <strong className="text-zinc-900 dark:text-zinc-100 text-sm font-bold block">Order Ref #{order.id}</strong>
                        <span className="text-[10px] text-zinc-400 block">{order.createdAt.substring(0, 10)}</span>
                      </div>
                      <span className="bg-red-100 text-red-850 text-[10px] font-black px-2.2 py-0.5 rounded-full uppercase">
                        Awaiting Verify
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-zinc-500">Buyer name: <strong>{order.buyerName}</strong></p>
                      <p className="text-zinc-500">Contact: {order.buyerPhone}</p>
                      <p className="text-zinc-500">GPay Transaction UPI Ref: <strong className="text-emerald-700 dark:text-emerald-400">{order.paymentId}</strong></p>
                    </div>

                    {/* Displays base64 snapshot provided by user */}
                    {order.paymentScreenshot && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-zinc-400 font-bold block">Uploaded Screenshot Reference:</span>
                        <div className="relative h-44 rounded-lg overflow-hidden border">
                          <img src={order.paymentScreenshot} alt="Payment Receipt" className="w-full h-full object-contain" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => onVerifyPayment(order.id, true, order.paymentId)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Confirm Receipt
                    </button>
                    <button
                      onClick={() => onVerifyPayment(order.id, false)}
                      className="p-2.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {adminTab === "sellers" && (
        <div className="space-y-8">
          
          {/* Pending cert registrations */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider-flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              {t("pendingSellers")} ({pendingSellers.length})
            </h3>

            {pendingSellers.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-xs">All pending farmer approvals are cleared.</div>
            ) : (
              <div className="divide-y">
                {pendingSellers.map((seller) => (
                  <div key={seller.id} className="py-4 flex flex-col md:flex-row gap-5 items-center justify-between">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <img src={seller.profilePhotoUrl} alt={seller.fullName} className="w-12 h-12 rounded-full object-cover border" />
                      <div>
                        <strong className="text-zinc-90 w-full text-zinc-900 dark:text-zinc-100 block">{seller.fullName}</strong>
                        <span className="text-[11px] text-zinc-500">Contact: {seller.phoneNumber} • Dist: {seller.district}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-11 items-center w-full md:w-auto justify-end">
                      
                      {/* Aadhaar info */}
                      <div className="text-left md:text-right text-xs">
                        <p className="text-zinc-400 font-bold">Aadhaar: <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold ml-1">{seller.aadhaarNumber}</span></p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onApproveSeller(seller.id, true)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-sm cursor-pointer"
                        >
                          Approve Certification
                        </button>
                        <button
                          onClick={() => onApproveSeller(seller.id, false)}
                          className="border px-4 py-2 rounded-xl text-xs text-red-500 font-bold hover:bg-red-50 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* approved registered sellers */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 space-y-4 overflow-hidden animate-fade-in">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-widest">{t("registeredSellers")}</h3>
            
            {registeredSellers.length === 0 ? (
              <div className="text-center py-6 text-zinc-400 text-xs">No certified farmers recorded yet.</div>
            ) : (
              <div className="overflow-x-auto text-xs sm:text-sm">
                <table className="w-full text-left font-medium">
                  <thead>
                    <tr className="border-b text-zinc-400 text-xs font-bold">
                      <th className="py-2.5 px-3">Farmer Name</th>
                      <th className="py-2.5 px-3">Store Location</th>
                      <th className="py-2.5 px-3">Phone Line</th>
                      <th className="py-2.5 px-3">Aadhaar Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-semibold">
                    {registeredSellers.map((farmer) => (
                      <tr key={farmer.id} className="hover:bg-zinc-50/50">
                        <td className="py-3 px-3 flex items-center gap-2.5">
                          <img src={farmer.profilePhotoUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-zinc-900 dark:text-zinc-100">{farmer.fullName}</span>
                        </td>
                        <td className="py-3 px-3 text-zinc-500">{farmer.district}</td>
                        <td className="py-3 px-3 font-mono text-zinc-500">{farmer.phoneNumber}</td>
                        <td className="py-3 px-3 font-mono text-zinc-400">XXXX-XXXX-{farmer.aadhaarNumber.substring(8)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {adminTab === "users" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 rounded-2xl p-5 space-y-4 overflow-hidden">
          <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            Buyer Database and Defrauded Locks
          </h3>

          {standardBuyers.length === 0 ? (
            <div className="text-center py-10 text-zinc-450 text-sm">No regular buyer profiles found.</div>
          ) : (
            <div className="overflow-x-auto text-xs sm:text-sm">
              <table className="w-full text-left font-medium">
                <thead>
                  <tr className="border-b text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Protection action</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-semibold">
                  {standardBuyers.map((buyer) => (
                    <tr key={buyer.id} className="hover:bg-zinc-50/50">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <img src={buyer.profilePhotoUrl} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                        <span className="font-bold text-zinc-900 dark:text-zinc-105">{buyer.fullName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-501">{buyer.email}</td>
                      <td className="py-3.5 px-4 text-zinc-500">{buyer.district}</td>
                      <td className="py-3.5 px-4 text-xs">
                        {buyer.isBlocked ? (
                          <span className="bg-red-150 text-red-700 px-2.2 py-0.5 rounded-full font-black uppercase text-[9px]">Suspended</span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 px-2.2 py-0.5 rounded-full font-black uppercase text-[9px]">Active</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onToggleBlockUser(buyer.id)}
                          className={`text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer ${
                            buyer.isBlocked 
                              ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                              : "bg-red-50 hover:bg-red-100 text-red-600"
                          }`}
                        >
                          {buyer.isBlocked ? t("unblockUser") : t("blockUser")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {adminTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          
          {/* 1. Global UPI code config */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
              <Settings className="w-4.5 h-4.5 text-emerald-600" />
              {t("gpayQRConfig")}
            </h3>

            <form onSubmit={handleSaveGPay} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Merchant UPI Address (UPI ID)</label>
                <input
                  type="text"
                  required
                  value={gpayId}
                  onChange={(e) => {
                    setGpayId(e.target.value.trim());
                    // Auto recalculate standard QR Code encoding!
                    setQrImageUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(e.target.value.trim())}&pn=Tamil%2520Agro%2520Mart&am=1.00&cu=INR`);
                  }}
                  placeholder="e.g. merchant@okhdfcbank"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border p-3 rounded-xl text-xs font-mono font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-400 font-bold block">Dynamic QR Code Generation (Auto-built)</label>
                <div className="bg-zinc-50 border p-2 rounded-xl inline-block">
                  <img src={qrImageUrl} alt="Merchant QR code visual preview" className="w-32 h-32 object-contain" />
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl block cursor-pointer text-xs"
              >
                Save UPI Configuration
              </button>
            </form>
          </div>

          {/* 2. Flat rate selector config */}
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-widest">
              💼 Configure Shipping Charges scale
            </h3>

            <form onSubmit={handleUpdateShipping} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">District Name EN</label>
                  <input
                    type="text"
                    required
                    value={shippingDistrict}
                    onChange={(e) => setShippingDistrict(e.target.value)}
                    placeholder="e.g. Coimbatore"
                    className="w-full bg-zinc-50 dark:bg-zinc-955 border p-3 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">District Name TA</label>
                  <input
                    type="text"
                    required
                    value={shippingDistrictTA}
                    onChange={(e) => setShippingDistrictTA(e.target.value)}
                    placeholder="எ.கா. கோயம்புத்தூர்"
                    className="w-full bg-zinc-50 dark:bg-zinc-955 border p-3 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">Flat Charge (₹)</label>
                  <input
                    type="number"
                    required
                    value={shippingCharge}
                    onChange={(e) => setShippingCharge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full bg-zinc-50 dark:bg-zinc-955 border p-3 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-zinc-400 block font-bold">Transit Days</label>
                  <input
                    type="number"
                    required
                    value={shippingDays}
                    onChange={(e) => setShippingDays(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full bg-zinc-50 dark:bg-zinc-955 border p-3 rounded-xl text-zinc-900 dark:text-zinc-100 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer text-xs"
              >
                Configure Delivery Scale
              </button>
            </form>

            <div className="pt-2 border-t border-zinc-100 max-h-48 overflow-y-auto space-y-2">
              <span className="text-[10px] uppercase font-black text-zinc-400 block">Configured District flat costs:</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {deliveryCharges.slice(0, 12).map((charge) => (
                  <div key={charge.id} className="p-2 border rounded bg-zinc-50 font-mono text-[10px] text-zinc-500">
                    <span className="font-bold block text-zinc-800">{charge.districtEN}</span>
                    ₹{charge.charge} • {charge.estimatedDays} day(s)
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {adminTab === "produce" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white dark:bg-zinc-900 border border-zinc-150/70 p-5 rounded-2xl gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                🌾 Direct Marketplace Produce Catalog
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                View, modify prices, or list new high-quality agricultural products on behalf of the cooperative.
              </p>
            </div>
            
            {!prodFormOpen && (
              <button
                onClick={() => {
                  resetProduceFormFields();
                  setProdFormOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Add New Product / Add Coconut Oil
              </button>
            )}
          </div>

          {/* Form View / Table List View switch */}
          {prodFormOpen ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 rounded-2xl p-6 sm:p-8 space-y-6">
              
              <div className="flex items-center justify-between border-b pb-3.5 border-zinc-100 dark:border-zinc-800">
                <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                  🌿 {editingProduceId ? "Modify Produce Specifications" : "Cultivate New Product Listing"}
                </h3>
                <button
                  onClick={() => resetProduceFormFields()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-emerald-700 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Cancel & Go Back
                </button>
              </div>

              <form onSubmit={handleAdminCreateProduce} className="space-y-6 max-w-4xl text-xs font-sans">
                
                {/* Names row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Product Title (English) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={nameEN}
                      onChange={(e) => setNameEN(e.target.value)}
                      placeholder="e.g. Pure Cold Pressed Coconut Oil"
                      className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Product Title (தமிழ் - Tamil) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={nameTA}
                      onChange={(e) => setNameTA(e.target.value)}
                      placeholder="எ.கா. தூய செக்கு தேங்காய் எண்ணெய்"
                      className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Descriptions row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Description (English) <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={3}
                      value={descriptionEN}
                      onChange={(e) => setDescriptionEN(e.target.value)}
                      placeholder="Describe extraction method, sourcing and quality benefits"
                      className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border rounded-xl p-3 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Description (தமிழ் - Tamil) <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={3}
                      value={descriptionTA}
                      onChange={(e) => setDescriptionTA(e.target.value)}
                      placeholder="தயாரிப்பு முறை, தரம் மற்றும் சுவை பற்றி சுருக்கமாக எழுதவும்"
                      className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border rounded-xl p-3 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Price stock and Category splits */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Market Category <span className="text-red-500">*</span></label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-800 dark:text-zinc-250 border p-3 rounded-xl text-xs font-semibold outline-none"
                    >
                      <option value="banana">Banana Varieties 🍌</option>
                      <option value="cashew">Cashew Nuts 🥜</option>
                      <option value="jackfruit">Jackfruit 🍈</option>
                      <option value="groundnuts">Groundnuts 🌰</option>
                      <option value="vegetables">Fresh Vegetables 🥬</option>
                      <option value="local_products">Local value-added / Oils / Traditional 🏺</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Cost per Unit (₹ INR) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 240"
                      className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Available stock quantity <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      required
                      value={availableStock}
                      onChange={(e) => setAvailableStock(e.target.value)}
                      placeholder="e.g. 350"
                      className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Stock units rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Stock Unit (English) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={availableStockUnitEN}
                      onChange={(e) => setAvailableStockUnitEN(e.target.value)}
                      placeholder="e.g. Litre(s) or kg(s) or bottle(s)"
                      className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Stock Unit (தமிழ்) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={availableStockUnitTA}
                      onChange={(e) => setAvailableStockUnitTA(e.target.value)}
                      placeholder="எ.கா. லிட்டர் அல்லது கிலோ அல்லது பாட்டில்"
                      className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Benefits specs rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Health Benefits (English)</label>
                    <input
                      type="text"
                      value={healthBenefitsEN}
                      onChange={(e) => setHealthBenefitsEN(e.target.value)}
                      placeholder="e.g. Excellent for cooking and natural skin care."
                      className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border p-3 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Health Benefits (தமிழ்)</label>
                    <input
                      type="text"
                      value={healthBenefitsTA}
                      onChange={(e) => setHealthBenefitsTA(e.target.value)}
                      placeholder="எ.கா. சமையல் மற்றும் கூந்தல் ஆரோக்கியத்திற்கு மிகவும் சிறந்தது."
                      className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-100 border p-3 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Additional parameters (Image, Delivery Availability) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 block">Product Cover Image URL (Or keep Unsplash placeholder)</label>
                    <input
                      type="text"
                      value={images[0]}
                      onChange={(e) => setImages([e.target.value])}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-100 border p-3 rounded-xl text-[10px] font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      id="checkbox-adm-delivery"
                      type="checkbox"
                      checked={deliveryAvailability}
                      onChange={(e) => setDeliveryAvailability(e.target.checked)}
                      className="w-5 h-5 rounded border bg-zinc-50 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="checkbox-adm-delivery" className="text-xs font-bold text-zinc-650 dark:text-zinc-350 select-none">
                      Enable Direct cooperative district-wide logistics delivery
                    </label>
                  </div>
                </div>

                {/* Submission bar */}
                <div className="pt-4 border-t flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => resetProduceFormFields()}
                    className="px-5 py-2.5 bg-zinc-100 border hover:bg-zinc-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm transition cursor-pointer active:scale-95"
                  >
                    {editingProduceId ? "Save Modifications" : "List Crop in Catalog 🌾"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Table cargo view */
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150/70 rounded-2xl p-5 space-y-4 overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Direct Marketplace Inventories ({products.length} live products)
                </h3>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-16 text-zinc-400 text-sm font-semibold">
                  🌾 Catalog is completely blank. Click "Add New Product" to populate items!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider font-sans">
                        <th className="py-3 px-4">Produce Details</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Cost (₹)</th>
                        <th className="py-3 px-4">Stock Avail.</th>
                        <th className="py-3 px-4">Seller Account</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-850 font-sans font-medium text-xs">
                      {products.map((p) => {
                        const titleName = language === "en" ? p.nameEN : p.nameTA;
                        const stockUnit = language === "en" ? p.availableStockUnitEN : p.availableStockUnitTA;

                        return (
                          <tr key={p.id} className="hover:bg-zinc-55/40 dark:hover:bg-zinc-850/20 transition-colors">
                            <td className="py-4 px-4 flex items-center gap-3">
                              <img src={p.images[0]} alt={p.nameEN} className="w-10 h-10 rounded-lg object-cover" />
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{titleName}</span>
                                <span className="text-[10px] text-zinc-400 block font-mono">ID: {p.id}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs font-semibold capitalize text-zinc-650 dark:text-zinc-300">
                                {p.category.replace("_", " ")}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-black text-emerald-800 dark:text-emerald-400 text-sm">₹{p.price}</td>
                            <td className="py-4 px-4 text-zinc-650 dark:text-zinc-350">
                              {p.availableStock} <span className="text-zinc-400 text-xs">{stockUnit}</span>
                            </td>
                            <td className="py-4 px-4 text-zinc-500 text-xs">
                              <div className="font-semibold text-zinc-750 dark:text-zinc-200">{p.sellerName || "Cooperative Seller"}</div>
                              <div className="text-[10px] text-zinc-400">District: {p.district}</div>
                            </td>
                            <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => startAdminEditProduce(p)}
                                className="p-2 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-805 rounded-lg transition-colors cursor-pointer inline-block"
                                title="Edit details & price"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Remove "${p.nameEN}" permanently from database?`)) {
                                    if (onDeleteProduct) onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-zinc-805 rounded-lg transition-colors cursor-pointer inline-block"
                                title="Delete product listing"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {adminTab === "database" && (
        <div className="space-y-6 animate-fade-in bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                🗄️ Backend JSON Database Inspector
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                View live data stored flat-file in the server's <code className="bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded font-mono text-[10px]">.data/</code> structure.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchDbRaw}
                disabled={dbLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl transition cursor-pointer border border-[#D1E2C4]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dbLoading ? 'animate-spin' : ''}`} />
                Reload File Storage
              </button>
            </div>
          </div>

          {/* Database File Tab selection bar */}
          <div className="flex border-b border-zinc-100 dark:border-zinc-850 gap-1 pb-1">
            {[
              { key: "users", label: "👤 users.json", count: dbData.users?.length || 0 },
              { key: "products", label: "🍌 products.json", count: dbData.products?.length || 0 },
              { key: "orders", label: "📦 orders.json", count: dbData.orders?.length || 0 },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setDbFileTab(tab.key as any);
                  setCopied(false);
                }}
                className={`px-4 py-2 border-b-2 text-xs font-bold transition-all cursor-pointer ${
                  dbFileTab === tab.key
                    ? "border-emerald-600 text-emerald-800 dark:text-emerald-400"
                    : "border-transparent text-zinc-400 hover:text-zinc-650"
                }`}
              >
                {tab.label} <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-normal text-zinc-500">{tab.count} entries</span>
              </button>
            ))}
          </div>

          {/* Controls header */}
          <div className="flex flex-col md:flex-row items-center gap-4 justify-between bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border">
            {/* Search filter input */}
            <div className="relative w-full md:max-w-md">
              <input
                type="text"
                placeholder={`Search inside ${dbFileTab}.json (e.g., specific ID, phone, name)...`}
                value={dbSearch}
                onChange={(e) => setDbSearch(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border text-zinc-800 dark:text-zinc-200 py-1.5 px-3 rounded-lg text-xs"
              />
              {dbSearch && (
                <button
                  onClick={() => setDbSearch("")}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-650 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[10px] text-zinc-500 font-medium">
                {dbSearch 
                  ? `Showing filtered subset` 
                  : `Showing all ${dbData[dbFileTab]?.length || 0} structures`}
              </span>

              <button
                onClick={() => {
                  const filtered = dbSearch
                    ? (dbData[dbFileTab] || []).filter((item: any) =>
                        JSON.stringify(item).toLowerCase().includes(dbSearch.toLowerCase())
                      )
                    : dbData[dbFileTab];
                  navigator.clipboard.writeText(JSON.stringify(filtered, null, 2));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition cursor-pointer flex items-center gap-1.5"
              >
                {copied ? "✓ Copied!" : "📋 Copy Raw JSON"}
              </button>
            </div>
          </div>

          {/* Error fallback */}
          {dbError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs font-bold border border-red-100">
              ⚠️ Database Error: {dbError}
            </div>
          )}

          {/* Main Pre Raw Display */}
          <div className="border rounded-2xl overflow-hidden bg-zinc-950 text-zinc-200">
            {dbLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                <span className="text-xs text-zinc-400 font-mono">Reading raw disk JSON stream...</span>
              </div>
            ) : (
              <div className="relative">
                <pre className="font-mono text-[11px] p-6 overflow-auto max-h-[500px] leading-relaxed select-text select-all whitespace-pre-wrap word-break-all text-emerald-300">
                  {(() => {
                    const collection = dbData[dbFileTab] || [];
                    const filtered = dbSearch
                      ? collection.filter((item: any) =>
                          JSON.stringify(item).toLowerCase().includes(dbSearch.toLowerCase())
                        )
                      : collection;
                    return JSON.stringify(filtered, null, 2);
                  })()}
                </pre>
              </div>
            )}
          </div>

          {/* Instructions note */}
          <div className="text-[11px] text-zinc-400 leading-relaxed bg-[#F0F7EA] dark:bg-emerald-950/20 p-4 rounded-xl border border-[#D1E2C4]">
            ℹ️ <strong className="text-[#2D5A27] dark:text-emerald-400">Disk Location Note:</strong> This content is mapped physical state saved in <code className="font-mono bg-white dark:bg-zinc-800 p-0.5 rounded text-[10px]">.data/{dbFileTab}.json</code> in Node's Sandboxed container root directory. Live modifications (saving reviews, completing payments) immediately rewrite these JSON files sequentially!
          </div>

        </div>
      )}

    </div>
  );
};
