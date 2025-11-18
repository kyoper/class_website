import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Modal, Form, Input, message, Popconfirm, Image, Row, Col, Tabs } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../../services/api';
import MultiImageUpload from '../../components/common/MultiImageUpload';

function PhotoManage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const fetchAlbum = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/albums/${id}`);
      if (response.success) {
        setAlbum(response.data.album);
        setPhotos(response.data.album.photos || []);
      }
    } catch (error) {
      message.error('获取相册详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhoto = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const response = await api.post(`/albums/${id}/photos`, values);
      if (response.success) {
        message.success('添加照片成功');
        setModalVisible(false);
        fetchAlbum();
      }
    } catch (error) {
      console.error('添加照片错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '添加照片失败，请检查图片URL是否有效');
    }
  };

  const handleBatchUpload = async (files) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
      
      // 批量添加照片到相册
      let successCount = 0;
      let failCount = 0;
      
      for (const file of files) {
        try {
          await api.post(`/albums/${id}/photos`, {
            url: `${baseUrl}${file.url}`,
            thumbnailUrl: file.thumbnailUrl ? `${baseUrl}${file.thumbnailUrl}` : null,
            caption: file.originalName || '无描述'
          });
          successCount++;
        } catch (err) {
          console.error('添加单张照片失败:', err);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        message.success(`成功添加 ${successCount} 张照片到相册`);
        setModalVisible(false);
        fetchAlbum();
      }
      
      if (failCount > 0) {
        message.warning(`有 ${failCount} 张照片添加失败`);
      }
    } catch (error) {
      console.error('批量添加照片错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '添加照片到相册失败，请稍后重试');
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await api.delete(`/photos/${photoId}`);
      if (response.success) {
        message.success('删除成功');
        fetchAlbum();
      }
    } catch (error) {
      console.error('删除照片错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '删除照片失败，请稍后重试');
    }
  };

  const handleSetCover = async (photoUrl) => {
    try {
      const response = await api.put(`/albums/${id}`, {
        ...album,
        coverImage: photoUrl,
      });
      if (response.success) {
        message.success('设置封面成功');
        fetchAlbum();
      }
    } catch (error) {
      console.error('设置封面错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '设置封面失败，请稍后重试');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/albums')}
          className="mb-4"
        >
          返回相册列表
        </Button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{album?.title}</h1>
            <p className="text-gray-600 mt-1">{album?.description}</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddPhoto}
            size="large"
          >
            添加照片
          </Button>
        </div>
      </div>

      <Card loading={loading}>
        {photos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>暂无照片</p>
            <Button type="link" onClick={handleAddPhoto}>
              点击添加第一张照片
            </Button>
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {photos.map((photo) => (
              <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
                <Card
                  hoverable
                  cover={
                    <Image
                      src={photo.url}
                      alt={photo.caption}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                  actions={[
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleSetCover(photo.url)}
                    >
                      设为封面
                    </Button>,
                    <Popconfirm
                      title="确定要删除这张照片吗？"
                      onConfirm={() => handleDeletePhoto(photo.id)}
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
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    description={photo.caption || '无描述'}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Modal
        title="添加照片"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Tabs
          items={[
            {
              key: 'upload',
              label: (
                <span>
                  <UploadOutlined /> 本地上传
                </span>
              ),
              children: (
                <div>
                  <p className="mb-4 text-gray-600">从手机相册或电脑选择图片上传（支持多选）</p>
                  <MultiImageUpload onSuccess={handleBatchUpload} maxCount={20} />
                </div>
              ),
            },
            {
              key: 'url',
              label: '输入URL',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                >
                  <Form.Item
                    label="照片URL"
                    name="url"
                    rules={[
                      { required: true, message: '照片URL不能为空，请输入有效的图片链接' },
                      { type: 'url', message: '请输入有效的URL格式，例如：https://example.com/photo.jpg' },
                    ]}
                  >
                    <Input placeholder="https://example.com/photo.jpg" />
                  </Form.Item>

                  <Form.Item
                    label="照片描述"
                    name="caption"
                    rules={[{ max: 200, message: '照片描述不能超过200个字符' }]}
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="请输入照片描述（可选）" 
                      showCount 
                      maxLength={200}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit">
                        添加
                      </Button>
                      <Button onClick={() => setModalVisible(false)}>
                        取消
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
}

export default PhotoManage;
