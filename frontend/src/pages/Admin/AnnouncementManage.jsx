import { useEffect, useState } from 'react';
import { Table, Button, Space, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import dayjs from 'dayjs';

function AnnouncementManage() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.current, pagination.pageSize]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/announcements', {
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
        },
      });
      
      if (response.success) {
        setAnnouncements(response.data.announcements);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      message.error('获取公告列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/announcements/${id}`);
      if (response.success) {
        message.success('删除成功');
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('删除错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '删除公告失败，请稍后重试');
    }
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      ellipsis: true,
      width: 300,
    },
    {
      title: '重要',
      dataIndex: 'isImportant',
      key: 'isImportant',
      width: 80,
      render: (isImportant) => (
        isImportant ? <Tag color="red">重要</Tag> : <Tag>普通</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      fixed: window.innerWidth > 768 ? 'right' : false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/announcements/${record.id}`, '_blank')}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/announcements/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这条公告吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">公告管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/announcements/new')}
          size="large"
        >
          发布公告
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={announcements}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        scroll={{ x: 1000 }}
      />
    </div>
  );
}

export default AnnouncementManage;
