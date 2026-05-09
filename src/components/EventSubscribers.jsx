import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import { Users, Trash2, Search, Mail, CheckCircle, XCircle, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EventSubscribers = () => {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, thisMonth: 0 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    loadSubscribers();
  }, [pagination.page, search, filter]);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const params = { 
        page: pagination.page, 
        limit: 20,
        search: search.trim() || undefined
      };
      
      if (filter !== 'all') {
        params.isActive = filter === 'active';
      }

      const data = await adminAPI.getSubscribers(params);
      setSubscribers(data.subscribers || []);
      setStats(data.stats || { total: 0, active: 0, inactive: 0, thisMonth: 0 });
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (e) {
      console.error('Load subscribers error:', e);
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subscriber?')) return;
    try {
      await adminAPI.deleteSubscriber(id);
      toast.success('Subscriber deleted');
      loadSubscribers();
    } catch (e) {
      toast.error('Failed to delete subscriber');
    }
  };

  const handleToggleStatus = async (subscriber) => {
    try {
      await adminAPI.updateSubscriber(subscriber._id, { isActive: !subscriber.isActive });
      toast.success(`Subscriber ${subscriber.isActive ? 'deactivated' : 'activated'}`);
      loadSubscribers();
    } catch (e) {
      toast.error('Failed to update subscriber');
    }
  };

  const exportCSV = () => {
    const headers = ['Email', 'Name', 'City', 'Status', 'Subscribed Date'];
    const rows = subscribers.map(s => [
      s.email,
      s.name || '',
      s.city || '',
      s.isActive ? 'Active' : 'Inactive',
      new Date(s.createdAt).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const StatCard = ({ title, value, color }) => (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" /> Event Subscribers
        </h1>
        <button 
          onClick={exportCSV}
          disabled={subscribers.length === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total" value={stats.total} color="border-blue-500" />
        <StatCard title="Active" value={stats.active} color="border-green-500" />
        <StatCard title="Inactive" value={stats.inactive} color="border-red-500" />
        <StatCard title="This Month" value={stats.thisMonth} color="border-purple-500" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, name or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
          >
            <option value="all">All Subscribers</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Subscribers List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : subscribers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Mail size={48} className="mx-auto mb-4" />
          <p className="text-lg">No subscribers yet</p>
          <p className="text-sm">Subscribers will appear here when users subscribe on the events page</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscribers.map((sub) => (
                  <tr key={sub._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <span className="text-gray-900">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{sub.name || '—'}</td>
                    <td className="px-6 py-4 text-gray-700">{sub.city || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {sub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          className={`p-2 rounded-lg ${sub.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                          title={sub.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {sub.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 p-4 border-t">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, page }))}
                  className={`px-3 py-1 rounded text-sm ${page === pagination.page ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
};

export default EventSubscribers;
