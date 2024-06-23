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
// import Header from "./components/Header"
import "./App.css"

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
  const currencies = [
    "USD - Amerikanske dollar",
    "EUR - Euro",
    "SEK - Svenske kroner",
    "GBP - Britiske pund",
  ]
  const [selectedCurrencies, setSelectedCurrencies] = useState([])
  const [searchText, setSearchText] = useState("")
  const [frekvens, setFrekvens] = useState("A")
  const [startDate, setStartDate] = useState("1994-04-15")
  const [endDate, setEndDate] = useState("2024-04-15")

  let URL = `https://data.norges-bank.no/api/data/EXR/${frekvens}.USD+EUR+SEK+GBP.NOK.SP?format=sdmx-json&startPeriod=${startDate}&endPeriod=${endDate}&locale=no`

  const [usdData, setUsdData] = useState<Observation[]>([])
  const [eurData, setEurData] = useState<Observation[]>([])
  const [sekData, setSekData] = useState<Observation[]>([])
  const [gbpData, setGbpData] = useState<Observation[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

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

        let usdSeries: any
        let eurSeries: any
        let gbpSeries: any
        let sekSeries: any

        if (frekvens === "A") {
          usdSeries = dataSet.series["0:0:0:0"].observations
          eurSeries = dataSet.series["0:1:0:0"].observations
          gbpSeries = dataSet.series["0:2:0:0"].observations
          sekSeries = dataSet.series["0:3:0:0"].observations
        } else if (frekvens === "M") {
          sekSeries = dataSet.series["0:0:0:0"].observations
          gbpSeries = dataSet.series["0:1:0:0"].observations
          usdSeries = dataSet.series["0:2:0:0"].observations
          eurSeries = dataSet.series["0:3:0:0"].observations
        } else if (frekvens === "B") {
          usdSeries = dataSet.series["0:0:0:0"].observations
          gbpSeries = dataSet.series["0:1:0:0"].observations
          eurSeries = dataSet.series["0:2:0:0"].observations
          sekSeries = dataSet.series["0:3:0:0"].observations
        }

        const parsedUsdData: Observation[] = timePeriods.map(
          (timePeriod, index) => ({
            timePeriod,
            value: parseFloat(usdSeries[index]?.[0] || "0"),
          })
        )

        const parsedEurData: Observation[] = timePeriods.map(
          (timePeriod, index) => ({
            timePeriod,
            value: parseFloat(eurSeries[index]?.[0] || "0"),
          })
        )

        const parsedSekData: Observation[] = timePeriods.map(
          (timePeriod, index) => ({
            timePeriod,
            value: parseFloat(sekSeries[index]?.[0] || "0"),
          })
        )

        const parsedGbpData: Observation[] = timePeriods.map(
          (timePeriod, index) => ({
            timePeriod,
            value: parseFloat(gbpSeries[index]?.[0] || "0"),
          })
        )

        setUsdData(parsedUsdData)
        setEurData(parsedEurData)
        setSekData(parsedSekData)
        setGbpData(parsedGbpData)
        setLoading(false)

        console.log(response)
      })
      .catch((error) => {
        setError("Error fetching data")
        setLoading(false)
      })
  }, [frekvens, startDate, endDate])

  const chartData = {
    labels: usdData.map((obs) => obs.timePeriod),
    datasets: [
      {
        label: "USD to NOK Exchange Rate",
        data: usdData.map((obs) => obs.value),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
      },
      {
        label: "EUR to NOK Exchange Rate",
        data: eurData.map((obs) => obs.value),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderWidth: 1,
      },
      {
        label: "10 SEK to NOK Exchange Rate",
        data: sekData.map((obs) => obs.value / 10),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderWidth: 1,
      },
      {
        label: "GBP to NOK Exchange Rate",
        data: gbpData.map((obs) => obs.value),
        borderColor: "rgba(255, 206, 86, 1)",
        backgroundColor: "rgba(255, 206, 86, 0.2)",
        borderWidth: 1,
      },
    ],
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputText = event.target.value
    setSearchText(inputText)
  }

  const addCurrency = (cur: string) => {
    console.log(cur)
  }

  const handleChangeFrekvens = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let valgtFrekvens = event.target.value
    setFrekvens(valgtFrekvens)
    console.log(valgtFrekvens)
  }

  const handleChangeStartDate = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let valgtStartDate = event.target.value
    const date = new Date(valgtStartDate)
    const formattedDate = date.toISOString().split("T")[0]
    setStartDate(formattedDate)
  }

  const handleChangeEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    let valgtEndDate = event.target.value
    const date = new Date(valgtEndDate)
    const formattedDate = date.toISOString().split("T")[0]
    setEndDate(formattedDate)
  }

  return (
    <div className="App">
      {/* <Header /> */}
      <h1 className="header">Valutakurser</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <div className="mainContainer">
          <div className="changeValuesContainer">
            <div className="searchInputContainer">
              <i className="fa fa-search searchIcon"></i>
              <input
                className="searchInput"
                type="text"
                value={searchText}
                onChange={handleTextChange}
              />

              {searchText !== "" && (
                <div className="searchResultsContainer">
                  {currencies.map((cur) => (
                    <div
                      key={cur}
                      className="searchResult"
                      onClick={() => addCurrency(cur)}
                    >
                      {cur}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="frekvensContainer">
              <select
                name="frekvens"
                id=""
                className="frekvens"
                onChange={handleChangeFrekvens}
              >
                <option value="A" className="frekvensOptions">
                  Årlig
                </option>
                <option value="M" className="frekvensOptions">
                  Månedlig
                </option>
                <option value="B" className="frekvensOptions">
                  Daglig
                </option>
              </select>
            </div>
            <div className="startDateContainer">
              <label htmlFor="startDate"></label>
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={startDate}
                onChange={handleChangeStartDate}
              />
            </div>
            <div className="endDateContainer">
              <label htmlFor="endDate"></label>
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={endDate}
                onChange={handleChangeEndDate}
              />
            </div>
          </div>
          <div className="">
            <div className="graphContainer">
              <Line className="graph" data={chartData} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
