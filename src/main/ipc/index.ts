import { BrowserWindow, ipcMain, IpcMainEvent, IpcMainInvokeEvent, dialog, shell } from "electron"
import { Elog, LOG_PARAMS, Log4 } from "@/common/log"
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
    ipcMain.on('counterValueCallback', (event: IpcMainEvent, value: string) => {
        console.log('counterValueCallback', value)
    })
    ipcMain.on('Elog', (event: IpcMainEvent, arg: LOG_PARAMS) => {
        const { type, value } = arg
        switch (type) {
            case 'info':
                Elog.info(value)
                break
            case 'error':
                Elog.error(value)
                break
            case 'warn':
                Elog.warn(value)
                break
            case 'debug':
                Elog.debug(value)
                break
            default:
                console.log('Unknown log type:', type, ...value)
                break
        }
    })
    ipcMain.on('Log4', (event: IpcMainEvent, arg: LOG_PARAMS) => {
        const { type, value } = arg
        switch (type) {
            case 'info':
                Log4.info(value)
                break
            case 'error':
                Log4.error(value)
                break
            case 'warn':
                Log4.warn(value)
                break
            case 'debug':
                Log4.debug(value)
                break
            default:
                console.log('Unknown log type:', type, ...value)
                break
        }
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