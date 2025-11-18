import { useEffect, useState } from 'react';
import { Form, Input, Button, Switch, message, Card, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../services/api';

function AnnouncementForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchAnnouncement();
    }
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const response = await api.get(`/announcements/${id}`);
      if (response.success) {
        const announcement = response.data.announcement;
        form.setFieldsValue({
          title: announcement.title,
          summary: announcement.summary,
          isImportant: announcement.isImportant,
        });
        setContent(announcement.content);
      }
    } catch (error) {
      message.error('获取公告详情失败');
    }
  };

  const onFinish = async (values) => {
    if (!content || !content.trim() || content.trim() === '<p><br></p>') {
      message.error('公告内容不能为空，请输入内容');
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...values,
        content,
      };

      let response;
      if (isEdit) {
        response = await api.put(`/announcements/${id}`, data);
      } else {
        response = await api.post('/announcements', data);
      }

      if (response.success) {
        message.success(isEdit ? '公告更新成功！' : '公告发布成功！');
        navigate('/admin/announcements');
      }
    } catch (error) {
      console.error('提交错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || (isEdit ? '更新公告失败，请检查网络连接或输入信息' : '发布公告失败，请检查网络连接或输入信息'));
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  return (
    <div className="p-6">
      <Card
        title={isEdit ? '编辑公告' : '发布公告'}
        extra={
          <Button onClick={() => navigate('/admin/announcements')}>
            返回列表
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isImportant: false,
          }}
        >
          <Form.Item
            label="公告标题"
            name="title"
            rules={[
              { required: true, message: '公告标题不能为空，请输入标题' },
              { max: 100, message: '标题不能超过100个字符' },
            ]}
          >
            <Input 
              placeholder="请输入公告标题" 
              size="large" 
              showCount 
              maxLength={100}
            />
          </Form.Item>

          <Form.Item
            label="公告摘要"
            name="summary"
            rules={[
              { max: 200, message: '摘要不能超过200个字符' },
            ]}
            extra="如果不填写，将自动从内容中提取"
          >
            <Input.TextArea
              placeholder="请输入公告摘要"
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="公告内容"
            required
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="请输入公告内容..."
              style={{ height: '400px', marginBottom: '50px' }}
            />
          </Form.Item>

          <Form.Item
            label="标记为重要"
            name="isImportant"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {isEdit ? '更新公告' : '发布公告'}
              </Button>
              <Button onClick={() => navigate('/admin/announcements')} size="large">
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default AnnouncementForm;
