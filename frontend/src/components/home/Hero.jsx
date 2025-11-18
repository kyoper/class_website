import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import api from '../../services/api';

function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [classInfo, setClassInfo] = useState({
    name: '清水亭学校七（三）班',
    motto: '团结 · 奋进 · 创新 · 超越',
    backgroundImage: ''
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchClassInfo();
  }, []);

  const fetchClassInfo = async () => {
    try {
      const response = await api.get('/class-info');
      if (response.success && response.data.classInfo) {
        setClassInfo({
          name: response.data.classInfo.name || '清水亭学校七（三）班',
          motto: response.data.classInfo.motto || '团结 · 奋进 · 创新 · 超越',
          backgroundImage: response.data.classInfo.backgroundImage || ''
        });
      }
    } catch (error) {
      console.error('获取班级信息失败:', error);
    }
  };

  // 视差效果
  const parallaxOffset = scrollY * 0.5;

  return (
    <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
      {/* 背景图片 */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700"
        style={{
          transform: `translateY(${parallaxOffset}px)`,
          transition: 'transform 0.1s ease-out',
          backgroundImage: classInfo.backgroundImage ? `url(${classInfo.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 内容 */}
      <div className="relative h-full flex items-center justify-center">
        <div className="container text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {classInfo.name}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <p className="text-xl md:text-2xl lg:text-3xl font-light mb-8">
              {classInfo.motto}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <button
              onClick={() => {
                document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-blue-600 rounded-full font-medium hover:bg-blue-50 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              探索更多
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>

      {/* 底部波浪装饰 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 md:h-24"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
            fill="#fafafa"
          />
        </svg>
      </div>
    </section>
  );
}

export default Hero;
