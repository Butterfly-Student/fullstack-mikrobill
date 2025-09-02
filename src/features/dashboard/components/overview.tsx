import { useState, useEffect } from 'react'
import { BarChart, Bar, Rectangle, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface NetworkData {
  time: string
  rx: number
  tx: number
}

export function Overview() {
  const [data, setData] = useState<NetworkData[]>([])
  const [timeCounter, setTimeCounter] = useState<number>(0)

  // Generate random network data
  const generateNetworkData = (timestamp: number): NetworkData => {
    return {
      time: new Date(Date.now() - (19 - timestamp) * 1000).toLocaleTimeString('id-ID', {
        hour12: false,
        minute: '2-digit',
        second: '2-digit'
      }),
      rx: Math.floor(Math.random() * 1000) + 200,
      tx: Math.floor(Math.random() * 600) + 100,
    }
  }

  // Initialize with more data points for scrolling effect
  useEffect(() => {
    const initialData: NetworkData[] = []
    for (let i = 0; i < 50; i++) {
      initialData.push(generateNetworkData(i))
    }
    setData(initialData)
    setTimeCounter(50)
  }, [])

  return (
    <div className="w-full bg-white rounded-lg border p-6 shadow-sm">

      <div className="relative">
        <ResponsiveContainer width='100%' height={350}>
          <BarChart
            data={data}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
            maxBarSize={6}
            barCategoryGap={2}
            barSize={4}
            barGap={2}
            style={{
              marginLeft: 0,
              marginRight: 0,
              marginTop: 0,
              marginBottom: 0,
              padding: 0
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <Tooltip />
            <Bar
              dataKey="rx"
              fill="#8884d8"
              activeBar={<Rectangle fill="pink" stroke="blue" />}
            />
            <Bar
              dataKey="tx"
              fill="#82ca9d"
              activeBar={<Rectangle fill="gold" stroke="purple" />}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Floating info panel */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border p-2 text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded"></div>
              <span className="text-gray-600">RX: {data[data.length - 1]?.rx || 0} Mbps</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded"></div>
              <span className="text-gray-600">TX: {data[data.length - 1]?.tx || 0} Mbps</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}