import React, { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import axios from "axios"
import Header from "./components/Header"
import "./App.css"

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface Observation {
  timePeriod: string
  value: number
}

interface DataSet {
  series: {
    [key: string]: {
      observations: {
        [key: string]: [string]
      }
    }
  }
}

interface ExchangeRateData {
  data: {
    dataSets: DataSet[]
    structure: {
      dimensions: {
        observation: {
          id: string
          values: {
            id: string
            name: string
          }[]
        }[]
      }
    }
  }
}

function App() {
  const URL =
    "https://data.norges-bank.no/api/data/EXR/A.USD.NOK.SP?format=sdmx-json&startPeriod=1994-04-15&endPeriod=2024-04-15&locale=no"

  const [data, setData] = useState<Observation[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [searchText, setSearchText] = useState("")

  useEffect(() => {
    axios
      .get<ExchangeRateData>(URL)
      .then((response) => {
        const dataSet = response.data.data.dataSets[0]
        const observationDimension =
          response.data.data.structure.dimensions.observation.find(
            (dim) => dim.id === "TIME_PERIOD"
          )

        if (!observationDimension) {
          throw new Error("TIME_PERIOD dimension not found in the API response")
        }

        const timePeriods = observationDimension.values.map(
          (value) => value.name
        )
        const series = dataSet.series["0:0:0:0"].observations

        const parsedData: Observation[] = timePeriods.map(
          (timePeriod, index) => ({
            timePeriod,
            value: parseFloat(series[index]?.[0] || "0"),
          })
        )

        setData(parsedData)
        setLoading(false)
      })
      .catch((error) => {
        setError("Error fetching data")
        setLoading(false)
      })
  }, [])

  // Prepare data for the chart
  const chartData = {
    labels: data.map((obs) => obs.timePeriod),
    datasets: [
      {
        label: "USD to NOK Exchange Rate",
        data: data.map((obs) => obs.value),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
      },
    ],
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputText = event.target.value
    setSearchText(inputText)
  }

  return (
    <div className="App">
      <Header />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div className="mainContainer">
          <div className="leftMain">
            <div className="searchInputContainer">
              <i className="fa fa-search"></i>
              <input
                className="searchInput"
                type="text"
                value={searchText}
                onChange={handleTextChange}
              />
            </div>
          </div>
          <div className="rightMain">
            <h2>USD to NOK Exchange Rate Over Time</h2>
            <div className="graphContainer">
              <Line data={chartData} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
