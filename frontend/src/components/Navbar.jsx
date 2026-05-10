import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiBookOpen, FiGrid, FiUsers, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/courses?search=${encodeURIComponent(search.trim())}`); setSearch(''); }
  };

  const handleLogout = () => { logout(); navigate('/'); setProfileOpen(false); };

  const initials = user ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <header className="fixed top-0 inset-x-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center px-4 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold">▶</div>
          <span className="font-extrabold text-lg text-dark-800 hidden sm:block">Mini Udemy</span>
        </Link>

        {/* Categories */}
        <Link to="/courses" className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors px-3 py-1.5 rounded-full hover:bg-brand-50">
          Categories
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for anything..."
            className="w-full h-10 pl-10 pr-4 bg-gray-100 border-2 border-transparent rounded-full text-sm focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all" />
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user?.role === 'instructor' && (
            <Link to="/instructor" className="hidden lg:flex text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors px-3 py-1.5 rounded-full hover:bg-brand-50">
              Instructor
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className="hidden lg:flex text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors px-3 py-1.5 rounded-full hover:bg-brand-50">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link to="/my-learning" className="hidden md:flex text-sm font-medium text-gray-600 hover:text-brand-500 transition-colors px-3 py-1.5 rounded-full hover:bg-brand-50">
                My Learning
              </Link>
              <div className="relative">
                <button onClick={() => setProfileOpen(!profileOpen)} className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-purple-700 text-white text-xs font-bold flex items-center justify-center hover:shadow-lg transition-all">
                  {initials}
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-fade-in-up overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-700 text-white text-sm font-bold flex items-center justify-center">{initials}</div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{user.name}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link to="/my-learning" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><FiBookOpen className="w-4 h-4" /> My Learning</Link>
                        {user.role === 'instructor' && <Link to="/instructor" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><FiGrid className="w-4 h-4" /> Instructor Dashboard</Link>}
                        {user.role === 'admin' && <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"><FiUsers className="w-4 h-4" /> Admin Panel</Link>}
                      </div>
                      <div className="border-t border-gray-100 py-2">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"><FiLogOut className="w-4 h-4" /> Log out</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-outline !py-2 !px-4 !text-sm !rounded-lg">Log in</Link>
              <Link to="/register" className="btn-primary !py-2 !px-4 !text-sm !rounded-lg">Sign up</Link>
            </div>
          )}

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-gray-600">
            {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-gray-200 shadow-lg animate-fade-in p-4 space-y-3">
          <Link to="/courses" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-gray-700">Browse Courses</Link>
          {user && <Link to="/my-learning" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-gray-700">My Learning</Link>}
          {user?.role === 'instructor' && <Link to="/instructor" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-gray-700">Instructor Dashboard</Link>}
          {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 font-medium text-gray-700">Admin Panel</Link>}
          {!user && (
            <div className="flex gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-outline flex-1 !py-2 text-center !text-sm">Log in</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1 !py-2 text-center !text-sm">Sign up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
