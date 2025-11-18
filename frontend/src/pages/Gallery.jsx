import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Spin, Empty } from 'antd';
import { albumAPI } from '../services/api';

function Gallery() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await albumAPI.getList();
      setAlbums(response.data.albums);
    } catch (error) {
      console.error('获取相册失败:', error);
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
      <h1 className="text-4xl font-bold mb-8">班级相册</h1>

      {albums.length === 0 ? (
        <Empty description="暂无相册" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {albums.map((album) => (
            <Link key={album.id} to={`/gallery/${album.id}`}>
              <Card
                hoverable
                cover={
                  <div className="h-48 bg-gray-200 flex items-center justify-center text-4xl">
                    {album.coverImage ? (
                      <img src={album.coverImage} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                      '📷'
                    )}
                  </div>
                }
              >
                <Card.Meta
                  title={album.title}
                  description={
                    <div>
                      <p className="line-clamp-2">{album.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {album._count?.photos || 0} 张照片
                      </p>
                    </div>
                  }
                />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Gallery;
