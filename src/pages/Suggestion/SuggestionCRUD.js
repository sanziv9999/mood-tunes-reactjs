import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Space, Card, Row, Col } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const SuggestionCRUD = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get('/api/suggestions/');
      setSuggestions(response.data);
    } catch (error) {
      toast.error('Failed to fetch suggestions');
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingSuggestion(null);
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    form.setFieldsValue(record);
    setEditingSuggestion(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingSuggestion) {
        await axios.put(`/api/suggestions/${editingSuggestion.mood}/`, values);
        toast.success('Suggestion updated successfully');
      } else {
        await axios.post('/api/suggestions/', values);
        toast.success('Suggestion added successfully');
      }
      
      setIsModalVisible(false);
      fetchSuggestions();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (mood) => {
    try {
      await axios.delete(`/api/suggestions/${mood}/`);
      toast.success('Suggestion deleted successfully');
      fetchSuggestions();
    } catch (error) {
      toast.error('Failed to delete suggestion');
    }
  };

  const columns = [
    {
      title: 'Mood',
      dataIndex: 'mood',
      key: 'mood',
    },
    {
      title: 'Music',
      dataIndex: 'music',
      key: 'music',
    },
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
    },
    {
      title: 'Relaxation',
      dataIndex: 'relaxation',
      key: 'relaxation',
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
          />
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.mood)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Suggestions Management"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
          >
            Add Suggestion
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={suggestions} 
          rowKey="mood" 
          scroll={{ x: true }}
        />
      </Card>

      <Modal
        title={editingSuggestion ? 'Edit Suggestion' : 'Add New Suggestion'}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mood"
                label="Mood"
                rules={[{ required: true, message: 'Please input the mood!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="music"
                label="Music"
                rules={[{ required: true, message: 'Please input the music!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="activity"
                label="Activity"
                rules={[{ required: true, message: 'Please input the activity!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="relaxation"
                label="Relaxation"
                rules={[{ required: true, message: 'Please input the relaxation!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SuggestionCRUD;