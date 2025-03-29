import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, Space, Card, Row, Col } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';

const { Option } = Select;

const MoodGenreCRUD = () => {
  const [moodGenres, setMoodGenres] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMoodGenre, setEditingMoodGenre] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await fetchMoods();
      await fetchMoodGenres();
    } catch (error) {
      console.error('Initial data loading error:', error);
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoods = async () => {
    try {
      const response = await api.get('/moods/');
      setMoods(response.data);
    } catch (error) {
      console.error('Error fetching moods:', error);
      throw error;
    }
  };

  const fetchMoodGenres = async () => {
    try {
      const response = await api.get('/mood-genres/');
      setMoodGenres(response.data);
    } catch (error) {
      console.error('Error fetching mood genres:', error);
      throw error;
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingMoodGenre(null);
    setIsModalVisible(true);
  };

  const showEditModal = (record) => {
    setEditingMoodGenre(record);
    setIsModalVisible(true);
    
    setTimeout(() => {
      form.setFieldsValue({
        mood: record.mood?.id || null,
        genres: record.genres || []
      });
    }, 0);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingMoodGenre(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const payload = {
        mood_id: values.mood,
        genres: values.genres
      };

      if (editingMoodGenre) {
        await api.put(`/mood-genres/${editingMoodGenre.id}/`, payload);
        toast.success('Mood genre updated successfully');
      } else {
        await api.post('/mood-genres/', payload);
        toast.success('Mood genre added successfully');
      }
      
      setIsModalVisible(false);
      await fetchMoodGenres();
    } catch (error) {
      console.error('Operation error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.detail || 
                         'Operation failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this mood genre?',
      content: 'This action cannot be undone',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          setLoading(true);
          await api.delete(`/mood-genres/${id}/`);
          toast.success('Mood genre deleted successfully');
          await fetchMoodGenres();
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete mood genre');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Mood',
      dataIndex: ['mood', 'name'],
      key: 'mood',
      sorter: (a, b) => a.mood.name.localeCompare(b.mood.name),
    },
    {
      title: 'Genres',
      dataIndex: 'genres',
      key: 'genres',
      render: genres => genres.join(', '),
      filters: [...new Set(moodGenres.flatMap(item => item.genres))].map(genre => ({
        text: genre,
        value: genre,
      })),
      onFilter: (value, record) => record.genres.includes(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
          />
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Card
        title="Mood Genres Management"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showAddModal}
            loading={loading}
          >
            <span className="responsive-text">Add Mood Genre</span>
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={moodGenres} 
          rowKey="id" 
          loading={loading}
          scroll={{ x: true }}
          size="middle"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
        />
      </Card>

      <Modal
        title={editingMoodGenre ? 'Edit Mood Genre' : 'Add New Mood Genre'}
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        width="90%"
        style={{ maxWidth: 800 }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="mood"
                label="Mood"
                rules={[{ required: true, message: 'Please select a mood!' }]}
              >
                <Select 
                  placeholder="Select a mood"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {moods.map(mood => (
                    <Option key={mood.id} value={mood.id}>
                      {mood.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="genres"
                label="Genres"
                rules={[{ 
                  required: true, 
                  message: 'Please input at least one genre!',
                  type: 'array',
                }]}
              >
                <Select 
                  mode="tags" 
                  placeholder="Enter genres (press enter to add)"
                  tokenSeparators={[',']}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default MoodGenreCRUD;