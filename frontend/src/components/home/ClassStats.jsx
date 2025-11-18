import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { albumAPI, honorAPI, memberAPI } from '../../services/api';

function ClassStats() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    members: 0,
    honors: 0,
    photos: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('class-stats');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, honorsRes, albumsRes] = await Promise.all([
          memberAPI.getList(),
          honorAPI.getList(),
          albumAPI.getList(),
        ]);

        const members = membersRes.data.members?.length || 0;
        const honors = honorsRes.data.honors?.length || 0;
        const photos =
          albumsRes.data.albums?.reduce((sum, album) => sum + (album._count?.photos || 0), 0) || 0;

        setStats({ members, honors, photos });
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    fetchStats();
  }, []);

  const displayStats = [
    {
      label: '班级人数',
      value: stats.members,
      suffix: '人',
      color: 'from-blue-500 to-blue-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: '班级荣誉',
      value: stats.honors,
      suffix: '项',
      color: 'from-yellow-500 to-orange-500',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      ),
    },
    {
      label: '精彩瞬间',
      value: stats.photos,
      suffix: '张',
      color: 'from-green-500 to-emerald-600',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <section id="class-stats" className="py-16 bg-white">
      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isVisible ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {displayStats.map((stat, index) => (
            <motion.div key={stat.label} variants={itemVariants} className="relative group">
              <div className="card hover:shadow-xl transition-all duration-300">
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.color} rounded-l-lg`} />
                <div className="flex items-center gap-4">
                  <div
                    className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    {stat.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
                    <div className="flex items-baseline gap-1">
                      <AnimatedNumber value={stat.value} isVisible={isVisible} className="text-3xl font-bold text-gray-900" />
                      <span className="text-lg text-gray-600">{stat.suffix}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function AnimatedNumber({ value, isVisible, className }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const duration = 1500;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * value);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, isVisible]);

  return <span className={className}>{displayValue}</span>;
}

export default ClassStats;
