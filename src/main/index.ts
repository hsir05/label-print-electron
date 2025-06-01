import { BrowserWindow, Menu, app } from "electron";
import { join } from "path";
import { initIpc } from "./ipc";
import { openWindow } from "./window";

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
    Menu.setApplicationMenu(menu);
};

const main = async () => {
    const mainWindow = openWindow({
        width: 400,
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
};

app.on('window-all-closed', () => {
    console.log('----------------32233');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.whenReady().then(() => {
    main();
    //   initTestTask();
});
