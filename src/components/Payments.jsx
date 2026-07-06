import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { CreditCard, Search, DollarSign, Award, AlertCircle, Trash2, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [viewingPayment, setViewingPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch payments error:', error);
      toast.error('Failed to fetch transaction logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction log? This action cannot be undone.')) {
      return;
    }
    try {
      setLoading(true);
      await adminAPI.deletePayment(id);
      toast.success('Transaction log deleted successfully');
      fetchPayments();
    } catch (error) {
      console.error('Delete payment log error:', error);
      toast.error('Failed to delete transaction log');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const nameMatch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = p.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const orderMatch = p.orderId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSearch = nameMatch || emailMatch || orderMatch;
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && p.type === activeTab;
  });

  // Calculate metrics
  const successPayments = payments.filter(p => p.status === 'success');
  const totalRevenue = successPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const membershipCount = successPayments.filter(p => p.type === 'membership').length;
  const eventCount = successPayments.filter(p => p.type === 'event').length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Transactions</h1>
          <p className="text-gray-600 text-sm">Monitor artist memberships and event transaction logs</p>
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Refresh Logs
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>

        {/* Card 2: Membership Subscriptions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Memberships</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{membershipCount} paid</h3>
          </div>
        </div>

        {/* Card 3: Event Ticket Sales */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Paid Registrations</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{eventCount} tickets</h3>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'all' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'}`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab('membership')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'membership' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Memberships
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'event' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Events
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name, email or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <p className="text-gray-500 text-sm mt-3">Loading transaction history...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-lg">No transactions found</p>
            <p className="text-sm text-gray-400 mt-1">Try modifying your search or filter options</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.type === 'membership' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {p.type === 'membership' ? 'Membership' : 'Event'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono whitespace-nowrap">
                      {p.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                        p.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 animate-pulse' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingPayment(p)}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1.5 hover:bg-blue-50 rounded-lg inline-flex items-center"
                          title="View Registration Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-600 hover:text-red-950 transition-colors p-1.5 hover:bg-red-50 rounded-lg inline-flex items-center"
                          title="Delete Transaction Log"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Transaction Details</h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{viewingPayment.orderId}</p>
              </div>
              <button
                onClick={() => setViewingPayment(null)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-500 font-medium block">Type</span>
                  <span className="font-bold text-gray-800 capitalize mt-0.5 block">{viewingPayment.type}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Amount</span>
                  <span className="font-bold text-gray-900 text-sm mt-0.5 block">₹{viewingPayment.amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Status</span>
                  <span className="font-bold text-green-700 capitalize mt-0.5 block">{viewingPayment.status}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium block">Date</span>
                  <span className="font-semibold text-gray-700 mt-0.5 block">{formatDate(viewingPayment.createdAt)}</span>
                </div>
              </div>

              {/* Form Responses / Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-100 pb-1">Submission Information</h4>
                
                {/* Fallback name and email if details structure is different */}
                <div className="flex flex-col border-b border-gray-50 pb-2">
                  <span className="text-xs font-semibold text-gray-500">Name</span>
                  <span className="text-sm text-gray-900 mt-0.5">{viewingPayment.details?.name || viewingPayment.details?.guestName || viewingPayment.name}</span>
                </div>

                <div className="flex flex-col border-b border-gray-50 pb-2">
                  <span className="text-xs font-semibold text-gray-500">Email</span>
                  <span className="text-sm text-gray-900 mt-0.5">{viewingPayment.details?.email || viewingPayment.details?.guestEmail || viewingPayment.email}</span>
                </div>

                {/* Membership Specific Details */}
                {viewingPayment.type === 'membership' && (
                  <>
                    {viewingPayment.details?.phone && (
                      <div className="flex flex-col border-b border-gray-50 pb-2">
                        <span className="text-xs font-semibold text-gray-500">Phone Number</span>
                        <span className="text-sm text-gray-900 mt-0.5">{viewingPayment.details.phone}</span>
                      </div>
                    )}
                    {viewingPayment.details?.artForm && (
                      <div className="flex flex-col border-b border-gray-50 pb-2">
                        <span className="text-xs font-semibold text-gray-500">Art Form</span>
                        <span className="text-sm text-gray-900 mt-0.5">{viewingPayment.details.artForm}</span>
                      </div>
                    )}
                    {viewingPayment.details?.bio && (
                      <div className="flex flex-col pb-1">
                        <span className="text-xs font-semibold text-gray-500">Bio / Details</span>
                        <span className="text-sm text-gray-900 mt-1 whitespace-pre-wrap leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100">{viewingPayment.details.bio}</span>
                      </div>
                    )}
                  </>
                )}

                {/* Event Specific Details */}
                {viewingPayment.type === 'event' && (
                  <>
                    {viewingPayment.details?.guestPhone && (
                      <div className="flex flex-col border-b border-gray-50 pb-2">
                        <span className="text-xs font-semibold text-gray-500">Phone Number</span>
                        <span className="text-sm text-gray-900 mt-0.5">{viewingPayment.details.guestPhone}</span>
                      </div>
                    )}

                    {viewingPayment.details?.responses && Array.isArray(viewingPayment.details.responses) && (
                      <div className="space-y-3 mt-3 pt-2 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider text-gray-500">Form Questions & Answers</span>
                        {viewingPayment.details.responses.map((resp, i) => (
                          <div key={i} className="flex flex-col border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                            <span className="text-xs font-semibold text-gray-500">{resp.fieldLabel}</span>
                            <span className="text-sm text-gray-900 mt-0.5 font-medium">{resp.value || '—'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end bg-gray-50">
              <button
                onClick={() => setViewingPayment(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
