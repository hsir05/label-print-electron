import {
    app,
    BrowserWindow,
    desktopCapturer,
    ipcMain,
    Menu,
    webContents, dialog
} from "electron";
import path from "path";
const fs = require('fs');
const { createDataTable } = require("./service/database.ts")


// 忽略Electron的警告
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";
app.commandLine.appendSwitch("disable-web-security");
app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors"); // 允许跨域
app.commandLine.appendSwitch("--ignore-certificate-errors", "true"); // 忽略证书相关错误

let win: null | BrowserWindow = null;

const createWindow = async () => {

    win = new BrowserWindow({
        title: "标签打印",
        width: 1200,
        height: 800,
        icon: path.join(__dirname, "../public/logo.ico"),
        webPreferences: {
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: true,
            webviewTag: true,
            preload: path.join(__dirname, "preload.js"),
        },
    });
    const template = [
        {
            label: 'SN码生成',
            click: () => {
                // @ts-ignore
                win.webContents.send('navigate-to', '/');
            }
        },
        {
            label: '历史记录',
            click: () => {
                // @ts-ignore
                win.webContents.send('navigate-to', '/record');
            }
        },
    ]
    const myMenu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(myMenu);

    // createTable()
    


    // 在主进程中设置打印处理器
    ipcMain.handle("print-label", async (event, options) => {
        const win = new BrowserWindow({ show: false });
        await win.loadURL(options.url);

        const printOptions = {
            silent: true,
            printBackground: true,
            deviceName: options.printerName || "",
        };

        return win.webContents.print(printOptions, (success, error) => {
            if (!success) {
                console.error("打印失败22222:", error)
            };
            win.close();
        });
    });
    ipcMain.handle('print-dom-element', async (event, htmlContent) => {
        const win = new BrowserWindow({ show: false });

        try {
            await win.loadURL(`data:text/html,${encodeURIComponent(htmlContent)}`);

            return new Promise((resolve) => {
                win.webContents.print({ silent: true }, (success) => {
                    win.close();
                    resolve(success);
                });
            });
        } catch (error) {
            win.close();
            throw error;
        }
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

    // 获取用户信息
    ipcMain.handle('get-users', (event, query) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                    console.log(rows)
                }
            })
        })
    })


    // ipcMain.handle('sqQuery', (_: any, param: queryParam): Promise<any> => {
    //     return sqQuery(param);
    // });
    // ipcMain.handle('sqInsert', (_: any, param: insertParam): Promise<any> => {
    //     return sqInsert(param);
    // });
    // ipcMain.handle('sqUpdate', (_: any, param: updateParam): Promise<any> => {
    //     return sqUpdate(param);
    // });
    // ipcMain.handle('sqDelete', (_: any, param: deleteParam): Promise<any> => {
    //     return sqDelete(param);
    // });


    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(__dirname, "../dist/index.html"));
    }

    createDataTable()
};


app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    app.exit();
});

ipcMain.handle('dialog:openFile', async () => {
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
ipcMain.handle('open-file-dialog', async (event) => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Excel Files', extensions: ['xlsx', 'xls', 'csv'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    })

    if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0]
        const data = fs.readFileSync(filePath)
        return {
            fileName: path.basename(filePath),
            data: data.buffer
        }
    }
    return null
})
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf-8')
        return content
    } catch (err) {
        throw err;
    }
});



ipcMain.on("consolelog", () => {
    console.log("打印 this is 111111");
});
ipcMain.on("consolelog_2", (event, data) => {
    console.log("打印 this is ", data);
});
ipcMain.on("consolelog_3", (event, data) => {
    console.log("打印 this is ", data);
});
