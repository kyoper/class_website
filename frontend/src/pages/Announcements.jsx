import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Pagination, Spin, Empty } from 'antd';
import { announcementAPI } from '../services/api';

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.page]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await announcementAPI.getList({
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      setAnnouncements(response.data.announcements);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
      }));
    } catch (error) {
      console.error('获取公告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">班级公告</h1>

      {announcements.length === 0 ? (
        <Empty description="暂无公告" />
      ) : (
        <>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Link key={announcement.id} to={`/announcements/${announcement.id}`}>
                <Card hoverable className="transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {announcement.isImportant && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                            重要
                          </span>
                        )}
                        <h2 className="text-xl font-semibold">
                          {announcement.title}
                        </h2>
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">
                        {announcement.summary}
                      </p>
                      <div className="text-sm text-gray-400">
                        {new Date(announcement.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Announcements;
