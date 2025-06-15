import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join, resolve, dirname } from 'path';
import * as path from "path";
import { fileURLToPath } from 'url'


export type WindowPoolOptions = BrowserWindowConstructorOptions & {
    url: string,
    brandNew?: boolean,
}
const __dirname = dirname(fileURLToPath(import.meta.url))

export const getOpenUrl = (url: string) => {
    const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL;
    const baseUrl = isDev ? (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173/') : `file://${resolve(__dirname, '../index.html')}`; // 正确指向asar内的render/index.html
    const newUrl = url.startsWith('http') || url.startsWith('https') ? url : `${baseUrl}#${url}`;
    return newUrl;
}

class WindowPoolManager {
    private static instance: WindowPoolManager;
    private windowPools: Map<string, BrowserWindow>;

    private constructor() {
        this.windowPools = new Map<string, BrowserWindow>();
        this.initPool();
    }

    public static getInstance(): WindowPoolManager {
        if (!WindowPoolManager.instance) {
            WindowPoolManager.instance = new WindowPoolManager();
        }
        return WindowPoolManager.instance;
    }

    private createPoolWindow(windowOptions: WindowPoolOptions): { id: string, win: BrowserWindow } {
        const win = new BrowserWindow({ ...windowOptions, show: false });
        const idData = windowOptions.url;
        const newUrl = getOpenUrl(windowOptions.url);

        if (process.env.NODE_ENV === 'development') {
            win.loadURL(newUrl);
        } else {
            win.loadFile(path.join(__dirname, 'dist/index.html'))
        }

        this.windowPools.set(idData, win);
        return {
            id: idData,
            win,
        };
    }

    private initPool() {
        this.createPoolWindow({
            width: 1400,
            height: 820,
            show: false, // 预创建窗口应为隐藏
            resizable: false, // 禁止窗口调整大小
            maximizable: false, // 禁止最大化
            fullscreenable: false, // 禁止全屏
            webPreferences: {
                preload: join(__dirname, '../preload/index.cjs'),
            },
            url: `/preWindow/0`,
        });
    }

    private usePreWindow(): { id: string, win: BrowserWindow } | null {
        const preWindowKey = Array.from(this.windowPools.keys()).find((key) => key.startsWith('/preWindow') && this.windowPools.get(key)?.isVisible() === false);
        if (preWindowKey) {
            const preWindow = this.windowPools.get(preWindowKey);
            if (preWindow) {
                this.windowPools.delete(preWindowKey);
                return {
                    id: preWindowKey,
                    win: preWindow,
                };
            }
        }
        return null;
    }

    public openWindow(windowOptions: WindowPoolOptions): BrowserWindow {
        let windowEntry;
        const idData = windowOptions.url;
        if (idData && this.windowPools.has(idData) && !windowOptions.brandNew) {
            const win = this.windowPools.get(idData);
            if (win) {
                if (windowOptions.show === false) {
                    return win;
                } else {
                    win.show();
                    win.moveTop();
                    win.focus();
                    return win;
                }
            }
        } else {
            windowEntry = this.usePreWindow();
        }

        if (!windowEntry) {
            windowEntry = this.createPoolWindow(windowOptions);
        }

        const { win } = windowEntry;
        win.loadURL(windowOptions.url);
        if (windowOptions.show === false) {
            // nothing to do
        } else {
            win.show();
            win.moveTop();
            win.focus();
        }

        this.windowPools.set(idData, win);

        win.on('closed', () => {
            this.windowPools.delete(idData);
            if (this.windowPools.size === 0) {
                BrowserWindow.getAllWindows().forEach(w => w.close());
            }
        })
        return win;
    }
}

export default WindowPoolManager;
