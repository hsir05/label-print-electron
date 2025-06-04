import { Button, Space, Table } from "antd";
import React, { useEffect } from "react";

interface DataType {
  id: number;
  snCode: string;
  create_time: string;
  account: string;
  serial_number: number;
  num: number;
}
const Record = () => {
  const [data, setData] = React.useState<DataType[]>([]);

  useEffect(() => {
  }, []);



  const queryHandle = async () => {
    let res = await window.electronAPI.sqQuery({
      sql: `SELECT * FROM history`,
      params: [],
    });
    setData(res);
  };

  return (
   <div className="">
    12312
   </div>
  );
};

export default Record;
