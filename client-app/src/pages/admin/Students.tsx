import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Input, Button, Modal, Form, Select, DatePicker, Space, Tag, Popconfirm, message, Typography, Avatar, Row, Col, Card } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { studentService } from '../../services';
import api from '../../services/api';

const { Option } = Select;
const { Title, Text } = Typography;

export const Students: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');

  // Query Students
  const { data: students, isLoading } = useQuery({
    queryKey: ['students', keyword, status],
    queryFn: () => studentService.getAll({ search: keyword || undefined, status: status || undefined }),
  });

  // Mutation: Create Student
  const createMutation = useMutation({
    mutationFn: (newStudent: any) => studentService.create(newStudent),
    onSuccess: () => {
      message.success('Student created successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to create student');
    },
  });

  // Mutation: Update Student
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => studentService.update(id, data),
    onSuccess: () => {
      message.success('Student updated successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update student');
    },
  });

  // Mutation: Delete Student
  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentService.delete(id),
    onSuccess: () => {
      message.success('Student deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete student');
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
    form.setFieldsValue({
      ...record,
      dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
    });
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

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      const dataSubmit = {
        ...values,
        id: editingId || 0,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
      };

      if (editingId) {
        updateMutation.mutate({ id: editingId, data: dataSubmit });
      } else {
        createMutation.mutate(dataSubmit);
      }
    });
  };

  const columns = [
    {
      title: 'Student ID',
      dataKey: 'studentCode',
      key: 'studentCode',
      render: (_: any, record: any) => <Text strong>{record.studentCode}</Text>,
    },
    {
      title: 'Full Name',
      key: 'fullName',
      render: (_: any, record: any) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={<Avatar />} />
          <Text>{record.fullName}</Text>
        </Space>
      ),
    },
    {
      title: 'DOB',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Grade',
      dataIndex: 'gradeLevel',
      key: 'gradeLevel',
      render: (val: string) => <Tag color="blue">Grade {val}</Tag>,
    },
    {
      title: 'Parent Phone',
      dataIndex: 'parentPhone',
      key: 'parentPhone',
    },
    {
      title: 'Status',
      dataIndex: 'studentStatus',
      key: 'studentStatus',
      render: (val: string) => {
        const colorMap: Record<string, string> = { Active: 'green', Suspended: 'warning', Reserved: 'purple', Dropped: 'error' };
        return <Tag color={colorMap[val] ?? 'default'}>{val}</Tag>;
      },
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
            onClick={() => navigate(`/admin/students/${record.id}`)}
          >
            Details
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Student"
            description="Are you sure you want to delete this student profile?"
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

  const studentList = students ?? [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Student Management
          </Title>
          <Text type="secondary">Create, update, and manage student profiles and wallets.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          size="large"
          style={{ borderRadius: 8 }}
        >
          Create A New Student
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Search by name, student code, phone, email..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter by status"
              value={status}
              onChange={(val) => setStatus(val)}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="">All Statuses</Option>
              <Option value="Active">Active</Option>
              <Option value="Suspended">Suspended</Option>
              <Option value="Reserved">Reserved</Option>
              <Option value="Dropped">Dropped</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <Table
        columns={columns}
        dataSource={studentList}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,.03)' }}
      />

      {/* Create / Edit Modal */}
      <Modal
        title={editingId ? 'Update Student Profile' : 'Create New Student'}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        okText={editingId ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="studentCode"
                label="Student Code"
              >
                <Input placeholder="e.g. ST00001 (Leave blank to auto-generate)" disabled={!!editingId} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="fullName"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter full name!' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Please select DOB!' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true, message: 'Please select gender!' }]}
              >
                <Select placeholder="Select gender">
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="phone" label="Phone">
                <Input placeholder="Student phone" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ type: 'email', message: 'Enter a valid email!' }]}
              >
                <Input placeholder="Student email" disabled={!!editingId} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={24}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Home address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={6}>
              <Form.Item name="gradeLevel" label="Grade Level">
                <Input placeholder="e.g. 6" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="schoolName" label="School Name">
                <Input placeholder="School name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name="studentStatus" label="Status" initialValue="Active">
                <Select>
                  <Option value="Active">Active</Option>
                  <Option value="Suspended">Suspended</Option>
                  <Option value="Reserved">Reserved</Option>
                  <Option value="Dropped">Dropped</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="parentName" label="Parent Name">
                <Input placeholder="Parent name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="parentPhone" label="Parent Phone">
                <Input placeholder="Parent contact phone" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="parentEmail" label="Parent Email">
                <Input placeholder="Parent email" />
              </Form.Item>
            </Col>
          </Row>

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

          <Form.Item name="healthNote" label="Health / Special Notes">
            <Input.TextArea rows={2} placeholder="Any medical conditions or alerts" />
          </Form.Item>

          {!editingId && (
            <Form.Item name="password" label="Initial Password" rules={[{ required: true, message: 'Password required!' }]}>
              <Input.Password placeholder="Min 6 chars, upper + digit" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};
