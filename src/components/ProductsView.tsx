import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Search, SlidersHorizontal, MapPin, Grid, Layers, HelpCircle, ArrowRightLeft } from "lucide-react";

interface ProductsViewProps {
  products: any[];
  onNavigate: (view: string, detailsId?: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  const { t, language, addToCart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number>(1000); // Max filter price in INR

  const categories = [
    { id: "all", label: t("all"), icon: "🌿" },
    { id: "banana", label: t("banana"), icon: "🍌" },
    { id: "cashew", label: t("cashew"), icon: "🥜" },
    { id: "jackfruit", label: t("jackfruit"), icon: "🍈" },
    { id: "groundnuts", label: t("groundnuts"), icon: "🌰" },
    { id: "vegetables", label: t("vegetables"), icon: "🥬" },
    { id: "local_products", label: t("local_products"), icon: "🏺" }
  ];

  // Filters logic
  const filtered = products.filter((p) => {
    // 1. Category check
    if (selectedCategory !== "all" && p.category !== selectedCategory) return false;

    // 2. Price check
    if (p.price > priceRange) return false;

    // 3. Search check
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = p.nameEN.toLowerCase().includes(q) || p.nameTA.toLowerCase().includes(q);
      const matchDesc = p.descriptionEN.toLowerCase().includes(q) || p.descriptionTA.toLowerCase().includes(q);
      const matchDist = p.district.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchDist) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2 border-b border-zinc-150/70 dark:border-zinc-800">
        <div>
          <h2 className="text-3xl font-serif text-zinc-805 dark:text-white tracking-tight">
            Fresh <span className="italic font-bold">{language === "en" ? "Earth Marketplace" : "விவசாய சந்தை"}</span>
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {language === "en" 
              ? `Currently viewing ${filtered.length} listings direct from Tamil Nadu cooperatives`
              : `கூட்டுறவு விவசாயிகளிடம் இருந்து நேரடியாக ${filtered.length} பொருட்கள் பட்டியலிடப்பட்டுள்ளன`}
          </p>
        </div>

        {/* Dynamic Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={language === "en" ? "Filter listings..." : "விவசாயப் பொருளைத் தேடுங்கள்..."}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-emerald-500 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR FILTER CONTROLS */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Categories Grid List */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150/75 dark:border-zinc-800/80 p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              {language === "en" ? "Categories" : "பிரிவுகள்"}
            </h3>

            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  id={`cat-filter-btn-${cat.id}`}
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-3.5 cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none"
                      : "text-zinc-600 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="flex-1 truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150/75 dark:border-zinc-800/80 p-5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              {language === "en" ? "Price Threshold" : "அதிகபட்ச விலை வரம்பு"}
            </h3>

            <div className="space-y-1.5">
              <input
                type="range"
                min="30"
                max="1000"
                step="10"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs font-bold text-zinc-500">
                <span>₹30</span>
                <span className="text-emerald-800 dark:text-emerald-400">Under: ₹{priceRange}</span>
                <span>₹1000+</span>
              </div>
            </div>
          </div>

          {/* District Assurance Card */}
          <div className="bg-gradient-to-br from-lime-950 to-emerald-950 text-white rounded-2xl p-5 border border-emerald-900 space-y-3.5">
            <h4 className="font-extrabold text-base text-lime-400">Direct From Native Soils</h4>
            <p className="text-xs leading-relaxed text-zinc-300 font-sans">
              Every crop listed is tagged with its geographical cultivating district. This guarantees biological variety, proper district-wise shipping, and protection of GI labels.
            </p>
          </div>

        </div>

        {/* PRODUCT GRID DISPLAY ITEMS */}
        <div className="lg:col-span-3">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/10 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-805/80 flex flex-col items-center justify-center space-y-4">
              <span className="text-4xl text-zinc-400">🌾</span>
              <p className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                {language === "en" ? "No harvests match your query" : "தேடலுக்குரிய பொருட்கள் ஏதும் காணப்படவில்லை"}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setPriceRange(1000);
                  onSearchChange("");
                }}
                className="text-xs font-bold bg-emerald-600 text-white px-4 py-2 rounded-xl"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((item) => {
                const iName = language === "en" ? item.nameEN : item.nameTA;
                const iDesc = language === "en" ? item.descriptionEN : item.descriptionTA;
                const iUnit = language === "en" ? item.availableStockUnitEN : item.availableStockUnitTA;

                return (
                  <div
                    id={`catalog-card-${item.id}`}
                    key={item.id}
                    className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-150/70 dark:border-zinc-800/80 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    
                    <div className="relative h-48 bg-zinc-50 overflow-hidden">
                      <img
                        src={item.images[0]}
                        alt={item.nameEN}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-1.5">
                        <h4
                          onClick={() => onNavigate("product-details", item.id)}
                          className="font-bold text-gray-900 dark:text-white text-base hover:text-emerald-600 transition-colors cursor-pointer leading-snug line-clamp-2"
                        >
                          {iName}
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {iDesc}
                        </p>
                      </div>

                      {/* Lower Price, Cart bar */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-zinc-400 uppercase font-black">Price / {iUnit}</p>
                          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 leading-none">
                            ₹{item.price}
                          </p>
                        </div>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => onNavigate("product-details", item.id)}
                            className="text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-2 rounded-xl font-bold transition-all"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => {
                              addToCart({
                                productId: item.id,
                                nameEN: item.nameEN,
                                nameTA: item.nameTA,
                                price: item.price,
                                image: item.images[0],
                                sellerId: item.sellerId,
                                availableStock: item.availableStock,
                                availableStockUnitEN: item.availableStockUnitEN,
                                availableStockUnitTA: item.availableStockUnitTA
                              }, 1);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            {t("addToCartBtn")}
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
