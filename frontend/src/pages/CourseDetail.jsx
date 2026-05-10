import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiClock, FiBookOpen, FiUsers, FiPlay, FiChevronDown, FiChevronUp, FiCheckCircle, FiAward } from 'react-icons/fi';

function fmt(s) { const h = Math.floor(s/3600), m = Math.floor((s%3600)/60); return h > 0 ? `${h}h ${m}m` : `${m}m`; }

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    api.get(`/courses/${id}`).then(r => {
      setCourse(r.data.course);
      // Expand first module by default
      if (r.data.course.modules?.length) setExpandedModules({ [r.data.course.modules[0].id]: true });
    }).catch(() => toast.error('Course not found')).finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    setEnrolling(true);
    try {
      await api.post('/enrollments', { course_id: parseInt(id) });
      toast.success('Enrolled successfully!');
      setCourse(prev => ({ ...prev, is_enrolled: true, enrollment_count: (prev.enrollment_count || 0) + 1 }));
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to enroll'); }
    setEnrolling(false);
  };

  const toggleModule = (mid) => setExpandedModules(prev => ({ ...prev, [mid]: !prev[mid] }));

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">Course not found</div>;

  const totalLectures = course.modules?.reduce((s, m) => s + (m.lectures?.length || 0), 0) || 0;
  const totalDuration = course.modules?.reduce((s, m) => s + (m.lectures?.reduce((a, l) => a + (l.duration || 0), 0) || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-dark-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex gap-2 mb-3">
                <span className="badge badge-purple">{course.category}</span>
                <span className={`badge ${course.level === 'beginner' ? 'badge-green' : course.level === 'intermediate' ? 'badge-orange' : 'badge-red'}`}>{course.level}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight">{course.title}</h1>
              {course.subtitle && <p className="text-lg text-gray-300 mb-4">{course.subtitle}</p>}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1"><FiUsers className="w-4 h-4" /> {course.enrollment_count || 0} students</span>
                <span className="flex items-center gap-1"><FiBookOpen className="w-4 h-4" /> {totalLectures} lectures</span>
                <span className="flex items-center gap-1"><FiClock className="w-4 h-4" /> {fmt(totalDuration)} total</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">
                  {course.instructor?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm">Created by {course.instructor?.name}</p>
                </div>
              </div>
            </div>

            {/* Sidebar card */}
            <div className="lg:row-start-1 lg:col-start-3">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden text-dark-800 sticky top-20">
                <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640'; }} />
                <div className="p-6">
                  <p className="text-3xl font-extrabold mb-4">{course.price > 0 ? `$${course.price}` : 'Free'}</p>
                  {course.is_enrolled ? (
                    <Link to={`/course/${course.id}/learn`} className="btn-brand w-full !py-3 !rounded-xl text-center" id="go-to-course-btn">
                      <FiPlay className="w-4 h-4" /> Go to Course
                    </Link>
                  ) : (
                    <button onClick={handleEnroll} disabled={enrolling} className="btn-brand w-full !py-3 !rounded-xl" id="enroll-btn">
                      {enrolling ? 'Enrolling...' : 'Enroll Now — Free'}
                    </button>
                  )}
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-emerald-500" /> Full lifetime access</div>
                    <div className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-emerald-500" /> {totalLectures} video lectures</div>
                    <div className="flex items-center gap-2"><FiCheckCircle className="w-4 h-4 text-emerald-500" /> Quizzes & exercises</div>
                    <div className="flex items-center gap-2"><FiAward className="w-4 h-4 text-emerald-500" /> Certificate of completion</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div>
              <h2 className="text-xl font-bold mb-3">About this course</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
            </div>

            {/* Curriculum */}
            <div>
              <h2 className="text-xl font-bold mb-4">Course Content</h2>
              <p className="text-sm text-gray-500 mb-4">{course.modules?.length || 0} modules • {totalLectures} lectures • {fmt(totalDuration)} total</p>
              <div className="space-y-2">
                {course.modules?.map((mod, mi) => (
                  <div key={mod.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                    <button onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
                      <div className="flex items-center gap-3">
                        {expandedModules[mod.id] ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
                        <span className="font-semibold text-sm">{mod.title}</span>
                      </div>
                      <span className="text-xs text-gray-400">{mod.lectures?.length || 0} lectures</span>
                    </button>
                    {expandedModules[mod.id] && (
                      <div className="border-t border-gray-100">
                        {mod.lectures?.map((lec, li) => (
                          <div key={lec.id} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50 last:border-0">
                            <FiPlay className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="flex-1 text-gray-700">{lec.title}</span>
                            <span className="text-xs text-gray-400">{fmt(lec.duration || 0)}</span>
                          </div>
                        ))}
                        {mod.quiz && (
                          <div className="flex items-center gap-3 px-4 py-3 text-sm bg-brand-50/50 border-t border-brand-100">
                            <FiAward className="w-3 h-3 text-brand-500 shrink-0" />
                            <span className="flex-1 text-brand-700 font-medium">{mod.quiz.title}</span>
                            <span className="text-xs text-brand-400">{mod.quiz.questions?.length || 0} questions</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
