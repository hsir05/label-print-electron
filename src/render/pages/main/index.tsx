import React, { useState, useEffect } from "react";
import type { FormProps } from "antd";
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
    InputNumber,
} from "antd";
import { exportToExcel } from "../../../common/db";
import JsBarcode from "jsbarcode";
import { getISOWeek, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import "./index.less";

const { Option } = Select;

interface DataType {
    id: number;
    label: string;
    value: string;
}

const Main = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const [PCBAData, setPCBAData] = React.useState<DataType[]>([]);
    const [categoryData, setCategoryData] = React.useState<DataType[]>([]);
    const [specificationsData, setSpecificationsData] = React.useState<
        DataType[]
    >([]);
    const [seriesData, setSeriesData] = React.useState<DataType[]>([]);
    const [productionIdData, setProductionIdData] = React.useState<DataType[]>(
        [],
    );
    const [countryData, setCountryData] = React.useState<DataType[]>([]);
    const [yearData, setYearData] = React.useState<DataType[]>([]);
    const [weekData, setWeekData] = React.useState<DataType[]>([]);
    const [yearDisabled, setYearDisabled] = React.useState<boolean>(false);
    const [weekDisabled, setWeekDisabled] = React.useState<boolean>(false);
    const [snCode, setSnCode] = React.useState<string>("");
    const [snCodeList, setSnCodeList] = React.useState<string[]>([]);
    const [maxSerial, setMaxSerial] = React.useState<string>("");

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
        num: number;

        width: number;
        height: number;
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

        form.setFieldsValue({ num: 20, width: 300, height: 120 });

    }, []);

    const handleYear = (data: DataType[]) => {
        const year = new Date().getFullYear();
        const currentYear = data.find(
            (item: DataType) => item.label === year.toString(),
        );
        if (currentYear) {
            form.setFieldsValue({
                year: currentYear.value,
            });
        }
    };
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

    const onFinish: FormProps<FieldType>["onFinish"] = async (values: any) => {
        setSnCodeList([]);
        const snCode = `${values.pcba}0${values.category}${values.specifications}${values.series}${values.productionId}${values.year}${values.week}${values.country}`;
        let res = await window.electronAPI.sqQuery({
            sql: `SELECT MAX(serial_number) AS max_serial FROM history;`,
        });

        setSnCode(snCode);
        const maxSerial = res[0].max_serial;
        setMaxSerial(maxSerial);

        let snList: string[] = [];
        for (let i = 1; i <= values.num; i++) {
            let len = `${i + maxSerial}`.length
            switch (len) {
                case 1:
                    snList.push(`${snCode}0000${i + maxSerial}`);
                    break;
                case 2:
                    snList.push(`${snCode}000${i + maxSerial}`);
                    break;
                case 3:
                    snList.push(`${snCode}00${i + maxSerial}`);
                    break;
                case 4:
                    snList.push(`${snCode}0${i + maxSerial}`);
                    break;
                case 5:
                    snList.push(`${snCode}${i + maxSerial}`);
                    break;
            }
        }
        setSnCodeList(snList);
    };
    const onReset = () => {
        form.resetFields();
        handleYear(yearData);
        handleWeek(weekData);
        form.setFieldsValue({ num: 20 });
    };
    const formSubmit = () => {
        form.submit();
    }
    const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
        errorInfo: any,
    ) => {
        console.log("Failed:", errorInfo);
    };
    const createBarCode = (snCode: string = "601211KBD0000018") => {
        JsBarcode("#barcode", snCode, {
          format: "CODE128",
          lineColor: "#000",
          width: 1.3,
          height: 30,
          displayValue: true,
          valid: (bool) => {
            console.log(bool);
          },
        });
    };
    const printLabel = async () => {
        try {
            const canvas = document.getElementById(
                "barcode",
            ) as HTMLCanvasElement;
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
    const sqInsertHandle = async (data: any) => {
        await window.electronAPI.sqInsert({ table: "history", data: data });
    };
    const queryHandle = async (tableName: string) => {
        let res = await window.electronAPI.sqQuery({
            sql: `SELECT * FROM ${tableName}`,
            params: [],
        });
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
    };
    const onYearCheck = (e: any) => {
        setYearDisabled(e.target.checked);
    };
    const onWeekCheck = (e: any) => {
        setWeekDisabled(e.target.checked);
    };

    const exportToFile = () => {
        console.log(form.getFieldsValue());
        const { num } = form.getFieldsValue(["num"]);
        const data = {
            snCode: snCode,
            create_time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            account: "admin",
            serial_number: maxSerial + num,
            num: num,
        };
        sqInsertHandle(data);

        //含SN列表生成时间，SN码范围，操作账号信息
        const sampleData = [
            ["序号", "SN码"],
        ];

        for (let i = 0; i < snCodeList.length; i++) {
            sampleData.push([`${i + 1}`, snCodeList[i]]);
        }
        exportToExcel(sampleData, `SN${snCode}`);
    };

    const printList = async () => {
        let res = await window.electronAPI.getPrint();
        console.log(res);
    };
    const btn = (
        <div className="button-group">
            <Button
                type="primary"
                className="ml-15"
                onClick={() => {
                    createBarCode("601211KBD0000018");
                }}
            >
                生成条码
            </Button>
            {/* <Button type="primary" onClick={printLabel1} className="ml-15">
                打印1
            </Button> */}
            <Button type="primary" onClick={printLabel} className="ml-15">
                打印2
            </Button>
        </div>
    );

    const formBtn = (
        <>
            <Button type="primary" onClick={formSubmit}>
                预览
            </Button>
            <Button type="primary" onClick={onReset} style={{ marginLeft: 8 }}>
                重置
            </Button>
            <Button
                type="primary"
                onClick={exportToFile}
                className="ml-15"
                disabled={snCodeList.length > 0 ? false : true}
            >
                确认
            </Button>
        </>
    );

    const handleToLogin = () => {
        navigate("/login");
    }
    return (
        <div className="page">
            <Button type="primary" onClick={handleToLogin}>
                login
            </Button>
            <Card title="SN码生成" extra={formBtn}>
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
                                <Select placeholder="请选择产品规格" allowClear>
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
                                <Select placeholder="请选择产品代系" allowClear>
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
                                <Select placeholder="请选择产品序列号" allowClear>
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
                            <Form.Item<FieldType>
                                label="国别"
                                name="country"
                                rules={[{ required: true, message: "请选择国别" }]}
                            >
                                <Select placeholder="请选择国别" allowClear>
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
                            <Form.Item label="年">
                                <Space.Compact style={{ width: "100%" }}>
                                    <Form.Item<FieldType>
                                        name="checkboxYear"
                                        noStyle
                                        valuePropName="checked"
                                    >
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
                                    <Form.Item
                                        name="checkboxWeek"
                                        noStyle
                                        valuePropName="checked"
                                    >
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
                                label="生成数量"
                                name="num"
                                rules={[{ required: true, message: "请输入生成数量" }]}
                            >
                                <InputNumber
                                    placeholder="请输入生成数量"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>

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
            </Card>

            <Card title="SN码预览" className="mt-15" extra={btn}>
                <ul className="sncode-list">
                    {snCodeList.map((item, index) => {
                        return (
                            <li
                                key={index}
                                style={{ marginBottom: "10px", marginRight: "10px" }}
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

export default Main;
