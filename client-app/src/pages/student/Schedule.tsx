import React, { useState } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Space, Spin, Button, Modal, Form, Input, Tag, Table, Alert, message, Divider } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, FormOutlined, AlertOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const StudentSchedule: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const studentId = user?.studentId;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [form] = Form.useForm();

  // Query Enrolled Classes for schedule
  const { data: classesRes, isLoading: classesLoading } = useQuery({
    queryKey: ['studentClasses', studentId],
    queryFn: () => api.get(`/classes/by-student/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  // Query Absence Requests
  const { data: requestsRes, isLoading: requestsLoading } = useQuery({
    queryKey: ['studentAbsenceRequests', studentId],
    queryFn: () => api.get(`/absence-requests/student/${studentId}`).then((res) => res.data),
    enabled: !!studentId,
  });

  // Mutation: Submit Absence Request
  const submitRequestMutation = useMutation({
    mutationFn: (values: { classId: number; reason: string }) =>
      api.post('/absence-requests', {
        studentId,
        classId: values.classId,
        reason: values.reason,
        status: 'Pending',
        requestedAt: dayjs().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentAbsenceRequests', studentId] });
      message.success('Absence request submitted successfully!');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to submit request');
    },
  });

  const checkCanRequestAbsence = (classItem: any) => {
    if (!classItem) return { allowed: false, message: '' };

    const todayDay = dayjs().format('dddd'); // e.g. "Monday"
    const classDay = classItem.scheduleDay; // e.g. "Monday"

    if (todayDay.toLowerCase() === classDay.toLowerCase()) {
      const now = dayjs();
      // Parse class start time (format HH:mm)
      const [hours, minutes] = classItem.startTime.split(':').map(Number);
      const classStartToday = dayjs().hour(hours).minute(minutes).second(0);

      if (now.isAfter(classStartToday)) {
        return {
          allowed: false,
          message: `Cannot request absence for today's session. The class started at ${classItem.startTime} (Current time: ${now.format('HH:mm')}).`,
        };
      }
    }

    return { allowed: true, message: '' };
  };

  const handleOpenRequestModal = (classItem: any) => {
    const check = checkCanRequestAbsence(classItem);
    if (!check.allowed) {
      Modal.warning({
        title: 'Absence Request Unavailable',
        content: check.message,
        okText: 'Understood',
      });
      return;
    }
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = (values: any) => {
    if (!selectedClass) return;
    submitRequestMutation.mutate({
      classId: selectedClass.id,
      reason: values.reason,
    });
  };

  if (classesLoading || requestsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading your schedule..." />
      </div>
    );
  }

  const enrolledClasses = classesRes?.data || [];
  const requests = requestsRes?.data || [];

  const columns = [
    {
      title: 'Class Name',
      dataIndex: 'className',
      key: 'className',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Requested At',
      dataIndex: 'requestedAt',
      key: 'requestedAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'gold';
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Study Schedule & Absence Requests
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          View your weekly classes and submit absence requests before the class starts.
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Weekly Schedule list */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <CalendarOutlined style={{ color: '#1890ff' }} />
                <span>My Weekly Classes</span>
              </Space>
            }
            style={{ borderRadius: 16, border: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            {enrolledClasses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <Text type="secondary">No classes in your schedule.</Text>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {enrolledClasses.map((item: any) => {
                  const check = checkCanRequestAbsence(item);
                  return (
                    <Card
                      key={item.id}
                      type="inner"
                      style={{ borderRadius: 12, border: '1px solid #f0f0f0' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                          <Title level={5} style={{ margin: 0, fontWeight: 700 }}>
                            {item.className}
                          </Title>
                          <Space size={16} style={{ marginTop: 8 }}>
                            <Text type="secondary">
                              <CalendarOutlined style={{ marginRight: 6 }} />
                              {item.scheduleDay}
                            </Text>
                            <Text type="secondary">
                              <ClockCircleOutlined style={{ marginRight: 6 }} />
                              {item.startTime} - {item.endTime}
                            </Text>
                          </Space>
                        </div>
                        <Button
                          type="primary"
                          ghost
                          icon={<FormOutlined />}
                          onClick={() => handleOpenRequestModal(item)}
                          disabled={!check.allowed}
                          style={{ borderRadius: 8 }}
                        >
                          Request Absence
                        </Button>
                      </div>
                      {!check.allowed && (
                        <div style={{ marginTop: 12 }}>
                          <Alert
                            type="warning"
                            showIcon
                            message="Absence request locked: This class has already started today."
                            style={{ borderRadius: 8, padding: '4px 12px' }}
                          />
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* Absence History */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <HistoryOutlined style={{ color: '#fa8c16' }} />
                <span>Absence Request History</span>
              </Space>
            }
            style={{ borderRadius: 16, border: '1px solid rgba(0, 0, 0, 0.06)' }}
          >
            <Table
              dataSource={requests}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="middle"
              locale={{ emptyText: 'No requests submitted yet' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Request Absence Modal */}
      <Modal
        title={
          <Space>
            <AlertOutlined style={{ color: '#fa8c16' }} />
            <span>Submit Absence Request</span>
          </Space>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        style={{ borderRadius: 16 }}
      >
        {selectedClass && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">Requesting absence for class:</Text>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 4 }}>
              {selectedClass.className}
            </div>
            <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 2 }}>
              Schedule: {selectedClass.scheduleDay} ({selectedClass.startTime} - {selectedClass.endTime})
            </div>
          </div>
        )}

        <Divider style={{ margin: '12px 0' }} />

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="reason"
            label="Reason for absence"
            rules={[{ required: true, message: 'Please input your reason!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Provide a detailed reason for your absence (e.g. sick leave, family business)..."
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ margin: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel} style={{ borderRadius: 8 }}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitRequestMutation.isPending}
                style={{ borderRadius: 8 }}
              >
                Submit Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
