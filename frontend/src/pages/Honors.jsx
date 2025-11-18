import { useEffect, useState } from 'react';
import { Card, Spin, Empty, Timeline, Image } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { honorAPI } from '../services/api';

function Honors() {
  const [honors, setHonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHonors();
  }, []);

  const fetchHonors = async () => {
    setLoading(true);
    try {
      const response = await honorAPI.getList();
      setHonors(response.data.honors || []);
    } catch (error) {
      console.error('获取荣誉失败:', error);
      setHonors([]);
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
      <h1 className="text-4xl font-bold mb-8">荣誉墙</h1>

      {honors.length === 0 ? (
        <Empty description="暂时还没有荣誉记录" />
      ) : (
        <Card>
          <div className="scroll-hide-bar">
            <Timeline
              items={honors.map((honor) => ({
              dot: <TrophyOutlined style={{ fontSize: '16px', color: '#faad14' }} />,
              children: (
                <div className="space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{honor.title}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(honor.date).toLocaleDateString()}
                    </span>
                  </div>
                  {honor.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {honor.category}
                    </span>
                  )}
                  {honor.description && <p className="text-gray-600">{honor.description}</p>}
                  {(() => {
                    // 处理多张图片
                    let images = [];
                    if (honor.images) {
                      try {
                        images = JSON.parse(honor.images);
                      } catch (e) {
                        console.error('解析图片失败:', e);
                      }
                    } else if (honor.imageUrl) {
                      // 兼容旧数据
                      images = [honor.imageUrl];
                    }
                    
                    if (images.length > 0) {
                      return (
                        <Image.PreviewGroup>
                          <div className="flex flex-wrap gap-2">
                            {images.map((img, index) => (
                              <Image
                                key={index}
                                src={img}
                                alt={`${honor.title} - ${index + 1}`}
                                className="rounded"
                                style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                                placeholder
                              />
                            ))}
                          </div>
                        </Image.PreviewGroup>
                      );
                    }
                    return null;
                  })()}
                </div>
                ),
              }))}
            />
          </div>
        </Card>
      )}
    </div>
  );
}

export default Honors;
