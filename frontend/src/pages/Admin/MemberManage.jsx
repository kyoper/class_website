import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';

function MemberManage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form] = Form.useForm();
  const [selectedRole, setSelectedRole] = useState('teacher');

  // 教师职位选项
  const teacherPositions = [
    '班主任',
    '语文老师',
    '数学老师',
    '英语老师',
    '物理老师',
    '化学老师',
    '生物老师',
    '政治老师',
    '历史老师',
    '地理老师',
    '体育老师',
    '音乐老师',
    '美术老师',
    '信息技术老师',
  ];

  // 学生职位选项
  const studentPositions = [
    '班长',
    '副班长',
    '学习委员',
    '体育委员',
    '文艺委员',
    '劳动委员',
    '生活委员',
    '宣传委员',
    '组织委员',
    '科代表',
    '小组长',
    '普通学生',
  ];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/members');
      if (response.success) {
        setMembers(response.data.members);
      }
    } catch (error) {
      message.error('获取成员列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMember(null);
    form.resetFields();
    setSelectedRole('teacher');
    setModalVisible(true);
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    form.setFieldsValue(member);
    setSelectedRole(member.role || 'teacher');
    setModalVisible(true);
  };

  const handleRoleChange = (value) => {
    setSelectedRole(value);
    // 清空职位字段
    form.setFieldValue('position', undefined);
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/members/${id}`);
      if (response.success) {
        message.success('删除成功');
        fetchMembers();
      }
    } catch (error) {
      console.error('删除错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '删除成员失败，请稍后重试');
    }
  };

  const handleSubmit = async (values) => {
    try {
      // 确保数据类型正确
      const data = {
        ...values,
        order: values.order ? parseInt(values.order) : 0,
        position: values.position || '',
        bio: values.bio || '',
        avatar: values.avatar || '',
      };

      let response;
      if (editingMember) {
        response = await api.put(`/members/${editingMember.id}`, data);
      } else {
        response = await api.post('/members', data);
      }

      if (response.success) {
        message.success(editingMember ? '更新成功' : '添加成功');
        setModalVisible(false);
        fetchMembers();
      }
    } catch (error) {
      console.error('提交错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || (editingMember ? '更新成员失败，请检查输入信息' : '添加成员失败，请检查输入信息'));
    }
  };

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleMap = {
          teacher: { text: '教师', color: 'blue' },
          student: { text: '学生', color: 'green' },
        };
        const roleInfo = roleMap[role] || { text: role, color: 'default' };
        return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
      },
    },
    {
      title: '职位/学号',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '简介',
      dataIndex: 'bio',
      key: 'bio',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: window.innerWidth > 768 ? 'right' : false,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个成员吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">成员管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          添加成员
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingMember ? '编辑成员' : '添加成员'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="姓名"
            name="name"
            rules={[
              { required: true, message: '姓名不能为空，请输入成员姓名' },
              { max: 50, message: '姓名不能超过50个字符' }
            ]}
          >
            <Input 
              placeholder="请输入姓名" 
              maxLength={50}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '角色不能为空，请选择成员角色' }]}
          >
            <Select 
              placeholder="请选择角色"
              onChange={handleRoleChange}
            >
              <Select.Option value="teacher">教师</Select.Option>
              <Select.Option value="student">学生</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="职位"
            name="position"
            rules={[{ required: true, message: '职位不能为空，请选择职位' }]}
          >
            <Select 
              placeholder={selectedRole === 'teacher' ? '请选择教师职位' : '请选择学生职位'}
              showSearch
            >
              {(selectedRole === 'teacher' ? teacherPositions : studentPositions).map(pos => (
                <Select.Option key={pos} value={pos}>{pos}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="简介"
            name="bio"
            rules={[{ max: 500, message: '简介不能超过500个字符' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入简介" 
              showCount 
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            label="头像"
            name="avatar"
            extra="上传成员头像照片"
          >
            <ImageUpload />
          </Form.Item>

          <Form.Item
            label="排序"
            name="order"
            initialValue={0}
          >
            <InputNumber 
              placeholder="数字越小越靠前" 
              min={0}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingMember ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default MemberManage;
