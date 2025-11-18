import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: '快速链接',
      links: [
        { label: '首页', path: '/' },
        { label: '公告', path: '/announcements' },
        { label: '相册', path: '/gallery' },
        { label: '成员', path: '/members' },
      ]
    },
    {
      title: '功能',
      links: [
        { label: '课程表', path: '/schedule' },
        { label: '作业', path: '/homework' },
        { label: '荣誉墙', path: '/honors' },
        { label: '投票', path: '/polls' },
        { label: '资源', path: '/resources' },
        { label: '留言板', path: '/guestbook' },
      ]
    },
    {
      title: '关于',
      links: [
        { label: '搜索', path: '/search' },
        { label: '管理后台', path: '/admin/login' },
      ]
    },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-12 md:mt-16">
      {/* 主要内容 */}
      <div className="container py-8 md:py-12 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {/* 品牌信息 */}
          <div className="md:col-span-1 mt-2 md:mt-0">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-xl md:text-2xl shadow-lg">
                🎓
              </div>
              <div>
                <div className="font-bold text-base md:text-lg">清水亭学校</div>
                /* <div className="text-xs md:text-sm text-gray-400">七（三）班</div> */
              </div>
            </div>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed hidden md:block">
              团结友爱，勤奋进取，追求卓越。记录成长的每一刻。
            </p>
          </div>

          {/* 链接列表 */}
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4 text-white">
                {section.title}
              </h3>
              <ul className="space-y-1.5 md:space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-xs md:text-sm flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-primary-500 transition-all duration-300"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 底部栏 */}
      <div className="border-t border-gray-700">
        <div className="container py-4 md:py-6 px-6">
          <div className="flex items-center justify-center text-xs md:text-sm text-gray-400">
            <span>© {currentYear} 清水亭学校七（三）班 • All rights reserved</span>
          </div>
        </div>
      </div>

      {/* 装饰性渐变 */}
      <div className="h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500"></div>
    </footer>
  );
}

export default Footer;

