import React, { useState, useEffect } from 'react';
import { Tabs, Table, Button, Modal, Form, Select, Space, Card, Row, Col } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';

// Toast notification helpers
const setSuccessMessage = (message) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};

const setErrorMessage = (message) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};



const { TabPane } = Tabs;
const { Option } = Select;

const SuggestionCRUD = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [activities, setActivities] = useState([]);
  const [relaxations, setRelaxations] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchMoods(), fetchActivities(), fetchRelaxations()]);
    } catch (error) {
      setErrorMessage('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoods = async () => {
    try {
      const response = await api.get('/moods/');
      console.log('Fetched moods:', response.data);
      setMoods(response.data);
    } catch (error) {
      console.error('Error fetching moods:', error);
      throw error;
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activity-suggestions/');
      console.log('Fetched activities:', response.data);
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  };

  const fetchRelaxations = async () => {
    try {
      const response = await api.get('/relaxation-activities/');
      console.log('Fetched relaxations:', response.data);
      setRelaxations(response.data);
    } catch (error) {
      console.error('Error fetching relaxations:', error);
      throw error;
    }
  };

  const fetchActivityById = async (id) => {
    setModalLoading(true);
    try {
      const response = await api.get(`/activity-suggestions/${id}/`);
      console.log(`Fetched activity with ID ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching activity with ID ${id}:`, error);
      setErrorMessage('Failed to fetch activity data');
      return null;
    } finally {
      setModalLoading(false);
    }
  };

  const fetchRelaxationById = async (id) => {
    setModalLoading(true);
    try {
      const response = await api.get(`/relaxation-activities/${id}/`);
      console.log(`Fetched relaxation with ID ${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching relaxation with ID ${id}:`, error);
      setErrorMessage('Failed to fetch relaxation data');
      return null;
    } finally {
      setModalLoading(false);
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setEditingRecord(null);
    setIsModalVisible(true);
  };

  const showEditModal = async (record) => {
    const fetchFunction = activeTab === 'activities' ? fetchActivityById : fetchRelaxationById;
    const data = await fetchFunction(record.id);
    if (!data) {
      setErrorMessage('Failed to load record data for editing');
      return;
    }

    setEditingRecord(data);
    setIsModalVisible(true);

    setTimeout(() => {
      form.setFieldsValue({
        mood: data.mood?.id || null,
        suggestion: data.suggestion || [],
        activity: data.activity || [],
      });
    }, 0);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingRecord(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const payload = {
        mood_id: values.mood,
        [activeTab === 'activities' ? 'suggestion' : 'activity']: 
          activeTab === 'activities' ? values.suggestion : values.activity,
      };

      if (editingRecord) {
        await api.put(
          `/${activeTab === 'activities' ? 'activity-suggestions' : 'relaxation-activities'}/${editingRecord.id}/`, 
          payload
        );
        setSuccessMessage('Record updated successfully');
      } else {
        await api.post(
          `/${activeTab === 'activities' ? 'activity-suggestions' : 'relaxation-activities'}/`, 
          payload
        );
        setSuccessMessage('Record added successfully');
      }
      
      setIsModalVisible(false);
      activeTab === 'activities' ? fetchActivities() : fetchRelaxations();
    } catch (error) {
      console.error('Operation error:', error);
      const errorMessage = error.response?.data?.detail || 'Operation failed';
      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this record?',
      content: 'This action cannot be undone',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          setLoading(true);
          await api.delete(
            `/${activeTab === 'activities' ? 'activity-suggestions' : 'relaxation-activities'}/${id}/`
          );
          setSuccessMessage('Record deleted successfully');
          activeTab === 'activities' ? fetchActivities() : fetchRelaxations();
        } catch (error) {
          console.error('Delete error:', error);
          setErrorMessage('Failed to delete record');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const activityColumns = [
    {
      title: 'Mood',
      dataIndex: ['mood', 'name'],
      key: 'mood',
      sorter: (a, b) => a.mood.name.localeCompare(b.mood.name),
    },
    {
      title: 'Suggestion',
      dataIndex: 'suggestion',
      key: 'suggestion',
      render: (suggestion) => (Array.isArray(suggestion) ? suggestion.join(', ') : suggestion),
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            disabled={loading}
          />
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            disabled={loading}
          />
        </Space>
      ),
    },
  ];

  const relaxationColumns = [
    {
      title: 'Mood',
      dataIndex: ['mood', 'name'],
      key: 'mood',
      sorter: (a, b) => a.mood.name.localeCompare(b.mood.name),
    },
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      render: (activity) => (Array.isArray(activity) ? activity.join(', ') : activity),
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => showEditModal(record)}
            disabled={loading}
          />
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            disabled={loading}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
              loading={loading}
              disabled={loading}
            >
              Add {activeTab === 'activities' ? 'Activity' : 'Relaxation'}
            </Button>
          }
        >
          <TabPane tab="Activity Suggestions" key="activities">
            <Table 
              columns={activityColumns} 
              dataSource={activities} 
              rowKey="id" 
              loading={loading}
              scroll={{ x: true }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </TabPane>
          <TabPane tab="Relaxation Activities" key="relaxations">
            <Table 
              columns={relaxationColumns} 
              dataSource={relaxations} 
              rowKey="id" 
              loading={loading}
              scroll={{ x: true }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingRecord ? 
          `Edit ${activeTab === 'activities' ? 'Activity Suggestion' : 'Relaxation Activity'}` : 
          `Add New ${activeTab === 'activities' ? 'Activity Suggestion' : 'Relaxation Activity'}`
        }
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={600}
        destroyOnClose
        afterOpenChange={(open) => {
          if (open) {
            console.log('Form values after open:', form.getFieldsValue());
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
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
                  loading={modalLoading}
                  disabled={modalLoading}
                >
                  {moods.map(mood => (
                    <Option key={mood.id} value={mood.id}>
                      {mood.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name={activeTab === 'activities' ? 'suggestion' : 'activity'}
                label={activeTab === 'activities' ? 'Activity Suggestion' : 'Relaxation Activity'}
                rules={[{ 
                  required: true, 
                  message: `Please input at least one ${activeTab === 'activities' ? 'suggestion' : 'activity'}!`,
                  type: 'array',
                  min: 1,
                }]}
              >
                <Select 
                  mode="tags" 
                  placeholder={`Enter ${activeTab === 'activities' ? 'activity suggestions' : 'relaxation activities'} (press enter to add)`}
                  tokenSeparators={[',']}
                  allowClear
                  showArrow
                  disabled={modalLoading}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default SuggestionCRUD;