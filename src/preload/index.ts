import { queryParam, insertParam, updateParam, deleteParam } from "@/common/db";
import { contextBridge, ipcRenderer } from "electron";

type OnUpdateCounterFormMainCallback = (value: number) => void;

contextBridge.exposeInMainWorld("electronAPI", {
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
    openFilePath: () => {
        return ipcRenderer.invoke('openFilePath')
    },
    printDomElement: (htmlContent: string, width: number, height: number) => {
        return ipcRenderer.invoke('print-dom-element', htmlContent, width, height)
    },
    printBarcode: (options: any) => {
        return ipcRenderer.invoke('print-barcode', options)
    },
    printTest: (options: any) => {
        return ipcRenderer.invoke('print-test', options)
    },
    printBarcode2: (options: any) => {
        return ipcRenderer.invoke('print-barcode2', options)
    },
    printBarcode3: (options: any) => {
        return ipcRenderer.invoke('print-barcode3', options)
    },
    printBarcode4: (options: any) => {
        return ipcRenderer.invoke('print-barcode4', options)
    },
    generateBarcodePreview: (options: any) => {
        return ipcRenderer.invoke('generate-barcode-preview', options)
    },
    printTwoBarcode: (name: string, commands: string) => {
        return ipcRenderer.invoke('print-two-barcode', name, commands)
    },
    printWithBtwTemplate: (template: string, option:{barcode:string,name:string}) => {
        return ipcRenderer.invoke('print-btw-template', template, option)
    },
    getPrint: () => {
        return ipcRenderer.invoke('get-printers')
    }

})




