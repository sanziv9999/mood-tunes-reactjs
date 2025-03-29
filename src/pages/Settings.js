import React, { useState, useEffect } from 'react';
import { Card, Avatar, Descriptions, Button, Form, Input, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';

const Settings = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserData(parsedUser);
      form.setFieldsValue({
        username: parsedUser.username,
        email: parsedUser.email
      });
    }
  }, [form]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      // Update user data in localStorage
      const updatedUser = { ...userData, ...values };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      message.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card
        title="User Profile"
        bordered={false}
        extra={
          isEditing ? (
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
              Save
            </Button>
          ) : (
            <Button icon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
          )
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff', marginRight: '16px' }}
          />
          <div>
            <h2 style={{ marginBottom: 0 }}>{userData.username}</h2>
            <p style={{ color: '#666', marginBottom: 0 }}>
              {userData.is_superuser ? 'Administrator' : 'Standard User'}
            </p>
          </div>
        </div>

        {isEditing ? (
          <Form form={form} layout="vertical">
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input prefix={<MailOutlined />} />
            </Form.Item>
          </Form>
        ) : (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="User ID">{userData.id}</Descriptions.Item>
            <Descriptions.Item label="Username">{userData.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
            <Descriptions.Item label="Account Type">
              {userData.is_superuser ? 'Administrator' : 'Standard User'}
            </Descriptions.Item>
            <Descriptions.Item label="Authentication Token">
              <span style={{ fontFamily: 'monospace' }}>
                {userData.token.substring(0, 12)}...
              </span>
            </Descriptions.Item>
          </Descriptions>
        )}

        <div style={{ marginTop: '24px' }}>
          <Button type="primary" icon={<LockOutlined />}>
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;