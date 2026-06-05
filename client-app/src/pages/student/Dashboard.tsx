import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Typography, List, Button, Space, Spin, message, Badge, Tag } from 'antd';
import { WalletOutlined, CalendarOutlined, BookOutlined, BellOutlined, CheckOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const studentId = user?.studentId;

  // Query Student Wallet
  const { data: walletRes, isLoading: walletLoading } = useQuery({
    queryKey: ['studentWallet', studentId],
    queryFn: () => api.get(`/wallet/student/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  // Query Notifications
  const { data: notificationsRes, isLoading: notificationsLoading } = useQuery({
    queryKey: ['studentNotifications', studentId],
    queryFn: () => api.get(`/notifications/student/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  // Mutation: Mark Read
  const readMutation = useMutation({
    mutationFn: (id: number) => api.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentNotifications', studentId] });
      message.success('Notification marked as read');
    },
  });

  // Mutation: Delete
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentNotifications', studentId] });
      message.success('Notification cleared');
    },
  });

  if (walletLoading || notificationsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading student dashboard..." />
      </div>
    );
  }

  const wallet = walletRes?.data || { balance: 0, remainingSessions: 0 };
  const notifications = notificationsRes?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
          Welcome back, {user?.fullName || 'Student'}!
        </Title>
        <Text type="secondary">Here is a quick look at your academic schedule and tuition wallet.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Wallet Overview */}
        <Col xs={24} md={12} lg={8}>
          <Card
            title={
              <Space>
                <WalletOutlined style={{ color: '#13c2c2' }} />
                <span>My Tuition Wallet</span>
              </Space>
            }
            extra={<Button type="link" onClick={() => navigate('/student/tuition')}>View Details</Button>}
            style={{ borderRadius: 8 }}
          >
            <div style={{ padding: '8px 0' }}>
              <Statistic
                title="Current Balance"
                value={wallet.balance}
                precision={0}
                suffix="VND"
                valueStyle={{ color: '#13c2c2', fontWeight: 800 }}
              />
              <div style={{ marginTop: 12 }}>
                <Tag color={wallet.remainingSessions < 3 ? 'red' : 'green'} style={{ fontSize: 13, padding: '2px 8px' }}>
                  Remaining Sessions: {wallet.remainingSessions}
                </Tag>
              </div>
            </div>
          </Card>
        </Col>

        {/* Quick Links */}
        <Col xs={24} md={12} lg={8}>
          <Card
            title={
              <Space>
                <BookOutlined style={{ color: '#1890ff' }} />
                <span>Quick Navigation</span>
              </Space>
            }
            style={{ borderRadius: 8, height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<CalendarOutlined />}
                style={{ width: '100%', borderRadius: 6 }}
                onClick={() => navigate('/student/schedule')}
              >
                View Study Schedule
              </Button>
              <Button
                icon={<HomeOutlined />}
                style={{ width: '100%', borderRadius: 6 }}
                onClick={() => navigate('/student/classes')}
              >
                My Enrolled Classes
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Notifications / Alerts list */}
      <Card
        title={
          <Space>
            <Badge count={unreadCount}>
              <BellOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
            </Badge>
            <span>Wallet Alerts & Notifications</span>
          </Space>
        }
        style={{ borderRadius: 8 }}
      >
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Text type="secondary">No warnings or notifications at this time.</Text>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  !item.isRead && (
                    <Button
                      type="text"
                      icon={<CheckOutlined style={{ color: '#52c41a' }} />}
                      onClick={() => readMutation.mutate(item.id)}
                      key="read"
                    >
                      Mark Read
                    </Button>
                  ),
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteMutation.mutate(item.id)}
                    key="delete"
                  >
                    Clear
                  </Button>,
                ]}
                style={{
                  backgroundColor: item.isRead ? 'transparent' : '#f9f0ff',
                  padding: '12px 16px',
                  borderRadius: 6,
                  marginBottom: 8,
                  border: item.isRead ? 'none' : '1px solid #d3adf7',
                }}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{item.title}</Text>
                      {!item.isRead && <Tag color="red">New</Tag>}
                    </Space>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: 4 }}><Text>{item.message}</Text></div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        Sent at: {dayjs(item.sentAt).format('YYYY-MM-DD HH:mm')}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};
