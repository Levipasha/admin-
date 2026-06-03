import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Megaphone, Eye, EyeOff, Save, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../config';
import { adminAPI } from '../services/api';

// Normalize API base URL to prevent duplicate /api paths
const getApiBaseUrl = () => {
  const base = API_URL || '';
  // Remove trailing /api if present to avoid /api/api duplication
  return base.replace(/\/api$/, '');
};
const BASE_API_URL = getApiBaseUrl();

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
    badgeTextColor: 'gray-800',
    titleText: 'Discover Amazing Artists',
    titleType: 'text',
    subtitleText: 'Search by artist name, art form, or location to find talented creators across India',
    titleAccentColor: '#D71920',
    subtitleColor: '#6B7280'
  });
  const [heroSettings, setHeroSettings] = useState({
    heroImage: '',
    heroLogo: '',
    titleText: 'Discover Amazing Artists',
    titleType: 'text',
    subtitleText: 'Search by artist name, art form, or location to find talented creators across India',
    titleAccentColor: '#D71920',
    subtitleColor: '#6B7280'
  });
  const [savingHero, setSavingHero] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [uploadingHeroLogo, setUploadingHeroLogo] = useState(false);

  // Bulk email state
  const [bulkEmailOpen, setBulkEmailOpen] = useState(false);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkIncludeEvents, setBulkIncludeEvents] = useState(false);
  const [bulkTargetAudience, setBulkTargetAudience] = useState('all');
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  // Broadcast DM state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastText, setBroadcastText] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchAnnouncements();
    fetchActiveAnnouncement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${BASE_API_URL}/api/announcements`, {
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
      const response = await fetch(`${BASE_API_URL}/api/announcements/active`);
      const data = await response.json();
      if (data.success && data.data) {
        setHeroSettings({
          heroImage: data.data.heroImage || '',
          heroLogo: data.data.heroLogo || '',
          titleText: data.data.titleText || 'Discover Amazing Artists',
          titleType: data.data.titleType || 'text',
          subtitleText: data.data.subtitleText || 'Search by artist name, art form, or location to find talented creators across India',
          titleAccentColor: data.data.titleAccentColor || '#D71920',
          subtitleColor: data.data.subtitleColor || '#6B7280'
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
        const response = await fetch(`${BASE_API_URL}/api/announcements/${activeAnnouncement._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...activeAnnouncement,
            heroImage: heroSettings.heroImage,
            heroLogo: heroSettings.heroLogo,
            titleText: heroSettings.titleText,
            titleType: heroSettings.titleType,
            subtitleText: heroSettings.subtitleText,
            titleAccentColor: heroSettings.titleAccentColor,
            subtitleColor: heroSettings.subtitleColor
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
        // Automatically initialize a default active announcement for the user
        const response = await fetch(`${BASE_API_URL}/api/announcements`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            badge: 'Welcome',
            message: 'Welcome to ArtArtist!',
            isActive: true,
            heroImage: heroSettings.heroImage,
            heroLogo: heroSettings.heroLogo,
            titleText: heroSettings.titleText,
            titleType: heroSettings.titleType,
            subtitleText: heroSettings.subtitleText,
            titleAccentColor: heroSettings.titleAccentColor,
            subtitleColor: heroSettings.subtitleColor
          })
        });
        const data = await response.json();
        if (data.success) {
          toast.success('Active announcement initialized and hero settings saved!');
          fetchAnnouncements();
        } else {
          toast.error(data.error || 'Failed to initialize active announcement');
        }
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
        ? `${BASE_API_URL}/api/announcements/${editingId}`
        : `${BASE_API_URL}/api/announcements`;
      
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
      const response = await fetch(`${BASE_API_URL}/api/announcements/${id}`, {
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
      const response = await fetch(`${BASE_API_URL}/api/announcements/${id}`, {
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
      badgeTextColor: announcement.badgeTextColor || 'gray-800',
      titleText: announcement.titleText || 'Discover Amazing Artists',
      titleType: announcement.titleType || 'text',
      subtitleText: announcement.subtitleText || 'Search by artist name, art form, or location to find talented creators across India',
      titleAccentColor: announcement.titleAccentColor || '#D71920',
      subtitleColor: announcement.subtitleColor || '#6B7280'
    });
    setShowForm(true);
  };

  const handleSendBulkEmail = async (e) => {
    e.preventDefault();
    if (!bulkSubject.trim() || !bulkMessage.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    if (!window.confirm(`Send this announcement to all ${bulkTargetAudience === 'all' ? 'users and artists' : bulkTargetAudience}?`)) {
      return;
    }
    setBulkSending(true);
    setBulkResult(null);
    try {
      const data = await adminAPI.sendBulkAnnouncementEmail({
        subject: bulkSubject.trim(),
        message: bulkMessage.trim(),
        includeEvents: bulkIncludeEvents,
        targetAudience: bulkTargetAudience
      });
      if (data.success) {
        toast.success(`Announcement sent! ${data.summary.sent} sent, ${data.summary.failed} failed.`);
        setBulkResult(data.summary);
        setBulkSubject('');
        setBulkMessage('');
        setBulkIncludeEvents(false);
      } else {
        toast.error(data.error || 'Failed to send announcement');
      }
    } catch (error) {
      console.error('Bulk email error:', error);
      toast.error(error.response?.data?.error || 'Failed to send bulk announcement');
    } finally {
      setBulkSending(false);
    }
  };

  const handleSendBroadcastDM = async (e) => {
    e.preventDefault();
    if (!broadcastText.trim()) {
      toast.error('Broadcast message text is required');
      return;
    }
    if (!window.confirm('Are you sure you want to broadcast this DM to ALL active artists?')) {
      return;
    }
    setBroadcastSending(true);
    setBroadcastResult(null);
    try {
      const data = await adminAPI.broadcastMessageToArtists(broadcastText.trim());
      if (data.success) {
        toast.success(`Broadcast DM successfully sent to ${data.sentCount} artists!`);
        setBroadcastResult(data);
        setBroadcastText('');
      } else {
        toast.error(data.error || 'Failed to send broadcast DM');
      }
    } catch (error) {
      console.error('Broadcast DM error:', error);
      toast.error(error.response?.data?.error || 'Failed to send broadcast DM');
    } finally {
      setBroadcastSending(false);
    }
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
      badgeTextColor: 'gray-800',
      titleText: 'Discover Amazing Artists',
      titleType: 'text',
      subtitleText: 'Search by artist name, art form, or location to find talented creators across India',
      titleAccentColor: '#D71920',
      subtitleColor: '#6B7280'
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
                  alt="Hero preview"
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

          <div className="grid md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Title Display Type
              </label>
              <select
                value={heroSettings.titleType || 'text'}
                onChange={(e) => setHeroSettings({ ...heroSettings, titleType: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="text">Custom Text Title</option>
                <option value="image">Hero Logo Image</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Title Text
              </label>
              <input
                type="text"
                value={heroSettings.titleText || ''}
                onChange={(e) => setHeroSettings({ ...heroSettings, titleText: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Discover Amazing Artists"
              />
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hero Subtitle Text
            </label>
            <textarea
              rows={2}
              value={heroSettings.subtitleText || ''}
              onChange={(e) => setHeroSettings({ ...heroSettings, subtitleText: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="e.g., Search by artist name, art form, or location to find talented creators across India"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Title Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={heroSettings.titleAccentColor || '#D71920'}
                  onChange={(e) => setHeroSettings({ ...heroSettings, titleAccentColor: e.target.value })}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={heroSettings.titleAccentColor || '#D71920'}
                  onChange={(e) => setHeroSettings({ ...heroSettings, titleAccentColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                  placeholder="#D71920"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hero Subtitle Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={heroSettings.subtitleColor || '#6B7280'}
                  onChange={(e) => setHeroSettings({ ...heroSettings, subtitleColor: e.target.value })}
                  className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={heroSettings.subtitleColor || '#6B7280'}
                  onChange={(e) => setHeroSettings({ ...heroSettings, subtitleColor: e.target.value })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                  placeholder="#6B7280"
                />
              </div>
            </div>
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

      {/* Bulk Email Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Bulk Announcement Email</h2>
            <p className="text-sm text-gray-500">Send announcement emails to all users and artists</p>
          </div>
          <button
            onClick={() => setBulkEmailOpen(!bulkEmailOpen)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Mail size={20} />
            {bulkEmailOpen ? 'Close' : 'Send Bulk Email'}
          </button>
        </div>

        {bulkEmailOpen && (
          <form onSubmit={handleSendBulkEmail} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={bulkSubject}
                onChange={(e) => setBulkSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., New Exhibition Opening Soon!"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Enter your announcement message..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <select
                  value={bulkTargetAudience}
                  onChange={(e) => setBulkTargetAudience(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="all">All Users & Artists</option>
                  <option value="artists">Artists Only</option>
                  <option value="users">Regular Users Only</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bulkIncludeEvents}
                    onChange={(e) => setBulkIncludeEvents(e.target.checked)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Include upcoming events</span>
                </label>
              </div>
            </div>

            {bulkResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">Last Send Results:</p>
                <p className="text-sm text-green-700">
                  {bulkResult.sent} sent successfully &middot; {bulkResult.failed} failed &middot; {bulkResult.total} total recipients
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={bulkSending}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Send Announcement
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setBulkEmailOpen(false); setBulkResult(null); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Broadcast DM Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Broadcast DM to All Artists
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                ArtArtist (Verified)
              </span>
            </h2>
            <p className="text-sm text-gray-500">Send an instant direct message (DM) to all active artists. The message will appear under the verified name "ArtArtist" with a blue checkmark badge.</p>
          </div>
          <button
            type="button"
            onClick={() => setBroadcastOpen(!broadcastOpen)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Megaphone size={20} />
            {broadcastOpen ? 'Close' : 'Create Broadcast DM'}
          </button>
        </div>

        {broadcastOpen && (
          <form onSubmit={handleSendBroadcastDM} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Direct Message Content</label>
              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your system DM message to all artists..."
                required
              />
            </div>

            {broadcastResult && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-semibold font-bold">Broadcast Successfully Delivered!</p>
                <p className="text-sm text-blue-700 mt-1">
                  Sent DM broadcast to <strong>{broadcastResult.sentCount}</strong> active artists.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={broadcastSending}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {broadcastSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Megaphone size={18} />
                    Send Broadcast DM
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setBroadcastOpen(false); setBroadcastResult(null); }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title Type</label>
                <select
                  value={formData.titleType || 'text'}
                  onChange={(e) => setFormData({ ...formData, titleType: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="text">Custom Text</option>
                  <option value="image">Hero Logo (Image)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title Text</label>
                <input
                  type="text"
                  value={formData.titleText || ''}
                  onChange={(e) => setFormData({ ...formData, titleText: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="e.g., Discover Amazing Artists"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle Text</label>
              <textarea
                rows={2}
                value={formData.subtitleText || ''}
                onChange={(e) => setFormData({ ...formData, subtitleText: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., Search by artist name, art form, or location to find talented creators across India"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.titleAccentColor || '#D71920'}
                    onChange={(e) => setFormData({ ...formData, titleAccentColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={formData.titleAccentColor || '#D71920'}
                    onChange={(e) => setFormData({ ...formData, titleAccentColor: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                    placeholder="#D71920"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.subtitleColor || '#6B7280'}
                    onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer p-1"
                  />
                  <input
                    type="text"
                    value={formData.subtitleColor || '#6B7280'}
                    onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono text-sm"
                    placeholder="#6B7280"
                  />
                </div>
              </div>
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
