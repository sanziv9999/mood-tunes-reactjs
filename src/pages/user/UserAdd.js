import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Select, Button, Card, message } from 'antd';
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const UserAdd = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = (values) => {
        axios.post('http://localhost:4000/users', values)
            .then((response) => {   
                console.log('User added successfully:', response.data);
                message.success('User added successfully');     
                navigate('/admin/users');
            })  
            .catch((error) => {
                console.error('Error adding user:', error);
                message.error('Error adding user');
            }); 
    };

    return (
        <Card 
            title={<h2 style={{ textAlign: 'center', margin: 0 }}>Add New User</h2>}
            style={{ 
                maxWidth: 800,
                margin: '24px auto',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[
                        { required: true, message: 'Please input user name!' },
                        { min: 3, message: 'Name must be at least 3 characters!' }
                    ]}
                >
                    <Input 
                        prefix={<UserOutlined />} 
                        placeholder="Enter name" 
                    />
                </Form.Item>

                <Form.Item
                    name="age"
                    label="Age"
                    rules={[
                        { required: true, message: 'Please input age!' },
                        { type: 'number', min: 18, max: 100, message: 'Age must be between 18 and 100!' }
                    ]}
                >
                    <InputNumber 
                        style={{ width: '100%' }}
                        placeholder="Enter age"
                        min={18}
                        max={100}
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Please input email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                >
                    <Input 
                        prefix={<MailOutlined />} 
                        placeholder="Enter email" 
                    />
                </Form.Item>

                <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true, message: 'Please select a role!' }]}
                >
                    <Select placeholder="Select role">
                        <Option value="admin">Admin</Option>
                        <Option value="user">User</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            style={{ flex: 1 }}
                        >
                            Add User
                        </Button>
                        <Button 
                            onClick={() => navigate('/admin/users')}
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default UserAdd;
