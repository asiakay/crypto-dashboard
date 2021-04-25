import React, { useState, useEffect, useRef } from "react";
import Dashboard from "./components/Dashbboard";
import { formatData } from "./utils";
import "./styles.css"; 



export default function App() {
  const [currencies, setcurrencies] = useState([]);
  const [pair, setpair] = useState("");
  const [price, setprice] = useState("0.00");
  const [pastData, setpastData] = useState({});
  const ws = useRef(null);

  let first = useRef(false);
  const url = "https://api.pro.coinbase.com";
  
  useEffect(() => {
    //connect to websocket api
    
    ws.current = new WebSocket("wss.//ws-feed.pro.coinbase.com");
    // inside useEffect we need to make API with async function
    
    let pairs = [];


    const apiCall = async () => {
      await fetch(url + "/products")
      .then((res) => res.json())
      .then((data) => (pairs = data));

      //coinbase returns over 120 current=cie and this will
      // filter to only USD based pairs
      // eslint-disable-next-line array-callback-return
      let filtered = pairs.filter((pair) => {
        if (pair.quote_currency === "USD") {
          return pair;
        }
      });

      // sort filtered currency pairs alphabetically
      filtered = filtered.sort((a, b) => {
        if (a.base_currency < b.base_currency){
          return -1;
        }
        if (a.base_currency > b.base_currency){
          return 1;
        }
        return 0;
      });

      setcurrencies(filtered);

      first.current = true;
    };

    // calling the async function
    apiCall() 
  }, []) // the array is empty because 

useEffect(() => {
  if (!first.current) {
    return;
  }

  let msg = {
    type: "subscribe",
    product_ids: [pair],
    channels: ["ticker"]
  };
  let jsonMsg = JSON.stringify(msg);
  ws.current.send(jsonMsg);

  let historicalDataURL = `${url}/products/${pair}/candles?granularity=86400`;
  const fetchHistoricalData = async () => {
    let dataArr = [];
    await fetch(historicalDataURL)
    .then((res) => res.json())
    .then((data) => (dataArr = data));

    // helper function to format data to be implemented later
    let formattedData = formatData(dataArr);
    setpastData(formattedData);
  };

  // run async function to get historical data
  fetchHistoricalData();
 
  //need to update event listener for the websocket object to that it is listening for the newly updated currency pair
  ws.current.onmessage = (e) => {
    let data = JSON.parse(e.data);
    if (data.type !== "ticker"){
      return;
    }

    // every time we recieve an even from teh websocket for our currency pair, update the price in state
    if (data.product_id === pair){
      setprice(data.price);
    }
  };
  // dependency array is passed pair state, will run on any pair state change
}, [pair]);

const handleSelect = (e) => {
  let unsubMsg = {
    type: "unsubscribe",
    product_ids: [pair],
    channels: ["ticker"]
  };
  let unsub = JSON.stringify(unsubMsg);

  ws.current.send(unsub);

  setpair(e.target.value);
};
  
  return (
    <div className="container">
      {
      <select name="currency" value={pair} onChange={handleSelect}>
        {currencies.map((cur, idx) => {
          return (
            <option key={idx} value={cur.id}>
            {cur.display_name}
            </option>
        );
        })}
      </select>
    }
    <Dashboard price={price} data={pastData} />
    </div>
  );
}



