import {
    Button,
    Form, Input,
    Space,
    Col,
    Row,
    Card,
    InputNumber,
    message,
} from "antd";
import React, { useEffect, useState } from "react";
import type { FormProps } from "antd";
import { openFile } from "../../../common/db";
import JsBarcode from "jsbarcode";

const Print = () => {
    const [data, setData] = React.useState<string[]>([]);
    const [printData, setPrintData] = useState({
        barcodeData: "ABC123",
        barcodeType: "128",
        width: 50,
        height: 30,
        x: 10,
        y: 10,
        rotation: 0,
        textX: 15,
        textY: 45,
        printerName: "TSC TX210", // 替换为你的打印机共享名
    });

    useEffect(() => {
       
    }, []);

    const handleOpenFile = async () => {
        openFile()
            .then((res) => {
                if (res && res.length > 0) {
                    let codeList = []
                    for (let key of res) {
                        // @ts-ignore
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
    const createBarCode = (ele: string, snCode: string) => {
        const { codeHeight } = form.getFieldsValue(["codeHeight"]);
        JsBarcode(ele, snCode, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.3, //每个条形码线条的宽度（数值越大条越宽）
            height: codeHeight || 70, //条形码的高度（单位 px）
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
            const canvas = document.getElementById("barcode1") as HTMLCanvasElement;
            let imgHtml = "";
            if (canvas) {
                const dataUrl = canvas.toDataURL("image/png");
                imgHtml = `<img id="label" src="${dataUrl}" width="100%" height="100%"  />`;
            }
            const { width, height, scaleFactor } = form.getFieldsValue([
                "width",
                "height",
                "scaleFactor",
            ]);

            const html = `<!DOCTYPE html><html><style>@page {size:${width}mm ${height}mm;margin: 0;} body {margin: 0;padding: 0;}</style><body>${imgHtml}</body></html>`;
            const success = await window.electronAPI.printDomElement(
                html,
                width,
                height,
                scaleFactor
            );
            if (!success) throw new Error("打印失败");
            console.log("打印结果:", success);
        } catch (error) {
            console.error("打印出错:", error);
        }
    };
    //--------------------------


    const handlePrint = async () => {
        try {
            const result = await window.electronAPI.printBarcode(printData);
            console.log(4444, result);
        } catch (err) {
            console.error('打印失败:', err);
        }
    };

    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setPrintData(prev => ({ ...prev, [name]: value }));
    };


    const formBtn = (
      <Space>
        <Button type="primary" onClick={handleOpenFile} disabled={true}>
          上传
        </Button>

        <Button type="primary" onClick={handlePrint}>
          打印测试
        </Button>
      </Space>
    );
    return (
      <div>
        <Card title="条码打印设置" extra={formBtn}>
          <Row gutter={24} style={{display: "flex",alignItems:'center'}}>
            <Col span={3}>条码内容:</Col>
            <Col span={6}>
              <Input value={printData.barcodeData} placeholder="请输入内容" />
            </Col>
            <Col span={3}>标签尺寸(mm): </Col>
            <Col span={6}>
              <InputNumber
                placeholder="请输入宽度"
                value={printData.width}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={6}>
              <InputNumber
                value={printData.height}
                placeholder="请输入高度"
                style={{ width: "100%" }}
              />
            </Col>
          </Row>
        </Card>

        {data.length > 0 && (
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
        )}

        <div id="label-designer">
          <canvas id="barcode1" width="200" height="100"></canvas>
          <canvas id="barcode2" width="200" height="100"></canvas>
        </div>
      </div>
    );
};

export default Print;
