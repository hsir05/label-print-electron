import {
  Button,
  Form,
  Input,
  Space,
  Col,
  Checkbox,
  Row,
  DatePicker,
  Card,
  Descriptions,
} from "antd";
import type {
  FormProps,
  DatePickerProps,
  GetProps,
  DescriptionsProps,
} from "antd";
import React, { useEffect } from "react";
import dayjs from "dayjs";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { openFile, exportToExcel } from "../../../common/db";
dayjs.locale("zh");


type RangePickerProps = GetProps<typeof DatePicker.RangePicker>;
interface DataType {
    id: number;
    snCode: string;
    create_time: string;
    account: string;
    serial_number: number;
    num: number;
}
type ExcelDataType = [string, string, string, string];
const Record = () => {
    const [form] = Form.useForm();
    type FieldType = {
        order: string;
        createTime: string;
        checkboxYear: boolean;
        year?: string;
        checkboxWeek?: Boolean;
        week?: string;
    };
    type InfoType = {
      order: string;
      createTime: string;
      wiFiNum:  number;
      fileName: string
    };
    const [data, setData] = React.useState<DataType[]>([]);
    const [excelData, setExcelData] = React.useState<ExcelDataType[]>([]);
    const [info, setInfo] = React.useState<InfoType>({ order: '', createTime: '', wiFiNum: 0, fileName: '' });
    const [yearDisabled, setYearDisabled] = React.useState<boolean>(false);
    const [weekDisabled, setWeekDisabled] = React.useState<boolean>(false);

    useEffect(() => { 
      
        
    }, []);

    const handleOpenFile = async () => {
        openFile().then((res) => {
            if (res && res.length > 0) {
                console.log(res);
                setExcelData(res);
            }
        }).catch((err) => {
            console.error("Error opening file:", err);
        });
    };
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

    const handleFile=()=>{
      const sampleData = [
          ["序号", "SN码"],
          ["1", "601211KBD0000018"],
          ["2", "601211KBD0000019"],
          ["3", "601211KBD0000020"],
      ];
      exportToExcel(sampleData, `SN`);
    }
    const onOk = (value: DatePickerProps["value"] | RangePickerProps["value"],) => {
        console.log("onOk: ", value);
    };
    const onYearCheck = (e: any) => {
        setYearDisabled(e.target.checked);
    };
    const onWeekCheck = (e: any) => {
        setWeekDisabled(e.target.checked);
    };

    const handleCreate=()=>{
        //显示订单号，下单时间，WiFi模组数量，以及生成的文件名《************WiFi MAC对应表》，文件名中************表示下单时间（年月日格式）+订单号后四位（例如202412085535）
        const { order, createTime } = form.getFieldsValue([
          "order",
          "createTime",
        ]);
        const code = order.slice(-4);
        const date = dayjs(createTime).format("YYYYMMDD");
        const fileName = `${date}${code}WiFi MAC对应表`;
        setInfo({
          order: order,
          createTime: date,
          wiFiNum: excelData.length,
          fileName: fileName,
        });
    }
    const handleOk=()=>{
        for(let i=0;i<excelData.length;i++){
            console.log(excelData[i]);
            let item = excelData[i];
            item[1]=item[1].toLocaleUpperCase()
        }
        exportToExcel(excelData, info.fileName, "Sheet1")
    }

    const okBtn = (
        <div>
            <Button type="primary" onClick={handleOk}>
                确定
            </Button>
        </div>
    )
    const items: DescriptionsProps["items"] = [
      {
        label: "订单号",
        children: info.order,
      },
      {
        label: "下单时间",
        children: info.createTime,
      },
      {
        label: "WiFi模组数量",
        children: info.wiFiNum,
      },
      {
        label: "文件名称",
        children: info.fileName,
      },
    ];
    return (
      <div className="">
        <Card title="生成">
          <Form
            name="basic"
            form={form}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Row gutter={24}>
              <Col span={10}>
                <Form.Item<FieldType>
                  name="order"
                  label="订单号"
                  rules={[{ required: true, message: "请输入订单号" }]}
                >
                  <Input placeholder="请输入订单号" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item<FieldType>
                  label="下单时间"
                  name="createTime"
                  rules={[{ required: true, message: "请选择下单时间" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Button type="primary" onClick={handleOpenFile}>
                  上传
                </Button>
              </Col>
              <Col span={2}>
                <Button type="primary" onClick={handleCreate}>
                  生成
                </Button>
              </Col>
              {/* <Col span={12}>
                <Form.Item label="WIFI模组" style={{ width: "100%" }}>
                  <Space.Compact style={{ width: "100%" }}>
                    <Form.Item<FieldType>
                      name="checkboxYear"
                      valuePropName="checked"
                      noStyle
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
                      rules={[{ required: true, message: "请输入WIFI模组" }]}
                    >
                      <Input
                        style={{ width: "85%" }}
                        disabled={!yearDisabled}
                        placeholder="请输入WIFI模组"
                      />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Mac地址">
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
                      rules={[{ required: true, message: "请选择Mac地址" }]}
                    >
                      <Input
                        style={{ width: "85%" }}
                        disabled={!weekDisabled}
                        placeholder="请输入Mac地址"
                      />
                    </Form.Item>
                  </Space.Compact>
                </Form.Item>
              </Col> */}
            </Row>
          </Form>
        </Card>

        <Card title="预览" extra={okBtn}>
          <Descriptions
            bordered
            column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
            items={items}
          />
        </Card>
      </div>
    );
};

export default Record;
