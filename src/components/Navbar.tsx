import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { ShoppingCart, User, LogOut, Sun, Moon, Sprout, ShieldAlert, Award } from "lucide-react";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, detailsId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const {
    language,
    setLanguage,
    darkMode,
    setDarkMode,
    user,
    logout,
    cart,
    t
  } = useApp();

  const [showBulkModal, setShowBulkModal] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-emerald-100 dark:border-zinc-800/80 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white p-2.5 rounded-xl shadow-md shadow-emerald-200 dark:shadow-none group-hover:bg-emerald-500 transition-colors">
              <Sprout className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-emerald-800 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                {t("appName")}
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-600/80 dark:text-emerald-500/80 -mt-1 hidden sm:block">
                Tamil Nadu Farmers Direct
              </p>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* View Switchers */}
            <nav className="hidden md:flex items-center gap-1.5 mr-2">
              <button
                onClick={() => onNavigate("home")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === "home" 
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400" 
                    : "text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                {t("home")}
              </button>
              <button
                onClick={() => onNavigate("catalog")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  currentView === "catalog"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                }`}
              >
                {t("products")}
              </button>
            </nav>

            {/* Bulk Order Button */}
            <button
              id="bulk-order-nav-trigger"
              onClick={() => setShowBulkModal(true)}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-xs font-bold bg-amber-50 hover:bg-amber-100/85 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/60 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Bulk Orders / மொத்த கொள்முதல்"
            >
              <span className="text-sm">📦</span>
              <span className="hidden sm:inline">{language === "en" ? "Bulk Order" : "மொத்த ஆர்டர்"}</span>
              <span className="sm:hidden">{language === "en" ? "Bulk" : "மொத்த"}</span>
            </button>

            {/* Language Switch Button */}
            <button
              id="language-dialect-switcher"
              onClick={() => setLanguage(language === "en" ? "ta" : "en")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800 transition-colors uppercase cursor-pointer"
              title="Switch Language / மொழியை மாற்றுக"
            >
              {language === "en" ? "தமிழ்" : "English"}
            </button>

            {/* Dark & Light Toggle */}
            <button
              id="dark-light-theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200/40 dark:border-zinc-800/60 transition-all cursor-pointer"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
            </button>

            {/* User cart indicator */}
            <button
              id="shopping-cart-nav-badge"
              onClick={() => onNavigate("cart")}
              className={`p-2.5 rounded-xl border relative transition-all cursor-pointer ${
                currentView === "cart"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200 dark:shadow-none"
                  : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border-zinc-200/40 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-white dark:border-zinc-950">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Authentication Profiles */}
            {user ? (
              <div className="flex items-center gap-1.5">
                <button
                  id="dashboard-access-trigger"
                  onClick={() => {
                    if (user.role === "admin") onNavigate("admin");
                    else if (user.role === "seller") onNavigate("seller");
                    else onNavigate("dashboard");
                  }}
                  className={`flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
                    ["admin", "seller", "dashboard"].includes(currentView)
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-300 dark:border-emerald-900"
                      : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 border-zinc-250/10 dark:border-zinc-800"
                  }`}
                >
                  <img
                    src={user.profilePhotoUrl}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover border-2 border-emerald-500/50"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="max-w-[80px] truncate leading-tight">{user.fullName}</p>
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider block leading-none">
                      {user.role === "admin" ? t("adminPanel") : user.role === "seller" ? "Seller" : "Buyer"}
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent transition-all cursor-pointer"
                  title={t("logout")}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                id="login-gateway-trigger"
                onClick={() => onNavigate("login")}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-200 dark:shadow-none hover:shadow-lg transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{t("login")}</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Bulk Order contact modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-emerald-100 dark:border-zinc-800 max-w-sm sm:max-w-md w-full p-6 shadow-2xl relative transform transition-all scale-100">
            
            {/* Close button */}
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute right-4.5 top-4.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center font-bold text-sm cursor-pointer hover:rotate-90 transition-all"
            >
              ✕
            </button>

            {/* Title / Icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 p-3 rounded-2xl">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl text-zinc-900 dark:text-white font-bold tracking-tight">
                  {language === "en" ? "Bulk Order Inquiries" : "மொத்த விற்பனை ஆர்டர்"}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  {language === "en" ? "Cooperative Direct Volume Shipments" : "கூட்டுறவு மூலம் நேரடி மொத்த கொள்முதல்"}
                </p>
              </div>
            </div>

            {/* Content Info */}
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed font-semibold">
                {language === "en" 
                  ? "Are you looking to place bulk orders above 50 kg for marriages, commercial outlets, or community events? Get in touch directly with our Administrator for wholesale discount rates and logistic setup."
                  : "திருமணங்கள், வணிக கடைகள், வியாபாரிகள் அல்லது கூட்டு விழாக்கள் போன்றவற்றிற்காக 50 கிலோ கிராமிற்கு மேல் மொத்தமாக கொள்முதல் செய்ய விரும்புகிறீர்களா? சிறப்பு தள்ளுபடி விலைகள் மற்றும் நேரடி போக்குவரத்து வசதிகளைப் பெற எங்களது நிர்வாகியைத் தொடர்பு கொள்ளவும்."
                }
              </p>

              {/* Contact Call details list */}
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-emerald-100/50 dark:border-zinc-850/65 text-center space-y-3 shadow-inner">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black block">
                  {language === "en" ? "ADMIN CONTACT NUMBER" : "நிர்வாக அலைபேசி எண்"}
                </span>
                
                {/* Visual Number Block */}
                <div className="text-2xl font-mono text-emerald-800 dark:text-emerald-400 font-black tracking-tight bg-white dark:bg-zinc-900 py-2 px-4 rounded-xl shadow-sm border border-[#D1E2C4] inline-block">
                  +91 98765 43210
                </div>

                <div className="flex gap-2 justify-center pt-1.5">
                  <a
                    href="tel:+919876543210"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 hover:scale-102 active:scale-95"
                  >
                    📞 {language === "en" ? "Call Now" : "அழைக்க"}
                  </a>
                  <a
                    href="https://wa.me/+919876543210?text=Hello%20Tamil%20Agro%20Mart,%20I%20am%20interested%20in%20placing%20a%20bulk%20order."
                    target="_blank"
                    rel="no-referrer"
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 dark:bg-zinc-800 dark:hover:bg-zinc-750 hover:scale-102 active:scale-95"
                  >
                    💬 WhatsApp Line
                  </a>
                </div>
              </div>

              {/* Trust badges */}
              <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 justify-center">
                <span>🛡️</span>
                <span>{language === "en" ? "Verified Direct Cooperative Support" : "அங்கீகரிக்கப்பட்ட நேரடி கூட்டுறவு உதவி மையம்"}</span>
              </div>
            </div>

            {/* Action footer */}
            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-750 dark:text-zinc-200 text-xs font-bold rounded-xl cursor-pointer"
              >
                {language === "en" ? "Close" : "மூடுக"}
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
