import React, { useState, useEffect } from "react"
import Header from "./components/Header"
import "./App.css"
import axios from "axios"

// Define the data structure for your API response
interface ExchangeRateData {
  // Adjust the types according to the structure of the data you expect from the API
  series: {
    [key: string]: {
      obs: Array<{
        "time-period": string
        "obs-value": string
      }>
    }
  }
}

function App() {
  const URL =
    "https://data.norges-bank.no/api/data/EXR/A.USD.NOK.SP?format=sdmx-json&startPeriod=1994-04-15&endPeriod=2024-04-15&locale=no"

  const [data, setData] = useState<ExchangeRateData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get<ExchangeRateData>(URL).then((response) => {
      setData(response.data)
      setLoading(false)
    })
  }, [])

  return (
    <div className="App">
      <Header />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {data && (
        <div>
          <h2>Exchange Rates</h2>
          <ul>
            {Object.entries(data.series).map(([key, value]) =>
              value.obs.map((obs) => (
                <li key={obs["time-period"]}>
                  Date: {obs["time-period"]}, Value: {obs["obs-value"]}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default App
