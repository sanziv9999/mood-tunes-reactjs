import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button, Space, Table, Typography, Modal, Form, Input } from 'antd';
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, KeyOutlined } from '@ant-design/icons';
import { deleteUserById, fetchUsers, updateUserPassword } from '../../utils/user.util';

const { Title } = Typography;

const Users = ({ title = 'Users' }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal visibility
  const [modalType, setModalType] = useState(null); // 'delete' or 'password'
  const [selectedUserId, setSelectedUserId] = useState(null); // ID of the user being acted upon
  const [form] = Form.useForm(); // Form instance for password change

  const handleAddUser = () => {
    navigate('/admin/users/create');
  };

  useEffect(() => {
    fetchUsers().then((users) => setData(users));
  }, []);

  const handleEdit = (id) => {
    navigate(`/admin/user/details/${id}`);
  };

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setModalType('delete');
    setIsModalVisible(true);
  };

  const handlePasswordChange = (id) => {
    setSelectedUserId(id);
    setModalType('password');
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (modalType === 'delete') {
      try {
        setLoading(true);
        await deleteUserById(selectedUserId);
        setData(data.filter((item) => item.id !== selectedUserId));
        setIsModalVisible(false);
        Modal.success({
          title: 'Success',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          content: 'User deleted successfully',
        });
      } catch (err) {
        setIsModalVisible(false);
        Modal.error({
          title: 'Error',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          content: err.message || 'Error deleting user',
        });
      } finally {
        setLoading(false);
      }
    } else if (modalType === 'password') {
      try {
        const values = await form.validateFields();
        setLoading(true);
        await updateUserPassword(selectedUserId, values.password);
        setIsModalVisible(false);
        Modal.success({
          title: 'Success',
          icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
          content: 'Password changed successfully',
        });
      } catch (err) {
        setIsModalVisible(false);
        Modal.error({
          title: 'Error',
          icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
          content: err.message || 'Error changing password',
        });
      } finally {
        setLoading(false);
        form.resetFields(); // Reset form fields after submission
      }
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    if (modalType === 'password') {
      form.resetFields(); // Reset form fields on cancel
    }
    Modal.info({
      title: 'Cancelled',
      content: modalType === 'delete' ? 'Deletion canceled' : 'Password change canceled',
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_, item) => <NavLink to={`/admin/user/details/${item.id}`}>{item.name}</NavLink>,
      width: '25%',
      ellipsis: true,
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: '15%',
      responsive: ['md'],
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '30%',
      ellipsis: true,
      responsive: ['sm'],
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '15%',
      ellipsis: true,
      responsive: ['md'],
    },
    {
      title: 'Action',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Space size="middle" wrap>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record.id)}
            loading={loading}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
            loading={loading}
          />
          <Button
            type="default" // Changed from 'warning' (not a valid type) to 'default'
            icon={<KeyOutlined />}
            size="small"
            onClick={() => handlePasswordChange(record.id)}
            loading={loading}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space
          style={{
            width: '100%',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            {title}
          </Title>
          <Button type="primary" onClick={handleAddUser} loading={loading}>
            Add User
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: 10,
            responsive: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          loading={loading}
          style={{ width: '100%' }}
          size="middle"
        />

        {/* Custom Modal for Delete or Password Change */}
        <Modal
          title={modalType === 'delete' ? 'Are you sure?' : 'Change Password'}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText={modalType === 'delete' ? 'Yes, Delete' : 'Change Password'}
          okButtonProps={{
            danger: modalType === 'delete', // Red for delete, default for password
            loading: loading,
          }}
          cancelText="Cancel"
          icon={modalType === 'delete' ? <ExclamationCircleOutlined /> : <KeyOutlined />}
        >
          {modalType === 'delete' ? (
            <p>Do you really want to delete this user? This action cannot be undone.</p>
          ) : (
            <Form form={form} layout="vertical">
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter a new password' },
                  { min: 6, message: 'Password must be at least 6 characters' },
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
            </Form>
          )}
        </Modal>
      </Space>
    </div>
  );
};

export default Users;