import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Trash2, ShoppingBag, Truck, Calendar, QrCode, CreditCard, UploadCloud, CheckCircle, Smartphone } from "lucide-react";
import { QRScanner } from "./QRScanner.tsx";

interface CartViewProps {
  onNavigate: (view: string, detailsId?: string) => void;
  deliveryDistricts: any[];
  onCheckoutSubmit: (checkoutData: {
    items: any[];
    district: string;
    pincode: string;
    fullAddress: string;
    paymentMethod: "Razorpay" | "GPayQR";
    paymentId?: string;
    paymentScreenshot?: string;
  }) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  onNavigate,
  deliveryDistricts,
  onCheckoutSubmit
}) => {
  const { t, language, cart, updateCartQty, removeFromCart, user, token } = useApp();

  // Address Details
  const [district, setDistrict] = useState(user?.district || "");
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [fullAddress, setFullAddress] = useState(user?.fullAddress || "");

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay" | "GPayQR">("Razorpay");
  const [screenshotUpload, setScreenshotUpload] = useState<string>("");
  const [txnId, setTxnId] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  // Delivery Calculations Cache
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");

  // GPay Details config
  const [gpayConfig, setGpayConfig] = useState({
    gpayId: "tamilagro@okhdfcbank",
    qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=tamilagro@okhdfcbank&pn=Tamil%20Agro%20Mart&am=1.00&cu=INR"
  });

  // Calculate cart subtotal
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Load Shipping cost dynamically on checkout state change
  useEffect(() => {
    if (!district) {
      setShippingCost(0);
      setEstimatedDelivery("");
      return;
    }

    fetch("/api/orders/calculate-delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ district })
    })
      .then((res) => res.json())
      .then((data) => {
        setShippingCost(data.charge);
        setEstimatedDelivery(data.estimatedDeliveryDate);
      })
      .catch((err) => console.error(err));
  }, [district]);

  // Load Global GPay instructions
  useEffect(() => {
    fetch("/api/payments/gpay-qr-details")
      .then((res) => res.json())
      .then((data) => setGpayConfig(data))
      .catch((err) => console.error("Error loading GPay config:", err));
  }, []);

  const handleScreenshotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = () => {
    if (!token) {
      alert(language === "en" ? "Please sign in to place an order." : "ஆர்டர் செய்ய முதலில் உள்நுழையவும்.");
      onNavigate("login");
      return;
    }

    if (cart.length === 0) return;

    if (!fullAddress || !district || !pincode) {
      alert(language === "en" ? "Shipping address fields are required." : "டெலிவரி முகவரி விவரங்களை முழுமையாக நிரப்பவும்.");
      return;
    }

    if (paymentMethod === "GPayQR" && !txnId) {
      alert(language === "en" ? "Kindly enter Google Pay transaction ID to prove payment." : "பணம் செலுத்தியதை உறுதிசெய்ய GPay பரிவர்த்தனை ஐடியை (Txn ID) உள்ளிடவும்.");
      return;
    }

    // Call checkout trigger
    onCheckoutSubmit({
      items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      district,
      pincode,
      fullAddress,
      paymentMethod,
      paymentId: paymentMethod === "GPayQR" ? txnId : undefined,
      paymentScreenshot: paymentMethod === "GPayQR" ? screenshotUpload || "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=200" : undefined
    });
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <span className="text-6xl text-zinc-400">🛒</span>
        <h3 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
          {language === "en" ? "Your Shopping Cart is Empty" : "தங்கள் ஷாப்பிங் கார்ட் காலியாக உள்ளது"}
        </h3>
        <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
          {language === "en" 
            ? "Explore our organic selection of fresh bananas, cashews and local harvests direct from farmers."
            : "விவசாயிகளிடம் இருந்து நேரடியாக அறுவடை செய்யப்பட்ட பொருட்களை வாங்கி ஆதரியுங்கள்!"}
        </p>
        <button
          onClick={() => onNavigate("catalog")}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold tracking-tight shadow-sm transition-all text-sm cursor-pointer"
        >
          {language === "en" ? "Go to Marketplace" : "சந்தைக்குச் செல்லுங்கள்"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight pb-2 border-b border-zinc-150/70 dark:border-zinc-850">
        {language === "en" ? "My Cart Checkout" : "கார்ட் செக்அவுட்"}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SHOPPING BAG ITEMS CONTAINER & SHIPPING ADDRESS */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Cart items */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150/75 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider">
              {language === "en" ? "Harvest Items List" : "பொருட்கள் பட்டியல்"} ({cart.length})
            </h3>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {cart.map((item) => {
                const title = language === "en" ? item.nameEN : item.nameTA;
                const unit = language === "en" ? item.availableStockUnitEN : item.availableStockUnitTA;

                return (
                  <div key={item.productId} className="py-4 flex gap-4 items-center justify-between">
                    <img src={item.image} alt={item.nameEN} className="w-16 h-16 rounded-xl object-cover" />
                    
                    <div className="flex-1 min-w-0">
                      <strong className="text-zinc-905 dark:text-zinc-100 text-sm font-bold block truncate">{title}</strong>
                      <span className="text-xs text-zinc-400">Price: ₹{item.price} / {unit}</span>
                    </div>

                    {/* Numeric Counter Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Price total calculation */}
                    <div className="text-right pl-3.5 min-w-[70px]">
                      <span className="text-sm font-black text-emerald-800 dark:text-emerald-400 block">₹{item.price * item.quantity}</span>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-0.5" /> Remove
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* SHIPPING DESTINATIVE ADDRESS SHEET */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150/75 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              {language === "en" ? "Shipping & Delivery Destination" : "ஷிப்பிங் & விநியோகம் முகவரி"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("selectDistrict")}</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold outline-none"
                >
                  <option value="">-- {language === "en" ? "Choose District" : "மாவட்டத்தைத் தேர்வுசெய்க"} --</option>
                  {deliveryDistricts.map((d: any) => (
                    <option key={d.id} value={d.districtEN}>
                      {language === "en" ? d.districtEN : d.districtTA}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">{t("chkPincode")}</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 600107"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 block">{t("chkAddress")}</label>
              <textarea
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Door No, Street name, Village and landmarks..."
                rows={3}
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-805 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-semibold outline-none focus:border-emerald-500 placeholder-zinc-400"
              />
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PAYMENT METHODS & TOTAL CALCULATOR */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* PAYMENT SYSTEM LAYOUT BAR */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150/75 dark:border-zinc-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              {t("chkPayment")}
            </h3>

            {/* Selector Tabs */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("Razorpay")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === "Razorpay"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-bold"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-655"
                }`}
              >
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Razorpay Gateway</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("GPayQR")}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  paymentMethod === "GPayQR"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-bold"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-655"
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Google Pay QR</span>
              </button>
            </div>

            {/* DYNAMIC DRAW FOR EACH SELECTED METHOD */}
            {paymentMethod === "Razorpay" ? (
              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800 space-y-2">
                <p className="text-xs leading-normal text-zinc-500 font-medium">
                  💳 Generates simulated seamless standard Razorpay checkout flow. Submits instant authorized confirmations without credentials delay!
                </p>
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 border border-zinc-205 dark:border-zinc-800 rounded-xl space-y-4">
                <p className="text-xs text-zinc-505 leading-relaxed font-sans mt-0.5">
                  {t("gpayNotice")}
                </p>

                {/* Display QR dynamically from settings */}
                <div className="flex flex-col items-center justify-center py-2 space-y-3 bg-white rounded-xl border p-3">
                  <img src={gpayConfig.qrImageUrl} alt="UPI QR Code" className="w-40 h-40 object-contain" />
                  <span className="text-xs font-mono font-bold text-gray-800 select-all tracking-tight">
                    UPI ID: {gpayConfig.gpayId}
                  </span>
                </div>

                {/* Transaction input */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-400 block">
                      GPay Transaction ID (UPI Ref No) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowScanner(true)}
                      className="text-[10px] font-black tracking-tight text-emerald-700 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg border border-[#D1E2C4]/40 hover:scale-102 active:scale-95 transition cursor-pointer"
                    >
                      🚀 AI Auto-Scan / Verify
                    </button>
                  </div>
                  <input
                    type="text"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value.trim())}
                    placeholder="e.g. UPI38201840294"
                    className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 p-2.5 rounded-lg border text-xs font-semibold outline-none"
                  />
                </div>

                {/* File Upload screenshot */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-400 block">
                    Upload Payment Screenshot
                  </label>
                  <div className="relative border-2 border-dashed border-zinc-250 dark:border-zinc-700 hover:border-emerald-500 rounded-lg p-3 text-center transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {screenshotUpload ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Screenshot Loaded</span>
                      </div>
                    ) : (
                      <div className="text-xs text-zinc-450 font-semibold space-y-1">
                        <UploadCloud className="w-5 h-5 mx-auto text-zinc-400" />
                        <p>Browse payment screenshot image...</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* TOTAL MATH COSTS BLOCK */}
          <div className="bg-zinc-900 text-white rounded-2xl p-5 space-y-5 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-600/10 via-transparent to-transparent pointer-events-none" />
            
            <h3 className="text-base font-bold uppercase tracking-wider text-lime-400 border-b border-white/10 pb-2.5">
              {t("orderSummary")}
            </h3>

            <div className="space-y-3.5 text-sm font-sans">
              <div className="flex justify-between">
                <span className="text-zinc-300">Produce Subtotal</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-300">{t("shippingFee")}</span>
                <span className="font-bold">
                  {shippingCost > 0 ? `₹${shippingCost}` : "Select District"}
                </span>
              </div>
              
              {/* Dynamic estimated arrival display */}
              {estimatedDelivery && (
                <div className="bg-white/5 border border-white/10 p-3 rounded-lg flex items-center justify-between text-xs text-zinc-300">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-lime-400" />
                    Arrival Date:
                  </span>
                  <span className="font-bold text-lime-400">{estimatedDelivery}</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
                <span className="text-base font-bold text-lime-400">{t("total")}</span>
                <span className="text-2xl font-black text-lime-400">
                  ₹{subtotal + shippingCost}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl text-sm font-bold tracking-tight transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md select-none focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <ShoppingBag className="w-4 h-4" />
              {t("buyNow")}
            </button>
          </div>

        </div>

      </div>

      {showScanner && (
        <QRScanner
          onScanSuccess={(scannedId) => {
            setTxnId(scannedId);
          }}
          onClose={() => setShowScanner(false)}
          targetAmount={subtotal + shippingCost}
        />
      )}

    </div>
  );
};
