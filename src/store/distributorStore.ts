import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Bundle, DistributorPaymentAccount } from '../types';
import productsData from '../data/products.json';
import bundlesData from '../data/bundles.json';
import { EDMARK_KNOWLEDGE_BASE } from '../data/edmarkKnowledgeBase';
import { DownlineLeg } from '../data/edmarkMaintenancePlaybook';

export interface DistributorProfile {
  id: string;
  name: string;
  phone: string;
  whatsappDigits: string;
  lipaNumber?: string;
  paymentAccounts?: DistributorPaymentAccount[];
  email: string;
  slug: string;
  rank: string;
  city: string;
  bio?: string;
  isVerified?: boolean;
  isCentral?: boolean;
  status?: 'active' | 'suspended';
  avatarUrl?: string;
  rating?: number;
  reviewCount?: number;
  deliveryCoverage?: string;
  experienceYears?: string;
}

export interface AttributionRecord {
  slug: string;
  distributorId: string;
  distributorName: string;
  city: string;
  assignedAt: number;
  expiresAt: number;
}

export const CENTRAL_COMPANY_HUB: DistributorProfile = {
  id: 'central-head-office',
  name: 'ED Retail Tanzania (Head Office)',
  phone: '+255 783 481 416',
  whatsappDigits: '255783481416',
  lipaNumber: 'Lipa Namba: 543210 (Central Dispatch / ED Retail TZ)',
  paymentAccounts: [
    {
      id: 'acc-central-mpesa',
      network: 'mpesa',
      networkName: 'Vodacom M-Pesa',
      accountType: 'till',
      accountTypeName: 'Lipa Kwa Simu (Till)',
      accountNumber: '543210',
      accountName: 'ED Retail Central Hub',
      isDefault: true,
    },
    {
      id: 'acc-central-tigo',
      network: 'tigopesa',
      networkName: 'Tigo Pesa (Mixx by Yas)',
      accountType: 'till',
      accountTypeName: 'Lipa Namba (Till)',
      accountNumber: '543211',
      accountName: 'ED Retail Central Hub',
    },
    {
      id: 'acc-central-airtel',
      network: 'airtel',
      networkName: 'Airtel Money',
      accountType: 'till',
      accountTypeName: 'Lipa Merchant',
      accountNumber: '543212',
      accountName: 'ED Retail Central Hub',
    },
  ],
  email: 'support@edretail.tz',
  slug: 'central',
  rank: 'Authorized Central Distribution Network',
  city: 'Tanzania (National Dispatch Desk)',
  bio: 'Kitovu Kikuu cha Usambazaji wa Bidhaa Halisi za Edmark Tanzania. Tunaratibu uwasilishaji wa haraka nchi nzima na kukuunganisha na viongozi wasambazaji waliothibitishwa.',
  isVerified: true,
  isCentral: true,
  avatarUrl: '/logo/distributor-circle.png',
  rating: 4.98,
  reviewCount: 412,
  deliveryCoverage: 'Mikoa Yote ya Tanzania & Zanzibar (Masaa 24-48)',
};

export const DEFAULT_DISTRIBUTOR: DistributorProfile = {
  id: 'dist-mwanahamisi-01',
  name: 'Mwanahamisi Lissu',
  phone: '+255 783 481 416',
  whatsappDigits: '255783481416',
  lipaNumber: 'Lipa Namba: 543210 (M-Pesa / Tigo Pesa)',
  paymentAccounts: [
    {
      id: 'acc-mwana-mpesa',
      network: 'mpesa',
      networkName: 'Vodacom M-Pesa',
      accountType: 'till',
      accountTypeName: 'Lipa Kwa Simu (Buy Goods)',
      accountNumber: '543210',
      accountName: 'Mwanahamisi Lissu (ED Retail)',
      isDefault: true,
    },
    {
      id: 'acc-mwana-tigo',
      network: 'tigopesa',
      networkName: 'Tigo Pesa (Mixx by Yas)',
      accountType: 'till',
      accountTypeName: 'Lipa Namba (Till)',
      accountNumber: '632190',
      accountName: 'Mwanahamisi Lissu',
    },
    {
      id: 'acc-mwana-airtel',
      network: 'airtel',
      networkName: 'Airtel Money',
      accountType: 'phone',
      accountTypeName: 'Namba ya Simu',
      accountNumber: '0783481416',
      accountName: 'Mwanahamisi Lissu',
    },
  ],
  email: 'mwanahamisi@edretail.tz',
  slug: 'mwanahamisi',
  rank: 'Crown Manager & Wellness Coach',
  city: 'Dar es Salaam',
  bio: 'Msambazaji Rasmi wa Edmark Tanzania mwenye uzoefu wa zaidi ya miaka 8 katika afya ya asili, uondoaji wa kitambi na mifumo ya P4 Slimming.',
  isVerified: true,
  avatarUrl: '/logo/distributor-circle.png',
  rating: 4.95,
  reviewCount: 184,
  deliveryCoverage: 'Dar es Salaam (Ndani ya masaa 2) & Mikoani kote',
};

export const INITIAL_DISTRIBUTORS_REGISTRY: DistributorProfile[] = [
  CENTRAL_COMPANY_HUB,
  DEFAULT_DISTRIBUTOR,
  {
    id: 'dist-fatuma-02',
    name: 'Fatuma Kassim',
    phone: '+255 714 882 109',
    whatsappDigits: '255714882109',
    lipaNumber: 'Lipa Namba: 882109 (Airtel Money)',
    paymentAccounts: [
      {
        id: 'acc-fatuma-airtel',
        network: 'airtel',
        networkName: 'Airtel Money',
        accountType: 'till',
        accountTypeName: 'Lipa Merchant',
        accountNumber: '882109',
        accountName: 'Fatuma Kassim (Edmark Arusha)',
        isDefault: true,
      },
      {
        id: 'acc-fatuma-mpesa',
        network: 'mpesa',
        networkName: 'Vodacom M-Pesa',
        accountType: 'phone',
        accountTypeName: 'Namba ya Simu / Send Money',
        accountNumber: '0714882109',
        accountName: 'Fatuma Kassim',
      },
    ],
    email: 'fatuma.edmark@gmail.com',
    slug: 'fatuma',
    rank: 'Diamond Star Distributor',
    city: 'Arusha & Moshi',
    bio: 'Kiongozi wa Edmark Kanda ya Kaskazini. Mshauri mkuu wa afya ya usagaji chakula, vidonda vya tumbo na urembo asilia.',
    isVerified: true,
    avatarUrl: '/logo/distributor-circle.png',
    rating: 4.92,
    reviewCount: 96,
    deliveryCoverage: 'Arusha Mjini, Moshi, Kilimanjaro & Manyara',
  },
  {
    id: 'dist-juma-03',
    name: 'Juma Rashid',
    phone: '+255 755 930 114',
    whatsappDigits: '255755930114',
    lipaNumber: 'Lipa Namba: 930114 (Vodacom M-Pesa)',
    paymentAccounts: [
      {
        id: 'acc-juma-mpesa',
        network: 'mpesa',
        networkName: 'Vodacom M-Pesa',
        accountType: 'till',
        accountTypeName: 'Lipa Kwa Simu (Till)',
        accountNumber: '930114',
        accountName: 'Juma Rashid (Edmark Mwanza)',
        isDefault: true,
      },
      {
        id: 'acc-juma-tigo',
        network: 'tigopesa',
        networkName: 'Tigo Pesa (Mixx by Yas)',
        accountType: 'phone',
        accountTypeName: 'Namba ya Simu',
        accountNumber: '0755930114',
        accountName: 'Juma Rashid',
      },
    ],
    email: 'juma.edmark.mwanza@gmail.com',
    slug: 'juma',
    rank: 'Emerald Manager',
    city: 'Mwanza & Kanda ya Ziwa',
    bio: 'Mratibu mkuu wa bidhaa za Edmark Kanda ya Ziwa. Bingwa wa miongozo ya Shake Off na Splina kwa wateja wapya.',
    isVerified: true,
    avatarUrl: '/logo/distributor-circle.png',
    rating: 4.89,
    reviewCount: 78,
    deliveryCoverage: 'Mwanza, Geita, Shinyanga, Kagera & Mara',
  },
  {
    id: 'dist-grace-04',
    name: 'Grace Kimaro',
    phone: '+255 762 441 890',
    whatsappDigits: '255762441890',
    lipaNumber: 'Lipa Namba: 441890 (Tigo Pesa)',
    paymentAccounts: [
      {
        id: 'acc-grace-tigo',
        network: 'tigopesa',
        networkName: 'Tigo Pesa (Mixx by Yas)',
        accountType: 'till',
        accountTypeName: 'Lipa Namba (Till)',
        accountNumber: '441890',
        accountName: 'Grace Kimaro (Edmark Dodoma)',
        isDefault: true,
      },
      {
        id: 'acc-grace-airtel',
        network: 'airtel',
        networkName: 'Airtel Money',
        accountType: 'phone',
        accountTypeName: 'Namba ya Simu',
        accountNumber: '0762441890',
        accountName: 'Grace Kimaro',
      },
    ],
    email: 'grace.edmark.dodoma@gmail.com',
    slug: 'grace',
    rank: 'Ruby Distributor & Nutritionist',
    city: 'Dodoma (Makao Makuu)',
    bio: 'Mshauri wa lishe na vinywaji tiba vya Edmark. Mtaalamu wa Cafe Troika, Ginseng na CoCollagen.',
    isVerified: true,
    avatarUrl: '/logo/distributor-circle.png',
    rating: 4.94,
    reviewCount: 62,
    deliveryCoverage: 'Dodoma Mjini, Singida & Iringa',
  },
];

export interface OfflineSaleRecord {
  id: string;
  source?: 'field' | 'web_whatsapp';
  itemsSummary?: string;
  customerName: string;
  customerPhone: string;
  customerLocation: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentType: 'cash' | 'credit' | 'mobile_money';
  amountPaid: number;
  balanceDue: number;
  dueDate?: string; // YYYY-MM-DD
  status: 'paid' | 'partial' | 'unpaid';
  createdAt: string; // ISO String
  notes?: string;
  refillFollowUpDate?: string; // e.g. 10-14 days after purchase
  refillStatus: 'pending' | 'followed_up' | 'reordered' | 'dismissed';
}

export interface BusinessTask {
  id: string;
  title: string;
  category: 'refill' | 'debt_collection' | 'bom_meeting' | 'restock' | 'maintenance' | 'general';
  dueDate: string;
  completed: boolean;
  relatedSaleId?: string;
  customerPhone?: string;
  customerName?: string;
  amount?: number;
}

export interface DynamicProductOverride {
  price?: number;
  inStock?: boolean;
  hidden?: boolean;
  customBadge?: string;
}

export interface MonthlyChallengeRecord {
  monthIndex: 1 | 2 | 3;
  monthName: string;
  targetSv: number;
  achievedSv: number;
  status: 'completed' | 'current' | 'upcoming';
  dateCompleted?: string;
}

interface DistributorStoreState {
  // Authentication & Multi-Distributor Profiles
  isAdminAuthenticated: boolean;
  adminPin: string; // default "255" or "1234"
  currentProfile: DistributorProfile;
  activeRefSlug: string | null;
  attribution: AttributionRecord | null;
  savedDistributors: DistributorProfile[];

  // Super Admin Role & State
  isSuperAdminAuthenticated: boolean;
  superAdminUser: { id: string; email: string; name: string } | null;
  loginSuperAdmin: (emailOrKey: string, passOrPin: string) => boolean;
  logoutSuperAdmin: () => void;

  setAdminAuthenticated: (auth: boolean) => void;
  verifyPin: (pin: string) => boolean;
  changePin: (newPin: string) => void;
  loginWithEmail: (email: string, pass: string) => boolean;
  loginWithGoogle: (email?: string, name?: string) => DistributorProfile;
  loginWithApple: (email?: string, name?: string) => DistributorProfile;
  registerNewDistributor: (profile: Omit<DistributorProfile, 'id'>, pass?: string) => DistributorProfile;
  switchDistributorProfile: (distId: string) => void;
  logoutDistributor: () => void;
  updateCurrentProfile: (updates: Partial<DistributorProfile>) => void;
  setActiveRefSlug: (slug: string | null) => void;
  setAttributedDistributor: (slug: string, days?: number) => void;
  clearAttribution: () => void;
  isAttributedToDistributor: () => boolean;
  getAttributionExpiryDays: () => number;
  getCertifiedDistributorsList: () => DistributorProfile[];
  getActiveDistributor: () => DistributorProfile;

  // Master Catalog (Super Admin) & Distributor-Scoped Custom Products
  masterProducts: Product[];
  addMasterProduct: (product: Product) => void;
  updateMasterProduct: (id: string, updates: Partial<Product>) => void;
  deleteMasterProduct: (id: string) => void;

  customProductsByDistributor: Record<string, Product[]>;
  addDistributorCustomProduct: (product: Product) => void;
  updateDistributorCustomProduct: (productId: string, updates: Partial<Product>) => void;
  deleteDistributorCustomProduct: (productId: string) => void;

  // Super Admin Distributor Oversight & Verification
  toggleDistributorVerification: (distId: string) => void;
  toggleDistributorStatus: (distId: string, status: 'active' | 'suspended') => void;
  updateDistributorProfileAdmin: (distId: string, updates: Partial<DistributorProfile>) => void;
  addDistributorAdmin: (distributor: DistributorProfile) => void;
  deleteDistributorAdmin: (distId: string) => void;

  // Platform Settings & Master Logistics
  platformSettings: {
    maintenanceMode: boolean;
    broadcastNotice: string;
    nationalCommission: number;
    contactEmail: string;
    emergencyPhone: string;
    darExpressFee: number;
    upcountryBusFee: number;
    zanzibarFerryFee: number;
  };
  updatePlatformSettings: (updates: Partial<{
    maintenanceMode: boolean;
    broadcastNotice: string;
    nationalCommission: number;
    contactEmail: string;
    emergencyPhone: string;
    darExpressFee: number;
    upcountryBusFee: number;
    zanzibarFerryFee: number;
  }>) => void;

  // Catalog live overrides
  productOverrides: Record<string, DynamicProductOverride>;
  distributorOverrides: Record<string, Record<string, DynamicProductOverride>>;
  updateProductPrice: (productId: string, newPrice: number) => void;
  toggleProductStock: (productId: string, inStock: boolean) => void;
  toggleProductVisibility: (productId: string, hidden: boolean) => void;
  resetProductOverrides: () => void;
  getEffectiveProducts: () => Product[];
  getEffectiveProduct: (productId: string) => Product | undefined;
  getEffectiveBundles: () => {
    id: string;
    name: import('../types').I18nString;
    description: import('../types').I18nString;
    productIds: string[];
    discountPercent: number;
    originalPrice: number;
    bundlePrice: number;
    priceUsd: number;
  }[];

  // Offline sales ledger
  sales: OfflineSaleRecord[];
  addSale: (sale: Omit<OfflineSaleRecord, 'id' | 'createdAt' | 'refillStatus'>) => OfflineSaleRecord;
  addWebOrder: (order: {
    customerName: string;
    customerPhone: string;
    customerLocation: string;
    items: Array<{ id: string; name: string | { en: string; sw: string }; price: number; quantity: number }>;
    totalAmount: number;
    notes?: string;
  }) => OfflineSaleRecord[];
  markDebtPaid: (saleId: string, amount: number) => void;
  updateRefillStatus: (saleId: string, status: OfflineSaleRecord['refillStatus']) => void;
  deleteSale: (saleId: string) => void;

  // Business tasks & reminders
  tasks: BusinessTask[];
  addTask: (task: Omit<BusinessTask, 'id' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  // Maintenance & 3-Month Fund Challenge Tracker
  targetFund: 'car' | 'house' | 'travel' | 'manager';
  setTargetFund: (fund: 'car' | 'house' | 'travel' | 'manager') => void;
  consecutiveMonthsRecord: MonthlyChallengeRecord[];
  currentMonthBaseGroupSv: number; // Base downline group SV outside direct app sales
  currentMonthPersonalSv: number; // Direct personal SV
  downlineLegs: DownlineLeg[];
  updateDownlineLegSv: (legId: string, newSv: number) => void;
  setBaseGroupSv: (sv: number) => void;
  setPersonalSv: (sv: number) => void;
  completeMonthChallenge: (monthIndex: 1 | 2 | 3) => void;
  resetChallengeStreak: () => void;

  getMaintenanceAnalysis: () => {
    targetSv: number;
    personalTargetSv: number;
    personalCurrentSv: number;
    groupCurrentSv: number;
    totalSv: number;
    gapSv: number;
    percentComplete: number;
    daysRemaining: number;
    dailyPacingSv: number;
    paceStatus: 'ahead' | 'on_track' | 'needs_attention' | 'critical';
    p4KitsNeeded: number;
    shakeOffBoxesNeeded: number;
    splinaBottlesNeeded: number;
    activeLegsCount: number;
    currentMonthIndex: 1 | 2 | 3;
    fundName: string;
  };

  // Financial calculations
  getFinancialSummary: (timeframe?: 'today' | 'week' | 'month' | 'all') => {
    totalRevenue: number;
    cashCollected: number;
    creditOutstanding: number;
    estimatedWholesaleCost: number;
    estimatedNetProfit: number;
    totalSvPoints: number;
    totalBvPoints: number;
    totalUnitsSold: number;
    topSellingProducts: { name: string; count: number; revenue: number }[];
    overdueDebtsCount: number;
    pendingRefillsCount: number;
  };
}

export const useDistributorStore = create<DistributorStoreState>()(
  persist(
    (set, get) => ({
      isAdminAuthenticated: false,
      adminPin: '255', // Default distributor PIN
      currentProfile: CENTRAL_COMPANY_HUB,
      activeRefSlug: null,
      attribution: null,
      savedDistributors: INITIAL_DISTRIBUTORS_REGISTRY,

      // Super Admin Role & State
      isSuperAdminAuthenticated: false,
      superAdminUser: null,

      loginSuperAdmin: (emailOrKey: string, passOrPin: string) => {
        const cleanEmail = emailOrKey.trim().toLowerCase();
        const cleanPass = passOrPin.trim();
        if (
          (cleanEmail === 'admin@edretail.com' || cleanEmail === 'admin@edretail.tz' || cleanEmail === 'superadmin' || cleanEmail === 'admin') &&
          (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === '255' || cleanPass === '1234')
        ) {
          set({
            isSuperAdminAuthenticated: true,
            superAdminUser: {
              id: 'super-admin-01',
              email: cleanEmail.includes('@') ? cleanEmail : 'admin@edretail.tz',
              name: 'Super Administrator',
            },
          });
          return true;
        }
        return false;
      },

      logoutSuperAdmin: () => {
        set({
          isSuperAdminAuthenticated: false,
          superAdminUser: null,
        });
      },

      setAdminAuthenticated: (auth) => set({ isAdminAuthenticated: auth }),

      verifyPin: (pin) => {
        const clean = pin.trim();
        const state = get();
        if (clean === state.adminPin || clean === '255' || clean === '1234') {
          set({ isAdminAuthenticated: true });
          return true;
        }
        return false;
      },

      changePin: (newPin) => set({ adminPin: newPin.trim() }),

      loginWithEmail: (email, pass) => {
        const state = get();
        const cleanEmail = email.trim().toLowerCase();
        const found = state.savedDistributors.find((d) => d.email.toLowerCase() === cleanEmail);
        if (found) {
          set({
            currentProfile: found,
            isAdminAuthenticated: true,
            activeRefSlug: found.slug,
          });
          return true;
        }
        // If not in saved list but has valid email format, auto-provision
        if (cleanEmail.includes('@') && pass.length >= 4) {
          const namePart = cleanEmail.split('@')[0];
          const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          const autoProfile: DistributorProfile = {
            id: 'dist-' + Date.now(),
            name: `${capitalized} (Distributor)`,
            phone: '+255 754 ' + Math.floor(100000 + Math.random() * 900000),
            whatsappDigits: '255754' + Math.floor(100000 + Math.random() * 900000),
            email: cleanEmail,
            slug: namePart.toLowerCase().replace(/[^a-z0-9]/g, ''),
            rank: 'Senior Distributor',
            city: 'Dar es Salaam',
            isVerified: true,
            avatarUrl: '/logo/distributor-circle.png',
            rating: 4.9,
            reviewCount: 15,
            deliveryCoverage: 'Dar es Salaam & Mikoani kote',
          };
          set({
            currentProfile: autoProfile,
            savedDistributors: [...state.savedDistributors, autoProfile],
            isAdminAuthenticated: true,
            activeRefSlug: autoProfile.slug,
          });
          return true;
        }
        return false;
      },

      loginWithGoogle: (email = 'distributor.edmark@gmail.com', name = 'Authorized Distributor') => {
        const state = get();
        const cleanEmail = email.trim().toLowerCase();
        const found = state.savedDistributors.find((d) => d.email.toLowerCase() === cleanEmail);
        if (found) {
          set({
            currentProfile: found,
            isAdminAuthenticated: true,
            activeRefSlug: found.slug,
          });
          return found;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'distributor';
        const newDist: DistributorProfile = {
          id: 'dist-' + Date.now(),
          name: name,
          phone: '+255 712 345 678',
          whatsappDigits: '255712345678',
          lipaNumber: 'Lipa Namba: ' + Math.floor(100000 + Math.random() * 900000),
          email: cleanEmail,
          slug: slug,
          rank: 'Manager & Wellness Consultant',
          city: 'Dar es Salaam',
          isVerified: true,
          avatarUrl: '/logo/distributor-circle.png',
          rating: 4.95,
          reviewCount: 28,
          deliveryCoverage: 'Dar es Salaam & Mikoani kote',
          bio: `Msambazaji Rasmi wa Edmark Tanzania. Wasiliana nami kupata ushauri wa kitaalamu wa bidhaa asilia za afya na uwasilishaji wa haraka.`,
        };
        set({
          currentProfile: newDist,
          savedDistributors: [...state.savedDistributors, newDist],
          isAdminAuthenticated: true,
          activeRefSlug: newDist.slug,
        });
        return newDist;
      },

      loginWithApple: (email = 'distributor.apple@edretail.tz', name = 'Apple Authorized Distributor') => {
        const state = get();
        const cleanEmail = email.trim().toLowerCase();
        const found = state.savedDistributors.find((d) => d.email.toLowerCase() === cleanEmail);
        if (found) {
          set({
            currentProfile: found,
            isAdminAuthenticated: true,
            activeRefSlug: found.slug,
          });
          return found;
        }
        const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'distributor';
        const newDist: DistributorProfile = {
          id: 'dist-' + Date.now(),
          name: name,
          phone: '+255 712 345 679',
          whatsappDigits: '255712345679',
          lipaNumber: 'Lipa Namba: ' + Math.floor(100000 + Math.random() * 900000),
          email: cleanEmail,
          slug: slug,
          rank: 'Manager & Wellness Consultant',
          city: 'Dar es Salaam',
          isVerified: true,
          avatarUrl: '/logo/distributor-circle.png',
          rating: 4.95,
          reviewCount: 12,
          deliveryCoverage: 'Dar es Salaam & Mikoani kote',
          bio: `Msambazaji Rasmi wa Edmark Tanzania. Wasiliana nami kupata ushauri wa kitaalamu wa bidhaa asilia za afya na uwasilishaji wa haraka.`,
        };
        set({
          currentProfile: newDist,
          savedDistributors: [...state.savedDistributors, newDist],
          isAdminAuthenticated: true,
          activeRefSlug: newDist.slug,
        });
        return newDist;
      },

      registerNewDistributor: (profileData, _pass) => {
        const state = get();
        const cleanSlug = (profileData.slug || profileData.name)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        const newDist: DistributorProfile = {
          ...profileData,
          id: 'dist-' + Date.now(),
          slug: cleanSlug || 'dist' + Date.now().toString().slice(-4),
          isVerified: true,
          avatarUrl: profileData.avatarUrl || '/logo/distributor-circle.png',
          rating: 5.0,
          reviewCount: 1,
          deliveryCoverage: profileData.city ? `${profileData.city} & Mikoani kote` : 'Tanzania Nzima',
        };
        const updatedList = [
          ...state.savedDistributors.filter((d) => d.email !== newDist.email && d.slug !== newDist.slug),
          newDist,
        ];
        set({
          currentProfile: newDist,
          savedDistributors: updatedList,
          isAdminAuthenticated: true,
          activeRefSlug: newDist.slug,
        });
        get().setAttributedDistributor(newDist.slug, 30);
        return newDist;
      },

      switchDistributorProfile: (distId: string) => {
        const state = get();
        const target = state.savedDistributors.find((d) => d.id === distId);
        if (target) {
          set({
            currentProfile: target,
            activeRefSlug: target.slug,
            isAdminAuthenticated: true,
          });
          get().setAttributedDistributor(target.slug, 30);
        }
      },

      logoutDistributor: () => {
        set({
          isAdminAuthenticated: false,
          currentProfile: CENTRAL_COMPANY_HUB,
          activeRefSlug: null,
          attribution: null,
        });
        try {
          localStorage.removeItem('edretail_distributor_ref');
          sessionStorage.removeItem('edretail_distributor_ref');
          localStorage.removeItem('edmark_attributed_slug');
          localStorage.removeItem('edmark_distributor_session');
          // If URL contains referral params or @slug, clean the browser history cleanly
          if (window.location.pathname.includes('/@') || window.location.search.includes('ref=')) {
            window.history.replaceState({}, document.title, window.location.pathname.replace(/\/@[a-zA-Z0-9_-]+/g, ''));
          }
        } catch {
          // ignore in server context
        }
      },

      updateCurrentProfile: (updates) => {
        set((state) => {
          const updated = { ...state.currentProfile, ...updates };
          const updatedList = state.savedDistributors.map((d) =>
            d.id === updated.id ? updated : d
          );
          return {
            currentProfile: updated,
            savedDistributors: updatedList,
          };
        });
      },

      setActiveRefSlug: (slug) => {
        set({ activeRefSlug: slug });
        if (slug) {
          get().setAttributedDistributor(slug, 30);
        }
      },

      setAttributedDistributor: (slug: string, days = 30) => {
        const state = get();
        const cleanSlug = slug.toLowerCase().replace(/^@/, '').trim();
        const found = state.savedDistributors.find((d) => d.slug.toLowerCase() === cleanSlug);
        if (found && !found.isCentral) {
          const assignedAt = Date.now();
          const expiresAt = assignedAt + days * 24 * 60 * 60 * 1000;
          set({
            attribution: {
              slug: found.slug,
              distributorId: found.id,
              distributorName: found.name,
              city: found.city,
              assignedAt,
              expiresAt,
            },
            activeRefSlug: found.slug,
          });
        }
      },

      clearAttribution: () => {
        set({
          attribution: null,
          activeRefSlug: null,
        });
      },

      isAttributedToDistributor: () => {
        const state = get();
        const active = state.getActiveDistributor();
        return !active.isCentral;
      },

      getAttributionExpiryDays: () => {
        const state = get();
        if (!state.attribution) return 0;
        const remainingMs = state.attribution.expiresAt - Date.now();
        if (remainingMs <= 0) return 0;
        return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      },

      getCertifiedDistributorsList: () => {
        const state = get();
        return state.savedDistributors.filter((d) => !d.isCentral);
      },

      getActiveDistributor: () => {
        const state = get();

        // 1. Check explicit URL slug parameter (e.g. /@mwanahamisi or ?ref=mwanahamisi)
        if (state.activeRefSlug) {
          const cleanSlug = state.activeRefSlug.toLowerCase().replace(/^@/, '').trim();
          const match = state.savedDistributors.find(
            (d) => d.slug.toLowerCase() === cleanSlug
          );
          if (match) return match;
        }

        // 2. Check stored 30-day attribution
        if (state.attribution && state.attribution.expiresAt > Date.now()) {
          const attrMatch = state.savedDistributors.find(
            (d) => d.slug.toLowerCase() === state.attribution?.slug.toLowerCase()
          );
          if (attrMatch) return attrMatch;
        }

        // 3. If distributor is actively logged in, show their profile
        if (state.isAdminAuthenticated && state.currentProfile && !state.currentProfile.isCentral) {
          return state.currentProfile;
        }

        // 4. Default to Official Central Head Office / Network Hub
        return CENTRAL_COMPANY_HUB;
      },

      // Master Catalog (Super Admin) & Distributor-Scoped Custom Products
      masterProducts: (productsData as unknown) as Product[],
      addMasterProduct: (product: Product) => {
        set((state) => ({
          masterProducts: [...state.masterProducts.filter((p) => p.id !== product.id), product],
        }));
      },
      updateMasterProduct: (id: string, updates: Partial<Product>) => {
        set((state) => ({
          masterProducts: state.masterProducts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },
      deleteMasterProduct: (id: string) => {
        set((state) => ({
          masterProducts: state.masterProducts.filter((p) => p.id !== id),
        }));
      },

      customProductsByDistributor: {},
      addDistributorCustomProduct: (product: Product) => {
        set((state) => {
          const distId = state.currentProfile?.id || 'central-hq';
          const currentList = state.customProductsByDistributor[distId] || [];
          return {
            customProductsByDistributor: {
              ...state.customProductsByDistributor,
              [distId]: [...currentList.filter((p) => p.id !== product.id), product],
            },
          };
        });
      },
      updateDistributorCustomProduct: (productId: string, updates: Partial<Product>) => {
        set((state) => {
          const distId = state.currentProfile?.id || 'central-hq';
          const currentList = state.customProductsByDistributor[distId] || [];
          return {
            customProductsByDistributor: {
              ...state.customProductsByDistributor,
              [distId]: currentList.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
            },
          };
        });
      },
      deleteDistributorCustomProduct: (productId: string) => {
        set((state) => {
          const distId = state.currentProfile?.id || 'central-hq';
          const currentList = state.customProductsByDistributor[distId] || [];
          return {
            customProductsByDistributor: {
              ...state.customProductsByDistributor,
              [distId]: currentList.filter((p) => p.id !== productId),
            },
          };
        });
      },

      // Super Admin Distributor Oversight & Verification
      toggleDistributorVerification: (distId: string) => {
        set((state) => ({
          savedDistributors: state.savedDistributors.map((d) =>
            d.id === distId ? { ...d, isVerified: !d.isVerified } : d
          ),
          currentProfile:
            state.currentProfile.id === distId
              ? { ...state.currentProfile, isVerified: !state.currentProfile.isVerified }
              : state.currentProfile,
        }));
      },
      toggleDistributorStatus: (distId: string, status: 'active' | 'suspended') => {
        set((state) => ({
          savedDistributors: state.savedDistributors.map((d) =>
            d.id === distId ? { ...d, status } : d
          ),
          currentProfile:
            state.currentProfile.id === distId
              ? { ...state.currentProfile, status }
              : state.currentProfile,
        }));
      },
      updateDistributorProfileAdmin: (distId: string, updates: Partial<DistributorProfile>) => {
        set((state) => ({
          savedDistributors: state.savedDistributors.map((d) =>
            d.id === distId ? { ...d, ...updates } : d
          ),
          currentProfile:
            state.currentProfile.id === distId
              ? { ...state.currentProfile, ...updates }
              : state.currentProfile,
        }));
      },
      addDistributorAdmin: (distributor: DistributorProfile) => {
        set((state) => ({
          savedDistributors: [
            ...state.savedDistributors.filter((d) => d.id !== distributor.id && d.slug !== distributor.slug),
            distributor,
          ],
        }));
      },
      deleteDistributorAdmin: (distId: string) => {
        set((state) => ({
          savedDistributors: state.savedDistributors.filter((d) => d.id !== distId),
        }));
      },

      // Platform Settings & Master Logistics
      platformSettings: {
        maintenanceMode: false,
        broadcastNotice: '',
        nationalCommission: 15,
        contactEmail: 'support@edretail.tz',
        emergencyPhone: '+255 783 481 416',
        darExpressFee: 3000,
        upcountryBusFee: 10000,
        zanzibarFerryFee: 8000,
      },
      updatePlatformSettings: (updates) => {
        set((state) => ({
          platformSettings: {
            ...state.platformSettings,
            ...updates,
          },
        }));
      },

      productOverrides: {},
      distributorOverrides: {},

      updateProductPrice: (productId, newPrice) =>
        set((state) => {
          const distId = state.currentProfile?.id || 'central-hq';
          const currentDistOverrides = state.distributorOverrides[distId] || {};
          return {
            productOverrides: {
              ...state.productOverrides,
              [productId]: {
                ...state.productOverrides[productId],
                price: Math.max(0, newPrice),
              },
            },
            distributorOverrides: {
              ...state.distributorOverrides,
              [distId]: {
                ...currentDistOverrides,
                [productId]: {
                  ...currentDistOverrides[productId],
                  price: Math.max(0, newPrice),
                },
              },
            },
          };
        }),

      toggleProductStock: (productId, inStock) =>
        set((state) => {
          const distId = state.currentProfile?.id || 'central-hq';
          const currentDistOverrides = state.distributorOverrides[distId] || {};
          return {
            productOverrides: {
              ...state.productOverrides,
              [productId]: {
                ...state.productOverrides[productId],
                inStock,
              },
            },
            distributorOverrides: {
              ...state.distributorOverrides,
              [distId]: {
                ...currentDistOverrides,
                [productId]: {
                  ...currentDistOverrides[productId],
                  inStock,
                },
              },
            },
          };
        }),

      toggleProductVisibility: (productId, hidden) =>
        set((state) => {
          const distId = state.currentProfile?.id || 'central-hq';
          const currentDistOverrides = state.distributorOverrides[distId] || {};
          return {
            productOverrides: {
              ...state.productOverrides,
              [productId]: {
                ...state.productOverrides[productId],
                hidden,
              },
            },
            distributorOverrides: {
              ...state.distributorOverrides,
              [distId]: {
                ...currentDistOverrides,
                [productId]: {
                  ...currentDistOverrides[productId],
                  hidden,
                },
              },
            },
          };
        }),

      resetProductOverrides: () =>
        set((state) => {
          const distId = state.currentProfile?.id || 'central-hq';
          const newDistOverrides = { ...state.distributorOverrides };
          delete newDistOverrides[distId];
          return {
            productOverrides: {},
            distributorOverrides: newDistOverrides,
          };
        }),

      getEffectiveProducts: () => {
        const state = get();
        const activeDistributor = state.getActiveDistributor();
        const distId = activeDistributor?.id || state.currentProfile?.id || 'central-hq';
        const distScoped = state.distributorOverrides?.[distId] || {};
        const baseProducts = (state.masterProducts && state.masterProducts.length > 0)
          ? state.masterProducts
          : ((productsData as unknown) as Product[]);
        const customProducts = (distId && state.customProductsByDistributor?.[distId]) || [];
        const allProducts = [...baseProducts, ...customProducts];

        return allProducts
          .map((p) => {
            const override = distScoped[p.id] || state.productOverrides[p.id];
            if (!override) return p;
            return {
              ...p,
              price: override.price !== undefined ? override.price : p.price,
              inStock: override.inStock !== undefined ? override.inStock : p.inStock,
              badge: override.customBadge !== undefined ? override.customBadge : p.badge,
            };
          })
          .filter((p) => {
            const override = distScoped[p.id] || state.productOverrides[p.id];
            return !override?.hidden;
          });
      },

      getEffectiveProduct: (productId: string) => {
        const state = get();
        const effectiveList = state.getEffectiveProducts();
        return effectiveList.find((p) => p.id === productId);
      },

      getEffectiveBundles: () => {
        const state = get();
        const liveProducts = state.getEffectiveProducts();
        const bundles = (bundlesData as unknown) as Bundle[];

        return bundles.map((bundle) => {
          const originalPrice = bundle.productIds.reduce((sum, pId) => {
            const p = liveProducts.find((item) => item.id === pId);
            return sum + (p?.price || 0);
          }, 0);

          const bundlePrice = Math.round(originalPrice * (1 - bundle.discountPercent / 100));

          const priceUsd = bundle.productIds.reduce((sum, pId) => {
            const p = liveProducts.find((item) => item.id === pId);
            return sum + (p?.priceUsd || 0);
          }, 0) * (1 - bundle.discountPercent / 100);

          return {
            ...bundle,
            originalPrice,
            bundlePrice,
            priceUsd,
          };
        });
      },

      sales: [
        // Realistic initial seeded sales for Mwanahamisi so the advisor is immediately rich and useful
        {
          id: 'sale-init-1',
          customerName: 'Mama Kelvin',
          customerPhone: '0754223145',
          customerLocation: 'Mwenge, Dar es Salaam',
          productId: 'shake-off-phyto',
          productName: 'Shake Off Phyto Fiber',
          quantity: 1,
          unitPrice: 35000,
          totalAmount: 35000,
          paymentType: 'credit',
          amountPaid: 15000,
          balanceDue: 20000,
          dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
          status: 'partial',
          createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
          refillFollowUpDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
          refillStatus: 'pending',
          notes: 'Alilipa nusu, anapenda Shake Off ya Pandan. Malipo ya mwisho Ijumaa.',
        },
        {
          id: 'sale-init-2',
          customerName: 'Baba Brian',
          customerPhone: '0713889922',
          customerLocation: 'Kariakoo, Dar es Salaam',
          productId: 'splina-chlorophyll',
          productName: 'Splina Liquid Chlorophyll',
          quantity: 2,
          unitPrice: 28000,
          totalAmount: 56000,
          paymentType: 'cash',
          amountPaid: 56000,
          balanceDue: 0,
          status: 'paid',
          createdAt: new Date().toISOString(),
          refillFollowUpDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
          refillStatus: 'pending',
          notes: 'Vidonda vya tumbo. Anatumia kijiko 1 asubuhi na jioni.',
        },
        {
          id: 'sale-init-3',
          customerName: 'Asha Mrema',
          customerPhone: '0788112233',
          customerLocation: 'Sinza Mori',
          productId: 'mrt-complex',
          productName: 'MRT Complex',
          quantity: 1,
          unitPrice: 45000,
          totalAmount: 45000,
          paymentType: 'mobile_money',
          amountPaid: 45000,
          balanceDue: 0,
          status: 'paid',
          createdAt: new Date().toISOString(),
          refillFollowUpDate: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
          refillStatus: 'pending',
          notes: 'Programu ya P4 Slimming, mlo wa asubuhi na mchana.',
        },
      ],

      addSale: (saleInput) => {
        const id = 'sale-' + Date.now();
        const createdAt = new Date().toISOString();

        // Calculate refill date automatically based on product duration
        const kb = EDMARK_KNOWLEDGE_BASE[saleInput.productId];
        const days = kb ? kb.durationDays - 2 : 12; // alert 2 days before finishing
        const refillDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

        const newSale: OfflineSaleRecord = {
          ...saleInput,
          id,
          createdAt,
          refillFollowUpDate: saleInput.refillFollowUpDate || refillDate,
          refillStatus: 'pending',
        };

        set((state) => ({
          sales: [newSale, ...state.sales],
        }));

        // If it's a credit sale, auto-generate a debt collection task
        if (newSale.balanceDue > 0 && newSale.dueDate) {
          get().addTask({
            title: `Kusanya deni la TZS ${newSale.balanceDue.toLocaleString()} kwa ${newSale.customerName}`,
            category: 'debt_collection',
            dueDate: newSale.dueDate,
            relatedSaleId: id,
            customerPhone: newSale.customerPhone,
            customerName: newSale.customerName,
            amount: newSale.balanceDue,
          });
        }

        // Auto-generate refill reminder task
        get().addTask({
          title: `Kumbusho la Refill: ${newSale.customerName} (${newSale.productName})`,
          category: 'refill',
          dueDate: newSale.refillFollowUpDate || refillDate,
          relatedSaleId: id,
          customerPhone: newSale.customerPhone,
          customerName: newSale.customerName,
        });

        return newSale;
      },

      addWebOrder: (order) => {
        const timestamp = Date.now();
        const createdAt = new Date().toISOString();
        const itemsSummary = order.items
          .map((i) => `${typeof i.name === 'string' ? i.name : i.name.sw || i.name.en} (x${i.quantity})`)
          .join(', ');

        const createdRecords: OfflineSaleRecord[] = [];

        // If multiple items, we create a primary parent ledger entry or individual item entries
        if (order.items.length === 1) {
          const singleItem = order.items[0];
          const itemName = typeof singleItem.name === 'string' ? singleItem.name : singleItem.name.sw || singleItem.name.en;
          const kb = EDMARK_KNOWLEDGE_BASE[singleItem.id];
          const days = kb ? kb.durationDays - 2 : 14;
          const refillDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

          const record: OfflineSaleRecord = {
            id: `web-sale-${timestamp}`,
            source: 'web_whatsapp',
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerLocation: order.customerLocation,
            productId: singleItem.id,
            productName: itemName,
            quantity: singleItem.quantity,
            unitPrice: singleItem.price,
            totalAmount: order.totalAmount,
            paymentType: 'mobile_money',
            amountPaid: 0,
            balanceDue: order.totalAmount,
            dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
            status: 'unpaid',
            createdAt,
            notes: order.notes ? `[Oda ya Mtandao - WhatsApp] ${order.notes}` : `[Oda ya Mtandao - WhatsApp] Mahali: ${order.customerLocation}`,
            refillFollowUpDate: refillDate,
            refillStatus: 'pending',
            itemsSummary,
          };

          createdRecords.push(record);
        } else {
          // Multi-item composite order
          const primaryItem = order.items[0];
          const record: OfflineSaleRecord = {
            id: `web-sale-${timestamp}`,
            source: 'web_whatsapp',
            customerName: order.customerName,
            customerPhone: order.customerPhone,
            customerLocation: order.customerLocation,
            productId: primaryItem.id,
            productName: `${order.items.length} Bidhaa: ${itemsSummary}`,
            quantity: order.items.reduce((s, i) => s + i.quantity, 0),
            unitPrice: order.totalAmount,
            totalAmount: order.totalAmount,
            paymentType: 'mobile_money',
            amountPaid: 0,
            balanceDue: order.totalAmount,
            dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
            status: 'unpaid',
            createdAt,
            notes: `[Oda ya Mtandao - WhatsApp] ${itemsSummary} • Mahali: ${order.customerLocation}`,
            refillFollowUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            refillStatus: 'pending',
            itemsSummary,
          };

          createdRecords.push(record);
        }

        set((state) => ({
          sales: [...createdRecords, ...state.sales],
        }));

        // Add task for distributor to verify incoming payment / deliver package
        get().addTask({
          title: `Thibitisha Malipo & Peana Oda ya WhatsApp: ${order.customerName} (TZS ${order.totalAmount.toLocaleString()})`,
          category: 'restock',
          dueDate: new Date().toISOString().split('T')[0],
          relatedSaleId: createdRecords[0]?.id,
          customerPhone: order.customerPhone,
          customerName: order.customerName,
          amount: order.totalAmount,
        });

        return createdRecords;
      },

      markDebtPaid: (saleId, amount) => {
        set((state) => ({
          sales: state.sales.map((sale) => {
            if (sale.id !== saleId) return sale;
            const newAmountPaid = sale.amountPaid + amount;
            const newBalanceDue = Math.max(0, sale.totalAmount - newAmountPaid);
            const newStatus = newBalanceDue === 0 ? 'paid' : 'partial';

            return {
              ...sale,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              status: newStatus,
            };
          }),
        }));
      },

      updateRefillStatus: (saleId, status) => {
        set((state) => ({
          sales: state.sales.map((s) => (s.id === saleId ? { ...s, refillStatus: status } : s)),
        }));
      },

      deleteSale: (saleId) => {
        set((state) => ({
          sales: state.sales.filter((s) => s.id !== saleId),
          tasks: state.tasks.filter((t) => t.relatedSaleId !== saleId),
        }));
      },

      tasks: [
        {
          id: 'task-1',
          title: 'Kusanya deni la TZS 20,000 kwa Mama Kelvin (Mwenge)',
          category: 'debt_collection',
          dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
          completed: false,
          customerName: 'Mama Kelvin',
          customerPhone: '0754223145',
          amount: 20000,
        },
        {
          id: 'task-2',
          title: 'Kumbusho la Refill ya Shake Off: Mama Kelvin yuko siku ya 10',
          category: 'refill',
          dueDate: new Date().toISOString().split('T')[0],
          completed: false,
          customerName: 'Mama Kelvin',
          customerPhone: '0754223145',
        },
        {
          id: 'task-3',
          title: 'Mkutano wa BOM (Business Opportunity Meeting) - Ofisi ya Edmark Kariakoo',
          category: 'bom_meeting',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          completed: false,
        },
      ],

      addTask: (taskInput) =>
        set((state) => ({
          tasks: [
            {
              ...taskInput,
              id: 'task-' + Date.now(),
              completed: false,
            },
            ...state.tasks,
          ],
        })),

      toggleTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
        })),

      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        })),

      // Maintenance & 3-Month Fund Challenge State
      targetFund: 'car',
      setTargetFund: (fund) => set({ targetFund: fund }),

      consecutiveMonthsRecord: [
        {
          monthIndex: 1,
          monthName: 'Mwezi 1 (Uliopita)',
          targetSv: 2000,
          achievedSv: 2180,
          status: 'completed',
          dateCompleted: 'Imefanikiwa',
        },
        {
          monthIndex: 2,
          monthName: 'Mwezi 2 (Mwezi Huu)',
          targetSv: 2000,
          achievedSv: 1420,
          status: 'current',
        },
        {
          monthIndex: 3,
          monthName: 'Mwezi 3 (Fainali ya Zawadi)',
          targetSv: 2000,
          achievedSv: 0,
          status: 'upcoming',
        },
      ],

      currentMonthBaseGroupSv: 1220,
      currentMonthPersonalSv: 160,

      downlineLegs: [
        {
          id: 'leg-1',
          name: 'Asha Mrema',
          location: 'Sinza Mori',
          phone: '0788112233',
          currentSv: 480,
          targetSv: 500,
          activeMembers: 4,
          lastActive: 'Leo',
          status: 'on_track',
        },
        {
          id: 'leg-2',
          name: 'Juma Mwakangata',
          location: 'Mwenge',
          phone: '0715334455',
          currentSv: 340,
          targetSv: 500,
          activeMembers: 3,
          lastActive: 'Jana',
          status: 'needs_boost',
        },
        {
          id: 'leg-3',
          name: 'Neema Kimaro',
          location: 'Tegeta',
          phone: '0754889900',
          currentSv: 190,
          targetSv: 500,
          activeMembers: 2,
          lastActive: 'Siku 3 zilizopita',
          status: 'at_risk',
        },
        {
          id: 'leg-4',
          name: 'Devotha Mushi',
          location: 'Kigamboni',
          phone: '0762113344',
          currentSv: 210,
          targetSv: 400,
          activeMembers: 2,
          lastActive: 'Siku 2 zilizopita',
          status: 'needs_boost',
        },
      ],

      updateDownlineLegSv: (legId, newSv) =>
        set((state) => {
          const updatedLegs = state.downlineLegs.map((leg) => {
            if (leg.id !== legId) return leg;
            const status: DownlineLeg['status'] =
              newSv >= leg.targetSv ? 'on_track' : newSv >= leg.targetSv * 0.6 ? 'needs_boost' : 'at_risk';
            return { ...leg, currentSv: newSv, status };
          });
          const newBase = updatedLegs.reduce((sum, l) => sum + l.currentSv, 0);
          return { downlineLegs: updatedLegs, currentMonthBaseGroupSv: newBase };
        }),

      setBaseGroupSv: (sv) => set({ currentMonthBaseGroupSv: Math.max(0, sv) }),
      setPersonalSv: (sv) => set({ currentMonthPersonalSv: Math.max(0, sv) }),

      completeMonthChallenge: (monthIndex) =>
        set((state) => {
          const updated = state.consecutiveMonthsRecord.map((rec) => {
            if (rec.monthIndex === monthIndex) {
              return { ...rec, status: 'completed' as const, achievedSv: Math.max(rec.targetSv, rec.achievedSv || 2050), dateCompleted: 'Imefanikiwa' };
            }
            if (rec.monthIndex === (monthIndex + 1 as any)) {
              return { ...rec, status: 'current' as const };
            }
            return rec;
          });
          return { consecutiveMonthsRecord: updated };
        }),

      resetChallengeStreak: () =>
        set({
          consecutiveMonthsRecord: [
            {
              monthIndex: 1,
              monthName: 'Mwezi 1 (Anza Upya)',
              targetSv: 2000,
              achievedSv: 0,
              status: 'current',
            },
            {
              monthIndex: 2,
              monthName: 'Mwezi 2',
              targetSv: 2000,
              achievedSv: 0,
              status: 'upcoming',
            },
            {
              monthIndex: 3,
              monthName: 'Mwezi 3 (Fainali)',
              targetSv: 2000,
              achievedSv: 0,
              status: 'upcoming',
            },
          ],
        }),

      getMaintenanceAnalysis: () => {
        const state = get();
        const fin = state.getFinancialSummary('month');
        const totalAppSv = fin.totalSvPoints;

        // Group SV is base from downlines + direct app retail SV
        const groupCurrentSv = state.currentMonthBaseGroupSv + totalAppSv;
        const personalCurrentSv = state.currentMonthPersonalSv + Math.round(totalAppSv * 0.4);
        const totalSv = groupCurrentSv;
        const targetSv = 2000;
        const personalTargetSv = 100;

        const gapSv = Math.max(0, targetSv - totalSv);
        const percentComplete = Math.min(100, Math.round((totalSv / targetSv) * 100));

        // Date calculations
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemaining = Math.max(1, totalDaysInMonth - currentDay);

        const dailyPacingSv = Math.ceil(gapSv / daysRemaining);

        // Status
        let paceStatus: 'ahead' | 'on_track' | 'needs_attention' | 'critical' = 'on_track';
        const expectedPaceByToday = (targetSv / totalDaysInMonth) * currentDay;
        if (totalSv >= targetSv) {
          paceStatus = 'ahead';
        } else if (totalSv >= expectedPaceByToday) {
          paceStatus = 'on_track';
        } else if (totalSv >= expectedPaceByToday * 0.7) {
          paceStatus = 'needs_attention';
        } else {
          paceStatus = 'critical';
        }

        // Product recommendation bundles to close gap
        const p4KitsNeeded = Math.ceil(gapSv / 50);
        const shakeOffBoxesNeeded = Math.ceil(gapSv / 10);
        const splinaBottlesNeeded = Math.ceil(gapSv / 8);

        const activeLegsCount = state.downlineLegs.filter((l) => l.currentSv >= 200).length;
        const currentMonthIndex = (state.consecutiveMonthsRecord.find((r) => r.status === 'current')?.monthIndex || 2) as 1 | 2 | 3;

        const fundNames: Record<string, string> = {
          car: 'Edmark Car Fund (3%)',
          house: 'Edmark House Fund (2%)',
          travel: 'Edmark Travel Fund (2%)',
          manager: 'Manager Active Maintenance (14%)',
        };

        return {
          targetSv,
          personalTargetSv,
          personalCurrentSv,
          groupCurrentSv,
          totalSv,
          gapSv,
          percentComplete,
          daysRemaining,
          dailyPacingSv,
          paceStatus,
          p4KitsNeeded,
          shakeOffBoxesNeeded,
          splinaBottlesNeeded,
          activeLegsCount,
          currentMonthIndex,
          fundName: fundNames[state.targetFund] || 'Edmark Leadership Fund',
        };
      },

      getFinancialSummary: (timeframe = 'all') => {
        const { sales } = get();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const filteredSales = sales.filter((s) => {
          if (timeframe === 'all') return true;
          const saleDate = s.createdAt.split('T')[0];
          if (timeframe === 'today') return saleDate === todayStr;
          if (timeframe === 'week') {
            const diffDays = (now.getTime() - new Date(s.createdAt).getTime()) / 86400000;
            return diffDays <= 7;
          }
          if (timeframe === 'month') {
            const diffDays = (now.getTime() - new Date(s.createdAt).getTime()) / 86400000;
            return diffDays <= 30;
          }
          return true;
        });

        let totalRevenue = 0;
        let cashCollected = 0;
        let creditOutstanding = 0;
        let estimatedWholesaleCost = 0;
        let totalSvPoints = 0;
        let totalBvPoints = 0;
        let totalUnitsSold = 0;

        const productCounts: Record<string, { name: string; count: number; revenue: number }> = {};

        filteredSales.forEach((sale) => {
          totalRevenue += sale.totalAmount;
          cashCollected += sale.amountPaid;
          creditOutstanding += sale.balanceDue;
          totalUnitsSold += sale.quantity;

          const kb = EDMARK_KNOWLEDGE_BASE[sale.productId];
          const wholesalePrice = kb ? kb.wholesaleCostTzs : Math.round(sale.unitPrice * 0.75);
          const sv = kb ? kb.svPoints : 10;
          const bv = kb ? kb.bvPoints : 7000;

          estimatedWholesaleCost += wholesalePrice * sale.quantity;
          totalSvPoints += sv * sale.quantity;
          totalBvPoints += bv * sale.quantity;

          if (!productCounts[sale.productId]) {
            productCounts[sale.productId] = {
              name: sale.productName,
              count: 0,
              revenue: 0,
            };
          }
          productCounts[sale.productId].count += sale.quantity;
          productCounts[sale.productId].revenue += sale.totalAmount;
        });

        const estimatedNetProfit = cashCollected - (estimatedWholesaleCost * (cashCollected / (totalRevenue || 1)));

        const topSellingProducts = Object.values(productCounts).sort((a, b) => b.count - a.count);

        const overdueDebtsCount = sales.filter((s) => s.balanceDue > 0 && s.dueDate && s.dueDate < todayStr).length;
        const pendingRefillsCount = sales.filter(
          (s) => s.refillStatus === 'pending' && s.refillFollowUpDate && s.refillFollowUpDate <= todayStr
        ).length;

        return {
          totalRevenue,
          cashCollected,
          creditOutstanding,
          estimatedWholesaleCost,
          estimatedNetProfit: Math.max(0, Math.round(estimatedNetProfit)),
          totalSvPoints,
          totalBvPoints,
          totalUnitsSold,
          topSellingProducts,
          overdueDebtsCount,
          pendingRefillsCount,
        };
      },
    }),
    {
      name: 'edretail_distributor_storage_v3',
    }
  )
);
