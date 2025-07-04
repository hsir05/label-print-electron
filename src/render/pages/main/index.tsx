import React, { useEffect } from "react";
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
    message,
} from "antd";
import { exportToExcel } from "../../../common/db";
import { getISOWeek, format } from "date-fns";

const { Option } = Select;

interface DataType {
    id: number;
    label: string;
    value: string;
}

const Main = () => {
    const [form] = Form.useForm();

    const [PCBAData, setPCBAData] = React.useState<DataType[]>([]);
    const [productCodeData, setProductCodeData] = React.useState<
        DataType[]
    >([]);
    const [manufacturerData, setManufacturerData] = React.useState<DataType[]>(
        [],
    );
    const [countryData, setCountryData] = React.useState<DataType[]>([]);
    const [yearData, setYearData] = React.useState<DataType[]>([]);
    const [weekData, setWeekData] = React.useState<DataType[]>([]);
    const [yearDisabled, setYearDisabled] = React.useState<boolean>(false);
    const [weekDisabled, setWeekDisabled] = React.useState<boolean>(false);
    const [snCode, setSnCode] = React.useState<string>("");
    const [snCodeFile, setSnCodeFile] = React.useState<string>("");
    const [PCBASNCode, setPCBASNCode] = React.useState<string>("");
    const [snCodeList, setSnCodeList] = React.useState<string[]>([]);
    const [PCBASNCodeList, setPCBASnCodeList] = React.useState<string[]>([]);
    const [maxSerial, setMaxSerial] = React.useState<number>(0);

    type FieldType = {
        pcba?: string;
        productCode?: string;
        manufacturer?: string;
        zzc?: string;
        checkboxYear?: Boolean;
        year?: string;
        checkboxWeek?: Boolean;
        week?: string;
        country?: string;
        serialNumber?: string;
        num: number;
        order?: string;
    };

    useEffect(() => {
        queryHandle("pcba");
        queryHandle("productCode");
        queryHandle("manufacturer");
        queryHandle("country");
        queryHandle("year");
        queryHandle("week");

        const year = new Date().getFullYear();
        const week = getISOWeek(new Date());
        form.setFieldsValue({
            num: 10,
            width: 300,
            height: 120,
            year: `${year}`,
            week: `${week}`,
        });

    }, []);
    const onFinish: FormProps<FieldType>["onFinish"] = async (values: any) => {
        setSnCodeList([]);
        const currentYear = yearData.find(
            (item: DataType) => item.label === values.year,
        );
        const currentWeek = weekData.find(
            (item: DataType) => item.label === values.week,
        );

        const snCode = `${values.pcba}${values.manufacturer}${values.productCode}${currentYear?.value}${currentWeek?.value}${values.country}`;
        const snCodeFile = `${values.pcba}-${values.manufacturer}-${values.productCode}-${currentYear?.value}-${currentWeek?.value}-${values.country}`;
        
        const pcbaSNCode = `${values.pcba}0${values.productCode}${currentYear?.value}${currentWeek?.value}00`;
        let history = await window.electronAPI.sqQuery({
            sql: `SELECT * FROM history WHERE snCode = "${snCode}" ORDER BY serial_number DESC LIMIT 1`,
        });
        let maxSerial = 0
        if (history.length > 0) {
            maxSerial = history[0].serial_number;
        }

        if (maxSerial + values.num > 99999) {
            message.error("流水号超出最大限制!");
            return
        }
        setSnCode(snCode);
        setSnCodeFile(snCodeFile);
        setPCBASNCode(pcbaSNCode);
        setMaxSerial(maxSerial);

        let snList: string[] = [];
        let pcbaSNList: string[] = [];
        for (let i = 1; i <= values.num; i++) {
            let len = `${i + maxSerial}`.length
            switch (len) {
                case 1:
                    snList.push(`${snCode}0000${i + maxSerial}`);
                    pcbaSNList.push(`${pcbaSNCode}0000${i + maxSerial}`);
                    break;
                case 2:
                    snList.push(`${snCode}000${i + maxSerial}`);
                    pcbaSNList.push(`${pcbaSNCode}000${i + maxSerial}`);
                    break;
                case 3:
                    snList.push(`${snCode}00${i + maxSerial}`);
                    pcbaSNList.push(`${pcbaSNCode}00${i + maxSerial}`);
                    break;
                case 4:
                    snList.push(`${snCode}0${i + maxSerial}`);
                    pcbaSNList.push(`${pcbaSNCode}0${i + maxSerial}`);
                    break;
                case 5:
                    snList.push(`${snCode}${i + maxSerial}`);
                    pcbaSNList.push(`${pcbaSNCode}${i + maxSerial}`);
                    break;
            }
        }
        setSnCodeList(snList);
        setPCBASnCodeList(pcbaSNList);
    };
    const onReset = () => {
        form.resetFields();
        setSnCodeList([]);
        const year = new Date().getFullYear();
        const week = getISOWeek(new Date());
        form.setFieldsValue({
            num: 10,
            width: 300,
            height: 120,
            year: `${year}`,
            week: `${week}`,
        });
    };
    // wifi 添加表头
    const formSubmit = () => {
        form.submit();
    }
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
            case "productCode":
                setProductCodeData(res);
                break;
            case "manufacturer":
                setManufacturerData(res);
                break;
            case "country":
                setCountryData(res);
                break;
            case "year":
                setYearData(res);
                break;
            case "week":
                setWeekData(res);
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
        const { num, order } = form.getFieldsValue(["num", "order"]);
        let user =
            sessionStorage.getItem("user") || JSON.stringify({ username: "admin" });
        const data = {
            snCode: snCode,
            PCBASNCode: PCBASNCode,
            create_time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            account: JSON.parse(user).username,
            serial_number: maxSerial + parseInt(num),
            num: num,
            snCodeList: JSON.stringify(snCodeList),
            PCBASNCodeList: JSON.stringify(PCBASNCodeList),
        };
        sqInsertHandle(data);

        //订单号+sn码
        const sampleData = [["序号", "成品 SN码", "PCBA SN码"]];

        for (let i = 0; i < snCodeList.length; i++) {
            sampleData.push([`${i + 1}`, snCodeList[i], PCBASNCodeList[i]]);
        }
        exportToExcel(sampleData, `${order}-${snCodeFile}`);
    };


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

    return (
        <div className="page">
            <Card title="SN码生成" extra={formBtn}>
                <Form
                    name="basic"
                    form={form}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
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
                                label="组装厂"
                                name="manufacturer"
                                rules={[{ required: true, message: "请选择产品组装厂" }]}
                            >
                                <Select placeholder="请选择产品组装厂" allowClear>
                                    {manufacturerData.map((item, index) => {
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
                                label="产品型号"
                                name="productCode"
                                rules={[{ required: true, message: "请选择产品产品型号" }]}
                            >
                                <Select placeholder="请选择产品产品型号" allowClear>
                                    {productCodeData.map((item, index) => {
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
                                    max={99999}
                                    placeholder="请输入生成数量"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item<FieldType>
                                label="订单号"
                                name="order"
                                rules={[{ required: true, message: "请输入订单号" }]}
                            >
                                <Input
                                    maxLength={25}
                                    placeholder="请输入订单号"
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>

            {snCodeList.length > 0 && (
                <Card title="成品 SN码列表">
                    <div className="code-list">
                        {snCodeList.map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    className="sncode-item"
                                    style={{  marginRight: "10px" }}
                                >
                                    {item}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {PCBASNCodeList.length > 0 && (
                <Card title="PCBA SN码列表">
                    <div className="code-list">
                        {PCBASNCodeList.map((item, index) => {
                            return (
                                <div
                                    key={index}
                                    className="sncode-item"
                                    style={{ marginRight: "10px" }}
                                >
                                    {item}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Main;
