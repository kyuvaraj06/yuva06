import React, { createContext, useContext, useState, useEffect } from "react";
import { ToastContainer, ToastMessage } from "../components/Toast.tsx";

// User types mirroring backend
export interface User {
  id: string;
  fullName: string;
  age: number;
  phoneNumber: string;
  email: string;
  fullAddress: string;
  district: string;
  pincode: string;
  aadhaarNumber: string;
  aadhaarPhotoUrl: string;
  profilePhotoUrl: string;
  role: "user" | "seller" | "admin";
  isBlocked: boolean;
  isApprovedSeller?: boolean;
}

export interface CartItem {
  productId: string;
  nameEN: string;
  nameTA: string;
  price: number;
  quantity: number;
  image: string;
  sellerId: string;
  availableStock: number;
  availableStockUnitEN: string;
  availableStockUnitTA: string;
}

export type Language = "en" | "ta";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUserProfile: (user: User) => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  t: (key: string) => string;
  view: string;
  onNavigate: (view: string, detailsId?: string) => void;
  selectedDetailsId: string | null;
  addToast: (text: string, type?: "success" | "error" | "info") => void;
  ToastComponent: React.FC;
}

// Translations Dictionary
const translations: Record<string, Record<Language, string>> = {
  appName: { en: "Tamil Agro Mart", ta: "தமிழ் அக்ரோ மார்ட்" },
  motto: { en: "Direct from Tamil Nadu’s Red Soils to Your Kitchen", ta: "தமிழ்நாட்டின் செம்மண் நிலங்களிலிருந்து நேரடியாக உங்கள் சமையலறைக்கு" },
  home: { en: "Home", ta: "முகப்பு" },
  products: { en: "Products", ta: "பொருட்கள்" },
  bananaSec: { en: "Specialty Bananas", ta: "விசேஷ வாழை ரகங்கள்" },
  register: { en: "Register", ta: "பதிவு செய்க" },
  login: { en: "Login", ta: "உள்நுழைக" },
  logout: { en: "Logout", ta: "வெளியேறு" },
  cart: { en: "Cart", ta: "கூடை" },
  dashboard: { en: "Dashboard", ta: "டாஷ்போர்டு" },
  adminPanel: { en: "Admin", ta: "நிர்வாகம்" },
  searchPlaceholder: { en: "Search fresh bananas, cashews, honey, local items...", ta: "வாழைப்பழம், முந்திரி, தேன், உள்ளூர் பொருட்களைத் தேடுங்கள்..." },
  searchBtn: { en: "Search", ta: "தேடுக" },
  all: { en: "All Categories", ta: "அனைத்து பிரிவுகள்" },
  banana: { en: "Banana Varieties", ta: "வாழைப்பழ வகைகள்" },
  cashew: { en: "Cashew Nuts", ta: "முந்திரி பருப்புகள்" },
  jackfruit: { en: "Jackfruit", ta: "பலாப்பழம்" },
  groundnuts: { en: "Groundnuts", ta: "நிலக்கடலை" },
  vegetables: { en: "Vegetables", ta: "காய்கறிகள்" },
  local_products: { en: "Local Products", ta: "உள்ளூர் தயாரிப்புகள்" },
  buyNow: { en: "Buy Now", ta: "உடனே வாங்கு" },
  addToCartBtn: { en: "Add to Cart", ta: "கூடையில் சேர்" },
  benefits: { en: "Health Benefits", ta: "ஆரோக்கிய நன்மைகள்" },
  origin: { en: "Grown in", ta: "விளைந்த இடம்" },
  deliveryAvailable: { en: "Delivery Available", ta: "டெலிவரி உள்ளது" },
  deliveryUnavailable: { en: "Delivery Temp Unavailable", ta: "டெலிவரி தற்காலிகமாக இல்லை" },
  reviews: { en: "Customer Reviews", ta: "வாடிக்கையாளர் கருத்துக்கள்" },
  writeReview: { en: "Write a Review", ta: "மதிப்பாய்வெழுதுக" },
  rating: { en: "Rating", ta: "மதிப்பீடு" },
  submit: { en: "Submit", ta: "சமர்ப்பி" },
  commentPlaceholder: { en: "Share your experience with this fresh harvest...", ta: "இந்த புதிய அறுவடை பற்றிய உங்கள் அனுபவத்தைப் பகிரவும்..." },
  pincodeCheck: { en: "Calculate Delivery Charges", ta: "டெலிவரி கட்டணம் கணக்கிடுங்கள்" },
  selectDistrict: { en: "Select Shipping District", ta: "ஷிப்பிங் மாவட்டத்தைத் தேர்ந்தெடுக்கவும்" },
  chkAddress: { en: "Full Address", ta: "முழு முகவரி" },
  chkPincode: { en: "Pincode", ta: "அஞ்சல் குறியீடு" },
  chkPayment: { en: "Payment Method", ta: "பணம் செலுத்தும் முறை" },
  orderHistory: { en: "Order History", ta: "ஆர்டர் வரலாறு" },
  trackOrder: { en: "Track Delivery", ta: "டெலிவரியைக் கண்காணி" },
  orderSummary: { en: "Order Summary", ta: "ஆர்டர் விவரம்" },
  commissionLabel: { en: "Commission Deducted", ta: "கமிஷன் கழிப்பு" },
  total: { en: "Total Amount", ta: "மொத்த தொகை" },
  shippingFee: { en: "Shipping Fee", ta: "ஷிப்பிங் கட்டணம்" },
  estDelivery: { en: "Estimated Delivery Date", ta: "மதிப்பிடப்பட்ட விநியோக தேதி" },
  paymentVerifyPending: { en: "Manual Verification Pending", ta: "நேரடி பணம் சரிபார்ப்பு நிலுவையில் உள்ளது" },
  gpayNotice: { en: "Pay via GPay UPI or Scan QR code and upload screenshot below to confirm.", ta: "கீழே உள்ள GPay QR குறியீட்டை ஸ்கேன் செய்து பணம் செலுத்தி, அதன் வெற்றிகரமான ஸ்கிரீன்ஷாட்டைப் பதிவேற்றவும்." },
  sellerAlert: { en: "Sellers register here to sell direct to buyers", ta: "நுகர்வோருக்கு நேரடியாக விற்க விவசாயிகள் இங்கே பதிவு செய்யவும்" },
  aadhaarLabel: { en: "12-Digit Aadhaar Number", ta: "12-இலக்க ஆதார் எண்" },
  registeredMsg: { en: "Account registered successfully", ta: "கணக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது" },
  loginSuccess: { en: "Welcome back!", ta: "நல்வரவு!" },
  sellerPending: { en: "Your seller registration is pending Admin confirmation.", ta: "விவசாயி பதிவு நிர்வாகியின் ஒப்புதலுக்காக நிலுவையில் உள்ளது." },
  activeProducts: { en: "My Uploaded Produce", ta: "எனது விவசாயப் பொருட்கள்" },
  addNewProd: { en: "Add Harvest Product", ta: "அறுவடை பொருளைச் சேர்" },
  productNameEN: { en: "Name in English", ta: "ஆங்கிலப் பெயர்" },
  productNameTA: { en: "Name in Tamil", ta: "தமிழ்ப் பெயர்" },
  descEN: { en: "Description in English", ta: "ஆங்கில விவரம்" },
  descTA: { en: "Description in Tamil", ta: "தமிழ் விவரம்" },
  pricePerUnit: { en: "Price (₹)", ta: "விலை (₹)" },
  stockQty: { en: "Available Stock (Qty)", ta: "இருப்பு அளவு" },
  unitEN: { en: "Stock Unit EN (e.g. kg)", ta: "அளவீட்டு அலகு EN" },
  unitTA: { en: "Stock Unit TA (e.g. கிலோ)", ta: "அளவீட்டு அலகு TA" },
  save: { en: "Save Product", ta: "பொருளைச் சேமி" },
  adminAnalytics: { en: "Agro Mart Analytics Dashboard", ta: "நிர்வாக அனலிட்டிக்ஸ் டாஷ்போர்டு" },
  pendingSellers: { en: "Pending Seller Certifications", ta: "ஒப்புதல் பெற வேண்டிய புதிய விவசாயிகள்" },
  registeredSellers: { en: "Registered Sellers", ta: "விவசாயிகள் பட்டியல்" },
  registeredUsers: { en: "Registered Buyers", ta: "வாடிக்கையாளர்கள் பட்டியல்" },
  gpayQRConfig: { en: "Configure Global GPay QR", ta: "GPay QR குறியீட்டை மாற்றியமை" },
  commissionMetric: { en: "Admin 2% Commission Profit", ta: "நிர்வாக 2% கமிஷன் லாபம்" },
  earningsMetric: { en: "Total Gross Market Sales", ta: "மொத்த சந்தை விற்பனை" },
  dailySalesReport: { en: "Daily Harvest Payout Logs", ta: "தினசரி அறுவடை விற்பனைப் பதிவுகள்" },
  blockUser: { en: "Block User", ta: "தடை செய்" },
  unblockUser: { en: "Unblock User", ta: "தடையை நீக்கு" },
  approveSellerBtn: { en: "Approve Seller", ta: "அனுமதி வழங்கு" },
  rejectSellerBtn: { en: "Reject", ta: "நிராகரி" },
  orderPlaced: { en: "Order Placed Successfully!", ta: "ஆர்டர் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!" },
  paymentSuccessful: { en: "Payment Received", ta: "பணம் பெறப்பட்டது" },
  whatsappAlt: { en: "Chat with Agro Mart Helpdesk on WhatsApp", ta: "வாட்ஸ்அப் மூலம் உதவி மையத்தைத் தொடர்பு கொள்ளவும்" }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("agro_lang") as Language) || "en";
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("agro_dark") === "true";
  });
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("agro_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("agro_token") || null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const raw = localStorage.getItem("agro_cart");
    return raw ? JSON.parse(raw) : [];
  });

  // Navigation states
  const [view, setView] = useState<string>("home");
  const [selectedDetailsId, setSelectedDetailsId] = useState<string | null>(null);

  // Toast notifications state and helpers
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const onNavigate = (newView: string, detailsId?: string) => {
    setView(newView);
    if (detailsId !== undefined) {
      setSelectedDetailsId(detailsId);
    } else {
      setSelectedDetailsId(null);
    }
  };

  const addToast = (text: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const ToastComponent: React.FC = () => {
    return <ToastContainer toasts={toasts} removeToast={removeToast} />;
  };

  // Track settings in localStorage
  useEffect(() => {
    localStorage.setItem("agro_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("agro_dark", String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("agro_cart", JSON.stringify(cart));
  }, [cart]);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("agro_user", JSON.stringify(newUser));
    localStorage.setItem("agro_token", newToken);
    addToast(language === "en" ? "Logged in successfully!" : "வெற்றிகரமாக உள்நுழைந்தீர்கள்!", "success");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    localStorage.removeItem("agro_user");
    localStorage.removeItem("agro_token");
    localStorage.removeItem("agro_cart");
    addToast(language === "en" ? "Logged out." : "வெளியேறினீர்கள்.", "info");
  };

  const updateUserProfile = (updated: User) => {
    setUser(updated);
    localStorage.setItem("agro_user", JSON.stringify(updated));
    addToast(language === "en" ? "Profile updated!" : "சுயவிவரம் புதுப்பிக்கப்பட்டது!", "success");
  };

  // Cart operations
  const addToCart = (item: Omit<CartItem, "quantity">, qty = 1) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.productId === item.productId);
      if (existingIdx !== -1) {
        const nextCart = [...prev];
        nextCart[existingIdx] = {
          ...nextCart[existingIdx],
          quantity: Math.min(nextCart[existingIdx].quantity + qty, item.availableStock)
        };
        addToast(language === "en" ? `${item.nameEN} quantity updated in cart!` : `${item.nameTA} அளவு புதுப்பிக்கப்பட்டது!`, "success");
        return nextCart;
      }
      addToast(language === "en" ? `${item.nameEN} added to cart!` : `${item.nameTA} கூடையில் சேர்க்கப்பட்டது!`, "success");
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const updateCartQty = (productId: string, qty: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            return { ...item, quantity: Math.max(1, Math.min(qty, item.availableStock)) };
          }
          return item;
        })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.productId === productId);
      if (item) {
        addToast(language === "en" ? `${item.nameEN} removed from cart.` : `${item.nameTA} கூடையிலிருந்து நீக்கப்பட்டது.`, "info");
      }
      return prev.filter((i) => i.productId !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    addToast(language === "en" ? "Cart cleared!" : "கூடை காலியாக்கப்பட்டது!", "info");
  };

  const t = (key: string): string => {
    const term = translations[key];
    if (!term) return key;
    return term[language] || key;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        darkMode,
        setDarkMode,
        user,
        setUser,
        token,
        setToken,
        login,
        logout,
        updateUserProfile,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        t,
        view,
        onNavigate,
        selectedDetailsId,
        addToast,
        ToastComponent
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
