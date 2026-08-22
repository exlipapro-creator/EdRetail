import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useLang } from '../../context/LangContext';
import { useDistributorStore, DEFAULT_DISTRIBUTOR } from '../../store/distributorStore';

interface DistributorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DistributorAuthModal: React.FC<DistributorAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { lang } = useLang();
  const loginWithEmail = useDistributorStore((s) => s.loginWithEmail);
  const loginWithGoogle = useDistributorStore((s) => s.loginWithGoogle);
  const registerNewDistributor = useDistributorStore((s) => s.registerNewDistributor);
  const savedDistributors = useDistributorStore((s) => s.savedDistributors);
  const currentProfile = useDistributorStore((s) => s.currentProfile);
  const isAdminAuthenticated = useDistributorStore((s) => s.isAdminAuthenticated);
  const logoutDistributor = useDistributorStore((s) => s.logoutDistributor);

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [slug, setSlug] = useState('');
  const [city, setCity] = useState('Dar es Salaam');
  const [rank] = useState('Manager & Health Consultant');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const ok = loginWithEmail(email, password);
      if (ok) {
        setSuccessMessage(lang === 'sw' ? 'Umefanikiwa kuingia!' : 'Login successful!');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } else {
        setErrorMessage(
          lang === 'sw'
            ? 'Barua pepe au nenosiri sio sahihi. Jaribu tena au tumia Google.'
            : 'Invalid credentials. Please verify your email/password or use Google Sign-In.'
        );
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || password.length < 4) {
      setErrorMessage(
        lang === 'sw'
          ? 'Tafadhali jaza taarifa zote na nenosiri lisilopungua herufi 4.'
          : 'Please complete all fields with a password of at least 4 characters.'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const cleanPhone = phone.replace(/\D/g, '');
      const digits = cleanPhone.startsWith('0') ? '255' + cleanPhone.slice(1) : cleanPhone.startsWith('255') ? cleanPhone : '255' + cleanPhone;

      const profile = registerNewDistributor(
        {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          whatsappDigits: digits,
          slug: slug.trim().toLowerCase() || fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
          rank: rank,
          city: city,
          lipaNumber: 'Lipa Namba: ' + Math.floor(100000 + Math.random() * 900000),
          bio: `Msambazaji Rasmi wa Edmark ${city}. Wasiliana nami kwa ushauri wa afya na bidhaa asilia za Edmark.`,
        },
        password
      );

      setSuccessMessage(
        lang === 'sw'
          ? `🎉 Hongera ${profile.name}! Duka lako la mtandaoni limeundwa: edretail.tz/@${profile.slug}`
          : `🎉 Welcome ${profile.name}! Your distributor store is live: edretail.tz/@${profile.slug}`
      );

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    }, 500);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setErrorMessage('');
    setTimeout(() => {
      setIsLoading(false);
      const gProfile = loginWithGoogle();
      setSuccessMessage(
        lang === 'sw'
          ? `✅ Umeingia kupitia Google kama ${gProfile.name}!`
          : `✅ Connected via Google as ${gProfile.name}!`
      );
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 800);
    }, 400);
  };

  const handleQuickSwitch = (dist: typeof DEFAULT_DISTRIBUTOR) => {
    loginWithEmail(dist.email, 'password123');
    setSuccessMessage(
      lang === 'sw' ? `Umeingia kama ${dist.name}` : `Switched to ${dist.name}`
    );
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* ── HEADER BANNER ── */}
        <div className="bg-gradient-to-r from-emerald-900 to-primary-900 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {lang === 'sw' ? 'Kitovu cha Wasambazaji' : 'Distributor Command Hub'}
              </span>
              <h3 className="text-lg font-extrabold text-white">
                {isAdminAuthenticated
                  ? lang === 'sw'
                    ? `Akaunti ya ${currentProfile.name}`
                    : `Account: ${currentProfile.name}`
                  : mode === 'register'
                  ? lang === 'sw'
                    ? 'Jiunge Kama Msambazaji'
                    : 'Register Your Storefront'
                  : lang === 'sw'
                  ? 'Ingia Kwenye Dashibodi Yako'
                  : 'Distributor Sign In'}
              </h3>
            </div>
          </div>
          <p className="text-xs text-emerald-200/90 mt-1">
            {lang === 'sw'
              ? 'Tengeneza duka lako la kipekee (edretail.tz/@jina), tengeneza picha za WhatsApp Status, na simamia mauzo.'
              : 'Launch your personalized shop, generate 1-tap WhatsApp flyers, and track retail profits.'}
          </p>
        </div>

        {/* ── BODY CONTENT ── */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Active Status Box if already logged in */}
          {isAdminAuthenticated && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {currentProfile.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">{currentProfile.name}</h4>
                    <p className="text-[11px] text-emerald-700 font-semibold">{currentProfile.rank}</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-black rounded-full uppercase">
                  Active
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-200/80 text-xs text-neutral-700 space-y-1">
                <div>
                  <strong>Link Yako:</strong>{' '}
                  <span className="text-primary-700 font-mono">
                    edretail.tz/@{currentProfile.slug}
                  </span>
                </div>
                <div>
                  <strong>WhatsApp Orders:</strong> {currentProfile.phone}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={logoutDistributor}
                  className="flex-1 py-2 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs transition-colors"
                >
                  {lang === 'sw' ? 'Ondoka (Logout)' : 'Logout'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
                >
                  {lang === 'sw' ? 'Endelea Dukani' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {!isAdminAuthenticated && (
            <>
              {/* ── 1-TAP GOOGLE SIGN-IN BUTTON ── */}
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-800 font-bold text-xs sm:text-sm border border-neutral-300 shadow-2xs hover:shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer"
              >
                {/* Google SVG Icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {mode === 'register'
                    ? lang === 'sw'
                      ? 'Jiunge Papo Hapo na Google'
                      : 'Continue with Google'
                    : lang === 'sw'
                    ? 'Ingia Papo Hapo na Google'
                    : 'Sign in with Google'}
                </span>
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {lang === 'sw' ? 'au nenosiri la kawaida' : 'or with email/password'}
                </span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex bg-neutral-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {lang === 'sw' ? 'Ingia (Login)' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    mode === 'register'
                      ? 'bg-white text-neutral-900 shadow-2xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {lang === 'sw' ? 'Msambazaji Mpya (Register)' : 'New Distributor'}
                </button>
              </div>

              {/* Alerts */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* ── SEMANTIC FORM (PASSWORD-MANAGER COMPLIANT) ── */}
              {mode === 'login' && (
                <form
                  id="distributor-login-form"
                  method="post"
                  onSubmit={handleLoginSubmit}
                  className="space-y-3.5"
                >
                  <div>
                    <label
                      htmlFor="distributor-login-email"
                      className="block text-xs font-bold text-neutral-700 mb-1"
                    >
                      {lang === 'sw' ? 'Barua Pepe / Username:' : 'Email Address / Username:'}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        id="distributor-login-email"
                        name="username"
                        type="email"
                        autoComplete="username webauthn"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mfano: mwanahamisi@edretail.tz"
                        className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label
                        htmlFor="distributor-login-password"
                        className="text-xs font-bold text-neutral-700"
                      >
                        {lang === 'sw' ? 'Nenosiri (Password):' : 'Password:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] font-bold text-emerald-700 hover:underline"
                      >
                        {lang === 'sw' ? 'Umesahau?' : 'Forgot?'}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        id="distributor-login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-800 placeholder:text-neutral-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="distributor-login-submit-btn"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <span>{isLoading ? 'Inathibitisha...' : lang === 'sw' ? 'Ingia Kwenye Akaunti' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ── REGISTRATION FORM ── */}
              {mode === 'register' && (
                <form
                  id="distributor-register-form"
                  method="post"
                  onSubmit={handleRegisterSubmit}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="dist-reg-fullname"
                        className="block text-[11px] font-bold text-neutral-700 mb-1"
                      >
                        {lang === 'sw' ? 'Jina Kamili:' : 'Full Name:'}
                      </label>
                      <input
                        id="dist-reg-fullname"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (!slug) {
                            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                          }
                        }}
                        placeholder="mfano: Asha Ramadhani"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:bg-white focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="dist-reg-phone"
                        className="block text-[11px] font-bold text-neutral-700 mb-1"
                      >
                        {lang === 'sw' ? 'Simu / WhatsApp:' : 'Phone / WhatsApp:'}
                      </label>
                      <input
                        id="dist-reg-phone"
                        name="tel"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0712 345 678"
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:bg-white focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="dist-reg-email"
                      className="block text-[11px] font-bold text-neutral-700 mb-1"
                    >
                      {lang === 'sw' ? 'Barua Pepe (Email):' : 'Email Address:'}
                    </label>
                    <input
                      id="dist-reg-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="asha.edmark@gmail.com"
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:bg-white focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label
                        htmlFor="dist-reg-slug"
                        className="block text-[11px] font-bold text-neutral-700 mb-1"
                      >
                        {lang === 'sw' ? 'Link Yako ya Kipekee:' : 'Custom Store Slug:'}
                      </label>
                      <div className="flex items-center text-xs bg-neutral-100 rounded-xl border border-neutral-200 overflow-hidden">
                        <span className="px-2 text-neutral-500 font-mono">@</span>
                        <input
                          id="dist-reg-slug"
                          name="slug"
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                          placeholder="asha"
                          className="w-full py-2 pr-2 bg-transparent text-xs text-neutral-800 focus:outline-none font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="dist-reg-city"
                        className="block text-[11px] font-bold text-neutral-700 mb-1"
                      >
                        {lang === 'sw' ? 'Mkoa / Eneo:' : 'City / Region:'}
                      </label>
                      <select
                        id="dist-reg-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:bg-white focus:border-emerald-500"
                      >
                        <option value="Dar es Salaam">Dar es Salaam</option>
                        <option value="Arusha">Arusha</option>
                        <option value="Mwanza">Mwanza</option>
                        <option value="Dodoma">Dodoma</option>
                        <option value="Mbeya">Mbeya</option>
                        <option value="Morogoro">Morogoro</option>
                        <option value="Zanzibar">Zanzibar</option>
                        <option value="Tanga">Tanga</option>
                        <option value="Moshi">Moshi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="dist-reg-password"
                      className="block text-[11px] font-bold text-neutral-700 mb-1"
                    >
                      {lang === 'sw' ? 'Tengeneza Nenosiri (Password):' : 'Create Password:'}
                    </label>
                    <div className="relative">
                      <input
                        id="dist-reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Nenosiri imara"
                        className="w-full pl-3 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-800 focus:bg-white focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="distributor-register-submit-btn"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isLoading ? 'Inaunda duka...' : lang === 'sw' ? 'Tengeneza Duka Langu Sasa' : 'Launch My Storefront'}
                    </span>
                  </button>
                </form>
              )}

              {/* ── FORGOT PASSWORD ── */}
              {mode === 'forgot' && (
                <div className="space-y-3 text-center py-3">
                  <p className="text-xs text-neutral-600">
                    {lang === 'sw'
                      ? 'Ingiza barua pepe yako au tumia kitufe cha Google hapo juu kuingia moja kwa moja.'
                      : 'Enter your registered email or use Google Sign-In above to access your account.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    {lang === 'sw' ? '← Rudi kwenye Kuingia' : '← Back to Sign In'}
                  </button>
                </div>
              )}

              {/* ── QUICK TEST DISTRIBUTOR SWITCHER ── */}
              <div className="pt-3 border-t border-neutral-200/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  {lang === 'sw' ? 'Chagua Wasambazaji Waliopo (Demo Quick-Switch):' : 'Saved Accounts (Quick Switch):'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {savedDistributors.slice(0, 2).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleQuickSwitch(d)}
                      className="p-2 text-left rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/80 text-xs transition-all"
                    >
                      <div className="font-bold text-neutral-900 truncate">{d.name}</div>
                      <div className="text-[10px] text-neutral-500 truncate">@{d.slug} • {d.city}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
