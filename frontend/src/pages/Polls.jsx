import { useEffect, useState } from 'react';
import { Card, Button, Radio, Checkbox, message, Progress, Tag, Empty, Spin, Modal, Input } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { pollAPI } from '../services/api';

function Polls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [votingPollId, setVotingPollId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [voterName, setVoterName] = useState('');
  const [votedPolls, setVotedPolls] = useState(new Set());
  const [resultsModalVisible, setResultsModalVisible] = useState(false);
  const [currentResults, setCurrentResults] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const response = await pollAPI.getAll();
      const pollsList = response.data.polls || [];
      setPolls(pollsList);

      // 检查每个投票是否已投票
      const voted = new Set();
      for (const poll of pollsList) {
        try {
          const checkResponse = await pollAPI.checkVoted(poll.id);
          if (checkResponse.data.hasVoted) {
            voted.add(poll.id);
          }
        } catch (error) {
          console.error('检查投票状态失败:', error);
        }
      }
      setVotedPolls(voted);
    } catch (error) {
      message.error('获取投票列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (poll) => {
    const options = selectedOptions[poll.id];
    if (!options || options.length === 0) {
      message.warning('请选择投票选项');
      return;
    }

    if (poll.type === 'multiple' && options.length > poll.maxChoices) {
      message.warning(`最多只能选择${poll.maxChoices}个选项`);
      return;
    }

    setVotingPollId(poll.id);
    try {
      await pollAPI.vote(poll.id, {
        optionIds: options,
        voterName: poll.allowAnonymous ? voterName : undefined,
      });
      message.success('投票成功！');
      setVotedPolls(new Set([...votedPolls, poll.id]));
      setSelectedOptions({ ...selectedOptions, [poll.id]: [] });
      setVoterName('');
      fetchPolls(); // 刷新数据
    } catch (error) {
      message.error(error.message || '投票失败');
    } finally {
      setVotingPollId(null);
    }
  };

  const handleViewResults = async (poll) => {
    try {
      const response = await pollAPI.getResults(poll.id);
      setCurrentResults(response.data);
      setResultsModalVisible(true);
    } catch (error) {
      message.error('获取结果失败');
    }
  };

  const handleOptionChange = (pollId, optionId, type) => {
    if (type === 'single') {
      setSelectedOptions({ ...selectedOptions, [pollId]: [optionId] });
    } else {
      const current = selectedOptions[pollId] || [];
      const newOptions = current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId];
      setSelectedOptions({ ...selectedOptions, [pollId]: newOptions });
    }
  };

  const getPollStatus = (poll) => {
    const now = new Date();
    const endDate = new Date(poll.endDate);
    const isEnded = now > endDate;

    if (!poll.isActive) {
      return { status: 'stopped', text: '已停止', color: 'default', icon: <StopOutlined /> };
    }
    if (isEnded) {
      return { status: 'ended', text: '已结束', color: 'red', icon: <ClockCircleOutlined /> };
    }
    return { status: 'active', text: '进行中', color: 'green', icon: <CheckCircleOutlined /> };
  };

  const canVote = (poll) => {
    const status = getPollStatus(poll);
    return status.status === 'active' && !votedPolls.has(poll.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">班级投票</h1>
        <p className="text-gray-600">参与班级事务决策，让你的声音被听见</p>
      </div>

      {polls.length === 0 ? (
        <Empty description="暂无投票" />
      ) : (
        <div className="grid gap-6">
          {polls.map((poll) => {
            const status = getPollStatus(poll);
            const hasVoted = votedPolls.has(poll.id);
            const canVoteNow = canVote(poll);

            return (
              <Card
                key={poll.id}
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{poll.title}</span>
                    <Tag color={status.color} icon={status.icon}>
                      {status.text}
                    </Tag>
                  </div>
                }
                extra={
                  <Button type="link" onClick={() => handleViewResults(poll)}>
                    查看结果
                  </Button>
                }
              >
                {poll.description && (
                  <p className="text-gray-600 mb-4">{poll.description}</p>
                )}

                <div className="mb-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      类型：{poll.type === 'single' ? '单选' : `多选（最多${poll.maxChoices}项）`}
                    </span>
                    <span>截止时间：{dayjs(poll.endDate).format('YYYY-MM-DD HH:mm')}</span>
                    <span>已投票：{poll._count.votes} 人</span>
                  </div>
                </div>

                {hasVoted ? (
                  <div className="bg-green-50 border border-green-200 rounded p-4 text-center">
                    <CheckCircleOutlined className="text-green-500 text-2xl mb-2" />
                    <p className="text-green-700">您已参与此投票</p>
                  </div>
                ) : canVoteNow ? (
                  <div>
                    <div className="mb-4">
                      {poll.type === 'single' ? (
                        <Radio.Group
                          value={selectedOptions[poll.id]?.[0]}
                          onChange={(e) => handleOptionChange(poll.id, e.target.value, 'single')}
                          className="w-full"
                        >
                          <div className="space-y-2">
                            {poll.options.map((option) => (
                              <Radio key={option.id} value={option.id} className="block p-3 hover:bg-gray-50 rounded">
                                {option.content}
                              </Radio>
                            ))}
                          </div>
                        </Radio.Group>
                      ) : (
                        <Checkbox.Group
                          value={selectedOptions[poll.id] || []}
                          className="w-full"
                        >
                          <div className="space-y-2">
                            {poll.options.map((option) => (
                              <Checkbox
                                key={option.id}
                                value={option.id}
                                onChange={(e) =>
                                  handleOptionChange(poll.id, option.id, 'multiple')
                                }
                                className="block p-3 hover:bg-gray-50 rounded"
                              >
                                {option.content}
                              </Checkbox>
                            ))}
                          </div>
                        </Checkbox.Group>
                      )}
                    </div>

                    {poll.allowAnonymous && (
                      <div className="mb-4">
                        <Input
                          placeholder="输入您的姓名（可选）"
                          value={voterName}
                          onChange={(e) => setVoterName(e.target.value)}
                          maxLength={20}
                        />
                      </div>
                    )}

                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={votingPollId === poll.id}
                      onClick={() => handleVote(poll)}
                    >
                      提交投票
                    </Button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
                    <p className="text-gray-600">投票已{status.text}</p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

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
        {currentResults && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{currentResults.poll.title}</h3>
              <p className="text-gray-600">总投票数：{currentResults.poll.totalVotes}</p>
            </div>
            <div className="space-y-4">
              {currentResults.results.map((result) => (
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
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Polls;
