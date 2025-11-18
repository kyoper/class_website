import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Space } from 'antd';
import {
  NotificationOutlined,
  PictureOutlined,
  TeamOutlined,
  TrophyOutlined,
  MessageOutlined,
  BookOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    announcements: 0,
    albums: 0,
    members: 0,
    honors: 0,
    messages: 0,
    homework: 0,
    polls: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [announcements, albums, members, honors, messages, homework, polls] = await Promise.all([
        api.get('/announcements', { params: { pageSize: 1 } }),
        api.get('/albums'),
        api.get('/members'),
        api.get('/honors'),
        api.get('/messages', { params: { pageSize: 1 } }),
        api.get('/homework'),
        api.get('/polls'),
      ]);

      setStats({
        announcements: announcements.data?.pagination?.total || 0,
        albums: albums.data?.albums?.length || 0,
        members: members.data?.members?.length || 0,
        honors: honors.data?.honors?.length || 0,
        messages: messages.data?.pagination?.total || 0,
        homework: homework.data?.homework?.length || 0,
        polls: polls.data?.polls?.length || 0,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: '发布公告', path: '/admin/announcements/new', icon: <NotificationOutlined /> },
    { label: '上传照片', path: '/admin/albums', icon: <PictureOutlined /> },
    { label: '管理成员', path: '/admin/members', icon: <TeamOutlined /> },
    { label: '发布作业', path: '/admin/homework', icon: <BookOutlined /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">首页</h1>
        <p className="text-gray-600 mt-1">欢迎回来，管理员</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} hoverable>
            <Statistic
              title="公告总数"
              value={stats.announcements}
              prefix={<NotificationOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} hoverable>
            <Statistic
              title="相册数量"
              value={stats.albums}
              prefix={<PictureOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} hoverable>
            <Statistic
              title="班级成员"
              value={stats.members}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} hoverable>
            <Statistic
              title="荣誉数量"
              value={stats.honors}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} hoverable>
            <Statistic
              title="留言总数"
              value={stats.messages}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} hoverable>
            <Statistic
              title="作业数量"
              value={stats.homework}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card loading={loading} hoverable>
            <Statistic
              title="投票数量"
              value={stats.polls}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作 */}
      <Card title="快捷操作" className="mb-6">
        <Space wrap size="middle">
          {quickActions.map((action) => (
            <Button
              key={action.path}
              type="primary"
              icon={action.icon}
              onClick={() => navigate(action.path)}
              size="large"
            >
              {action.label}
            </Button>
          ))}
        </Space>
      </Card>

      {/* 管理菜单 */}
      <Card title="内容管理">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/announcements')}
            >
              <NotificationOutlined style={{ marginRight: 8 }} />
              公告管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/albums')}
            >
              <PictureOutlined style={{ marginRight: 8 }} />
              相册管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/members')}
            >
              <TeamOutlined style={{ marginRight: 8 }} />
              成员管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/schedule')}
            >
              <CalendarOutlined style={{ marginRight: 8 }} />
              课程表管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/homework')}
            >
              <BookOutlined style={{ marginRight: 8 }} />
              作业管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/honors')}
            >
              <TrophyOutlined style={{ marginRight: 8 }} />
              荣誉管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/messages')}
            >
              <MessageOutlined style={{ marginRight: 8 }} />
              留言管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/polls')}
            >
              <BarChartOutlined style={{ marginRight: 8 }} />
              投票管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/resources')}
            >
              <FolderOutlined style={{ marginRight: 8 }} />
              资源库管理
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Button
              type="default"
              block
              size="large"
              onClick={() => navigate('/admin/class-info')}
            >
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              班级信息
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default AdminDashboard;
