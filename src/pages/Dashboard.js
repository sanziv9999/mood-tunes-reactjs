import React, { useState, useEffect, useContext } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Space, 
  Button, 
  DatePicker, 
  Select, 
  Progress, 
  Avatar,
  List,
  Typography,
  Badge
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  UserOutlined, 
  SmileOutlined,
  CameraOutlined,
  FileTextOutlined,
  BarChartOutlined,
  PieChartOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { UserContext } from '../context/user.context';
import api from '../api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/css/Dashboard.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { _user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    total_moods: 0,
    total_images: 0,
    total_activity_suggestions: 0,
    total_relaxation_activities: 0,
    user_change_percent: 0,
    image_change_percent: 0
  });
  const [recentImages, setRecentImages] = useState([]);
  const [topMoods, setTopMoods] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange, dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsRes, imagesRes] = await Promise.all([
        api.get('/dashboard/stats?range=' + timeRange),
        api.get('/captured-images/?limit=5')
      ]);

      setStats({
        ...statsRes.data,
        total_activity_suggestions: statsRes.data.total_activity_suggestions || 0,
        total_relaxation_activities: statsRes.data.total_relaxation_activities || 0
      });

      setRecentImages(imagesRes.data);

      // Calculate top moods
      const moodCounts = {};
      imagesRes.data.forEach(image => {
        moodCounts[image.mood] = (moodCounts[image.mood] || 0) + 1;
      });
      const topMoodsData = Object.entries(moodCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setTopMoods(topMoodsData);

      // Create user activity
      const activityData = imagesRes.data.map(image => ({
        user: {
          username: image.user?.username || 'Anonymous',
          avatar: null
        },
        action: 'Image captured',
        mood: image.mood,
        timestamp: image.captured_at
      }));
      setUserActivity(activityData);

    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  // Data for mood distribution chart
  const moodDistributionData = topMoods.map(mood => ({
    mood: mood.name,
    count: mood.count,
    percent: stats.total_images > 0 ? (mood.count / stats.total_images) * 100 : 0
  }));

  // Columns for recent images table
  const imageColumns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <Avatar 
          shape="square" 
          size={64} 
          src={image} 
          icon={<CameraOutlined />}
        />
      ),
      responsive: ['md']
    },
    {
      title: 'Mood',
      dataIndex: 'mood',
      key: 'mood',
      render: (mood) => (
        <Badge 
          color={
            mood?.toLowerCase() === 'happy' ? 'green' : 
            mood?.toLowerCase() === 'sad' ? 'blue' : 
            'orange'
          } 
          text={mood}
        />
      )
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user?.username || 'Anonymous',
      responsive: ['lg']
    },
    {
      title: 'Date',
      dataIndex: 'captured_at',
      key: 'captured_at',
      render: (date) => new Date(date).toLocaleString(),
      responsive: ['xl']
    },
  ];

  return (
    <div className="dashboard-container">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <div className="dashboard-header">
        <Title level={3} className="dashboard-title">Dashboard Overview</Title>
        <Space className="dashboard-controls">
          <Select 
            defaultValue="week" 
            style={{ width: 120 }}
            onChange={handleTimeRangeChange}
          >
            <Option value="day">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
            <Option value="year">This Year</Option>
          </Select>
          <RangePicker 
            onChange={handleDateRangeChange}
            style={{ width: '100%', maxWidth: 250 }}
          />
        </Space>
      </div>

      {/* Stats Cards Row */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card loading={loading} className="dashboard-card">
            <Statistic
              title="Total Users"
              value={stats.total_users}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <Text type="secondary">
                  {stats.user_change_percent !== undefined && (
                    <>
                      {stats.user_change_percent > 0 ? (
                        <ArrowUpOutlined style={{ color: '#3f8600' }} />
                      ) : (
                        <ArrowDownOutlined style={{ color: '#cf1322' }} />
                      )}
                      {Math.abs(stats.user_change_percent)}%
                    </>
                  )}
                </Text>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card loading={loading} className="dashboard-card">
            <Statistic
              title="Total Moods"
              value={stats.total_moods}
              prefix={<SmileOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card loading={loading} className="dashboard-card">
            <Statistic
              title="Images Captured"
              value={stats.total_images}
              prefix={<CameraOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <Text type="secondary">
                  {stats.image_change_percent !== undefined && (
                    <>
                      {stats.image_change_percent > 0 ? (
                        <ArrowUpOutlined style={{ color: '#3f8600' }} />
                      ) : (
                        <ArrowDownOutlined style={{ color: '#cf1322' }} />
                      )}
                      {Math.abs(stats.image_change_percent)}%
                    </>
                  )}
                </Text>
              }
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card loading={loading} className="dashboard-card">
            <Statistic
              title="Activity Suggestions"
              value={stats.total_activity_suggestions}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card loading={loading} className="dashboard-card">
            <Statistic
              title="Relaxation Activities"
              value={stats.total_relaxation_activities}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} md={12} className="chart-col">
          <Card 
            title="Mood Distribution" 
            loading={loading}
            className="dashboard-card"
            extra={<PieChartOutlined />}
          >
            {moodDistributionData.map(mood => (
              <div key={mood.mood} className="mood-distribution-item">
                <Space>
                  <Text strong>{mood.mood}</Text>
                  <Text type="secondary">{mood.count} images</Text>
                </Space>
                <Progress 
                  percent={mood.percent.toFixed(1)} 
                  status="active" 
                  strokeColor={
                    mood.mood?.toLowerCase() === 'happy' ? '#52c41a' : 
                    mood.mood?.toLowerCase() === 'sad' ? '#1890ff' : 
                    '#faad14'
                  }
                />
              </div>
            ))}
          </Card>
        </Col>

        <Col xs={24} md={12} className="chart-col">
          <Card 
            title="Recent Activity" 
            loading={loading}
            className="dashboard-card"
            extra={<BarChartOutlined />}
          >
            <List
              itemLayout="horizontal"
              dataSource={userActivity}
              renderItem={item => (
                <List.Item className="activity-item">
                  <List.Item.Meta
                    avatar={<Avatar src={item.user.avatar} icon={<UserOutlined />} />}
                    title={<Text>{item.user.username}</Text>}
                    description={
                      <Space>
                        <Text type="secondary">{item.action}</Text>
                        {item.mood && (
                          <Badge 
                            color={
                              item.mood?.toLowerCase() === 'happy' ? 'green' : 
                              item.mood?.toLowerCase() === 'sad' ? 'blue' : 
                              'orange'
                            } 
                            text={item.mood}
                          />
                        )}
                      </Space>
                    }
                  />
                  <Text type="secondary">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row gutter={[16, 16]} className="tables-row">
        <Col xs={24} lg={12} className="table-col">
          <Card 
            title="Recent Captured Images" 
            loading={loading}
            className="dashboard-card"
            extra={
              <Button 
                type="link" 
                icon={<CameraOutlined />}
                onClick={() => window.location.href = '/admin/captured-images'}
              >
                View All
              </Button>
            }
          >
            <Table
              columns={imageColumns}
              dataSource={recentImages}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: true }}
              className="dashboard-table"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12} className="table-col">
          <Card 
            title="Top Moods" 
            loading={loading}
            className="dashboard-card"
            extra={<SmileOutlined />}
          >
            <List
              itemLayout="horizontal"
              dataSource={topMoods}
              renderItem={(mood, index) => (
                <List.Item className="mood-item">
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        style={{
                          backgroundColor: 
                            mood.name?.toLowerCase() === 'happy' ? '#52c41a' : 
                            mood.name?.toLowerCase() === 'sad' ? '#1890ff' : 
                            '#faad14'
                        }}
                      >
                        {index + 1}
                      </Avatar>
                    }
                    title={<Text strong>{mood.name}</Text>}
                    description={`${mood.count} detections (${stats.total_images > 0 ? ((mood.count / stats.total_images) * 100).toFixed(1) : 0}%)`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="quick-actions-row">
        <Col span={24}>
          <Card title="Quick Actions" className="dashboard-card">
            <Space wrap className="quick-actions">
              <Button 
                type="primary" 
                icon={<UserOutlined />}
                onClick={() => window.location.href = '/admin/users'}
              >
                Manage Users
              </Button>
              <Button 
                icon={<SmileOutlined />}
                onClick={() => window.location.href = '/admin/moods'}
              >
                Configure Moods
              </Button>
              <Button 
                icon={<FileTextOutlined />}
                onClick={() => window.location.href = '/admin/activity-suggestions'}
              >
                Activity Suggestions
              </Button>
              <Button 
                icon={<ClockCircleOutlined />}
                onClick={() => window.location.href = '/admin/relaxation-activities'}
              >
                Relaxation Activities
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;