import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import api from '../../services/api';
import ImageUpload from '../../components/common/ImageUpload';

function ClassInfoManage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClassInfo();
  }, []);

  const fetchClassInfo = async () => {
    setLoading(true);
    try {
      const response = await api.get('/class-info');
      if (response.success && response.data.classInfo) {
        // 确保所有字段都被正确设置
        const classInfo = response.data.classInfo;
        form.setFieldsValue({
          name: classInfo.name || '',
          motto: classInfo.motto || '',
          description: classInfo.description || '',
          headTeacher: classInfo.headTeacher || '',
          studentCount: classInfo.studentCount || '',
          establishedYear: classInfo.establishedYear || '',
          backgroundImage: classInfo.backgroundImage || '',
          logo: classInfo.logo || '',
          contactEmail: classInfo.contactEmail || '',
          contactPhone: classInfo.contactPhone || '',
        });
      }
    } catch (error) {
      console.error('获取班级信息错误:', error);
      message.error('获取班级信息失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSaving(true);
    try {
      const response = await api.put('/class-info', values);
      if (response.success) {
        message.success('班级信息保存成功！');
        fetchClassInfo();
      }
    } catch (error) {
      console.error('保存班级信息错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '保存失败，请检查网络连接或输入信息');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">班级信息管理</h1>
        <p className="text-gray-600 mt-1">编辑班级的基本信息</p>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="班级名称"
            name="name"
            rules={[
              { required: true, message: '班级名称不能为空，请输入班级名称' },
              { max: 100, message: '班级名称不能超过100个字符' }
            ]}
          >
            <Input 
              placeholder="例如：清水亭学校七（三）班" 
              size="large"
              showCount
              maxLength={100}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="班级口号"
            name="motto"
            rules={[{ max: 100, message: '班级口号不能超过100个字符' }]}
          >
            <Input 
              placeholder="例如：团结奋进，追求卓越" 
              size="large"
              showCount
              maxLength={100}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="班级简介"
            name="description"
            rules={[{ max: 500, message: '班级简介不能超过500个字符' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入班级简介"
              showCount
              maxLength={500}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="班主任"
            name="headTeacher"
            rules={[{ max: 50, message: '班主任姓名不能超过50个字符' }]}
          >
            <Input 
              placeholder="请输入班主任姓名" 
              maxLength={50}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="学生人数"
            name="studentCount"
            rules={[
              { type: 'number', transform: (value) => Number(value), message: '请输入有效的数字' }
            ]}
          >
            <Input 
              type="number" 
              placeholder="请输入学生人数" 
              min={0}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="成立时间"
            name="establishedYear"
            rules={[{ max: 20, message: '成立时间不能超过20个字符' }]}
          >
            <Input 
              placeholder="例如：2023年9月" 
              maxLength={20}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="班级背景图"
            name="backgroundImage"
            extra="建议尺寸：1920x600 像素，用于首页横幅背景"
          >
            <ImageUpload />
          </Form.Item>

          <Form.Item
            label="班级Logo"
            name="logo"
            extra="建议尺寸：200x200 像素"
          >
            <ImageUpload />
          </Form.Item>

          <Form.Item
            label="联系邮箱"
            name="contactEmail"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址格式' }
            ]}
          >
            <Input 
              placeholder="例如：class@school.com"
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item
            label="联系电话"
            name="contactPhone"
            rules={[
              { pattern: /^[\d\s\-()]+$/, message: '请输入有效的电话号码' },
              { max: 20, message: '电话号码不能超过20个字符' }
            ]}
          >
            <Input 
              placeholder="例如：0571-12345678" 
              maxLength={20}
              autoComplete="off"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
                icon={<SaveOutlined />}
                size="large"
              >
                保存信息
              </Button>
              <Button onClick={() => form.resetFields()} size="large">
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card className="mt-4" title="使用提示">
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• 班级名称和口号会显示在首页横幅</li>
          <li>• 班级简介会显示在首页的班级介绍区域</li>
          <li>• 背景图建议尺寸：1920x600 像素</li>
          <li>• Logo 建议尺寸：200x200 像素</li>
          <li>• 所有字段都是可选的，可以根据需要填写</li>
        </ul>
      </Card>
    </div>
  );
}

export default ClassInfoManage;
