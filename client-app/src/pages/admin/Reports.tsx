import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Button, Row, Col, Typography, Space, Spin, Alert, message, Divider } from 'antd';
import { FileExcelOutlined, FilePdfOutlined, AreaChartOutlined } from '@ant-design/icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import api from '../../services/api';

const { Title, Text } = Typography;

export const Reports: React.FC = () => {
  // Query Monthly Revenue
  const { data: revenueRes, isLoading: revenueLoading, error: revenueErr } = useQuery({
    queryKey: ['adminRevenue'],
    queryFn: () => api.get('/reports/revenue-monthly').then((res) => res.data),
  });

  const handleExportExcel = async () => {
    try {
      message.loading({ content: 'Generating Excel report...', key: 'exportExcel' });
      const response = await api.get('/report-exports/tuition.xlsx', { responseType: 'blob' });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tuition-report-${new Date().toISOString().slice(0,10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success({ content: 'Excel report downloaded!', key: 'exportExcel' });
    } catch (err) {
      console.error(err);
      message.error({ content: 'Failed to export Excel report', key: 'exportExcel' });
    }
  };

  const handleExportPdf = async () => {
    try {
      message.loading({ content: 'Generating PDF report...', key: 'exportPdf' });
      const response = await api.get('/report-exports/summary.pdf', { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `summary-report-${new Date().toISOString().slice(0,10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success({ content: 'PDF report downloaded!', key: 'exportPdf' });
    } catch (err) {
      console.error(err);
      message.error({ content: 'Failed to export PDF report', key: 'exportPdf' });
    }
  };

  if (revenueLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading reports and analytics data..." />
      </div>
    );
  }

  if (revenueErr) {
    return (
      <Alert
        message="Error"
        description="Could not load reports revenue data."
        type="error"
        showIcon
      />
    );
  }

  const revenueData = revenueRes?.data || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, fontWeight: 700 }}>
          System Reports & Exports
        </Title>
        <Text type="secondary">Download official database summaries in spreadsheet or PDF formats.</Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Export Cards */}
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <FileExcelOutlined style={{ color: '#52c41a' }} />
                <span>Financial Tuition Spreadsheet</span>
              </Space>
            }
            style={{ borderRadius: 8 }}
          >
            <p>Export a detailed Excel spreadsheet containing all historical student tuition payment records, payment dates, due dates, statuses, and payment methods.</p>
            <Divider style={{ margin: '16px 0' }} />
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={handleExportExcel}
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Export Tuition Excel (xlsx)
            </Button>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={
              <Space>
                <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                <span>System Executive Summary PDF</span>
              </Space>
            }
            style={{ borderRadius: 8 }}
          >
            <p>Generate a professional executive summary PDF report containing aggregate stats: total active students, instructors, classes, and monthly tuition revenue collection summary.</p>
            <Divider style={{ margin: '16px 0' }} />
            <Button
              type="primary"
              danger
              icon={<FilePdfOutlined />}
              onClick={handleExportPdf}
            >
              Export Executive PDF
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Analytics Visualization */}
      <Card
        title={
          <Space>
            <AreaChartOutlined style={{ color: '#1890ff' }} />
            <span>Monthly Revenue Trend Chart</span>
          </Space>
        }
        style={{ marginTop: 24, borderRadius: 8 }}
      >
        <div style={{ width: '100%', height: 350 }}>
          {revenueData.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 120 }}>
              <Text type="secondary">No revenue data available for rendering.</Text>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorReportRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f54eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2f54eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="monthName" />
                <YAxis tickFormatter={(val) => `${val / 1000000}M`} />
                <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} VND`, 'Revenue']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2f54eb" 
                  fillOpacity={1} 
                  fill="url(#colorReportRevenue)" 
                  name="Monthly Revenue collection"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
};
