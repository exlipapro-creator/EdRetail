import { useState } from 'react';
import {
  CheckCircle2,
  Plus,
  Trash2,
  Pencil,
  MapPin,
  Phone,
  CreditCard,
  Globe,
  Star,
  ExternalLink,
  Save,
  X,
} from 'lucide-react';
import { useDistributorStore, DistributorProfile } from '../../store/distributorStore';

export function DistributorsPage() {
  const savedDistributors = useDistributorStore((s) => s.savedDistributors);
  const toggleDistributorVerification = useDistributorStore((s) => s.toggleDistributorVerification);
  const toggleDistributorStatus = useDistributorStore((s) => s.toggleDistributorStatus);
  const updateDistributorProfileAdmin = useDistributorStore((s) => s.updateDistributorProfileAdmin);
  const addDistributorAdmin = useDistributorStore((s) => s.addDistributorAdmin);
  const deleteDistributorAdmin = useDistributorStore((s) => s.deleteDistributorAdmin);

  const [editing, setEditing] = useState<DistributorProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<Partial<DistributorProfile>>({
    name: '',
    phone: '+255 ',
    whatsappDigits: '255',
    lipaNumber: 'Lipa Namba: ',
    email: '',
    slug: '',
    city: 'Dar es Salaam',
    rank: 'Manager & Wellness Consultant',
    isVerified: true,
    status: 'active',
    avatarUrl: '/logo/distributor-circle.png',
    rating: 4.9,
    reviewCount: 15,
    deliveryCoverage: 'Dar es Salaam & Mikoani kote',
    bio: 'Msambazaji Rasmi wa Edmark Tanzania.',
  });

  const filteredDistributors = savedDistributors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.includes(searchQuery)
  );

  const handleOpenEdit = (dist: DistributorProfile) => {
    setEditing(dist);
    setFormData(dist);
    setIsCreating(false);
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setIsCreating(true);
    setFormData({
      id: 'dist-' + Date.now(),
      name: '',
      phone: '+255 7',
      whatsappDigits: '2557',
      lipaNumber: 'Lipa Namba: 554433',
      email: '',
      slug: '',
      city: 'Dar es Salaam',
      rank: 'Manager & Wellness Consultant',
      isVerified: true,
      status: 'active',
      avatarUrl: '/logo/distributor-circle.png',
      rating: 4.9,
      reviewCount: 10,
      deliveryCoverage: 'Dar es Salaam & Mikoani kote',
      bio: 'Msambazaji Rasmi wa Edmark Tanzania.',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    const cleanSlug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '');

    if (isCreating) {
      const newDist: DistributorProfile = {
        id: formData.id || 'dist-' + Date.now(),
        name: formData.name,
        phone: formData.phone || '+255 700 000 000',
        whatsappDigits: formData.whatsappDigits || '255700000000',
        lipaNumber: formData.lipaNumber || 'Lipa Namba: 123456',
        email: formData.email || `${cleanSlug}@edretail.tz`,
        slug: cleanSlug,
        city: formData.city || 'Dar es Salaam',
        rank: formData.rank || 'Manager & Wellness Consultant',
        isVerified: Boolean(formData.isVerified),
        status: formData.status || 'active',
        avatarUrl: formData.avatarUrl || '/logo/distributor-circle.png',
        rating: Number(formData.rating) || 4.9,
        reviewCount: Number(formData.reviewCount) || 12,
        deliveryCoverage: formData.deliveryCoverage || 'Mikoani kote',
        bio: formData.bio || 'Msambazaji Rasmi wa Edmark.',
      };
      addDistributorAdmin(newDist);
    } else if (editing) {
      updateDistributorProfileAdmin(editing.id, {
        ...formData,
        slug: cleanSlug,
      });
    }

    setEditing(null);
    setIsCreating(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Distributors Oversight</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-black">
              {savedDistributors.length} Registered
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage authorized leader accounts, verify Lipa Namba payment details, and supervise custom handles.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Distributor</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, city, handle (@slug), or phone..."
          className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Distributors Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredDistributors.map((dist) => (
          <div
            key={dist.id}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 hover:border-gray-700 transition-colors"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={dist.avatarUrl || '/logo/distributor-circle.png'}
                  alt={dist.name}
                  className="w-12 h-12 rounded-xl object-cover border border-gray-800 bg-gray-800"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-bold text-white leading-tight">{dist.name}</h2>
                    {dist.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{dist.rank}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <a
                      href={`/@${dist.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-0.5"
                    >
                      <Globe className="w-3 h-3" />
                      <span>@{dist.slug}</span>
                      <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  dist.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {dist.status}
              </span>
            </div>

            {/* Info details */}
            <div className="bg-gray-950/60 rounded-xl p-3 space-y-1.5 text-xs text-gray-300 border border-gray-800/80">
              <div className="flex items-center gap-2 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="truncate">{dist.city} • {dist.deliveryCoverage}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span>{dist.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span className="font-mono text-amber-300">{dist.lipaNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
                <span>{dist.rating} ★ ({dist.reviewCount} customer reviews)</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => toggleDistributorVerification(dist.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    dist.isVerified
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                  title="Toggle verified badge"
                >
                  {dist.isVerified ? 'Verified' : 'Verify'}
                </button>

                <button
                  onClick={() =>
                    toggleDistributorStatus(
                      dist.id,
                      dist.status === 'active' ? 'suspended' : 'active'
                    )
                  }
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    dist.status === 'active'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {dist.status === 'active' ? 'Suspend' : 'Activate'}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(dist)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                  title="Edit details"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {!dist.isCentral && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete distributor profile for ${dist.name}?`)) {
                        deleteDistributorAdmin(dist.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                    title="Delete distributor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {(isCreating || editing) && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
              <h2 className="text-sm font-bold text-white">
                {isCreating ? 'Register New Authorized Distributor' : `Edit Distributor: ${editing?.name}`}
              </h2>
              <button
                onClick={() => {
                  setEditing(null);
                  setIsCreating(false);
                }}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name & Title</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., Diamond Leader Fatuma Ally"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Custom Slug (/@handle)</label>
                  <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl px-3 text-xs text-gray-400">
                    <span>/@</span>
                    <input
                      type="text"
                      required
                      value={formData.slug || ''}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="w-full bg-transparent py-2 pl-1 text-white focus:outline-none"
                      placeholder="fatuma"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Rank / Position</label>
                  <input
                    type="text"
                    value={formData.rank || ''}
                    onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Diamond Star Leader"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="+255 754 282 900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Lipa Namba</label>
                  <input
                    type="text"
                    required
                    value={formData.lipaNumber || ''}
                    onChange={(e) => setFormData({ ...formData, lipaNumber: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Lipa Namba: 554433"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">City / Region</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Dar es Salaam"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Delivery Coverage</label>
                  <input
                    type="text"
                    value={formData.deliveryCoverage || ''}
                    onChange={(e) => setFormData({ ...formData, deliveryCoverage: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Dar & Mikoani kote"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Storefront Bio</label>
                  <textarea
                    rows={2}
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Msambazaji rasmi wa Edmark Tanzania..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Distributor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
