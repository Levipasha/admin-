import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const initialForm = {
  name: '',
  artForm: 'Team',
  teamRole: '',
  isTeamMember: true,
  displayOrder: 0,
  bio: '',
  city: '',
  state: '',
  country: '',
  instagram: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  website: '',
  imageUrl: '',
  imageAlt: '',
  isActive: true
};

const Artists = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [teamOnly, setTeamOnly] = useState(false);
  const [artists, setArtists] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getArtists({
        search: search || undefined,
        isActive: showInactive ? undefined : true,
        isTeamMember: teamOnly ? true : undefined
      });
      setArtists(res.artists || []);
    } catch (e) {
      console.error('Artists fetch error:', e);
      toast.error('Failed to fetch artists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, showInactive, teamOnly]);

  const canSave = useMemo(
    () => Boolean(form.name.trim()) && Boolean(form.artForm.trim()) && Boolean(form.imageUrl.trim()),
    [form]
  );

  const openCreate = () => {
    setEditing({ _id: null });
    setForm(initialForm);
  };

  const openEdit = (a) => {
    setEditing(a);
    setForm({
      name: a?.name || '',
      artForm: a?.artForm || '',
      teamRole: a?.teamRole || '',
      isTeamMember: a?.isTeamMember ?? false,
      displayOrder: a?.displayOrder ?? 0,
      bio: a?.bio || '',
      city: a?.location?.city || '',
      state: a?.location?.state || '',
      country: a?.location?.country || '',
      instagram: a?.social?.instagram || '',
      facebook: a?.social?.facebook || '',
      twitter: a?.social?.twitter || '',
      linkedin: a?.social?.linkedin || '',
      website: a?.social?.website || '',
      imageUrl: a?.image?.url || '',
      imageAlt: a?.image?.alt || '',
      isActive: a?.isActive ?? true
    });
  };

  const closeModal = () => {
    setEditing(null);
    setSaving(false);
  };

  const save = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      if (editing?._id) {
        const updated = await adminAPI.updateArtist(editing._id, form);
        setArtists((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
        toast.success('Artist updated');
      } else {
        const created = await adminAPI.createArtist(form);
        setArtists((prev) => [created, ...prev]);
        toast.success('Artist created');
      }
      closeModal();
    } catch (e) {
      console.error('Artist save error:', e);
      toast.error(e?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this artist?')) return;
    try {
      await adminAPI.deleteArtist(id);
      setArtists((prev) => prev.filter((x) => x._id !== id));
      toast.success('Artist deleted');
    } catch (e) {
      console.error('Artist delete error:', e);
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artists</h1>
          <p className="text-gray-600 mt-1">Manage artist entries for Home search suggestions.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={20} className="mr-2" />
          Add Artist
        </button>
      </div>

      <div className="card p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-9" placeholder="Search artist / art form..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
          Show inactive too
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={teamOnly} onChange={(e) => setTeamOnly(e.target.checked)} />
          Team members only
        </label>
        <div className="text-sm text-gray-600">{artists.length} artists</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((a) => (
          <div key={a._id} className="card overflow-hidden">
            <div className="h-44 bg-gray-100">
              {a.image?.url ? (
                <img src={a.image.url} alt={a.image.alt || a.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="font-semibold text-gray-900">{a.name}</div>
              <div className="text-sm text-gray-600">{a.teamRole || a.artForm}</div>
              <div className="text-xs text-gray-500">{[a.location?.city, a.location?.state, a.location?.country].filter(Boolean).join(', ')}</div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => remove(a._id)} className="btn-danger p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
            <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-xl max-h-[calc(100vh-2rem)] flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">{editing._id ? 'Edit artist' : 'Add artist'}</div>
                <button className="btn-secondary px-3 py-1" onClick={closeModal} disabled={saving}>Close</button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Art form</label>
                  <input className="input" value={form.artForm} onChange={(e) => setForm((f) => ({ ...f, artForm: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team role</label>
                  <input className="input" value={form.teamRole} onChange={(e) => setForm((f) => ({ ...f, teamRole: e.target.value }))} placeholder="Founder & CEO" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display order</label>
                  <input type="number" className="input" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value || 0) }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea className="input min-h-[90px]" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input className="input" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input className="input" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input className="input" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input className="input" value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  <input className="input" value={form.facebook} onChange={(e) => setForm((f) => ({ ...f, facebook: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                  <input className="input" value={form.twitter} onChange={(e) => setForm((f) => ({ ...f, twitter: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input className="input" value={form.linkedin} onChange={(e) => setForm((f) => ({ ...f, linkedin: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input className="input" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Artist image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-700"
                    disabled={saving || uploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setUploading(true);
                        const up = await adminAPI.uploadArtistImage(file);
                        setForm((f) => ({ ...f, imageUrl: up.url || '' }));
                        toast.success('Image uploaded');
                      } catch (err) {
                        console.error('Artist upload error:', err);
                        toast.error(err?.response?.data?.error || 'Upload failed');
                      } finally {
                        setUploading(false);
                        e.target.value = '';
                      }
                    }}
                  />
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input className="input" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image alt</label>
                    <input className="input" value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                    <input type="checkbox" checked={form.isTeamMember} onChange={(e) => setForm((f) => ({ ...f, isTeamMember: e.target.checked }))} />
                    Show in Meet Our Team
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                    Active (show in home search)
                  </label>
                </div>
              </div>

              <div className="p-6 border-t flex items-center justify-end gap-2">
                <button className="btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                <button className="btn-primary" onClick={save} disabled={saving || !canSave}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artists;

