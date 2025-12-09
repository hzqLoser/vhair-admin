import React from 'react';
import { Form, Input, Button, Card, App as AntdApp } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginApi } from '../../api/auth';
import { LoginRequest } from '../../api/types';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { message } = AntdApp.useApp();

  const { mutate: doLogin, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      message.success('Login Successful');
      login(data.token);
      navigate('/hairstyles');
    },
    // Error is handled globally in apiClient but we can add local handling if needed
  });

  const onFinish = (values: LoginRequest) => {
    doLogin(values);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center bg-[url('https://picsum.photos/1920/1080?blur=2')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      
      <Card
        className="w-full max-w-md shadow-2xl z-10 rounded-xl"
        variant="borderless"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">HairMatch</h1>
          <p className="text-gray-500 mt-2">Administrator Login</p>
        </div>

        <Form
          name="login"
          initialValues={{ username: 'admin', password: '123456' }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Username" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Password" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 font-semibold"
              loading={isPending}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
