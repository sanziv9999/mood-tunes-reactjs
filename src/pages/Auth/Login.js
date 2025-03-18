import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, Card, message, App } from 'antd';

const Login = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    try {
      if (values.username === 'admin@gmail.com' && values.password === 'admin') {
        message.success({
          content: 'Login successful',
          duration: 2,
          style: {
            marginTop: '20vh',
          },
        });
        localStorage.setItem('isAuthenticated', 'true');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1000);
      } else {
        message.error({
          content: 'Invalid username or password',
          duration: 3,
          style: {
            marginTop: '20vh',
          },
        });
        localStorage.setItem('isAuthenticated', 'false');
      }
    } catch (error) {
      message.error({
        content: 'An error occurred',
        duration: 3,
        style: {
          marginTop: '20vh',
        },
      });
    }
  };

  return (
    <App> {/* Wrap with App component for message context */}
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Card 
          title={<h2 style={{ textAlign: 'center', margin: 0 }}>Login</h2>}
          style={{ 
            width: 400,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px'
          }}
        >
          <Form
            name="login"
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: 'Please input your email!',
                },
                {
                  type: 'email',
                  message: 'Please enter a valid email!',
                },
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please input your Password!',
                },
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Password"
              />
            </Form.Item>

            <Form.Item>
              <Flex justify="space-between" align="center">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox>Remember me</Checkbox>
                </Form.Item>
                <a href="#forgot" style={{ color: '#1890ff' }}>
                  Forgot password
                </a>
              </Flex>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block
                style={{
                  height: '40px',
                  fontSize: '16px'
                }}
              >
                Log in
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </App>
  );
};

export default Login;
