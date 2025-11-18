import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

const deleteOldImage = (imageUrl) => {
  if (!imageUrl) return;

  try {
    const urlPath = imageUrl.replace(/^https?:\/\/[^/]+/, '');
    if (!urlPath.startsWith('/uploads/')) return;

    const filename = path.basename(urlPath);
    const uploadDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, filename);
    const thumbPath = path.join(uploadDir, 'thumbnails', `thumb-${filename}`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(thumbPath)) {
      fs.unlinkSync(thumbPath);
    }
  } catch (error) {
    console.error('删除旧图片失败:', error);
  }
};

const mapToResponse = (classInfo) => ({
  name: classInfo.className || '',
  motto: classInfo.motto || '',
  description: classInfo.description || '',
  backgroundImage: classInfo.classPhoto || '',
  logo: classInfo.emblem || '',
  studentCount: classInfo.studentCount || 0,
  headTeacher: classInfo.headTeacher || '',
  establishedYear: classInfo.establishedYear || '',
  contactEmail: classInfo.contactEmail || '',
  contactPhone: classInfo.contactPhone || '',
});

export const getClassInfo = async (req, res) => {
  try {
    const classInfo = await prisma.classInfo.findFirst();

    if (!classInfo) {
      return res.status(404).json({
        success: false,
        error: { message: '班级信息不存在', code: 'CLASS_INFO_NOT_FOUND' },
      });
    }

    res.json({ success: true, data: { classInfo: mapToResponse(classInfo) } });
  } catch (error) {
    console.error('获取班级信息错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取班级信息失败', code: 'GET_CLASS_INFO_ERROR' },
    });
  }
};

export const updateClassInfo = async (req, res) => {
  try {
    const classInfo = await prisma.classInfo.findFirst();

    if (classInfo) {
      if (req.body.backgroundImage && req.body.backgroundImage !== classInfo.classPhoto) {
        deleteOldImage(classInfo.classPhoto);
      }

      if (req.body.logo && req.body.logo !== classInfo.emblem) {
        deleteOldImage(classInfo.emblem);
      }
    }

    const mappedData = {
      className: req.body.name || '',
      motto: req.body.motto || null,
      description: req.body.description || null,
      classPhoto: req.body.backgroundImage || null,
      emblem: req.body.logo || null,
      studentCount: req.body.studentCount ? parseInt(req.body.studentCount, 10) : 0,
      headTeacher: req.body.headTeacher || null,
      establishedYear: req.body.establishedYear || null,
      contactEmail: req.body.contactEmail || null,
      contactPhone: req.body.contactPhone || null,
    };

    let savedInfo;

    if (!classInfo) {
      savedInfo = await prisma.classInfo.create({ data: mappedData });
      await prisma.operationLog.create({
        data: {
          adminId: req.admin.id,
          action: 'create',
          target: 'classInfo',
          details: '创建班级信息',
        },
      });
      return res.status(201).json({
        success: true,
        data: { classInfo: mapToResponse(savedInfo) },
        message: '班级信息创建成功',
      });
    }

    savedInfo = await prisma.classInfo.update({
      where: { id: classInfo.id },
      data: mappedData,
    });

    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update',
        target: 'classInfo',
        details: '更新班级信息',
      },
    });

    res.json({
      success: true,
      data: { classInfo: mapToResponse(savedInfo) },
      message: '班级信息更新成功',
    });
  } catch (error) {
    console.error('更新班级信息错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '更新班级信息失败', code: 'UPDATE_CLASS_INFO_ERROR' },
    });
  }
};
