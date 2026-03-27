import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Save, Shield, Database } from 'lucide-react';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    allowRegistrations: true,
    maxUploadSize: '',
    supportedImageFormats: [],
    currency: '',
    timezone: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      setSettings(response);
    } catch (error) {
      console.error('Settings fetch error:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Settings save error:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field, checked) => {
    setSettings(prev => ({
      ...prev,
      [field]: checked
    }));
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Configure your ArtArtist platform</p>
      </div>

      {/* General Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Database size={24} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleInputChange('siteName', e.target.value)}
              className="input"
              placeholder="ArtArtist"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="input"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              rows={3}
              value={settings.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              className="input"
              placeholder="A vibrant community for artists to showcase, connect, and grow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="input"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} className="text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
              <p className="text-sm text-gray-500">Temporarily disable the platform for maintenance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleCheckboxChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Allow New Registrations</h3>
              <p className="text-sm text-gray-500">Enable or disable new user signups</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistrations}
                onChange={(e) => handleCheckboxChange('allowRegistrations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;
