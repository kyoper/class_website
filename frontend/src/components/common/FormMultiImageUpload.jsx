import { useState, useEffect } from 'react';
import { Upload, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function FormMultiImageUpload({ value = [], onChange, maxCount = 10 }) {
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // 初始化时将value转换为fileList格式
  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      const list = value.map((url, index) => ({
        uid: `-${index}`,
        name: `image-${index}`,
        status: 'done',
        url: url,
      }));
      setFileList(list);
    } else {
      setFileList([]);
    }
  }, [value]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // 处理上传的文件
    const uploadedUrls = [];
    
    for (const file of newFileList) {
      if (file.status === 'done' && file.url) {
        // 已经上传的文件
        uploadedUrls.push(file.url);
      } else if (file.originFileObj) {
        // 新上传的文件，转换为base64或上传到服务器
        try {
          const base64 = await getBase64(file.originFileObj);
          uploadedUrls.push(base64);
          // 更新文件状态
          file.url = base64;
          file.status = 'done';
        } catch (error) {
          console.error('处理图片失败:', error);
        }
      }
    }

    // 通知Form更新值
    onChange?.(uploadedUrls);
  };

  const handleRemove = (file) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    
    const urls = newFileList
      .filter(f => f.url)
      .map(f => f.url);
    onChange?.(urls);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        beforeUpload={(file) => {
          const isImage = file.type.startsWith('image/');
          if (!isImage) {
            message.error('只能上传图片文件');
            return Upload.LIST_IGNORE;
          }
          const isLt5M = file.size / 1024 / 1024 < 5;
          if (!isLt5M) {
            message.error('图片大小不能超过 5MB');
            return Upload.LIST_IGNORE;
          }
          return false; // 阻止自动上传，手动处理
        }}
        maxCount={maxCount}
        multiple
        accept="image/*"
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
}

export default FormMultiImageUpload;
