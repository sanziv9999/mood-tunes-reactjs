import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Flex, Card, App } from 'antd';
import { checkLogin } from '../../utils/user.util';
import { UserContext } from '../../context/user.context';
import { setErrorMessage, setSuccessMessage } from '../../utils/toastify.util';

const Login = () => {
  const navigate = useNavigate();
  const { _setUser } = useContext(UserContext);

  const onFinish = async (values) => {
    try {
      console.log('Attempting login with:', values);
      const result = await checkLogin(values.username, values.password);
      console.log('Login result:', result);
  
      // Successful login
      _setUser(result);
      localStorage.setItem('user', JSON.stringify(result));
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', result.token); 
      setSuccessMessage('Login successful! Redirecting...');
  
      setTimeout(() => {
        navigate(result.is_superuser ? '/admin/dashboard' : '/dashboard');
      }, 1000);
  
    } catch (error) {
      console.error('Login error:', error);
      localStorage.setItem('isAuthenticated', 'false');
      
      // Handle specific error messages
      if (error.message.includes('invalid credentials')) {
        setErrorMessage('Invalid username or password');
      } else if (error.message.includes('missing credentials')) {
        setErrorMessage('Please enter both username and password');
      } else if (error.message.includes('admin_only')) {
        setErrorMessage('Only admin users can login here');
      } else if (error.message.includes('no_response') || error.message.includes('network error')) {
        setErrorMessage('Server is not responding. Please try again later.');
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
  
      localStorage.setItem('isAuthenticated', 'false');
    }
  };

  return (
    <App>
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#f0f2f5',
        }}
      >
        <Card
          title={<h2 style={{ textAlign: 'center', margin: 0 }}>Admin Login</h2>}
          style={{
            width: 400,
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            borderRadius: '8px',
          }}
        >
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
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
                style={{ height: '40px', fontSize: '16px' }}
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