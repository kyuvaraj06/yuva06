import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { User, ShoppingBag, MapPin, Phone, Truck, ShieldCheck, Mail, Calendar, Info } from "lucide-react";

interface UserDashboardViewProps {
  orders: any[];
  onNavigate: (view: string, detailsId?: string) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({ orders, onNavigate }) => {
  const { t, language, user } = useApp();
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<any>(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-zinc-500">
        Please log in to view your buyer dashboard.
      </div>
    );
  }

  // Visual status map
  const statusSteps = ["Pending", "Confirmed", "Shipped", "Delivered"];

  const getStepIndex = (status: string) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Dashboard greeting banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-905 text-white rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 shadow-md">
        <img
          src={user.profilePhotoUrl}
          alt={user.fullName}
          className="w-20 h-20 rounded-full object-cover border-4 border-lime-400"
        />
        <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">
            {language === "en" ? `Vanakkam, ${user.fullName}!` : `வணக்கம், ${user.fullName}!`}
          </h2>
          <p className="text-sm text-emerald-100/80 font-medium">
            {language === "en" 
              ? "Welcome to your organic Tamil Agro Mart profile portal" 
              : "உங்களது சுயவிவரப் பக்கத்திற்கு வரவேற்கிறோம்"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Buyer Profile Detail card */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-800 rounded-2xl p-5 space-y-5">
          <h3 className="text-base font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            {language === "en" ? "My Contact Card" : "தொடர்பு விவரங்கள்"}
          </h3>

          <div className="space-y-3.5 text-sm">
            <div className="flex gap-2.5 items-start">
              <Mail className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Email Address</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate block">{user.email}</span>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <Phone className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Phone Connection</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user.phoneNumber}</span>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <MapPin className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Address Dest</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 block text-xs leading-normal">
                  {user.fullAddress}, {user.district} - {user.pincode}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5 items-start">
              <ShieldCheck className="w-4.5 h-4.5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Aadhaar Verified</span>
                <span className="font-mono text-zinc-500 font-bold text-[12px] block mt-0.5">
                  XXXX-XXXX-{user.aadhaarNumber.substring(8)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders log history section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* TRACKING HARVEST DELIVERIES STEPPER SEGMENT */}
          {selectedTrackOrder && (
            <div id="visual-order-tracker-box" className="bg-emerald-50/40 dark:bg-zinc-900 border-2 border-emerald-500/30 rounded-3xl p-6 space-y-6 animate-fade-in relative">
              <button
                onClick={() => setSelectedTrackOrder(null)}
                className="absolute top-4 right-4 text-xs font-bold text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                ✕ Close
              </button>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2">
                <div>
                  <span className="text-[10px] uppercase font-black text-emerald-800 dark:text-emerald-500 tracking-wider">
                    🛰️ Active Live Stepper Track
                  </span>
                  <h4 className="text-xl font-extrabold text-gray-901 dark:text-white">
                    Order Ref #{selectedTrackOrder.id}
                  </h4>
                </div>
                <div className="text-sm font-semibold text-zinc-500">
                  Total Paid: <span className="text-emerald-700 dark:text-emerald-400 font-black">₹{selectedTrackOrder.totalAmount}</span>
                </div>
              </div>

              {/* Status Stepper visualization */}
              {selectedTrackOrder.status === "Cancelled" ? (
                <div className="bg-red-50 text-red-900 dark:bg-red-950/20 dark:text-red-300 p-4 rounded-xl text-center font-bold text-sm">
                  ⚠️ This order has been cancelled.
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Dynamic Indicators */}
                  <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                    {statusSteps.map((step, idx) => {
                      const isActive = getStepIndex(selectedTrackOrder.status) >= idx;
                      return (
                        <span key={step} className={isActive ? "text-emerald-600 dark:text-emerald-400" : ""}>
                          {step}
                        </span>
                      );
                    })}
                  </div>

                  {/* Horizontal progress row */}
                  <div className="relative h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full">
                    <div
                      className="absolute top-0 left-0 h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${(getStepIndex(selectedTrackOrder.status) / (statusSteps.length - 1)) * 100}%`
                      }}
                    />
                    
                    {/* Circle buttons */}
                    <div className="absolute inset-0 flex justify-between items-center -top-1 pointer-events-none">
                      {statusSteps.map((step, idx) => {
                        const isActive = getStepIndex(selectedTrackOrder.status) >= idx;
                        return (
                          <div
                            key={step}
                            className={`w-4 h-4 rounded-full border-2 border-white dark:border-zinc-950 ${
                              isActive ? "bg-emerald-600 dark:bg-emerald-400" : "bg-zinc-300"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* Tracking Details list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans font-medium border-t border-zinc-150/50 pt-4">
                <div className="space-y-2">
                  <p className="text-zinc-500">
                    Estimated Delivery: <strong className="text-zinc-800 dark:text-zinc-200 block mt-0.5">{selectedTrackOrder.estimatedDeliveryDate}</strong>
                  </p>
                  <p className="text-zinc-500">
                    Payment Gateway: <strong className="text-zinc-800 dark:text-zinc-200 block mt-0.5">{selectedTrackOrder.paymentMethod}</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-500">
                    Shipping Address: <strong className="text-zinc-800 dark:text-zinc-200 block mt-0.5">{selectedTrackOrder.fullAddress}, {selectedTrackOrder.pincode}</strong>
                  </p>
                  <p className="text-zinc-500">
                    Payment Status:{" "}
                    {selectedTrackOrder.paymentVerified ? (
                      <strong className="text-emerald-600 dark:text-emerald-400 block mt-0.5">✅ Verified (Confirmed)</strong>
                    ) : (
                      <strong className="text-yellow-600 dark:text-yellow-400 block mt-0.5">⏳ Awaiting Admin Review</strong>
                    )}
                  </p>
                </div>
              </div>

              {/* Items in order list display */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 block">Ordered Items:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedTrackOrder.items.map((it: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-zinc-955 border px-3 py-1.5 rounded-lg text-xs font-semibold">
                      {language === "en" ? it.productNameEN : it.productNameTA} x {it.quantity} (₹{it.price})
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Standard log card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-150/70 dark:border-zinc-805/85 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-zinc-850 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              {t("orderHistory")}
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-zinc-450 text-sm font-semibold">
                🌾 No purchase transactions logged yet. Go back to products to place your first agricultural order!
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-805/80">
                {orders.map((o) => (
                  <div key={o.id} className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-3">
                        <strong className="text-zinc-900 dark:text-zinc-100 text-sm font-bold">Ref #{o.id}</strong>
                        <span className="text-[10px] text-zinc-400">{o.createdAt.substring(0, 10)}</span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">
                        {o.items.length} unique produce item(s) • Ship to: {o.district}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[120px]">
                      <div className="text-left sm:text-right">
                        <span className="text-sm font-black text-emerald-800 dark:text-emerald-400 block">₹{o.totalAmount}</span>
                        
                        <span className={`inline-block text-[10px] font-black px-2.2 py-0.5 rounded-full mt-1 ${
                          o.status === "Delivered" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400" :
                          o.status === "Cancelled" ? "bg-red-50 text-red-700" :
                          "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20"
                        }`}>
                          {o.status}
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedTrackOrder(o)}
                        className="px-3.5 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-755 text-zinc-700 dark:text-zinc-200 rounded-lg cursor-pointer"
                      >
                        Track
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
