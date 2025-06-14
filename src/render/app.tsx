import React from "react"
import Layout from "./layout"
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout />
    </ConfigProvider>
  );
}

export default App