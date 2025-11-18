import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag,
  Tabs,
  Card,
  Statistic,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FolderOutlined,
  FileOutlined,
  BarChartOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { resourceAPI } from '../../services/api';
import api from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

function ResourceManage() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [statsModalVisible, setStatsModalVisible] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentStats, setCurrentStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [categoryForm] = Form.useForm();

  useEffect(() => {
    fetchCategories();
    fetchResources();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await resourceAPI.getAllCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      message.error('获取分类失败');
    }
  };

  const fetchResources = async (categoryId = null) => {
    setLoading(true);
    try {
      const params = categoryId ? { categoryId } : {};
      const response = await resourceAPI.getAll(params);
      setResources(response.data.resources || []);
    } catch (error) {
      message.error('获取资源列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 资源管理
  const handleAddResource = () => {
    setEditingResource(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditResource = (record) => {
    setEditingResource(record);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      categoryId: record.categoryId,
      fileUrl: record.fileUrl,
      fileName: record.fileName,
      fileType: record.fileType,
    });
    setModalVisible(true);
  };

  const handleDeleteResource = async (id) => {
    try {
      await resourceAPI.delete(id);
      message.success('删除成功');
      fetchResources(selectedCategory);
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/resources/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const { fileUrl, fileName, fileSize, fileType } = result.data;
        form.setFieldsValue({
          fileUrl,
          fileName,
          fileSize,
          fileType,
        });
        message.success('文件上传成功');
      } else {
        message.error(result.message || '上传失败');
      }
    } catch (error) {
      console.error('上传错误:', error);
      message.error('文件上传失败');
    } finally {
      setUploading(false);
    }

    return false; // 阻止默认上传行为
  };

  const handleSubmitResource = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingResource) {
        await resourceAPI.update(editingResource.id, values);
        message.success('更新成功');
      } else {
        await resourceAPI.create(values);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      fetchResources(selectedCategory);
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  const handleViewStats = async (record) => {
    try {
      const response = await resourceAPI.getStats(record.id);
      setCurrentStats({ ...response.data, title: record.title });
      setStatsModalVisible(true);
    } catch (error) {
      message.error('获取统计失败');
    }
  };

  // 分类管理
  const handleAddCategory = () => {
    setEditingCategory(null);
    categoryForm.resetFields();
    setCategoryModalVisible(true);
  };

  const handleEditCategory = (record) => {
    setEditingCategory(record);
    categoryForm.setFieldsValue({
      name: record.name,
      description: record.description,
      icon: record.icon,
      order: record.order,
    });
    setCategoryModalVisible(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await resourceAPI.deleteCategory(id);
      message.success('删除成功');
      fetchCategories();
      if (selectedCategory === id) {
        setSelectedCategory(null);
        fetchResources();
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmitCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      
      // 处理分类名称（如果是数组，取第一个值）
      if (Array.isArray(values.name)) {
        values.name = values.name[0];
      }
      
      if (editingCategory) {
        await resourceAPI.updateCategory(editingCategory.id, values);
        message.success('更新成功');
      } else {
        await resourceAPI.createCategory(values);
        message.success('创建成功');
      }
      
      setCategoryModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  const resourceColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      width: 100,
      render: (name) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 150,
    },
    {
      title: '文件类型',
      dataIndex: 'fileType',
      key: 'fileType',
      width: 100,
      render: (type) => type && <Tag>{type.toUpperCase()}</Tag>,
    },
    {
      title: '下载次数',
      dataIndex: 'downloadCount',
      key: 'downloadCount',
      width: 100,
      render: (count) => <Tag color="green">{count || 0}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => handleViewStats(record)}
          >
            统计
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditResource(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个资源吗？"
            onConfirm={() => handleDeleteResource(record.id)}
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

  const categoryColumns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
      render: (icon) => icon && <span style={{ fontSize: '20px' }}>{icon}</span>,
    },
    {
      title: '资源数量',
      dataIndex: ['_count', 'resources'],
      key: 'count',
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个分类吗？"
            description="删除分类会同时删除该分类下的所有资源！"
            onConfirm={() => handleDeleteCategory(record.id)}
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
        <h1 className="text-2xl font-bold text-gray-800">资源库管理</h1>
      </div>

      <Tabs
        defaultActiveKey="resources"
        items={[
          {
            key: 'resources',
            label: (
              <span>
                <FileOutlined />
                资源管理
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-between items-center">
                  <Space>
                    <Select
                      placeholder="选择分类"
                      style={{ width: 200 }}
                      allowClear
                      value={selectedCategory}
                      onChange={(value) => {
                        setSelectedCategory(value);
                        fetchResources(value);
                      }}
                    >
                      {categories.map((cat) => (
                        <Option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </Option>
                      ))}
                    </Select>
                  </Space>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddResource}
                    size="large"
                  >
                    添加资源
                  </Button>
                </div>

                <Table
                  columns={resourceColumns}
                  dataSource={resources}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1200 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `共 ${total} 条`,
                  }}
                />
              </div>
            ),
          },
          {
            key: 'categories',
            label: (
              <span>
                <FolderOutlined />
                分类管理
              </span>
            ),
            children: (
              <div>
                <div className="mb-4 flex justify-end">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddCategory}
                    size="large"
                  >
                    添加分类
                  </Button>
                </div>

                <Table
                  columns={categoryColumns}
                  dataSource={categories}
                  rowKey="id"
                  pagination={false}
                />
              </div>
            ),
          },
        ]}
      />

      {/* 资源 Modal */}
      <Modal
        title={editingResource ? '编辑资源' : '添加资源'}
        open={modalVisible}
        onOk={handleSubmitResource}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText="保存"
        cancelText="取消"
        centered
        styles={{
          body: { maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="资源标题"
            name="title"
            rules={[{ required: true, message: '请输入资源标题' }]}
          >
            <Input placeholder="例如：第一单元测试卷" />
          </Form.Item>

          <Form.Item label="资源描述" name="description">
            <TextArea rows={3} placeholder="简要描述资源内容" />
          </Form.Item>

          <Form.Item
            label="分类"
            name="categoryId"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="选择分类">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="文件上传"
            name="fileUrl"
            rules={[{ required: true, message: '请上传文件或输入文件URL' }]}
            extra="支持上传文件（最大50MB）或直接输入文件URL链接"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Upload
                beforeUpload={handleFileUpload}
                showUploadList={false}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt"
              >
                <Button icon={<UploadOutlined />} loading={uploading} block>
                  {uploading ? '上传中...' : '选择文件上传'}
                </Button>
              </Upload>
              <Input
                placeholder="或直接输入文件URL"
                value={form.getFieldValue('fileUrl')}
                onChange={(e) => form.setFieldsValue({ fileUrl: e.target.value })}
              />
            </Space>
          </Form.Item>

          <Form.Item
            label="文件名"
            name="fileName"
            rules={[{ required: true, message: '请输入文件名' }]}
          >
            <Input placeholder="file.pdf" />
          </Form.Item>

          <Form.Item label="文件类型" name="fileType">
            <Select placeholder="选择文件类型">
              <Option value="pdf">PDF</Option>
              <Option value="doc">Word</Option>
              <Option value="docx">Word (docx)</Option>
              <Option value="ppt">PowerPoint</Option>
              <Option value="pptx">PowerPoint (pptx)</Option>
              <Option value="xls">Excel</Option>
              <Option value="xlsx">Excel (xlsx)</Option>
              <Option value="zip">ZIP</Option>
              <Option value="rar">RAR</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 分类 Modal */}
      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={categoryModalVisible}
        onOk={handleSubmitCategory}
        onCancel={() => setCategoryModalVisible(false)}
        okText="保存"
        cancelText="取消"
        centered
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            label="分类名称"
            name="name"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Select
              placeholder="选择或输入分类名称"
              showSearch
              allowClear
              mode="tags"
              maxCount={1}
              options={[
                { label: '语文', value: '语文' },
                { label: '数学', value: '数学' },
                { label: '英语', value: '英语' },
                { label: '物理', value: '物理' },
                { label: '化学', value: '化学' },
                { label: '生物', value: '生物' },
                { label: '政治', value: '政治' },
                { label: '历史', value: '历史' },
                { label: '地理', value: '地理' },
                { label: '信息技术', value: '信息技术' },
                { label: '音乐', value: '音乐' },
                { label: '美术', value: '美术' },
                { label: '体育', value: '体育' },
                { label: '通用技术', value: '通用技术' },
                { label: '综合实践', value: '综合实践' },
                { label: '其他', value: '其他' },
              ]}
            />
          </Form.Item>

          <Form.Item label="分类描述" name="description">
            <TextArea rows={2} placeholder="简要描述" />
          </Form.Item>

          <Form.Item label="图标" name="icon">
            <Select
              placeholder="选择图标"
              showSearch
              allowClear
              options={[
                { label: '📚 书本', value: '📚' },
                { label: '📖 打开的书', value: '📖' },
                { label: '📝 笔记', value: '📝' },
                { label: '✏️ 铅笔', value: '✏️' },
                { label: '🖊️ 钢笔', value: '🖊️' },
                { label: '📐 三角尺', value: '📐' },
                { label: '📏 直尺', value: '📏' },
                { label: '🔬 显微镜', value: '🔬' },
                { label: '🧪 试管', value: '🧪' },
                { label: '🧬 DNA', value: '🧬' },
                { label: '🌍 地球', value: '🌍' },
                { label: '🗺️ 地图', value: '🗺️' },
                { label: '🎨 调色板', value: '🎨' },
                { label: '🎵 音符', value: '🎵' },
                { label: '🎸 吉他', value: '🎸' },
                { label: '⚽ 足球', value: '⚽' },
                { label: '🏀 篮球', value: '🏀' },
                { label: '💻 电脑', value: '💻' },
                { label: '🖥️ 显示器', value: '🖥️' },
                { label: '📱 手机', value: '📱' },
                { label: '🔧 工具', value: '🔧' },
                { label: '⚙️ 齿轮', value: '⚙️' },
                { label: '🌟 星星', value: '🌟' },
                { label: '💡 灯泡', value: '💡' },
                { label: '🎯 目标', value: '🎯' },
              ]}
            />
          </Form.Item>

          <Form.Item label="排序" name="order" initialValue={0}>
            <Input type="number" placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 统计 Modal */}
      <Modal
        title="下载统计"
        open={statsModalVisible}
        onCancel={() => setStatsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setStatsModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
        centered
      >
        {currentStats && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{currentStats.title}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card>
                <Statistic
                  title="总下载次数"
                  value={currentStats.totalDownloads}
                  prefix={<DownloadOutlined />}
                />
              </Card>
              <Card>
                <Statistic
                  title="最近下载"
                  value={currentStats.recentDownloads}
                  suffix="次"
                />
              </Card>
            </div>
            <div>
              <h4 className="font-semibold mb-2">按日期统计：</h4>
              <div className="space-y-2">
                {Object.entries(currentStats.downloadsByDate || {}).map(([date, count]) => (
                  <div key={date} className="flex justify-between">
                    <span>{date}</span>
                    <Tag color="blue">{count} 次</Tag>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ResourceManage;
