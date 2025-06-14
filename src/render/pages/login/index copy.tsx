import { Button,Form, Input, message } from "antd";
import React from "react";
import type { FormProps } from "antd";
import { useNavigate } from "react-router-dom";

type FieldType = {
  account?: string;
  password?: string;
};
const Login = () => {
     const navigate = useNavigate();
  const onFinish: FormProps<FieldType>["onFinish"] = async(values) => {
    try {
        let res = await window.electronAPI.sqQuery({
          sql: `SELECT * FROM users WHERE account = '${values.account}' AND password = '${values.password}'`,
          params: [],
        });
        console.log(res);
        if (res.length > 0) {
          message.success("登录成功!");
          sessionStorage.setItem("token", `token${new Date().getTime()}`);
          
          const user= res[0];
            
        //   await window.electronAPI.sqDelete({table: "users", condition: 'status = "1"'})

          sessionStorage.setItem(
            "user",
            JSON.stringify({ username: values.account, role: user.account }),
          );

          navigate("/main");
        } else {
            message.error("账号或密码错误");
        }
    } catch (err) {
        console.log(err);
    }
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
        autoComplete="off"
      >
        <h3 style={{ width: "100%", textAlign: "center" }}>
          欢迎登录
        </h3>
        <Form.Item<FieldType>
          label="账号"
          name="account"
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
