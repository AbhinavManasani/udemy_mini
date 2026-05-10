import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import VideoPlayer from '../components/VideoPlayer';
import QuizPlayer from '../components/QuizPlayer';
import toast from 'react-hot-toast';
import { FiPlay, FiCheckCircle, FiAward, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function CoursePlayer() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [courseRes, progressRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/progress/${id}`),
        ]);
        const c = courseRes.data.course;
        setCourse(c);

        // Build progress map
        const pm = {};
        progressRes.data.progress?.forEach(p => { pm[p.lecture_id] = p; });
        setProgressMap(pm);

        // Expand all modules
        const exp = {};
        c.modules?.forEach(m => { exp[m.id] = true; });
        setExpandedModules(exp);

        // Set first incomplete lecture as active
        let found = false;
        for (const mod of (c.modules || [])) {
          for (const lec of (mod.lectures || [])) {
            if (!pm[lec.id]?.completed) { setActiveLecture(lec); found = true; break; }
          }
          if (found) break;
        }
        if (!found && c.modules?.[0]?.lectures?.[0]) setActiveLecture(c.modules[0].lectures[0]);
      } catch { toast.error('Failed to load course'); }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleProgress = useCallback(async (seconds) => {
    if (!activeLecture) return;
    try {
      await api.post('/progress', { lecture_id: activeLecture.id, last_position_seconds: seconds });
    } catch { /* silent */ }
  }, [activeLecture]);

  const handleVideoEnd = useCallback(async () => {
    if (!activeLecture) return;
    try {
      await api.post('/progress', { lecture_id: activeLecture.id, completed: true, last_position_seconds: 0 });
      setProgressMap(prev => ({ ...prev, [activeLecture.id]: { ...prev[activeLecture.id], completed: true } }));
      toast.success('Lecture completed! ✓');
    } catch { /* silent */ }
  }, [activeLecture]);

  const handleQuizSubmit = async (answers) => {
    try {
      const { data } = await api.post(`/quizzes/${activeQuiz.id}/attempt`, { answers });
      return data;
    } catch (err) { toast.error('Failed to submit quiz'); return null; }
  };

  const selectLecture = (lec) => { setActiveLecture(lec); setActiveQuiz(null); };
  const selectQuiz = async (quiz) => {
    try {
      const { data } = await api.get(`/quizzes/module/${quiz.module_id}`);
      setActiveQuiz(data.quiz);
      setActiveLecture(null);
    } catch { toast.error('Failed to load quiz'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-500">Course not found</div>;

  const completedCount = Object.values(progressMap).filter(p => p.completed).length;
  const totalLectures = course.modules?.reduce((s, m) => s + (m.lectures?.length || 0), 0) || 0;
  const pct = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Main content */}
      <div className={`flex-1 overflow-y-auto bg-gray-50 transition-all ${sidebarOpen ? '' : ''}`}>
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {activeLecture && (
            <>
              <VideoPlayer
                url={activeLecture.video_url}
                onProgress={handleProgress}
                onEnded={handleVideoEnd}
                initialPosition={progressMap[activeLecture.id]?.last_position_seconds || 0}
              />
              <div className="mt-4">
                <h2 className="text-xl font-bold">{activeLecture.title}</h2>
                {activeLecture.description && <p className="text-gray-600 mt-2">{activeLecture.description}</p>}
              </div>
            </>
          )}
          {activeQuiz && (
            <QuizPlayer quiz={activeQuiz} onSubmit={handleQuizSubmit} />
          )}
          {!activeLecture && !activeQuiz && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-lg font-medium">Select a lecture to start learning</p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className={`w-80 shrink-0 bg-white border-l border-gray-200 overflow-y-auto hidden md:block`}>
        {/* Progress header */}
        <div className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-bold text-sm mb-2">Course Progress</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-semibold text-brand-600">{pct}%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{completedCount}/{totalLectures} lectures completed</p>
        </div>

        {/* Module list */}
        <div>
          {course.modules?.map(mod => (
            <div key={mod.id}>
              <button onClick={() => setExpandedModules(p => ({ ...p, [mod.id]: !p[mod.id] }))}
                className="w-full flex items-center justify-between p-3 px-4 hover:bg-gray-50 text-left border-b border-gray-100">
                <span className="font-semibold text-xs text-gray-700 flex-1 pr-2">{mod.title}</span>
                {expandedModules[mod.id] ? <FiChevronUp className="w-3 h-3" /> : <FiChevronDown className="w-3 h-3" />}
              </button>
              {expandedModules[mod.id] && (
                <div>
                  {mod.lectures?.map(lec => {
                    const done = progressMap[lec.id]?.completed;
                    const isActive = activeLecture?.id === lec.id;
                    return (
                      <button key={lec.id} onClick={() => selectLecture(lec)}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors border-b border-gray-50
                          ${isActive ? 'bg-brand-50 text-brand-700 border-l-2 border-l-brand-500' : 'hover:bg-gray-50 text-gray-600'}`}>
                        {done ? <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <FiPlay className="w-3.5 h-3.5 shrink-0" />}
                        <span className="flex-1 truncate">{lec.title}</span>
                      </button>
                    );
                  })}
                  {mod.quiz && (
                    <button onClick={() => selectQuiz(mod.quiz)}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs transition-colors border-b border-gray-50
                        ${activeQuiz?.id === mod.quiz.id ? 'bg-amber-50 text-amber-700' : 'hover:bg-gray-50 text-amber-600'}`}>
                      <FiAward className="w-3.5 h-3.5 shrink-0" />
                      <span className="flex-1 truncate">{mod.quiz.title}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
