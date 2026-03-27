import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, Package, Calendar, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setStats(response.stats);
      setRecentActivity(response.recentActivity);
    } catch (error) {
      console.error('Dashboard data error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend = null }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 text-sm">
              {trend > 0 ? (
                <TrendingUp size={16} className="text-green-500 mr-1" />
              ) : (
                <TrendingDown size={16} className="text-red-500 mr-1" />
              )}
              <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon size={24} className={`text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ActivityCard = ({ title, items, type }) => {
    const getIcon = (itemType) => {
      switch (itemType) {
        case 'user': return Users;
        case 'product': return Package;
        case 'event': return Calendar;
        default: return Eye;
      }
    };

    const getColor = (itemType) => {
      switch (itemType) {
        case 'user': return 'blue';
        case 'product': return 'green';
        case 'event': return 'purple';
        default: return 'gray';
      }
    };

    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {items?.map((item, index) => {
            const Icon = getIcon(type);
            const color = getColor(type);
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-${color}-100`}>
                    <Icon size={16} className={`text-${color}-600`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {type === 'user' ? item.displayName : 
                       type === 'product' ? item.name : 
                       item.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {type === 'user' ? item.email :
                       type === 'product' ? `$${item.price}` :
                       new Date(item.date?.start || item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {type === 'user' && (
                    <span className={`px-2 py-1 text-xs rounded-full bg-${color}-100 text-${color}-800`}>
                      {item.role}
                    </span>
                  )}
                  {type === 'product' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {item.status}
                    </span>
                  )}
                  {type === 'event' && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Monitor your art marketplace performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="blue"
          trend={12}
        />
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts || 0} 
          icon={Package} 
          color="green"
          trend={8}
        />
        <StatCard 
          title="Total Events" 
          value={stats?.totalEvents || 0} 
          icon={Calendar} 
          color="purple"
          trend={-3}
        />
        <StatCard 
          title="Artists" 
          value={stats?.totalArtists || 0} 
          icon={Users} 
          color="orange"
          trend={15}
        />
        <StatCard 
          title="Available Products" 
          value={stats?.availableProducts || 0} 
          icon={Package} 
          color="teal"
          trend={5}
        />
        <StatCard 
          title="Upcoming Events" 
          value={stats?.upcomingEvents || 0} 
          icon={Calendar} 
          color="pink"
          trend={20}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ActivityCard 
          title="Recent Users" 
          items={recentActivity?.users} 
          type="user"
        />
        <ActivityCard 
          title="Recent Products" 
          items={recentActivity?.products} 
          type="product"
        />
        <ActivityCard 
          title="Recent Events" 
          items={recentActivity?.events} 
          type="event"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary p-4 text-left">
            <Users size={20} className="mb-2" />
            <div className="font-medium">Add User</div>
            <div className="text-sm opacity-90">Create new user account</div>
          </button>
          <button className="btn-primary p-4 text-left">
            <Package size={20} className="mb-2" />
            <div className="font-medium">Add Product</div>
            <div className="text-sm opacity-90">List new artwork</div>
          </button>
          <button className="btn-primary p-4 text-left">
            <Calendar size={20} className="mb-2" />
            <div className="font-medium">Create Event</div>
            <div className="text-sm opacity-90">Organize new event</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
