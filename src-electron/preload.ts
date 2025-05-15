import { contextBridge, ipcRenderer } from "electron";

export interface queryParam {
    sql: string;
    params?: any[];
}
export interface insertParam {
    table: string;
    data: { [key: string]: any };
}

export interface updateParam {
    table: string;
    data: { [key: string]: any };
    condition: string;
}

export interface deleteParam {
    table: string;
    condition: string;
}

contextBridge.exposeInMainWorld("ipcRenderer", {
    send: (channel, ...args) => {
        if (args?.length > 0) {
            ipcRenderer.send(channel, ...args);
        } else {
            ipcRenderer.send(channel);
        }
    },
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    on: (channel, func) => {
        ipcRenderer.on(channel, func);
    },
    once: (channel, func) => {
        ipcRenderer.once(channel, func);
    },
    removeListener: (channel, func) => {
        ipcRenderer.removeListener(channel, func);
    },
    sendSync: (channel, ...args) => {
        if (args?.length > 0) {
            return ipcRenderer.sendSync(channel, ...args);
        } else {
            return ipcRenderer.sendSync(channel);
        }
    },
    invoke: (channel, ...args) => {
        try {
            return ipcRenderer.invoke(channel, ...args);
        } catch (error) {
            console.error(`Error invoking API: ${channel}`, error);
        }
    },

    sqQuery: (param: queryParam) => {
        return ipcRenderer.invoke('sqQuery', param)
    },
    sqInsert: (param: insertParam) => {
        return ipcRenderer.invoke('sqInsert', param)
    },
    sqUpdate: (param: updateParam) => {
        return ipcRenderer.invoke('sqUpdate', param)
    },
    sqDelete: (param: deleteParam) => {
        return ipcRenderer.invoke('sqDelete', param)
    }

});
