import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 获取所有投票（公开）
export const getAllPolls = async (req, res) => {
  try {
    const { status } = req.query; // active, ended, all
    
    let where = {};
    const now = new Date();
    
    if (status === 'active') {
      where = {
        isActive: true,
        endDate: { gte: now }
      };
    } else if (status === 'ended') {
      where = {
        OR: [
          { isActive: false },
          { endDate: { lt: now } }
        ]
      };
    }
    
    const polls = await prisma.poll.findMany({
      where,
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { votes: true }
            }
          }
        },
        _count: {
          select: { votes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: { polls } });
  } catch (error) {
    console.error('获取投票列表失败:', error);
    res.status(500).json({ success: false, message: '获取投票列表失败' });
  }
};

// 获取单个投票详情
export const getPollById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const poll = await prisma.poll.findUnique({
      where: { id: parseInt(id) },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { votes: true }
            }
          }
        },
        _count: {
          select: { votes: true }
        }
      }
    });
    
    if (!poll) {
      return res.status(404).json({ success: false, message: '投票不存在' });
    }
    
    res.json({ success: true, data: { poll } });
  } catch (error) {
    console.error('获取投票详情失败:', error);
    res.status(500).json({ success: false, message: '获取投票详情失败' });
  }
};

// 创建投票（管理员）
export const createPoll = async (req, res) => {
  try {
    const { title, description, type, maxChoices, endDate, allowAnonymous, options } = req.body;
    
    if (!title || !endDate || !options || options.length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供标题、截止日期和至少2个选项' 
      });
    }
    
    const poll = await prisma.poll.create({
      data: {
        title,
        description,
        type: type || 'single',
        maxChoices: maxChoices || 1,
        endDate: new Date(endDate),
        allowAnonymous: allowAnonymous !== false,
        options: {
          create: options.map((opt, index) => ({
            content: opt.content,
            order: opt.order || index
          }))
        }
      },
      include: {
        options: true
      }
    });
    
    res.status(201).json({ success: true, data: { poll } });
  } catch (error) {
    console.error('创建投票失败:', error);
    res.status(500).json({ success: false, message: '创建投票失败' });
  }
};

// 更新投票（管理员）
export const updatePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, maxChoices, endDate, isActive, allowAnonymous } = req.body;
    
    const poll = await prisma.poll.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        type,
        maxChoices,
        endDate: endDate ? new Date(endDate) : undefined,
        isActive,
        allowAnonymous
      },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    });
    
    res.json({ success: true, data: { poll } });
  } catch (error) {
    console.error('更新投票失败:', error);
    res.status(500).json({ success: false, message: '更新投票失败' });
  }
};

// 删除投票（管理员）
export const deletePoll = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.poll.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true, message: '投票已删除' });
  } catch (error) {
    console.error('删除投票失败:', error);
    res.status(500).json({ success: false, message: '删除投票失败' });
  }
};

// 投票（公开）
export const submitVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { optionIds, voterName } = req.body;
    const voterIp = req.ip || req.connection.remoteAddress;
    
    if (!optionIds || optionIds.length === 0) {
      return res.status(400).json({ success: false, message: '请选择投票选项' });
    }
    
    // 获取投票信息
    const poll = await prisma.poll.findUnique({
      where: { id: parseInt(id) },
      include: { options: true }
    });
    
    if (!poll) {
      return res.status(404).json({ success: false, message: '投票不存在' });
    }
    
    // 检查投票是否已结束
    if (!poll.isActive || new Date() > new Date(poll.endDate)) {
      return res.status(400).json({ success: false, message: '投票已结束' });
    }
    
    // 检查选项数量
    if (poll.type === 'single' && optionIds.length > 1) {
      return res.status(400).json({ success: false, message: '单选投票只能选择一个选项' });
    }
    
    if (poll.type === 'multiple' && optionIds.length > poll.maxChoices) {
      return res.status(400).json({ 
        success: false, 
        message: `最多只能选择${poll.maxChoices}个选项` 
      });
    }
    
    // 检查是否已投票（通过IP）
    const existingVote = await prisma.vote.findFirst({
      where: {
        pollId: parseInt(id),
        voterIp
      }
    });
    
    if (existingVote) {
      return res.status(400).json({ success: false, message: '您已经投过票了' });
    }
    
    // 创建投票记录
    const votes = await prisma.$transaction(
      optionIds.map(optionId => 
        prisma.vote.create({
          data: {
            pollId: parseInt(id),
            optionId: parseInt(optionId),
            voterName: poll.allowAnonymous ? voterName : null,
            voterIp
          }
        })
      )
    );
    
    res.json({ success: true, message: '投票成功', data: { votes } });
  } catch (error) {
    console.error('投票失败:', error);
    res.status(500).json({ success: false, message: '投票失败' });
  }
};

// 获取投票结果统计
export const getPollResults = async (req, res) => {
  try {
    const { id } = req.params;
    
    const poll = await prisma.poll.findUnique({
      where: { id: parseInt(id) },
      include: {
        options: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { votes: true }
            }
          }
        },
        _count: {
          select: { votes: true }
        }
      }
    });
    
    if (!poll) {
      return res.status(404).json({ success: false, message: '投票不存在' });
    }
    
    // 计算百分比
    const totalVotes = poll._count.votes;
    const results = poll.options.map(option => ({
      id: option.id,
      content: option.content,
      votes: option._count.votes,
      percentage: totalVotes > 0 ? ((option._count.votes / totalVotes) * 100).toFixed(2) : 0
    }));
    
    res.json({ 
      success: true, 
      data: { 
        poll: {
          id: poll.id,
          title: poll.title,
          description: poll.description,
          type: poll.type,
          totalVotes,
          isActive: poll.isActive,
          endDate: poll.endDate
        },
        results 
      } 
    });
  } catch (error) {
    console.error('获取投票结果失败:', error);
    res.status(500).json({ success: false, message: '获取投票结果失败' });
  }
};

// 检查用户是否已投票
export const checkVoted = async (req, res) => {
  try {
    const { id } = req.params;
    const voterIp = req.ip || req.connection.remoteAddress;
    
    const vote = await prisma.vote.findFirst({
      where: {
        pollId: parseInt(id),
        voterIp
      }
    });
    
    res.json({ success: true, data: { hasVoted: !!vote } });
  } catch (error) {
    console.error('检查投票状态失败:', error);
    res.status(500).json({ success: false, message: '检查投票状态失败' });
  }
};
