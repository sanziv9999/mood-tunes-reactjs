import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Upload, Space, Card, Image, Select, message } from 'antd';
import { DeleteOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';

const { Option } = Select;

const CapturedImageCRUD = () => {
  const [images, setImages] = useState([]);
  const [moods, setMoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMoods();
    fetchImages();
  }, []);

  const fetchMoods = async () => {
    try {
      const response = await api.get('/moods/');
      setMoods(response.data);
    } catch (error) {
      console.error('Error fetching moods:', error);
      toast.error('Failed to fetch available moods');
    }
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/captured-images/');
      const processedImages = response.data.map(image => ({
        ...image,
        image_url: image.image.startsWith('http') ? image.image : `${api.defaults.baseURL}${image.image}`
      }));
      setImages(processedImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const showEditModal = (record) => {
    form.setFieldsValue({
      mood: record.mood
    });
    setEditingImage(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingImage(null);
    setFileList([]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const formData = new FormData();
      formData.append('mood', values.mood);
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      } else {
        formData.append('image', '');
      }
      
      const response = await api.patch(
        `/captured-images/${editingImage.id}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Token ${localStorage.getItem('token')}`,
          },
        }
      );
      
      const updatedImages = images.map(img =>
        img.id === editingImage.id
          ? {
              ...response.data,
              image_url: response.data.image 
                ? response.data.image.startsWith('http') 
                  ? response.data.image 
                  : `${api.defaults.baseURL}${response.data.image}`
                : img.image_url,
            }
          : img
      );
      
      setImages(updatedImages);
      toast.success('Image updated successfully');
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Update error:', error.response?.data || error.message);
      toast.error(`Update failed: ${error.response?.data?.error || error.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (!id) {
      toast.error('Cannot delete: Image ID is undefined');
      return;
    }
    Modal.confirm({
      title: 'Are you sure?',
      content: 'Do you want to delete this image?',
      async onOk() {
        try {
          setLoading(true);
          await api.delete(`/captured-images/${id}/`);
          toast.success('Image deleted successfully');
          fetchImages();
        } catch (error) {
          toast.error('Failed to delete image');
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const uploadProps = {
    onRemove: (file) => {
      setFileList(fileList.filter(f => f.uid !== file.uid));
    },
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      setFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file,
      }]);
      return false;
    },
    fileList,
    maxCount: 1,
    accept: 'image/*',
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      responsive: ['md'],
      render: (imageUrl) => (
        <Image
          width={100}
          src={imageUrl}
          alt="Captured"
          style={{ borderRadius: 4 }}
          preview={{ mask: <span>View Image</span> }}
        />
      ),
    },
    {
      title: 'Mood',
      dataIndex: 'mood',
      key: 'mood',
      responsive: ['sm'],
      sorter: (a, b) => a.mood.localeCompare(b.mood),
      filters: moods.map(mood => ({ text: mood.name, value: mood.name })),
      onFilter: (value, record) => record.mood === value,
    },
    {
      title: 'Captured At',
      dataIndex: 'captured_at',
      key: 'captured_at',
      responsive: ['lg'],
      render: (date) => new Date(date).toLocaleString(),
      sorter: (a, b) => new Date(a.captured_at) - new Date(b.captured_at),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            disabled={loading}
          />
          <Button
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
    <div style={{ padding: '16px' }}>
      <Card title="Captured Images Management">
        <Table
          columns={columns}
          dataSource={images}
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
        title="Edit Image"
        visible={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading}
        width="90%"
        style={{ maxWidth: 700 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="mood"
            label="Mood"
            rules={[
              { required: true, message: 'Please select a mood!' }
            ]}
          >
            <Select
              showSearch
              placeholder="Select a mood"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {moods.map(mood => (
                <Option key={mood.name} value={mood.name}>
                  {mood.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="New Image (Optional)"
            extra="Upload to replace the current image"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Select Image</Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Current Image">
            <Image
              width={200}
              src={editingImage?.image_url}
              alt="Current"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CapturedImageCRUD;