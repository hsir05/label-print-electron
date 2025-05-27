import React from "react";
import type { FormProps } from "antd";
import { Button, Form, Input, Col, Row, Select } from "antd";
import JsBarcode from "jsbarcode";

const { Option } = Select;

const Main = () => {

    const [form] = Form.useForm();

    type FieldType = {
        pcba?: string;
        category?: string;
        specifications?: string;
        series?: string;
        productionId?: string;
        zzc?: string;
        year?: string;
        week?: string;
        country?: string;
        serialNumber?: string;
    };

    const PCBAData = [
        { value: '1', label: 'A厂' }
    ]

    const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
        console.log("Success:", values);
    };
    const onReset = () => {
        console.log(form);
        form.resetFields();
    };
    const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
        errorInfo,
    ) => {
        console.log("Failed:", errorInfo);
    };

    const onGenderChange = (value: string) => {
        console.log(value);

    }

    const createBarCode = () => {
        JsBarcode("#barcode", "601211KBD0000018", {
            format: "CODE128",
            lineColor: "#000",
            width: 1.3,
            height: 40,
            displayValue: true,
        });
    }

    const printLabel = async() => {
        try {
            const element = document.getElementById("label-designer");
            const html = `
                <!DOCTYPE html>
                <html>
                <body>${element?.outerHTML}</body>
                </html> `;

            // 准备打印选项

            // // 调用主进程的打印方法  window.electronAPI.printDomElement
            const success = await window.electronAPI.printDomElement(html);
            if (!success) throw new Error("打印失败");
            console.log("打印结果:", success);
        } catch (error) {
            console.error("打印出错:", error);
        }
    }

    return (
        <div className="">
            <h2>SN码生成</h2>
            <Form
                name="basic" form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                initialValues={{ remember: true }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="РСВА厂"
                            name="pcba"
                            rules={[{ required: true, message: "请选择РСВА厂" }]}>
                            <Select
                                placeholder="请选择РСВА厂"
                                onChange={onGenderChange}
                                allowClear
                            >
                                {
                                    PCBAData.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.label}</Option>
                                    })
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="组装厂"
                            name="zzc"
                            rules={[{ required: true, message: "请输入组装厂" }]}
                        >
                            <Input value={'0'} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="产品类别"
                            name="category"
                            rules={[{ required: true, message: "请选择产品类别" }]}>
                            <Select
                                placeholder="请选择产品类别"
                                onChange={onGenderChange}
                                allowClear
                            >
                                <Option value="male">male</Option>
                                <Option value="female">female</Option>
                                <Option value="other">other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="产品规格"
                            name="specifications"
                            rules={[{ required: true, message: "请选择产品规格" }]}>
                            <Select
                                placeholder="请选择产品规格"
                                onChange={onGenderChange}
                                allowClear
                            >
                                <Option value="male">male</Option>
                                <Option value="female">female</Option>
                                <Option value="other">other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="产品代系"
                            name="series"
                            rules={[{ required: true, message: "请选择产品代系" }]}>
                            <Select
                                placeholder="请选择产品代系"
                                onChange={onGenderChange}
                                allowClear
                            >
                                <Option value="male">male</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="产品序列号"
                            name="productionId"
                            rules={[{ required: true, message: "请选择产品序列号" }]}>
                            <Select
                                placeholder="请选择产品序列号"
                                onChange={onGenderChange}
                                allowClear
                            >
                                <Option value="male">male</Option>
                                <Option value="female">female</Option>
                                <Option value="other">other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="年"
                            name="year"
                            rules={[{ required: true, message: "请选择年" }]}>
                            <Select
                                placeholder="请选择年"
                                onChange={onGenderChange}
                                allowClear
                            >
                                <Option value="male">male</Option>
                                <Option value="female">female</Option>
                                <Option value="other">other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="周"
                            name="week"
                            rules={[{ required: true, message: "请选择周" }]}>
                            <Select
                                placeholder="请选择周"
                                onChange={onGenderChange}
                                allowClear
                            >
                                <Option value="male">male</Option>
                                <Option value="female">female</Option>
                                <Option value="other">other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="国别"
                            name="country"
                            rules={[{ required: true, message: "请选择国别" }]}>
                            <Select
                                placeholder="请选择国别"
                                onChange={onGenderChange}
                                allowClear
                            >
                                <Option value="male">male</Option>
                                <Option value="female">female</Option>
                                <Option value="other">other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item<FieldType>
                            label="流水号"
                            name="serialNumber"
                            rules={[{ required: true, message: "请选择流水号" }]}>
                            <Select
                                placeholder="请选择流水号"
                                onChange={onGenderChange}
                                allowClear
                            >
                                <Option value="male">male</Option>
                                <Option value="female">female</Option>
                                <Option value="other">other</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">生成 </Button>
                    <Button type="primary" onClick={onReset} style={{ marginLeft: 8 }}>重置 </Button>
                </Form.Item>
            </Form>
            <h2>SN码预览</h2>
            <Button type="primary" onClick={createBarCode}>生成条码 </Button>
            <Button type="primary" onClick={createBarCode}>选择打印机 </Button>
            <Button type="primary" onClick={printLabel}>打印</Button>

            <div id="label-designer">
                <canvas id="barcode" width="200" height="100"></canvas>
            </div>
        </div>

    );
};

export default Main;
