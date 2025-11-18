import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Input } from 'antd';
import { SearchOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';

const { Search } = Input;

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: '/', label: '首页', icon: '🏠' },
    { path: '/announcements', label: '公告', icon: '📢' },
    { path: '/gallery', label: '相册', icon: '📸' },
    { path: '/members', label: '成员', icon: '👥' },
    { path: '/schedule', label: '课程表', icon: '📅' },
    { path: '/homework', label: '作业', icon: '📝' },
    { path: '/honors', label: '荣誉', icon: '🏆' },
    { path: '/polls', label: '投票', icon: '📊' },
    { path: '/resources', label: '资源', icon: '📚' },
    { path: '/guestbook', label: '留言板', icon: '💬' },
  ];

  const handleSearch = (value) => {
    if (value.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(value)}`;
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white text-xl md:text-2xl shadow-lg"
            >
              🎓
            </motion.div>
            <div className="hidden md:block">
              <div className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                清水亭学校
              </div>
              /* <div className="text-xs text-gray-500">七（三）班</div> */
            </div>
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-2 py-2 rounded-lg font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span className="text-sm">{link.icon}</span>
                    <span className="text-xs">{link.label}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 搜索框 */}
          <div className="hidden xl:block">
            <Search
              placeholder="搜索..."
              onSearch={handleSearch}
              style={{ width: 180 }}
              size="small"
              className="rounded-lg"
            />
          </div>

          {/* 移动端菜单按钮 */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <CloseOutlined className="text-xl" />
            ) : (
              <MenuOutlined className="text-xl" />
            )}
          </button>
        </div>

        {/* 移动端菜单 */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden border-t"
            >
              <nav className="py-4 space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-primary-50 text-primary-600 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-2xl">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* 移动端搜索 */}
              <div className="px-4 pb-4">
                <Search
                  placeholder="搜索..."
                  onSearch={handleSearch}
                  size="large"
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header;

