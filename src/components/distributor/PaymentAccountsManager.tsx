import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  Star,
  Copy,
  AlertCircle,
  ShieldCheck,
  Edit2,
  X,
} from 'lucide-react';
import { useDistributorStore } from '../../store/distributorStore';
import { DistributorPaymentAccount, PaymentNetwork, PaymentAccountType } from '../../types';

interface PaymentAccountsManagerProps {
  lang: 'en' | 'sw';
}

export const PaymentAccountsManager: React.FC<PaymentAccountsManagerProps> = ({ lang }) => {
  const distributor = useDistributorStore((s) => s.getActiveDistributor());
  const updateCurrentProfile = useDistributorStore((s) => s.updateCurrentProfile);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  // Form states
  const [network, setNetwork] = useState<PaymentNetwork>('mpesa');
  const [accountType, setAccountType] = useState<PaymentAccountType>('till');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState(distributor.name);
  const [isDefault, setIsDefault] = useState(false);
  const [formError, setFormError] = useState('');

  const currentAccounts: DistributorPaymentAccount[] = distributor.paymentAccounts || [];

  const networkOptions: { id: PaymentNetwork; name: string; badge: string; color: string }[] = [
    { id: 'mpesa', name: 'Vodacom M-Pesa', badge: 'Lipa Kwa Simu', color: 'bg-red-600' },
    { id: 'tigopesa', name: 'Tigo Pesa (Mixx by Yas)', badge: 'Lipa Namba', color: 'bg-sky-600' },
    { id: 'airtel', name: 'Airtel Money', badge: 'Lipa Merchant', color: 'bg-rose-600' },
    { id: 'halopesa', name: 'Halopesa', badge: 'Halo Yako', color: 'bg-amber-600' },
    { id: 'bank', name: 'Bank Transfer (CRDB/NMB)', badge: 'Benki', color: 'bg-emerald-700' },
  ];

  const accountTypeOptions: { id: PaymentAccountType; labelSw: string; labelEn: string }[] = [
    { id: 'till', labelSw: 'Lipa Kwa Simu (Till / Buy Goods)', labelEn: 'Merchant Till Number' },
    { id: 'paybill', labelSw: 'Namba ya Kampuni (Paybill)', labelEn: 'Paybill Business Number' },
    { id: 'phone', labelSw: 'Namba ya Simu ya Kawaida', labelEn: 'Direct Phone Number' },
    { id: 'bank_account', labelSw: 'Akaunti ya Benki', labelEn: 'Bank Account Number' },
  ];

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSetDefault = (accountId: string) => {
    const updated = currentAccounts.map((acc) => ({
      ...acc,
      isDefault: acc.id === accountId,
    }));
    updateCurrentProfile({ paymentAccounts: updated });
  };

  const handleDelete = (accountId: string) => {
    if (currentAccounts.length <= 1) {
      alert(lang === 'sw' ? 'Unahitaji angalau akaunti moja ya malipo kwa ajili ya wateja.' : 'You need at least one payment account for your customers.');
      return;
    }
    const updated = currentAccounts.filter((a) => a.id !== accountId);
    if (!updated.some((a) => a.isDefault) && updated.length > 0) {
      updated[0].isDefault = true;
    }
    updateCurrentProfile({ paymentAccounts: updated });
  };

  const handleOpenAdd = () => {
    setEditingAccountId(null);
    setNetwork('mpesa');
    setAccountType('till');
    setAccountNumber('');
    setAccountName(distributor.name);
    setIsDefault(currentAccounts.length === 0);
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (acc: DistributorPaymentAccount) => {
    setEditingAccountId(acc.id);
    setNetwork(acc.network);
    setAccountType(acc.accountType);
    setAccountNumber(acc.accountNumber);
    setAccountName(acc.accountName);
    setIsDefault(!!acc.isDefault);
    setFormError('');
    setShowAddModal(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = accountNumber.trim();
    const cleanName = accountName.trim();

    if (!cleanNumber || cleanNumber.length < 5) {
      setFormError(lang === 'sw' ? 'Tafadhali weka namba sahihi ya malipo (angalau tarakimu 5).' : 'Please provide a valid account or till number (min 5 digits).');
      return;
    }
    if (!cleanName) {
      setFormError(lang === 'sw' ? 'Tafadhali weka jina lililosajiliwa kwenye namba hii.' : 'Please enter the registered name for this account.');
      return;
    }

    const netObj = networkOptions.find((n) => n.id === network) || networkOptions[0];
    const typeObj = accountTypeOptions.find((t) => t.id === accountType) || accountTypeOptions[0];

    let updated: DistributorPaymentAccount[] = [...currentAccounts];

    if (editingAccountId) {
      updated = updated.map((acc) => {
        if (acc.id === editingAccountId) {
          return {
            ...acc,
            network,
            networkName: netObj.name,
            accountType,
            accountTypeName: lang === 'sw' ? typeObj.labelSw : typeObj.labelEn,
            accountNumber: cleanNumber,
            accountName: cleanName,
            isDefault: isDefault || acc.isDefault,
          };
        }
        return isDefault ? { ...acc, isDefault: false } : acc;
      });
    } else {
      const newAcc: DistributorPaymentAccount = {
        id: `acc-${Date.now()}`,
        network,
        networkName: netObj.name,
        accountType,
        accountTypeName: lang === 'sw' ? typeObj.labelSw : typeObj.labelEn,
        accountNumber: cleanNumber,
        accountName: cleanName,
        isDefault: isDefault || currentAccounts.length === 0,
      };

      if (isDefault) {
        updated = updated.map((a) => ({ ...a, isDefault: false }));
      }
      updated.push(newAcc);
    }

    updateCurrentProfile({ paymentAccounts: updated });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 bg-transparent text-stone-100">
      {/* ── HEADER BANNER ── */}
      <div className="p-5 sm:p-6 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-3xl text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-stone-700">
        <div>
          <div className="flex items-center gap-2 text-amber-400">
            <CreditCard className="w-5 h-5" />
            <span className="text-[11px] font-black uppercase tracking-wider">
              {lang === 'sw' ? 'Mfumo wa Lipa Namba & Miamala' : 'Payment Accounts & Till Numbers'}
            </span>
          </div>
          <h3 className="text-lg font-black text-white mt-1">
            {lang === 'sw' ? 'Akaunti Zako za Kupokea Malipo' : 'Your Verified Payment Till Accounts'}
          </h3>
          <p className="text-xs text-stone-300 max-w-xl mt-1 leading-relaxed">
            {lang === 'sw'
              ? 'Wateja wanaponunua bidhaa kwenye duka lako au kupitia WhatsApp checkout, wataona namba hizi halisi na jina lako lililosajiliwa ili kuzuia makosa ya kutuma pesa.'
              : 'These verified accounts appear directly on customer checkout sheets and compiled WhatsApp receipts to guarantee seamless buyer trust and zero errors.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{lang === 'sw' ? 'Ongeza Namba Mpya' : 'Add New Account'}</span>
        </button>
      </div>

      {/* ── ACCOUNTS LIST ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentAccounts.map((account) => {
          const networkStyle = networkOptions.find((n) => n.id === account.network) || {
            name: account.networkName,
            color: 'bg-stone-800',
            badge: 'Lipa',
          };

          return (
            <div
              key={account.id}
              className={`p-5 rounded-3xl border transition-all relative flex flex-col justify-between bg-stone-950/80 shadow-xs ${
                account.isDefault
                  ? 'border-emerald-500/80 ring-1 ring-emerald-500/30'
                  : 'border-stone-800 hover:border-stone-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg text-white ${networkStyle.color}`}>
                      {account.networkName}
                    </span>
                    {account.isDefault && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-600/50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{lang === 'sw' ? 'Ya Awali (Default)' : 'Default'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(account)}
                      className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                      title={lang === 'sw' ? 'Hariri' : 'Edit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-950/40 transition-colors"
                      title={lang === 'sw' ? 'Futa' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-stone-400">
                    {account.accountTypeName}
                  </div>
                  <div className="font-mono text-2xl font-black text-white tracking-wider">
                    {account.accountNumber}
                  </div>
                  <div className="text-xs text-stone-300 pt-1">
                    {lang === 'sw' ? 'Jina Lililosajiliwa:' : 'Registered Name:'}{' '}
                    <strong className="text-white font-bold">{account.accountName}</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-stone-800 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(account.accountNumber, account.id)}
                  className="text-xs font-bold text-stone-300 hover:text-white flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-xl border border-stone-700 transition-colors"
                >
                  {copiedId === account.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">{lang === 'sw' ? 'Imenakiliwa' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-400" />
                      <span>{lang === 'sw' ? 'Nakili Namba' : 'Copy Number'}</span>
                    </>
                  )}
                </button>

                {!account.isDefault && (
                  <button
                    onClick={() => handleSetDefault(account.id)}
                    className="text-xs font-bold text-stone-400 hover:text-emerald-400 underline cursor-pointer"
                  >
                    {lang === 'sw' ? 'Weka kama ya Awali' : 'Make Default'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SECURITY ADVISORY ── */}
      <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-300">{lang === 'sw' ? 'Uthibitisho wa Miamala Tanzania' : 'Transaction Safety Assurance'}</h4>
          <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
            {lang === 'sw'
              ? 'Kila agizo linalotumwa WhatsApp huunganishwa moja kwa moja na namba hizi pamoja na mwongozo wa mteja kutuma SMS ya muamala mara tu anapolipia.'
              : 'All web orders compile direct receipts with these account coordinates so customers can pay directly and submit confirmation SMS proofs in chat.'}
          </p>
        </div>
      </div>

      {/* ── ADD/EDIT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-stone-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-800 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-stone-950 text-amber-400 border border-stone-800 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {editingAccountId
                      ? (lang === 'sw' ? 'Hariri Namba ya Malipo' : 'Edit Payment Account')
                      : (lang === 'sw' ? 'Ongeza Namba ya Malipo' : 'Add Payment Account')}
                  </h3>
                  <p className="text-[10px] text-stone-400">
                    {lang === 'sw' ? 'Hitaonekana kwenye Checkout na Risiti za WhatsApp' : 'Visible on checkout and WhatsApp receipts'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAccount} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  {lang === 'sw' ? 'Mtandao wa Simu / Benki:' : 'Network / Bank:'}
                </label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value as PaymentNetwork)}
                  className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {networkOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} ({opt.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  {lang === 'sw' ? 'Aina ya Akaunti:' : 'Account Type:'}
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as PaymentAccountType)}
                  className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {accountTypeOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {lang === 'sw' ? opt.labelSw : opt.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  {lang === 'sw' ? 'Namba ya Lipa / Namba ya Simu / Akaunti:' : 'Account / Till Number:'}
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Mfano: 543210 au 0783481416"
                  className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl font-mono text-sm font-bold text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-300 mb-1">
                  {lang === 'sw' ? 'Jina Lililosajiliwa (Kama linavyosomeka kwenye SMS):' : 'Registered Account Holder Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Mfano: Mwanahamisi Lissu"
                  className="w-full p-2.5 bg-stone-950 border border-stone-700 rounded-xl font-semibold text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="acc-is-default-check"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded bg-stone-950 border-stone-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="acc-is-default-check" className="font-semibold text-stone-300 cursor-pointer">
                  {lang === 'sw' ? 'Weka kama namba kuu (Default)' : 'Set as primary default account'}
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-700 font-bold text-stone-300 hover:bg-stone-800 cursor-pointer"
                >
                  {lang === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-black text-stone-950 shadow-xs cursor-pointer"
                >
                  {lang === 'sw' ? 'Hifadhi Akaunti' : 'Save Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
