import {
    Button,
    Form,
    Input,
    Space,
    Col,
    Row,
    Card,
    InputNumber,
    message,
} from "antd";
import React, { useEffect } from "react";
import type { FormProps } from "antd";
import { openFile, exportToExcel } from "../../../common/db";
import JsBarcode from "jsbarcode";

const Print = () => {
    const [form] = Form.useForm();
    type FieldType = {
        width: number;
        height: number;
    };

    const [data, setData] = React.useState<string[]>([]);

    useEffect(() => {
        form.setFieldsValue({ width: 300, height: 120 });
    }, []);

    const onFinish: FormProps<FieldType>["onFinish"] = async (_: any) => { }


    const handleOpenFile = async () => {
        openFile()
            .then((res) => {
                if (res && res.length > 0) {
                    console.log(res);
                    let codeList = []
                    for (let key of res) {
                        codeList.push(key[1]);
                    }
                    console.log(codeList);
                    setData(codeList);
                }
            })
            .catch((err) => {
                console.error("Error opening file:", err);
            });
    };

    const batchPrint = async () => {
        for (let key of data) {
            console.log(key);
            createBarCode(key);
        }
    };
    const createBarCode = (snCode: string) => {
        JsBarcode("#barcode", snCode, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.3, //每个条形码线条的宽度（数值越大条越宽）
            height: 30, //条形码的高度（单位 px）
            displayValue: true,
            valid: (bool) => {
                if (bool) {
                   setTimeout(() => {
                    printLabel();
                   }, 400);
                } else {
                    message.error("条码生成失败");
                }
            },
        });
    };
    const printLabel = async () => {
        try {
            const canvas = document.getElementById("barcode") as HTMLCanvasElement;
            let imgHtml = "";
            if (canvas) {
                const dataUrl = canvas.toDataURL("image/png");
                imgHtml = `<img id="label" src="${dataUrl}" width="100%" height="100%"  />`;
            }
            const { width, height } = form.getFieldsValue(["width", "height"]);

            const html = `<!DOCTYPE html><html><style>@page {size:${width}mm ${height}mm;margin: 0;} body {margin: 0;padding: 0;}</style><body>${imgHtml}</body></html>`;
            const success = await window.electronAPI.printDomElement(
                html,
                width,
                height,
            );
            if (!success) throw new Error("打印失败");
            console.log("打印结果:", success);
        } catch (error) {
            console.error("打印出错:", error);
        }
    };

    const formBtn = (
        <Space>
            <Button type="primary" onClick={handleOpenFile}>
                上传
            </Button>
            <Button type="primary" onClick={batchPrint}>
                打印
            </Button>

            <Button type="primary" onClick={() => { createBarCode("601211KBD0000018"); }}>
                打印测试
            </Button>
        </Space>
    );
    return (
        <div>
            <Card title="SN码打印" extra={formBtn}>
                <Form
                    name="basic"
                    form={form}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                >
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item<FieldType>
                                label="宽度"
                                name="width"
                                rules={[{ required: true, message: "请输入宽度" }]}
                            >
                                <InputNumber
                                    placeholder="请输入宽度"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item<FieldType>
                                label="高度"
                                name="height"
                                rules={[{ required: true, message: "请输入高度" }]}
                            >
                                <InputNumber
                                    placeholder="请输入高度"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <ul className="sncode-list">
                    {data.map((item, index) => {
                        return (
                            <li
                                key={index}
                                style={{
                                    marginBottom: "10px",
                                    marginRight: "10px",
                                    textAlign: "center",
                                }}
                            >
                                {item}
                            </li>
                        );
                    })}
                </ul>

                <div id="label-designer">
                    <canvas id="barcode" width="200" height="100"></canvas>
                </div>
            </Card>
        </div>
    );
};

export default Print;
