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
    const [snCodeList, setSnCodeList] = React.useState<string[]>([]);
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
      console.log("snCode----", snCode);

      let history = await window.electronAPI.sqQuery({
        sql: `SELECT * FROM history WHERE snCode = "${snCode}" ORDER BY serial_number DESC LIMIT 1`,
      });
      console.log(history);

      let maxSerial=0
      if (history.length > 0) {
        maxSerial = history[0].serial_number;
      }

      if (maxSerial + values.num>99999) {
        message.error("流水号超出最大限制!");
        return 
      } 
      setSnCode(snCode);
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
    // ---------------------------------生成sn号，从历史记录中查询，如果之前有生成相同参数的，则顺序打印，如果无从1开始
    // 流水号 最大5位数，如超过则停止并提示 最大限制

    // 数据维护-组装厂数据字段添加，下载功能 
    // 添加体验版本限制，时间限制
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
        const { num } = form.getFieldsValue(["num"]);
        let user =
          sessionStorage.getItem("user") ||
          JSON.stringify({ username: "admin" });
        const data = {
          snCode: snCode,
          create_time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          account: JSON.parse(user).username,
          serial_number: maxSerial + parseInt(num),
          num: num,
          snCodeList: JSON.stringify(snCodeList),
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
                  label="产品代码"
                  name="productCode"
                  rules={[{ required: true, message: "请选择产品产品代码" }]}
                >
                  <Select placeholder="请选择产品产品代码" allowClear>
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
            </Row>
          </Form>
        </Card>

        {snCodeList.length > 0 && (
          <div className="sncode-list">
            {snCodeList.map((item, index) => {
              return (
                <div
                  key={index} className="sncode-item"
                  style={{ marginTop: "10px", marginRight: "10px" }}
                >
                  {item}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
};

export default Main;
