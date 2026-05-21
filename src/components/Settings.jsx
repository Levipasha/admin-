import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Save, Shield, Database, LayoutGrid, Info, HelpCircle, Trophy, Milestone, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('system');
  
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    allowRegistrations: true,
    maxUploadSize: '',
    supportedImageFormats: [],
    currency: '',
    timezone: '',

    // About Hero Section
    aboutHeroTitleLine1: '',
    aboutHeroTitleLine2: '',
    aboutHeroSubtitle: '',
    aboutHeroJoinButtonText: '',

    // About Stats Section
    aboutStat1Number: '',
    aboutStat1Label: '',
    aboutStat2Number: '',
    aboutStat2Label: '',
    aboutStat3Number: '',
    aboutStat3Label: '',
    aboutStat4Number: '',
    aboutStat4Label: '',

    // Story Section
    aboutStoryTitle: '',
    aboutStoryDescription: '',

    // Community Section
    aboutCommunitySubtitle: '',
    aboutCommunityTitle: '',
    aboutCommunityDescription: '',

    // Meetups Card
    aboutMeetupsTitle: '',
    aboutMeetupsSubtitle: '',
    aboutMeetupsStat1Number: '',
    aboutMeetupsStat1Label: '',
    aboutMeetupsStat2Number: '',
    aboutMeetupsStat2Label: '',
    aboutMeetupsStat3Number: '',
    aboutMeetupsStat3Label: '',
    aboutMeetupsBottomDescription: '',
    aboutMeetupsButtonText: '',

    // Values Section
    aboutValuesTitle: '',
    aboutValue1Title: '',
    aboutValue1Description: '',
    aboutValue2Title: '',
    aboutValue2Description: '',
    aboutValue3Title: '',
    aboutValue3Description: '',
    aboutValue4Title: '',
    aboutValue4Description: '',

    // Journey Section
    aboutJourneyTitle: '',
    aboutMilestone1Year: '',
    aboutMilestone1Title: '',
    aboutMilestone1Description: '',
    aboutMilestone2Year: '',
    aboutMilestone2Title: '',
    aboutMilestone2Description: '',
    aboutMilestone3Year: '',
    aboutMilestone3Title: '',
    aboutMilestone3Description: '',
    aboutMilestone4Year: '',
    aboutMilestone4Title: '',
    aboutMilestone4Description: '',
    aboutMilestone5Year: '',
    aboutMilestone5Title: '',
    aboutMilestone5Description: '',

    // CTA Section
    aboutCtaTitle: '',
    aboutCtaSubtitle: '',
    aboutCtaButton1Text: '',
    aboutCtaButton2Text: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      // Merge retrieved values into our state template so no fields end up undefined
      setSettings(prev => ({
        ...prev,
        ...response
      }));
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure your ArtArtist platform and about page content</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-primary flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2.5 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'system'
              ? 'border-red-600 text-red-600 bg-red-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          System Config
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`px-4 py-2.5 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
            activeTab === 'about'
              ? 'border-red-600 text-red-600 bg-red-50/40'
              : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
          }`}
        >
          About Page Content
        </button>
      </div>

      {activeTab === 'system' ? (
        <div className="space-y-6">
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
                  value={settings.siteName || ''}
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
                  value={settings.currency || 'USD'}
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
                  value={settings.siteDescription || ''}
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
                  value={settings.timezone || 'Asia/Kolkata'}
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
                    checked={settings.maintenanceMode || false}
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
                    checked={settings.allowRegistrations || false}
                    onChange={(e) => handleCheckboxChange('allowRegistrations', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* About Hero Section */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <LayoutGrid size={22} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">About Hero Section</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title Line 1</label>
                  <input
                    type="text"
                    value={settings.aboutHeroTitleLine1 || ''}
                    onChange={(e) => handleInputChange('aboutHeroTitleLine1', e.target.value)}
                    className="input"
                    placeholder="We are one by blood,"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title Line 2 (The bold italic "Art+")</label>
                  <input
                    type="text"
                    value={settings.aboutHeroTitleLine2 || ''}
                    onChange={(e) => handleInputChange('aboutHeroTitleLine2', e.target.value)}
                    className="input"
                    placeholder="Blood group is Art+."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle / Intro text</label>
                <textarea
                  rows={2}
                  value={settings.aboutHeroSubtitle || ''}
                  onChange={(e) => handleInputChange('aboutHeroSubtitle', e.target.value)}
                  className="input"
                  placeholder="Join us to celebrate creativity and connect with fellow artists..."
                />
              </div>
              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Join Button Text</label>
                <input
                  type="text"
                  value={settings.aboutHeroJoinButtonText || ''}
                  onChange={(e) => handleInputChange('aboutHeroJoinButtonText', e.target.value)}
                  className="input"
                  placeholder="Join"
                />
              </div>
            </div>
          </div>

          {/* About Numbers / Stats Section */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <Trophy size={22} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">About Stats Counters</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stat 1 Number</label>
                <input
                  type="text"
                  value={settings.aboutStat1Number || ''}
                  onChange={(e) => handleInputChange('aboutStat1Number', e.target.value)}
                  className="input"
                  placeholder="10,000+"
                />
                <label className="block text-xs text-gray-500 mt-2">Stat 1 Label</label>
                <input
                  type="text"
                  value={settings.aboutStat1Label || ''}
                  onChange={(e) => handleInputChange('aboutStat1Label', e.target.value)}
                  className="input mt-1"
                  placeholder="Artists"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stat 2 Number</label>
                <input
                  type="text"
                  value={settings.aboutStat2Number || ''}
                  onChange={(e) => handleInputChange('aboutStat2Number', e.target.value)}
                  className="input"
                  placeholder="50,000+"
                />
                <label className="block text-xs text-gray-500 mt-2">Stat 2 Label</label>
                <input
                  type="text"
                  value={settings.aboutStat2Label || ''}
                  onChange={(e) => handleInputChange('aboutStat2Label', e.target.value)}
                  className="input mt-1"
                  placeholder="Artworks"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stat 3 Number</label>
                <input
                  type="text"
                  value={settings.aboutStat3Number || ''}
                  onChange={(e) => handleInputChange('aboutStat3Number', e.target.value)}
                  className="input"
                  placeholder="100+"
                />
                <label className="block text-xs text-gray-500 mt-2">Stat 3 Label</label>
                <input
                  type="text"
                  value={settings.aboutStat3Label || ''}
                  onChange={(e) => handleInputChange('aboutStat3Label', e.target.value)}
                  className="input mt-1"
                  placeholder="Cities"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stat 4 Number</label>
                <input
                  type="text"
                  value={settings.aboutStat4Number || ''}
                  onChange={(e) => handleInputChange('aboutStat4Number', e.target.value)}
                  className="input"
                  placeholder="1M+"
                />
                <label className="block text-xs text-gray-500 mt-2">Stat 4 Label</label>
                <input
                  type="text"
                  value={settings.aboutStat4Label || ''}
                  onChange={(e) => handleInputChange('aboutStat4Label', e.target.value)}
                  className="input mt-1"
                  placeholder="Art Lovers"
                />
              </div>
            </div>
          </div>

          {/* Story Details */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <Info size={22} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">About Story Description</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={settings.aboutStoryTitle || ''}
                  onChange={(e) => handleInputChange('aboutStoryTitle', e.target.value)}
                  className="input"
                  placeholder="About ArtArtist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story details description paragraph</label>
                <textarea
                  rows={6}
                  value={settings.aboutStoryDescription || ''}
                  onChange={(e) => handleInputChange('aboutStoryDescription', e.target.value)}
                  className="input font-sans text-sm leading-relaxed"
                  placeholder="ArtArtist was founded by an artist who deeply understood..."
                />
              </div>
            </div>
          </div>

          {/* Community Headings */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <Compass size={22} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Community Headings</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Big Section Title Heading</label>
                  <input
                    type="text"
                    value={settings.aboutCommunitySubtitle || ''}
                    onChange={(e) => handleInputChange('aboutCommunitySubtitle', e.target.value)}
                    className="input"
                    placeholder="Inspiring community of artists."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Small Subtitle Label</label>
                  <input
                    type="text"
                    value={settings.aboutCommunityTitle || ''}
                    onChange={(e) => handleInputChange('aboutCommunityTitle', e.target.value)}
                    className="input"
                    placeholder="Creative Community"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Description</label>
                <textarea
                  rows={2}
                  value={settings.aboutCommunityDescription || ''}
                  onChange={(e) => handleInputChange('aboutCommunityDescription', e.target.value)}
                  className="input"
                  placeholder="Join a vibrant community where artists connect, share..."
                />
              </div>
            </div>
          </div>

          {/* Meetups Config */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <Compass size={22} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Meetups & Events Card Config</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Subtitle Title</label>
                  <input
                    type="text"
                    value={settings.aboutMeetupsTitle || ''}
                    onChange={(e) => handleInputChange('aboutMeetupsTitle', e.target.value)}
                    className="input"
                    placeholder="Meetups"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Small Label subtitle</label>
                  <input
                    type="text"
                    value={settings.aboutMeetupsSubtitle || ''}
                    onChange={(e) => handleInputChange('aboutMeetupsSubtitle', e.target.value)}
                    className="input"
                    placeholder="Regular gatherings to connect..."
                  />
                </div>
              </div>

              {/* Meetups stats row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meetups Counter 1</label>
                  <input
                    type="text"
                    value={settings.aboutMeetupsStat1Number || ''}
                    onChange={(e) => handleInputChange('aboutMeetupsStat1Number', e.target.value)}
                    className="input bg-white"
                    placeholder="Monthly"
                  />
                  <label className="block text-[10px] text-gray-500 mt-1">Label 1</label>
                  <input
                    type="text"
                    value={settings.aboutMeetupsStat1Label || ''}
                    onChange={(e) => handleInputChange('aboutMeetupsStat1Label', e.target.value)}
                    className="input mt-1 bg-white"
                    placeholder="Artist meetups in major cities"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meetups Counter 2</label>
                  <input
                    type="text"
                    value={settings.aboutMeetupsStat2Number || ''}
                    onChange={(e) => handleInputChange('aboutMeetupsStat2Number', e.target.value)}
                    className="input bg-white"
                    placeholder="50+"
                  />
                  <label className="block text-[10px] text-gray-500 mt-1">Label 2</label>
                  <input
                    type="text"
                    value={settings.aboutMeetupsStat2Label || ''}
                    onChange={(e) => handleInputChange('aboutMeetupsStat2Label', e.target.value)}
                    className="input mt-1 bg-white"
                    placeholder="Cities with active communities"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Meetups Counter 3</label>
                  <input
                    type="text"
                    value={settings.aboutMeetupsStat3Number || ''}
                    onChange={(e) => handleInputChange('aboutMeetupsStat3Number', e.target.value)}
                    className="input bg-white"
                    placeholder="1000+"
                  />
                  <label className="block text-[10px] text-gray-500 mt-1">Label 3</label>
                  <input
                    type="text"
                    value={settings.aboutMeetupsStat3Label || ''}
                    onChange={(e) => handleInputChange('aboutMeetupsStat3Label', e.target.value)}
                    className="input mt-1 bg-white"
                    placeholder="Artists connected monthly"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bottom Text description</label>
                <textarea
                  rows={2}
                  value={settings.aboutMeetupsBottomDescription || ''}
                  onChange={(e) => handleInputChange('aboutMeetupsBottomDescription', e.target.value)}
                  className="input"
                  placeholder="Discover and connect with talented artists..."
                />
              </div>

              <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Action Button Text</label>
                <input
                  type="text"
                  value={settings.aboutMeetupsButtonText || ''}
                  onChange={(e) => handleInputChange('aboutMeetupsButtonText', e.target.value)}
                  className="input"
                  placeholder="View Upcoming Meetups"
                />
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <HelpCircle size={22} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title Heading</label>
                <input
                  type="text"
                  value={settings.aboutValuesTitle || ''}
                  onChange={(e) => handleInputChange('aboutValuesTitle', e.target.value)}
                  className="input"
                  placeholder="Our Values"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Value 1 Title</label>
                    <input
                      type="text"
                      value={settings.aboutValue1Title || ''}
                      onChange={(e) => handleInputChange('aboutValue1Title', e.target.value)}
                      className="input bg-white mt-1"
                      placeholder="Passion for Art"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Value 1 Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutValue1Description || ''}
                      onChange={(e) => handleInputChange('aboutValue1Description', e.target.value)}
                      className="input bg-white mt-1 text-xs"
                      placeholder="We believe in the transformative power..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Value 2 Title</label>
                    <input
                      type="text"
                      value={settings.aboutValue2Title || ''}
                      onChange={(e) => handleInputChange('aboutValue2Title', e.target.value)}
                      className="input bg-white mt-1"
                      placeholder="Artist First"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Value 2 Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutValue2Description || ''}
                      onChange={(e) => handleInputChange('aboutValue2Description', e.target.value)}
                      className="input bg-white mt-1 text-xs"
                      placeholder="We prioritize artists' success..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Value 3 Title</label>
                    <input
                      type="text"
                      value={settings.aboutValue3Title || ''}
                      onChange={(e) => handleInputChange('aboutValue3Title', e.target.value)}
                      className="input bg-white mt-1"
                      placeholder="Global Community"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Value 3 Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutValue3Description || ''}
                      onChange={(e) => handleInputChange('aboutValue3Description', e.target.value)}
                      className="input bg-white mt-1 text-xs"
                      placeholder="Building a worldwide network..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600">Value 4 Title</label>
                    <input
                      type="text"
                      value={settings.aboutValue4Title || ''}
                      onChange={(e) => handleInputChange('aboutValue4Title', e.target.value)}
                      className="input bg-white mt-1"
                      placeholder="Excellence"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Value 4 Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutValue4Description || ''}
                      onChange={(e) => handleInputChange('aboutValue4Description', e.target.value)}
                      className="input bg-white mt-1 text-xs"
                      placeholder="Committed to maintaining the highest standards..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Journey */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <Milestone size={22} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Timeline Journey</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeline Section Title</label>
                <input
                  type="text"
                  value={settings.aboutJourneyTitle || ''}
                  onChange={(e) => handleInputChange('aboutJourneyTitle', e.target.value)}
                  className="input"
                  placeholder="Our Journey"
                />
              </div>

              {/* Milestones dynamic wrapper */}
              <div className="space-y-6 bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm mb-2 border-b pb-2">Milestone Indicators</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {/* Milestone 1 */}
                  <div className="bg-white p-3 rounded-lg border">
                    <label className="block text-[11px] font-bold text-gray-600">Milestone 1 Year</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone1Year || ''}
                      onChange={(e) => handleInputChange('aboutMilestone1Year', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="2020"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Milestone 1 Title</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone1Title || ''}
                      onChange={(e) => handleInputChange('aboutMilestone1Title', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="ArtArtist Founded"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutMilestone1Description || ''}
                      onChange={(e) => handleInputChange('aboutMilestone1Description', e.target.value)}
                      className="input mt-1 text-[11px]"
                      placeholder="Started with a vision..."
                    />
                  </div>

                  {/* Milestone 2 */}
                  <div className="bg-white p-3 rounded-lg border">
                    <label className="block text-[11px] font-bold text-gray-600">Milestone 2 Year</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone2Year || ''}
                      onChange={(e) => handleInputChange('aboutMilestone2Year', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="2021"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Milestone 2 Title</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone2Title || ''}
                      onChange={(e) => handleInputChange('aboutMilestone2Title', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="1,000 Artists"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutMilestone2Description || ''}
                      onChange={(e) => handleInputChange('aboutMilestone2Description', e.target.value)}
                      className="input mt-1 text-[11px]"
                      placeholder="Reached first major milestone..."
                    />
                  </div>

                  {/* Milestone 3 */}
                  <div className="bg-white p-3 rounded-lg border">
                    <label className="block text-[11px] font-bold text-gray-600">Milestone 3 Year</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone3Year || ''}
                      onChange={(e) => handleInputChange('aboutMilestone3Year', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="2022"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Milestone 3 Title</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone3Title || ''}
                      onChange={(e) => handleInputChange('aboutMilestone3Title', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="NFT Launch"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutMilestone3Description || ''}
                      onChange={(e) => handleInputChange('aboutMilestone3Description', e.target.value)}
                      className="input mt-1 text-[11px]"
                      placeholder="Pioneered digital art..."
                    />
                  </div>

                  {/* Milestone 4 */}
                  <div className="bg-white p-3 rounded-lg border">
                    <label className="block text-[11px] font-bold text-gray-600">Milestone 4 Year</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone4Year || ''}
                      onChange={(e) => handleInputChange('aboutMilestone4Year', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="2023"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Milestone 4 Title</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone4Title || ''}
                      onChange={(e) => handleInputChange('aboutMilestone4Title', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="Global Expansion"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutMilestone4Description || ''}
                      onChange={(e) => handleInputChange('aboutMilestone4Description', e.target.value)}
                      className="input mt-1 text-[11px]"
                      placeholder="Expanded to countries..."
                    />
                  </div>

                  {/* Milestone 5 */}
                  <div className="bg-white p-3 rounded-lg border">
                    <label className="block text-[11px] font-bold text-gray-600">Milestone 5 Year</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone5Year || ''}
                      onChange={(e) => handleInputChange('aboutMilestone5Year', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="2024"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Milestone 5 Title</label>
                    <input
                      type="text"
                      value={settings.aboutMilestone5Title || ''}
                      onChange={(e) => handleInputChange('aboutMilestone5Title', e.target.value)}
                      className="input mt-1 text-xs"
                      placeholder="Artist Hub"
                    />
                    <label className="block text-[10px] text-gray-500 mt-2">Description</label>
                    <textarea
                      rows={2}
                      value={settings.aboutMilestone5Description || ''}
                      onChange={(e) => handleInputChange('aboutMilestone5Description', e.target.value)}
                      className="input mt-1 text-[11px]"
                      placeholder="Launched supportive hub..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="card font-sans">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <Compass size={22} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Call-to-Action Panel (Join Our Creative Community)</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Banner Heading Title</label>
                <input
                  type="text"
                  value={settings.aboutCtaTitle || ''}
                  onChange={(e) => handleInputChange('aboutCtaTitle', e.target.value)}
                  className="input"
                  placeholder="Join Our Creative Community"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Banner Subtitle Subheading</label>
                <textarea
                  rows={2}
                  value={settings.aboutCtaSubtitle || ''}
                  onChange={(e) => handleInputChange('aboutCtaSubtitle', e.target.value)}
                  className="input"
                  placeholder="Whether you're an artist, collector, or art enthusiast, there's a place for you..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button 1 Label Text (Primary Red)</label>
                  <input
                    type="text"
                    value={settings.aboutCtaButton1Text || ''}
                    onChange={(e) => handleInputChange('aboutCtaButton1Text', e.target.value)}
                    className="input"
                    placeholder="Join as Artist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CTA Button 2 Label Text (Secondary White)</label>
                  <input
                    type="text"
                    value={settings.aboutCtaButton2Text || ''}
                    onChange={(e) => handleInputChange('aboutCtaButton2Text', e.target.value)}
                    className="input"
                    placeholder="Explore Events"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
