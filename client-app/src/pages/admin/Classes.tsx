import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Button, Modal, Form, Input, Select, Space, Tag, Popconfirm, message, Typography, Card, Row, Col, Alert, Descriptions } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SwapOutlined, UserAddOutlined } from '@ant-design/icons';
import { classService, teacherService, courseService, studentService } from '../../services';

const { Option } = Select;
const { Title, Text } = Typography;

export const Classes: React.FC = () => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [enrollForm] = Form.useForm();
  const [transferForm] = Form.useForm();

  // Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferStudentId, setTransferStudentId] = useState<number | null>(null);

  // Fetch Classes
  const { data: classesList, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: classService.getAll,
  });

  // Fetch Detail Class
  const { data: classDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['classDetail', selectedClassId],
    queryFn: () => classService.getById(selectedClassId!),
    enabled: !!selectedClassId,
  });

  // Fetch Teachers
  const { data: teachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: teacherService.getAll,
  });

  // Fetch Courses
  const { data: courses } = useQuery({
    queryKey: ['courses'],
    queryFn: courseService.getAll,
  });

  // Fetch All Students (for enrollment)
  const { data: studentList } = useQuery({
    queryKey: ['allStudents'],
    queryFn: () => studentService.getAll(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (newClass: any) => classService.create(newClass),
    onSuccess: () => {
      message.success('Class created successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to create class');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => classService.update(id, data),
    onSuccess: () => {
      message.success('Class updated successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsModalOpen(false);
      form.resetFields();
      setEditingId(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to update class');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => classService.delete(id),
    onSuccess: () => {
      message.success('Class deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to delete class');
    },
  });

  // Enroll Mutation
  const enrollMutation = useMutation({
    mutationFn: (data: any) => classService.assignStudent(data.classId, data.studentId),
    onSuccess: () => {
      message.success('Student enrolled successfully');
      queryClient.invalidateQueries({ queryKey: ['classDetail', selectedClassId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsEnrollOpen(false);
      enrollForm.resetFields();
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Enrollment failed');
    },
  });

  // Unenroll Mutation
  const unenrollMutation = useMutation({
    mutationFn: (studentId: number) => classService.removeStudent(selectedClassId!, studentId),
    onSuccess: () => {
      message.success('Student unenrolled successfully');
      queryClient.invalidateQueries({ queryKey: ['classDetail', selectedClassId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to unenroll student');
    },
  });

  // Transfer: remove from current, enroll in new
  const transferMutation = useMutation({
    mutationFn: async (data: any) => {
      await classService.removeStudent(data.fromClassId, data.studentId);
      await classService.assignStudent(data.toClassId, data.studentId);
    },
    onSuccess: () => {
      message.success('Student transferred successfully, balance and sessions preserved.');
      queryClient.invalidateQueries({ queryKey: ['classDetail', selectedClassId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setIsTransferOpen(false);
      transferForm.resetFields();
      setTransferStudentId(null);
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Transfer failed');
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

  const handleOpenDetails = (id: number) => {
    setSelectedClassId(id);
    setIsDetailOpen(true);
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

  const handleEnrollSubmit = () => {
    enrollForm.validateFields().then((values) => {
      enrollMutation.mutate({
        classId: selectedClassId,
        studentId: values.studentId,
      });
    });
  };

  const handleTransferSubmit = () => {
    transferForm.validateFields().then((values) => {
      transferMutation.mutate({
        studentId: transferStudentId,
        fromClassId: selectedClassId,
        toClassId: values.toClassId,
      });
    });
  };

  const teacherList = teachers ?? [];
  const courseList = courses ?? [];
  const classListData = classesList ?? [];
  const students = studentList ?? [];
  const detail = (classDetail ?? { className: '', courseName: '', teacherName: '', scheduleDay: '', startTime: '', endTime: '', room: '', capacity: 0, studentClasses: [] }) as any;

  const columns = [
    {
      title: 'Class Code',
      dataIndex: 'classCode',
      key: 'classCode',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Class Name',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      render: (course: string) => <Tag color="blue">{course}</Tag>,
    },
    {
      title: 'Teacher',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (teacher: string) => <Text>{teacher}</Text>,
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_: any, record: any) => `${record.scheduleDay} (${record.startTime} - ${record.endTime})`,
    },
    {
      title: 'Room / Capacity',
      key: 'roomCapacity',
      render: (_: any, record: any) => `${record.room || '-'} / cap: ${record.capacity || '-'}`,
    },
    {
      title: 'Students count',
      dataIndex: 'studentCount',
      key: 'studentCount',
      render: (count: number, record: any) => (
        <Tag color={record.capacity && count >= record.capacity ? 'red' : 'green'}>
          {count} / {record.capacity || '∞'}
        </Tag>
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
            Manage
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpenEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Class"
            description="Are you sure you want to delete this class?"
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

  const detailStudentColumns = [
    {
      title: 'Student ID',
      dataIndex: 'studentCode',
      key: 'studentCode',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Contact Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'studentStatus',
      key: 'studentStatus',
      render: (status: string) => <Tag color={status === 'DangHoc' ? 'green' : 'orange'}>{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<SwapOutlined />}
            onClick={() => {
              setTransferStudentId(record.id);
              setIsTransferOpen(true);
            }}
          >
            Transfer
          </Button>
          <Popconfirm
            title="Unenroll Student"
            description="Are you sure you want to remove this student from this class?"
            onConfirm={() => unenrollMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger ghost size="small" icon={<DeleteOutlined />}>
              Remove
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
            Class Management
          </Title>
          <Text type="secondary">Schedule sessions, assign teachers, and enroll students into active cohorts.</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateModal}
          size="large"
          style={{ borderRadius: 8 }}
        >
          Create A New Class
        </Button>
      </div>

      {/* Table list */}
      <Table
        columns={columns}
        dataSource={classListData}
        rowKey="id"
        loading={isLoading}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,.03)' }}
      />

      {/* Create / Edit Modal */}
      <Modal
        title={editingId ? 'Update Class Details' : 'Create New Class'}
        open={isModalOpen}
        onOk={handleFormSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        okText={editingId ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="className"
            label="Class Name"
            rules={[{ required: true, message: 'Please enter class name!' }]}
          >
            <Input placeholder="e.g. Mathematics 6A" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="courseId"
                label="Course Module"
                rules={[{ required: true, message: 'Please select course!' }]}
              >
                <Select placeholder="Select course module">
                  {courseList.map((c: any) => (
                    <Option key={c.id} value={c.id}>
                      {c.name} (Grade {c.grade})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="teacherId"
                label="Assign Instructor"
                rules={[{ required: true, message: 'Please select teacher!' }]}
              >
                <Select placeholder="Select teacher">
                  {teacherList.map((t: any) => (
                    <Option key={t.id} value={t.id}>
                      {t.fullName} ({t.specialization})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="room" label="Room / Classroom Location">
                <Input placeholder="e.g. Room 202, Online Zoom" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacity" label="Capacity Limit" initialValue={20}>
                <Select>
                  <Option value={15}>15 Students</Option>
                  <Option value={20}>20 Students</Option>
                  <Option value={30}>30 Students</Option>
                  <Option value={50}>50 Students</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item
                name="scheduleDay"
                label="Schedule Day"
                rules={[{ required: true, message: 'Please select day!' }]}
              >
                <Select placeholder="Select day">
                  <Option value="Monday">Monday</Option>
                  <Option value="Tuesday">Tuesday</Option>
                  <Option value="Wednesday">Wednesday</Option>
                  <Option value="Thursday">Thursday</Option>
                  <Option value="Friday">Friday</Option>
                  <Option value="Saturday">Saturday</Option>
                  <Option value="Sunday">Sunday</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="startTime"
                label="Start Time"
                rules={[{ required: true, message: 'Start time is required!' }]}
                initialValue="18:00"
              >
                <Input placeholder="hh:mm (e.g. 18:00)" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="endTime"
                label="End Time"
                rules={[{ required: true, message: 'End time is required!' }]}
                initialValue="19:30"
              >
                <Input placeholder="hh:mm (e.g. 19:30)" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Class Details & Roster Modal */}
      <Modal
        title={
          <div style={{ paddingBottom: 10 }}>
            <Title level={4} style={{ margin: 0 }}>Class Roster Management</Title>
            <Text type="secondary">{detail.className} ({detail.courseName})</Text>
          </div>
        }
        open={isDetailOpen}
        onCancel={() => {
          setIsDetailOpen(false);
          setSelectedClassId(null);
        }}
        width={900}
        footer={[
          <Button key="close" onClick={() => setIsDetailOpen(false)}>
            Close
          </Button>,
        ]}
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}><Text>Loading roster...</Text></div>
        ) : (
          <div>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <Card styles={{ body: { padding: 12 } }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Instructor">{detail.teacherName}</Descriptions.Item>
                    <Descriptions.Item label="Schedule">{detail.scheduleDay} ({detail.startTime} - {detail.endTime})</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card styles={{ body: { padding: 12 } }}>
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Room Location">{detail.room || 'Not Assigned'}</Descriptions.Item>
                    <Descriptions.Item label="Capacity">{detail.studentCount} / {detail.capacity || '∞'}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text strong style={{ fontSize: 16 }}>Enrolled Students Roster</Text>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setIsEnrollOpen(true)}
                disabled={!!(detail.capacity && detail.studentClasses && detail.studentClasses.length >= detail.capacity)}
              >
                Enroll A Student
              </Button>
            </div>

            <Table
              columns={detailStudentColumns}
              dataSource={detail.studentClasses?.map((sc: any) => sc.student) ?? []}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </div>
        )}
      </Modal>

      {/* Enroll Student Modal */}
      <Modal
        title="Enroll Student in Class"
        open={isEnrollOpen}
        onOk={handleEnrollSubmit}
        onCancel={() => setIsEnrollOpen(false)}
        okText="Enroll"
        destroyOnClose
      >
        <Form form={enrollForm} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            name="studentId"
            label="Search Student"
            rules={[{ required: true, message: 'Please select a student!' }]}
          >
            <Select
              showSearch
              placeholder="Type name or code to search student..."
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as any)?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {students.map((s: any) => (
                <Option key={s.id} value={s.id}>
                  {s.fullName} ({s.studentCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Student Modal */}
      <Modal
        title="Transfer Student to Another Class"
        open={isTransferOpen}
        onOk={handleTransferSubmit}
        onCancel={() => {
          setIsTransferOpen(false);
          setTransferStudentId(null);
        }}
        okText="Transfer Student"
        destroyOnClose
      >
        <Form form={transferForm} layout="vertical" style={{ marginTop: 20 }}>
          <Alert
            message="Preserve Sessions & Wallet Balance"
            description="Transferring the student will unregister them from the current class and enroll them in the target class immediately. The wallet balance and remaining sessions are fully preserved."
            type="info"
            showIcon
            style={{ marginBottom: 20 }}
          />
          <Form.Item
            name="toClassId"
            label="Select Destination Class"
            rules={[{ required: true, message: 'Please select destination class!' }]}
          >
            <Select placeholder="Choose target class module">
              {classListData
                .filter((c: any) => c.id !== selectedClassId)
                .map((c: any) => (
                  <Option key={c.id} value={c.id}>
                    {c.className} ({c.teacher} | {c.scheduleDay})
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
