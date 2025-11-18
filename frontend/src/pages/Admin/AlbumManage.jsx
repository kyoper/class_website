import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';

function AlbumManage() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const response = await api.get('/albums');
      if (response.success) {
        setAlbums(response.data.albums);
      }
    } catch (error) {
      message.error('获取相册列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAlbum(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (album) => {
    setEditingAlbum(album);
    form.setFieldsValue({
      ...album,
      coverImageUrl: album.coverImage || '',
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/albums/${id}`);
      if (response.success) {
        message.success('删除成功');
        fetchAlbums();
      }
    } catch (error) {
      console.error('删除错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '删除相册失败，该相册可能包含照片，请先删除照片');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = { ...values };
      if (!payload.coverImage && payload.coverImageUrl) {
        payload.coverImage = payload.coverImageUrl;
      }
      delete payload.coverImageUrl;

      let response;
      if (editingAlbum) {
        response = await api.put(`/albums/${editingAlbum.id}`, payload);
      } else {
        response = await api.post('/albums', payload);
      }

      if (response.success) {
        message.success(editingAlbum ? '更新成功' : '创建成功');
        setModalVisible(false);
        fetchAlbums();
      }
    } catch (error) {
      console.error('提交错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || (editingAlbum ? '更新相册失败，请检查输入信息' : '创建相册失败，请检查输入信息'));
    }
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '封面',
      dataIndex: 'coverImage',
      key: 'coverImage',
      width: 100,
      render: (url) => url ? (
        <Image src={url} width={60} height={60} style={{ objectFit: 'cover' }} />
      ) : (
        <div className="w-15 h-15 bg-gray-200 flex items-center justify-center">
          无封面
        </div>
      ),
    },
    {
      title: '相册名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '照片数量',
      dataIndex: '_count',
      key: '_count',
      width: 100,
      render: (count) => count?.photos || 0,
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      fixed: window.innerWidth > 768 ? 'right' : false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/gallery/${record.id}`, '_blank')}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<UploadOutlined />}
            onClick={() => navigate(`/admin/albums/${record.id}/photos`)}
          >
            管理照片
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个相册吗？"
            description="删除相册将同时删除其中的所有照片"
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">相册管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          创建相册
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={albums}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingAlbum ? '编辑相册' : '创建相册'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="相册名称"
            name="title"
            rules={[
              { required: true, message: '相册名称不能为空，请输入名称' },
              { max: 100, message: '相册名称不能超过100个字符' }
            ]}
          >
            <Input 
              placeholder="请输入相册名称" 
              showCount 
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label="相册描述"
            name="description"
            rules={[{ max: 500, message: '相册描述不能超过500个字符' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入相册描述" 
              showCount 
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="封面图片"
            name="coverImage"
            extra="支持上传图片或输入图片URL"
          >
            <ImageUpload />
          </Form.Item>

          <Form.Item
            label="或输入图片URL"
            name="coverImageUrl"
            rules={[
              { type: 'url', message: '请输入有效的URL格式' }
            ]}
          >
            <Input placeholder="也可以直接输入图片URL（可选）" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAlbum ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AlbumManage;
