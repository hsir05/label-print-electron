import {
    Button,
    Input,
    Space,
    Col,
    Row,
    Card,
    InputNumber,
    message,
} from "antd";
import React, { useEffect, useState } from "react";
import { openFile } from "../../../common/db";
const Print = () => {
    const [data, setData] = React.useState<string[]>([]);
    const [printData, setPrintData] = useState({
        barcodeData: "101111NBC8400081",
        barcodeType: "128",
        width: 60,
        height: 40,
        x: 2,
        y: 2,
        rotation: 0,
        textX: 15,
        textY: 45,
        humanReadable: "101111NBC8400081",
        printerName: "TSC TX310", // 替换为你的打印机共享名
        printerIP: "172.30.203.152",
        num: 1,
        port: 9100,
        tempFilePath: "C:\\Users\\52276\\Desktop\\双排40x12.btw",
        customCommands: `
            SIZE 60 mm,40 mm
            GAP 2 mm,0
            DIRECTION 1
            CLS
            BARCODE 20,50,"128",100,1,0,2,3,"12345678LEFT"
            TEXT 20,160,"TSS24.BF2",0,1,1,"12345678LEFT"
            BARCODE 220,50,"128",100,1,0,2,3,"12345678RIGHT"
            TEXT 220,160,"TSS24.BF2",0,1,1,"12345678LEFT"
            PRINT 1
            END
            `,
    });

    const [state, setState] = useState({
        barcodeData: "101111NBC8400081",
        width: 60,
        height: 30,
        previewImage: "",
        isPrinting: false,
        message: "",
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
    // 共享
    const handlePrint = async () => {
        try {
            setState({ ...state, isPrinting: true });

            const result = await window.electronAPI.printBarcode(printData);
            console.log('单排打印', result);
            // @ts-ignore
            setState({ ...state, message: result });
        } catch (error) {
            console.log(error);

            setState({ ...state, message: `打印失败: ${error}` });
        } finally {
            setState((prev) => ({ ...prev, isPrinting: false }));
        }
    };

    //网络
    const handlePrint2 = async () => {
        try {
            setState({ ...state, isPrinting: true });

            const result = await window.electronAPI.printBarcode2(printData);
            console.log("单排打印", result);
            // @ts-ignore
            setState({ ...state, message: result });
        } catch (error) {
            console.log(error);

            setState({ ...state, message: `打印失败: ${error}` });
        } finally {
            setState((prev) => ({ ...prev, isPrinting: false }));
        }
    };
    //usb
    const handlePrint4 = async () => {
        try {
            setState({ ...state, isPrinting: true });

            // const printers = await window.electronAPI.getPrint();
            // console.log("打印机列表:", printers);
            // const tscPrinter = printers.find((p) => p.isDefault);
            // console.log(tscPrinter);

            const result = await window.electronAPI.printBarcode4(printData);
            console.log("usb单排打印22222", result);
            // @ts-ignore
            setState({ ...state, message: result });
        } catch (error) {
            console.log(error);

            setState({ ...state, message: `打印失败: ${error}` });
        } finally {
            setState((prev) => ({ ...prev, isPrinting: false }));
        }
    };
    const handlePrintTest = async () => {
        try {
            const result = await window.electronAPI.printTest();
            console.log("测试打印", result);
        } catch (err) {
            console.log('test', err);
        }
    };
    const getFilePath = async () => {
      try {
        const result = await window.electronAPI.openFilePath();
        setPrintData({ ...printData, tempFilePath: result });
      } catch (err) {
        console.log("test", err);
      }
    };
    const handlePrint3 = async () => {
        try {
            for (let i = 0; i < data.length; i += 2) {
              const leftBarcode = data[i];
              const rightBarcode = data[i + 1] || "";
              const result = await window.electronAPI.printBarcode3({
                ...printData,
                barCodeLeft: leftBarcode,
                rightBarcode: rightBarcode,
              });
              console.log("自定义打印", result);
            }
        } catch (error) {
            console.log(error);
        }
    };
    const handleTwoPrint = async () => {
        try {
            setState({ ...state, isPrinting: true });

            const result = await window.electronAPI.printBarcode(printData);
            console.log("单排打印", result);
            // @ts-ignore
            setState({ ...state, message: result });
        } catch (error) {
            console.log(error);

            setState({ ...state, message: `打印失败: ${error}` });
        } finally {
            setState((prev) => ({ ...prev, isPrinting: false }));
        }
        // try {
        //     await printDoubleRowLabel({
        //       leftBarcode: "101111NBC8400082",
        //       rightBarcode: "101111NBC8400083",
        //     });
        // } catch (error) {
        //     console.error("打印错误:", error);
        // }
    };
    const printDoubleRowLabel = async () => { 
        const printers = await window.electronAPI.getPrint();
        console.log("列表:", printers);
        const tscPrinter = printers.find((p) => p.isDefault);
        console.log(tscPrinter);
        if (!tscPrinter) {
          message.error("未找到默认打印机");
          return;
        }

        for (let i = 0; i < data.length; i += 2) {
          const leftBarcode = data[i];
          const rightBarcode = data[i + 1] || "";
          printDoubleLabel({ leftBarcode, rightBarcode }, tscPrinter.name);
        }
    };
    //双排打印
    const printDoubleLabel = async (data: any, tscPrinterName:string) => {
      try {
        const commands = [
          "SIZE 100 mm, 50 mm", // 总宽度是两个标签的宽度之和
          "GAP 2 mm, 0 mm",
          "DIRECTION 1",
          "CLS",
          `BARCODE 20,50,"128",50,1,0,2,2,"${data.leftBarcode}"`,
          `BARCODE 270,50,"128",50,1,0,2,2,"${data.rightBarcode}"`,
          "PRINT 1",
          "END",
        ].join(" ");
        console.log(commands);

        let result = await window.electronAPI.printTwoBarcode(
          tscPrinterName || "TSC TX310",
          commands,
        );
        console.log("双排打印", result);
      } catch (error) {
        console.error("双排打印失败:", error);
      }
    };
    const handleTemplatePrint = async () => {
        try {
            for (let i = 0; i < data.length; i += 2) {
                const leftBarcode = data[i];
                const rightBarcode = data[i + 1] || "";
                let res = await window.electronAPI.printWithBtwTemplate(
                  printData.tempFilePath,
                  { leftBarcode: leftBarcode, rightBarcode: rightBarcode },
                );
                console.log("模板打印--------", res);
            }
        } catch (error) {
            message.error(`打印失败: ${error}`);
        }
    };
    const handleVBTempPrint1 = async () => {
      try {
        for (let i = 0; i < data.length; i += 2) {
          const leftBarcode = data[i];
          const rightBarcode = data[i + 1] || "";
          let res = await window.electronAPI.printVBBarcode1(
            printData.tempFilePath,
            { leftBarcode: leftBarcode, rightBarcode: rightBarcode },
          );
          console.log("模板打印--------", res);
        }
      } catch (error) {
        message.error(`打印失败: ${error}`);
      }
    };
    const handleVBTempPrint2 = async () => {
      try {
        for (let i = 0; i < data.length; i += 2) {
          const leftBarcode = data[i];
          const rightBarcode = data[i + 1] || "";
          let res = await window.electronAPI.printVBBarcode2(
            printData.tempFilePath,
            { leftBarcode: leftBarcode, rightBarcode: rightBarcode },
          );
          console.log("模板打印--------", res);
        }
      } catch (error) {
        message.error(`打印失败: ${error}`);
      }
    };
    // const handleTemplatePrint = async () => {
    //     try {
    //         // 模板文件路径 - 根据实际位置调整  C:\Users\H\Desktop>
    //         // C:\Users\52276\Desktop
    //         const templatePath = "C:\\Users\\52276\\Desktop\\双排40x12.btw";
    //         // 打印数据
    //         const printData = {
    //             leftBarcode: "101111NBC8400084",
    //             rightBarcode: "101111NBC8400085",
    //         };
    //         const commands = [
    //             "SIZE 100 mm, 50 mm", // 总宽度是两个标签的宽度之和
    //             "GAP 2 mm, 0 mm",
    //             "DIRECTION 1",
    //             "CLS",

    //             // 左侧标签
    //             `BARCODE 20,50,"128",50,1,0,2,2,"${printData.leftBarcode}"`,
    //             `TEXT 20,120,"0",0,1,1,"${printData.leftBarcode}"`,

    //             // 右侧标签
    //             `BARCODE 270,50,"128",50,1,0,2,2,"${printData.rightBarcode}"`,
    //             `TEXT 270,120,"0",0,1,1,"${printData.rightBarcode}"`,

    //             "PRINT 1",
    //             "END",
    //         ].join("\n");
    //         await window.electronAPI.printWithBtwTemplate(templatePath, commands);
    //         message.success("打印任务已发送");
    //     } catch (error) {
    //         message.error(`打印失败: ${error}`);
    //     }
    // };

    const formBtn = (
      <Space>
        <Button type="primary" onClick={handleOpenFile}>
          上传
        </Button>
        <Button
          type="primary"
          onClick={printDoubleRowLabel}
          disabled={data.length > 0 ? false : true}
        >
          双排打印
        </Button>
        <Button
          type="primary"
          onClick={handleTemplatePrint}
          disabled={data.length > 0 ? false : true}
        >
          双排模板打印
        </Button>
        {/* <Button type="primary" onClick={handleVBTempPrint1}  disabled={data.length > 0 ? false : true}>
          模板vb打印1
        </Button>
        <Button type="primary" onClick={handleVBTempPrint2}  disabled={data.length > 0 ? false : true}>
          模板vb打印2
        </Button> */}
      </Space>
    );
    return (
      <div>
        <Card title="条码打印设置" extra={formBtn}>
          <Row gutter={24} style={{ display: "flex", alignItems: "center" }}>
            {/* <span>条码内容:</span>
            <Col span={6}>
              <Input value={printData.barcodeData} placeholder="请输入内容" />
            </Col> */}
            {/* <span>标签尺寸(mm):</span>
            <Col span={3}>
              <InputNumber
                placeholder="请输入宽度"
                value={printData.width}
                style={{ width: "100%" }}
              />
            </Col>
            <Col span={3}>
              <InputNumber
                value={printData.height}
                placeholder="请输入高度"
                style={{ width: "100%" }}
              />
            </Col>
            <span>打印份数:</span>
            <Col span={3}>
              <InputNumber
                value={printData.num}
                placeholder="请输入高度"
                style={{ width: "100%" }}
              />
            </Col> */}
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
            {/* <Col span={24}>
              <Input.TextArea
                rows={12}
                value={printData.customCommands}
                placeholder="请输入完整TSPL命令"
              />
            </Col> */}
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
