import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { User, Layers, ShoppingBag, Plus, Trash2, Edit, Save, ArrowLeft, Truck, HelpCircle } from "lucide-react";

const CATEGORY_IMAGES: Record<string, string> = {
  banana: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600",
  cashew: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=600",
  jackfruit: "https://images.unsplash.com/photo-1590004953392-5aba2e72269a?q=80&w=600",
  groundnuts: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=600",
  vegetables: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600",
  local_products: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600",
};

interface SellerDashboardViewProps {
  products: any[];
  orders: any[];
  onAddProduct: (formData: any) => Promise<boolean>;
  onEditProduct: (id: string, formData: any) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
  onUpdateOrderStatus: (id: string, nextStatus: string) => void;
  deliveryDistricts: any[];
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  deliveryDistricts
}) => {
  const { t, language, user } = useApp();

  // Mode state controls
  const [activeTab, setActiveTab] = useState<"listings" | "sales" | "add-produce">("listings");
  const [editingProduceId, setEditingProduceId] = useState<string | null>(null);

  // Add Product Form status
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

  if (!user) return <div className="text-center py-20">Please login to view dashboard.</div>;

  // Filter listings and orders belonging to this seller
  const myProduce = products.filter((p) => p.sellerId === user.id);
  const mySalesOrders = orders.filter((o) => o.items.some((item: any) => item.sellerId === user.id));

  // Compute earnings dynamically based on 98% split (2% admin commission deducted)
  let grossSales = 0;
  let sellerPayout = 0;

  mySalesOrders.forEach((o) => {
    if (o.status !== "Cancelled" && o.paymentVerified) {
      o.items.forEach((item: any) => {
        if (item.sellerId === user.id) {
          const itemTotal = item.price * item.quantity;
          grossSales += itemTotal;
          sellerPayout += itemTotal * 0.98;
        }
      });
    }
  });

  const resetFormFields = () => {
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
  };

  const handleCreateProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEN || !nameTA || !price || !availableStock) {
      alert("Required metadata missing.");
      return;
    }

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
      resetFormFields();
      setActiveTab("listings");
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages([reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditProduce = (prod: any) => {
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
    setActiveTab("add-produce");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Seller Header portal banner */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-6 justify-between border border-emerald-900 shadow-xl">
        <div className="flex items-center gap-5">
          <img
            src={user.profilePhotoUrl}
            alt={user.fullName}
            className="w-18 h-18 rounded-full border-2 border-lime-400 object-cover"
          />
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 leading-none">
              🚜 {user.fullName} ({language === "en" ? "Farmer Store" : "விவசாய கூட்டுறவு"})
            </h2>
            <p className="text-xs text-emerald-200 mt-1">
              Store District: <span className="font-bold underline">{user.district}</span> • Approved Vendor status:{" "}
              {user.isApprovedSeller ? (
                <span className="text-lime-400 font-extrabold uppercase">✅ Certified Live</span>
              ) : (
                <span className="text-amber-400 font-extrabold uppercase animate-pulse">⏳ Awaiting Certificate Verification</span>
              )}
            </p>
          </div>
        </div>

        {/* Quick accounting indicators */}
        <div className="flex gap-4 p-4 border border-white/5 bg-white/5 rounded-2xl">
          <div className="text-center px-4">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Gross Produce Volume</span>
            <span className="text-lg font-black text-lime-400 block">₹{grossSales.toFixed(2)}</span>
          </div>
          <div className="border-l border-white/15 h-8 my-auto" />
          <div className="text-center px-4">
            <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Direct Direct Payout (98%)</span>
            <span className="text-lg font-black text-lime-400 block">₹{sellerPayout.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Conditional Warning notice if unverified */}
      {!user.isApprovedSeller && (
        <div className="bg-yellow-50/60 dark:bg-yellow-950/10 border-2 border-dashed border-yellow-500/30 p-5 rounded-2xl flex items-start gap-3.5">
          <span className="text-2xl">🚨</span>
          <div className="text-xs sm:text-sm font-sans font-medium text-yellow-905 dark:text-yellow-100 leading-relaxed">
            Vanakkam! Your credentials (Aadhaar Ref: XXXX-{user.aadhaarNumber.substring(8)}) have been submitted successfully. Our central team is validating certificates. Product creation forms will unlock automatically on approval completion. Feel free to contact admin helpdesk!
          </div>
        </div>
      )}

      {/* Tabs navigation panels */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-150/80 dark:border-zinc-800 pb-3 gap-4">
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("listings")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "listings"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-650"
            }`}
          >
            📋 My Produced Cargo ({myProduce.length})
          </button>
          
          <button
            onClick={() => setActiveTab("sales")}
            className={`px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "sales"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-650"
            }`}
          >
            📦 Incoming Market Demands ({mySalesOrders.length})
          </button>
        </div>

        {/* Add Product Button */}
        {user.isApprovedSeller && (
          <button
            onClick={() => {
              resetFormFields();
              setActiveTab("add-produce");
            }}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t("addNewProd")}
          </button>
        )}
      </div>

      {/* MAIN SWITCHER TAB LAYOUTS */}
      {activeTab === "listings" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-805/85 rounded-2xl p-5 space-y-4 overflow-hidden">
          <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Live Store Inventories
          </h3>

          {myProduce.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-sm font-semibold">
              🌾 Your barn is empty. Click "Add Harvest Product" to list your fruits and grains for sale!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-805/80 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Produce details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Unit Cost</th>
                    <th className="py-3 px-4">Available stock</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-805/80 font-medium">
                  {myProduce.map((p) => {
                    const titleName = language === "en" ? p.nameEN : p.nameTA;
                    const stockUnit = language === "en" ? p.availableStockUnitEN : p.availableStockUnitTA;

                    return (
                      <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition-colors">
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img src={p.images[0]} alt={p.nameEN} className="w-11 h-11 rounded-lg object-cover" />
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{titleName}</span>
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-550 capitalize">{p.category.replace("_", " ")}</td>
                        <td className="py-4 px-4 font-black text-emerald-800 dark:text-emerald-400">₹{p.price}</td>
                        <td className="py-4 px-4 text-zinc-600 dark:text-zinc-300">
                          {p.availableStock} {stockUnit}
                        </td>
                        <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => startEditProduce(p)}
                            className="p-1.5 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            title="Edit details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Are you sure? This delete is irreversible.")) {
                                onDeleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            title="Remove produce"
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

      {activeTab === "sales" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-805/85 rounded-2xl p-5 space-y-4">
          <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            Demand Payout Orders ({mySalesOrders.length})
          </h3>

          {mySalesOrders.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 text-sm font-semibold">
              📦 No customer demands logged yet. Incoming purchases will broadcast here instantly.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-805/80">
              {mySalesOrders.map((order) => {
                // filter order.items that belong to this seller
                const sellerProducts = order.items.filter((i: any) => i.sellerId === user.id);
                // compute sum for this seller
                const sellerTotal = sellerProducts.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
                const sellerFinalPayout = sellerTotal * 0.98;

                return (
                  <div key={order.id} className="py-5 space-y-4">
                    
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100">Order Ref #{order.id}</strong>
                          <span className="text-[10px] text-zinc-400">{order.createdAt.substring(0, 10)}</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Buyer name: <strong>{order.buyerName}</strong> • Phone: {order.buyerPhone} • Ship to: {order.district}
                        </p>
                      </div>

                      {/* Earnings display */}
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-zinc-400 font-bold uppercase">My Sales Earn (98%):</p>
                        <p className="text-base font-black text-emerald-800 dark:text-emerald-400 leading-tight">
                          ₹{sellerFinalPayout.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Cargo dispatches details list */}
                    <div className="bg-zinc-50 dark:bg-zinc-955 p-3 rounded-xl border border-zinc-150/60 dark:border-zinc-850 flex flex-wrap gap-2 text-xs">
                      {sellerProducts.map((p: any, idx: number) => (
                        <div key={idx} className="bg-white dark:bg-zinc-900 px-3 py-1.5 border dark:border-zinc-800 font-semibold rounded text-zinc-800 dark:text-zinc-200">
                          {language === "en" ? p.productNameEN : p.productNameTA} x {p.quantity} (₹{p.price})
                        </div>
                      ))}
                    </div>

                    {/* Status updater for Farmer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-400 font-bold uppercase">Dispatch Progress:</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[9px] ${
                          order.status === "Delivered" ? "bg-emerald-100 text-emerald-800" :
                          order.status === "Cancelled" ? "bg-red-50 text-red-800" :
                          "bg-yellow-105/90 text-yellow-800 bg-yellow-50"
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* dropdown to update status */}
                      <div className="flex gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-1.5 border dark:border-zinc-800 text-xs font-bold rounded-lg outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "add-produce" && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-805/85 rounded-2xl p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center justify-between border-b pb-3.5 border-zinc-150">
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
              🌾 {editingProduceId ? "Modify Harvest Record" : "Cultivate New Crop Listing"}
            </h3>
            <button
              onClick={() => {
                resetFormFields();
                setActiveTab("listings");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-emerald-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>

          <form onSubmit={handleCreateProduce} className="space-y-6 max-w-4xl font-sans">
            
            {/* Names row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("productNameEN")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={nameEN}
                  onChange={(e) => setNameEN(e.target.value)}
                  placeholder="e.g. Sevvazhai Red Banana"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("productNameTA")} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={nameTA}
                  onChange={(e) => setNameTA(e.target.value)}
                  placeholder="எ.கா. செவ்வாழை பழம்"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Descriptions row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("descEN")} <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={descriptionEN}
                  onChange={(e) => setDescriptionEN(e.target.value)}
                  placeholder="Describe the sweet harvesting, weights and farm specifics"
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("descTA")} <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={descriptionTA}
                  onChange={(e) => setDescriptionTA(e.target.value)}
                  placeholder="சுவை, தரம் மற்றும் அறுவடை விவரங்களைக் குறிப்பிடவும்"
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Price stock and Category splits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Category <span className="text-red-500">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950/30 text-zinc-800 dark:text-zinc-200 border p-3 rounded-xl text-sm font-semibold outline-none"
                >
                  <option value="banana">Banana Varieties</option>
                  <option value="cashew">Cashew Nuts</option>
                  <option value="jackfruit">Jackfruit</option>
                  <option value="groundnuts">Groundnuts</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="local_products">Local products</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("pricePerUnit")} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border pl-4 pr-4 py-3 rounded-xl text-sm font-semibold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("stockQty")} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  value={availableStock}
                  onChange={(e) => setAvailableStock(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-sm font-semibold outline-none"
                />
              </div>

            </div>

            {/* Units fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("unitEN")}</label>
                <input
                  type="text"
                  value={availableStockUnitEN}
                  onChange={(e) => setAvailableStockUnitEN(e.target.value)}
                  placeholder="e.g. dozen, bunch, kg"
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-sm font-semibold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("unitTA")}</label>
                <input
                  type="text"
                  value={availableStockUnitTA}
                  onChange={(e) => setAvailableStockUnitTA(e.target.value)}
                  placeholder="எ.கா. கிலோ, டஜன், தார்"
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border px-4 py-3 rounded-xl text-sm font-semibold outline-none"
                />
              </div>
            </div>

            {/* Botanical health benefits input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Health benefits (English)</label>
                <textarea
                  rows={2}
                  value={healthBenefitsEN}
                  onChange={(e) => setHealthBenefitsEN(e.target.value)}
                  placeholder="e.g. High fiber content helping dry digestion"
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border rounded-xl p-3 text-sm font-semibold outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Health benefits (Tamil)</label>
                <textarea
                  rows={2}
                  value={healthBenefitsTA}
                  onChange={(e) => setHealthBenefitsTA(e.target.value)}
                  placeholder="எ.கா. செரிமான கோளாறுகளை நீக்கும் நார்ச்சத்து கொண்டது"
                  className="w-full bg-zinc-50 dark:bg-zinc-955 text-zinc-900 dark:text-zinc-200 border rounded-xl p-3 text-sm font-semibold outline-none"
                />
              </div>
            </div>

            {/* Photo upload crop */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-zinc-400 block">Harvest Product Image</span>
              <div className="relative border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-xl p-4 text-center transition-colors bg-zinc-50 dark:bg-zinc-955 max-w-sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="text-xs text-zinc-505 font-semibold space-y-1">
                  <Plus className="w-6 h-6 mx-auto text-zinc-400" />
                  <p>Choose Product Harvest image JPG/PNG...</p>
                </div>
              </div>
              {images.length > 0 && (
                <div className="flex gap-2">
                  <img src={images[0]} alt="Thumbnail" className="w-16 h-16 rounded-xl object-cover border" />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-8 py-3 rounded-xl text-sm shadow-md flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {t("save")}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
