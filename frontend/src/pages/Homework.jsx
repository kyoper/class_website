import { useEffect, useState } from 'react';
import { Card, Spin, Empty, DatePicker, Space, Image } from 'antd';
import dayjs from 'dayjs';
import { homeworkAPI } from '../services/api';

function Homework() {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  useEffect(() => {
    fetchHomework();
  }, [selectedDate]);

  const fetchHomework = async () => {
    setLoading(true);
    try {
      const startDate = selectedDate.startOf('day').toISOString();
      const endDate = selectedDate.endOf('day').toISOString();

      const response = await homeworkAPI.getList({ startDate, endDate });
      setHomework(response.data.homework);
    } catch (error) {
      console.error('获取作业失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAttachments = (attachments) => {
    try {
      const parsed = attachments ? JSON.parse(attachments) : [];
      if (!parsed.length) return null;
      return (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            附件图片 ({parsed.length}张)：
          </h4>
          <Image.PreviewGroup>
            <div className="grid grid-cols-2 gap-2">
              {parsed.map((url, idx) => (
                <div key={idx} className="relative group">
                  <Image
                    src={url}
                    alt={`作业附件 ${idx + 1}`}
                    className="rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors"
                    width="100%"
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        </div>
      );
    } catch {
      return null;
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
      <h1 className="text-4xl font-bold mb-8">作业展示</h1>

      <Space className="mb-6">
        <DatePicker
          value={selectedDate}
          onChange={(date) => setSelectedDate(date || dayjs())}
          format="YYYY-MM-DD"
        />
      </Space>

      {homework.length === 0 ? (
        <Empty description="今天暂无作业" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {homework.map((hw) => (
            <Card 
              key={hw.id} 
              title={
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{hw.subject}</span>
                  <span className="text-xs text-gray-500">
                    {dayjs(hw.date).format('MM-DD')}
                  </span>
                </div>
              }
              className="shadow-md hover:shadow-lg transition-shadow"
              style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ 
                flex: 1, 
                overflow: 'hidden', 
                display: 'flex', 
                flexDirection: 'column',
                padding: '16px'
              }}
            >
              {/* 内容区域 - 固定高度，可滚动 */}
              <div 
                className="flex-1 overflow-y-auto pr-2"
                style={{ 
                  maxHeight: 'calc(400px - 120px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 #f7fafc'
                }}
              >
                {/* 作业内容 */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">作业内容：</h4>
                  <p className="whitespace-pre-wrap text-gray-600 text-sm leading-relaxed">
                    {hw.content}
                  </p>
                </div>

                {/* 附件图片 */}
                {renderAttachments(hw.attachments)}
              </div>

              {/* 底部信息 - 固定位置 */}
              {hw.deadline && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    截止：{dayjs(hw.deadline).format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Homework;
