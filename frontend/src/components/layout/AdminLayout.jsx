import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Dropdown, Avatar, Drawer, Modal, Form, Input, message } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LockOutlined,
  HomeOutlined,
  NotificationOutlined,
  PictureOutlined,
  TeamOutlined,
  CalendarOutlined,
  BookOutlined,
  TrophyOutlined,
  MessageOutlined,
  InfoCircleOutlined,
  BarChartOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';

const { Header, Sider, Content } = Layout;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.admin);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { key: '/admin', label: '首页', icon: <HomeOutlined /> },
    { key: '/admin/announcements', label: '公告管理', icon: <NotificationOutlined /> },
    { key: '/admin/albums', label: '相册管理', icon: <PictureOutlined /> },
    { key: '/admin/members', label: '成员管理', icon: <TeamOutlined /> },
    { key: '/admin/schedule', label: '课程表管理', icon: <CalendarOutlined /> },
    { key: '/admin/homework', label: '作业管理', icon: <BookOutlined /> },
    { key: '/admin/honors', label: '荣誉管理', icon: <TrophyOutlined /> },
    { key: '/admin/messages', label: '留言管理', icon: <MessageOutlined /> },
    { key: '/admin/polls', label: '投票管理', icon: <BarChartOutlined /> },
    { key: '/admin/resources', label: '资源库管理', icon: <FolderOutlined /> },
    { key: '/admin/class-info', label: '班级信息', icon: <InfoCircleOutlined /> },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const userMenuItems = [
    { key: 'change-password', icon: <LockOutlined />, label: '修改密码', onClick: () => setPasswordModalVisible(true) },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') return '/admin';
    const matched = menuItems.find((item) => item.key !== '/admin' && path.startsWith(item.key));
    return matched?.key || '/admin';
  };

  const selectedKey = getSelectedKey();

  const handleMenuItemClick = ({ key }) => {
    handleMenuClick({ key });
    if (isMobile) setDrawerVisible(false);
  };

  const submitPassword = async (values) => {
    setPasswordSubmitting(true);
    try {
      await api.put('/auth/password', values);
      message.success('密码修改成功，请重新登录');
      passwordForm.resetFields();
      setPasswordModalVisible(false);
      logout();
      navigate('/admin/login');
    } catch (error) {
      message.error(error?.message || '密码修改失败，请重试');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 桌面端侧边栏 */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsed={collapsed}
          theme="dark"
          width={220}
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            zIndex: 10,
          }}
        >
          <div className="h-16 flex items-center justify-center border-b border-gray-700 bg-gray-900">
            {collapsed ? (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                班
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  班
                </div>
                <div className="text-white">
                  <div className="font-semibold">班级网站</div>
                  <div className="text-xs text-gray-300">管理后台</div>
                </div>
              </div>
            )}
          </div>

          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuItemClick}
            style={{ border: 'none', padding: '12px 0' }}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900">
            <div className="flex items-center gap-3">
              <Avatar icon={<UserOutlined />} size="large" className="bg-blue-500" />
              <div className="text-white">
                <div className="font-medium truncate">{user?.username || '管理员'}</div>
                <div className="text-xs text-gray-400">系统管理员</div>
              </div>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
              />
            </div>
          </div>
        </Sider>
      )}

      {/* 移动端抽屉菜单 */}
      {isMobile && (
        <Drawer
          title={
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">班</span>
              </div>
              <div>
                <div className="text-white font-bold text-base">清水亭七（三）班</div>
                <div className="text-gray-400 text-xs">管理后台</div>
              </div>
            </div>
          }
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          styles={{
            body: { padding: 0, background: '#001529' },
            header: {
              background: '#001529',
              borderBottom: '1px solid #1f1f1f',
              padding: '16px 24px',
            },
          }}
          width={280}
          closeIcon={<span className="text-white text-xl">×</span>}
        >
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuItemClick}
            style={{ border: 'none', background: '#001529', fontSize: '14px', fontWeight: 500 }}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900">
            <div className="flex items-center gap-3">
              <Avatar icon={<UserOutlined />} size="large" className="bg-blue-500" />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{user?.username || '管理员'}</div>
                <div className="text-gray-400 text-xs">系统管理员</div>
              </div>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="text-gray-400 hover:text-white"
                title="退出登录"
              />
            </div>
          </div>
        </Drawer>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 220 }}>
        <Header
          className="bg-white shadow-sm px-4 md:px-6 flex items-center justify-between"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: '64px',
            lineHeight: '64px',
            padding: '0 24px',
          }}
        >
          {isMobile && (
            <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerVisible(true)} style={{ fontSize: '18px' }} />
          )}

          {!isMobile && (
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
          )}

          <div className="flex items-center gap-2 md:gap-4">
            <Button type="link" onClick={() => window.open('/', '_blank')} className="hidden md:inline-flex">
              查看网站
            </Button>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar icon={<UserOutlined />} size={isMobile ? 'small' : 'default'} />
                <span className="hidden md:inline">{user?.username || '管理员'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="bg-gray-100" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>

      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={passwordForm} onFinish={submitPassword}>
          <Form.Item
            label="当前密码"
            name="currentPassword"
            rules={[
              { required: true, message: '请输入当前密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            hasFeedback
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, message: '新密码至少 6 位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: '请再次输入新密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={passwordSubmitting} block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default AdminLayout;
