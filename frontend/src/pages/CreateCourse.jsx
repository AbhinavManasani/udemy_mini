import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft } from 'react-icons/fi';

const CATEGORIES = ['development', 'data-science', 'design', 'business', 'marketing', 'photography', 'music', 'personal-development'];

export default function CreateCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail_url, setThumbnail] = useState('');
  const [category, setCategory] = useState('development');
  const [level, setLevel] = useState('beginner');
  const [modules, setModules] = useState([{ title: 'Module 1', lectures: [{ title: '', video_url: '', duration: 0 }] }]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/courses/${id}`).then(r => {
        const c = r.data.course;
        setTitle(c.title); setSubtitle(c.subtitle || ''); setDescription(c.description);
        setThumbnail(c.thumbnail_url || ''); setCategory(c.category); setLevel(c.level);
        if (c.modules?.length) {
          setModules(c.modules.map(m => ({
            title: m.title,
            lectures: m.lectures?.map(l => ({ title: l.title, video_url: l.video_url || '', duration: l.duration || 0 })) || [],
          })));
        }
      }).catch(() => toast.error('Failed to load course'));
    }
  }, [id]);

  const addModule = () => setModules(prev => [...prev, { title: `Module ${prev.length + 1}`, lectures: [{ title: '', video_url: '', duration: 0 }] }]);
  const removeModule = (i) => setModules(prev => prev.filter((_, idx) => idx !== i));
  const updateModule = (i, field, val) => setModules(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  const addLecture = (mi) => setModules(prev => prev.map((m, i) => i === mi ? { ...m, lectures: [...m.lectures, { title: '', video_url: '', duration: 0 }] } : m));
  const removeLecture = (mi, li) => setModules(prev => prev.map((m, i) => i === mi ? { ...m, lectures: m.lectures.filter((_, j) => j !== li) } : m));
  const updateLecture = (mi, li, field, val) => setModules(prev => prev.map((m, i) => i === mi ? { ...m, lectures: m.lectures.map((l, j) => j === li ? { ...l, [field]: val } : l) } : m));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) { toast.error('Title and description required'); return; }
    setSaving(true);
    try {
      const payload = { title, subtitle, description, thumbnail_url, category, level, modules };
      if (isEdit) {
        await api.put(`/courses/${id}`, payload);
        toast.success('Course updated!');
      } else {
        await api.post('/courses', payload);
        toast.success('Course created!');
      }
      navigate('/instructor');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to save'); }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-dark-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4">
          <button onClick={() => navigate('/instructor')} className="p-2 rounded-lg hover:bg-white/10"><FiArrowLeft /></button>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Course' : 'Create New Course'}</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Basic info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-bold text-lg">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className="input-field" placeholder="e.g. Complete JavaScript Course" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="input-field" placeholder="A brief tagline" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={4} placeholder="Course description..." required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('-', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select value={level} onChange={e => setLevel(e.target.value)} className="input-field">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Thumbnail URL</label>
              <input value={thumbnail_url} onChange={e => setThumbnail(e.target.value)} className="input-field" placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Modules */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Modules & Lectures</h2>
            <button type="button" onClick={addModule} className="btn-ghost text-sm"><FiPlus className="w-4 h-4" /> Add Module</button>
          </div>
          {modules.map((mod, mi) => (
            <div key={mi} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input value={mod.title} onChange={e => updateModule(mi, 'title', e.target.value)} className="input-field flex-1" placeholder="Module title" />
                {modules.length > 1 && <button type="button" onClick={() => removeModule(mi)} className="p-2 text-red-400 hover:text-red-600"><FiTrash2 /></button>}
              </div>
              {mod.lectures.map((lec, li) => (
                <div key={li} className="flex gap-2 pl-4 items-start">
                  <span className="text-gray-400 text-xs mt-3 w-4">{li + 1}.</span>
                  <input value={lec.title} onChange={e => updateLecture(mi, li, 'title', e.target.value)} className="input-field flex-1 !py-2 !text-sm" placeholder="Lecture title" />
                  <input value={lec.video_url} onChange={e => updateLecture(mi, li, 'video_url', e.target.value)} className="input-field w-48 !py-2 !text-sm hidden md:block" placeholder="Video URL" />
                  <input type="number" value={lec.duration} onChange={e => updateLecture(mi, li, 'duration', parseInt(e.target.value) || 0)} className="input-field w-20 !py-2 !text-sm" placeholder="Sec" />
                  {mod.lectures.length > 1 && <button type="button" onClick={() => removeLecture(mi, li)} className="p-1 text-red-400 hover:text-red-600 mt-1"><FiTrash2 className="w-3 h-3" /></button>}
                </div>
              ))}
              <button type="button" onClick={() => addLecture(mi)} className="text-xs text-brand-500 font-medium hover:underline pl-4"><FiPlus className="w-3 h-3 inline" /> Add Lecture</button>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/instructor')} className="btn-outline">Cancel</button>
          <button type="submit" disabled={saving} className="btn-brand"><FiSave className="w-4 h-4" /> {saving ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}</button>
        </div>
      </form>
    </div>
  );
}
