import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSchedule = async (req, res) => {
  try {
    const schedule = await prisma.schedule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }]
    });
    
    res.json({ success: true, data: { schedule } });
  } catch (error) {
    console.error('获取课程表错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取课程表失败', code: 'GET_SCHEDULE_ERROR' }
    });
  }
};

export const updateSchedule = async (req, res) => {
  try {
    const { schedule } = req.body;
    
    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        error: { message: '课程表数据格式错误', code: 'INVALID_SCHEDULE_DATA' }
      });
    }
    
    // 删除现有课程表
    await prisma.schedule.deleteMany();
    
    // 过滤掉没有 id 的新课程，准备批量创建
    const scheduleToCreate = schedule
      .filter(item => item.subject) // 只保留有科目的课程
      .map(({ id, createdAt, updatedAt, ...item }) => item); // 移除自动生成的字段
    
    // 批量创建新课程表
    if (scheduleToCreate.length > 0) {
      await prisma.schedule.createMany({ data: scheduleToCreate });
    }
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update',
        target: 'schedule',
        details: '更新课程表'
      }
    });
    
    res.json({ success: true, message: '课程表更新成功' });
  } catch (error) {
    console.error('更新课程表错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '更新课程表失败', code: 'UPDATE_SCHEDULE_ERROR' }
    });
  }
};
