import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { announcementAPI } from '../services/api';

function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await announcementAPI.getById(id);
      setAnnouncement(response.data.announcement);
    } catch (error) {
      console.error('获取公告详情失败:', error);
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

  if (!announcement) {
    return (
      <div className="container py-12">
        <Card>
          <p className="text-center text-gray-600">公告不存在</p>
          <div className="text-center mt-4">
            <Button onClick={() => navigate('/announcements')}>返回列表</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/announcements')}
        className="mb-4"
      >
        返回列表
      </Button>

      <Card>
        <div className="mb-4">
          {announcement.isImportant && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mr-2">
              重要
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold mb-4">{announcement.title}</h1>
        
        <div className="text-sm text-gray-500 mb-6 pb-6 border-b">
          发布时间：{new Date(announcement.createdAt).toLocaleString()}
        </div>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: announcement.content }}
        />
      </Card>
    </div>
  );
}

export default AnnouncementDetail;
