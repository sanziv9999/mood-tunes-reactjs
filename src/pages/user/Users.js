import React, { useEffect, useState } from 'react';
import { Button, Space, Table, Typography, Modal, Form, Input, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteUserById, fetchUsers, updateUser } from '../../utils/user.util';

const { Title } = Typography;

const Users = ({ title = 'Users' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'delete' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const users = await fetchUsers();
        setData(users);
      } catch (error) {
        message.error('Error fetching users');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalType('edit');
    form.setFieldsValue({
      email: user.email,
      username: user.username,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setSelectedUser({ id });
    setModalType('delete');
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      if (modalType === 'delete') {
        await deleteUserById(selectedUser.id);
        setData(data.filter((item) => item.id !== selectedUser.id));
        message.success('User deleted successfully');
      } else if (modalType === 'edit') {
        const values = await form.validateFields();
        await updateUser(selectedUser.id, values);
        setData(data.map(user => 
          user.id === selectedUser.id ? { ...user, ...values } : user
        ));
        message.success('User updated successfully');
      }
      setIsModalVisible(false);
    } catch (err) {
      message.error(err.message || `Error ${modalType === 'delete' ? 'deleting' : 'updating'} user`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: '30%',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '40%',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '30%',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            loading={loading}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
            loading={loading}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={2} style={{ margin: 0 }}>
          {title}
        </Title>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          loading={loading}
          style={{ width: '100%' }}
          size="middle"
        />

        <Modal
          title={modalType === 'delete' ? 'Confirm Deletion' : 'Edit User'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={modalType === 'delete' ? 'Delete' : 'Update'}
          okButtonProps={{
            danger: modalType === 'delete',
            loading: loading,
          }}
          cancelText="Cancel"
          destroyOnClose
        >
          {modalType === 'delete' ? (
            <p>Are you sure you want to delete this user? This action cannot be undone.</p>
          ) : (
            <Form form={form} layout="vertical">
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter the email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please enter the username' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Form>
          )}
        </Modal>
      </Space>
    </div>
  );
};

export default Users;