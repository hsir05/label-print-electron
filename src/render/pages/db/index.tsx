import { sqDelete, sqInsert, sqQuery, sqUpdate, openFile, exportToExcel } from '../../../common/db'
import { Button, Space, Table, Tabs } from 'antd'
import React, { useState, useEffect } from 'react';
import type { TableProps,TabsProps  } from 'antd';


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
    const sqInsertHandle = (table: string, data: any) => {
        sqInsert({table: table, data: data}).then(() => {
            queryHandle(activeKey)
        })
    }

    const queryHandle = (tableName: string) => {
        sqQuery({ 
            sql: `SELECT * FROM ${tableName}`,
            params: []
        }).then((res: any) => {
            setData(res)
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

    const uploadFile = (key: string) => {
        let name = ''
        switch (key) {
            case '1':
                handleOpenFile()
                break;

            default:
                break;
        }
    }
    const exportToFile = () => {
        const sampleData = [
            ['姓名', '年龄', '城市'],
            ['张三', 28, '北京'],
            ['李四', 32, '上海'],
            ['王五', 25, '广州']
        ];

        // 调用导出函数
        exportToExcel(sampleData, '示例数据');
    }
    const handleOpenFile = async () => {
        openFile().then((res)=> {
            if (res && res.length>0){
                const data = res.map((item: any) => ({label: item[0], value: item[1]}));
               for(let key of data){
                sqInsertHandle(activeKey, key)
               }
            }
        }).catch((err) => {
            console.error("Error opening file:", err);
        });
    };

    const deleteHandle = () => {
        //  condition: 'name = "a"'
        sqDelete({table: activeKey}).then(() => {
            queryHandle(activeKey)
        })
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