import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent, dialog, shell } from "electron"
import { deleteParam, insertParam, queryParam, sqDelete, sqInsert, sqQuery, sqUpdate, updateParam } from "@/common/db"
import path from "path";
const fs = require('fs');
export interface IpcMainWindow {
    mainWindow: BrowserWindow,
    // workWindow: BrowserWindow
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
    ipcMain.handle('communicateWithEachOtherWithPromise', (event: IpcMainInvokeEvent, ...args: any[]): Promise<string> => {
        const msg = args[0];
        return Promise.resolve(`I got ${msg}, ok`);
    });
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
    ipcMain.handle("get-printers", async () => {
        try {
            const win = new BrowserWindow({ show: false });
            return win.webContents.getPrintersAsync()
        } catch (error) {
            console.error('获取打印机失败:', error)
            return []
        }
    });
    // ipcMain.handle('print-dom-element', async (event, htmlContent) => {
    //     const win = new BrowserWindow({ show: false });
    //     try {
    //         await win.loadURL(`data:text/html,${encodeURIComponent(htmlContent)}`);
    //         return new Promise(async (resolve) => {
    //             const win = new BrowserWindow({ show: false });
    //             win.webContents.print({ silent: true }, (success) => {
    //                 win.close();
    //                 resolve(success);
    //             });
    //         });
    //     } catch (error) {
    //         win.close();
    //         throw error;
    //     }
    // });
    ipcMain.handle('print-dom-element', async (event,htmlContent, width=3000, height = 1200) => {
        // 保留窗口引用防止垃圾回收
        const win = new BrowserWindow({ 
            show: false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        // 确保无论如何都会清理窗口
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
            // 使用更可靠的加载方式
            await win.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(htmlContent)}`);
            // 双重检查确保内容加载
            await win.webContents.executeJavaScript('document.readyState');
            return await new Promise((resolve) => {
                const handleLoad = () => {
                    win.webContents.print({ silent: true }, (success) => {
                        clearTimeout(timeout);
                        resolved = true;
                        win.close();
                        resolve({ success });
                    });
                };

                win.webContents.on('did-finish-load', handleLoad);
                win.webContents.on('dom-ready', handleLoad);
                // 额外检查：如果内容已经加载
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
    ipcMain.handle('print-dom-elements', async (event, htmlContent) => {
        const win = new BrowserWindow({ show: false });
        try {
            await win.loadURL(`data:text/html,${encodeURIComponent(htmlContent)}`);
            return await new Promise((resolve, reject) => {
                let finished = false;
                const timeout = setTimeout(() => {
                    if (!finished) {
                        finished = true;
                        win.close();
                        reject(new Error('打印超时'));
                    }
                }, 10000);

                win.webContents.on('did-finish-load', () => {
                    win.webContents.print({ silent: true }, (success) => {
                        clearTimeout(timeout);
                        if (!finished) {
                            finished = true;
                            win.close();
                            resolve(success);
                        }
                    });
                });

                win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
                    clearTimeout(timeout);
                    if (!finished) {
                        finished = true;
                        win.close();
                        reject(new Error('页面加载失败: ' + errorDescription));
                    }
                });
            });
        } catch (error) {
            win.close();
            throw error;
        }
    });
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