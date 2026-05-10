import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { FiBookOpen, FiAward, FiTrendingUp, FiClock } from 'react-icons/fi';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enrollments/my').then(r => setEnrollments(r.data.enrollments)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const inProgress = enrollments.filter(e => e.progress_percent > 0 && e.progress_percent < 100);
  const completed = enrollments.filter(e => e.progress_percent === 100);
  const notStarted = enrollments.filter(e => e.progress_percent === 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dark-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-1">My Learning</h1>
          <p className="text-gray-400">Welcome back, {user?.name}!</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FiBookOpen, label: 'Enrolled', value: enrollments.length, color: 'text-blue-500 bg-blue-50' },
            { icon: FiTrendingUp, label: 'In Progress', value: inProgress.length, color: 'text-amber-500 bg-amber-50' },
            { icon: FiAward, label: 'Completed', value: completed.length, color: 'text-emerald-500 bg-emerald-50' },
            { icon: FiClock, label: 'Not Started', value: notStarted.length, color: 'text-gray-500 bg-gray-100' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-2`}><s.icon className="w-5 h-5" /></div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
        {enrollments.length > 0 ? (
          <>
            {inProgress.length > 0 && <Section title="Continue Learning" items={inProgress} />}
            {notStarted.length > 0 && <Section title="Not Started" items={notStarted} showProgress={0} />}
            {completed.length > 0 && <Section title="Completed ✓" items={completed} showProgress={100} />}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-xl font-semibold mb-2">No enrolled courses yet</p>
            <Link to="/courses" className="btn-brand mt-2">Browse Courses</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, showProgress }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map(e => <CourseCard key={e.id} course={e.course} progress={showProgress !== undefined ? showProgress : e.progress_percent} />)}
      </div>
    </div>
  );
}
