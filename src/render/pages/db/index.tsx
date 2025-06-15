import { Button, Space, Table, Tabs } from 'antd'
import React, {  useEffect } from 'react';
import type { TableProps,TabsProps  } from 'antd';
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
            align:'center',
            render: (_,record,index) => (
                <Space>{index+1}</Space>
              ),
          },
        {
            title: '名称',
            dataIndex: 'label',
            key: 'label',
            align:'center',
            render: (text) => <a>{text}</a>,
        },
        {
            title: '值',
            align:'center',
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
        key: "category",
        label: `产品类别`,
        children: (
          <Table<DataType> rowKey={"id"} columns={columns} dataSource={data} />
        ),
      },
      {
        key: "specifications",
        label: `产品规格`,
        children: (
          <Table<DataType> rowKey={"id"} columns={columns} dataSource={data} />
        ),
      },
      {
        key: "series",
        label: `产品代系`,
        children: (
          <Table<DataType> rowKey={"id"} columns={columns} dataSource={data} />
        ),
      },
      {
        key: "productionId",
        label: `产品序列号`,
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

    const queryHandle =async (tableName: string) => {
        let res = await window.electronAPI.sqQuery({
          sql: `SELECT * FROM ${tableName}`,
          params: [],
        });
        setData(res);
    }

    const handleOpenFile = async () => {
        openFile().then((res)=> {
            if (res && res.length>0){
                const data = res.map((item: any) => ({label: item[0], value: item[1]}));
               for(let key of data){
                sqInsertHandle(activeKey, key)
               }
               queryHandle(activeKey);
            }
        }).catch((err) => {
            console.error("Error opening file:", err);
        });
    };

    const deleteHandle = async() => {
        //  condition: 'name = "a"'
        await window.electronAPI.sqDelete({ table: activeKey })
        queryHandle(activeKey);
    }

    const handleTabChange = (key: string) => {
        setActiveKey(key);
        setData([]);
        queryHandle(key)
    };

    const operations = <Space><Button type="primary" onClick={handleOpenFile}>上传</Button><Button type="primary" onClick={deleteHandle}>删除</Button></Space>;
    return <div>
        <Tabs defaultActiveKey="pcba"  type="card" size="large" onChange={handleTabChange} activeKey={activeKey} tabBarExtraContent={operations} items={items} />
    </div>
}

export default DBPage