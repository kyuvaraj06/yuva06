import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext.tsx";
import { Star, MapPin, Truck, ShieldCheck, ShoppingBag, Send, Award, Calendar } from "lucide-react";

interface DetailsViewProps {
  productId: string;
  onNavigate: (view: string, detailsId?: string) => void;
  products: any[];
  onReviewSubmit: (pId: string, rating: number, comment: string) => void;
  deliveryDistricts: any[];
}

export const DetailsView: React.FC<DetailsViewProps> = ({
  productId,
  onNavigate,
  products,
  onReviewSubmit,
  deliveryDistricts
}) => {
  const { t, language, addToCart, token } = useApp();
  const [product, setProduct] = useState<any>(null);
  
  // Review inputs
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");

  // Delivery check state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [shippingEstimation, setShippingEstimation] = useState<{
    charge: number;
    estimatedDays: number;
    estimatedDeliveryDate: string;
  } | null>(null);

  useEffect(() => {
    const found = products.find((p) => p.id === productId);
    if (found) {
      setProduct(found);
    }
  }, [productId, products]);

  // Hook dynamic delivery calculator whenever district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setShippingEstimation(null);
      return;
    }

    // Call simulated or direct delivery REST helper
    fetch("/api/orders/calculate-delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ district: selectedDistrict })
    })
      .then((res) => res.json())
      .then((data) => {
        setShippingEstimation(data);
      })
      .catch((err) => console.error("Error calculating shipping:", err));
  }, [selectedDistrict]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-zinc-500 font-semibold">{language === "en" ? "Loading harvest details..." : "அறுவடை விவரங்கள் ஏற்றப்படுகின்றன..."}</p>
      </div>
    );
  }

  const pName = language === "en" ? product.nameEN : product.nameTA;
  const pDesc = language === "en" ? product.descriptionEN : product.descriptionTA;
  const pBenefits = language === "en" ? product.healthBenefitsEN : product.healthBenefitsTA;
  const pUnit = language === "en" ? product.availableStockUnitEN : product.availableStockUnitTA;

  // Average rating calculated dynamically
  const reviewsList = product.reviews || [];
  const averageRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewsList.length).toFixed(1)
    : "5.0";

  const handlePostReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert(language === "en" ? "Please login to write reviews." : "மதிப்பாய்வெழுத முதலில் உள்நுழையவும்.");
      onNavigate("login");
      return;
    }
    if (!newComment.trim()) return;

    onReviewSubmit(product.id, newRating, newComment);
    setNewComment("");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Upper Grid Layout: Imagery vs Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Gallery Column */}
        <div className="space-y-4">
          <div className="relative h-96 sm:h-[450px] bg-zinc-50 rounded-3xl overflow-hidden shadow-sm border border-zinc-200/50">
            <img
              src={product.images[0]}
              alt={product.nameEN}
              className="w-full h-full object-cover"
            />

            {product.category === "banana" && (
              <span className="absolute top-4 right-4 bg-yellow-500 text-zinc-950 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md">
                ⭐ Organic Specialty
              </span>
            )}
          </div>
        </div>

        {/* Purchase details Column */}
        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest block">
              🌿 {t(product.category)}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {pName}
            </h2>
          </div>

          {/* Rating Summary */}
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 fill-current ${
                    i < Math.round(Number(averageRating)) ? "text-amber-500" : "text-gray-300 dark:text-gray-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-zinc-300">
              {averageRating} ({reviewsList.length} reviews)
            </span>
          </div>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
            {pDesc}
          </p>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/55 border border-zinc-150/70 dark:border-zinc-800/80 flex justify-between items-center">
            <div>
              <p className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Price per {pUnit}</p>
              <p className="text-3xl font-black text-emerald-800 dark:text-emerald-400">
                ₹{product.price}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase font-extrabold text-zinc-400 tracking-wider">Stock Status</p>
              {product.availableStock > 0 ? (
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ✅ {product.availableStock} {pUnit} {language === "en" ? "Available" : "இருப்பில் உள்ளது"}
                </p>
              ) : (
                <p className="text-sm font-bold text-red-500 mt-1">❌ Out of Stock</p>
              )}
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
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
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 p-4 rounded-xl text-sm font-bold transition-all shadow-sm border border-zinc-200/40 dark:border-zinc-805/80 cursor-pointer"
            >
              {t("addToCartBtn")}
            </button>
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
                onNavigate("cart");
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl text-sm font-bold transition-all shadow-md shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {t("buyNow")}
            </button>
          </div>

          {/* DYNAMIC SHIPPINGS LOOKUP */}
          <div className="p-5 border border-zinc-150/75 dark:border-zinc-805/80 rounded-2xl bg-white dark:bg-zinc-950/20 space-y-4">
            <h4 className="text-sm font-bold text-zinc-850 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              {t("pincodeCheck")}
            </h4>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 block">{t("selectDistrict")}</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
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

            {shippingEstimation && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-xl grid grid-cols-3 gap-3 text-center">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">{t("shippingFee")}</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">₹{shippingEstimation.charge}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Transit Days</span>
                  <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">{shippingEstimation.estimatedDays} Day(s)</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-bold block">Delivery By</span>
                  <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1 mt-1 leading-none">
                    <Calendar className="w-3.5 h-3.5" />
                    {shippingEstimation.estimatedDeliveryDate}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Specialty properties or Health Description segment */}
      {pBenefits && (
        <section className="bg-yellow-50/40 dark:bg-yellow-950/10 border border-yellow-250/25 dark:border-yellow-900/30 rounded-3xl p-6 sm:p-8 space-y-3.5">
          <h3 className="text-lg sm:text-xl font-bold text-yellow-800 dark:text-yellow-500 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
            {t("benefits")}: Why Choose This Harvest?
          </h3>
          <p className="text-sm text-yellow-900/90 dark:text-yellow-100 font-medium leading-relaxed">
            {pBenefits}
          </p>
        </section>
      )}

      {/* CONSUMER CUSTOMER REVIEWS RATING SEGMENT */}
      <section className="border-t border-zinc-150/70 dark:border-zinc-805/80 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Write a Review Block */}
        <div className="lg:col-span-1 space-y-5">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t("writeReview")}
          </h3>

          <form onSubmit={handlePostReviewSubmit} className="space-y-4">
            
            {/* Rating Stars Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 block">{t("rating")}</label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="text-amber-500 outline-none focus:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= newRating ? "fill-amber-500 text-amber-500" : "text-gray-300 dark:text-gray-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment Message */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 block">Your Review</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("commentPlaceholder")}
                rows={4}
                className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-semibold outline-none focus:border-emerald-500 placeholder-zinc-400"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              {t("submit")}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t("reviews")} ({reviewsList.length})
          </h3>

          {reviewsList.length === 0 ? (
            <div className="text-center py-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900/30 text-zinc-400 font-semibold text-sm">
              📢 Be the first to write a review for this fresh farm harvest!
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsList.map((rev: any) => (
                <div
                  key={rev.id}
                  className="bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-150/70 dark:border-zinc-805/85 p-5 space-y-3.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <strong className="text-zinc-900 dark:text-zinc-100 text-sm font-bold block">{rev.userName}</strong>
                      <span className="text-[10px] text-zinc-400">{rev.createdAt.substring(0, 10)}</span>
                    </div>
                    {/* Stars visual */}
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 fill-current ${
                            idx < rev.rating ? "text-amber-500" : "text-gray-200 dark:text-gray-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-300 leading-relaxed font-sans">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </section>

    </div>
  );
};
