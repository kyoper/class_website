import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const search = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: { message: '搜索关键词不能为空', code: 'EMPTY_QUERY' }
      });
    }
    
    const keyword = q.trim();
    const results = {};
    
    // 搜索公告
    if (type === 'all' || type === 'announcement') {
      results.announcements = await prisma.announcement.findMany({
        where: {
          OR: [
            { title: { contains: keyword } },
            { content: { contains: keyword } },
            { summary: { contains: keyword } }
          ]
        },
        select: {
          id: true,
          title: true,
          summary: true,
          createdAt: true
        },
        take: 10
      });
    }
    
    // 搜索相册
    if (type === 'all' || type === 'album') {
      results.albums = await prisma.album.findMany({
        where: {
          OR: [
            { title: { contains: keyword } },
            { description: { contains: keyword } }
          ]
        },
        select: {
          id: true,
          title: true,
          description: true,
          coverImage: true
        },
        take: 10
      });
    }
    
    // 搜索留言
    if (type === 'all' || type === 'message') {
      results.messages = await prisma.message.findMany({
        where: {
          OR: [
            { nickname: { contains: keyword } },
            { content: { contains: keyword } }
          ]
        },
        select: {
          id: true,
          nickname: true,
          content: true,
          createdAt: true
        },
        take: 10
      });
    }
    
    res.json({
      success: true,
      data: {
        keyword,
        results
      }
    });
  } catch (error) {
    console.error('搜索错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '搜索失败', code: 'SEARCH_ERROR' }
    });
  }
};
