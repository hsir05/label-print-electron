import type { queryParam, insertParam, updateParam, deleteParam } from "./api";
import * as XLSX from "xlsx";

export const openFile = async () => {
    try {
        const result = await window.electronAPI.openFile();
        if (result) {
            const workbook = XLSX.read(result.data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            // 转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
                let yearList = jsonData.slice(1);
                return yearList;
            }
        }
    } catch (error) {
        console.error("Error reading file:", error);
    }
};
export const exportToExcel = (data: any[][], filename: string, sheetName: string = 'Sheet1') => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };
export const sqQuery = (param: queryParam) => {
  if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
    return window.electronAPI.sqQuery(param);
  } else {
    return import("./api").then((module) => module.sqQuery(param));
  }
};

export const sqInsert = (param: insertParam) => {
  if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
    return window.electronAPI.sqInsert(param);
  } else {
    return import("./api").then((module) => module.sqInsert(param));
  }
}; 
export const sqUpdate = (param: updateParam) => {
  if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
    return window.electronAPI.sqUpdate(param);
  } else {
    return import("./api").then((module) => module.sqUpdate(param));
  }
};
export const sqDelete = (param: deleteParam) => {
  if (import.meta.env.VITE_CURRENT_RUN_MODE === "render") {
    return window.electronAPI.sqDelete(param);
  } else {
    return import("./api").then((module) => module.sqDelete(param));
  }
};

export { queryParam, insertParam, updateParam, deleteParam };
