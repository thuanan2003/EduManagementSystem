import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Input, Button, Modal, Form, Select, InputNumber, Space, Tag, Popconfirm, message, Typography, Avatar, Row, Col, Card, Tabs, Descriptions, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, WalletOutlined, CalendarOutlined, ProfileOutlined, UserOutlined, UploadOutlined } from '@ant-design/icons';
import { teacherService } from '../../services';
import api from '../../services/api';

const { Option } = Select;
const { Title, Text } = Typography;

export const Teachers: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Details Modal
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter States
  const [keyword, setKeyword] = useState('');

  // Fetch Teachers
  const { data: teachers, isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: teacherService.getAll,
  });

  // Fetch Teacher Details
  const { data: teacherDetail, isLoading: detailsLoading } = useQuery({
    queryKey: ['teacherDetail', selectedTeacherId],
    queryFn: () => teacherService.getById(selectedTeacherId!),
    enabled: !!selectedTeacherId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newTeacher: any) => teacherService.create(newTeacher),
    onSuccess: () => {
      message.success('Teacher profile created successfully');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to create teacher profile');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => teacherService.update(id, data),
    onSuccess: () => {
      message.success('Teacher profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update teacher profile');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => teacherService.delete(id),
    onSuccess: () => {
      message.success('Teacher profile deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete teacher profile');
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setAvatarPreview('');
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: any) => {
    setEditingId(record.id);
    setAvatarPreview(record.avatarUrl || '');
    form.setFieldsValue(record);
    setIsModalOpen(true);
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
      form.setFieldsValue({ avatarUrl: fileUrl });
      message.success('Avatar uploaded successfully');
    } catch (err) {
      message.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDetails = (id: number) => {
    setSelectedTeacherId(id);
    setIsDetailsOpen(true);
  };

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const dataSubmit = {
        ...values,
        id: editingId || 0,
      };

      if (editingId) {
        updateMutation.mutate({ id: editingId, data: dataSubmit });
      } else {
        createMutation.mutate(dataSubmit);
      }
    });
  };

  const teacherList = teachers ?? [];
  const filteredTeachers = teacherList.filter((t: any) =>
    t.fullName.toLowerCase().includes(keyword.toLowerCase()) ||
    t.teacherCode.toLowerCase().includes(keyword.toLowerCase()) ||
    t.specialization.toLowerCase().includes(keyword.toLowerCase())
  );

  const columns = [
    {
      title: 'Teacher Code',
      dataIndex: 'teacherCode',
      key: 'teacherCode',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Full Name',
      key: 'fullName',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
          <Text>{record.fullName}</Text>
        </Space>
      ),
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (val: string) => <Tag color="purple">{val}</Tag>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => (
        <Tag color={val === 'Active' ? 'green' : 'red'}>{val}</Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleOpenDetails(record.id)}
          >
            Profile
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Teacher"
            description="Are you sure you want to delete this teacher profile?"
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger ghost icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const detail = (teacherDetail ?? {}) as any;
  const payroll = { monthlySalary: detail.monthlySalary ?? 0, bonus: detail.bonus ?? 0, classesCount: detail.classCount ?? 0, totalPayout: (detail.monthlySalary ?? 0) + (detail.bonus ?? 0) };

  const classColumns = [
    {
      title: 'Class Code',
      dataIndex: 'classCode',
      key: 'classCode',
    },
    {
      title: 'Class Name',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Course',
      dataIndex: 'courseName',
      key: 'courseName',
    },
    {
      title: 'Schedule Day',
      dataIndex: 'scheduleDay',
      key: 'scheduleDay',
    },
    {
      title: 'Timing',
      key: 'timing',
      render: (_: any, record: any) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Teacher Management
          </Title>
          <Text type="secondary">Manage professional files, schedules, and payroll parameters for teachers.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          size="large"
          style={{ borderRadius: 8 }}
        >
          Create A New Teacher
        </Button>
      </div>

      {/* Search Filter */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Input
          placeholder="Search by name, teacher code, specialization..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          size="large"
          style={{ maxWidth: 450 }}
        />
      </Card>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredTeachers}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,.03)' }}
      />

      {/* Create / Edit Modal */}
      <Modal
        title={editingId ? 'Update Teacher Profile' : 'Create New Teacher Profile'}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        okText={editingId ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name!' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="specialization"
                label="Specialization"
                rules={[{ required: true, message: 'Please enter specialization!' }]}
              >
                <Input placeholder="e.g. Mathematics, English" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="Contact phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Enter a valid email address!' }]}
              >
                <Input placeholder="Teacher email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="monthlySalary"
                label="Base Monthly Salary (VND)"
                rules={[{ required: true, message: 'Please enter monthly salary!' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 10,000,000" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="bonus" label="Bonus / Session Allowances (VND)" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 500,000" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="avatarUrl" label="Avatar" valuePropName="value">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar size={48} src={avatarPreview} icon={<UserOutlined />} />
                  <Button icon={<UploadOutlined />} loading={uploading} style={{ position: 'relative', overflow: 'hidden' }}>
                    Upload Photo
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
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="status" label="Status" initialValue="Active">
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {!editingId && (
            <Form.Item
              name="password"
              label="Initial Password"
              rules={[
                { required: true, message: 'Password is required!' },
                { min: 6, message: 'Password must be at least 6 characters!' }
              ]}
            >
              <Input.Password placeholder="Min 6 chars, upper + digit" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* Details Profile Slide / Modal */}
      <Modal
        title="Teacher Professional Profile"
        open={isDetailsOpen}
        onCancel={() => {
          setIsDetailsOpen(false);
          setSelectedTeacherId(null);
        }}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsDetailsOpen(false)}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        {detailsLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="default" />
          </div>
        ) : (
          <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
            {/* Tab 1: Personal Profile */}
            <Tabs.TabPane
              tab={
                <span>
                  <ProfileOutlined />
                  Profile Details
                </span>
              }
              key="1"
            >
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Teacher Code">{detail.teacherCode}</Descriptions.Item>
                <Descriptions.Item label="Full Name">{detail.fullName}</Descriptions.Item>
                <Descriptions.Item label="Specialization">{detail.specialization}</Descriptions.Item>
                <Descriptions.Item label="Phone">{detail.phone || '-'}</Descriptions.Item>
                <Descriptions.Item label="Email">{detail.email || '-'}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={detail.status === 'Active' ? 'green' : 'red'}>{detail.status}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>

            {/* Tab 2: Teaching Schedule */}
            <Tabs.TabPane
              tab={
                <span>
                  <CalendarOutlined />
                  Teaching Schedule
                </span>
              }
              key="2"
            >
              <Table
                columns={classColumns}
                dataSource={detail.classes || []}
                rowKey="id"
                pagination={false}
              />
            </Tabs.TabPane>

            {/* Tab 3: Payroll Parameter */}
            <Tabs.TabPane
              tab={
                <span>
                  <WalletOutlined />
                  Payroll & Allowances
                </span>
              }
              key="3"
            >
                <div style={{ padding: '16px 0' }}>
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Base Monthly Salary">
                      <Text strong>{payroll.monthlySalary.toLocaleString()} VND</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Session Bonus / Allowances">
                      {payroll.bonus.toLocaleString()} VND
                    </Descriptions.Item>
                    <Descriptions.Item label="Assigned Classes Count">
                      {payroll.classesCount} classes
                    </Descriptions.Item>
                    <Descriptions.Item label="Estimated Monthly Payout">
                      <Text type="success" style={{ fontSize: 16, fontWeight: 700 }}>
                        {payroll.totalPayout.toLocaleString()} VND
                      </Text>
                    </Descriptions.Item>
                  </Descriptions>
                </div>
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};
