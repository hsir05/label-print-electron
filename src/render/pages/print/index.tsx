import {
    Button,
    Input,
    Space,
    Col,
    Row,
    Card,
    message,
} from "antd";
import React, { useEffect, useState } from "react";
import { openFile } from "../../../common/db";
const Print = () => {
    const [data, setData] = React.useState<string[]>([]);
    const [printData, setPrintData] = useState({
        tempFilePath: "C:\\Users\\52276\\Desktop\\双排40x12.btw",
    });
    useEffect(() => { }, []);

    const handleOpenFile = async () => {
        openFile()
            .then((res) => {
                if (res && res.length > 0) {
                    let codeList = [];
                    for (let key of res) {
                        // @ts-ignore
                        codeList.push(key[1]);
                    }
                    setData(codeList);
                }
            })
            .catch((err) => {
                console.error("Error opening file:", err);
            });
    };
    const getFilePath = async () => {
      try {
        const result = await window.electronAPI.openFilePath();
        setPrintData({ ...printData, tempFilePath: result });
      } catch (err) {
        console.log("test", err);
      }
    };
    const handleTemplatePrint = async () => {
        try {
            let res = await window.electronAPI.printWithBtwTemplate( printData.tempFilePath,{ leftBarcode: '', rightBarcode: '' } );
            console.log("模板打印--------", res);
        } catch (error) {
            message.error(`打印失败: ${error}`);
        }
    };
    const formBtn = (
      <Space>
        <Button type="primary" onClick={handleOpenFile}>
          上传
        </Button>
        <Button
          type="primary"
          onClick={handleTemplatePrint}
          disabled={data.length > 0 ? false : true}
        >
          模板打印
        </Button>
      </Space>
    );
    return (
      <div>
        <Card title="条码打印设置" extra={formBtn}>
          <Row gutter={24} style={{ display: "flex", alignItems: "center" }}>
            <span>模板文件:</span>
            <Col span={12}>
              <Input
                value={printData.tempFilePath}
                placeholder="请输入模板文件"
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={4}>
              <Button type="primary" onClick={getFilePath}>
                获取文件路径
              </Button>
            </Col>
          </Row>
        </Card>

        {data.length > 0 && (
          <div className="sncode-list">
            {data.map((item, index) => {
              return (
                <div key={index} className="sncode-item">
                  {item}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
};

export default Print;
