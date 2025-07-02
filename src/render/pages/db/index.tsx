import { Button, Space, Table, Tabs } from 'antd'
import React, { useEffect } from 'react';
import type { TableProps, TabsProps } from 'antd';
import {
    openFile,
} from "../../../common/db";

interface DataType {
    id: number;
    label: string;
    value: string;
}

const DBPage = () => {
    const [activeKey, setActiveKey] = React.useState<string>('pcba');
    const [data, setData] = React.useState<DataType[]>([]);

    useEffect(() => {
        queryHandle(activeKey);
    }, []);

    const columns: TableProps<DataType>['columns'] = [
        {
            title: 'ID',
            dataIndex: 'id',
            align: 'center',
            render: (_, record, index) => (
                <Space>{index + 1}</Space>
            ),
        },
        {
            title: '名称',
            dataIndex: 'label',
            key: 'label',
            align: 'center',
            render: (text) => <a>{text}</a>,
        },
        {
            title: '值',
            align: 'center',
            dataIndex: 'value',
            key: 'value',
        },
    ];

    const items: TabsProps["items"] = [
        {
            key: "pcba",
            label: `PCBA厂数据`,
            children: (
                <Table<DataType>
                    rowKey={"id"}
                    bordered
                    columns={columns}
                    dataSource={data}
                />
            ),
        },
        {
            key: "manufacturer",
            label: `组装厂`,
            children: (
                <Table<DataType> rowKey={"id"} columns={columns} dataSource={data} />
            ),
        },
        {
            key: "productCode",
            label: `产品代码`,
            children: (
                <Table<DataType> rowKey={"id"} columns={columns} dataSource={data} />
            ),
        },
        {
            key: "country",
            label: `国别`,
            children: (
                <Table<DataType> rowKey={"id"} columns={columns} dataSource={data} />
            ),
        },
        {
            key: "year",
            label: `年`,
            children: (
                <Table<DataType> rowKey={"id"} columns={columns} dataSource={data} />
            ),
        },
        {
            key: "week",
            label: `周`,
            children: (
                <Table<DataType> rowKey={"id"} columns={columns} dataSource={data} />
            ),
        },
    ];
    const sqInsertHandle = async (table: string, data: any) => {
        await window.electronAPI.sqInsert({ table: table, data: data });
    };

    const queryHandle = async (tableName: string) => {
        let res = await window.electronAPI.sqQuery({
            sql: `SELECT * FROM ${tableName}`,
            params: [],
        });
        setData(res);
    }

    const handleOpenFile = async () => {
        openFile().then(async (res) => {
            if (res && res.length > 0) {
                if (activeKey === 'year') {
                    await window.electronAPI.sqDelete({ table: activeKey });
                    // @ts-ignore
                    const data = res.map((item) => ({ label: item[0]||'', value: item[1]||'' }));
                    for (let key of data) {
                        sqInsertHandle("year", key);
                    }
                } else if (activeKey == 'week') {
                    await window.electronAPI.sqDelete({ table: activeKey });
                    // @ts-ignore
                    const data = res.map((item) => ({ label: item[0]||'', value: item[1]||'' }));
                    for (let key of data) {
                        sqInsertHandle("week", key);
                    }
                } else {
                    await window.electronAPI.sqDelete({ table: "pcba" });
                    await window.electronAPI.sqDelete({ table: "manufacturer" });
                    await window.electronAPI.sqDelete({ table: "productCode" });
                    await window.electronAPI.sqDelete({ table: "country" });
                    let pcbaData = [],
                        manufacturerData = [],
                        productCodeData = [],
                        countryData = [];

                    for (let key of res) {
                        // @ts-ignore
                        productCodeData.push({ label: key[0]||'', value: key[1]||'' });
                        // @ts-ignore
                        pcbaData.push({ label: key[2]||'', value: key[3]||'' });
                        // @ts-ignore
                        manufacturerData.push({ label: key[4]||'', value: key[5]||'' });
                        // @ts-ignore
                        countryData.push({ label: key[6]||'', value: key[7]||'' });
                    }
                    insertData("pcba", pcbaData);
                    insertData("manufacturer", manufacturerData);
                    insertData("productCode", productCodeData);
                    insertData("country", countryData);
                }
                queryHandle(activeKey);
            }
        }).catch((err) => {
            console.error("Error opening file:", err);
        });
    };
    const insertData = async (tableName: string, data: { label: string, value: string }[]) => {
        for (let key of data) {
            sqInsertHandle(tableName, key);
        }
    };

    const deleteHandle = async () => {
        //  condition: 'name = "a"'
        await window.electronAPI.sqDelete({ table: activeKey })
        // queryHandle(activeKey);
    }

    const handleTabChange = (key: string) => {
        setActiveKey(key);
        setData([]);
        queryHandle(key)
    };

    // const operations = <Space><Button type="primary" onClick={handleOpenFile}>上传</Button><Button type="primary" onClick={deleteHandle}>删除</Button></Space>;
    const operations = <Space><Button type="primary" onClick={handleOpenFile}>上传</Button></Space>;
    return <div>
        <Tabs defaultActiveKey="pcba" type="card" size="large" onChange={handleTabChange} activeKey={activeKey} tabBarExtraContent={operations} items={items} />
    </div>
}

export default DBPage