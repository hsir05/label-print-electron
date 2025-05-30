import { sqDelete, sqInsert, sqQuery, sqUpdate, openFile, exportToExcel } from '../../../common/db'
import { Button, Space, Table, Tabs } from 'antd'
import { AndroidOutlined, AppleOutlined } from '@ant-design/icons';
import React from 'react'
import type { TableProps,TabsProps  } from 'antd';

interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
    tags: string[];
}

const operations = <Space><Button type="primary">上传</Button><Button type="primary">删除</Button></Space>;

const DBPage = () => {
    const [activeKey, setActiveKey] = React.useState<string>('1');

    const columns: TableProps<DataType>['columns'] = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <a>{text}</a>,
        },
        {
            title: '值',
            dataIndex: 'value',
            key: 'value',
        },
    ];
    const data: DataType[] = []
    const items:TabsProps['items'] = [
        {
            key: '1',
            label: `PCBA厂数据`,
            children: <Table<DataType> columns={columns} dataSource={data} />,
        },
        {
            key: '2',
            label: `产品类别`,
            children: <Table<DataType> columns={columns} dataSource={data} />,
        },
        {
            key: '3',
            label: `产品规格`,
            children: <Table<DataType> columns={columns} dataSource={data} />,
        },
        {
            key: '4',
            label: `产品代系`,
            children: <Table<DataType> columns={columns} dataSource={data} />,
        },
        {
            key: '5',
            label: `产品序列号`,
            children: <Table<DataType> columns={columns} dataSource={data} />,
        },
    ]
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

    const handleTabChange = (key: string) => {
        console.log(key);
        setActiveKey(key);
    };


    return <div>
        {/* <Space>
            <Button onClick={sqInsertHandle}>增加数据</Button>
            <Button onClick={queryHandle}>查询数据</Button>
            <Button onClick={updateHandle}>更新数据</Button>
            <Button onClick={deleteHandle}>删除数据</Button>

            <Button onClick={exportToFile}>导出</Button>
            <Button onClick={handleOpenFile}>PCBA厂数据</Button>
        </Space> */}

        <Tabs defaultActiveKey="1" onChange={handleTabChange} activeKey={activeKey} tabBarExtraContent={operations} items={items} />
    </div>
}

export default DBPage