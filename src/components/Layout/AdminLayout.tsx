import React from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { 
  ScissorOutlined, 
  ShopOutlined, 
  UserOutlined, 
  SettingOutlined, 
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/hairstyles',
      icon: <ScissorOutlined />,
      label: 'Hairstyle Library',
    },
    {
      key: '/shops',
      icon: <ShopOutlined />,
      label: 'Shops (Demo)',
      disabled: true,
    },
    {
      key: '/stylists',
      icon: <UserOutlined />,
      label: 'Stylists (Demo)',
      disabled: true,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings (Demo)',
      disabled: true,
    },
  ];

  return (
    <Layout className="h-screen w-full">
      <Sider trigger={null} collapsible collapsed={collapsed} className="bg-slate-900">
        <div className="h-16 flex items-center justify-center bg-slate-950 text-white font-bold text-lg overflow-hidden whitespace-nowrap">
          {collapsed ? 'HM' : 'HairMatch Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="bg-white p-0 flex justify-between items-center shadow-sm z-10">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg w-16 h-16"
          />
          <div className="pr-6">
             <Dropdown 
                menu={{ 
                  items: [{ 
                    key: 'logout', 
                    label: 'Logout', 
                    icon: <LogoutOutlined />,
                    onClick: handleLogout 
                  }] 
                }}
             >
               <div className="cursor-pointer flex items-center gap-2 hover:bg-gray-50 p-2 rounded transition-colors">
                  <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                  <span className="font-medium text-gray-700">Admin</span>
               </div>
             </Dropdown>
          </div>
        </Header>
        <Content
          className="m-6 p-6 bg-white rounded-lg shadow-sm overflow-auto"
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
