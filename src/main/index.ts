import { BrowserWindow, Menu, app } from "electron";
import { join, dirname } from "path";
import { initIpc } from "./ipc";
import { openWindow } from "./window";
import { fileURLToPath } from "url";

import { checkTrialValid } from '../utils/trial-check';

const __dirname = dirname(fileURLToPath(import.meta.url)) 
const initMenu = (mainWindow: BrowserWindow) => {
    const menu = Menu.buildFromTemplate([
        {
            label: app.name,
            submenu: [
                {
                    click: () => {
                        mainWindow.webContents.send("update-counter", 1);
                    },
                    label: "IncrementNumber",
                },
            ],
        },
    ]);
    Menu.setApplicationMenu(null);
};
const main = async () => {
    const mainWindow = openWindow({
        width: 1400,
        height: 800,
        webPreferences: { 
            preload: join(__dirname, "../preload/index.cjs"),
        },
        url: `/main`,
    });

    if (import.meta.env.MODE === "dev") {
        //   mainWindow.webContents.openDevTools({ mode: "detach", activate: true });
        mainWindow.webContents.openDevTools();
    }

    initMenu(mainWindow);
    initIpc({
        mainWindow
    });

    const trialStatus = checkTrialValid();
    if (!trialStatus.valid) {
        // 可以弹窗提示或直接退出
        console.error(trialStatus.reason);
        app.quit(); // Electron 下直接退出应用
    }
};

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.whenReady().then(() => {
    main();
});
