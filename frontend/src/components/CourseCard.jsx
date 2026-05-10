import { Link } from 'react-router-dom';
import { FiClock, FiUsers, FiBookOpen, FiStar } from 'react-icons/fi';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function CourseCard({ course, progress }) {
  const totalLectures = course.total_lectures || course.modules?.reduce((s, m) => s + (m.lectures?.length || 0), 0) || 0;
  const totalDuration = course.total_duration || course.modules?.reduce((s, m) => s + (m.lectures?.reduce((a, l) => a + (l.duration || 0), 0) || 0), 0) || 0;

  return (
    <Link to={`/courses/${course.id}`} id={`course-card-${course.id}`} className="group card overflow-hidden flex flex-col">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-200">
        <img src={course.thumbnail_url} alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-3 left-3">
          <span className={`badge ${course.level === 'beginner' ? 'badge-green' : course.level === 'intermediate' ? 'badge-orange' : 'badge-red'}`}>
            {course.level}
          </span>
        </div>
        {course.price === 0 && (
          <span className="absolute top-3 right-3 badge badge-purple">Free</span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-dark-800 text-sm leading-snug line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          {course.instructor?.name || 'Instructor'}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          <span className="font-bold text-sm text-amber-700">4.6</span>
          <div className="flex text-amber-400 text-xs">{'★★★★★'.split('').map((s, i) => <span key={i} className={i < 4 ? '' : 'text-gray-300'}>{s}</span>)}</div>
          <span className="text-xs text-gray-400">({course.enrollment_count || 0})</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
          <span className="flex items-center gap-1"><FiBookOpen className="w-3 h-3" /> {totalLectures} lectures</span>
          <span className="flex items-center gap-1"><FiClock className="w-3 h-3" /> {formatDuration(totalDuration)}</span>
        </div>

        {/* Progress bar (for enrolled courses) */}
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Progress</span>
              <span className="font-semibold text-brand-600">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
