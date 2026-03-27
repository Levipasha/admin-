import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { Search, Filter, Plus, Edit, Trash2, Calendar, MapPin, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Events = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: 'meetup',
    status: 'draft',
    startDate: '',
    locationType: 'physical',
    eventLink: '',
    platform: '',
    venue: '',
    city: '',
    country: ''
  });

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getEvents({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter
      });
      setEvents(response.events);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Events fetch error:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await adminAPI.deleteEvent(eventId);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Delete event error:', error);
        toast.error('Failed to delete event');
      }
    }
  };

  const openEdit = (event) => {
    setEditingEvent(event);
    setEditForm({
      title: event?.title || '',
      description: event?.description || '',
      category: event?.category || 'meetup',
      status: event?.status || 'draft',
      startDate: event?.date?.start ? new Date(event.date.start).toISOString().slice(0, 16) : '',
      locationType: event?.location?.type || 'physical',
      eventLink: event?.location?.virtualLink || '',
      platform: event?.location?.platform || '',
      venue: event?.location?.venue || event?.location?.address || '',
      city: event?.location?.city || '',
      country: event?.location?.country || ''
    });
  };

  const closeEdit = () => {
    setEditingEvent(null);
    setSaving(false);
  };

  const saveEdit = async () => {
    if (!editingEvent?._id) return;
    try {
      setSaving(true);
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        category: editForm.category,
        status: editForm.status,
        date: {
          start: editForm.startDate ? new Date(editForm.startDate).toISOString() : editingEvent?.date?.start,
          end: editingEvent?.date?.end || (editForm.startDate ? new Date(editForm.startDate).toISOString() : undefined)
        },
        location: {
          ...(editingEvent?.location || {}),
          type: editForm.locationType,
          virtualLink: editForm.eventLink.trim(),
          platform: editForm.platform.trim(),
          address: editForm.venue.trim(),
          venue: editForm.venue.trim(),
          city: editForm.city.trim(),
          country: editForm.country.trim()
        }
      };

      const updated = await adminAPI.updateEvent(editingEvent._id, payload);
      setEvents((prev) => prev.map((ev) => (ev._id === updated._id ? updated : ev)));
      toast.success('Event updated successfully');
      closeEdit();
    } catch (error) {
      console.error('Update event error:', error);
      toast.error(error?.response?.data?.error || 'Failed to update event');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'exhibition': return 'bg-purple-100 text-purple-800';
      case 'workshop': return 'bg-orange-100 text-orange-800';
      case 'meetup': return 'bg-teal-100 text-teal-800';
      case 'networking': return 'bg-indigo-100 text-indigo-800';
      case 'auction': return 'bg-rose-100 text-rose-800';
      case 'festival': return 'bg-amber-100 text-amber-800';
      case 'webinar': return 'bg-sky-100 text-sky-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Management</h1>
          <p className="text-gray-600 mt-1">Organize exhibitions, workshops, and meetups</p>
        </div>
        <button className="btn-primary">
          <Plus size={20} className="mr-2" />
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            </select>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            <option value="exhibition">Exhibition</option>
            <option value="workshop">Workshop</option>
            <option value="meetup">Meetup</option>
            <option value="networking">Networking</option>
            <option value="auction">Auction</option>
            <option value="festival">Festival</option>
            <option value="webinar">Webinar</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            {pagination.count} events
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event._id} className="card p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Event Image */}
              <div className="lg:w-48 lg:h-32 w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {event.images && event.images.length > 0 ? (
                  <img 
                    src={event.images[0]?.url || event.images[0]} 
                    alt={event.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Calendar size={48} className="text-gray-400" />
                )}
              </div>

              {/* Event Details */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Date & Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <div>
                      <div>{formatDate(event.date.start)}</div>
                      <div className="text-xs">{formatTime(event.date.start)}</div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <div>
                      <div>
                        {event.location?.type === 'virtual'
                          ? (event.location?.platform || 'Virtual')
                          : (event.location?.address || 'Location')}
                      </div>
                      <div className="text-xs">
                        {event.location?.city || event.location?.country || ''}
                      </div>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <div>
                      <div>{event.capacity.current} / {event.capacity.max}</div>
                      <div className="text-xs">Attendees</div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} />
                    <div>
                      <div>
                        {event.pricing?.type === 'free'
                          ? 'Free'
                          : `${event.pricing?.currency || ''} ${Number(event.pricing?.amount || 0).toLocaleString()}`}
                      </div>
                      <div className="text-xs">{event.pricing?.type}</div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {event.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{event.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="btn-secondary flex items-center gap-1">
                    <Calendar size={16} />
                    View Details
                  </button>
                  <button
                    className="btn-secondary flex items-center gap-1"
                    onClick={() => openEdit(event)}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteEvent(event._id)}
                    className="btn-danger flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.total > 1 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
          <div className="text-sm text-gray-600">
            Showing {((pagination.current - 1) * 10) + 1} to {Math.min(pagination.current * 10, pagination.count)} of {pagination.count} events
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="btn-secondary px-3 py-1 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.current} of {pagination.total}
            </span>
            <button
              onClick={() => setCurrentPage(pagination.current + 1)}
              disabled={pagination.current >= pagination.total}
              className="btn-secondary px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
            <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[calc(100vh-2rem)] flex flex-col">
              <div className="p-6 border-b flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">Edit event</div>
                <button className="btn-secondary px-3 py-1" onClick={closeEdit} disabled={saving}>Close</button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input className="input" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea className="input min-h-[90px]" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select className="input" value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}>
                    <option value="exhibition">Exhibition</option>
                    <option value="workshop">Workshop</option>
                    <option value="meetup">Meetup</option>
                    <option value="networking">Networking</option>
                    <option value="auction">Auction</option>
                    <option value="festival">Festival</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input" value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
                  <input type="datetime-local" className="input" value={editForm.startDate} onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location type</label>
                  <select
                    className="input"
                    value={editForm.locationType}
                    onChange={(e) => setEditForm((f) => ({ ...f, locationType: e.target.value }))}
                  >
                    <option value="physical">Physical</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event link (editable)</label>
                  <input
                    className="input"
                    placeholder="https://..."
                    value={editForm.eventLink}
                    onChange={(e) => setEditForm((f) => ({ ...f, eventLink: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <input
                    className="input"
                    placeholder="Zoom / Meet / Teams"
                    value={editForm.platform}
                    onChange={(e) => setEditForm((f) => ({ ...f, platform: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue / Address</label>
                  <input className="input" value={editForm.venue} onChange={(e) => setEditForm((f) => ({ ...f, venue: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input className="input" value={editForm.city} onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input className="input" value={editForm.country} onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))} />
                </div>
              </div>

              <div className="p-6 border-t flex items-center justify-end gap-2">
                <button className="btn-secondary" onClick={closeEdit} disabled={saving}>Cancel</button>
                <button className="btn-primary" onClick={saveEdit} disabled={saving}>
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

export default Events;
