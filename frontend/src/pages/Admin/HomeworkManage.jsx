import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, DatePicker, message, Popconfirm, Select, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import MultiImageUpload from '../../components/common/MultiImageUpload';

function HomeworkManage() {
  const [homework, setHomework] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHomework, setEditingHomework] = useState(null);
  const [form] = Form.useForm();
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    setLoading(true);
    try {
      const response = await api.get('/homework');
      if (response.success) {
        setHomework(response.data.homework);
      }
    } catch (error) {
      message.error('获取作业列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingHomework(null);
    form.resetFields();
    setUploadedImages([]);
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingHomework(item);
    
    // 解析附件图片
    let attachments = [];
    try {
      if (item.attachments) {
        const parsed = JSON.parse(item.attachments);
        attachments = Array.isArray(parsed) ? parsed : [parsed];
      }
    } catch (error) {
      if (item.attachments && typeof item.attachments === 'string') {
        attachments = [item.attachments];
      }
    }
    
    setUploadedImages(attachments);
    form.setFieldsValue({
      ...item,
      date: dayjs(item.date),
      deadline: item.deadline ? dayjs(item.deadline) : null,
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
      const response = await api.delete(`/homework/${id}`);
      if (response.success) {
        message.success('删除成功');
        fetchHomework();
      }
    } catch (error) {
      console.error('删除错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '删除作业失败，请稍后重试');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
        attachments: uploadedImages.length > 0 ? JSON.stringify(uploadedImages) : null,
      };

      let response;
      if (editingHomework) {
        response = await api.put(`/homework/${editingHomework.id}`, data);
      } else {
        response = await api.post('/homework', data);
      }

      if (response.success) {
        message.success(editingHomework ? '作业更新成功！' : '作业发布成功！');
        setModalVisible(false);
        setUploadedImages([]);
        fetchHomework();
      }
    } catch (error) {
      console.error('提交错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || (editingHomework ? '更新作业失败，请检查输入信息' : '发布作业失败，请检查输入信息'));
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
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '科目',
      dataIndex: 'subject',
      key: 'subject',
      width: 100,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '附件',
      dataIndex: 'attachments',
      key: 'attachments',
      width: 80,
      render: (attachments) => {
        try {
          const images = attachments ? JSON.parse(attachments) : [];
          return images.length > 0 ? `${images.length}张` : '-';
        } catch {
          return attachments ? '1张' : '-';
        }
      },
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
      render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
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
            title="确定要删除这条作业吗？"
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
        <h1 className="text-2xl font-bold text-gray-800">作业管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          发布作业
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={homework}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingHomework ? '编辑作业' : '发布作业'}
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
          }}
        >
          <Form.Item
            label="日期"
            name="date"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="科目"
            name="subject"
            rules={[{ required: true, message: '请选择科目' }]}
          >
            <Select 
              placeholder="请选择科目"
              showSearch
              allowClear
              optionFilterProp="children"
            >
              <Select.Option value="语文">语文</Select.Option>
              <Select.Option value="数学">数学</Select.Option>
              <Select.Option value="英语">英语</Select.Option>
              <Select.Option value="物理">物理</Select.Option>
              <Select.Option value="化学">化学</Select.Option>
              <Select.Option value="生物">生物</Select.Option>
              <Select.Option value="政治">政治</Select.Option>
              <Select.Option value="历史">历史</Select.Option>
              <Select.Option value="地理">地理</Select.Option>
              <Select.Option value="体育">体育</Select.Option>
              <Select.Option value="音乐">音乐</Select.Option>
              <Select.Option value="美术">美术</Select.Option>
              <Select.Option value="信息技术">信息技术</Select.Option>
              <Select.Option value="通用技术">通用技术</Select.Option>
              <Select.Option value="综合实践">综合实践</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="作业内容"
            name="content"
            rules={[{ required: true, message: '请输入作业内容' }]}
          >
            <Input.TextArea rows={4} placeholder="请输入作业内容" />
          </Form.Item>

          <Form.Item
            label="截止日期"
            name="deadline"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="附件图片" extra="上传作业相关图片（可选，支持多张）">
            <MultiImageUpload
              onSuccess={handleImageUploadSuccess}
              maxCount={10}
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
                            alt={`附件${index + 1}`}
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
              <Button type="primary" htmlType="submit" size="large">
                {editingHomework ? '更新作业' : '发布作业'}
              </Button>
              <Button onClick={() => setModalVisible(false)} size="large">
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default HomeworkManage;
