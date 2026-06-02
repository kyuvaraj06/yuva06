import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Define the file directory for local persistence.
const DATA_DIR = path.join(process.cwd(), ".data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read and write database collections
class Collection<T extends { id: string }> {
  private filePath: string;

  constructor(private name: string) {
    this.filePath = path.join(DATA_DIR, `${name}.json`);
  }

  private load(): T[] {
    if (!fs.existsSync(this.filePath)) {
      this.saveAll([]);
      return [];
    }
    try {
      const content = fs.readFileSync(this.filePath, "utf-8");
      return JSON.parse(content) as T[];
    } catch (e) {
      console.error(`Error reading database file: ${this.filePath}`, e);
      return [];
    }
  }

  private saveAll(data: T[]): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.error(`Error saving database file: ${this.filePath}`, e);
    }
  }

  find(filter?: Partial<T> | ((item: T) => boolean)): T[] {
    const data = this.load();
    if (!filter) return data;
    if (typeof filter === "function") {
      return data.filter(filter);
    }
    return data.filter((item) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  findOne(filter: Partial<T> | ((item: T) => boolean)): T | null {
    const results = this.find(filter);
    return results.length > 0 ? results[0] : null;
  }

  findById(id: string): T | null {
    return this.findOne({ id } as any);
  }

  create(doc: Omit<T, "id"> & { id?: string }): T {
    const data = this.load();
    const newDoc = {
      ...doc,
      id: doc.id || Math.random().toString(36).substring(2, 11) + Date.now().toString(),
    } as T;
    data.push(newDoc);
    this.saveAll(data);
    return newDoc;
  }

  findByIdAndUpdate(id: string, updates: Partial<T>): T | null {
    const data = this.load();
    const index = data.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const updated = { ...data[index], ...updates };
    data[index] = updated;
    this.saveAll(data);
    return updated;
  }

  updateOne(filter: Partial<T>, updates: Partial<T>): boolean {
    const data = this.load();
    const index = data.findIndex((item) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
    if (index === -1) return false;
    data[index] = { ...data[index], ...updates };
    this.saveAll(data);
    return true;
  }

  deleteOne(filter: Partial<T>): boolean {
    const data = this.load();
    const lenBefore = data.length;
    const filtered = data.filter((item) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
    if (filtered.length === 0) return false;
    // Remove the first matching
    const index = data.findIndex((item) => item.id === filtered[0].id);
    if (index !== -1) {
      data.splice(index, 1);
      this.saveAll(data);
      return true;
    }
    return false;
  }

  deleteMany(filter: Partial<T>): number {
    const data = this.load();
    const updated = data.filter((item) => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
    const remaining = data.filter((item) => !updated.some(u => u.id === item.id));
    this.saveAll(remaining);
    return updated.length;
  }
}

// Declare schemas / collections and seed database with key initial items
export interface DBUser {
  id: string;
  fullName: string;
  age: number;
  phoneNumber: string;
  email: string;
  passwordHash: string;
  fullAddress: string;
  district: string;
  pincode: string;
  aadhaarNumber: string;
  aadhaarPhotoUrl: string;
  profilePhotoUrl: string;
  role: "user" | "seller" | "admin";
  isBlocked: boolean;
  isApprovedSeller?: boolean; // For seller approval cycle
  createdAt: string;
}

export interface DBProduct {
  id: string;
  sellerId: string; // "admin" if added by admin, or sellerId helper
  sellerName: string;
  nameEN: string;
  nameTA: string;
  descriptionEN: string;
  descriptionTA: string;
  category: "banana" | "cashew" | "jackfruit" | "groundnuts" | "vegetables" | "local_products";
  price: number;
  availableStock: number;
  availableStockUnitEN: string; // e.g. "kg", "dozen", "bunch"
  availableStockUnitTA: string; // e.g. "கிலோ", "டஜன்", "தார்"
  district: string;
  images: string[];
  reviews: DBReview[];
  healthBenefitsEN?: string;
  healthBenefitsTA?: string;
  deliveryAvailability: boolean;
  createdAt: string;
}

export interface DBReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface DBOrder {
  id: string;
  userId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  items: {
    productId: string;
    productNameEN: string;
    productNameTA: string;
    quantity: number;
    price: number;
    sellerId: string;
  }[];
  totalAmount: number;
  commissionAmount: number; // 2% admin commission
  sellerEarnings: { [sellerId: string]: number }; // Seller portion: price * qty * 0.98
  fullAddress: string;
  district: string;
  pincode: string;
  deliveryCharge: number;
  estimatedDeliveryDate: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: "Razorpay" | "GPayQR";
  paymentId?: string; // Razorpay pay_id or custom GPay transaction id
  paymentScreenshot?: string; // path or base64 data URL
  paymentVerified: boolean;
  createdAt: string;
}

export interface DBDeliveryCharge {
  id: string;
  districtEN: string;
  districtTA: string;
  charge: number;
  estimatedDays: number;
}

export interface DBCartItem {
  productId: string;
  quantity: number;
}

export interface DBCart {
  id: string; // userId
  items: DBCartItem[];
}

export interface DBNotification {
  id: string;
  recipientId: string; // "admin", sellerId, or userId
  titleEN: string;
  titleTA: string;
  messageEN: string;
  messageTA: string;
  read: boolean;
  createdAt: string;
}

export interface DBGPayConfig {
  id: string; // "global"
  qrImageUrl: string;
  gpayId: string;
}

// Instantiate Collections
export const Users = new Collection<DBUser>("users");
export const Products = new Collection<DBProduct>("products");
export const Orders = new Collection<DBOrder>("orders");
export const DeliveryCharges = new Collection<DBDeliveryCharge>("delivery_charges");
export const Carts = new Collection<DBCart>("carts");
export const Notifications = new Collection<DBNotification>("notifications");
export const GPayConfigs = new Collection<DBGPayConfig>("gpay_config");

// Seeding standard data on boot if empty
export function seedDatabase() {
  // 1. Seed global QR config
  if (GPayConfigs.find().length === 0) {
    GPayConfigs.create({
      id: "global",
      gpayId: "kumarkyuvaraj1@oksbi",
      qrImageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=kumarkyuvaraj1@oksbi&pn=Yuvaraj&cu=INR"
    });
  }

  // 2. Seed Delivery charges for major districts in Tamil Nadu
  if (DeliveryCharges.find().length === 0) {
    const districts = [
      { districtEN: "Ariyalur", districtTA: "அரியலூர்", charge: 45, estimatedDays: 2 },
      { districtEN: "Chengalpattu", districtTA: "செங்கல்பட்டு", charge: 35, estimatedDays: 1 },
      { districtEN: "Chennai", districtTA: "சென்னை", charge: 30, estimatedDays: 1 },
      { districtEN: "Coimbatore", districtTA: "கோயம்புத்தூர்", charge: 50, estimatedDays: 2 },
      { districtEN: "Cuddalore", districtTA: "கடலூர்", charge: 40, estimatedDays: 2 },
      { districtEN: "Dharmapuri", districtTA: "தருமபுரி", charge: 50, estimatedDays: 3 },
      { districtEN: "Dindigul", districtTA: "திண்டுக்கல்", charge: 45, estimatedDays: 2 },
      { districtEN: "Erode", districtTA: "ஈரோடு", charge: 45, estimatedDays: 2 },
      { districtEN: "Kallakurichi", districtTA: "கள்ளக்குறிச்சி", charge: 40, estimatedDays: 2 },
      { districtEN: "Kanchipuram", districtTA: "காஞ்சிபுரம்", charge: 35, estimatedDays: 1 },
      { districtEN: "Kanyakumari", districtTA: "கன்னியாகுமரி", charge: 65, estimatedDays: 3 },
      { districtEN: "Karur", districtTA: "கரூர்", charge: 45, estimatedDays: 2 },
      { districtEN: "Krishnagiri", districtTA: "கிருஷ்ணகிரி", charge: 50, estimatedDays: 3 },
      { districtEN: "Madurai", districtTA: "மதுரை", charge: 45, estimatedDays: 2 },
      { districtEN: "Mayiladuthurai", districtTA: "மயிலாடுதுறை", charge: 40, estimatedDays: 2 },
      { districtEN: "Nagapattinam", districtTA: "நாகப்பட்டினம்", charge: 45, estimatedDays: 2 },
      { districtEN: "Namakkal", districtTA: "நாமக்கல்", charge: 45, estimatedDays: 2 },
      { districtEN: "Nilgiris", districtTA: "நீலகிரி", charge: 60, estimatedDays: 3 },
      { districtEN: "Perambalur", districtTA: "பெரம்பலூர்", charge: 45, estimatedDays: 2 },
      { districtEN: "Pudukkottai", districtTA: "புதுக்கோட்டை", charge: 45, estimatedDays: 2 },
      { districtEN: "Ramanathapuram", districtTA: "இராமநாதபுரம்", charge: 55, estimatedDays: 3 },
      { districtEN: "Ranipet", districtTA: "இராணிப்பேட்டை", charge: 35, estimatedDays: 1 },
      { districtEN: "Salem", districtTA: "சேலம்", charge: 40, estimatedDays: 2 },
      { districtEN: "Sivaganga", districtTA: "சிவகங்கை", charge: 50, estimatedDays: 2 },
      { districtEN: "Tenkasi", districtTA: "தென்காசி", charge: 55, estimatedDays: 3 },
      { districtEN: "Thanjavur", districtTA: "தஞ்சாவூர்", charge: 40, estimatedDays: 2 },
      { districtEN: "Theni", districtTA: "தேனி", charge: 50, estimatedDays: 2 },
      { districtEN: "Thoothukudi", districtTA: "தூத்துக்குடி", charge: 60, estimatedDays: 3 },
      { districtEN: "Tiruchirappalli", districtTA: "திருச்சிராப்பள்ளி", charge: 40, estimatedDays: 2 },
      { districtEN: "Tirunelveli", districtTA: "திருநெல்வேலி", charge: 55, estimatedDays: 3 },
      { districtEN: "Tirupathur", districtTA: "திருப்பத்தூர்", charge: 45, estimatedDays: 2 },
      { districtEN: "Tiruppur", districtTA: "திருப்பூர்", charge: 45, estimatedDays: 2 },
      { districtEN: "Tiruvallur", districtTA: "திருவள்ளூர்", charge: 35, estimatedDays: 1 },
      { districtEN: "Tiruvannamalai", districtTA: "திருவண்ணாமலை", charge: 40, estimatedDays: 2 },
      { districtEN: "Tiruvarur", districtTA: "திருவாரூர்", charge: 45, estimatedDays: 2 },
      { districtEN: "Vellore", districtTA: "வேலூர்", charge: 35, estimatedDays: 1 },
      { districtEN: "Viluppuram", districtTA: "விழுப்புரம்", charge: 35, estimatedDays: 1 },
      { districtEN: "Virudhunagar", districtTA: "விருதுநகர்", charge: 50, estimatedDays: 2 }
    ];
    districts.forEach((d) => {
      DeliveryCharges.create({
        districtEN: d.districtEN,
        districtTA: d.districtTA,
        charge: d.charge,
        estimatedDays: d.estimatedDays
      });
    });
  }

  // 3. Seed or update initial admin, buyer, and farmer users
  const adminHash = bcrypt.hashSync("admin123", 10);
  const buyerHash = bcrypt.hashSync("buyer123", 10);
  const farmerHash = bcrypt.hashSync("farmer123", 10);

  const existingAdmin = Users.findOne({ email: "admin@agro.com" });
  if (existingAdmin) {
    Users.findByIdAndUpdate(existingAdmin.id, { passwordHash: adminHash });
  } else {
    Users.create({
      fullName: "Tamil Agro Admin",
      age: 35,
      phoneNumber: "9876543210",
      email: "admin@agro.com",
      passwordHash: adminHash,
      fullAddress: "Green HQ, Koyambedu",
      district: "Chennai",
      pincode: "600107",
      aadhaarNumber: "123456789012",
      aadhaarPhotoUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=200",
      profilePhotoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200",
      role: "admin",
      isBlocked: false,
      createdAt: new Date().toISOString()
    });
  }

  const existingBuyer = Users.findOne({ email: "buyer@agro.com" });
  if (existingBuyer) {
    Users.findByIdAndUpdate(existingBuyer.id, { passwordHash: buyerHash });
  } else {
    const buyerUser = Users.create({
      fullName: "Kumaresan Prasad",
      age: 28,
      phoneNumber: "9898989898",
      email: "buyer@agro.com",
      passwordHash: buyerHash,
      fullAddress: "12, South Car Street",
      district: "Tiruchirappalli",
      pincode: "620002",
      aadhaarNumber: "987654321012",
      aadhaarPhotoUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=200",
      profilePhotoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
      role: "user",
      isBlocked: false,
      createdAt: new Date().toISOString()
    });

    if (!Carts.findById(buyerUser.id)) {
      Carts.create({
        id: buyerUser.id,
        items: []
      });
    }
  }

  const existingFarmer = Users.findOne({ email: "farmer@agro.com" });
  if (existingFarmer) {
    Users.findByIdAndUpdate(existingFarmer.id, { passwordHash: farmerHash });
  } else {
    Users.create({
      fullName: "Ramasamy Farmer",
      age: 46,
      phoneNumber: "9123456780",
      email: "farmer@agro.com",
      passwordHash: farmerHash,
      fullAddress: "Organic Orchard Farms",
      district: "Thanjavur",
      pincode: "613001",
      aadhaarNumber: "888877776666",
      aadhaarPhotoUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=200",
      profilePhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
      role: "seller",
      isBlocked: false,
      isApprovedSeller: true,
      createdAt: new Date().toISOString()
    });
  }

  // 4. Seed 6 Banana varieties and other default products
  if (Products.find().length === 0) {
    const defaultProducts: Omit<DBProduct, "id">[] = [
      // 1. POOVAN BANANA
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Poovan Banana (பூவன் பழம்)",
        nameTA: "பூவன் பழம் (Poovan)",
        descriptionEN: "Traditionally valued for digestive health. Naturally sweet yellow fruits grown organically in Trichy.",
        descriptionTA: "செரிமான ஆரோக்கியத்திற்கு பாரம்பரியமாக மதிப்பிடப்படுகிறது. திருச்சியில் இயற்கையான முறையில் விளையும் இனிப்பான மஞ்சள் பழங்கள்.",
        category: "banana",
        price: 60,
        availableStock: 120,
        availableStockUnitEN: "dozen(s)",
        availableStockUnitTA: "டஜன்",
        district: "Tiruchirappalli",
        images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?q=80&w=600"],
        reviews: [
          { id: "rev1", userId: "user1", userName: "Karthik Raja", rating: 5, comment: "Fresh and extremely sweet. Family loved it!", createdAt: new Date().toISOString() }
        ],
        healthBenefitsEN: "High dietary fiber, cures stomach acidity, provides rapid energy, and regulates bowel movements.",
        healthBenefitsTA: "அதிக நார்ச்சத்து கொண்டது, வயிற்று அமிலத்தன்மையை குணப்படுத்துகிறது, விரைவான ஆற்றலை அளிக்கிறது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      // 2. RASTHALI BANANA
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Rasthali Banana (ரஸ்தாளி பழம்)",
        nameTA: "ரஸ்தாளி பழம் (Rasthali)",
        descriptionEN: "Aromatic dessert banana with elegant ivory pulp. Known for its distinct flavor and rich taste.",
        descriptionTA: "நேர்த்தியான நறுமணம் கொண்ட இனிமையான பழம். தனித்துவமான சுவைக்காக அறியப்படுகிறது.",
        category: "banana",
        price: 80,
        availableStock: 80,
        availableStockUnitEN: "dozen(s)",
        availableStockUnitTA: "டஜன்",
        district: "Thanjavur",
        images: ["https://images.unsplash.com/photo-1543218024-57a70143c369?q=80&w=600"],
        reviews: [],
        healthBenefitsEN: "Contains excellent levels of potassium and Vitamin B6, making it great for brain development and nerve health.",
        healthBenefitsTA: "பொட்டாசியம் மற்றும் வைட்டமின் பி6 நிறைந்தது, மூளை வளர்ச்சி மற்றும் நரம்பு ஆரோக்கியத்திற்கு உகந்தது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      // 3. KARPOORAVALLI BANANA
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Karpooravalli Banana (கற்பூரவள்ளி)",
        nameTA: "கற்பூரவள்ளி பழம் (Karpooravalli)",
        descriptionEN: "Highly drought-resistant plant yields sweet ash-coated bananas. Packed with ancient healing goodness.",
        descriptionTA: "வறட்சியைத் தாங்கக்கூடிய பயிரில் இருந்து விளையும் சாம்பல் நிறம் கொண்ட கற்பூரவள்ளி பழங்கள். மருத்துவக் குணம் நிறைந்தது.",
        category: "banana",
        price: 70,
        availableStock: 150,
        availableStockUnitEN: "dozen(s)",
        availableStockUnitTA: "டஜன்",
        district: "Madurai",
        images: ["https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=600"],
        reviews: [],
        healthBenefitsEN: "Excellent natural coolant for the body. Relieves dry cough and is safe for diabetic individuals in small amounts.",
        healthBenefitsTA: "உடலுக்கு சிறந்த இயற்கை குளிர்ச்சி அளிக்கிறது. வறட்டு இருமலை குணப்படுத்துகிறது மற்றும் சர்க்கரை நோயாளிகளுக்கு சற்றே பாதுகாப்பானது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      // 4. NENDRAN BANANA
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Nendran Banana (நேந்திரன்)",
        nameTA: "நேந்திரன் பழம் (Nendran)",
        descriptionEN: "Premium golden fleshy bananas optimal for steaming, baby food formulations, and making crispy traditional chips.",
        descriptionTA: "குழந்தை உணவு வகைகளுக்கும், பாரம்பரிய நேந்திரன் சிப்ஸ் தயாரிப்பதற்கும் உகந்த பிரீமியம் ரக பழங்கள்.",
        category: "banana",
        price: 90,
        availableStock: 100,
        availableStockUnitEN: "kg(s)",
        availableStockUnitTA: "கிலோ",
        district: "Kanyakumari",
        images: ["https://images.unsplash.com/photo-1603052875302-d376b7c0638a?q=80&w=600"],
        reviews: [],
        healthBenefitsEN: "Rich in Vitamin A, boosts immunity, enhances muscle strength, and acts as excellent food for underweight infants.",
        healthBenefitsTA: "வைட்டமின் ஏ நிறைந்தது, நோய் எதிர்ப்பு சக்தியை அதிகரிக்கிறது, தசை வலிமையை மேம்படுத்துகிறது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      // 5. RED BANANA / SEVVAZHAI
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Red Banana / Sevvazhai (செவ்வாழை)",
        nameTA: "செவ்வாழை பழம் (Sevvazhai)",
        descriptionEN: "King of Bananas with dark reddish skin and sweet thick pulp. Highly valuable superfood grown with utmost care.",
        descriptionTA: "சிவப்பு நிற தோலும், ஊட்டச்சத்தும் நிறைந்த பழங்களின் அரசன். மிக மதிப்புமிக்க ஆரோக்கிய உணவு.",
        category: "banana",
        price: 150,
        availableStock: 60,
        availableStockUnitEN: "dozen(s)",
        availableStockUnitTA: "டஜன்",
        district: "Tirunelveli",
        images: ["https://images.unsplash.com/photo-1566393028639-d108a42c46a7?q=80&w=600"],
        reviews: [
          { id: "rev2", userId: "user2", userName: "Subramaniam P", rating: 5, comment: "Genuine Sevvazhai, big size and extremely sweet.", createdAt: new Date().toISOString() }
        ],
        healthBenefitsEN: "Improves blood hemoglobin levels, loaded with strong antioxidants, enhances skin texture and vision.",
        healthBenefitsTA: "இரத்த அணுக்களை அதிகரிக்கிறது, ஆக்ஸிஜனேற்றிகள் அதிகம், சருமப் பொலிவு மற்றும் கண் பார்வைக்கு மிகவும் உகந்தது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      // 6. HILL BANANA / VIRUPAKSHI
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Hill Banana / Virupakshi (மலை வாழை)",
        nameTA: "மலை வாழை (Virupakshi / Hill Banana)",
        descriptionEN: "Geographically indicated legendary Kodaikanal hill banana. Uniquely delicious with intense floral aroma.",
        descriptionTA: "பழனி மற்றும் கொடைக்கானல் மலைகளில் விளையும் புவிசார் குறியீடு பெற்ற பாரம்பரிய நறுமண மலை வாழை.",
        category: "banana",
        price: 200,
        availableStock: 50,
        availableStockUnitEN: "dozen(s)",
        availableStockUnitTA: "டஜன்",
        district: "Dindigul",
        images: ["https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=600"],
        reviews: [],
        healthBenefitsEN: "Extremely rich in trace minerals, maintains heart rhythms, and aids deep restorative neurological system relaxation.",
        healthBenefitsTA: "தாது உப்புக்கள் நிறைந்தது, இதய துடிப்பை சீராக்குகிறது, நரம்பு மண்டலத்தை அமைதிப்படுத்துகிறது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      // Other products from different requested categories
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Premium Cashew Nuts (முந்திரி பருப்பு)",
        nameTA: "முந்திரி பருப்பு (Cashew Nuts)",
        descriptionEN: "Whole crispy golden grade-W240 cashew nuts processed locally and hygienically in Panruti.",
        descriptionTA: "பண்ருட்டியில் உள்ளூர் முறையில் தூய்மையாக பதப்படுத்தப்பட்ட முழு பொன்னிற முந்திரி பருப்புகள்.",
        category: "cashew",
        price: 850,
        availableStock: 200,
        availableStockUnitEN: "kg(s)",
        availableStockUnitTA: "கிலோ",
        district: "Cuddalore",
        images: ["https://images.unsplash.com/photo-1508061253366-f7da158b6d46?q=80&w=600"],
        reviews: [],
        healthBenefitsEN: "Rich in healthy fats, protein, and copper for glowing skin and heart safety.",
        healthBenefitsTA: "நன்மை தரும் கொழுப்புகள், புரதம் மற்றும் செம்பு சத்து நிறைந்தது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Panruti Honey Jackfruit (பண்ருட்டி பலாப்பழம்)",
        nameTA: "முழு தேன் பலாப்பழம் (Honey Jackfruit)",
        descriptionEN: "Luscious yellow pods oozing with sugary sweetness directly from the orchards of Panruti district.",
        descriptionTA: "பண்ருட்டி தோப்புகளில் இருந்து நேரடியாக விளையும் தேன் சொட்டும் பலா சுளைகள்.",
        category: "jackfruit",
        price: 250,
        availableStock: 40,
        availableStockUnitEN: "piece(s)",
        availableStockUnitTA: "எண்ணிக்கை",
        district: "Cuddalore",
        images: ["https://images.unsplash.com/photo-1590004953392-5aba2e72269a?q=80&w=600"],
        reviews: [],
        healthBenefitsEN: "Good energy boost, high fiber content, and excellent for gut microbiota.",
        healthBenefitsTA: "உடனடி ஆற்றல் மற்றும் குடல் ஆரோக்கியத்திற்கு உகந்தது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Organic Raw Groundnuts (நிலக்கடலை)",
        nameTA: "நிலக்கடலை (Groundnuts)",
        descriptionEN: "Sun-dried organically harvested groundnut seeds sourced directly from dry lands of Namakkal.",
        descriptionTA: "நாமக்கல் வறண்ட நிலங்களில் இருந்து நேரடியாக அறுவடை செய்யப்பட்டு உலர்த்தப்பட்ட நிலக்கடலை.",
        category: "groundnuts",
        price: 140,
        availableStock: 300,
        availableStockUnitEN: "kg(s)",
        availableStockUnitTA: "கிலோ",
        district: "Namakkal",
        images: ["https://images.unsplash.com/photo-1568254183919-78a4f43a2877?q=80&w=600"],
        reviews: [],
        healthBenefitsEN: "Packed with plant proteins, resveratrol, and healthy minerals.",
        healthBenefitsTA: "தாவர புரதங்கள் மற்றும் அத்தியாவசிய தாதுக்கள் நிறைந்தது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Fresh Ooty Carrots (ஊட்டி கேரட்)",
        nameTA: "ஊட்டி கேரட் (Ooty Carrots)",
        descriptionEN: "Crisp and deeply orange carrots handpicked from Nilgiris terrace slopes. Ultra fresh quality.",
        descriptionTA: "நீலகிரி மலை அடுக்குகளில் இருந்து பறிக்கப்பட்ட புதிய மற்றும் மொறுமொறுப்பான கேரட்டுகள்.",
        category: "vegetables",
        price: 60,
        availableStock: 400,
        availableStockUnitEN: "kg(s)",
        availableStockUnitTA: "கிலோ",
        district: "Nilgiris",
        images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600"],
        reviews: [],
        healthBenefitsEN: "Tremendous load of Beta-carotene for supreme eye health and immune functionality.",
        healthBenefitsTA: "கண் பார்வைக்கு உகந்த பீட்டா கரோட்டின் நிறைந்தது.",
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      },
      {
        sellerId: "admin",
        sellerName: "Tamil Agro Mart",
        nameEN: "Erode Pure Turmeric Powder (ஈரோடு மஞ்சள் தூள்)",
        nameTA: "ஈரோடு தூய மஞ்சள் தூள் (Pure Turmeric)",
        descriptionEN: "GI-tagged world-renowned antiseptic agricultural turmeric processed naturally.",
        descriptionTA: "உலகப் புகழ்பெற்ற ஈரோடு புவிசார் குறியீடு பெற்ற உயர்தர தூய மஞ்சள் தூள்.",
        category: "local_products",
        price: 240,
        availableStock: 150,
        availableStockUnitEN: "kg(s)",
        availableStockUnitTA: "கிலோ",
        district: "Erode",
        images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=600"],
        reviews: [],
        deliveryAvailability: true,
        createdAt: new Date().toISOString()
      }
    ];

    defaultProducts.forEach((prod) => {
      Products.create(prod);
    });
  }
}
