import {
  Button,
  Form,
  Input,
  Col,
  Row,
  DatePicker,
  Card,
  Descriptions,
} from "antd";
import type {
  FormProps,
  DescriptionsProps,
} from "antd";
import React from "react";
import dayjs from "dayjs";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { openFile, exportToExcel } from "../../../common/db";
dayjs.locale("zh");


type ExcelDataType = [string, string, string, string];
const Record = () => {
    const [form] = Form.useForm();
    type FieldType = {
      order: string;
      mainOrder:string;
      createTime: string;
      checkboxYear: boolean;
      year?: string;
      checkboxWeek?: Boolean;
      week?: string;
    };
    type InfoType = {
      order: string;
      mainOrder: string;
      createTime: string;
      wiFiNum: number;
      fileName: string;
    };
    const [excelData, setExcelData] = React.useState<ExcelDataType[]>([]);
    const [info, setInfo] = React.useState<InfoType>({ order: '',mainOrder:'' ,createTime: '', wiFiNum: 0, fileName: '' });

    const handleOpenFile = async () => {
        openFile().then((res) => {
            if (res && res.length > 0) {
                setExcelData(res as any);
            }
        }).catch((err) => {
            console.error("Error opening file:", err);
        });
    };
    const onFinish: FormProps<FieldType>["onFinish"] = async (values: any) => {
        const { order, createTime, mainOrder } = form.getFieldsValue([
          "order",
          "createTime",
          "mainOrder",
        ]);
        let code = "";
        if (order) {
          code = order.slice(-4);
        }
        const mainCode = mainOrder.slice(-4);
        const date = dayjs(createTime).format("YYYYMMDD");
        const fileName = `${mainCode}${code?'-':''}${code}-${date}-WiFi MAC对应表`;
        setInfo({
          mainOrder: mainOrder,
          order: order,
          createTime: date,
          wiFiNum: excelData.length,
          fileName: fileName,
        });
    };

    const handleOk=()=>{
        for(let i=0;i<excelData.length;i++){
            let item = excelData[i];
            item[1]=item[1].toLocaleUpperCase()
        }
        exportToExcel(excelData, info.fileName, "Sheet1")
    }

    const okBtn = (<Button type="primary" onClick={handleOk}>确定</Button>)
    const items: DescriptionsProps["items"] = [
      {
        label: "供应商订单号",
        children: info.mainOrder,
      },
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
        <Card title="WiFi MAC对应表">
          <Form
            name="basic"
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 12 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item<FieldType>
                  name="mainOrder"
                  label="供应商订单号"
                  wrapperCol={{ span: 15 }}
                  rules={[{ required: true, message: "请输入供应商订单号" }]}
                >
                  <Input placeholder="请输入供应商订单号" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item<FieldType>
                  name="order"
                  label="订单号"
                  labelCol={{ span: 5 }}
                  wrapperCol={{ span: 19 }}
                >
                  <Input placeholder="请输入订单号" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item<FieldType>
                  label="下单时间"
                  labelCol={{ span: 9 }}
                  wrapperCol={{ span: 15 }}
                  name="createTime"
                  rules={[{ required: true, message: "请选择下单时间" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={2} style={{ display: "flex" }}>
                <Button
                  type="primary"
                  onClick={handleOpenFile}
                  style={{ display: "inline-block" }}
                >
                  上传
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={excelData.length >0?false:true}
                  style={{ marginLeft: 10 }}
                >
                  生成
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {info.fileName && (
          <Card title="预览" extra={okBtn} style={{ marginTop: 20 }}>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
              items={items}
            />
          </Card>
        )}
      </div>
    );
};

export default Record;
