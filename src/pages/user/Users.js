import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Space, Table, Typography, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Users = ({ title = 'Users' }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAddUser = () => {
    navigate('/admin/users/create');
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/users');
      setData(response.data.map(item => ({ ...item, key: item.id }))); 
    } catch (error) {
      console.error('Error fetching data: ', error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (id) => {
    navigate(`/admin/user/details/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`http://localhost:4000/users/${id}`);
      if (response.status === 200 || response.status === 204) {
        message.success('User deleted successfully');
        await fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      message.error(`Failed to delete user: ${error.message}`);
    } finally {
      setLoading(false);
    }
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
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space
        direction="vertical"
        size="middle"
        style={{ width: '100%' }}
      >
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
          <Button
            type="primary"
            onClick={handleAddUser}
            loading={loading}
          >
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
      </Space>
    </div>
  );
};

export default Users;