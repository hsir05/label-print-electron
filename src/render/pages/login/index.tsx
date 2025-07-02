import { Button, Form, Input, message } from "antd";
import React from "react";
import type { FormProps } from "antd";
import { useNavigate } from "react-router-dom";
import img2 from "../../../bg.png"
// import logo from "../../../icon.png"

type FieldType = {
    account?: string;
    password?: string;
};

const Login = () => {
    const navigate = useNavigate();
    const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
        try {
            const now = new Date();
            const month = now.getMonth() + 1;
            const day = now.getDate();
            if (month > 7 || (month === 7 && day > 16)) {
                message.error("体验版已到期，暂无法登录!");
                return;
            }

            if (
                (values.account === "admin1" && values.password === "1q2w3e4r") ||
                (values.account === "admin2" && values.password === "1a2s3d4f") ||
                (values.account === "dev" && values.password === "1q2w3e4r")
            ) {
                message.success("登录成功!");
                sessionStorage.setItem("token", `token${new Date().getTime()}`);
                sessionStorage.setItem(
                    "user",
                    JSON.stringify({
                        username: values.account,
                        role: values.account,
                    }),
                );

                switch (values.account) {
                    case "admin1":
                        navigate("/main");
                        break;
                    case "admin2":
                        navigate("/print");
                        break;
                    default:
                        navigate("/main");
                        break;
                }
            } else {
                message.error("账号或密码错误");
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "linear-gradient(120deg, #d7e2fe 0%, #d7e2fe 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            margin: "0 auto",
            background: "#fff",
            display: "flex",
            borderRadius: 12,
            overflow: "hidden",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
          }}
        >
          {/* 左侧插画 */}
          <div>
            <img
              src={img2}
              alt="illustration"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>
          {/* 右侧登录卡片 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "-20px",
            }}
          >
            <div
              style={{
                width: 420,
                padding: "10px 54px 24px 24px",
                borderRadius: 12,
              }}
            >
              <h2
                style={{
                  textAlign: "center",
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#1976d2",
                  marginBottom: 22,
                  letterSpacing: 2,
                }}
              >
                欢迎登录
              </h2>
              {/* <div className="">
                <img src={logo} alt="" />
              </div> */}
              <Form
                name="basic"
                style={{ width: "100%" }}
                size="large"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item<FieldType>
                  name="account"
                  rules={[{ required: true, message: "请输入账号!" }]}
                >
                  <Input placeholder="请输入账号" allowClear maxLength={20} />
                </Form.Item>
                <Form.Item<FieldType>
                  name="password"
                  rules={[{ required: true, message: "请输入密码!" }]}
                >
                  <Input.Password
                    placeholder="请输入密码"
                    allowClear
                    maxLength={20}
                  />
                </Form.Item>
                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      width: "100%",
                      borderRadius: 6,
                      background: "#2196f3",
                      border: "none",
                      fontWeight: 600,
                      letterSpacing: 2,
                      boxShadow: "0 2px 8px 0 rgba(116,235,213,0.12)",
                      transition: "all 0.2s",
                    }}
                    size="large"
                  >
                    立即登录
                  </Button>
                </Form.Item>
              </Form>

              <p style={{ textAlign: "center", fontSize: "14px" }}>
                体验版 体验截至时间2025年7月16号
              </p>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Login;
