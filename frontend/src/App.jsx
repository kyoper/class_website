import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

// 页面组件（后续创建）
import Home from './pages/Home';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Gallery from './pages/Gallery';
import AlbumDetail from './pages/AlbumDetail';
import Members from './pages/Members';
import Schedule from './pages/Schedule';
import Homework from './pages/Homework';
import Honors from './pages/Honors';
import Guestbook from './pages/Guestbook';
import Search from './pages/Search';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AnnouncementManage from './pages/Admin/AnnouncementManage';
import AnnouncementForm from './pages/Admin/AnnouncementForm';
import MemberManage from './pages/Admin/MemberManage';
import HomeworkManage from './pages/Admin/HomeworkManage';
import HonorManage from './pages/Admin/HonorManage';
import MessageManage from './pages/Admin/MessageManage';
import AlbumManage from './pages/Admin/AlbumManage';
import PhotoManage from './pages/Admin/PhotoManage';
import ScheduleManage from './pages/Admin/ScheduleManage';
import ClassInfoManage from './pages/Admin/ClassInfoManage';
import PollManage from './pages/Admin/PollManage';
import ResourceManage from './pages/Admin/ResourceManage';
import Polls from './pages/Polls';
import Resources from './pages/Resources';
import NotFound from './pages/NotFound';

// 布局组件
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#2196f3',
          colorSuccess: '#4caf50',
          colorWarning: '#ff9800',
          colorError: '#f44336',
          colorInfo: '#2196f3',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
        },
      }}
    >
      <Router>
        <Routes>
          {/* 公开页面 */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="announcements/:id" element={<AnnouncementDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="gallery/:id" element={<AlbumDetail />} />
            <Route path="members" element={<Members />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="homework" element={<Homework />} />
            <Route path="honors" element={<Honors />} />
            <Route path="guestbook" element={<Guestbook />} />
            <Route path="polls" element={<Polls />} />
            <Route path="resources" element={<Resources />} />
            <Route path="search" element={<Search />} />
          </Route>

          {/* 管理后台 */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="announcements" element={<AnnouncementManage />} />
            <Route path="announcements/new" element={<AnnouncementForm />} />
            <Route path="announcements/edit/:id" element={<AnnouncementForm />} />
            <Route path="albums" element={<AlbumManage />} />
            <Route path="albums/:id/photos" element={<PhotoManage />} />
            <Route path="members" element={<MemberManage />} />
            <Route path="schedule" element={<ScheduleManage />} />
            <Route path="homework" element={<HomeworkManage />} />
            <Route path="honors" element={<HonorManage />} />
            <Route path="messages" element={<MessageManage />} />
            <Route path="polls" element={<PollManage />} />
            <Route path="resources" element={<ResourceManage />} />
            <Route path="class-info" element={<ClassInfoManage />} />
          </Route>

          {/* 404 页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
