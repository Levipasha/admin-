import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, MapPin, Palette, Mail, Instagram, Link2, Upload, Image, X, Save, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { artDistrictAPI } from '../services/api';

const ArtDistrict = () => {
  // ─── State ─────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState({ passes: [], heroImages: [], testimonials: [] });
  const [savingConfig, setSavingConfig] = useState(false);

  // Gallery
  const [galleryImages, setGalleryImages] = useState([]);
  const [savingGallery, setSavingGallery] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const galleryFileRef = useRef(null);

  // Active tab
  const [activeTab, setActiveTab] = useState('pricing');

  // Registrations
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [artSearchTerm, setArtSearchTerm] = useState('');
  const [artFilterCategory, setArtFilterCategory] = useState('');
  const [artFilterPass, setArtFilterPass] = useState('');

  // Manual member modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [manualMember, setManualMember] = useState({
    fullName: '', email: '', insta: '', category: '',
    passType: 'Sketch Pass (Daily)', paymentMethod: 'UPI'
  });
  const [submittingMember, setSubmittingMember] = useState(false);

  // ─── Load on mount ─────────────────────────────────────────
  useEffect(() => {
    fetchConfig();
    fetchRegistrations();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await artDistrictAPI.getConfig();
      setConfig({
        passes: data.passes || [],
        heroImages: data.heroImages || [],
        testimonials: data.testimonials || []
      });
      setGalleryImages(data.galleryImages || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load ArtDistrict config');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    setLoadingRegs(true);
    try {
      const params = {};
      if (artSearchTerm)    params.search   = artSearchTerm;
      if (artFilterCategory) params.category = artFilterCategory;
      if (artFilterPass)    params.passType  = artFilterPass;
      const data = await artDistrictAPI.getRegistrations(params);
      setRegistrations(data.registrations || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load registrations');
    } finally {
      setLoadingRegs(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchRegistrations();
  }, [artSearchTerm, artFilterCategory, artFilterPass]);

  // ─── Save config (prices + payment link) ───────────────────
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await artDistrictAPI.updateConfig(config);
      toast.success('Pricing & payment link saved!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save config');
    } finally {
      setSavingConfig(false);
    }
  };

  // ─── Gallery management ────────────────────────────────────
  const handleAddImageByUrl = () => {
    if (!newImageUrl.trim()) { toast.error('Please enter an image URL'); return; }
    setGalleryImages(prev => [
      ...prev,
      { url: newImageUrl.trim(), caption: newImageCaption.trim(), alt: newImageCaption.trim(), order: prev.length }
    ]);
    setNewImageUrl('');
    setNewImageCaption('');
  };

  const handleRemoveGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadGalleryFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await artDistrictAPI.uploadGalleryImage(file);
      setGalleryImages(prev => [
        ...prev,
        { url: result.url || result.secure_url, caption: file.name.replace(/\.[^.]+$/, ''), alt: '', order: prev.length }
      ]);
      toast.success('Image uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Using URL paste instead.');
    } finally {
      setUploading(false);
      if (galleryFileRef.current) galleryFileRef.current.value = '';
    }
  };

  const handleSaveGallery = async () => {
    setSavingGallery(true);
    try {
      await artDistrictAPI.updateGallery(galleryImages);
      toast.success('Gallery images saved! Changes live on /art-district');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save gallery');
    } finally {
      setSavingGallery(false);
    }
  };

  // ─── Delete registration ───────────────────────────────────
  const handleDeleteRegistration = async (id, memberId) => {
    if (!window.confirm(`Delete pass ${memberId}?`)) return;
    try {
      await artDistrictAPI.deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r._id !== id));
      toast.success(`Pass ${memberId} deleted`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete registration');
    }
  };

  // ─── Add manual member ─────────────────────────────────────
  const handleAddManualMember = async (e) => {
    e.preventDefault();
    if (!manualMember.fullName.trim() || !manualMember.email.trim() || !manualMember.category) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmittingMember(true);
    try {
      const reg = await artDistrictAPI.createRegistration({
        fullName:      manualMember.fullName,
        email:         manualMember.email,
        insta:         manualMember.insta,
        category:      manualMember.category,
        passType:      manualMember.passType,
        paymentMethod: manualMember.paymentMethod
      });
      setRegistrations(prev => [reg, ...prev]);
      setManualMember({ fullName: '', email: '', insta: '', category: '', passType: 'Sketch Pass (Daily)', paymentMethod: 'UPI' });
      setShowAddMemberModal(false);
      toast.success(`Pass ${reg.memberId} created!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create pass');
    } finally {
      setSubmittingMember(false);
    }
  };

  // ─── Filtered registrations ────────────────────────────────
  const filteredRegistrations = registrations.filter(reg => {
    const str = `${reg.fullName} ${reg.email} ${reg.memberId}`.toLowerCase();
    const matchSearch   = !artSearchTerm    || str.includes(artSearchTerm.toLowerCase());
    const matchCat      = !artFilterCategory || reg.category === artFilterCategory;
    const matchPass     = !artFilterPass     || (reg.passType || '').includes(artFilterPass);
    return matchSearch && matchCat && matchPass;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ArtDistrict Workspace Control</h1>
        <p className="text-gray-600 mt-1">Manage dynamic pass pricing, gallery images, payment link, and registrations</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-px">
        {[
          { id: 'pricing',  label: 'Pricing & Payment' },
          { id: 'content',  label: 'Hero & Testimonials' },
          { id: 'gallery',  label: 'Gallery Images' },
          { id: 'stats',    label: 'Statics' },
          { id: 'registrations', label: `Registrations (${registrations.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-medium text-sm rounded-t-lg border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-red-600 text-red-600 bg-red-50/40'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Pricing & Payment ── */}
      {activeTab === 'pricing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pricing card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Palette className="text-red-600" size={20} />
                Dynamic Entry Passes
              </h3>
              <button 
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, passes: [...prev.passes, { title: 'NEW PASS', subtitle: '', price: '0', period: '', features: [], paymentLink: '', iconType: 'palette', themeColor: 'black' }] }))}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Add Pass
              </button>
            </div>
            <p className="text-gray-500 text-xs mb-4">Set pricing tiers and features displayed on the <code>/art-district</code> landing page</p>

            <form onSubmit={handleSaveConfig} className="space-y-6">
              {config.passes.map((pass, passIndex) => (
                <div key={passIndex} className="p-4 border border-gray-200 rounded-lg relative bg-gray-50/50">
                  <button 
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, passes: prev.passes.filter((_, i) => i !== passIndex) }))}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                      <input type="text" value={pass.title} onChange={e => {
                        const newPasses = [...config.passes]; newPasses[passIndex].title = e.target.value; setConfig({...config, passes: newPasses});
                      }} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Subtitle</label>
                      <input type="text" value={pass.subtitle} onChange={e => {
                        const newPasses = [...config.passes]; newPasses[passIndex].subtitle = e.target.value; setConfig({...config, passes: newPasses});
                      }} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹)</label>
                      <input type="number" min="0" value={pass.price} onChange={e => {
                        const newPasses = [...config.passes]; newPasses[passIndex].price = e.target.value; setConfig({...config, passes: newPasses});
                      }} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Period (e.g. per week)</label>
                      <input type="text" value={pass.period} onChange={e => {
                        const newPasses = [...config.passes]; newPasses[passIndex].period = e.target.value; setConfig({...config, passes: newPasses});
                      }} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Icon</label>
                      <select value={pass.iconType} onChange={e => {
                        const newPasses = [...config.passes]; newPasses[passIndex].iconType = e.target.value; setConfig({...config, passes: newPasses});
                      }} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="palette">Palette</option>
                        <option value="layers">Layers</option>
                        <option value="crown">Crown</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Theme / Button Color</label>
                      <select value={pass.themeColor} onChange={e => {
                        const newPasses = [...config.passes]; newPasses[passIndex].themeColor = e.target.value; setConfig({...config, passes: newPasses});
                      }} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="black">Black Background (Fill Black)</option>
                        <option value="white">White Background (Fill White)</option>
                        <option value="red">Red Background (Fill Red)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">Features</label>
                    <div className="space-y-2">
                      {pass.features.map((feat, featIndex) => (
                        <div key={featIndex} className="flex items-center gap-2">
                          <textarea value={feat} onChange={e => {
                            const newPasses = [...config.passes]; newPasses[passIndex].features[featIndex] = e.target.value; setConfig({...config, passes: newPasses});
                          }} className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[40px] resize-y" rows={1} />
                          <button type="button" onClick={() => {
                            const newPasses = [...config.passes]; newPasses[passIndex].features = newPasses[passIndex].features.filter((_, i) => i !== featIndex); setConfig({...config, passes: newPasses});
                          }} className="text-gray-400 hover:text-red-600 cursor-pointer"><Trash2 size={14}/></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => {
                        const newPasses = [...config.passes]; newPasses[passIndex].features.push(''); setConfig({...config, passes: newPasses});
                      }} className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 mt-1 cursor-pointer"><Plus size={12}/> Add Feature</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1"><Link2 size={13} /> Payment Link (Optional)</label>
                    <input type="url" value={pass.paymentLink} onChange={e => {
                      const newPasses = [...config.passes]; newPasses[passIndex].paymentLink = e.target.value; setConfig({...config, passes: newPasses});
                    }} placeholder="https://razorpay.me/..." className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={savingConfig}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
              >
                <Save size={16} />
                {savingConfig ? 'Saving…' : 'Save Passes'}
              </button>
            </form>
          </div>

          {/* Live overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="text-red-600" size={20} />
              Live Registry Overview
            </h3>
            <p className="text-gray-500 text-xs mb-4">Total active passes and artist categories</p>
            <div className="space-y-3">
              {[
                { label: 'Total Passes Active', value: registrations.length },
                { label: 'Painters / Fine Artists', value: registrations.filter(r => r.category === 'Painter').length },
                { label: 'Sculptors', value: registrations.filter(r => r.category === 'Sculptor').length },
                { label: 'Digital Artists', value: registrations.filter(r => r.category === 'Digital Artist').length },
                { label: 'Other Creators', value: registrations.filter(r => !['Painter','Sculptor','Digital Artist'].includes(r.category)).length }
              ].map((item, i) => (
                <div key={i} className={`flex justify-between items-center text-sm py-2 ${i < 4 ? 'border-b border-gray-100' : ''}`}>
                  <span className="text-gray-600">{item.label}:</span>
                  <span className="font-bold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Content Management ── */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Save Button for Content */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Save size={18} />
              {savingConfig ? 'Saving...' : 'Save All Content'}
            </button>
          </div>

          {/* Hero Images Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="text-red-600" size={20} /> Hero Images (Exactly 5)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[0, 1, 2, 3, 4].map(idx => (
                <div key={idx} className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Image {idx + 1}</div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={config.heroImages[idx] || ''}
                      onChange={(e) => {
                        const newHero = [...config.heroImages];
                        newHero[idx] = e.target.value;
                        setConfig({ ...config, heroImages: newHero });
                      }}
                      placeholder="Image URL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <label className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-lg cursor-pointer transition-colors shrink-0" title="Upload Image">
                      <Upload size={16} />
                      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const result = await artDistrictAPI.uploadGalleryImage(file);
                          const newHero = [...config.heroImages];
                          newHero[idx] = result.url || result.secure_url;
                          setConfig({ ...config, heroImages: newHero });
                          toast.success('Image uploaded!');
                        } catch(err) {
                          toast.error('Upload failed');
                        } finally {
                          setUploading(false);
                          e.target.value = '';
                        }
                      }} />
                    </label>
                  </div>
                  {config.heroImages[idx] && (
                    <img src={config.heroImages[idx]} alt="preview" className="w-full h-24 object-cover rounded-lg" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials Editor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-red-600" size={20} /> Testimonials
              </h3>
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, testimonials: [...prev.testimonials, { text: '', name: 'New Creator', jobtitle: '', image: '', social: '' }] }))}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Add Testimonial
              </button>
            </div>
            
            <div className="space-y-4">
              {config.testimonials.map((testim, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                  <button
                    onClick={() => {
                      const newTests = [...config.testimonials];
                      newTests.splice(index, 1);
                      setConfig({ ...config, testimonials: newTests });
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Quote</label>
                        <textarea
                          value={testim.text}
                          onChange={e => {
                            const newTests = [...config.testimonials];
                            newTests[index].text = e.target.value;
                            setConfig({ ...config, testimonials: newTests });
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm h-24"
                          placeholder="What did they say?"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={testim.name}
                            onChange={e => {
                              const newTests = [...config.testimonials];
                              newTests[index].name = e.target.value;
                              setConfig({ ...config, testimonials: newTests });
                            }}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Role / Job Title</label>
                          <input
                            type="text"
                            value={testim.jobtitle}
                            onChange={e => {
                              const newTests = [...config.testimonials];
                              newTests[index].jobtitle = e.target.value;
                              setConfig({ ...config, testimonials: newTests });
                            }}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={testim.image}
                            onChange={e => {
                              const newTests = [...config.testimonials];
                              newTests[index].image = e.target.value;
                              setConfig({ ...config, testimonials: newTests });
                            }}
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            placeholder="https://images.unsplash.com/..."
                          />
                          <label className="flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 rounded-lg cursor-pointer transition-colors shrink-0" title="Upload Profile Picture">
                            <Upload size={16} />
                            <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploading(true);
                              try {
                                const result = await artDistrictAPI.uploadGalleryImage(file);
                                const newTests = [...config.testimonials];
                                newTests[index].image = result.url || result.secure_url;
                                setConfig({ ...config, testimonials: newTests });
                                toast.success('Profile picture uploaded!');
                              } catch(err) {
                                toast.error('Upload failed');
                              } finally {
                                setUploading(false);
                                e.target.value = '';
                              }
                            }} />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Gallery Images ── */}
      {activeTab === 'gallery' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Image size={20} className="text-red-600" /> Community Gallery Images
              </h3>
              <p className="text-gray-500 text-xs mt-1">
                These images appear in the Community Gallery section on <code>/art-district</code>. Changes go live after saving.
              </p>
            </div>
            <button
              onClick={handleSaveGallery}
              disabled={savingGallery}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <Save size={16} />
              {savingGallery ? 'Saving…' : 'Save Gallery'}
            </button>
          </div>

          {/* Add by URL */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-700 uppercase">Add Image by URL</p>
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="url"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <input
                type="text"
                value={newImageCaption}
                onChange={e => setNewImageCaption(e.target.value)}
                placeholder="Caption (optional)"
                className="w-full md:w-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
              <button
                onClick={handleAddImageByUrl}
                className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {/* Or upload file */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs text-gray-400">— or upload file —</span>
              <input ref={galleryFileRef} type="file" accept="image/*" onChange={handleUploadGalleryFile} className="hidden" />
              <button
                onClick={() => galleryFileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Upload size={14} />
                {uploading ? 'Uploading…' : 'Upload Image'}
              </button>
            </div>
          </div>

          {/* Current gallery grid */}
          {galleryImages.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No gallery images yet. Add some above — the page will show default images until saved.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {galleryImages.map((img, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
                  <img
                    src={img.url}
                    alt={img.alt || img.caption || `Gallery ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = 'https://via.placeholder.com/200?text=Error'; }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    {img.caption && <span className="text-white text-[10px] text-center line-clamp-2">{img.caption}</span>}
                    <button
                      onClick={() => handleRemoveGalleryImage(i)}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <span className="absolute top-1 left-1 bg-black/50 text-white text-[9px] rounded px-1">{i + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Statics ── */}
      {activeTab === 'stats' && (
        <form onSubmit={handleSaveConfig} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-red-600" size={20} />
              Hero Statics
            </h3>
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, stats: [...(prev.stats || []), { num: '0', label: 'New Stat' }] }))}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Stat
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(config.stats || []).map((stat, i) => (
              <div key={i} className="flex gap-3 items-center border border-gray-100 p-3 rounded-lg bg-gray-50">
                <input
                  type="text"
                  placeholder="Number (e.g. 450+)"
                  value={stat.num}
                  onChange={e => {
                    const newStats = [...(config.stats || [])];
                    newStats[i].num = e.target.value;
                    setConfig(prev => ({ ...prev, stats: newStats }));
                  }}
                  className="w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <input
                  type="text"
                  placeholder="Label (e.g. Artists)"
                  value={stat.label}
                  onChange={e => {
                    const newStats = [...(config.stats || [])];
                    newStats[i].label = e.target.value;
                    setConfig(prev => ({ ...prev, stats: newStats }));
                  }}
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== i) }))}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={savingConfig}
              className="bg-black hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-bold text-sm tracking-wide transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} /> {savingConfig ? 'Saving...' : 'Save Statics'}
            </button>
          </div>
        </form>
      )}

      {/* ── TAB: Registrations ── */}
      {activeTab === 'registrations' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Artist Pass Registry Log</h3>
              <p className="text-gray-500 text-xs mt-1">View all registrations from MongoDB. Issue walk-in passes manually.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRegistrations}
                disabled={loadingRegs}
                className="flex items-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={loadingRegs ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus size={16} /> Issue Walk-in Pass
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Name, Email or Member ID…"
                value={artSearchTerm}
                onChange={e => setArtSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs bg-gray-50/50"
              />
            </div>
            <select value={artFilterCategory} onChange={e => setArtFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs cursor-pointer bg-white text-gray-700">
              <option value="">All Categories</option>
              <option value="Painter">Painter / Fine Artist</option>
              <option value="Sculptor">Sculptor</option>
              <option value="Digital Artist">Digital Artist / Designer</option>
              <option value="Writer">Writer / Poet</option>
              <option value="Musician">Musician / Producer</option>
              <option value="Photographer">Photographer / Filmmaker</option>
              <option value="Other">Other Creative</option>
            </select>
            <select value={artFilterPass} onChange={e => setArtFilterPass(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs cursor-pointer bg-white text-gray-700">
              <option value="">All Passes</option>
              <option value="Daily">Daily Sketch Pass</option>
              <option value="Weekly">Weekly Studio Pass</option>
              <option value="Monthly">Monthly Studio Pass</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-100">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Artist / Member','Category','Pass Type & Price','Validity Period','Member ID','Source','Actions'].map(h => (
                    <th key={h} className="px-5 py-4 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingRegs ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-xs">Loading…</td></tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-xs">No registrations found.</td></tr>
                ) : filteredRegistrations.map(reg => (
                  <tr key={reg._id} className="hover:bg-gray-50/50 transition-colors bg-white">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 text-red-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {reg.initials || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-gray-900">{reg.fullName}</p>
                          <span className="text-gray-500 text-[10px] flex items-center gap-1"><Mail size={10} />{reg.email}</span>
                          {reg.insta && <span className="text-red-500 text-[10px] flex items-center gap-1 font-medium"><Instagram size={10} />{reg.insta}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-600 font-medium">{reg.category}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-full ${
                        reg.passType?.includes('Daily')   ? 'bg-orange-50 text-orange-600 border border-orange-200' :
                        reg.passType?.includes('Weekly')  ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                            'bg-purple-50 text-purple-600 border border-purple-200'
                      }`}>{reg.passType}</span>
                      <p className="text-xs font-extrabold text-gray-900 mt-1">{reg.price}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">
                      <p className="text-[11px] font-medium text-gray-700"><span className="text-gray-400">From:</span> {reg.validFrom}</p>
                      <p className="text-[11px] font-medium text-gray-700"><span className="text-gray-400">Thru:</span> {reg.validThru}</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono font-bold text-gray-700">{reg.memberId}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-semibold rounded-full ${
                        reg.source === 'manual' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>{reg.source === 'manual' ? 'Walk-in' : 'Online'}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDeleteRegistration(reg._id, reg.memberId)}
                        className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer inline-flex border border-transparent hover:border-red-100"
                        title="Delete Pass"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal: Issue Walk-in Pass ── */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="bg-red-600 px-6 py-5 flex justify-between items-center text-white">
              <div>
                <h3 className="font-bold text-base">Issue Walk-in Pass</h3>
                <p className="text-xs text-red-100 mt-0.5">Register a new member from the desk</p>
              </div>
              <button onClick={() => setShowAddMemberModal(false)}
                className="text-white hover:text-red-200 font-bold text-xl cursor-pointer w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">×</button>
            </div>

            <form onSubmit={handleAddManualMember} className="p-6 space-y-4">
              {[
                { label: 'Full Name *', field: 'fullName', type: 'text', placeholder: 'Ananya Reddy' },
                { label: 'Email Address *', field: 'email', type: 'email', placeholder: 'ananya@example.com' },
                { label: 'Instagram Handle', field: 'insta', type: 'text', placeholder: '@ananya.art' },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={manualMember[field]}
                    onChange={e => setManualMember(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                    required={field !== 'insta'}
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category *</label>
                  <select value={manualMember.category}
                    onChange={e => setManualMember(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs bg-white" required>
                    <option value="" disabled>Select</option>
                    <option value="Painter">Painter</option>
                    <option value="Sculptor">Sculptor</option>
                    <option value="Digital Artist">Digital Artist</option>
                    <option value="Writer">Writer</option>
                    <option value="Musician">Musician</option>
                    <option value="Photographer">Photographer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pass Type *</label>
                  <select value={manualMember.passType}
                    onChange={e => setManualMember(prev => ({ ...prev, passType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-xs bg-white">
                    <option value="Sketch Pass (Daily)">Sketch Pass (Daily)</option>
                    <option value="Studio Pass (Weekly)">Studio Pass (Weekly)</option>
                    <option value="Studio Pass (Monthly)">Studio Pass (Monthly)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submittingMember}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                  {submittingMember ? 'Creating…' : 'Generate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtDistrict;
