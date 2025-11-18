import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Popconfirm,
  Tag,
  Select,
  InputNumber,
  Switch,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { pollAPI } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

function PollManage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [editingPoll, setEditingPoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [form] = Form.useForm();
  const [options, setOptions] = useState([{ content: '' }, { content: '' }]);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const response = await pollAPI.getAll();
      setPolls(response.data.polls || []);
    } catch (error) {
      message.error('获取投票列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingPoll(null);
    setOptions([{ content: '' }, { content: '' }]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingPoll(record);
    setOptions(record.options.map((opt) => ({ content: opt.content })));
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      type: record.type,
      maxChoices: record.maxChoices,
      endDate: dayjs(record.endDate),
      allowAnonymous: record.allowAnonymous,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await pollAPI.delete(id);
      message.success('删除成功');
      fetchPolls();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggleActive = async (record) => {
    try {
      await pollAPI.update(record.id, { isActive: !record.isActive });
      message.success(record.isActive ? '已停止投票' : '已恢复投票');
      fetchPolls();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleViewResults = async (record) => {
    try {
      const response = await pollAPI.getResults(record.id);
      setPollResults(response.data);
      setResultsModalVisible(true);
    } catch (error) {
      message.error('获取结果失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const validOptions = options.filter((opt) => opt.content.trim());

      if (validOptions.length < 2) {
        message.error('至少需要2个选项');
        return;
      }

      const data = {
        ...values,
        endDate: values.endDate.toISOString(),
        options: validOptions,
      };

      if (editingPoll) {
        await pollAPI.update(editingPoll.id, data);
        message.success('更新成功');
      } else {
        await pollAPI.create(data);
        message.success('创建成功');
      }

      setModalVisible(false);
      fetchPolls();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  const addOption = () => {
    setOptions([...options, { content: '' }]);
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      message.warning('至少需要2个选项');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index].content = value;
    setOptions(newOptions);
  };

  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => (type === 'single' ? '单选' : '多选'),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const now = new Date();
        const endDate = new Date(record.endDate);
        const isEnded = now > endDate;

        if (!record.isActive) {
          return <Tag color="default">已停止</Tag>;
        }
        if (isEnded) {
          return <Tag color="red">已结束</Tag>;
        }
        return <Tag color="green">进行中</Tag>;
      },
    },
    {
      title: '投票数',
      dataIndex: ['_count', 'votes'],
      key: 'votes',
      width: 80,
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    },
    {
      title: '截止时间',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 150,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => handleViewResults(record)}
          >
            结果
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
            onClick={() => handleToggleActive(record)}
          >
            {record.isActive ? '停止' : '恢复'}
          </Button>
          <Popconfirm
            title="确定要删除这个投票吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
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
        <h1 className="text-2xl font-bold text-gray-800">投票管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          创建投票
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={polls}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      {/* 创建/编辑投票 Modal */}
      <Modal
        title={editingPoll ? '编辑投票' : '创建投票'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText="保存"
        cancelText="取消"
        centered
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="投票标题"
            name="title"
            rules={[{ required: true, message: '请输入投票标题' }]}
          >
            <Input placeholder="例如：班级活动选择" />
          </Form.Item>

          <Form.Item label="投票描述" name="description">
            <TextArea rows={3} placeholder="简要描述投票内容" />
          </Form.Item>

          <Form.Item
            label="投票类型"
            name="type"
            initialValue="single"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="single">单选</Option>
              <Option value="multiple">多选</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) =>
              getFieldValue('type') === 'multiple' ? (
                <Form.Item
                  label="最多可选"
                  name="maxChoices"
                  initialValue={2}
                  rules={[{ required: true }]}
                >
                  <InputNumber min={2} max={10} />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item
            label="截止时间"
            name="endDate"
            rules={[{ required: true, message: '请选择截止时间' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="允许匿名投票" name="allowAnonymous" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Form.Item label="投票选项" required>
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {options.map((option, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <Input
                    placeholder={`选项 ${index + 1}`}
                    value={option.content}
                    onChange={(e) => updateOption(index, e.target.value)}
                    style={{ width: '480px' }}
                  />
                  {options.length > 2 && (
                    <Button danger onClick={() => removeOption(index)}>
                      删除
                    </Button>
                  )}
                </div>
              ))}
              <Button type="dashed" onClick={addOption} block>
                + 添加选项
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 投票结果 Modal */}
      <Modal
        title="投票结果"
        open={resultsModalVisible}
        onCancel={() => setResultsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultsModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
        centered
      >
        {pollResults && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{pollResults.poll.title}</h3>
              <p className="text-gray-600">总投票数：{pollResults.poll.totalVotes}</p>
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {pollResults.results.map((result) => (
                <div key={result.id}>
                  <div className="flex justify-between mb-2">
                    <span>{result.content}</span>
                    <span className="font-semibold">
                      {result.votes} 票 ({result.percentage}%)
                    </span>
                  </div>
                  <Progress percent={parseFloat(result.percentage)} />
                </div>
              ))}
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PollManage;
