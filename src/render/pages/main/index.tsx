import React, { useState, useEffect } from "react";
import type { FormProps } from "antd";
import { Button, Form, Input, Space, Checkbox, Col, Row, Select } from "antd";
import { sqQuery } from "../../../common/db";
import JsBarcode from "jsbarcode";
import { getISOWeek } from "date-fns";
import "./index.less";

const { Option } = Select;

interface DataType {
    id: number;
    label: string;
    value: string;
}

const Main = () => {
    const [form] = Form.useForm();

    const [PCBAData, setPCBAData] = React.useState<DataType[]>([]);
    const [categoryData, setCategoryData] = React.useState<DataType[]>([]);
    const [specificationsData, setSpecificationsData] = React.useState<DataType[]>([]);
    const [seriesData, setSeriesData] = React.useState<DataType[]>([]);
    const [productionIdData, setProductionIdData] = React.useState<DataType[]>([]);
    const [countryData, setCountryData] = React.useState<DataType[]>([]);
    const [yearData, setYearData] = React.useState<DataType[]>([]);
    const [weekData, setWeekData] = React.useState<DataType[]>([]);
    const [yearDisabled, setYearDisabled] = React.useState<boolean>(false);
    const [weekDisabled, setWeekDisabled] = React.useState<boolean>(false);
    const [snCode, setSnCode] = React.useState<string>("");

    type FieldType = {
        pcba?: string;
        category?: string;
        specifications?: string;
        series?: string;
        productionId?: string;
        zzc?: string;
        checkboxYear?: Boolean;
        year?: string;
        checkboxWeek?: Boolean;
        week?: string;
        country?: string;
        serialNumber?: string;
    };

    useEffect(() => {
        queryHandle("pcba");
        queryHandle("category");
        queryHandle("specifications");
        queryHandle("series");
        queryHandle("productionId");
        queryHandle("country");
        queryHandle("year");
        queryHandle("week");

    }, []);

    const handleYear = (data: DataType[]) => {
        const year = new Date().getFullYear();
        const currentYear = data.find((item: DataType) => item.label === year.toString());
        if (currentYear) {
            form.setFieldsValue({
                year: currentYear.value,
            });
        }
    }

    const handleWeek = (data: DataType[]) => {
        const week = getISOWeek(new Date());
        const currentWeek = data.find(
            (item: DataType) => item.label === week.toString(),
        );
        if (currentWeek) {
            form.setFieldsValue({
                week: currentWeek.value,
            });
        }
    };

    const onFinish: FormProps<FieldType>["onFinish"] = (values: any) => {
        console.log("Success:", values);
        const snCode = `${values.pcba}${values.category}${values.specifications}${values.series}${values.productionId}${values.year || ""}${values.week || ""}${values.country}`;
        console.log("SN码:", snCode);
        setSnCode(snCode);
    };
    const onReset = () => {
        console.log(form);
        form.resetFields();

        handleYear(yearData);
        handleWeek(weekData);
    };
    const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo: any,) => {
        console.log("Failed:", errorInfo);
        setSnCode("601211KBD0000018");
    };

    const onGenderChange = (value: string) => {
        console.log(value);
    };

    const createBarCode = (snCode: string = "601211KBD0000018") => {
        JsBarcode("#barcode", snCode, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.3,
            height: 40,
            displayValue: true,
        });
    };

    const printLabel = async () => {
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
    };
    const queryHandle = (tableName: string) => {
        sqQuery({
            sql: `SELECT * FROM ${tableName}`,
            params: [],
        }).then((res: any) => {
            switch (tableName) {
                case "pcba":
                    setPCBAData(res);
                    break;
                case "category":
                    setCategoryData(res);
                    break;
                case "specifications":
                    setSpecificationsData(res);
                    break;
                case "series":
                    setSeriesData(res);
                    break;
                case "productionId":
                    setProductionIdData(res);
                    break;
                case "country":
                    setCountryData(res);
                    break;
                case "year":
                    setYearData(res);
                    handleYear(res);
                    break;
                case "week":
                    setWeekData(res);
                    handleWeek(res);
                    break;
                default:
                    break;
            }
        });
    };
    const onYearCheck = (e: any) => {
        setYearDisabled(e.target.checked);
    }
    const onYearChange = (value: string) => {
        form.setFieldsValue({
            year: value,
        });
    };
    const onWeekCheck = (e: any) => {
        setWeekDisabled(e.target.checked);
    };
    const onWeekChange = (value: string) => {
        form.setFieldsValue({
            week: value,
        });
    };

    return (
        <div className="page">
            <h2>SN码生成</h2>
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
                            label="РСВА厂"
                            name="pcba"
                            rules={[{ required: true, message: "请选择РСВА厂" }]}
                        >
                            <Select placeholder="请选择РСВА厂" allowClear>
                                {PCBAData.map((item, index) => {
                                    return (
                                        <Option value={item.value} key={index}>
                                            {item.label}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item<FieldType>
                            label="产品类别"
                            name="category"
                            rules={[{ required: true, message: "请选择产品类别" }]}
                        >
                            <Select placeholder="请选择产品类别" allowClear>
                                {categoryData.map((item, index) => {
                                    return (
                                        <Option value={item.value} key={index}>
                                            {item.label}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item<FieldType>
                            label="产品规格"
                            name="specifications"
                            rules={[{ required: true, message: "请选择产品规格" }]}
                        >
                            <Select
                                placeholder="请选择产品规格"
                                onChange={onGenderChange}
                                allowClear
                            >
                                {specificationsData.map((item, index) => {
                                    return (
                                        <Option value={item.value} key={index}>
                                            {item.label}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item<FieldType>
                            label="产品代系"
                            name="series"
                            rules={[{ required: true, message: "请选择产品代系" }]}
                        >
                            <Select
                                placeholder="请选择产品代系"
                                onChange={onGenderChange}
                                allowClear
                            >
                                {seriesData.map((item, index) => {
                                    return (
                                        <Option value={item.value} key={index}>
                                            {item.label}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item<FieldType>
                            label="产品序列号"
                            name="productionId"
                            rules={[{ required: true, message: "请选择产品序列号" }]}
                        >
                            <Select
                                placeholder="请选择产品序列号"
                                onChange={onGenderChange}
                                allowClear
                            >
                                {productionIdData.map((item, index) => {
                                    return (
                                        <Option value={item.value} key={index}>
                                            {item.label}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="年">
                            <Space.Compact style={{ width: "100%" }}>
                                <Form.Item<FieldType> name="checkboxYear" noStyle>
                                    <Checkbox
                                        onChange={onYearCheck}
                                        style={{ width: "15%" }}
                                    ></Checkbox>
                                </Form.Item>
                                <Form.Item<FieldType>
                                    name={["year"]}
                                    className="ml-15"
                                    noStyle
                                    rules={[{ required: true, message: "请输入年" }]}
                                >
                                    <Input
                                        style={{ width: "85%" }}
                                        disabled={!yearDisabled}
                                        placeholder="请输入年"
                                    />
                                </Form.Item>
                            </Space.Compact>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="周">
                            <Space.Compact style={{ width: "100%" }}>
                                <Form.Item name="checkboxWeek" noStyle>
                                    <Checkbox
                                        onChange={onWeekCheck}
                                        style={{ width: "15%" }}
                                    ></Checkbox>
                                </Form.Item>
                                <Form.Item<FieldType>
                                    name={["week"]}
                                    className="ml-15"
                                    noStyle
                                    rules={[{ required: true, message: "请选择周" }]}
                                >
                                    <Input
                                        style={{ width: "85%" }}
                                        disabled={!weekDisabled}
                                        placeholder="请输入周"
                                    />
                                </Form.Item>
                            </Space.Compact>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item<FieldType>
                            label="国别"
                            name="country"
                            rules={[{ required: true, message: "请选择国别" }]}
                        >
                            <Select
                                placeholder="请选择国别"
                                onChange={onGenderChange}
                                allowClear
                            >
                                {countryData.map((item, index) => {
                                    return (
                                        <Option value={item.value} key={index}>
                                            {item.label}
                                        </Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={null}>
                            <Button type="primary" htmlType="submit">
                                预览
                            </Button>
                            <Button
                                type="primary"
                                onClick={onReset}
                                style={{ marginLeft: 8 }}
                            >
                                重置
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            <h2>SN码预览</h2>

            <div className="select">
                <div className="sn-code">{snCode}</div>
                <div>
                    <Button
                        type="primary"
                        onClick={() => {
                            createBarCode("601211KBD0000018");
                        }}
                    >
                        生成条码
                    </Button>
                    {/* <Button type="primary" onClick={createBarCode}>选择打印机 </Button> */}
                    <Button type="primary" onClick={printLabel} className="ml-15">
                        打印
                    </Button>
                </div>
            </div>

            <div id="label-designer">
                <canvas id="barcode" width="200" height="100"></canvas>
            </div>
        </div>
    );
};

export default Main;
