import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Card } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';

const MoodCRUD = () => {
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMood, setEditingMood] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    setLoading(true);
    try {
      const response = await api.get('/moods/');
      setMoods(response.data);
    } catch (error) {
      console.error('Error fetching moods:', error);
      toast.error('Failed to fetch moods');
      if (error.response?.status === 401) {
        toast.error('Please login again');
      }
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingMood(null);
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    form.setFieldsValue(record);
    setEditingMood(record);
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (editingMood) {
        await api.put(`/moods/${editingMood.name}/`, values);
        toast.success('Mood updated successfully');
      } else {
        await api.post('/moods/', values);
        toast.success('Mood added successfully');
      }
      
      setIsModalVisible(false);
      fetchMoods();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (name) => {
    Modal.confirm({
      title: 'Are you sure?',
      content: 'Do you want to delete this mood?',
      async onOk() {
        try {
          setLoading(true);
          await api.delete(`/moods/${name}/`);
          toast.success('Mood deleted successfully');
          fetchMoods();
        } catch (error) {
          toast.error('Failed to delete mood');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingMood(null);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
          >
            <span className="responsive-text">Edit</span>
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.name)}
          >
            <span className="responsive-text">Delete</span>
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Card
        title="Moods Management"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            disabled={loading}
          >
            <span className="responsive-text">Add Mood</span>
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={moods}
          rowKey="name"
          scroll={{ x: true }}
          loading={loading}
          size="middle"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>

      <Modal
        title={editingMood ? 'Edit Mood' : 'Add New Mood'}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        okText={editingMood ? 'Update' : 'Create'}
        cancelButtonProps={{ disabled: loading }}
        width="90%"
        style={{ maxWidth: 500 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Mood Name"
            rules={[
              { required: true, message: 'Please input the mood name!' },
              { max: 50, message: 'Mood name must be less than 50 characters' },
              { 
                pattern: /^[a-zA-Z0-9_-]+$/,
                message: 'Only alphanumeric characters, underscores, and hyphens allowed'
              },
            ]}
          >
            <Input 
              disabled={loading} 
              placeholder="Enter mood name" 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MoodCRUD;