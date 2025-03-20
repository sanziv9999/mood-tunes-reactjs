import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, theme, Avatar } from 'antd';
import { UserContext } from '../context/user.context';
const { Header, Sider, Content } = Layout;

const CustomLayout = () => {
  const { _user } = useContext(UserContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated !== 'true') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogoutClick = () => {
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical">
          <img 
            src="https://www.virinchicollege.edu.np/storage/site/941680252040.png" 
            alt="logo" 
            style={{height: 90, padding: 25}} 
          />
        </div>
        
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
            justifyContent: 'space-between', // Added to space elements
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

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginRight: '24px' 
          }}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ marginRight: '8px' }} 
            />
            <span style={{ color: "#000000" }}>{_user?.email}</span>
          </div>
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