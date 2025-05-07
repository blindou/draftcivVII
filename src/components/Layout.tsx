import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Menu, X, BarChart, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsDropdownOpen, setStatsDropdownOpen] = useState(false);

  const statsLinks = [
    { to: '/stats', label: 'Overview' },
    { to: '/stats/civilizations', label: 'Civilizations' },
    { to: '/stats/leaders', label: 'Leaders' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Background Image */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-5 pointer-events-none"
        style={{ 
          backgroundImage: 'url(https://images.pexels.com/photos/4245826/pexels-photo-4245826.jpeg)',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-amber-500/10">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-amber-500 flex items-center">
              <Crown className="mr-2 h-6 w-6" />
              CivDraft VII
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/" className="text-gray-300 hover:text-amber-400 transition-colors">
                Home
              </Link>
              <Link to="/create-draft" className="text-gray-300 hover:text-amber-400 transition-colors">
                Create Draft
              </Link>
              <div className="relative">
                <button
                  className="text-gray-300 hover:text-amber-400 transition-colors flex items-center gap-1"
                  onClick={() => setStatsDropdownOpen(!statsDropdownOpen)}
                >
                  <BarChart className="w-4 h-4" />
                  Stats
                  <ChevronDown className={`w-4 h-4 transition-transform ${statsDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {statsDropdownOpen && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-48 bg-gray-900 border border-amber-500/10 rounded-lg shadow-xl backdrop-blur-sm"
                    onMouseLeave={() => setStatsDropdownOpen(false)}
                  >
                    {statsLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="block px-4 py-2 text-gray-300 hover:bg-amber-500/10 hover:text-amber-400 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        onClick={() => setStatsDropdownOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
            
            <button 
              className="md:hidden text-gray-300 hover:text-amber-400" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-gray-900/95 backdrop-blur-sm border-b border-amber-500/10">
              <div className="container mx-auto px-4 py-3 space-y-2">
                <Link 
                  to="/" 
                  className="block text-gray-300 hover:text-amber-400 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  to="/create-draft" 
                  className="block text-gray-300 hover:text-amber-400 transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Create Draft
                </Link>
                {/* Mobile Stats Menu */}
                <div className="py-2 space-y-1">
                  {statsLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block pl-4 text-gray-300 hover:text-amber-400 transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </header>
        
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        
        <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-amber-500/10 py-6">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>© 2025 CivDraft VII. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;