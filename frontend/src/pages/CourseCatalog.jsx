import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CourseCard from '../components/CourseCard';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'development', label: 'Development' },
  { key: 'data-science', label: 'Data Science' },
  { key: 'design', label: 'Design' },
  { key: 'business', label: 'Business' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'photography', label: 'Photography' },
];

const LEVELS = ['beginner', 'intermediate', 'advanced'];

export default function CourseCatalog() {
  const [params, setParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(params.get('search') || '');
  const [category, setCategory] = useState(params.get('category') || 'all');
  const [level, setLevel] = useState('');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('search', search);
      if (category && category !== 'all') q.set('category', category);
      if (level) q.set('level', level);
      q.set('page', page);
      q.set('limit', 12);

      const { data } = await api.get(`/courses?${q.toString()}`);
      setCourses(data.courses);
      setTotal(data.total);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, [category, level, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const clearFilters = () => { setSearch(''); setCategory('all'); setLevel(''); setPage(1); };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-dark-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">All Courses</h1>
          <p className="text-gray-400">Browse our full catalog of {total} courses</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
              className="input-field !pl-11 !rounded-xl" id="catalog-search" />
          </form>
          <select value={level} onChange={e => { setLevel(e.target.value); setPage(1); }}
            className="input-field !w-auto !rounded-xl" id="catalog-level-filter">
            <option value="">All Levels</option>
            {LEVELS.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
          {(search || category !== 'all' || level) && (
            <button onClick={clearFilters} className="btn-ghost !text-red-500 gap-1"><FiX className="w-4 h-4" /> Clear</button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => { setCategory(c.key); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${category === c.key ? 'bg-dark-800 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Course grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-xl font-semibold text-gray-700 mb-2">No courses found</p>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
