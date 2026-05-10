import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <footer className="bg-dark-800 text-gray-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-700 flex items-center justify-center text-white text-xs">▶</div>
                <span className="text-white font-bold text-lg">Mini Udemy</span>
              </div>
              <p className="text-sm leading-relaxed">Top learning experiences that create more talent in the world.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-white transition-colors">About us</a>
                <a href="#" className="block hover:text-white transition-colors">Careers</a>
                <a href="#" className="block hover:text-white transition-colors">Blog</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Community</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-white transition-colors">Go PRO</a>
                <a href="#" className="block hover:text-white transition-colors">Team Plans</a>
                <a href="#" className="block hover:text-white transition-colors">Refer a Friend</a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-white transition-colors">Help & FAQ</a>
                <a href="#" className="block hover:text-white transition-colors">Contact Us</a>
                <a href="#" className="block hover:text-white transition-colors">Trust & Safety</a>
              </div>
            </div>
          </div>
          <div className="border-t border-dark-600 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">© 2026 Mini Udemy, Inc. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
