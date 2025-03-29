import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Music, Menu, X } from 'lucide-react';

function CustomHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = window.localStorage.getItem("token");
  const user = window.localStorage.getItem("user");
  const username = user ? JSON.parse(user).username : '';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const protectedRoutes = ['/music', '/facial-expression-detection', '/captured-expression'];
    const isProtectedRoute = protectedRoutes.includes(location.pathname);
    if (isProtectedRoute && (!token || !user)) {
      navigate('/');
    }
  }, [location.pathname, token, user, navigate]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg text-white">
      <div className="absolute inset-0 overflow-hidden opacity-20 animate-wave">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          ></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between relative z-10 max-w-7xl">
        <Link to="/" className="flex items-center gap-2 group">
          <Music className="h-6 w-6 sm:h-8 sm:w-8 text-white transition-transform duration-300 group-hover:scale-110" />
          <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight transition-colors duration-300 group-hover:text-yellow-300">
            MoodSync
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {(!token || !user) ? (
            [
              { label: 'Features', href: '/#features', isSection: true },
              { label: 'How It Works', href: '/#how-it-works', isSection: true },
              { label: 'Testimonials', href: '/#testimonials', isSection: true },
              { label: 'Download', href: '/#download', isSection: true },
            ].map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`text-sm lg:text-base font-medium text-white hover:text-yellow-300 transition-all duration-300 relative group ${
                  location.hash === item.href.split('#')[1] && location.pathname === '/' ? 'text-yellow-300' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.label}
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                    location.hash === item.href.split('#')[1] && location.pathname === '/' ? 'w-full' : ''
                  }`}
                ></span>
              </a>
            ))
          ) : (
            <>
              <Link
                to="/facial-expression-detection"
                className={`text-sm lg:text-base font-medium text-white hover:text-yellow-300 transition-all duration-300 relative group ${
                  location.pathname === '/facial-expression-detection' ? 'text-yellow-300' : ''
                }`}
              >
                Detect Mood
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                    location.pathname === '/facial-expression-detection' ? 'w-full' : ''
                  }`}
                ></span>
              </Link>
              <Link
                to="/captured-expression"
                className={`text-sm lg:text-base font-medium text-white hover:text-yellow-300 transition-all duration-300 relative group ${
                  location.pathname === '/captured-expression' ? 'text-yellow-300' : ''
                }`}
              >
                Captured Expression
                <span
                  className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                    location.pathname === '/captured-expression' ? 'w-full' : ''
                  }`}
                ></span>
              </Link>
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {!token || !user ? !isAuthPage && (
            <>
              <Link to="/login">
                <button className="text-sm lg:text-base font-medium text-white hover:text-yellow-300 transition-all duration-300">
                  Log In
                </button>
              </Link>
              <Link to="/signup">
                <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-4 py-1.5 lg:px-6 lg:py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300">
                  Sign Up
                </button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3 lg:gap-4">
              <span className="text-sm lg:text-base font-medium text-yellow-300 truncate max-w-[100px] lg:max-w-[150px]">
                {username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1.5 lg:px-6 lg:py-2 rounded-full font-semibold border border-white/20 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 transition-transform duration-300" />
          ) : (
            <Menu className="h-6 w-6 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-purple-600 to-indigo-600 shadow-lg">
          <nav className="flex flex-col items-center gap-4 py-4">
            {(!token || !user) ? (
              [
                { label: 'Features', href: '/#features', isSection: true },
                { label: 'How It Works', href: '/#how-it-works', isSection: true },
                { label: 'Testimonials', href: '/#testimonials', isSection: true },
                { label: 'Download', href: '/#download', isSection: true },
              ].map((item, index) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 relative group ${
                    location.hash === item.href.split('#')[1] && location.pathname === '/' ? 'text-yellow-300' : ''
                  }`}
                  onClick={toggleMenu}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                      location.hash === item.href.split('#')[1] && location.pathname === '/' ? 'w-full' : ''
                    }`}
                  ></span>
                </a>
              ))
            ) : (
              <>
                <Link
                  to="/facial-expression-detection"
                  className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 relative group ${
                    location.pathname === '/facial-expression-detection' ? 'text-yellow-300' : ''
                  }`}
                  onClick={toggleMenu}
                >
                  Detect Mood
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                      location.pathname === '/facial-expression-detection' ? 'w-full' : ''
                    }`}
                  ></span>
                </Link>
                <Link
                  to="/captured-expression"
                  className={`text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300 relative group ${
                    location.pathname === '/captured-expression' ? 'text-yellow-300' : ''
                  }`}
                  onClick={toggleMenu}
                >
                  Captured Expression
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-300 group-hover:w-full ${
                      location.pathname === '/captured-expression' ? 'w-full' : ''
                    }`}
                  ></span>
                </Link>
              </>
            )}
            {!token || !user ? !isAuthPage && (
              <>
                <Link
                  to="/login"
                  onClick={toggleMenu}
                  className="text-sm font-medium text-white hover:text-yellow-300 transition-all duration-300"
                >
                  Log In
                </Link>
                <Link to="/signup" onClick={toggleMenu}>
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300">
                    Sign Up
                  </button>
                </Link>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <span className="text-sm font-medium text-yellow-300">
                  {username}
                </span>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full font-semibold border border-white/20 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default CustomHeader;