import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Tabs,
  Descriptions,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Tag,
  Typography,
  Avatar,
  Row,
  Col,
  Spin,
  Alert,
  message,
} from 'antd';
import {
  UserOutlined,
  ArrowLeftOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  WalletOutlined,
  HistoryOutlined,
  CalendarOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;

export const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  
  // Wallet modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  // Fetch Student Profile (via backend API endpoint)
  const { data: studentRes, isLoading, error } = useQuery({
    queryKey: ['studentProfile', id],
    queryFn: () => api.get(`/students/${id}`).then((res) => res.data),
  });

  // Fetch Student Wallet & Transactions
  const { data: walletRes, isLoading: walletLoading } = useQuery({
    queryKey: ['studentWallet', id],
    queryFn: () => api.get(`/wallet/student/${id}`).then((res) => res.data),
  });

  // Fetch Student Attendance
  const { data: attendanceRes, isLoading: attendanceLoading } = useQuery({
    queryKey: ['studentAttendance', id],
    queryFn: () => api.get(`/attendance/me/${id}`).then((res) => res.data),
  });

  // Mutation: Deposit
  const depositMutation = useMutation({
    mutationFn: (data: any) => api.post('/wallet/deposit', data),
    onSuccess: () => {
      message.success('Deposit successful');
      queryClient.invalidateQueries({ queryKey: ['studentWallet', id] });
      setIsDepositOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Deposit failed');
    },
  });

  // Mutation: Refund
  const refundMutation = useMutation({
    mutationFn: (data: any) => api.post('/wallet/refund', data),
    onSuccess: () => {
      message.success('Refund processed successfully');
      queryClient.invalidateQueries({ queryKey: ['studentWallet', id] });
      setIsRefundOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Refund failed');
    },
  });

  if (isLoading || walletLoading || attendanceLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading student profile details..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description="Could not load student profile. Make sure the student exists."
        type="error"
        showIcon
        action={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/students')}>
            Back to List
          </Button>
        }
      />
    );
  }

  const student = studentRes?.data || {};
  const wallet = walletRes?.data || { balance: 0, remainingSessions: 0, transactions: [] };
  const attendance = attendanceRes?.data || [];

  const handleDepositSubmit = () => {
    form.validateFields().then((values) => {
      depositMutation.mutate({
        studentId: Number(id),
        amount: values.amount,
        sessions: values.sessions,
        description: values.description,
      });
    });
  };

  const handleRefundSubmit = () => {
    form.validateFields().then((values) => {
      refundMutation.mutate({
        studentId: Number(id),
        amount: values.amount,
        sessions: values.sessions,
        description: values.description,
      });
    });
  };

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'blue';
        if (type === 'Deduction') color = 'orange';
        if (type === 'Refund') color = 'green';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Amount (VND)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => {
        const sign = record.type === 'Deduction' ? '-' : '+';
        return <Text type={record.type === 'Deduction' ? 'danger' : 'success'} strong>{sign}{amount.toLocaleString()} VND</Text>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
  ];

  const attendanceColumns = [
    {
      title: 'Date',
      dataIndex: 'attendanceDate',
      key: 'attendanceDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Class Name',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'Excused') color = 'orange';
        if (status === 'Unexcused') color = 'red';
        if (status === 'Late') color = 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/students')}
          style={{ marginBottom: 12 }}
        >
          Back to Students
        </Button>
        <Row align="middle" gutter={16}>
          <Col>
            <Avatar size={64} src={student.avatarUrl} icon={<UserOutlined />} />
          </Col>
          <Col>
            <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
              {student.fullName}
            </Title>
            <Space>
              <Text type="secondary">ID: {student.studentCode}</Text>
              <Tag color={student.studentStatus === 'DangHoc' ? 'green' : 'red'}>
                {student.studentStatus}
              </Tag>
            </Space>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Side: General Profile Summary */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <WalletOutlined />
                <span>Wallet Balance Summary</span>
              </Space>
            }
            style={{ borderRadius: 8, height: '100%' }}
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  size="small"
                  onClick={() => {
                    setIsDepositOpen(true);
                    form.resetFields();
                  }}
                >
                  Deposit
                </Button>
                <Button
                  danger
                  icon={<MinusCircleOutlined />}
                  size="small"
                  onClick={() => {
                    setIsRefundOpen(true);
                    form.resetFields();
                  }}
                >
                  Refund
                </Button>
              </Space>
            }
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Current Balance
              </Text>
              <Title level={2} style={{ margin: '8px 0', color: '#13c2c2', fontWeight: 800 }}>
                {wallet.balance.toLocaleString()} VND
              </Title>
              <Tag color={wallet.remainingSessions < 3 ? 'red' : 'green'} style={{ fontSize: 13, padding: '4px 10px' }}>
                Remaining Sessions: {wallet.remainingSessions}
              </Tag>
              {wallet.remainingSessions < 3 && (
                <div style={{ marginTop: 15 }}>
                  <Alert
                    message="Low Balance Alert"
                    description="Remaining sessions are less than 3! Send a reminder to the parent."
                    type="warning"
                    showIcon
                  />
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Right Side: Tabbed detailed info */}
        <Col xs={24} lg={16}>
          <Card style={{ borderRadius: 8, height: '100%' }}>
            <Tabs defaultActiveKey="1">
              {/* Tab 1: Personal Profile */}
              <Tabs.TabPane
                tab={
                  <span>
                    <ProfileOutlined />
                    Personal Info
                  </span>
                }
                key="1"
              >
                <Descriptions title="Student Demographics" bordered column={1} size="small">
                  <Descriptions.Item label="Full Name">{student.fullName}</Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">
                    {dayjs(student.dateOfBirth).format('YYYY-MM-DD')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">{student.gender}</Descriptions.Item>
                  <Descriptions.Item label="Address">{student.address || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{student.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Email">{student.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="School / Grade">
                    {student.schoolName} (Grade {student.gradeLevel})
                  </Descriptions.Item>
                  <Descriptions.Item label="Health / Special Notes">
                    <Text type="danger">{student.healthNote || 'No special notes'}</Text>
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions title="Parent/Guardian Contact" bordered column={1} size="small" style={{ marginTop: 24 }}>
                  <Descriptions.Item label="Parent Name">{student.parentName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Parent Phone">{student.parentPhone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="Parent Email">{student.parentEmail || '-'}</Descriptions.Item>
                </Descriptions>
              </Tabs.TabPane>

              {/* Tab 2: Attendance Logs */}
              <Tabs.TabPane
                tab={
                  <span>
                    <CalendarOutlined />
                    Attendance History
                  </span>
                }
                key="2"
              >
                <Table
                  columns={attendanceColumns}
                  dataSource={attendance}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              </Tabs.TabPane>

              {/* Tab 3: Wallet Transactions */}
              <Tabs.TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    Wallet Transactions
                  </span>
                }
                key="3"
              >
                <Table
                  columns={transactionColumns}
                  dataSource={wallet.transactions || []}
                  rowKey="id"
                  pagination={{ pageSize: 5 }}
                />
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Deposit Modal */}
      <Modal
        title="Deposit to Wallet"
        open={isDepositOpen}
        onOk={handleDepositSubmit}
        onCancel={() => setIsDepositOpen(false)}
        okText="Deposit"
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="amount"
            label="Deposit Amount (VND)"
            rules={[{ required: true, message: 'Please enter deposit amount!' }]}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value ? value.replace(/\$\s?|(,*)/g, '') : '0')}
              min={1000}
              placeholder="e.g. 1,500,000"
            />
          </Form.Item>
          <Form.Item
            name="sessions"
            label="Sessions to Credit"
            rules={[{ required: true, message: 'Please enter count of sessions to credit!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g. 10" />
          </Form.Item>
          <Form.Item name="description" label="Description" initialValue="Tuition wallet deposit">
            <Input placeholder="Comment details" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Refund Modal */}
      <Modal
        title="Refund / Debit Wallet"
        open={isRefundOpen}
        onOk={handleRefundSubmit}
        onCancel={() => setIsRefundOpen(false)}
        okText="Debit Wallet"
        okButtonProps={{ danger: true }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="amount"
            label="Refund/Debit Amount (VND)"
            rules={[{ required: true, message: 'Please enter debit amount!' }]}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value ? value.replace(/\$\s?|(,*)/g, '') : '0')}
              min={0}
              placeholder="e.g. 150,000"
            />
          </Form.Item>
          <Form.Item
            name="sessions"
            label="Sessions to Deduct"
            rules={[{ required: true, message: 'Please enter count of sessions to deduct!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 1" />
          </Form.Item>
          <Form.Item name="description" label="Description" initialValue="Tuition wallet debit">
            <Input placeholder="Comment details" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
