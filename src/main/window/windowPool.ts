import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join,resolve } from 'path';
import * as path from "path";

export type WindowPoolOptions = BrowserWindowConstructorOptions & {
  url: string,
  brandNew?: boolean,
}

export const getOpenUrl = (url:string) => {
  const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL;
  const baseUrl = isDev ? (process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173/'): `file://${resolve(__dirname, '../index.html')}`; // 正确指向asar内的render/index.html
  const newUrl = url.startsWith('http') || url.startsWith('https') ? url : `${baseUrl}#${url}`;
  return newUrl;
}

class WindowPoolManager {
  private static instance: WindowPoolManager;
  private windowPoolSize: number;
  private windowPools: Map<string, BrowserWindow>;

  private constructor(poolSize: number) {
    this.windowPoolSize = poolSize;
    this.windowPools = new Map<string, BrowserWindow>();
    this.initPool();
  }

  public static getInstance(poolSize: number = 2): WindowPoolManager {
    if (!WindowPoolManager.instance) {
      WindowPoolManager.instance = new WindowPoolManager(poolSize);
    }
    return WindowPoolManager.instance;
  }

  private createPoolWindow(windowOptions: WindowPoolOptions): { id: string, win: BrowserWindow } {
    const win = new BrowserWindow({ ...windowOptions, show: false });
    const idData = windowOptions.url;
    const newUrl = getOpenUrl(windowOptions.url);
    // win.loadURL(newUrl);

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
    for (let i = 0; i < this.windowPoolSize; i++) {
      this.createPoolWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
          preload: join(__dirname, '../preload/index.cjs'),
        },
        url: `/preWindow/${i}`, // 使用占位符 URL
      });
    }
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
      this.ensurePreWindowPool();
    })

    this.ensurePreWindowPool();

    return win;
  }

  private ensurePreWindowPool() {
    const currentPreWindowCount = Array.from(this.windowPools.keys()).filter((key) => key.startsWith('/preWindow')).length;
    if (currentPreWindowCount < this.windowPoolSize) {
      this.createPoolWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
          preload: join(__dirname, '../preload/index.cjs'),
        },
        url: `/preWindow/${currentPreWindowCount + 1}`,
      });
    }
  }
}

export default WindowPoolManager;
