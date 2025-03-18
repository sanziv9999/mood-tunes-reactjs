import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';

const { Header, Sider, Content } = Layout;

const CustomLayout = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const isLogin = localStorage.getItem('isAuthenticated');
    if (!isLogin) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogoutClick = () => {
    localStorage.setItem('isAuthenticated', 'false');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <UserOutlined />,
              label: 'Users',
              onClick: () => navigate('/admin/users'),
            },
            {
              key: '2',
              icon: <VideoCameraOutlined />,
              label: 'Dashboard',
              onClick: () => navigate('/admin/dashboard'),
            },
            {
              key: '3',
              icon: <UploadOutlined />,
              label: 'Settings',
              onClick: () => navigate('/admin/settings'),
            },
            {
              key: '4',
              icon: <UploadOutlined />,
              label: 'Logout',
              onClick: handleLogoutClick,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
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
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)', // 64px header + 24px margin top + 24px margin bottom
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