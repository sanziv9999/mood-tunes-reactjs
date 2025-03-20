import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { Card, Form, Input, InputNumber, Select, Button, Spin, Alert, Typography } from 'antd';
import { fetchUserById } from "../../utils/user.util";

const { Title } = Typography;
const { Option } = Select;

const UserDetails = () => {
  let { userId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      fetchUserById(userId).then((user) => { 
        form.setFieldsValue(user);
        setLoading(false);  
      }
      );
    };

    fetchUser();
  }, [userId, form]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await axios.put(`http://localhost:4000/users/${userId}`, values);
      setEditing(false);
      setError(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
    // Refetch original data
    axios.get(`http://localhost:4000/users/${userId}`)
      .then(response => form.setFieldsValue(response.data));
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ marginBottom: 24 }}>
        User Details
      </Title>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      <Card
        bordered
        style={{ maxWidth: 600, margin: '0 auto' }}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            disabled={!editing}
          >
            <Form.Item
              name="name"
              label="Full Name"
              rules={[{ required: true, message: 'Please enter full name' }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="age"
              label="Age"
              rules={[{ required: true, message: 'Please enter age' }]}
            >
              <InputNumber 
                min={0} 
                max={150} 
                style={{ width: '100%' }} 
                placeholder="Enter age"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select a role">
                <Option value="admin">Admin</Option>
                <Option value="user">User</Option>
                <Option value="guest">Guest</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              {editing ? (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <Button onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Save
                  </Button>
                </div>
              ) : (
                <Button type="primary" onClick={handleEdit} disabled={loading}>
                  Edit
                </Button>
              )}
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default UserDetails;