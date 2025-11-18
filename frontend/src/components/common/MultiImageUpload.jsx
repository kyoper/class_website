import { useState } from 'react';
import { Upload, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';

function MultiImageUpload({ onSuccess, maxCount = 10 }) {
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择图片');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('images', file.originFileObj);
    });

    try {
      const response = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success) {
        message.success(`成功上传 ${response.data.files.length} 张图片`);
        setFileList([]);
        onSuccess?.(response.data.files);
      }
    } catch (error) {
      console.error('上传失败:', error);
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>选择图片</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
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
          return false; // 阻止自动上传
        }}
        maxCount={maxCount}
        multiple
        accept="image/*"
        itemRender={(originNode, file, fileList, actions) => {
          return (
            <div className="relative inline-block">
              <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors" style={{ width: 104, height: 104 }}>
                <img
                  src={file.thumbUrl || file.url}
                  alt={file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onClick={() => handlePreview(file)}
                  className="cursor-pointer"
                />
              </div>
              
              {/* 删除按钮 - 移动端友好 */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.remove();
                }}
                className="absolute top-1 right-1 w-8 h-8 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg z-10 transition-all"
                title="删除图片"
                style={{ minWidth: '32px', minHeight: '32px' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          );
        }}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      {fileList.length > 0 && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400 font-medium transition-all shadow-md"
          style={{ minHeight: '44px' }}
        >
          {uploading ? '上传中...' : `上传 ${fileList.length} 张图片`}
        </button>
      )}
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
}

export default MultiImageUpload;
