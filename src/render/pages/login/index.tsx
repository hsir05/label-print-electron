import { Button, Checkbox, Form, Input } from "antd";
import React, { useEffect } from "react";
import type { FormProps } from "antd";

type FieldType = {
  username?: string;
  password?: string;
};
const Login = () => {
  
  
    useEffect(() => {
    
  }, []);

  const onFinish: FormProps<FieldType>["onFinish"] = async(values) => {
    console.log("Success:", values);

    let res = await window.electronAPI.sqQuery({
      sql: `SELECT * FROM users WHERE username = ${values.username} AND password = ${values.password};`,
      params: [],
    });
    console.log(res);
    
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  const queryHandle = async () => {
    let res = await window.electronAPI.sqQuery({
      sql: `SELECT * FROM history`,
      params: [],
    });
    
  };
  const styleObj = {
    width: 500,
    position:  "absolute",
    top: "40%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    border:'1px solid #ccc',
    padding:'25px 45px 25px 25px',
    borderRadius: '8px',
  };

  return (
    <div
      className="login-page"
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      <Form
        name="basic" 
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        style={styleObj} size="large"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <h3 style={{ width: "100%", textAlign: "center" }}>
          欢迎登录
        </h3>
        <Form.Item<FieldType>
          label="账号"
          name="username"
          rules={[{ required: true, message: "请输入用户名!" }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item<FieldType>
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入密码!" }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit" style={{width: "100%",}}>
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
