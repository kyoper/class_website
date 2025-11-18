import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-3xl font-semibold text-gray-700 mb-4">页面不存在</h2>
        <p className="text-gray-600 mb-8">抱歉，您访问的页面不存在或已被删除</p>
        <Button type="primary" size="large" onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    </div>
  );
}

export default NotFound;
