import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

/**
 * Reusable line chart component for displaying time series data
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data array
 * @param {string} props.dataKey - Key for the data values
 * @param {string} props.nameKey - Key for the x-axis values
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height in pixels
 * @param {string} props.color - Line color
 * @param {boolean} props.showGrid - Whether to show grid lines
 * @param {boolean} props.showTooltip - Whether to show tooltip
 * @param {boolean} props.showLegend - Whether to show legend
 * @param {boolean} props.showDots - Whether to show data points
 * @param {string} props.strokeWidth - Line stroke width
 * @returns {JSX.Element}
 */
const LineChart = ({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  title,
  height = 300,
  color = '#8b5cf6',
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  showDots = true,
  strokeWidth = 2
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Cantidad: <span className="font-medium text-fuchsia-600">{data.value}</span>
          </p>
        </div>
      )
    }
    return null
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay datos disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />}
          
          <XAxis 
            dataKey={nameKey} 
            stroke="#6b7280" 
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend />}
          
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color}
            strokeWidth={strokeWidth}
            dot={showDots ? { fill: color, strokeWidth: 2, r: 4 } : false}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: '#fff' }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart