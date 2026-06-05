import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Space, Spin, Empty, Tag, Avatar } from 'antd';
import { BookOutlined, CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import api from '../../services/api';

const { Title, Text } = Typography;

export const TeacherSchedule: React.FC = () => {
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
        <Spin size="large" tip="Loading schedule..." />
      </div>
    );
  }

  const teacher = teacherRes?.data || { classes: [] };
  const classes = teacher.classes || [];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
          My Teaching Schedule
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          View details and scheduled hours of the classes you are currently instructing.
        </Text>
      </div>

      {classes.length === 0 ? (
        <Empty description="No classes found in your teaching schedule." style={{ padding: '60px 0' }} />
      ) : (
        <Row gutter={[24, 24]}>
          {classes.map((item: any) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <Card
                hoverable
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  height: '100%',
                }}
                bodyStyle={{ padding: 24 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <Tag color="purple" style={{ borderRadius: 4, marginBottom: 8, fontWeight: 600 }}>
                      {item.classCode}
                    </Tag>
                    <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
                      {item.className}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'inline-block' }}>
                      Course: {item.courseName}
                    </Text>
                  </div>
                  <Avatar
                    shape="square"
                    size={44}
                    style={{
                      backgroundColor: '#f9f0ff',
                      color: '#722ed1',
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
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Schedule Day</Text>
                        <Text strong style={{ fontSize: 14 }}>{item.scheduleDay}</Text>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <ClockCircleOutlined style={{ color: '#8c8c8c', marginRight: 10, fontSize: 16 }} />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Time Slot</Text>
                        <Text strong style={{ fontSize: 14 }}>
                          {item.startTime} - {item.endTime}
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
