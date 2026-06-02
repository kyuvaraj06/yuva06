import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Search, MapPin, Sparkles, Heart, ArrowRight, CornerRightDown, BadgeAlert, ShoppingBag } from "lucide-react";

interface HomeViewProps {
  onNavigate: (view: string, detailsId?: string) => void;
  products: any[];
  onSearchChange: (query: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, products, onSearchChange }) => {
  const { t, language, addToCart } = useApp();
  const [searchVal, setSearchVal] = useState("");

  const categories = [
    { id: "banana", label: t("banana"), icon: "🍌", color: "bg-yellow-50 text-yellow-700 border-yellow-250/20" },
    { id: "cashew", label: t("cashew"), icon: "🥜", color: "bg-amber-50 text-amber-700 border-amber-250/25" },
    { id: "jackfruit", label: t("jackfruit"), icon: "🍈", color: "bg-emerald-50 text-emerald-700 border-emerald-250/20" },
    { id: "groundnuts", label: t("groundnuts"), icon: "🌰", color: "bg-orange-50 text-orange-700 border-orange-250/20" },
    { id: "vegetables", label: t("vegetables"), icon: "🥬", color: "bg-lime-50 text-lime-700 border-lime-250/20" },
    { id: "local_products", label: t("local_products"), icon: "🏺", color: "bg-teal-50 text-teal-700 border-teal-250/25" }
  ];

  // Pull out the banana varieties explicitly
  const bananas = products.filter((p) => p.category === "banana").slice(0, 6);
  // Pull other harvests
  const topHarvests = products.filter((p) => p.category !== "banana").slice(0, 4);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchVal);
    onNavigate("catalog");
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-950 to-zinc-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 py-16 sm:py-24 px-6 sm:px-12 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-600/20 via-transparent to-transparent pointer-none" />
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-none" />

        <div className="max-w-4xl relative z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-400/25 rounded-full text-xs font-bold text-emerald-300 tracking-wider uppercase animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            100% {language === "en" ? "Farmer Guaranteed" : "விவசாயிகள் நேரடி விற்பனை"}
          </span>
          
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none">
            {language === "en" ? "Fresh From Organic Soils" : "இயற்கை நிலத்தின் பசுமை அறுவடை"}<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300">
              {language === "en" ? "Direct to Your Community" : "நேரடியாக நுகர்வோரிடம்"}
            </span>
          </h2>
          
          <p className="text-sm sm:text-lg text-emerald-200/85 font-medium max-w-xl leading-relaxed">
            {t("motto")}
          </p>

          {/* Search Trigger form element */}
          <form onSubmit={handleSubmitSearch} className="flex flex-col sm:flex-row gap-3 pt-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-white text-zinc-900 placeholder-zinc-500 outline-none rounded-2xl pl-12 pr-4 py-4 text-sm font-semibold border-2 border-emerald-800 focus:border-lime-500 transition-all focus:ring-4 focus:ring-lime-500/10 shadow-lg"
              />
            </div>
            <button
              id="search-aggregate-button"
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-4 sm:py-2 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {t("searchBtn")}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      {/* Categories Horizontal Selector Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl sm:text-3xl font-serif text-zinc-800 dark:text-white tracking-tight">
              Browse <span className="italic font-bold">{language === "en" ? "Our Farms" : "விவசாயப் பொருட்கள்"}</span>
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {language === "en" ? "Handpicked high value crops" : "உள்ளூர் விவசாயத்தில் விளைவிக்கப்பட்டவை"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              id={`category-tile-${cat.id}`}
              key={cat.id}
              onClick={() => {
                onSearchChange("");
                onNavigate("catalog");
              }}
              className="group cursor-pointer p-5 rounded-2xl border border-zinc-150/85 dark:border-zinc-800 bg-white hover:bg-emerald-50/20 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 transition-all duration-300 hover:shadow-md text-center flex flex-col items-center space-y-3"
            >
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
              <p className="text-sm font-bold text-gray-800 dark:text-zinc-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-sans tracking-tight">
                {cat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BANANA SPECIALTY COOPERATIVE SECTION */}
      <section id="banana-showcase-section" className="bg-emerald-900/5 dark:bg-zinc-950/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-widest block">
              🍌 {language === "en" ? "Exclusive Harvest Highlight" : "சிறப்பு விஏஜே ரகம்"}
            </span>
            <h3 className="text-3xl sm:text-4xl font-serif text-zinc-800 dark:text-white tracking-tight leading-none">
              Fresh <span className="italic font-bold">{t("bananaSec")}</span>
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed font-semibold">
              {language === "en" 
                ? "Discover 6 authentic, nutrient-dense traditional banana varieties irrigated with pure river streams."
                : "ஆற்றுப் படுக்கைகளின் வளம் நிறைந்த மண்ணில் விளைவிக்கப்பட்ட, மருத்துவ குணங்கள் கொண்ட 6 பாரம்பரிய வாழைப்பழங்கள்."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bananas.map((banana) => {
              const bName = language === "en" ? banana.nameEN : banana.nameTA;
              const bDesc = language === "en" ? banana.descriptionEN : banana.descriptionTA;
              const bBenefits = language === "en" ? banana.healthBenefitsEN : banana.healthBenefitsTA;
              const bUnit = language === "en" ? banana.availableStockUnitEN : banana.availableStockUnitTA;

              return (
                <div
                  id={`banana-card-${banana.id}`}
                  key={banana.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-150/70 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group justify-between"
                >
                  
                  {/* Product Image */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-zinc-50">
                    <img
                      src={banana.images[0]}
                      alt={banana.nameEN}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Source District */}
                    <span className="absolute top-4 left-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1 shadow-sm">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {banana.district}
                    </span>

                    {/* Highly Valued Tag */}
                    <span className="absolute top-4 right-4 bg-yellow-500 text-zinc-950 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                      👑 GI Crop
                    </span>
                  </div>

                  {/* Details block */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h4 
                        onClick={() => onNavigate("product-details", banana.id)}
                        className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer leading-tight"
                      >
                        {bName}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {bDesc}
                      </p>

                      {/* Benefits Segment */}
                      {bBenefits && (
                        <div className="bg-yellow-50/60 dark:bg-yellow-950/15 border border-yellow-200/40 dark:border-yellow-900/30 p-3.5 rounded-2xl text-[11px]">
                          <strong className="text-yellow-800 dark:text-yellow-500 uppercase tracking-widest block font-bold mb-1">
                            🌱 {t("benefits")}:
                          </strong>
                          <span className="text-yellow-900 dark:text-yellow-100 line-clamp-2">
                            {bBenefits}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Price / {bUnit}</p>
                        <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">
                          ₹{banana.price}
                        </p>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            addToCart({
                              productId: banana.id,
                              nameEN: banana.nameEN,
                              nameTA: banana.nameTA,
                              price: banana.price,
                              image: banana.images[0],
                              sellerId: banana.sellerId,
                              availableStock: banana.availableStock,
                              availableStockUnitEN: banana.availableStockUnitEN,
                              availableStockUnitTA: banana.availableStockUnitTA
                            }, 1);
                          }}
                          className="bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border border-emerald-100 dark:border-emerald-900/60 cursor-pointer"
                        >
                          {t("addToCartBtn")}
                        </button>
                        <button
                          onClick={() => {
                            addToCart({
                              productId: banana.id,
                              nameEN: banana.nameEN,
                              nameTA: banana.nameTA,
                              price: banana.price,
                              image: banana.images[0],
                              sellerId: banana.sellerId,
                              availableStock: banana.availableStock,
                              availableStockUnitEN: banana.availableStockUnitEN,
                              availableStockUnitTA: banana.availableStockUnitTA
                            }, 1);
                            onNavigate("cart");
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          {t("buyNow")}
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>

          {/* View Catalog Shortcut */}
          <div className="text-center pt-4">
            <button
              onClick={() => onNavigate("catalog")}
              className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold hover:gap-3 transition-all text-sm group cursor-pointer"
            >
              {language === "en" ? "Explore Full Agriculture Catalog" : "முழு அறுவடை பட்டியலைக் காணுங்கள்"}
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>
      </section>

      {/* OTHER FRESH HARVESTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h3 className="text-2xl sm:text-3xl font-serif text-zinc-800 dark:text-white tracking-tight">
            Recent <span className="italic font-bold">{language === "en" ? "Farmer Harvests" : "நமது அறுவடைகள்"}</span>
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            {language === "en" ? "Fresh jackfruit, premium cashew nuts, raw groundnuts and local grains" : "உயர்தர முந்திரி, புதிய பலா, நாமக்கல் நிலக்கடலை மற்றும் காய்கறிகள்"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topHarvests.map((product) => {
            const prodName = language === "en" ? product.nameEN : product.nameTA;
            const unitType = language === "en" ? product.availableStockUnitEN : product.availableStockUnitTA;

            return (
              <div
                id={`harvest-card-${product.id}`}
                key={product.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-150/80 dark:border-zinc-800 rounded-2xl p-4 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 rounded-xl overflow-hidden bg-zinc-50">
                    <img src={product.images[0]} alt={product.nameEN} className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2.5 py-0.5 rounded-full font-semibold backdrop-blur-sm">
                      📍 {product.district}
                    </span>
                  </div>
                  <h4 
                    onClick={() => onNavigate("product-details", product.id)}
                    className="font-bold text-gray-900 dark:text-white text-base mt-3 cursor-pointer hover:text-emerald-600 transition-colors line-clamp-1"
                  >
                    {prodName}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 lowercase first-letter:uppercase">
                    Category: {product.category.replace("_", " ")}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block leading-none">Price / {unitType}</span>
                    <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-400">₹{product.price}</span>
                  </div>
                  <button
                    onClick={() => {
                      addToCart({
                        productId: product.id,
                        nameEN: product.nameEN,
                        nameTA: product.nameTA,
                        price: product.price,
                        image: product.images[0],
                        sellerId: product.sellerId,
                        availableStock: product.availableStock,
                        availableStockUnitEN: product.availableStockUnitEN,
                        availableStockUnitTA: product.availableStockUnitTA
                      }, 1);
                    }}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-zinc-800 dark:hover:bg-zinc-755 text-emerald-700 dark:text-emerald-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TRUST AND ADVANTAGES GRIDS */}
      <section className="bg-emerald-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 py-16 px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-lime-400 text-lg font-bold">01</div>
          <h4 className="text-lg font-bold">2% Minimal Admin Commission</h4>
          <p className="text-sm text-emerald-200/70 leading-relaxed font-sans">
            We operate on a mere 2% market charge. Fully 98% of your purchasing payout goes directly in the bank account of the cultivating farmers.
          </p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-lime-400 text-lg font-bold">02</div>
          <h4 className="text-lg font-bold">District-Wise Unified Dispatch</h4>
          <p className="text-sm text-emerald-200/70 leading-relaxed font-sans">
            Every district in Tamil Nadu is linked dynamically! Get automatic delivery estimates, reliable packing status, and reasonable flat-rate fees.
          </p>
        </div>
        <div className="space-y-3">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-lime-400 text-lg font-bold">03</div>
          <h4 className="text-lg font-bold">Dual-Lang Farmer Accessibility</h4>
          <p className="text-sm text-emerald-200/70 leading-relaxed font-sans">
            Supports both English and Tamil to enable rural farmers, cooperative societies, and local logistics workers to execute deals with absolute integrity.
          </p>
        </div>
      </section>

    </div>
  );
};
