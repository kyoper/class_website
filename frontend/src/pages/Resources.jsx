import { useEffect, useState } from 'react';
import { Card, Input, Select, Empty, Spin, Button, Tag, message } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { resourceAPI } from '../services/api';

const { Search } = Input;
const { Option } = Select;

function Resources() {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

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

  const fetchResources = async (categoryId = null, search = '') => {
    setLoading(true);
    try {
      const params = {};
      if (categoryId) params.categoryId = categoryId;
      if (search) params.search = search;
      
      const response = await resourceAPI.getAll(params);
      setResources(response.data.resources || []);
    } catch (error) {
      message.error('获取资源列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    fetchResources(categoryId, searchKeyword);
  };

  const handleSearch = (value) => {
    setSearchKeyword(value);
    fetchResources(selectedCategory, value);
  };

  const handleDownload = async (resource) => {
    try {
      const response = await resourceAPI.download(resource.id);
      let fileUrl = response.data.fileUrl;
      
      // 如果是相对路径，转换为完整URL
      if (fileUrl && !fileUrl.startsWith('http')) {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const baseUrl = apiBase.replace('/api', '');
        fileUrl = baseUrl + fileUrl;
      }
      
      // 创建一个隐藏的a标签来触发下载
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = response.data.fileName || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('开始下载');
    } catch (error) {
      console.error('下载错误:', error);
      message.error(error.message || '下载失败');
    }
  };

  const getFileIcon = (fileType) => {
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      ppt: '📊',
      pptx: '📊',
      xls: '📈',
      xlsx: '📈',
      zip: '📦',
      rar: '📦',
    };
    return icons[fileType?.toLowerCase()] || '📁';
  };

  if (loading && resources.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">学习资源库</h1>
        <p className="text-gray-600">下载学习资料，提升学习效率</p>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <Search
            placeholder="搜索资源..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="选择分类"
            size="large"
            style={{ width: 200 }}
            allowClear
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* 分类标签 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <Tag
            color={!selectedCategory ? 'blue' : 'default'}
            style={{ cursor: 'pointer', padding: '4px 12px', fontSize: '14px' }}
            onClick={() => handleCategoryChange(null)}
          >
            全部
          </Tag>
          {categories.map((cat) => (
            <Tag
              key={cat.id}
              color={selectedCategory === cat.id ? 'blue' : 'default'}
              style={{ cursor: 'pointer', padding: '4px 12px', fontSize: '14px' }}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.icon} {cat.name} ({cat._count.resources})
            </Tag>
          ))}
        </div>
      </div>

      {/* 资源列表 */}
      {resources.length === 0 ? (
        <Empty description="暂无资源" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Card
              key={resource.id}
              hoverable
              className="h-full"
              actions={[
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownload(resource)}
                  block
                >
                  下载 ({resource.downloadCount || 0})
                </Button>,
              ]}
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{getFileIcon(resource.fileType)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2 truncate">
                    {resource.title}
                  </h3>
                  {resource.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Tag color="blue">{resource.category.name}</Tag>
                    {resource.fileType && (
                      <Tag>{resource.fileType.toUpperCase()}</Tag>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {resource.fileName}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default Resources;
