import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FiUsers, FiBookOpen, FiTrendingUp, FiActivity } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dark-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and analytics</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={FiUsers} title="Total Users" value={stats?.totalUsers} subtitle={`${stats?.totalStudents} students, ${stats?.totalInstructors} instructors`} color="text-blue-500 bg-blue-50" />
          <StatCard icon={FiBookOpen} title="Total Courses" value={stats?.totalCourses} subtitle={`${stats?.publishedCourses} published`} color="text-purple-500 bg-purple-50" />
          <StatCard icon={FiTrendingUp} title="Total Enrollments" value={stats?.totalEnrollments} subtitle={`+${stats?.recentEnrollments} in last 30 days`} color="text-emerald-500 bg-emerald-50" />
          <StatCard icon={FiActivity} title="Completion Rate" value={`${stats?.completionRate}%`} subtitle="Average across all courses" color="text-amber-500 bg-amber-50" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link to="/admin/users" className="btn-outline">Manage Users</Link>
            <Link to="/courses" className="btn-outline">View Catalog</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon: Icon, title, value, subtitle, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-dark-800">{value}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400">{subtitle}</p>
    </div>
  );
}
