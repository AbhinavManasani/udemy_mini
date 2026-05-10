import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses/instructor/mine').then(r => setCourses(r.data.courses)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const togglePublish = async (course) => {
    try {
      await api.put(`/courses/${course.id}`, { is_published: !course.is_published });
      setCourses(prev => prev.map(c => c.id === course.id ? { ...c, is_published: !c.is_published } : c));
      toast.success(course.is_published ? 'Course unpublished' : 'Course published!');
    } catch { toast.error('Failed to update'); }
  };

  const deleteCourse = async (id) => {
    if (!confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success('Course deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const totalStudents = courses.reduce((s, c) => s + (c.enrollment_count || 0), 0);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dark-800 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Instructor Dashboard</h1>
            <p className="text-gray-400">{courses.length} courses • {totalStudents} students</p>
          </div>
          <Link to="/instructor/create" className="btn-brand"><FiPlus className="w-4 h-4" /> New Course</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
                <img src={course.thumbnail_url} alt="" className="w-full md:w-48 h-28 object-cover rounded-lg bg-gray-200"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300'; }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg truncate">{course.title}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className={`badge ${course.is_published ? 'badge-green' : 'badge-orange'}`}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> {course.enrollment_count || 0} students</span>
                        <span>{course.modules?.length || 0} modules</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => togglePublish(course)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700" title={course.is_published ? 'Unpublish' : 'Publish'}>
                        {course.is_published ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                      <Link to={`/instructor/edit/${course.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700"><FiEdit className="w-4 h-4" /></Link>
                      <button onClick={() => deleteCourse(course.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎓</p>
            <p className="text-xl font-semibold mb-2">No courses yet</p>
            <p className="text-gray-400 mb-4">Create your first course and start teaching!</p>
            <Link to="/instructor/create" className="btn-brand"><FiPlus className="w-4 h-4" /> Create Course</Link>
          </div>
        )}
      </div>
    </div>
  );
}
