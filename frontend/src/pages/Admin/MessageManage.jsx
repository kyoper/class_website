import { useEffect, useState } from 'react';
import { Table, Button, message, Popconfirm, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

function MessageManage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  useEffect(() => {
    fetchMessages();
  }, [pagination.current, pagination.pageSize]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/messages', {
        params: {
          page: pagination.current,
          pageSize: pagination.pageSize,
        },
      });
      
      if (response.success) {
        setMessages(response.data.messages);
        setPagination({
          ...pagination,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      message.error('获取留言列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/messages/${id}`);
      if (response.success) {
        message.success('删除成功');
        fetchMessages();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id => api.delete(`/messages/${id}`)));
      message.success('批量删除成功');
      fetchMessages();
    } catch (error) {
      message.error('批量删除失败');
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
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 120,
    },
    {
      title: '留言内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '留言时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: window.innerWidth > 768 ? 'right' : false,
      render: (_, record) => (
        <Popconfirm
          title="确定要删除这条留言吗？"
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

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">留言管理</h1>
        {selectedRowKeys.length > 0 && (
          <Popconfirm
            title={`确定要删除选中的 ${selectedRowKeys.length} 条留言吗？`}
            onConfirm={() => {
              handleBatchDelete(selectedRowKeys);
              setSelectedRowKeys([]);
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button danger>
              批量删除 ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={messages}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        rowSelection={rowSelection}
        scroll={{ x: 1000 }}
      />
    </div>
  );
}

export default MessageManage;
