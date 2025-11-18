import { useEffect, useState } from 'react';
import { Card, Spin, Table } from 'antd';
import { scheduleAPI } from '../services/api';

function Schedule() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await scheduleAPI.get();
      setSchedule(response.data.schedule);
    } catch (error) {
      console.error('获取课程表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组织数据为表格格式
  const organizeSchedule = () => {
    const days = ['周一', '周二', '周三', '周四', '周五'];
    const periods = [...new Set(schedule.map(s => s.period))].sort((a, b) => a - b);
    
    return periods.map(period => {
      const row = { period: `第${period}节` };
      days.forEach((day, index) => {
        const item = schedule.find(s => s.dayOfWeek === index + 1 && s.period === period);
        if (item) {
          const timeStr = item.startTime && item.endTime 
            ? `\n${item.startTime}-${item.endTime}` 
            : '';
          row[`day${index + 1}`] = `${item.subject}${timeStr}`;
        } else {
          row[`day${index + 1}`] = '-';
        }
      });
      return row;
    });
  };

  const columns = [
    { title: '节次', dataIndex: 'period', key: 'period', width: 100, fixed: 'left' },
    { title: '周一', dataIndex: 'day1', key: 'day1', render: (text) => <div className="whitespace-pre-line">{text}</div> },
    { title: '周二', dataIndex: 'day2', key: 'day2', render: (text) => <div className="whitespace-pre-line">{text}</div> },
    { title: '周三', dataIndex: 'day3', key: 'day3', render: (text) => <div className="whitespace-pre-line">{text}</div> },
    { title: '周四', dataIndex: 'day4', key: 'day4', render: (text) => <div className="whitespace-pre-line">{text}</div> },
    { title: '周五', dataIndex: 'day5', key: 'day5', render: (text) => <div className="whitespace-pre-line">{text}</div> },
  ];

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">课程表</h1>
      
      <Card>
        <Table
          columns={columns}
          dataSource={organizeSchedule()}
          pagination={false}
          scroll={{ x: 800 }}
          rowKey="period"
        />
      </Card>
    </div>
  );
}

export default Schedule;
