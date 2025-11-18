import { useEffect, useState } from 'react';
import { Card, Button, Table, Modal, Form, Input, Select, message, Space } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import api from '../../services/api';

function ScheduleManage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [form] = Form.useForm();

  const weekdays = ['周一', '周二', '周三', '周四', '周五'];
  const periods = [
    { key: 1, label: '第一节' },
    { key: 2, label: '第二节' },
    { key: 3, label: '第三节' },
    { key: 4, label: '第四节' },
    { key: 5, label: '第五节' },
    { key: 6, label: '第六节' },
    { key: 7, label: '第七节' },
    { key: 8, label: '第八节' },
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await api.get('/schedule');
      if (response.success) {
        setSchedule(response.data.schedule);
      }
    } catch (error) {
      message.error('获取课程表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record, dayOfWeek, period) => {
    if (record) {
      // 编辑现有课程
      setEditingCell(record);
      form.setFieldsValue({
        subject: record.subject,
        startTime: record.startTime,
        endTime: record.endTime,
      });
    } else {
      // 添加新课程
      setEditingCell({ dayOfWeek, period });
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      let updatedSchedule;
      
      if (editingCell.id) {
        // 更新现有课程
        updatedSchedule = schedule.map(item => {
          if (item.id === editingCell.id) {
            return { ...item, ...values };
          }
          return item;
        });
      } else {
        // 添加新课程
        const newLesson = {
          dayOfWeek: editingCell.dayOfWeek,
          period: editingCell.period,
          ...values,
        };
        updatedSchedule = [...schedule, newLesson];
      }

      const response = await api.put('/schedule', { schedule: updatedSchedule });
      if (response.success) {
        message.success(editingCell.id ? '更新成功' : '添加成功');
        setModalVisible(false);
        fetchSchedule();
      }
    } catch (error) {
      message.error(editingCell.id ? '更新失败' : '添加失败');
    }
  };

  const handleBatchUpdate = async () => {
    try {
      const response = await api.put('/schedule', { schedule });
      if (response.success) {
        message.success('保存成功');
        fetchSchedule();
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  // 将课程表数据转换为表格格式
  const getTableData = () => {
    const data = [];
    periods.forEach(period => {
      const row = { period: period.label };
      weekdays.forEach((day, dayIndex) => {
        const lesson = schedule.find(
          item => item.dayOfWeek === dayIndex + 1 && item.period === period.key
        );
        row[`day${dayIndex + 1}`] = lesson;
      });
      data.push(row);
    });
    return data;
  };

  const columns = [
    {
      title: '节次',
      dataIndex: 'period',
      key: 'period',
      width: 100,
      fixed: 'left',
    },
    ...weekdays.map((day, index) => ({
      title: day,
      dataIndex: `day${index + 1}`,
      key: `day${index + 1}`,
      width: 150,
      render: (lesson, record) => {
        // 从 record.period 获取节次编号
        const periodNumber = periods.find(p => p.label === record.period)?.key;
        return (
          <div
            className="cursor-pointer hover:bg-blue-50 p-2 rounded min-h-[60px] transition-colors"
            onClick={() => handleEdit(lesson, index + 1, periodNumber)}
          >
            {lesson ? (
              <div className="text-center">
                <div className="font-semibold text-blue-600">{lesson.subject}</div>
                {lesson.startTime && lesson.endTime && (
                  <div className="text-xs text-gray-500 mt-1">
                    {lesson.startTime} - {lesson.endTime}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-400 text-center hover:text-blue-500 flex items-center justify-center h-full">
                点击添加
              </div>
            )}
          </div>
        );
      },
    })),
  ];

  const commonSubjects = [
    '语文', '数学', '英语', '物理', '化学', '生物',
    '政治', '历史', '地理', '体育', '音乐', '美术',
    '信息技术', '班会', '自习'
  ];

  // 生成时间选项（5分钟间隔，6:00-22:00）
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        times.push({ label: timeStr, value: timeStr });
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">课程表管理</h1>
          <p className="text-gray-600 mt-1">点击课程格子进行编辑</p>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleBatchUpdate}
          size="large"
        >
          保存课程表
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={getTableData()}
          rowKey="period"
          loading={loading}
          pagination={false}
          scroll={{ x: 900 }}
          bordered
        />
      </Card>

      <Modal
        title={editingCell?.id ? "编辑课程" : "添加课程"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="科目"
            name="subject"
            rules={[{ required: true, message: '请输入科目' }]}
          >
            <Select
              placeholder="请选择或输入科目"
              showSearch
              allowClear
              options={commonSubjects.map(s => ({ label: s, value: s }))}
            />
          </Form.Item>

          <Form.Item
            label="开始时间"
            name="startTime"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <Select
              placeholder="请选择开始时间"
              showSearch
              options={timeOptions}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item
            label="结束时间"
            name="endTime"
            dependencies={['startTime']}
            rules={[
              { required: true, message: '请选择结束时间' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const startTime = getFieldValue('startTime');
                  if (!value || !startTime) {
                    return Promise.resolve();
                  }
                  if (value <= startTime) {
                    return Promise.reject(new Error('结束时间必须晚于开始时间'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Select
              placeholder="请选择结束时间"
              showSearch
              options={timeOptions}
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCell?.id ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Card className="mt-4" title="使用说明">
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• 点击任意课程格子可以编辑该节课的科目</li>
          <li>• 点击空白格子可以添加新课程</li>
          <li>• 科目可以从下拉列表选择，也可以手动输入</li>
          <li>• 编辑完成后记得点击"保存课程表"按钮</li>
        </ul>
      </Card>
    </div>
  );
}

export default ScheduleManage;
