import { sqDelete, sqInsert, sqQuery, sqUpdate,openFile } from '@/common/db'
import { Button, Space } from 'antd'
import React from 'react'
const DBPage = () => {

    const sqInsertHandle = () => {
        sqInsert({
            table: 'test',
            data: {
                name: 'a',
                age: 18
            }
        }).then((res: any) => {
            console.log(res) 
        })
    }

    const queryHandle = () => {
        sqQuery({
            sql: 'SELECT * FROM test',
            params: []
        }).then((res: any) => {
            console.log(res)
        })
    }

    const updateHandle = () => {
        sqUpdate({
            table: 'test',
            data: {
                age: 22
            },
            condition: 'name = "a"'
        }).then((res: any) => {
            console.log(res)
        })
    }

    const uploadFile = (key) => {
        let name = ''
        switch (key) {
            case '1':
                handleOpenFile()
                break;
    
            default:
                break;
        }
    }
    const handleOpenFile = async () => {
        openFile().then((res) => {
            console.log(res)
        }).catch((err) => {
            console.error("Error opening file:", err);
        });
        // try {
        //     const result = await window.ipcRenderer.openFile();
        //     if (result) {
        //         // 读取Excel文件
        //         const workbook = XLSX.read(result.data, { type: "array" });
        //         const firstSheetName = workbook.SheetNames[0];
        //         const worksheet = workbook.Sheets[firstSheetName];
    
        //         // 转换为JSON
        //         const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
        //         if (jsonData.length > 0) {
        //             let yearList = jsonData.slice(1);
        //             console.log(yearList);
        //         }
        //     }
        // } catch (error) {
        //     console.error("Error reading file:", error);
        // }
    };

    const deleteHandle = () => {
        sqDelete({
            table: 'test',
            condition: 'name = "a"'
        }).then((res: any) => {
            console.log(res)
        })
    }

    return <div>
        <Space>
            <Button onClick={sqInsertHandle}>增加数据</Button>
            <Button onClick={queryHandle}>查询数据</Button>
            <Button onClick={updateHandle}>更新数据</Button>
            <Button onClick={deleteHandle}>删除数据</Button>

            <Button onClick={handleOpenFile}>PCBA厂数据</Button>
        </Space>
    </div>
}

export default DBPage