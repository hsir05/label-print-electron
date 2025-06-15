import React, { useEffect } from "react"
import Layout from "./layout"
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useNavigate } from "react-router-dom";

const App = () => {
    const navigate = useNavigate();

    useEffect(() => {
        handle();
    }, [])
    const handle = () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        if (month > 7 || (month === 6 && day > 16)) {
            sessionStorage.clear()
            navigate("/login");
        }
    }
    return (
        <ConfigProvider locale={zhCN}>
            <Layout />
        </ConfigProvider>
    );
}

export default App