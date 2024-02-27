import { FC, useEffect, useState } from 'react';

type Tables = {
  tableid ?: string,
  phone: string,
  status: string,
  code ?: string | null,
  startTime: string,
  endTime ?: string
}

const url = 'https://reserve-buffet-api-production.up.railway.app'

const App: FC = () => {
  const [wsData, setWsData] = useState<Tables[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  // ws สามารถนำไปใช้นอก useEffect ได้

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${url}/gettables`);
      const data = await response.json();
      setWsData(data)
      console.log(data)
    };

    fetchData();

    const ws = new WebSocket(`ws://reserve-buffet-api-production.up.railway.app/ws`);

    ws.onopen = () => {
      console.log('WebSocket is connected.');
    };

    ws.onmessage = (event) => {
      const newData:Tables = JSON.parse(event.data);
      setWsData((oldData:Tables[]) => oldData.map((ele: Tables) => ele.tableid === newData.tableid ? newData : ele));
    };

    ws.onerror = (error) => {
      console.log('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket is closed.');
    };

    setWs(ws);
    
    return () => {
      ws.close();
    };
  }, []);

  const updateRow = async (tableid: string, status:string, phone:string, code:string, startTime:string, endTime:string) => {
    const res = await fetch(`${url}/updatestate/${tableid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({status,phone,code,startTime,endTime}),
    });
    return res.json()
  }

  return (
    <>
    <table cellSpacing={10} >
      <thead></thead>
      <tbody>
      {
        wsData.map((ele)=>{
          return <tr key={ele.tableid}>
            <td>{ele.tableid}</td>
            <td>{ele.phone}</td>
            <td>{ele.status}</td>
            <td>{ele.code}</td>
            <td>{ele.startTime}</td>
            <td>{ele.endTime}</td>
            </tr>
        })
      }

      </tbody>
      <tfoot></tfoot>
    </table>
    </>
  );
}

export default App;
