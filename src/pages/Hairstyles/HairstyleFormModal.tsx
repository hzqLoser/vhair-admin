import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Upload, message, Button } from 'antd';
import { PlusOutlined, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminHairstyle, AdminCreateHairstyleRequest, AdminUpdateHairstyleRequest } from '../../api/types';
import { createHairstyleApi, updateHairstyleApi } from '../../api/hairstyles';
import { uploadImageApi } from '../../api/upload';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { compressCanvasImage, getCroppedImg } from '../../utils/cropImage';

interface Props {
  open: boolean;
  onClose: () => void;
  initialValues?: AdminHairstyle | null;
}

const { Option } = Select;
const { TextArea } = Input;

const HairstyleFormModal: React.FC<Props> = ({ open, onClose, initialValues }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const isEdit = !!initialValues;

  // Image Upload State
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Image Crop State
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect] = useState(3 / 4); // 3:4 ratio - fixed
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [tempFileUid, setTempFileUid] = useState<string | null>(null); // 保存临时文件的UID
  const [previousFileList, setPreviousFileList] = useState<UploadFile[]>([]);

  // Image Preview State
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Auto adjust initial zoom to fit image in crop area
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        // Calculate the optimal initial zoom to fit the entire image within the crop area
        // Based on image aspect ratio vs crop aspect ratio
        const imageAspect = img.width / img.height;
        const cropAspect = aspect;

        // For 3:4 ratio (cropAspect = 0.75)
        if (imageAspect >= cropAspect) {
          // Image is wider than crop ratio, fit height
          setZoom(1);
        } else {
          // Image is taller than crop ratio, fit width
          // Calculate zoom to make image width match crop area width
          setZoom(imageAspect / cropAspect);
        }
      };
      img.src = imageSrc;
    }
  }, [imageSrc, aspect]);

  // Reset form when opening/closing or changing initialValues
  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          tags: initialValues.tags, // Array works fine with Select mode="tags"
          imagePath: initialValues.imageUrl, // We need to store path but using URL for now as placeholder logic
        });

        // Setup initial image preview
        setFileList([{
          uid: '-1',
          name: 'current-image.png',
          status: 'done',
          url: initialValues.imageUrl,
        }]);
        setPreviousFileList([{
          uid: '-1',
          name: 'current-image.png',
          status: 'done',
          url: initialValues.imageUrl,
        }]);
      } else {
        form.resetFields();
        setFileList([]);
        setPreviousFileList([]);
      }
    }
  }, [open, initialValues, form]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createHairstyleApi,
    onSuccess: () => {
      message.success('Hairstyle created successfully');
      queryClient.invalidateQueries({ queryKey: ['hairstyles'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateHairstyleApi,
    onSuccess: () => {
      message.success('Hairstyle updated successfully');
      queryClient.invalidateQueries({ queryKey: ['hairstyles'] });
      onClose();
    },
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Ensure we have an image path (uploaded or existing)
      // Note: In a real app, 'imagePath' should be the relative ID/Key returned by upload,
      // not the full URL. This logic assumes the upload API returns the path we need.
      if (!values.imagePath && fileList.length === 0) {
        message.error("Please upload an image");
        return;
      }

      if (isEdit && initialValues) {
        const updateData: AdminUpdateHairstyleRequest = {
          id: initialValues.id,
          ...values,
        };
        updateMutation.mutate(updateData);
      } else {
        const createData: AdminCreateHairstyleRequest = {
          ...values,
          // Default heat if not provided
          heat: values.heat || 0,
        };
        createMutation.mutate(createData);
      }
    } catch (error) {
      console.error("Validation failed", error);
    }
  };

  // Handle File Selection and Open Crop Modal
  const handleFileSelect = (file: File) => {
    setPreviousFileList(fileList);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setOriginalFile(file);
      setCropModalVisible(true);
      // 使用当前时间戳作为临时ID
      setTempFileUid(Date.now().toString());
    };
    reader.readAsDataURL(file);
  };

  // Handle Crop Complete
  const handleCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Handle Crop Modal OK
  const handleCropModalOk = async () => {
    if (!croppedAreaPixels || !originalFile) {
      message.error('Please crop the image');
      return;
    }

    try {
      setUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);

      // Compress cropped canvas before upload to ensure it is under 400KB
      const compressedFile = await compressCanvasImage(croppedImage, originalFile, 400);

      // Upload compressed & cropped file
      const res = await uploadImageApi(compressedFile);
      setUploading(false);

      // Update Form Field for backend submission
      form.setFieldValue('imagePath', res.imagePath);

      // Update UI Preview
      setFileList([{
        uid: '1',
        name: compressedFile.name,
        status: 'done',
        url: res.imageUrl,
      }]);
      setPreviousFileList([{
        uid: '1',
        name: compressedFile.name,
        status: 'done',
        url: res.imageUrl,
      }]);

      setCropModalVisible(false);
      // 清空临时文件UID
      setTempFileUid(null);
      message.success('Image uploaded successfully');
    } catch (err) {
      setUploading(false);
      message.error('Image upload failed');
      console.error(err);
    }
  };

  // Handle Upload Preview
  const handlePreview = (file: UploadFile) => {
    setPreviewImage(file.url || '');
    setPreviewVisible(true);
  };

  // Handle Upload Change - Update file list
  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    // 当用户选择文件时，记录最后添加的临时文件的UID
    if (newFileList.length > fileList.length) {
      const newFile = newFileList[newFileList.length - 1];
      // 更新临时文件的UID为Ant Design分配的UID，防止取消时无法清除
      setTempFileUid(newFile.uid);
    }

    setFileList(newFileList);

    // If removed
    if (newFileList.length === 0) {
      form.setFieldValue('imagePath', null);
    }
  };

  // Handle crop modal cancel
  const handleCropModalCancel = () => {
    setCropModalVisible(false);
    // Reset crop-related states when canceling
    setImageSrc('');
    setOriginalFile(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    // Clear the temporary file that was selected but not cropped and restore previous preview
    if (tempFileUid) {
      const updatedFileList = fileList.filter(file => file.uid !== tempFileUid);
      const fallbackFileList = updatedFileList.length > 0 ? updatedFileList : previousFileList;
      setFileList(fallbackFileList);
      setPreviousFileList(fallbackFileList);

      // If we're creating a new hairstyle and removed all files, clear the value
      if (!initialValues && fallbackFileList.length === 0) {
        form.setFieldValue('imagePath', null);
      }
    } else if (previousFileList.length) {
      setFileList(previousFileList);
      setPreviousFileList(previousFileList);
    }

    // 清空临时文件UID
    setTempFileUid(null);
  };

  const uploadButton = (
    <button style={{ border: 0, background: 'none' }} type="button">
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <>
      <Modal
        title={isEdit ? "Edit Hairstyle" : "Create New Hairstyle"}
        open={open}
        onCancel={onClose}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ gender: 'Female', category: 'long', heat: 0 }}
        >
          <div className="flex gap-6">
            <div className="flex-1">
              <Form.Item
                name="name"
                label="Name"
                rules={[{ required: true, message: 'Please enter name' }]}
              >
                <Input placeholder="e.g. Layered Bob" />
              </Form.Item>

              <div className="flex gap-4">
                <Form.Item
                  name="gender"
                  label="Gender"
                  className="flex-1"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="Male">Male</Option>
                    <Option value="Female">Female</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Category"
                  className="flex-1"
                  rules={[{ required: true }]}
                >
                  <Select>
                    <Option value="long">Long</Option>
                    <Option value="short">Short</Option>
                    <Option value="curly">Curly</Option>
                    <Option value="straight">Straight</Option>
                    <Option value="color">Color</Option>
                  </Select>
                </Form.Item>
              </div>
            </div>

            <div className="w-32">
              <Form.Item
                label="Image"
                required
                // We use a hidden input to validate presence of imagePath
                name="imagePath"
                style={{ marginBottom: 0 }}
                rules={[{ required: true, message: 'Image required' }]}
              >
                <Input type="hidden" />
              </Form.Item>
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={true}
                maxCount={1}
                fileList={fileList}
                onChange={handleUploadChange}
                onPreview={handlePreview}
                beforeUpload={(file) => {
                  // Handle file selection here
                  handleFileSelect(file);
                  return false; // Prevent automatic upload
                }}
              >
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </div>
          </div>

          <Form.Item
            name="tags"
            label="Tags"
            tooltip="Press enter to add tags"
          >
            <Select mode="tags" placeholder="e.g. summer, trendy" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="heat" label="Heat (Sort Order)">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Crop Modal */}
      <Modal
        title="Crop Image (3:4 Ratio)"
        open={cropModalVisible}
        onCancel={handleCropModalCancel}
        // Remove default footer to customize layout
        footer={null}
        width={900} // Increase modal width for better layout
        destroyOnClose
        zIndex={10000}
        // Add padding to prevent content from touching modal edges
        bodyStyle={{ padding: '20px', overflow: 'visible' }}
      >
        <div className="flex flex-col items-center gap-6">
          {/* Use fixed size container with proper aspect ratio */}
          <div className="w-full bg-white rounded-lg overflow-hidden shadow-lg">
            {/* Fixed aspect ratio container for 3:4 */}
            <div className="relative pb-[75%] h-0">
              {imageSrc && (
                <div className="absolute inset-0">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                    // Set container height explicitly
                    style={{ containerStyle: { height: '100%', width: '100%' } }}
                    // Enable mouse wheel zoom
                    zoomWithScroll={true}
                  />
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center max-w-2xl px-4">
            Drag to move the crop area, use mouse wheel to zoom. The image will be cropped to 3:4 ratio.
          </p>

          {/* Custom button layout at the bottom */}
          <div className="flex justify-end gap-4 w-full max-w-3xl pt-4 border-t border-gray-200">
            <Button onClick={handleCropModalCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleCropModalOk}
              loading={uploading}
              icon={<UploadOutlined />}
            >
              Upload Cropped Image
            </Button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="auto"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: 0,
          margin: 0,
          minWidth: '300px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          zIndex: 10000
        }}
        bodyStyle={{
          padding: '0',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
        maskStyle={{ backgroundColor: 'transparent' }}
        wrapStyle={{ backgroundColor: 'transparent' }}
        closable={false}
        maskClosable={true}
        transitionName=""
        maskTransitionName=""
        destroyOnClose={true}
      >
        <img
          alt="Preview"
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain'
          }}
          src={previewImage}
        />
      </Modal>
    </>
  );
};

export default HairstyleFormModal;
