import { useState } from 'react';
import { Input, Card, Empty, Spin, Tabs } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { searchAPI } from '../services/api';

const { Search } = Input;

function SearchPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const handleSearch = async (value) => {
    if (!value.trim()) return;
    
    setLoading(true);
    setKeyword(value);
    try {
      const response = await searchAPI.search({ q: value });
      setResults(response.data.results);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">搜索</h1>

      <Search
        placeholder="搜索公告、相册、留言..."
        enterButton={<SearchOutlined />}
        size="large"
        onSearch={handleSearch}
        className="mb-8"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      ) : results ? (
        <Card>
          <p className="mb-4 text-gray-600">
            搜索 "{keyword}" 的结果
          </p>
          
          <Tabs
            items={[
              {
                key: 'announcements',
                label: `公告 (${results.announcements?.length || 0})`,
                children: results.announcements?.length === 0 ? (
                  <Empty description="没有找到相关公告" />
                ) : (
                  <div className="space-y-2">
                    {results.announcements?.map((item) => (
                      <Link key={item.id} to={`/announcements/${item.id}`}>
                        <Card size="small" hoverable>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ),
              },
              {
                key: 'albums',
                label: `相册 (${results.albums?.length || 0})`,
                children: results.albums?.length === 0 ? (
                  <Empty description="没有找到相关相册" />
                ) : (
                  <div className="space-y-2">
                    {results.albums?.map((item) => (
                      <Link key={item.id} to={`/gallery/${item.id}`}>
                        <Card size="small" hoverable>
                          <h3 className="font-semibold">{item.title}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ),
              },
              {
                key: 'messages',
                label: `留言 (${results.messages?.length || 0})`,
                children: results.messages?.length === 0 ? (
                  <Empty description="没有找到相关留言" />
                ) : (
                  <div className="space-y-2">
                    {results.messages?.map((item) => (
                      <Card key={item.id} size="small">
                        <p className="font-semibold text-primary-600">{item.nickname}</p>
                        <p className="text-sm">{item.content}</p>
                      </Card>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      ) : (
        <Empty description="请输入关键词进行搜索" />
      )}
    </div>
  );
}

export default SearchPage;
