import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, Popconfirm, message, Typography, Card } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { courseService } from '../../services';

const { Option } = Select;
const { Title, Text } = Typography;

export const Courses: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState('');

  // Fetch Courses
  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newCourse: any) => courseService.create(newCourse),
    onSuccess: () => {
      message.success('Course created successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to create course');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => courseService.update(id, data),
    onSuccess: () => {
      message.success('Course updated successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update course');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => courseService.delete(id),
    onSuccess: () => {
      message.success('Course deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete course');
    },
  });

  const handleOpenCreateModal = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalOpen(true);
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

  const courseList = courses ?? [];
  const filteredCourses = courseList.filter((c: any) =>
    c.name.toLowerCase().includes(keyword.toLowerCase()) ||
    c.courseCode.toLowerCase().includes(keyword.toLowerCase()) ||
    c.subject.toLowerCase().includes(keyword.toLowerCase())
  );

  const columns = [
    {
      title: 'Course Code',
      dataIndex: 'courseCode',
      key: 'courseCode',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Course Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (val: string) => <Tag color="cyan">Grade {val}</Tag>,
    },
    {
      title: 'Full Package Fee',
      dataIndex: 'tuitionFee',
      key: 'tuitionFee',
      render: (fee: number) => `${fee.toLocaleString()} VND`,
    },
    {
      title: 'Price Per Session',
      dataIndex: 'pricePerSession',
      key: 'pricePerSession',
      render: (fee: number) => <Text type="success" strong>{fee.toLocaleString()} VND</Text>,
    },
    {
      title: 'Total Sessions',
      dataIndex: 'totalSessions',
      key: 'totalSessions',
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
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Course"
            description="Are you sure you want to delete this course?"
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
            Course Management
          </Title>
          <Text type="secondary">Define subject modules, full package tuition fees, and session rates.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          size="large"
          style={{ borderRadius: 8 }}
        >
          Create A New Course
        </Button>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Input
          placeholder="Search by course name, code, subject..."
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
        dataSource={filteredCourses}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,.03)' }}
      />

      {/* Create / Edit Modal */}
      <Modal
        title={editingId ? 'Update Course Details' : 'Create New Course'}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalOpen(false)}
        okText={editingId ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="name"
            label="Course Name"
            rules={[{ required: true, message: 'Please enter course name!' }]}
          >
            <Input placeholder="e.g. Mathematics Foundation 6" />
          </Form.Item>

          <Form.Item
            name="subject"
            label="Subject Category"
            rules={[{ required: true, message: 'Please enter subject category!' }]}
          >
            <Input placeholder="e.g. Math, Literature, English, STEM" />
          </Form.Item>

          <Form.Item name="grade" label="Grade Level" rules={[{ required: true, message: 'Grade level is required' }]}>
            <Input placeholder="e.g. 6" />
          </Form.Item>

          <Form.Item
            name="tuitionFee"
            label="Full Package Tuition Fee (VND)"
            rules={[{ required: true, message: 'Please enter full package fee!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 1,500,000" />
          </Form.Item>

          <Form.Item
            name="pricePerSession"
            label="Price Per Session (VND)"
            rules={[{ required: true, message: 'Please enter price per session!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="e.g. 150,000" />
          </Form.Item>

          <Form.Item
            name="totalSessions"
            label="Total Sessions count"
            rules={[{ required: true, message: 'Please enter total sessions count!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} placeholder="e.g. 10" />
          </Form.Item>

          <Form.Item name="durationWeeks" label="Duration in Weeks" initialValue={8}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item name="status" label="Status" initialValue="Active">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
