import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Spin, Alert } from 'antd';
import { WalletOutlined, HourglassOutlined, TransactionOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;

export const StudentTuition: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const studentId = user?.studentId;

  // Query Student Wallet
  const { data: walletRes, isLoading: walletLoading } = useQuery({
    queryKey: ['studentWallet', studentId],
    queryFn: () => api.get(`/wallet/student/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  // Query Student Classes (to calculate weekly session frequency)
  const { data: classesRes, isLoading: classesLoading } = useQuery({
    queryKey: ['studentClasses', studentId],
    queryFn: () => api.get(`/classes/by-student/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  if (walletLoading || classesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading tuition wallet details..." />
      </div>
    );
  }

  const wallet = walletRes?.data || { balance: 0, remainingSessions: 0, transactions: [] };
  const enrolledClasses = classesRes?.data || [];
  const transactions = wallet.transactions || [];

  // Calculate depletion prediction
  const sessionsPerWeek = enrolledClasses.length; // Each registered class is 1 session per week
  const remainingSessions = wallet.remainingSessions || 0;

  let depletionAlert = null;
  if (sessionsPerWeek > 0) {
    const weeksRemaining = Math.floor(remainingSessions / sessionsPerWeek);
    const daysRemaining = Math.floor((remainingSessions % sessionsPerWeek) * (7 / sessionsPerWeek));
    const totalDays = weeksRemaining * 7 + daysRemaining;
    const depletionDate = dayjs().add(totalDays, 'day');

    if (remainingSessions < 3) {
      depletionAlert = (
        <Alert
          message="Tuition Alert: Action Required"
          description={`Your tuition wallet has only ${remainingSessions} session(s) left. At your current rate of ${sessionsPerWeek} session(s)/week, your wallet will deplete around ${depletionDate.format('YYYY-MM-DD')} (${totalDays} days from now). Please contact administration to top up.`}
          type="error"
          showIcon
          style={{ borderRadius: 12, marginBottom: 24 }}
        />
      );
    } else if (remainingSessions < 6) {
      depletionAlert = (
        <Alert
          message="Tuition Warning"
          description={`Your tuition wallet has ${remainingSessions} sessions left. Estimated depletion date is ${depletionDate.format('YYYY-MM-DD')} (about ${weeksRemaining} weeks). Consider topping up soon.`}
          type="warning"
          showIcon
          style={{ borderRadius: 12, marginBottom: 24 }}
        />
      );
    } else {
      depletionAlert = (
        <Alert
          message="Tuition Wallet Healthy"
          description={`At your current rate of ${sessionsPerWeek} session(s)/week, your ${remainingSessions} sessions will last until approximately ${depletionDate.format('YYYY-MM-DD')} (${weeksRemaining} weeks).`}
          type="success"
          showIcon
          style={{ borderRadius: 12, marginBottom: 24 }}
        />
      );
    }
  } else {
    depletionAlert = (
      <Alert
        message="No Active Classes"
        description="You are not enrolled in any active classes, so your tuition sessions will not be consumed."
        type="info"
        showIcon
        style={{ borderRadius: 12, marginBottom: 24 }}
      />
    );
  }

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'blue';
        if (type === 'Deposit') color = 'green';
        if (type === 'Deduction') color = 'red';
        if (type === 'Refund') color = 'gold';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: any) => {
        const isNegative = record.type === 'Deduction';
        return (
          <Text style={{ color: isNegative ? '#f5222d' : '#389e0d', fontWeight: 600 }}>
            {isNegative ? '-' : '+'}{amount.toLocaleString()} VND
          </Text>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Date',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Tuition Wallet & Billing
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Monitor your active balance, check remaining sessions, and review your historical transactions.
        </Text>
      </div>

      {depletionAlert}

      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {/* Wallet Balance Card */}
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <Statistic
              title={
                <Space>
                  <WalletOutlined style={{ color: '#52c41a' }} />
                  <span>Wallet Balance</span>
                </Space>
              }
              value={wallet.balance}
              precision={0}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>

        {/* Remaining Sessions Card */}
        <Col xs={24} md={12}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <Statistic
              title={
                <Space>
                  <HourglassOutlined style={{ color: '#1890ff' }} />
                  <span>Remaining Sessions</span>
                </Space>
              }
              value={wallet.remainingSessions}
              precision={0}
              suffix="Sessions"
              valueStyle={{ color: '#1890ff', fontWeight: 800, fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Transaction History Table */}
      <Card
        title={
          <Space>
            <TransactionOutlined style={{ color: '#722ed1' }} />
            <span>Transaction Logs</span>
          </Space>
        }
        style={{ borderRadius: 16, border: '1px solid rgba(0, 0, 0, 0.06)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}
      >
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
          locale={{ emptyText: 'No transactions found.' }}
        />
      </Card>
    </div>
  );
};
