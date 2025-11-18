import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Popconfirm,
  Tag,
  Image,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import MultiImageUpload from '../../components/common/MultiImageUpload';

const categoryOptions = [
  { label: '学术', value: 'academic', color: 'blue' },
  { label: '体育', value: 'sports', color: 'green' },
  { label: '艺术', value: 'art', color: 'purple' },
  { label: '其他', value: 'other', color: 'default' },
];

function HonorManage() {
  const [honors, setHonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHonor, setEditingHonor] = useState(null);
  const [form] = Form.useForm();
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    fetchHonors();
  }, []);

  const fetchHonors = async () => {
    setLoading(true);
    try {
      const response = await api.get('/honors');
      if (response.success) {
        setHonors(response.data.honors);
      }
    } catch (error) {
      message.error('获取荣誉列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingHonor(null);
    form.resetFields();
    setUploadedImages([]);
    setModalVisible(true);
  };

  const handleEdit = (honor) => {
    setEditingHonor(honor);
    
    console.log('编辑的荣誉数据:', honor);
    console.log('images字段:', honor.images);
    console.log('imageUrl字段:', honor.imageUrl);
    
    // 解析图片数据
    let images = [];
    try {
      if (honor.images) {
        const parsed = JSON.parse(honor.images);
        images = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (error) {
      console.error('解析images失败:', error);
      if (honor.images && typeof honor.images === 'string') {
        images = [honor.images];
      }
    }
    
    // 兼容旧数据
    if (images.length === 0 && honor.imageUrl) {
      images = [honor.imageUrl];
    }
    
    console.log('解析后的图片数组:', images);
    
    setUploadedImages(images);
    form.setFieldsValue({
      ...honor,
      description: honor.description || '',
      date: dayjs(honor.date),
    });
    setModalVisible(true);
  };

  const handleImageUploadSuccess = (files) => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const newImages = files.map((f) => `${baseUrl}${f.url}`);
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/honors/${id}`);
      if (response.success) {
        message.success('删除成功');
        fetchHonors();
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '删除荣誉失败，请稍后重试');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        images: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : null,
        imageUrl: uploadedImages.length > 0 ? uploadedImages[0] : '',
      };

      console.log('提交的数据:', data);
      console.log('uploadedImages:', uploadedImages);
      console.log('images字段:', data.images);

      let response;
      if (editingHonor) {
        response = await api.put(`/honors/${editingHonor.id}`, data);
      } else {
        response = await api.post('/honors', data);
      }

      if (response.success) {
        message.success(editingHonor ? '更新成功' : '添加成功');
        setModalVisible(false);
        setUploadedImages([]);
        fetchHonors();
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '保存荣誉失败，请检查输入信息');
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
      title: '荣誉名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => {
        const option = categoryOptions.find((item) => item.value === category);
        return <Tag color={option?.color || 'default'}>{option?.label || '其他'}</Tag>;
      },
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: window.innerWidth > 768 ? 'right' : false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个荣誉吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
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
        <h1 className="text-2xl font-bold text-gray-800">荣誉管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          添加荣誉
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={honors}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingHonor ? '编辑荣誉' : '添加荣誉'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setUploadedImages([]);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            date: dayjs(),
            category: 'academic',
          }}
        >
          <Form.Item
            label="荣誉名称"
            name="title"
            rules={[{ required: true, message: '请输入荣誉名称' }]}
          >
            <Input placeholder="例如：市级数学竞赛一等奖" />
          </Form.Item>

          <Form.Item
            label="类别"
            name="category"
            rules={[{ required: true, message: '请选择类别' }]}
          >
            <Select options={categoryOptions} />
          </Form.Item>

          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入荣誉描述' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入荣誉描述" />
          </Form.Item>

          <Form.Item label="证书图片" extra="上传荣誉证书或奖状照片（可选，支持多张）">
            <MultiImageUpload
              onSuccess={handleImageUploadSuccess}
              maxCount={5}
            />
            
            {/* 已上传图片预览 */}
            {uploadedImages.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-3 font-medium">
                  已上传 {uploadedImages.length} 张图片（点击可预览）
                </div>
                <Image.PreviewGroup>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {uploadedImages.map((url, index) => (
                      <div key={index} className="relative">
                        <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer">
                          <Image
                            src={url}
                            alt={`证书${index + 1}`}
                            className="w-full h-24 object-cover"
                            style={{ objectFit: 'cover' }}
                            preview={{
                              mask: (
                                <div className="flex items-center justify-center gap-2">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>预览</span>
                                </div>
                              )
                            }}
                          />
                        </div>
                        
                        {/* 删除按钮 - 移动端友好设计 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          className="absolute top-1 right-1 w-8 h-8 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-all"
                          title="删除图片"
                          style={{ minWidth: '32px', minHeight: '32px' }}
                        >
                          <CloseCircleOutlined className="text-base" />
                        </button>
                        
                        {/* 图片序号 */}
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded font-medium pointer-events-none">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingHonor ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default HonorManage;
