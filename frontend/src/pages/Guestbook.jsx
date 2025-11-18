import { useEffect, useState } from 'react';
import { Card, Input, Button, message, Spin, Empty, Pagination } from 'antd';
import { messageAPI } from '../services/api';

const { TextArea } = Input;

function Guestbook() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [form, setForm] = useState({ nickname: '', content: '' });

  useEffect(() => {
    fetchMessages();
  }, [pagination.page]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await messageAPI.getList({
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setMessages(response.data.messages);
      setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
    } catch (error) {
      message.error('获取留言失败');
    } finally {
      setLoading(false);
    }
  };

  // 敏感词列表
  const sensitiveWords = [
    '政治', '暴力', '色情', '赌博', '毒品', '反动', '法轮功',
    '习近平', '共产党', '六四', '天安门', '台独', '藏独', '疆独',
    '操', '妈的', '傻逼', '草泥马', '他妈的', '去死', '垃圾',
    // 可以根据需要添加更多敏感词
  ];

  // 检查敏感词
  const checkSensitiveWords = (text) => {
    const lowerText = text.toLowerCase();
    for (const word of sensitiveWords) {
      if (lowerText.includes(word.toLowerCase())) {
        return word;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    // 验证昵称
    if (!form.nickname.trim()) {
      message.error('昵称不能为空，请输入您的昵称');
      return;
    }

    if (form.nickname.trim().length < 2) {
      message.error('昵称至少需要2个字符');
      return;
    }

    // 验证留言内容
    if (!form.content.trim()) {
      message.error('留言内容不能为空，请输入留言内容');
      return;
    }

    if (form.content.trim().length < 5) {
      message.error('留言内容至少需要5个字符');
      return;
    }

    if (form.content.length > 500) {
      message.error('留言内容不能超过500字');
      return;
    }

    // 检查敏感词
    const sensitiveWord = checkSensitiveWords(form.nickname + ' ' + form.content);
    if (sensitiveWord) {
      message.error(`留言包含敏感词"${sensitiveWord}"，请修改后重试`);
      return;
    }

    setSubmitting(true);
    try {
      await messageAPI.create({
        nickname: form.nickname.trim(),
        content: form.content.trim()
      });
      message.success('留言发表成功！');
      setForm({ nickname: '', content: '' });
      fetchMessages();
    } catch (error) {
      console.error('发表留言错误:', error);
      const errorMsg = error?.response?.data?.error?.message || error?.message;
      message.error(errorMsg || '发表留言失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">留言板</h1>

      {/* 发表留言 */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">发表留言</h2>
        <div className="mb-2">
          <label className="text-sm text-gray-600">
            <span className="text-red-500">* </span>昵称
          </label>
        </div>
        <Input
          placeholder="请输入您的昵称（必填，至少2个字符）"
          value={form.nickname}
          onChange={(e) => setForm({ ...form, nickname: e.target.value })}
          className="mb-4"
          maxLength={50}
          showCount
          autoComplete="off"
        />
        <div className="mb-2">
          <label className="text-sm text-gray-600">
            <span className="text-red-500">* </span>留言内容
          </label>
        </div>
        <TextArea
          placeholder="请输入留言内容（必填，至少5个字符，最多500字）"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={4}
          maxLength={500}
          showCount
          className="mb-4"
          autoComplete="off"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            温馨提示：请文明留言，禁止发布违法违规内容
          </span>
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={submitting}
            size="large"
          >
            发表留言
          </Button>
        </div>
      </Card>

      {/* 留言列表 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      ) : messages.length === 0 ? (
        <Empty description="还没有留言，快来抢沙发吧！" />
      ) : (
        <>
          <div className="space-y-4">
            {messages.map((msg) => (
              <Card key={msg.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-primary-600 mb-2">
                      {msg.nickname}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(msg.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Pagination
              current={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={(page) => setPagination(prev => ({ ...prev, page }))}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default Guestbook;
