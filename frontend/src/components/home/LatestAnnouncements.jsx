import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, Empty } from 'antd';
import { announcementAPI } from '../../services/api';

function LatestAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      setLoading(true);
      try {
        const response = await announcementAPI.getList({ page: 1, pageSize: 3 });
        setAnnouncements(response.data.announcements || []);
      } catch (error) {
        console.error('获取公告失败:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
  }, []);

  const formatDate = (value) => {
    const date = new Date(value);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">最新公告</h2>
            <p className="text-gray-600">了解班级的最新动态</p>
          </div>
          <Link
            to="/announcements"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            查看全部
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : announcements.length === 0 ? (
          <Empty description="暂无公告" />
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
            {announcements.map((announcement) => (
              <motion.div key={announcement.id} variants={itemVariants}>
                <Link to={`/announcements/${announcement.id}`}>
                  <Card hoverable>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        {announcement.isImportant && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">重要</span>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{announcement.summary}</p>
                      <span className="text-sm text-gray-400">{formatDate(announcement.createdAt)}</span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default LatestAnnouncements;
