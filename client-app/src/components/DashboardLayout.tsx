import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Badge, Popconfirm, theme, Modal, Form, Input, message, Spin, Popover, List } from 'antd';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { logout, updateUserInfo } from '../store/authSlice';
import api from '../services/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  HomeOutlined,
  CalendarOutlined,
  WalletOutlined,
  FileTextOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UploadOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const queryClient = useQueryClient();
  const studentId = user?.studentId;
  const teacherId = user?.teacherId;
  const isStudent = user?.roles?.includes('Student');
  const isTeacher = user?.roles?.includes('Teacher');
  const isAdmin = user?.roles?.includes('Admin');

  const { data: notificationsRes } = useQuery({
    queryKey: ['notifications', studentId, teacherId],
    queryFn: () => {
      if (isStudent && studentId) {
        return api.get(`/notifications/student/${studentId}`).then((res) => res.data);
      }
      if (isTeacher && teacherId) {
        return api.get(`/notifications/teacher/${teacherId}`).then((res) => res.data);
      }
      return Promise.resolve({ data: [] });
    },
    enabled: !!(studentId || teacherId),
    refetchInterval: 15000,
  });

  const notifications = notificationsRes?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (err) {
      message.error('Failed to mark notification as read');
    }
  };

  const notificationContent = (
    <div style={{ width: 320, maxHeight: 400, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontWeight: 600 }}>Thông báo</span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            style={{ padding: 0 }}
            onClick={async () => {
              try {
                const unreadNotifications = notifications.filter((n: any) => !n.isRead);
                await Promise.all(unreadNotifications.map((n: any) => api.put(`/notifications/${n.id}/read`)));
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
                message.success('Đã đọc tất cả thông báo');
              } catch (err) {
                message.error('Thao tác thất bại');
              }
            }}
          >
            Đọc tất cả
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#8c8c8c' }}>
          Không có thông báo nào
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(item: any) => (
            <List.Item
              style={{
                padding: '8px 8px',
                backgroundColor: item.isRead ? 'transparent' : '#f0f5ff',
                cursor: 'pointer',
                borderRadius: 4,
                marginBottom: 4,
                display: 'block',
              }}
              onClick={() => {
                if (!item.isRead) {
                  handleMarkAsRead(item.id);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: item.isRead ? 500 : 700, fontSize: 13, color: '#262626' }}>
                  {item.title}
                </span>
                <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                  {dayjs(item.sentAt).format('HH:mm DD/MM')}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#595959', marginTop: 4 }}>
                {item.message}
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm] = Form.useForm();
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleOpenProfileModal = () => {
    setAvatarPreview(user?.avatarUrl || '');
    profileForm.setFieldsValue({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      avatarUrl: user?.avatarUrl || '',
      password: '',
    });
    setProfileModalOpen(true);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = res.data.data;
      setAvatarPreview(fileUrl);
      profileForm.setFieldsValue({ avatarUrl: fileUrl });
      message.success('Avatar uploaded successfully');
    } catch (err) {
      message.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = () => {
    profileForm.validateFields().then(async (values) => {
      try {
        const res = await api.put('/auth/profile', values);
        dispatch(updateUserInfo(res.data.data));
        message.success('Profile updated successfully');
        setProfileModalOpen(false);
      } catch (err: any) {
        message.error(err.response?.data?.message || 'Failed to update profile');
      }
    });
  };
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };



  // Define sidebar menu items based on roles
  const getMenuItems = () => {
    if (isAdmin) {
      return [
        {
          key: '/admin',
          icon: <DashboardOutlined />,
          label: <Link to="/admin">Overview</Link>,
        },
        {
          key: '/admin/students',
          icon: <TeamOutlined />,
          label: <Link to="/admin/students">Students</Link>,
        },
        {
          key: '/admin/teachers',
          icon: <UserOutlined />,
          label: <Link to="/admin/teachers">Teachers</Link>,
        },
        {
          key: '/admin/courses',
          icon: <BookOutlined />,
          label: <Link to="/admin/courses">Courses</Link>,
        },
        {
          key: '/admin/classes',
          icon: <HomeOutlined />,
          label: <Link to="/admin/classes">Classes</Link>,
        },
        {
          key: '/admin/reports',
          icon: <FileTextOutlined />,
          label: <Link to="/admin/reports">Reports</Link>,
        },
      ];
    } else if (isStudent) {
      return [
        {
          key: '/student',
          icon: <DashboardOutlined />,
          label: <Link to="/student">Dashboard</Link>,
        },
        {
          key: '/student/schedule',
          icon: <CalendarOutlined />,
          label: <Link to="/student/schedule">Schedule</Link>,
        },
        {
          key: '/student/classes',
          icon: <HomeOutlined />,
          label: <Link to="/student/classes">My Classes</Link>,
        },
        {
          key: '/student/tuition',
          icon: <WalletOutlined />,
          label: <Link to="/student/tuition">Tuition Wallet</Link>,
        },
      ];
    } else if (isTeacher) {
      return [
        {
          key: '/teacher',
          icon: <DashboardOutlined />,
          label: <Link to="/teacher">Dashboard</Link>,
        },
        {
          key: '/teacher/schedule',
          icon: <CalendarOutlined />,
          label: <Link to="/teacher/schedule">Teaching Schedule</Link>,
        },
        {
          key: '/teacher/attendance',
          icon: <TeamOutlined />,
          label: <Link to="/teacher/attendance">Attendance</Link>,
        },
      ];
    }
    return [];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={250}
        style={{
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div
          style={{
            height: 64,
            margin: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 12,
          }}
        >
          <Avatar
            size={40}
            src="/logo.png"
            icon={<BookOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          {!collapsed && (
            <span
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}
            >
              SmartEdu
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          style={{ borderRight: 0, fontSize: '15px' }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
            zIndex: 1,
            position: 'sticky',
            top: 0,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Popover
              content={notificationContent}
              trigger="click"
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <Badge count={unreadCount} overflowCount={99} size="small">
                <Button type="text" shape="circle" icon={<BellOutlined />} />
              </Badge>
            </Popover>
            <div
              onClick={handleOpenProfileModal}
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            >
              <Avatar src={user?.avatarUrl} icon={<UserOutlined />} style={{ backgroundColor: '#87d068' }} />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{user?.fullName || user?.email}</span>
                <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                  {isAdmin ? 'Administrator' : isTeacher ? 'Teacher' : 'Student'}
                </span>
              </div>
            </div>
            <Popconfirm
              title="Logout"
              description="Are you sure you want to log out?"
              onConfirm={handleLogout}
              okText="Yes"
              cancelText="No"
              placement="bottomRight"
            >
              <Button
                type="primary"
                danger
                ghost
                icon={<LogoutOutlined />}
                size="small"
              >
                Logout
              </Button>
            </Popconfirm>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>

      <Modal
        title="Edit Profile"
        open={profileModalOpen}
        onOk={handleProfileSubmit}
        onCancel={() => setProfileModalOpen(false)}
        okText="Save Changes"
        destroyOnClose
      >
        <Form form={profileForm} layout="vertical" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <Avatar size={80} src={avatarPreview} icon={<UserOutlined />} style={{ marginBottom: 12 }} />
            <Button icon={<UploadOutlined />} loading={uploading} style={{ position: 'relative', overflow: 'hidden' }}>
              Upload Avatar
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  margin: 0,
                  padding: 0,
                  fontSize: '20px',
                  cursor: 'pointer',
                  opacity: 0,
                  filter: 'alpha(opacity=0)',
                  height: '100%',
                  width: '100%',
                }}
              />
            </Button>
          </div>

          <Form.Item name="avatarUrl" style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter your full name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>

          <Form.Item name="password" label="New Password (optional)">
            <Input.Password placeholder="Leave blank to keep current password" />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};
