import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Row, Col, Card, Statistic, Spin, Alert, List, Typography, Space, Badge } from 'antd';
import {
  UserOutlined, TeamOutlined, BookOutlined, HomeOutlined,
  DollarOutlined, LineChartOutlined, WarningOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { dashboardService } from '../../services';

const { Title, Text } = Typography;

export const Overview: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 60000, // refresh every minute
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16, color: '#666' }}>Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Could not load dashboard statistics. Make sure the backend is running."
        type="error"
        showIcon
      />
    );
  }

  const revenueData = stats?.revenueChart ?? [];
  const attendanceData = stats?.attendanceChart ?? [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>Admin Dashboard</Title>
        <Text type="secondary">Welcome to SmartEdu management center.</Text>
      </div>

      {/* KPI Row 1 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: 'Total Students', value: stats?.totalStudents, icon: <TeamOutlined />, color: '#1890ff' },
          { title: 'Total Teachers', value: stats?.totalTeachers, icon: <UserOutlined />, color: '#52c41a' },
          { title: 'Total Classes', value: stats?.totalClasses, icon: <HomeOutlined />, color: '#722ed1' },
          { title: 'Total Courses', value: stats?.totalCourses, icon: <BookOutlined />, color: '#fa8c16' },
        ].map((kpi) => (
          <Col xs={24} sm={12} md={6} key={kpi.title}>
            <Card hoverable style={{ borderTop: `3px solid ${kpi.color}` }}>
              <Statistic
                title={kpi.title}
                value={kpi.value ?? 0}
                prefix={React.cloneElement(kpi.icon as React.ReactElement<{ style?: React.CSSProperties }>, { style: { color: kpi.color, marginRight: 8 } })}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* KPI Row 2 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ borderTop: '3px solid #13c2c2' }}>
            <Statistic
              title="Monthly Revenue"
              value={stats?.monthlyRevenue ?? 0}
              precision={0}
              suffix="VND"
              prefix={<DollarOutlined style={{ color: '#13c2c2', marginRight: 8 }} />}
              formatter={(v) => Number(v).toLocaleString('vi-VN')}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ borderTop: '3px solid #eb2f96' }}>
            <Statistic
              title="Today's Attendance"
              value={stats?.todayAttendance ?? 0}
              prefix={<LineChartOutlined style={{ color: '#eb2f96', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ borderTop: '3px solid #52c41a' }}>
            <Statistic
              title="Active Students"
              value={stats?.activeStudents ?? 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card hoverable style={{ borderTop: '3px solid #faad14' }}>
            <Statistic
              title="Pending Absence Requests"
              value={stats?.pendingAbsenceRequests ?? 0}
              prefix={<WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />}
              valueStyle={{ color: (stats?.pendingAbsenceRequests ?? 0) > 0 ? '#faad14' : 'inherit' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card title="Revenue — Last 6 Months" style={{ borderRadius: 8 }}>
            <div style={{ width: '100%', height: 300 }}>
              {revenueData.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 100 }}>
                  <Text type="secondary">No revenue data available yet.</Text>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <Tooltip formatter={(v) => [`${Number(v).toLocaleString('vi-VN')} VND`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#1890ff" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Attendance — Last 7 Days" style={{ borderRadius: 8 }}>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#52c41a" name="Present" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill="#ff4d4f" name="Absent" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill="#faad14" name="Late" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Business Rules Notice */}
      <Card title="Active Business Rules" style={{ borderRadius: 8 }}>
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={[
            'Attendance marked Present → Auto-deduct wallet',
            'Unexcused Absence → Auto-deduct wallet',
            'Excused Absence → No deduction',
            'Duplicate deduction prevented via IsDeducted flag',
            'Daily job: warn wallets < 3 sessions or < 500,000 VND',
            'Student transfer preserves remaining sessions',
          ]}
          renderItem={(item) => (
            <List.Item>
              <Space>
                <Badge status="success" />
                <Text>{item}</Text>
              </Space>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};
