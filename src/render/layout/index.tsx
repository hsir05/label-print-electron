import React, { useState } from 'react';
import {
  HomeOutlined,
  WindowsOutlined,
  DatabaseOutlined,
  ExceptionOutlined,
  SplitCellsOutlined,
} from "@ant-design/icons";
import type { MenuProps } from 'antd';
import { Layout, Menu, theme } from "antd";
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Content, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

const items: MenuItem[] = [
  getItem("首页", "/main", <HomeOutlined />),
  getItem("SN码打印", "/print", <SplitCellsOutlined />),
//   getItem("历史记录", "/history", <WindowsOutlined />),
//   getItem("数据维护", "/db", <DatabaseOutlined />),
//   getItem("WiFi MAC对应表", "/record", <ExceptionOutlined />),
];
const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  // admin1 1q2w3e4r
  // admin2 1a2s3d4f
  // admin3 1z2x3c4v
  // dev 1q2w3e4r


  const location = useLocation();
  const navigate = useNavigate();

  const menuOnSelect = ({ key }: any) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="light"
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Menu
          onSelect={menuOnSelect}
          selectedKeys={[location.pathname]}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: "12px" }}>
          <div
            style={{
              padding: 12,
              minHeight: "100%",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;