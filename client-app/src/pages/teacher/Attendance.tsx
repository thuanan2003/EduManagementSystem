import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, Row, Col, Typography, Space, Spin, Select, DatePicker, Table, Radio, Button, message, Alert, Badge, Tag } from 'antd';
import { CheckCircleOutlined, BookOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

export const TeacherAttendance: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAppSelector((state) => state.auth);
  const teacherId = user?.teacherId;

  // Selected Class & Date State
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>(
    searchParams.get('classId') ? Number(searchParams.get('classId')) : undefined
  );
  const [attendanceDate, setAttendanceDate] = useState<dayjs.Dayjs>(dayjs());
  const [attendanceMap, setAttendanceMap] = useState<Record<number, string>>({});

  // Query Teacher's Classes
  const { data: teacherRes, isLoading: teacherLoading } = useQuery({
    queryKey: ['teacherDetails', teacherId],
    queryFn: () => api.get(`/teachers/${teacherId}`).then((res) => res.data),
    enabled: !!teacherId,
  });

  const classes = teacherRes?.data?.classes || [];

  // Sync class ID from URL query param if changed
  useEffect(() => {
    const urlClassId = searchParams.get('classId');
    if (urlClassId) {
      setSelectedClassId(Number(urlClassId));
    }
  }, [searchParams]);

  // Query Selected Class Roster
  const { data: classDetailsRes, isLoading: classDetailsLoading } = useQuery({
    queryKey: ['classDetails', selectedClassId],
    queryFn: () => api.get(`/classes/${selectedClassId}`).then((res) => res.data),
    enabled: !!selectedClassId,
  });

  const classItem = classDetailsRes?.data || { studentClasses: [] };
  const students = React.useMemo(() => {
    return classDetailsRes?.data?.studentClasses?.map((sc: any) => sc.student) || [];
  }, [classDetailsRes?.data?.studentClasses]);

  // Query Student Wallets (to show warnings if remainingSessions <= 0 or balance <= 0)
  const { data: walletsMap, isLoading: walletsLoading } = useQuery({
    queryKey: ['classStudentWallets', selectedClassId, students.length],
    queryFn: async () => {
      if (students.length === 0) return {};
      const promises = students.map((s: any) =>
        api
          .get(`/wallet/student/${s.id}`)
          .then((res) => ({ studentId: s.id, wallet: res.data.data }))
          .catch(() => ({ studentId: s.id, wallet: { balance: 0, remainingSessions: 0 } }))
      );
      const results = await Promise.all(promises);
      const map: Record<number, any> = {};
      results.forEach((r) => {
        map[r.studentId] = r.wallet;
      });
      return map;
    },
    enabled: students.length > 0,
  });

  // Initialize attendanceMap when students list changes
  useEffect(() => {
    if (students.length > 0) {
      const initialMap: Record<number, string> = {};
      students.forEach((s: any) => {
        initialMap[s.id] = 'Present'; // default to Present
      });
      setAttendanceMap(initialMap);
    } else {
      setAttendanceMap({});
    }
  }, [students]);

  // Mutation: Submit Bulk Attendance
  const submitAttendanceMutation = useMutation({
    mutationFn: (payload: { classId: number; date: string; students: { studentId: number; status: string }[] }) =>
      api.post('/attendance/bulk', payload),
    onSuccess: () => {
      message.success('Bulk attendance marked and tuition wallet transactions updated successfully!');
      // Invalidate queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ['classStudentWallets', selectedClassId] });
    },
    onError: (err: any) => {
      message.error(err.response?.data?.message || 'Failed to submit attendance');
    },
  });

  const handleClassChange = (value: number) => {
    setSelectedClassId(value);
    setSearchParams({ classId: String(value) });
  };

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSubmitAttendance = () => {
    if (!selectedClassId) {
      message.error('Please select a class first.');
      return;
    }

    const payloadStudents = Object.entries(attendanceMap).map(([studentId, status]) => ({
      studentId: Number(studentId),
      status,
    }));

    if (payloadStudents.length === 0) {
      message.warning('No students to mark attendance for.');
      return;
    }

    submitAttendanceMutation.mutate({
      classId: selectedClassId,
      date: attendanceDate.toISOString(),
      students: payloadStudents,
    });
  };

  const handleSetAll = (status: string) => {
    const newMap: Record<number, string> = {};
    students.forEach((s: any) => {
      newMap[s.id] = status;
    });
    setAttendanceMap(newMap);
  };

  if (teacherLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading classes..." />
      </div>
    );
  }

  const columns = [
    {
      title: 'Student Code',
      dataIndex: 'studentCode',
      key: 'studentCode',
      render: (code: string) => <Tag>{code}</Tag>,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Tuition Warning',
      key: 'walletStatus',
      render: (_: any, record: any) => {
        const wallet = walletsMap?.[record.id];
        if (walletsLoading) return <Spin size="small" />;
        if (!wallet) return <Tag color="gray">No wallet found</Tag>;

        const sessions = wallet.remainingSessions;
        const balance = wallet.balance;

        if (sessions <= 0) {
          return (
            <Badge status="error" text={
              <Space>
                <Tag color="red">0 Sessions</Tag>
                <Text type="danger" style={{ fontSize: 12 }}>
                  <ExclamationCircleOutlined /> No sessions/money left!
                </Text>
              </Space>
            } />
          );
        } else if (sessions < 3) {
          return (
            <Badge status="warning" text={
              <Space>
                <Tag color="orange">{sessions} Sessions left</Tag>
                <Text type="warning" style={{ fontSize: 12 }}>Low balance</Text>
              </Space>
            } />
          );
        }

        return (
          <Badge status="success" text={
            <Space>
              <Tag color="green">{sessions} Sessions</Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>({balance.toLocaleString()} VND)</Text>
            </Space>
          } />
        );
      },
    },
    {
      title: 'Attendance Status',
      key: 'attendanceStatus',
      render: (_: any, record: any) => (
        <Radio.Group
          value={attendanceMap[record.id]}
          onChange={(e) => handleStatusChange(record.id, e.target.value)}
          buttonStyle="solid"
          size="middle"
        >
          <Radio.Button value="Present" style={{ borderRadius: '6px 0 0 6px' }}>Present</Radio.Button>
          <Radio.Button value="Excused">Excused</Radio.Button>
          <Radio.Button value="Unexcused" style={{ borderRadius: '0 6px 6px 0' }}>Unexcused</Radio.Button>
        </Radio.Group>
      ),
    },
  ];

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 28 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>
          Mark Student Attendance
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Select a class and attendance date to record student presence and process tuition wallet deductions.
        </Text>
      </div>

      <Card style={{ borderRadius: 16, marginBottom: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={10}>
            <div style={{ marginBottom: 6 }}><Text strong>Select Class</Text></div>
            <Select
              placeholder="Select a class to teach..."
              style={{ width: '100%' }}
              value={selectedClassId}
              onChange={handleClassChange}
              size="large"
            >
              {classes.map((cls: any) => (
                <Option key={cls.id} value={cls.id}>
                  {cls.className} ({cls.classCode})
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={10}>
            <div style={{ marginBottom: 6 }}><Text strong>Attendance Date</Text></div>
            <DatePicker
              style={{ width: '100%' }}
              value={attendanceDate}
              onChange={(date) => date && setAttendanceDate(date)}
              size="large"
              format="YYYY-MM-DD"
              allowClear={false}
            />
          </Col>
        </Row>
      </Card>

      {selectedClassId ? (
        classDetailsLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" tip="Loading student list..." />
          </div>
        ) : (
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <Space>
                  <BookOutlined style={{ color: '#1890ff' }} />
                  <span>Student Roster: {classItem.className}</span>
                </Space>
                <Space>
                  <Button size="small" onClick={() => handleSetAll('Present')}>All Present</Button>
                  <Button size="small" onClick={() => handleSetAll('Excused')}>All Excused</Button>
                  <Button size="small" onClick={() => handleSetAll('Unexcused')}>All Unexcused</Button>
                </Space>
              </div>
            }
            style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
            bodyStyle={{ padding: 0 }}
          >
            {students.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Text type="secondary">No students enrolled in this class.</Text>
              </div>
            ) : (
              <div>
                <Table
                  dataSource={students}
                  columns={columns}
                  rowKey="id"
                  pagination={false}
                  size="middle"
                />
                <div style={{ padding: 24, textAlign: 'right', borderTop: '1px solid #f0f0f0' }}>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    size="large"
                    loading={submitAttendanceMutation.isPending}
                    onClick={handleSubmitAttendance}
                    style={{ borderRadius: 8, padding: '0 32px' }}
                  >
                    Submit Attendance Records
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )
      ) : (
        <Alert
          message="No Class Selected"
          description="Please select a class from the dropdown above to view the student list and record attendance."
          type="info"
          showIcon
          style={{ borderRadius: 12 }}
        />
      )}
    </div>
  );
};
