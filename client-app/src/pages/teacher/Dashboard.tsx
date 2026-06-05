import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Typography, Button, Space, Spin, Avatar, List } from 'antd';
import { BookOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const teacherId = user?.teacherId;

  // Query Teacher Details & Classes
  const { data: teacherRes, isLoading } = useQuery({
    queryKey: ['teacherDetails', teacherId],
    queryFn: () => api.get(`/teachers/${teacherId}`).then((res) => res.data),
    enabled: !!teacherId,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading teacher dashboard..." />
      </div>
    );
  }

  const teacher = teacherRes?.data || { fullName: '', teacherCode: '', classes: [] };
  const classes = teacher.classes || [];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
          Welcome, {teacher.fullName || 'Teacher'}!
        </Title>
        <Text type="secondary">Manage your classes, view teaching schedules, and track student attendance.</Text>
      </div>

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Classes Taught */}
        <Col xs={24} md={12} lg={8}>
          <Card
            style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
            bodyStyle={{ padding: 24 }}
          >
            <Statistic
              title={
                <Space>
                  <BookOutlined style={{ color: '#1890ff' }} />
                  <span>Classes Taught</span>
                </Space>
              }
              value={classes.length}
              valueStyle={{ color: '#1890ff', fontWeight: 800 }}
            />
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col xs={24} md={12} lg={16}>
          <Card
            title="Teaching Actions"
            style={{ borderRadius: 12, height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
          >
            <Space size={16}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => navigate('/teacher/attendance')}
                style={{ borderRadius: 8 }}
              >
                Mark Attendance
              </Button>
              <Button
                icon={<CalendarOutlined />}
                onClick={() => navigate('/teacher/schedule')}
                style={{ borderRadius: 8 }}
              >
                View Schedule
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Class List */}
      <Card
        title={
          <Space>
            <BookOutlined style={{ color: '#722ed1' }} />
            <span>My Active Classes</span>
          </Space>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
      >
        {classes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Text type="secondary">You are not assigned to any classes.</Text>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={classes}
            renderItem={(item: any) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    key="mark"
                    onClick={() => navigate(`/teacher/attendance?classId=${item.id}`)}
                  >
                    Mark Attendance
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{ backgroundColor: '#f9f0ff', color: '#722ed1' }}
                      icon={<BookOutlined />}
                    />
                  }
                  title={<Text strong>{item.className} ({item.classCode})</Text>}
                  description={
                    <Space size={16}>
                      <Text type="secondary">Schedule: {item.scheduleDay} ({item.startTime} - {item.endTime})</Text>
                      <Text type="secondary">Room: {item.room}</Text>
                    </Space>
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
