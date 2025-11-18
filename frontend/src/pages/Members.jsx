import { useEffect, useState } from 'react';
import { Card, Spin, Empty, Tabs } from 'antd';
import { memberAPI } from '../services/api';

function Members() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await memberAPI.getList();
      const members = response.data.members;
      
      setTeachers(members.filter(m => m.role === 'teacher'));
      setStudents(members.filter(m => m.role === 'student'));
    } catch (error) {
      console.error('获取成员失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const MemberCard = ({ member }) => (
    <Card hoverable className="text-center">
      <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
        {member.avatar ? (
          <img src={member.avatar} alt={member.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          '👤'
        )}
      </div>
      <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
      {member.position && (
        <p className="text-sm text-primary-600 mb-2">{member.position}</p>
      )}
      {member.bio && (
        <p className="text-sm text-gray-600">{member.bio}</p>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold mb-8">班级成员</h1>

      <Tabs
        defaultActiveKey="teachers"
        items={[
          {
            key: 'teachers',
            label: '教师团队',
            children: (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {teachers.length === 0 ? (
                  <Empty description="暂无教师信息" />
                ) : (
                  teachers.map((teacher) => (
                    <MemberCard key={teacher.id} member={teacher} />
                  ))
                )}
              </div>
            ),
          },
          {
            key: 'students',
            label: '学生成员',
            children: (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {students.length === 0 ? (
                  <Empty description="暂无学生信息" />
                ) : (
                  students.map((student) => (
                    <MemberCard key={student.id} member={student} />
                  ))
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

export default Members;
