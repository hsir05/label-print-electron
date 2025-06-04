import {
    Button,
    Form,
    Input,
    Space,
    Checkbox,
    Col,
    Row,
    Select,
    Card,
    Tag,
    InputNumber,
} from "antd";
import type { FormProps } from "antd";

import React, { useEffect } from "react";

interface DataType {
    id: number;
    snCode: string;
    create_time: string;
    account: string;
    serial_number: number;
    num: number;
}
const Record = () => {
    const [form] = Form.useForm();
    type FieldType = {
      order: string;
    };
    const [data, setData] = React.useState<DataType[]>([]);

    useEffect(() => { }, []);

    const onFinish: FormProps<FieldType>["onFinish"] = async (values: any) => {
        console.log("Success:", values);
    };
    const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
        errorInfo: any,
    ) => {
        console.log("Failed:", errorInfo);
    };

    const queryHandle = async () => {
        let res = await window.electronAPI.sqQuery({
            sql: `SELECT * FROM history`,
            params: [],
        });
        setData(res);
    };

    return (
      <div className="">
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item<FieldType>
                name="order"
                label="订单号"
                noStyle
                rules={[{ required: true, message: "请输入订单号" }]}
              >
                <Input placeholder="请输入订单号" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item<FieldType>
                label="订单号"
                name="order"
                noStyle
                rules={[{ required: true, message: "请输入订单号" }]}
              >
                <Input placeholder="请输入订单号" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
};

export default Record;
