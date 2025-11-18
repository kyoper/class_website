import { useState } from 'react';
import { Upload, message, Modal, Image } from 'antd';
import { PlusOutlined, LoadingOutlined, CloseCircleOutlined } from '@ant-design/icons';
import api from '../../services/api';

function ImageUpload({ value, onChange, maxCount = 1 }) {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        const imageUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000'}${response.data.url}`;
        onSuccess(response.data);
        onChange?.(imageUrl);
        message.success('图片上传成功');
      }
    } catch (error) {
      console.error('上传失败:', error);
      onError(error);
      message.error('图片上传失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange?.('');
    message.success('图片已删除');
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  // 如果有图片，显示自定义预览（移动端友好）
  if (value) {
    return (
      <div className="relative inline-block">
        <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors" style={{ width: 104, height: 104 }}>
          <Image
            src={value}
            alt="上传的图片"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            preview={{
              mask: (
                <div className="flex items-center justify-center gap-1 text-xs">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  预览
                </div>
              )
            }}
          />
        </div>
        
        {/* 删除按钮 - 移动端友好 */}
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-1 right-1 w-8 h-8 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-all"
          title="删除图片"
          style={{ minWidth: '32px', minHeight: '32px' }}
        >
          <CloseCircleOutlined className="text-base" />
        </button>
      </div>
    );
  }

  // 没有图片时显示上传按钮
  return (
    <Upload
      listType="picture-card"
      showUploadList={false}
      customRequest={handleUpload}
      maxCount={maxCount}
      accept="image/*"
      beforeUpload={(file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
          message.error('只能上传图片文件');
          return false;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
          message.error('图片大小不能超过 5MB');
          return false;
        }
        return true;
      }}
    >
      {uploadButton}
    </Upload>
  );
}

export default ImageUpload;
