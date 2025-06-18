import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent, dialog, shell } from "electron"
import { deleteParam, insertParam, queryParam, sqDelete, sqInsert, sqQuery, sqUpdate, updateParam } from "@/common/db"
import path from "path";
import os from "os";
// const usb = require('usb');
const fs = require('fs');
const { exec } = require('child_process');
// const bwipjs = require('bwip-js');
const net = require('net');

export interface IpcMainWindow {
    mainWindow: BrowserWindow,
}

const openUrlByDefaultBrowser = (e: IpcMainEvent, url: string, options?: Electron.OpenExternalOptions) => {
    shell.openExternal(url, options)
}

const initIpcOn = (winodws: IpcMainWindow) => {
    ipcMain.on('openUrlByDefaultBrowser', openUrlByDefaultBrowser)
    ipcMain.on('communicateWithEachOtherSendMsg', (event: IpcMainEvent, msg: string) => {
        event.reply('communicateWithEachOtherReply', msg)
    })
    ipcMain.on('communicateWithEachOtherSendSyncMsg', (event: IpcMainEvent, msg: string) => {
        event.returnValue = `I got ${msg},ok`
    })
}
const initIpcHandle = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ipcMain.handle('openFile', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                { name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        })

        if (!canceled && filePaths.length > 0) {
            const filePath = filePaths[0]
            const data = fs.readFileSync(filePath)
            return {
                fileName: path.basename(filePath),
                data: data.buffer
            }
        }
        return null
    })
    ipcMain.handle('openFilePath', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        });
        return result.filePaths[0]; // 返回用户选择的第一个文件路径
    });
    ipcMain.handle("get-printers", async () => {
        try {
            const win = new BrowserWindow({ show: false });
            return win.webContents.getPrintersAsync()
        } catch (error) {
            console.error('获取打印机失败:', error)
            return []
        }
    });
    ipcMain.handle('print-dom-element', async (event, htmlContent, width, height, scaleFactor = 100) => {
        const win = new BrowserWindow({
            show: false, // 打印预览
            webPreferences: { nodeIntegration: false, contextIsolation: true }
        });
        let resolved = false;
        const cleanup = () => {
            if (!resolved && !win.isDestroyed()) {
                win.close();
            }
        };
        // 设置超时以防加载卡住
        const timeout = setTimeout(() => {
            cleanup();
            return { success: false, error: '操作超时' };
        }, 30000);

        try {
            await win.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlContent)}`);
            await win.webContents.executeJavaScript('document.readyState');
            return await new Promise((resolve) => {
                const handleLoad = () => {
                    win.webContents.print({
                        silent: false,
                        deviceName: 'TSC TX210',
                        scaleFactor: scaleFactor,
                        pageSize: {
                            width: width * 1000, // 毫米转微米
                            height: height * 1000
                        }
                    }, (success) => {
                        clearTimeout(timeout);
                        resolved = true;
                        win.close();
                        resolve({ success });
                    });
                };
                win.webContents.on('did-finish-load', handleLoad);
                win.webContents.on('dom-ready', handleLoad);
                win.webContents.executeJavaScript('document.readyState').then((readyState) => {
                    if (readyState === 'complete') {
                        handleLoad();
                    }
                });
            });
        } catch (error) {
            clearTimeout(timeout);
            cleanup();
            return { success: false, error: error };
        }
    });
    // 生成条码图片并返回base64
    // ipcMain.handle('generate-barcode-preview', async (event, options) => {
    //     try {
    //         const png = await bwipjs.toBuffer({
    //             bcid: 'code128',       // 条码类型
    //             text: options.barcodeData, // 条码内容
    //             scale: 3,              // 缩放比例
    //             height: 15,            // 条码高度(mm)
    //             includetext: true,     // 包含可读文本
    //             textxalign: 'center',  // 文本居中
    //             textmarginTop: 25,
    //             fontsize: 16,
    //         });
    //         return 'data:image/png;base64,' + png.toString('base64');
    //     } catch (error) {
    //         console.error('生成条码失败:', error);
    //         throw error;
    //     }
    // });
    // 共享打印
    ipcMain.handle('print-barcode', (event, options) => {
        return new Promise((resolve, reject) => {
            // TSPL 命令构建
            const tsplCommands = `
                SIZE ${options.width} mm,${options.height} mm
                GAP 2 mm,0
                DIRECTION 1
                CLS
                BARCODE ${options.x},${options.y},"${options.barcodeType}",${options.height - 10},1,0,${options.rotation},2,"${options.barcodeData}"
                TEXT ${options.textX},${options.textY},"TSS24.BF2",0,1,1,"${options.humanReadable}"
                PRINT ${options.num}
                END
              `;
            exec(`echo "${tsplCommands}" > "\\\\localhost\\${options.printerName}"`, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve('条码打印成功');
                }
            });
        });
    });
    // 网络打印
    ipcMain.handle('print-barcode2', (event, options) => {
        return new Promise((resolve, reject) => {
            // const printers = await window.electronAPI.getPrint();
            // console.log("打印机列表:", printers);
            // const tscPrinter = printers.find((p) => p.isDefault);
            // console.log(tscPrinter);

            const tsplCommands = `
                SIZE ${options.width} mm,${options.height} mm
                GAP 2 mm,0
                DIRECTION 1
                CLS
                BARCODE ${options.x},${options.y},"${options.barcodeType}",${options.height - 10},1,0,${options.rotation},2,"${options.barcodeData}"
                TEXT ${options.textX},${options.textY},"TSS24.BF2",0,1,1,"${options.humanReadable}"
                PRINT 1
                END
                `.trim();

            const client = new net.Socket();
            client.connect(options.port, options.printerIP, () => {
                client.write(tsplCommands);
                client.destroy();
                resolve('条码打印成功');
            });

            client.on('error', (err: any) => {
                reject(err);
            });
        });
    });
    ipcMain.handle('print-test', (event, options) => {
        return new Promise((resolve, reject) => {
            const tsplCommands = `
            SIZE 60 mm,40 mm
            GAP 2 mm,0
            DIRECTION 1
            CLS
            BARCODE 50,50,"128",100,1,0,2,"12345678TEXT"
            PRINT 1
            END
            `.trim();
            console.log('测试 TSPL 指令内容：\n', tsplCommands);
            const tempPath = path.join(process.env.TEMP || __dirname, 'temp-tspl.txt');
            fs.writeFileSync(tempPath, tsplCommands, 'utf8');
            exec(`copy /B "${tempPath}" "\\\\localhost\\TSC TX310"`, (err: any) => {
                fs.unlinkSync(tempPath);
                if (err) {
                    reject(err);
                } else {
                    resolve('测试----打印成功');
                }
            });
        });
    });
    ipcMain.handle('print-barcode3', (event, options) => {
        return new Promise((resolve, reject) => {
            const tsplCommands = `
            SIZE 60 mm,40 mm
            GAP 2 mm,0
            DIRECTION 1
            CLS
            BARCODE 20,50,"128",100,1,0,2,3,"${options.barCodeLeft}"
            BARCODE 220,50,"128",100,1,0,2,3,"${options.barCodeRight}"
            PRINT ${options.num}
            END
            `.trim();

            const tempPath = path.join(process.env.TEMP || __dirname, 'temp-tspl.txt');
            fs.writeFileSync(tempPath, tsplCommands, 'utf8');
            exec(`copy /B "${tempPath}" "\\\\localhost\\${options.printerName}"`, (err: any) => {
                fs.unlinkSync(tempPath);
                if (err) {
                    reject(err);
                } else {
                    resolve('打印成功');
                }
            });
        });
    });
    // return new Promise((resolve, reject) => {
    //     // TSPL 命令构建
    //     const tsplCommands = `
    //     SIZE ${options.width} mm,${options.height} mm
    //     GAP 2 mm,0
    //     DIRECTION 1
    //     CLS
    //     BARCODE ${options.x},${options.y},"${options.barcodeType}",${options.height - 10},1,0,${options.rotation},2,"${options.barcodeData}"
    //     TEXT ${options.textX},${options.textY},"TSS24.BF2",0,1,1,"${options.humanReadable}"
    //     PRINT ${options.num}
    //     END
    //   `;
    //     exec(`echo "${tsplCommands}" > "\\\\localhost\\${options.printerName}"`, (err: any) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve('条码打印成功');
    //         }
    //     });
    // });
    // return new Promise((resolve, reject) => {
    //     exec(`echo "${commands}" > "\\\\localhost\\${name}"`, (err: any) => {
    //         if (err) {
    //             reject(err);
    //         } else {
    //             resolve('条码打印成功');
    //         }
    //     });
    // });
    // ipcMain.handle('print-barcode4', (event, options) => {
    //     try {
    //         // 1. 查找 TSC TX310 打印机（需替换 VendorID/ProductID）
    //         const devices = usb.getDeviceList();
    //         const printer = devices.find((device: any) =>
    //             device.deviceDescriptor.idVendor === 0x1203 && // TSC VendorID
    //             device.deviceDescriptor.idProduct === 0x0234   // TSC TX310 ProductID
    //         );
    //         if (!printer) throw new Error('TSC 打印机未连接！');
    //         // 0483 是 VendorID（厂商ID）
    //         // 5740 是 ProductID（产品ID）

    //         const device = usb.findByIds(0x1203, 0x0234); // 示例 ID，请替换为你的设备
    //         if (!device) throw new Error('未找到 TSC 打印机！');

    //         // 2. 打开设备并发送 TSPL 指令
    //         device.open();
    //         const iface = device.interface(0);
    //         if (iface.isKernelDriverActive()) iface.detachKernelDriver();
    //         iface.claim();

    //         const endpoint = iface.endpoint(0x01); // 输出端点
    //         const tsplCommands = `
    //          SIZE ${options.width} mm,${options.height} mm
    //          GAP 2 mm,0
    //          DIRECTION 1
    //          CLS
    //          BARCODE ${options.x},${options.y},"${options.barcodeType}",${options.height - 10},1,0,${options.rotation},2,"${options.barcodeData}"
    //          TEXT ${options.textX},${options.textY},"TSS24.BF2",0,1,1,"${options.humanReadable}"
    //          PRINT ${options.num}
    //          END
    //          `.trim();
    //         endpoint.transfer(Buffer.from(tsplCommands), (err: any) => {
    //             if (err) throw err;
    //             device.close();
    //         });
    //         return { success: true };
    //     } catch (err) {
    //         return { success: false, error: err };
    //     }
    // });
    ipcMain.handle('print-vb-barcode1', (event, templatePath, options) => {
        return new Promise((resolve, reject) => {
            const vbsContent = `
                Dim btApp, btFormat
                Set btApp = CreateObject("BarTender.Application")
                btApp.Visible = False
                Set btFormat = btApp.Formats.Open("${templatePath}", False, "")
                btFormat.SetNamedSubStringValue "leftBarcode", "${options.leftBarcode}"
                btFormat.SetNamedSubStringValue "rightBarcode", "${options.rightBarcode}"
                btFormat.PrintOut False, False
                btFormat.Close(1)
                btApp.Quit
                Set btFormat = Nothing
                Set btApp = Nothing
            `.trim();

            const vbsPath = path.join(process.env.TEMP || __dirname, 'print_bartender.vbs');
            fs.writeFileSync(vbsPath, vbsContent, 'utf8');
            exec(`cscript //nologo "${vbsPath}"`, (err: any, stdout: any, stderr: any) => {
                if (err) {
                    console.error('打印失败:', err, stderr);
                    reject(stderr)
                } else {
                    console.log('打印成功:', stdout);
                    resolve(stdout)
                }
                fs.unlinkSync(vbsPath);
            });
        });
    });
    ipcMain.handle('print-vb-barcode2', (event, templatePath, options) => {
        return new Promise((resolve, reject) => {
            const bartenderPath = 'C:\\Program Files\\Seagull\\BarTender Suite\\bartend.exe'; // 路径按实际安装调整
            if (!fs.existsSync(templatePath)) {
                reject(`模板文件不存在: ${templatePath}`);
                return;
            }
            // if (!fs.existsSync(bartenderPath)) {
            //     reject('未找到 Bartender 安装路径');
            //     return;
            // }
            // 构造命令行参数
            // const args = [
            //     `/F="${templatePath}"`,
            //     ...Object.entries(options).map(([k, v]) => `/P /D="${k}=${v}"`),
            //     '/P', // 打印
            //     '/X'  // 打印后关闭
            // ].join(' ');

            const args = [
                '/R',
                `/F="${templatePath}"`,  // 处理路径中的引号
                ...Object.entries(options).map(([k, v]) => `/D="${k}=${v}"`), // 所有/D参数
                '/P', // 打印指令（仅出现一次）
                '/X'  // 退出
            ].join(' ');

            console.log('模板打印', args);
            exec(`"${bartenderPath}" ${args}`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.error('执行错误:', error);
                    reject(`打印错误: ${error.message} ${stderr}`);
                    return;
                }
                resolve(stdout);
            });
        });
    })
    ipcMain.handle('print-btw-template', (event, templatePath, options) => {
        return new Promise((resolve, reject) => {
            const bartenderPath = 'C:\\Program Files\\Seagull\\BarTender Suite\\bartend.exe'; // 路径按实际安装调整
            if (!fs.existsSync(templatePath)) {
                reject(`模板文件不存在: ${templatePath}`);
                return;
            }
            const args = [
                '/R',
                `/F="${templatePath}"`,  // 处理路径中的引号
                ...Object.entries(options).map(([k, v]) => `/D="${k}=${v}"`), // 所有/D参数
                '/P', // 打印指令（仅出现一次）
                '/X'  // 退出
            ].join(' ');

            console.log('模板打印', args);
            exec(`"${bartenderPath}" ${args}`, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.error('执行错误:', error);
                    reject(`打印错误: ${error.message}`);
                    return;
                }
                resolve(stdout);
            });
        });
        // return new Promise((resolve, reject) => {
        //     const bartenderPath = 'C:\\Program Files\\Seagull\\BarTender Suite\\bartend.exe'; // 路径按实际安装调整
        //     if (!fs.existsSync(templatePath)) {
        //         reject(`模板文件不存在: ${templatePath}`);
        //         return;
        //     }
        //     // if (!fs.existsSync(bartenderPath)) {
        //     //     reject('未找到 Bartender 安装路径');
        //     //     return;
        //     // }
        //     const command = `"${bartenderPath}" /P /X /D="leftBarcode=${options.leftBarcode};rightBarcode=${options.rightBarcode}" "${templatePath}"`;
        //     exec(command, (err:any, stdout:any, stderr:any) => {
        //         if (err) {
        //             console.error(`打印失败- ${err.message}`);
        //             reject(err.message)
        //             return
        //         }
        //         if (stderr) {
        //             console.error(`错误信息: ${stderr}`);
        //             reject(stderr)
        //             return 
        //         }
        //         console.log(`打印成功: ${stdout}`);
        //         resolve(stdout)
        //     });
        // });
    });
    // ipcMain.handle('print-btw-template', (event, templatePath) => {
    //     try {
    //         const devices = usb.getDeviceList();
    //         const printer = devices.find((device: any) =>
    //             device.deviceDescriptor.idVendor === 0x1203 && // TSC VendorID
    //             device.deviceDescriptor.idProduct === 0x0234   // TSC TX310 ProductID
    //         );
    //         if (!printer) throw new Error('TSC 打印机未连接！');

    //         // 读取 BTW 模板文件
    //         const btwContent = fs.readFileSync(path.resolve(templatePath), 'utf8');

    //         // 打开 USB 设备并发送数据
    //         printer.open();
    //         const iface = printer.interface(0);
    //         if (iface.isKernelDriverActive()) iface.detachKernelDriver();
    //         iface.claim();

    //         const endpoint = iface.endpoint(0x01); // 输出端点
    //         endpoint.transfer(Buffer.from(btwContent), (err: any) => {
    //             if (err) throw err;
    //             printer.close();
    //         });

    //         return { success: true };
    //     } catch (err) {
    //         return { success: false, error: err };
    //     }
    // })
    
    // ipcMain.handle('print-btw-template', (event, templatePath, options) => {
    //     return new Promise((resolve, reject) => {
    //         const bartenderPath = 'C:\\Program Files\\Seagull\\BarTender Suite\\bartend.exe'; // 路径按实际安装调整
    //         if (!fs.existsSync(templatePath)) {
    //             reject(`模板文件不存在: ${templatePath}`);
    //             return;
    //         }
    //         // if (!fs.existsSync(bartenderPath)) {
    //         //     reject('未找到 Bartender 安装路径');
    //         //     return;
    //         // }
    //         // 构造命令行参数
    //         const args = [
    //             `/F="${templatePath}"`,
    //             ...Object.entries(options).map(([k, v]) => `/P /D="${k}=${v}"`),
    //             '/P', // 打印
    //             '/X'  // 打印后关闭
    //         ].join(' ');
    //         console.log('模板打印', args);
    //         exec(`"${bartenderPath}" ${args}`, (error: any, stdout: any, stderr: any) => {
    //             if (error) {
    //                 console.error('执行错误:', error);
    //                 reject(`打印错误: ${error.message}`);
    //                 return;
    //             }
    //             resolve(stdout);
    //         });
    //     });
    // });
    ipcMain.handle('sqQuery', (event: IpcMainInvokeEvent, param: queryParam): Promise<any> => {
        return sqQuery(param);
    });
    ipcMain.handle('sqInsert', (event: IpcMainInvokeEvent, param: insertParam): Promise<any> => {
        return sqInsert(param);
    });
    ipcMain.handle('sqUpdate', (event: IpcMainInvokeEvent, param: updateParam): Promise<any> => {
        return sqUpdate(param);
    });
    ipcMain.handle('sqDelete', (event: IpcMainInvokeEvent, param: deleteParam): Promise<any> => {
        return sqDelete(param);
    });
};


export const initIpc = (winodws: IpcMainWindow) => {
    initIpcOn(winodws)
    initIpcHandle()
}