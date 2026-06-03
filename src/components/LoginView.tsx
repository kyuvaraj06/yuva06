import React, { useState } from "react";
import { useApp } from "../context/AppContext.tsx";
import { User, Lock, Mail, Phone, MapPin, Landmark, Award, UploadCloud } from "lucide-react";

interface LoginViewProps {
  onNavigate: (view: string, detailsId?: string) => void;
  onLoginSubmit: (credentials: any) => Promise<boolean>;
  onRegisterSubmit: (formData: any) => Promise<boolean>;
  deliveryDistricts: any[];
}

export const LoginView: React.FC<LoginViewProps> = ({
  onNavigate,
  onLoginSubmit,
  onRegisterSubmit,
  deliveryDistricts
}) => {
  const { t, language } = useApp();
  const [isLoginTab, setIsLoginTab] = useState(true);

  // Common fields state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration exclusive state fields
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [role, setRole] = useState<"user" | "seller">("user"); // buyer vs farmer

  // Base64 file buffers (simulation placeholders)
  const [aadhaarPhotoUrl, setAadhaarPhotoUrl] = useState("https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=200");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "aadhaar" | "profile") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === "aadhaar") {
          setAadhaarPhotoUrl(reader.result as string);
        } else {
          setProfilePhotoUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    await onLoginSubmit({ email, password });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !phoneNumber || !district || !pincode || !aadhaarNumber) {
      alert("Please fill all mandatory agricultural details.");
      return;
    }

    const success = await onRegisterSubmit({
      fullName,
      age: Number(age) || 25,
      phoneNumber,
      email,
      password,
      fullAddress,
      district,
      pincode,
      aadhaarNumber,
      aadhaarPhotoUrl,
      profilePhotoUrl,
      role
    });

    if (success) {
      // Clear values and redirect
      setIsLoginTab(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150/75 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
        
        {/* App Logo Indicator */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 p-3 h-14 w-14 rounded-2xl mx-auto">
            🌾
          </div>
          <h3 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight leading-none">
            {isLoginTab 
              ? (language === "en" ? "Sign In to Tamil Agro Mart" : "உள்நுழைக")
              : (language === "en" ? "Create Local Account" : "புதிய கணக்கு")}
          </h3>
          <p className="text-xs text-zinc-500 font-sans">
            {language === "en" ? "Direct agricultural marketplace connecting soils and tables" : "விவசாயிகளை நேரடியாக சந்தையோடு இணைக்கும் தளம்"}
          </p>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-2 bg-zinc-100 dark:bg-zinc-950/80 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setIsLoginTab(true)}
            className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              isLoginTab 
                ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-450 border-b border-zinc-200/55 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t("login")}
          </button>
          <button
            type="button"
            onClick={() => setIsLoginTab(false)}
            className={`py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              !isLoginTab
                ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-450 border-b border-zinc-200/55 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {t("register")}
          </button>
        </div>

        {/* DYNAMIC FORM SEGMENTS */}
        {isLoginTab ? (
          
          /* LOGIN PANEL FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@agro.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 block">Secret Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-dashed border-zinc-200 dark:border-zinc-805 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block text-center">
                ⚡ Instant Demo Login Presets
              </span>
              <div className="grid grid-cols-3 gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("buyer@agro.com");
                    setPassword("buyer123");
                  }}
                  className="px-1.5 py-2 text-[10px] items-center justify-center font-bold rounded-lg bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-[#D1E2C4]/30 hover:scale-102 transition cursor-pointer select-none"
                >
                  🛒 Buyer Preset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("farmer@agro.com");
                    setPassword("farmer123");
                  }}
                  className="px-1.5 py-2 text-[10px] items-center justify-center font-bold rounded-lg bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-[#D1E2C4]/30 hover:scale-102 transition cursor-pointer select-none"
                >
                  🚜 Farmer Preset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("yuvarajx026@gmail.com");
                    setPassword("yuvaraj123");
                  }}
                  className="px-1.5 py-2 text-[10px] items-center justify-center font-bold rounded-lg bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-[#D1E2C4]/30 hover:scale-102 transition cursor-pointer select-none"
                >
                  👑 Admin Preset
                </button>
              </div>
            </div>

            <button
              id="auth-submit-trigger"
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl text-sm font-bold tracking-tight transition-all cursor-pointer shadow-sm select-none"
            >
              Log In to Dashboard
            </button>
          </form>

        ) : (

          /* REGISTER PANEL FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            
            {/* Split role Selection */}
            <div className="bg-yellow-50/60 dark:bg-yellow-950/15 border border-yellow-200/40 dark:border-yellow-905/30 p-4 rounded-2xl text-center space-y-3">
              <span className="text-[11px] font-bold text-yellow-800 dark:text-yellow-500 uppercase tracking-widest block">
                Account Operation Category
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`py-2 px-4 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                    role === "user"
                      ? "bg-yellow-500 text-zinc-950 border-yellow-500"
                      : "bg-white text-zinc-700 border-zinc-200"
                  }`}
                >
                  🌾 Buyer (கொள்முதல்)
                </button>
                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className={`py-2 px-4 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                    role === "seller"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-zinc-700 border-zinc-200"
                  }`}
                >
                  🚜 Farmer (உற்பத்தியாளர்)
                </button>
              </div>
              {role === "seller" && (
                <p className="text-[10px] text-zinc-500 font-sans italic pt-1">
                  Note: Farmer/Seller profiles require administrative certificate verification of Aadhaar files before uploads are unlocked.
                </p>
              )}
            </div>

            {/* Split inputs row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Subramanian"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Age <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 32"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Email + phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Phone Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98xxxxxx10"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Email Address <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mail@example.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 block">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Address District & Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">District Name <span className="text-red-500">*</span></label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 px-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose District --</option>
                  {deliveryDistricts.map((d: any) => (
                    <option key={d.id} value={d.districtEN}>
                      {d.districtEN}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">Postal Pincode <span className="text-red-500">*</span></label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    placeholder="e.g. 620001"
                    className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-800 pl-10 pr-4 py-3 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-400 block">Full Address <span className="text-red-500">*</span></label>
              <textarea
                required
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Complete postal address for transport logistics"
                rows={2}
                className="w-full bg-zinc-50 dark:bg-zinc-950/40 text-zinc-900 dark:text-zinc-100 border border-zinc-205 dark:border-zinc-800 rounded-xl p-3 text-sm font-semibold outline-none focus:border-emerald-500"
              />
            </div>

            {/* Mandatory Aadhaar segmentation */}
            <div className="bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-805/80 space-y-4">
              <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-600" />
                Identity Security Proof (Aadhaar Info)
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 block">12-Digit Aadhaar ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  maxLength={12}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="xxxx xxxx xxxx"
                  className="w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-200 border border-zinc-205 dark:border-zinc-805 px-4 py-2.5 rounded-lg text-sm font-semibold outline-none focus:border-emerald-500"
                />
              </div>

              {/* Upload blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Aadhaar image upload */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-400 block">Aadhaar scan sheet</span>
                  <div className="relative border border-dashed border-zinc-200 hover:border-emerald-500 rounded-xl p-3 text-center transition-colors bg-white dark:bg-zinc-900">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "aadhaar")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="text-xs text-zinc-500 font-semibold space-y-1">
                      <UploadCloud className="w-5 h-5 mx-auto text-zinc-400" />
                      <p>Upload Identity Scan...</p>
                    </div>
                  </div>
                </div>

                {/* Profile photo upload */}
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-400 block">User Avatar visual</span>
                  <div className="relative border border-dashed border-zinc-200 hover:border-emerald-500 rounded-xl p-3 text-center transition-colors bg-white dark:bg-zinc-900">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, "profile")}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="text-xs text-zinc-500 font-semibold space-y-1">
                      <UploadCloud className="w-5 h-5 mx-auto text-zinc-400" />
                      <p>Upload Photo Icon...</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-xl text-sm font-bold tracking-tight transition-all cursor-pointer shadow-sm select-none"
            >
              Request Account Creation
            </button>
          </form>

        )}

      </div>
    </div>
  );
};
