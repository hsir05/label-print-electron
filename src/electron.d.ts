// electron.d.ts
import { LOG_TYPE } from "@/common/log";
import { queryParam, insertParam, updateParam, deleteParam } from "@/common/db";

export interface IElectronAPI {
    openUrlByDefaultBrowser: (url: string, options?: Electron.OpenExternalOptions) => Promise<void>,
    communicateWithEachOtherSendMsg: (msg: string | object) => Promise<string>,
    communicateWithEachOtherSendSyncMsg: (msg: string) => string,
  
    openNewWindowByDefaultHandle: (url: string) => void,
    sqQuery: (param: queryParam) => Promise<any>,
    sqInsert: (param: insertParam) => Promise<any>,
    sqUpdate: (param: updateParam) => Promise<any>,
    sqDelete: (param: deleteParam) => Promise<any>
    openFile: () => Promise<{ data: Uint8Array, filePath: string }>,
    openFilePath: () => Promise<string >,
    printDomElement: (htmlContent: string, width: number, height: number, scaleFactor:number) => Promise<boolean>,
    printDomElements: (htmlContent: string) => Promise<boolean>,
    getPrint: () => Promise<any[]>,
    printBarcode: (option: any) => Promise<boolean>,
    printBarcode2: (option: any) => Promise<boolean>, 
    printBarcode3: (option: any) => Promise<boolean>,
    printTest: () => Promise<boolean>,
    printBarcode4: (option: any) => Promise<boolean>, 
    generateBarcodePreview: (barcodeData: any) => Promise<string>,
    printTwoBarcode: (name: string,commands:string) => Promise<string>,
    printWithBtwTemplate: (template: string, data: { leftBarcode: string, rightBarcode?: string }) => Promise<string>,
    printVBBarcode1: (template: string, data: { leftBarcode: string, rightBarcode?: string }) => Promise<string>,
    printVBBarcode2: (template: string, data: { leftBarcode: string, rightBarcode?: string }) => Promise<string>,
}

declare global {
    interface Window {
        electronAPI: IElectronAPI
    }
}