import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, Button, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { albumAPI } from '../services/api';

function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const fetchAlbum = async () => {
    try {
      const response = await albumAPI.getById(id);
      setAlbum(response.data.album);
    } catch (error) {
      console.error('获取相册详情失败:', error);
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

  if (!album) {
    return (
      <div className="container py-12">
        <Card>
          <p className="text-center text-gray-600">相册不存在</p>
          <div className="text-center mt-4">
            <Button onClick={() => navigate('/gallery')}>返回相册列表</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/gallery')}
        className="mb-4"
      >
        返回相册列表
      </Button>

      <Card>
        <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
        {album.description && (
          <p className="text-gray-600 mb-6">{album.description}</p>
        )}

        {album.photos && album.photos.length === 0 ? (
          <Empty description="相册中还没有照片" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.photos?.map((photo) => (
              <div key={photo.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                  onClick={() => window.open(photo.url, '_blank')}
                />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default AlbumDetail;
