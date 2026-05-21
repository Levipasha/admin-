import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Plus, Trash2, Edit, FileText, Users, ChevronUp, X, Eye, CheckCircle, XCircle, Copy, Link2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
];

const emptyField = () => ({
  label: '',
  type: 'text',
  placeholder: '',
  required: false,
  options: [],
  order: 0
});

const Forms = () => {
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [events, setEvents] = useState([]);
  const [editing, setEditing] = useState(null); // null = list, {} = create, {_id} = edit
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [form, setForm] = useState({
    eventId: '',
    title: '',
    description: '',
    fields: [emptyField()],
    isActive: true,
    maxSubmissions: ''
  });

  // Submissions viewer state
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsPagination, setSubmissionsPagination] = useState({ total: 0, page: 1, pages: 1 });

  useEffect(() => {
    loadForms();
    loadEvents();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getForms();
      setForms(data.forms || []);
    } catch (e) {
      console.error('Load forms error:', e);
      toast.error('Failed to load forms');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const data = await adminAPI.getEvents({ limit: 100 });
      setEvents(data.events || []);
    } catch (e) {
      console.error('Load events error:', e);
    }
  };

  const openCreate = () => {
    setEditing({ _id: 'new' });
    setForm({
      eventId: '',
      title: '',
      description: '',
      fields: [emptyField()],
      isActive: true,
      maxSubmissions: ''
    });
  };

  const openEdit = (f) => {
    setEditing(f);
    setForm({
      eventId: f.eventId?._id || f.eventId || '',
      title: f.title || '',
      description: f.description || '',
      fields: f.fields?.length ? f.fields.map(fld => ({ ...fld, options: fld.options || [] })) : [emptyField()],
      isActive: f.isActive ?? true,
      maxSubmissions: f.maxSubmissions || ''
    });
  };

  const closeModal = () => {
    setEditing(null);
    setViewingSubmissions(null);
  };

  const addField = () => {
    setForm(prev => ({ ...prev, fields: [...prev.fields, emptyField()] }));
  };

  const removeField = (index) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index, key, value) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, [key]: value } : f)
    }));
  };

  const updateFieldOptions = (index, value) => {
    const options = value.split(',').map(o => o.trim()).filter(Boolean);
    updateField(index, 'options', options);
  };

  const save = async () => {
    if (!form.title || !form.fields.length || !form.fields.some(f => f.label)) {
      toast.error('Title and at least one field with a label are required');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        ...form,
        maxSubmissions: form.maxSubmissions ? Number(form.maxSubmissions) : null,
        fields: form.fields.filter(f => f.label.trim())
      };

      if (editing?._id && editing._id !== 'new') {
        await adminAPI.updateForm(editing._id, payload);
        toast.success('Form updated');
      } else {
        await adminAPI.createForm(payload);
        toast.success('Form created');
      }
      closeModal();
      loadForms();
    } catch (e) {
      console.error('Save form error:', e);
      toast.error(e?.response?.data?.error || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this form and all its submissions?')) return;
    try {
      await adminAPI.deleteForm(id);
      toast.success('Form deleted');
      loadForms();
    } catch (e) {
      toast.error('Failed to delete form');
    }
  };

  const loadSubmissions = async (formId, page = 1) => {
    try {
      setSubmissionsLoading(true);
      const data = await adminAPI.getFormSubmissions(formId, { page, limit: 20 });
      setSubmissions(data.submissions || []);
      setSubmissionsPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (e) {
      console.error('Load submissions error:', e);
      toast.error('Failed to load submissions');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const openSubmissions = (f) => {
    setViewingSubmissions(f);
    loadSubmissions(f._id);
  };

  const updateStatus = async (submissionId, status) => {
    try {
      await adminAPI.updateSubmissionStatus(submissionId, status);
      toast.success(`Submission ${status}`);
      if (viewingSubmissions) loadSubmissions(viewingSubmissions._id, submissionsPagination.page);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  // ==================== LIST VIEW ====================
  if (!editing && !viewingSubmissions) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Event Forms</h1>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Create Form
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
        ) : forms.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText size={48} className="mx-auto mb-4" />
            <p className="text-lg">No forms created yet</p>
            <p className="text-sm">Create a standalone form or link one to an event</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {forms.map(f => {
              const publicUrl = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port.replace('3001','3000') : ''}/forms/${f._id}`;
              const handleCopy = () => {
                navigator.clipboard.writeText(publicUrl).then(() => {
                  setCopiedId(f._id);
                  toast.success('Form URL copied!');
                  setTimeout(() => setCopiedId(null), 2000);
                });
              };
              return (
              <div key={f._id} className="bg-white rounded-lg shadow p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{f.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {f.eventId?.title ? `Event: ${f.eventId.title} · ` : 'Standalone form · '}{f.fields?.length || 0} fields
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${f.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {f.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {f.maxSubmissions && (
                        <span className="text-xs text-gray-500">Max: {f.maxSubmissions}</span>
                      )}
                    </div>
                    {/* Shareable URL */}
                    <div className="flex items-center gap-2 mt-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <Link2 size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-600 font-mono flex-1 truncate">{publicUrl}</span>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer flex-shrink-0 ${
                          copiedId === f._id
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                        title="Copy shareable form URL"
                      >
                        <Copy size={12} /> {copiedId === f._id ? 'Copied!' : 'Copy'}
                      </button>
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                        title="Open form in new tab"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <button onClick={() => openSubmissions(f)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                      <Users size={16} /> {f.submissionCount || 0} submissions
                    </button>
                    <button onClick={() => openEdit(f)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => remove(f._id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    );
  }

  // ==================== SUBMISSIONS VIEW ====================
  if (viewingSubmissions) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              <ChevronUp size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
              <p className="text-sm text-gray-500">{viewingSubmissions.title} — {viewingSubmissions.eventId?.title || ''}</p>
            </div>
          </div>
          <span className="text-sm text-gray-500">{submissionsPagination.total} total</span>
        </div>

        {submissionsLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={48} className="mx-auto mb-4" />
            <p>No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map(sub => (
              <div key={sub._id} className="bg-white rounded-lg shadow p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{sub.guestName || 'Anonymous'}</p>
                    <p className="text-sm text-gray-500">{sub.guestEmail || 'No email'}</p>
                    <p className="text-xs text-gray-400">{new Date(sub.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(sub.status)}
                    <button onClick={() => updateStatus(sub._id, 'approved')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve">
                      <CheckCircle size={18} />
                    </button>
                    <button onClick={() => updateStatus(sub._id, 'rejected')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject">
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
                <div className="border-t pt-3 space-y-2">
                  {sub.responses.map((r, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="font-medium text-gray-600 min-w-[140px]">{r.fieldLabel}:</span>
                      <span className="text-gray-900">{r.value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {submissionsPagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: submissionsPagination.pages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => loadSubmissions(viewingSubmissions._id, page)}
                    className={`px-3 py-1 rounded text-sm ${page === submissionsPagination.page ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==================== FORM BUILDER ====================
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <ChevronUp size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {editing?._id && editing._id !== 'new' ? 'Edit Form' : 'Create Form'}
          </h1>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
          {saving ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Plus size={18} />}
          Save Form
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Form Settings */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Form Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event <span className="text-gray-400 font-normal">(optional)</span></label>
              <select
                className="input"
                value={form.eventId}
                onChange={(e) => setForm(prev => ({ ...prev, eventId: e.target.value }))}
              >
                <option value="">No event — standalone form</option>
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input className="input" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Registration Form" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="input min-h-[60px]" value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Optional description shown to users" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Submissions</label>
                <input type="number" className="input" value={form.maxSubmissions} onChange={(e) => setForm(prev => ({ ...prev, maxSubmissions: e.target.value }))} placeholder="Unlimited" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4 text-red-600 rounded" />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Field Builder */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Form Fields</h2>
              <button onClick={addField} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                <Plus size={16} /> Add Field
              </button>
            </div>

            <div className="space-y-4">
              {form.fields.map((field, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-medium text-gray-500">Field {index + 1}</span>
                    {form.fields.length > 1 && (
                      <button onClick={() => removeField(index)} className="text-red-500 hover:text-red-700">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input className="input text-sm" value={field.label} onChange={(e) => updateField(index, 'label', e.target.value)} placeholder="Field label" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select className="input text-sm" value={field.type} onChange={(e) => updateField(index, 'type', e.target.value)}>
                        {FIELD_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
                      <input className="input text-sm" value={field.placeholder} onChange={(e) => updateField(index, 'placeholder', e.target.value)} placeholder="Hint text" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={field.required} onChange={(e) => updateField(index, 'required', e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                        <span className="text-sm font-medium text-gray-700">Required</span>
                      </label>
                    </div>
                  </div>

                  {field.type === 'select' && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Options (comma separated)</label>
                      <input
                        className="input text-sm"
                        value={field.options.join(', ')}
                        onChange={(e) => updateFieldOptions(index, e.target.value)}
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye size={18} /> Preview
            </h2>
            <div className="space-y-3">
              {form.fields.filter(f => f.label).map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea className="input text-sm" placeholder={field.placeholder} disabled />
                  ) : field.type === 'select' ? (
                    <select className="input text-sm" disabled>
                      <option>{field.placeholder || 'Select...'}</option>
                      {field.options?.map((o, j) => <option key={j}>{o}</option>)}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <input type="checkbox" className="w-4 h-4" disabled />
                  ) : (
                    <input type={field.type} className="input text-sm" placeholder={field.placeholder} disabled />
                  )}
                </div>
              ))}
              {form.fields.filter(f => f.label).length === 0 && (
                <p className="text-gray-400 text-sm">Add fields with labels to see preview</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forms;
