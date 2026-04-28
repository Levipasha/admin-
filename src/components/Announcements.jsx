import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Megaphone, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import { adminAPI } from '../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    badge: 'Version 7.8',
    message: 'New feature is ready to use, let\'s try',
    isActive: true,
    link: '',
    backgroundColor: 'gray',
    textColor: 'gray-800',
    badgeColor: 'white',
    badgeTextColor: 'gray-800'
  });
  const [heroSettings, setHeroSettings] = useState({
    heroImage: '',
    heroLogo: ''
  });
  const [savingHero, setSavingHero] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingHeroLogo, setUploadingHeroLogo] = useState(false);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchAnnouncements();
    fetchActiveAnnouncement();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_URL}/api/announcements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAnnouncement = async () => {
    try {
      const response = await fetch(`${API_URL}/api/announcements/active`);
      const data = await response.json();
      if (data.success && data.data) {
        setHeroSettings({
          heroImage: data.data.heroImage || '',
          heroLogo: data.data.heroLogo || ''
        });
      }
    } catch (error) {
      console.error('Error fetching active announcement:', error);
    }
  };

  const handleSaveHeroSettings = async () => {
    try {
      setSavingHero(true);
      const activeAnnouncement = announcements.find(a => a.isActive);
      
      if (activeAnnouncement) {
        const response = await fetch(`${API_URL}/api/announcements/${activeAnnouncement._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...activeAnnouncement,
            heroImage: heroSettings.heroImage,
            heroLogo: heroSettings.heroLogo
          })
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Hero settings saved successfully');
          fetchAnnouncements();
        } else {
          toast.error(data.error || 'Failed to save hero settings');
        }
      } else {
        toast.error('Please create and activate an announcement first');
      }
    } catch (error) {
      console.error('Error saving hero settings:', error);
      toast.error('Failed to save hero settings');
    } finally {
      setSavingHero(false);
    }
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingHeroImage(true);
      const data = await adminAPI.uploadHeroImage(file);
      if (data.url) {
        setHeroSettings({ ...heroSettings, heroImage: data.url });
        toast.success('Hero image uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading hero image:', error.response?.data || error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to upload image';
      toast.error(errorMsg);
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleHeroLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingHeroLogo(true);
      const data = await adminAPI.uploadHeroLogo(file);
      if (data.url) {
        setHeroSettings({ ...heroSettings, heroLogo: data.url });
        toast.success('Hero logo uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading hero logo:', error.response?.data || error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to upload image';
      toast.error(errorMsg);
    } finally {
      setUploadingHeroLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `${API_URL}/api/announcements/${editingId}`
        : `${API_URL}/api/announcements`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingId ? 'Announcement updated!' : 'Announcement created!');
        fetchAnnouncements();
        resetForm();
      } else {
        toast.error(data.error || 'Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`${API_URL}/api/announcements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Announcement deleted!');
        fetchAnnouncements();
      } else {
        toast.error(data.error || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/announcements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(currentStatus ? 'Announcement deactivated!' : 'Announcement activated!');
        fetchAnnouncements();
      } else {
        toast.error(data.error || 'Failed to update announcement');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Failed to update announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingId(announcement._id);
    setFormData({
      badge: announcement.badge,
      message: announcement.message,
      isActive: announcement.isActive,
      link: announcement.link || '',
      backgroundColor: announcement.backgroundColor || 'gray',
      textColor: announcement.textColor || 'gray-800',
      badgeColor: announcement.badgeColor || 'white',
      badgeTextColor: announcement.badgeTextColor || 'gray-800'
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      badge: 'Version 7.8',
      message: 'New feature is ready to use, let\'s try',
      isActive: true,
      link: '',
      backgroundColor: 'gray',
      textColor: 'gray-800',
      badgeColor: 'white',
      badgeTextColor: 'gray-800'
    });
    setEditingId(null);
    setShowForm(false);
  };

  const colorOptions = [
    'gray', 'red', 'orange', 'yellow', 'green', 'teal', 'blue', 'indigo', 'purple', 'pink'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          {showForm ? 'Cancel' : 'New Announcement'}
        </button>
      </div>

      {/* Hero Image Settings Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Hero Image Settings</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Image
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="heroImageUpload"
                accept="image/*"
                onChange={handleHeroImageUpload}
                className="hidden"
                disabled={uploadingHeroImage}
              />
              <label
                htmlFor="heroImageUpload"
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  uploadingHeroImage ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingHeroImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Upload Image
                  </>
                )}
              </label>
              {heroSettings.heroImage && (
                <button
                  type="button"
                  onClick={() => setHeroSettings({ ...heroSettings, heroImage: '' })}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            {heroSettings.heroImage && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Hero Image Preview</p>
                <img
                  src={heroSettings.heroImage}
                  alt="Hero image preview"
                  className="max-h-32 w-full object-cover rounded"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Logo (PNG, transparent background recommended)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                id="heroLogoUpload"
                accept="image/*"
                onChange={handleHeroLogoUpload}
                className="hidden"
                disabled={uploadingHeroLogo}
              />
              <label
                htmlFor="heroLogoUpload"
                className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  uploadingHeroLogo ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploadingHeroLogo ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Upload Logo
                  </>
                )}
              </label>
              {heroSettings.heroLogo && (
                <button
                  type="button"
                  onClick={() => setHeroSettings({ ...heroSettings, heroLogo: '' })}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">This image replaces the "DISCOVER ART" text on the homepage hero section. Use a transparent PNG for best results.</p>
            {heroSettings.heroLogo && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Hero Logo Preview</p>
                <img
                  src={heroSettings.heroLogo}
                  alt="Hero logo preview"
                  className="max-h-32 object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveHeroSettings}
              disabled={savingHero}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {savingHero ? 'Saving...' : 'Save Hero Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Announcement' : 'Create Announcement'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Version 7.8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link (optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <input
                type="text"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter announcement message"
                required
              />
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                <select
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <select
                  value={formData.textColor}
                  onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge BG</label>
                <select
                  value={formData.badgeColor}
                  onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                <select
                  value={formData.badgeTextColor}
                  onChange={(e) => setFormData({ ...formData, badgeTextColor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color.charAt(0).toUpperCase() + color.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (shown on website)
              </label>
            </div>

            {/* Preview */}
            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className={`flex items-center space-x-2.5 border border-${formData.backgroundColor}-500/30 rounded-full bg-${formData.backgroundColor}-500/10 p-1 text-sm text-${formData.textColor} inline-flex`}>
                <div className={`bg-${formData.badgeColor} border border-${formData.backgroundColor}-500/30 rounded-2xl px-3 py-1`}>
                  <p className={`text-xs font-semibold text-${formData.badgeTextColor}`}>{formData.badge}</p>
                </div>
                <p className="pr-3 text-sm">{formData.message}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <tr key={announcement._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {announcement.badge}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900 max-w-xs truncate">{announcement.message}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(announcement._id, announcement.isActive)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      announcement.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {announcement.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {announcements.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  <Megaphone size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No announcements yet. Create your first one!</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Announcements;
