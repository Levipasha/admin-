import React, { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Trash2, Edit, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Gallery = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    galleryType: 'gallery',
    imageUrl: '',
    imageAlt: '',
    bio: '',
    isActive: true
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getGallery({
        search: search || undefined,
        isActive: showInactive ? undefined : true
      });
      setItems(res.items || []);
    } catch (e) {
      console.error('Gallery fetch error:', e);
      toast.error('Failed to fetch gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, showInactive]);

  const openCreate = () => {
    setEditing({ _id: null });
    setForm({ name: '', galleryType: 'gallery', imageUrl: '', imageAlt: '', bio: '', isActive: true });
    setImagePreviewError(false);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item?.name || '',
      galleryType: item?.galleryType || 'gallery',
      imageUrl: item?.image?.url || '',
      imageAlt: item?.image?.alt || '',
      bio: item?.bio || '',
      isActive: item?.isActive ?? true,
    });
    setImagePreviewError(false);
  };

  const closeModal = () => {
    setEditing(null);
    setSaving(false);
    setImagePreviewError(false);
  };

  const canSave = useMemo(() => {
    return Boolean(form.name.trim()) && Boolean(form.imageUrl.trim());
  }, [form.name, form.imageUrl]);

  const save = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        galleryType: form.galleryType,
        imageUrl: form.imageUrl.trim(),
        imageAlt: form.imageAlt.trim(),
        bio: form.bio.trim(),
        isActive: Boolean(form.isActive)
      };

      if (editing?._id) {
        const updated = await adminAPI.updateGalleryItem(editing._id, payload);
        setItems((prev) => prev.map((x) => (x._id === updated._id ? updated : x)));
        toast.success('Gallery item updated');
      } else {
        const created = await adminAPI.createGalleryItem(payload);
        setItems((prev) => [created, ...prev]);
        toast.success('Gallery item created');
      }
      closeModal();
    } catch (e) {
      console.error('Gallery save error:', e);
      toast.error(e?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this gallery item?')) return;
    try {
      await adminAPI.deleteGalleryItem(id);
      setItems((prev) => prev.filter((x) => x._id !== id));
      toast.success('Deleted');
    } catch (e) {
      console.error('Gallery delete error:', e);
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
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-1">Add images + names for About page gallery.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={20} className="mr-2" />
          Add Gallery Item
        </button>
      </div>

      <div className="card p-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
          />
          Show inactive too
        </label>
        <div className="text-sm text-gray-600">{items.length} items</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="card overflow-hidden">
            <div className="h-44 bg-gray-100">
              {item.image?.url ? (
                <img src={item.image.url} alt={item.image.alt || item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{item.name}</div>
                  <div className="text-xs text-gray-600">
                    {item.galleryType === '3d-gallery' ? '3D Gallery' : 'Gallery'}
                  </div>
                  {item.bio ? <div className="text-xs text-gray-700 line-clamp-2 mt-1">{item.bio}</div> : null}
                  <div className="text-xs text-gray-500 truncate">{item.image?.url}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                  {item.isActive ? 'active' : 'inactive'}
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => remove(item._id)} className="btn-danger p-2" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative bg-white w-full max-w-xl rounded-2xl shadow-xl my-4 max-h-[92vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                {editing._id ? 'Edit gallery item' : 'Add gallery item'}
              </div>
              <button className="btn-secondary px-3 py-1" onClick={closeModal} disabled={saving}>
                Close
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  className="input"
                  value={form.galleryType}
                  onChange={(e) => setForm((f) => ({ ...f, galleryType: e.target.value }))}
                >
                  <option value="gallery">Gallery</option>
                  <option value="3d-gallery">3D Gallery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload image (Cloudinary)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setUploading(true);
                      const res = await adminAPI.uploadGalleryImage(file);
                      const resolvedUrl = res?.url || res?.secure_url || res?.imageUrl || '';
                      setForm((f) => ({ ...f, imageUrl: String(resolvedUrl).trim() }));
                      setImagePreviewError(false);
                      toast.success('Uploaded');
                    } catch (err) {
                      console.error('Gallery upload error:', err);
                      toast.error(err?.response?.data?.error || 'Upload failed');
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                  className="block w-full text-sm text-gray-700"
                  disabled={uploading || saving}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {uploading ? 'Uploading…' : 'Or paste an Image URL below.'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  className="input"
                  value={form.imageUrl}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, imageUrl: e.target.value }));
                    setImagePreviewError(false);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alt text (optional)</label>
                <input className="input" value={form.imageAlt} onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio (shown in 3D gallery)</label>
                <textarea
                  className="input min-h-[90px]"
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Write short artwork bio..."
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                Active (show on About page)
              </label>

              {form.imageUrl?.trim() && (
                <div className="rounded-lg border overflow-hidden">
                  {!imagePreviewError ? (
                    <img
                      src={form.imageUrl.trim()}
                      alt={form.imageAlt || form.name}
                      className="w-full h-56 object-cover"
                      onError={() => setImagePreviewError(true)}
                    />
                  ) : (
                    <div className="w-full h-56 flex items-center justify-center text-sm text-red-600 bg-red-50 px-3 text-center">
                      Preview failed. Please check Image URL and try again.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t flex items-center justify-end gap-2">
              <button className="btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={saving || !canSave}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;

