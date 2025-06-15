import { Button, Space, Table } from "antd";
import React, { useEffect } from "react";
import type { TableProps } from "antd";


interface DataType {
  id: number;
  snCode: string;
  create_time: string;
  account: string;
  serial_number: number;
  num: number;
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
      title: "详情",
      align: "center",
      dataIndex: "snCodeList",
      key: "snCodeList",
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
    setData(res);
  };

  return (
    <Table<DataType>
      rowKey={"id"}
      bordered
      columns={columns}
      dataSource={data}
    />
  );
};

export default Main;
