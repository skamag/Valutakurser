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
    "AUD - Australske dollar",
    "BDT - Bangladeshi taka",
    "BYN - Belarusiske nye rubler",
    "BRL - Brasilianske real",
    "GBP - Britiske pund",
    "BGN - Bulgarske lev",
    "DKK - Danske kroner",
    "EUR - Euro",
    "PHP - Filippinske peso",
    "HKD - Hong Kong dollar",
    "XDR - IMF Spesielle trekkrettigheter",
    "I44 - Importveid kursindeks",
    "INR - Indiske rupi",
    "IDR - Indonesiske rupiah",
    "TWI - Industriens effektive valutakurs",
    "ISK - Islandske kroner",
    "JPY - Japanske yen",
    "CAD - Kanadiske dollar",
    "CNY - Kinesiske yuan",
    "HRK - Kroatiske kuna",
    "MYR - Malaysiske ringgit",
    "MXN - Meksikanske peso",
    "MMK - Myanmar kyat",
    "NZD - New Zealand dollar",
    "ILS - Ny israelsk shekel",
    "RON - Ny rumenske leu",
    "TWD - Nye taiwanske dollar",
    "PKR - Pakistanske rupi",
    "PLN - Polske zloty",
    "RUB - Russiske rubler",
    "SGD - Singapore dollar",
    "CHF - Sveitsiske franc",
    "SEK - Svenske kroner",
    "ZAR - Sørafrikanske rand",
    "KRW - Sørkoreanske won",
    "THB - Thailandske baht",
    "CZK - Tsjekkiske koruna",
    "TRY - Tyrkiske lira",
    "HUF - Ungarske forinter",
    "VND - Vietnamesiske dong",
  ]
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])
  const [searchText, setSearchText] = useState("")
  const [frekvens, setFrekvens] = useState("A")
  const [pointRadius, setPointRadius] = useState(3)
  const [startDate, setStartDate] = useState("1994-04-15")
  const [endDate, setEndDate] = useState("2024-04-15")

  const [curData, setCurData] = useState<Observation[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let URL

    if (selectedCurrencies.length > 0) {
      URL = `https://data.norges-bank.no/api/data/EXR/${frekvens}.${selectedCurrencies[0].slice(
        0,
        3
      )}.NOK.SP?format=sdmx-json&startPeriod=${startDate}&endPeriod=${endDate}&locale=no`
    } else {
      URL = `https://data.norges-bank.no/api/data/EXR/${frekvens}.USD.NOK.SP?format=sdmx-json&startPeriod=${startDate}&endPeriod=${endDate}&locale=no`
    }

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
        let curSeries = dataSet.series["0:0:0:0"].observations

        const parsedCurData: Observation[] = timePeriods.map(
          (timePeriod, index) => ({
            timePeriod,
            value: parseFloat(curSeries[index]?.[0] || "0"),
          })
        )

        setCurData(parsedCurData)
        setLoading(false)
      })
      .catch((error) => {
        setError("Error fetching data")
        setLoading(false)
      })
  }, [selectedCurrencies, frekvens, startDate, endDate])

  const chartData = {
    labels: curData.map((obs) => obs.timePeriod),
    datasets: [
      {
        label: `${selectedCurrencies[0]} til NOK vekslingskurs`,
        data: curData.map((obs) => obs.value),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 1,
        pointRadius: pointRadius,
      },
    ],
  }

  const options: {} = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          font: {
            size: 14,
            weight: "bold",
          },
          color: "white",
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleFont: {
          size: 16,
          weight: "bold",
        },
        bodyFont: {
          size: 14,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "white",
        },
        title: {
          color: "white",
        },
      },
      y: {
        grid: {
          color: "rgba(200, 200, 200, 0.2)",
        },
        ticks: {
          font: {
            size: 12,
          },
          color: "white",
        },
        title: {
          color: "white",
        },
      },
    },
  }

  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let inputText = event.target.value
    setSearchText(inputText)
  }

  const addCurrency = (cur: string) => {
    if (selectedCurrencies.length === 0 && !selectedCurrencies.includes(cur)) {
      setSelectedCurrencies((selectedCurrencies) => [
        ...selectedCurrencies,
        cur,
      ])
    }
    setSearchText("")
  }

  const removeCurrency = (cur: string) => {
    setSelectedCurrencies((selectedCurrencies) =>
      selectedCurrencies.filter((currency) => currency !== cur)
    )
  }

  const handleChangeFrekvens = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    let valgtFrekvens = event.target.value
    valgtFrekvens === "A"
      ? setPointRadius(3)
      : valgtFrekvens === "M"
      ? setPointRadius(1)
      : setPointRadius(0)

    setFrekvens(valgtFrekvens)
  }

  const handleChangeStartDate = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let valgtStartDate = event.target.value

    console.log(
      parseInt(valgtStartDate.replace(/[^0-9 ]/g, "")),
      parseInt(endDate.replace(/[^0-9 ]/g, ""))
    )

    if (
      ((frekvens === "A" &&
        parseInt(valgtStartDate.replace(/[^0-9 ]/g, "")) <
          parseInt(endDate.replace(/[^0-9 ]/g, "")) - 100000) ||
        (frekvens === "M" &&
          parseInt(valgtStartDate.replace(/[^0-9 ]/g, "")) <
            parseInt(endDate.replace(/[^0-9 ]/g, "")) - 1000) ||
        (frekvens === "B" &&
          parseInt(valgtStartDate.replace(/[^0-9 ]/g, "")) <
            parseInt(endDate.replace(/[^0-9 ]/g, "")) - 10)) &&
      parseInt(valgtStartDate.replace(/[^0-9 ]/g, "")) > 19000000
    ) {
      const date = new Date(valgtStartDate)
      const formattedDate = date.toISOString().split("T")[0]
      setStartDate(formattedDate)
    }
  }

  const handleChangeEndDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    let valgtEndDate = event.target.value

    if (
      parseInt(valgtEndDate.replace(/[^0-9 ]/g, "")) >
        parseInt(startDate.replace(/[^0-9 ]/g, "")) &&
      parseInt(valgtEndDate.replace(/[^0-9 ]/g, "")) < 20240625
    ) {
      const date = new Date(valgtEndDate)
      const formattedDate = date.toISOString().split("T")[0]
      setEndDate(formattedDate)
    }
  }

  return (
    <div className="App">
      {/* <Header /> */}
      {/* <h1 className="header">Valutakurser</h1> */}
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
                <div
                  className={`${
                    currencies.filter((currency) =>
                      currency.toLowerCase().includes(searchText.toLowerCase())
                    ).length > 0
                      ? "searchResultsContainer"
                      : ""
                  }`}
                >
                  {currencies
                    .filter((currency) =>
                      currency.toLowerCase().includes(searchText.toLowerCase())
                    )
                    .map((cur) => (
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
              {selectedCurrencies.length > 0 &&
                selectedCurrencies.map((cur) => (
                  <div key={cur} className="selectedCurreciesContainer">
                    <div
                      className="selectedCurrency"
                      onClick={() => removeCurrency(cur)}
                    >
                      {cur.slice(0, 3)}
                      <i className="fa fa-close"></i>
                    </div>
                  </div>
                ))}
            </div>
            <div className="changeValuesRightContainer">
              <div>
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
          </div>
          <div className="">
            {selectedCurrencies.length > 0 && (
              <div className="graphContainer">
                <Line className="graph" data={chartData} options={options} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
