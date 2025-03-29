import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  FileTextOutlined,
  CameraOutlined,
  SmileOutlined,
  SoundOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar, Badge, Dropdown, Space, Typography, Divider } from 'antd';
import { UserContext } from '../context/user.context';
import { setSuccessMessage, setErrorMessage } from '../utils/toastify.util';
import '../assets/css/CustomLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const CustomLayout = () => {
  const { _user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [selectedKeys, setSelectedKeys] = useState(['1']);
  const {
    token: { colorBgContainer, borderRadiusLG, colorPrimary },
  } = theme.useToken();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      navigate('/login');
    }
    
    // Update selected menu item based on current route
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) {
      setSelectedKeys(['2']);
    } else if (path.includes('/admin/settings')) {
      setSelectedKeys(['3']);
    } else if (path.includes('/admin/users')) {
      setSelectedKeys(['1']);
    } else if (path.includes('/admin/suggestions')) {
      setSelectedKeys(['5']);
    } else if (path.includes('/admin/moods')) {
      setSelectedKeys(['6']);
    } else if (path.includes('/admin/mood-genres')) {
      setSelectedKeys(['7']);
    } else if (path.includes('/admin/captured-images')) {
      setSelectedKeys(['8']);
    }
  }, [navigate, location]);

  const handleLogoutClick = () => {
    try {
      localStorage.setItem('isAuthenticated', 'false');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setSuccessMessage('Logged out successfully');
      navigate('/login', { replace: true }); // Navigate to login with replace
      setTimeout(() => window.location.reload(), 100); // Reload after navigation
    } catch (error) {
      setErrorMessage('Failed to logout. Please try again.');
      console.error('Logout error:', error);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogoutClick,
    },
  ];

  const menuItems = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: 'User Management',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: '2',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      key: '5',
      icon: <FileTextOutlined />,
      label: 'Suggestions',
      onClick: () => navigate('/admin/suggestions'),
    },
    {
      key: '6',
      icon: <SmileOutlined />,
      label: 'Moods',
      onClick: () => navigate('/admin/moods'),
    },
    {
      key: '7',
      icon: <SoundOutlined />,
      label: 'Mood Genres',
      onClick: () => navigate('/admin/mood-genres'),
    },
    {
      key: '8',
      icon: <CameraOutlined />,
      label: 'Captured Images',
      onClick: () => navigate('/admin/captured-images'),
    },
    {
      key: '3',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/admin/settings'),
    },
    {
      key: '4',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogoutClick,
      danger: true,
    },
  ];

  const notificationItems = [
    {
      key: '1',
      label: (
        <div style={{ minWidth: 300 }}>
          <Text strong>New user registered</Text>
          <Text type="secondary" style={{ display: 'block' }}>5 minutes ago</Text>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div style={{ minWidth: 300 }}>
          <Text strong>System update available</Text>
          <Text type="secondary" style={{ display: 'block' }}>2 hours ago</Text>
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div style={{ minWidth: 300 }}>
          <Text strong>New mood detected</Text>
          <Text type="secondary" style={{ display: 'block' }}>Yesterday</Text>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: '4',
      label: 'View all notifications',
      style: { textAlign: 'center' },
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={250}
        breakpoint="lg"
        onBreakpoint={(broken) => {
          if (broken) setCollapsed(true);
        }}
      >
        <div className="demo-logo-vertical" style={{ padding: collapsed ? '16px' : '24px' }}>
          <img 
            src="https://www.virinchicollege.edu.np/storage/site/941680252040.png" 
            alt="logo" 
            style={{
              height: collapsed ? 50 : 90,
              transition: 'all 0.2s',
              objectFit: 'contain',
              width: '100%'
            }} 
          />
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ padding: '8px 0' }}
        />

        {!collapsed && (
          <div className="sidebar-footer" style={{ 
            padding: '16px',
            color: 'rgba(255, 255, 255, 0.65)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'absolute',
            bottom: 0,
            width: '100%'
          }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary" style={{ display: 'block' }}>
                Need help? <a href="/help"><QuestionCircleOutlined /> Contact support</a>
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                v{process.env.REACT_APP_VERSION || '1.0.0'}
              </Text>
            </Space>
          </div>
        )}
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          }}
        >
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            <Text strong style={{ fontSize: 18 }}>
              {menuItems.find(item => item.key === selectedKeys[0])?.label || 'Dashboard'}
            </Text>
          </Space>

          <Space size="middle">
            <Dropdown 
              menu={{ items: notificationItems }} 
              placement="bottomRight"
              trigger={['click']}
              overlayStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
              <Badge count={notificationsCount} overflowCount={9}>
                <Button 
                  type="text" 
                  shape="circle"
                  icon={<Badge dot={notificationsCount > 0} />}
                  style={{ fontSize: 16 }}
                />
              </Badge>
            </Dropdown>

            <Divider type="vertical" style={{ height: 24 }} />

            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  style={{ 
                    backgroundColor: colorPrimary,
                    verticalAlign: 'middle' 
                  }} 
                />
                {!collapsed && (
                  <Text strong style={{ marginLeft: 8 }}>
                    {_user?.name || _user?.email || 'Admin'}
                  </Text>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)',
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default CustomLayout;