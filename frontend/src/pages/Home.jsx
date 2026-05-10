import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPlay, FiUsers, FiBookOpen, FiAward, FiTrendingUp } from 'react-icons/fi';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';

const CATEGORIES = [
  { key: 'development', icon: '💻', label: 'Development', color: 'from-blue-500 to-cyan-500' },
  { key: 'data-science', icon: '📈', label: 'Data Science', color: 'from-emerald-500 to-teal-500' },
  { key: 'design', icon: '🎨', label: 'Design', color: 'from-pink-500 to-rose-500' },
  { key: 'business', icon: '📊', label: 'Business', color: 'from-amber-500 to-orange-500' },
  { key: 'marketing', icon: '📢', label: 'Marketing', color: 'from-violet-500 to-purple-500' },
  { key: 'photography', icon: '📷', label: 'Photography', color: 'from-red-500 to-pink-500' },
];

const STATS = [
  { icon: FiBookOpen, value: '100+', label: 'Courses' },
  { icon: FiUsers, value: '10K+', label: 'Students' },
  { icon: FiAward, value: '50+', label: 'Instructors' },
  { icon: FiTrendingUp, value: '95%', label: 'Success Rate' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses?limit=8').then(r => setFeatured(r.data.courses)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-dark-800 via-dark-900 to-purple-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-600 rounded-full blur-[150px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-sm text-brand-200 mb-6 animate-fade-in-up">
              <FiPlay className="w-3 h-3" /> New courses added weekly
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6 animate-fade-in-up stagger-1">
              Learn without<br />
              <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">limits</span>
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg leading-relaxed animate-fade-in-up stagger-2">
              Start, switch, or advance your career with thousands of courses from expert instructors. Learn at your own pace, anytime.
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in-up stagger-3">
              <Link to="/courses" className="btn-brand !py-3.5 !px-8 !text-base !rounded-xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40">
                Explore Courses <FiArrowRight />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
        {/* Stats bar */}
        <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((s, i) => (
                <div key={i} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-300">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Top Categories</h2>
              <p className="text-gray-500 mt-1">Explore our most popular categories</p>
            </div>
            <Link to="/courses" className="btn-ghost hidden md:flex">View All <FiArrowRight /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link to={`/courses?category=${cat.key}`} key={cat.key}
                className="group relative overflow-hidden rounded-2xl p-6 text-center bg-gray-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {cat.icon}
                </div>
                <p className="font-semibold text-sm text-dark-800">{cat.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="text-gray-500 mt-1">Learn from the best instructors</p>
            </div>
            <Link to="/courses" className="btn-ghost hidden md:flex">See All <FiArrowRight /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map(c => <CourseCard key={c.id} course={c} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No courses yet. Be the first to create one!</p>
              <Link to="/register" className="btn-brand mt-4">Get Started</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-500 via-purple-600 to-brand-800">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Become an Instructor</h2>
          <p className="text-lg text-brand-100 mb-8">Share your knowledge with thousands of students worldwide. Start teaching on Mini Udemy today.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 font-bold rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-lg">
            Start Teaching <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
}
