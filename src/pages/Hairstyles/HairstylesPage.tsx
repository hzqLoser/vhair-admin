import React, { useState } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, Space, Modal, App as AntdApp } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHairstylesApi, deleteHairstyleApi } from '../../api/hairstyles';
import { AdminHairstyle, HairstyleCategory, HairstyleGender } from '../../api/types';
import HairstyleFormModal from './HairstyleFormModal';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

const HairstylesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { message } = AntdApp.useApp();

  // Filter States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [gender, setGender] = useState<HairstyleGender | undefined>(undefined);
  const [category, setCategory] = useState<HairstyleCategory | 'all'>('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminHairstyle | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Data Fetching
  const { data, isLoading } = useQuery({
    queryKey: ['hairstyles', page, pageSize, keyword, gender, category],
    queryFn: () => getHairstylesApi({
      page,
      pageSize,
      keyword: keyword || undefined,
      gender,
      category: category === 'all' ? undefined : category,
    }),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteHairstyleApi,
    onSuccess: () => {
      message.success('Deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['hairstyles'] });
    },
  });

  const handleEdit = (record: AdminHairstyle) => {
    setEditingItem(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const columns: ColumnsType<AdminHairstyle> = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (url) => (
        <img
          src={url || 'https://picsum.photos/64/85'}
          alt="hairstyle"
          className="w-16 h-24 rounded object-cover border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => {
            setPreviewImage(url || '');
            setPreviewVisible(true);
          }}
        />
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
      width: 120,
      render: (g) => (
        <Tag color={g === 'Male' ? 'blue' : 'magenta'}>{g}</Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (c) => <Tag>{c.toUpperCase()}</Tag>,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <>
          {tags?.map((tag) => (
            <Tag key={tag} className="mr-1">{tag}</Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Heat',
      dataIndex: 'heat',
      key: 'heat',
      width: 100,
      sorter: (a, b) => a.heat - b.heat,
    },
    {
      title: 'Action',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-blue-600 hover:text-blue-800"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete this hairstyle?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header / Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-lg border border-gray-100">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          <Input
            placeholder="Search by name or tag..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="w-full md:w-64"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            allowClear
          />
          <Select
            defaultValue="all"
            className="w-32"
            onChange={(val: 'all' | HairstyleGender) => setGender(val === 'all' ? undefined : val)}
          >
            <Option value="all">All Genders</Option>
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
          </Select>
          <Select
            defaultValue="all"
            className="w-32"
            value={category}
            onChange={(val: HairstyleCategory) => setCategory(val)}
          >
            <Option value="all">All Categories</Option>
            <Option value="long">Long</Option>
            <Option value="short">Short</Option>
            <Option value="curly">Curly</Option>
            <Option value="straight">Straight</Option>
            <Option value="color">Color</Option>
          </Select>
          <Button
            type="primary"
            ghost
            icon={<SearchOutlined />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['hairstyles'] })}
          >
            Search
          </Button>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          className="bg-blue-600"
        >
          Add Hairstyle
        </Button>
      </div>

      {/* Data Table */}
      <Table
        columns={columns}
        dataSource={data?.list}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showSizeChanger: true
        }}
        scroll={{ x: 800 }}
      />

      {/* Form Modal */}
      <HairstyleFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialValues={editingItem}
      />

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="auto"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: 0,
          margin: 0,
          minWidth: '300px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          zIndex: 10000
        }}
        styles={{
          body: {
            padding: '0',
            backgroundColor: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          },
          mask: { backgroundColor: 'transparent' },
          wrap: { backgroundColor: 'transparent' }
        }}
        closable={false}
        maskClosable={true}
        transitionName=""
        maskTransitionName=""
        destroyOnHidden={true}
      >
        <img
          alt="Preview"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain'
          }}
          src={previewImage}
        />
      </Modal>
    </div>
  );
};

export default HairstylesPage;
