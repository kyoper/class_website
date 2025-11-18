import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始添加种子数据...');

  // 清空现有数据（开发环境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🗑️  清空现有数据...');
    await prisma.operationLog.deleteMany();
    await prisma.message.deleteMany();
    await prisma.honor.deleteMany();
    await prisma.homework.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.member.deleteMany();
    await prisma.photo.deleteMany();
    await prisma.album.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.classInfo.deleteMany();
    await prisma.admin.deleteMany();
  }

  // 1. 创建管理员账号
  console.log('👤 创建管理员账号...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      name: '系统管理员'
    }
  });
  console.log(`✅ 管理员创建成功: ${admin.username}`);

  // 2. 创建班级信息
  console.log('🏫 创建班级信息...');
  const classInfo = await prisma.classInfo.create({
    data: {
      className: '清水亭学校七（三）班',
      motto: '团结友爱，勤奋进取，追求卓越',
      description: '我们是一个充满活力和创造力的班级，每个同学都在这里快乐成长。',
      studentCount: 45
    }
  });
  console.log(`✅ 班级信息创建成功: ${classInfo.className}`);

  // 3. 创建示例公告
  console.log('📢 创建示例公告...');
  await prisma.announcement.createMany({
    data: [
      {
        title: '欢迎来到七（三）班级网站',
        content: '<p>亲爱的同学们和家长们，欢迎来到我们的班级网站！</p><p>在这里，你可以查看班级动态、浏览精彩照片、了解课程安排和作业信息。</p><p>让我们一起记录成长的每一刻！</p>',
        summary: '欢迎来到七（三）班级网站，一起记录成长的每一刻',
        isImportant: true
      },
      {
        title: '期中考试安排通知',
        content: '<p>各位同学和家长：</p><p>期中考试将于下周三至周五进行，请同学们做好复习准备。</p><p><strong>考试时间：</strong></p><ul><li>周三：语文、数学</li><li>周四：英语、物理</li><li>周五：化学、生物</li></ul>',
        summary: '期中考试将于下周三至周五进行，请做好准备',
        isImportant: true
      },
      {
        title: '班级秋游活动通知',
        content: '<p>为了丰富同学们的课余生活，学校决定组织秋游活动。</p><p><strong>时间：</strong>本周六上午8:00-下午4:00</p><p><strong>地点：</strong>市植物园</p><p>请同学们准时集合，注意安全。</p>',
        summary: '本周六组织秋游活动，地点：市植物园',
        isImportant: false
      }
    ]
  });
  console.log('✅ 示例公告创建成功');

  // 4. 创建示例相册
  console.log('📸 创建示例相册...');
  const album1 = await prisma.album.create({
    data: {
      title: '开学第一天',
      description: '记录我们开学第一天的美好时光'
    }
  });
  
  const album2 = await prisma.album.create({
    data: {
      title: '运动会精彩瞬间',
      description: '班级运动会上同学们的精彩表现'
    }
  });
  console.log('✅ 示例相册创建成功');

  // 5. 创建示例成员
  console.log('👥 创建示例成员...');
  await prisma.member.createMany({
    data: [
      {
        name: '张老师',
        role: 'teacher',
        position: '班主任兼语文老师',
        bio: '从教15年，热爱教育事业，关心每一位学生的成长',
        order: 1
      },
      {
        name: '李老师',
        role: 'teacher',
        position: '数学老师',
        bio: '数学教学经验丰富，善于启发学生思维',
        order: 2
      },
      {
        name: '王老师',
        role: 'teacher',
        position: '英语老师',
        bio: '英语专业八级，注重培养学生的英语实际应用能力',
        order: 3
      }
    ]
  });
  console.log('✅ 示例成员创建成功');

  // 6. 创建示例课程表
  console.log('📅 创建示例课程表...');
  const scheduleData = [];
  const subjects = [
    ['语文', '数学', '英语', '物理', '体育', '化学', '生物', '历史'],
    ['数学', '英语', '语文', '化学', '物理', '音乐', '地理', '政治'],
    ['英语', '语文', '数学', '生物', '历史', '体育', '物理', '美术'],
    ['数学', '物理', '英语', '语文', '化学', '生物', '信息', '班会'],
    ['语文', '英语', '数学', '地理', '政治', '历史', '体育', '自习']
  ];
  
  const teachers = ['张老师', '李老师', '王老师', '赵老师', '钱老师', '孙老师', '周老师', '吴老师'];
  const times = [
    ['08:00', '08:45'],
    ['08:55', '09:40'],
    ['10:00', '10:45'],
    ['10:55', '11:40'],
    ['14:00', '14:45'],
    ['14:55', '15:40'],
    ['15:50', '16:35'],
    ['16:45', '17:30']
  ];

  for (let day = 1; day <= 5; day++) {
    for (let period = 1; period <= 8; period++) {
      scheduleData.push({
        dayOfWeek: day,
        period: period,
        subject: subjects[day - 1][period - 1],
        teacher: teachers[period - 1],
        startTime: times[period - 1][0],
        endTime: times[period - 1][1]
      });
    }
  }

  await prisma.schedule.createMany({ data: scheduleData });
  console.log('✅ 示例课程表创建成功');

  // 7. 创建示例作业
  console.log('📝 创建示例作业...');
  const today = new Date();
  await prisma.homework.createMany({
    data: [
      {
        date: today,
        subject: '语文',
        content: '完成课文《背影》的阅读理解题，背诵第二段',
        deadline: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        date: today,
        subject: '数学',
        content: '完成练习册第15-17页，重点掌握二次函数的应用',
        deadline: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)
      },
      {
        date: today,
        subject: '英语',
        content: '背诵Unit 3单词，完成课后练习题1-5',
        deadline: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
      }
    ]
  });
  console.log('✅ 示例作业创建成功');

  // 8. 创建示例荣誉
  console.log('🏆 创建示例荣誉...');
  await prisma.honor.createMany({
    data: [
      {
        title: '校运动会团体第一名',
        description: '在学校运动会上，我们班同学团结协作，取得了团体总分第一名的好成绩',
        date: new Date('2024-10-15'),
        category: '体育'
      },
      {
        title: '优秀班集体',
        description: '因班级管理规范、学习氛围浓厚，被评为本学期优秀班集体',
        date: new Date('2024-09-01'),
        category: '综合'
      },
      {
        title: '数学竞赛团体二等奖',
        description: '在市级数学竞赛中，我班多名同学获奖，班级获得团体二等奖',
        date: new Date('2024-11-01'),
        category: '学科'
      }
    ]
  });
  console.log('✅ 示例荣誉创建成功');

  // 9. 创建示例留言
  console.log('💬 创建示例留言...');
  await prisma.message.createMany({
    data: [
      {
        nickname: '小明妈妈',
        content: '感谢老师们的辛勤付出，孩子在这个班级很开心！'
      },
      {
        nickname: '小红',
        content: '我们班级真棒！希望大家一起努力，取得更好的成绩！'
      },
      {
        nickname: '小刚爸爸',
        content: '班级网站做得很好，方便了解孩子的学习情况，点赞！'
      }
    ]
  });
  console.log('✅ 示例留言创建成功');

  console.log('');
  console.log('🎉 种子数据添加完成！');
  console.log('');
  console.log('📋 默认管理员账号信息：');
  console.log('   用户名: admin');
  console.log('   密码: admin123');
  console.log('');
  console.log('⚠️  生产环境请立即修改默认密码！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据添加失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
