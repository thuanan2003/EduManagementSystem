import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks/redux';
import { setCredentials } from '../store/authSlice';
import api from '../services/api';

const { Title, Text } = Typography;

export const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const { data } = response.data;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      dispatch(setCredentials({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      }));

      // Redirect based on role
      const roles = data.user.roles || [];
      if (roles.includes('Admin')) {
        navigate('/admin');
      } else if (roles.includes('Student')) {
        navigate('/student');
      } else if (roles.includes('Teacher')) {
        navigate('/teacher');
      } else {
        setError('Unauthorized role');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0d9488 100%)',
        padding: '20px',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Space align="center" style={{ marginBottom: 12 }}>
            <BookOutlined style={{ fontSize: 32, color: '#1890ff' }} />
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
              SmartEdu
            </Title>
          </Space>
          <div>
            <Text type="secondary">Student Management & Tuition Wallet System</Text>
          </div>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email!' },
              { type: 'email', message: 'Please enter a valid email address!' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email address"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 10 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{
                width: '100%',
                borderRadius: 8,
                fontWeight: 600,
                height: 48,
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: '13px' }}>
          <Text type="secondary">Demo accounts: </Text>
          <div style={{ marginTop: 5 }}>
            <Text code>admin@smartedu.local</Text> (pw: <Text code>Admin@123</Text>)<br />
            <Text code>teacher@smartedu.local</Text> (pw: <Text code>Teacher@123</Text>)<br />
            <Text code>student@smartedu.local</Text> (pw: <Text code>Student@123</Text>)
          </div>
        </div>
      </Card>
    </div>
  );
};
