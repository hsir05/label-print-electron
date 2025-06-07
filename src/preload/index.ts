import { queryParam, insertParam, updateParam, deleteParam } from "@/common/db";
import { contextBridge, ipcRenderer } from "electron";

type OnUpdateCounterFormMainCallback = (value: number) => void;

contextBridge.exposeInMainWorld("electronAPI", {
    // openUrlByDefaultBrowser: (url: string) => ipcRenderer.send('openUrlByDefaultBrowser', url),
    communicateWithEachOtherWithPromise: (msg: string) => ipcRenderer.invoke('communicateWithEachOtherWithPromise', msg),
    communicateWithEachOtherSendMsg: (msg: string) => ipcRenderer.send('communicateWithEachOtherSendMsg', msg),
    onCommunicateWithEachOtherReply: (callback: (msg: string) => void) => ipcRenderer.on('communicateWithEachOtherReply', (_event, arg) => callback(arg)),
    communicateWithEachOtherSendSyncMsg: (msg: string) => ipcRenderer.sendSync('communicateWithEachOtherSendSyncMsg', msg),
    onUpdateCounterFormMain: (callback: OnUpdateCounterFormMainCallback) => ipcRenderer.on('update-counter', (_event, value) => callback(value)),

   
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
    },
    openFile: () => {
        return ipcRenderer.invoke('openFile') 
    },
    printDomElement: (htmlContent: string, width: number, height: number) => {
        return ipcRenderer.invoke('print-dom-element', htmlContent, width, height)
    },
    printDomElements: () => {
        return ipcRenderer.invoke('print-dom-elements')
    },
    getPrint: () => {
        return ipcRenderer.invoke('get-printers')
    }

})




