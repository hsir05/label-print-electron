import { Space, Table } from "antd";
import React, { useEffect } from "react";
import type { TableProps } from "antd";


interface DataType {
  id: number;
  snCode: string;
  create_time: string;
  account: string;
  serial_number: number;
  num: number;
  snCodeList:  string[];
}
const Main = () => {
  const [data, setData] = React.useState<DataType[]>([]);

  useEffect(() => {
    queryHandle();
  }, []);

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
      align: "center",
      render: (_, record, index) => <Space>{index + 1}</Space>,
    },
    {
      title: "SNCode",
      dataIndex: "snCode",
      key: "snCode",
      align: "center",
    },
    {
      title: "流水号",
      align: "center",
      dataIndex: "serial_number",
      key: "serial_number",
    },
    {
      title: "生成数量",
      align: "center",
      dataIndex: "num",
      key: "num",
    },
    {
      title: "生成时间",
      align: "center",
      dataIndex: "create_time",
      key: "create_time",
    },
    {
      title: "操作账号",
      align: "center",
      dataIndex: "account",
      key: "account",
    },
  ];

  const queryHandle = async () => {
    let res = await window.electronAPI.sqQuery({
      sql: `SELECT * FROM history`,
      params: [],
    });
    for(let key of res){
        key.snCodeList = JSON.parse(key.snCodeList);
    }
    setData(res);
  };

  return (
    <Table<DataType>
      rowKey={"id"}
      bordered
      expandable={{
        expandedRowRender: (record) => (
          <div style={{display:'flex','flexWrap':'wrap'}}>
            {record.snCodeList.map((item, index) => (
              <span style={{ margin: "5px" }}>{item},</span>
            ))}
          </div>
        ),
      }}
      columns={columns}
      dataSource={data}
    />
  );
};

export default Main;
