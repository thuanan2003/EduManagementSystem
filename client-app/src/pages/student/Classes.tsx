import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Space, Spin, Empty, Tag, Avatar } from 'antd';
import { BookOutlined, UserOutlined, CalendarOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

export const StudentClasses: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const studentId = user?.studentId;

  // Query Enrolled Classes
  const { data: classesRes, isLoading } = useQuery({
    queryKey: ['studentClasses', studentId],
    queryFn: () => api.get(`/classes/by-student/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading your classes..." />
      </div>
    );
  }

  const enrolledClasses = classesRes?.data || [];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
          My Enrolled Classes
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          View academic schedules, classroom locations, and teachers for your registered courses.
        </Text>
      </div>

      {enrolledClasses.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="You are not enrolled in any classes yet."
          style={{ padding: '60px 0' }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {enrolledClasses.map((item: any) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                  height: '100%',
                }}
                bodyStyle={{ padding: 24 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <Tag color="blue" style={{ borderRadius: 4, marginBottom: 8, fontWeight: 600 }}>
                      {item.classCode}
                    </Tag>
                    <Title level={4} style={{ margin: 0, fontWeight: 700, lineHeight: 1.3 }}>
                      {item.className}
                    </Title>
                  </div>
                  <Avatar
                    shape="square"
                    size={44}
                    style={{
                      backgroundColor: '#e6f7ff',
                      color: '#1890ff',
                      borderRadius: 8,
                    }}
                    icon={<BookOutlined style={{ fontSize: 22 }} />}
                  />
                </div>

                <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 0 0 0', marginTop: 16 }}>
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarOutlined style={{ color: '#8c8c8c', marginRight: 10, fontSize: 16 }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Schedule</Text>
                        <Text strong style={{ fontSize: 14 }}>
                          {item.scheduleDay} ({item.startTime} - {item.endTime})
                        </Text>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <EnvironmentOutlined style={{ color: '#8c8c8c', marginRight: 10, fontSize: 16 }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Classroom / Room</Text>
                        <Text strong style={{ fontSize: 14 }}>{item.room || 'N/A'}</Text>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <UserOutlined style={{ color: '#8c8c8c', marginRight: 10, fontSize: 16 }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Lecturer / Teacher</Text>
                        <Text strong style={{ fontSize: 14 }}>{item.teacher?.fullName || 'N/A'}</Text>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <TeamOutlined style={{ color: '#8c8c8c', marginRight: 10, fontSize: 16 }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Capacity</Text>
                        <Text strong style={{ fontSize: 14 }}>{item.capacity} Students max</Text>
                      </div>
                    </div>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};
