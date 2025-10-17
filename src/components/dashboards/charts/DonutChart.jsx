import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

/**
 * Reusable donut chart component for displaying categorical data
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data array with name and value properties
 * @param {Object} props.colors - Color mapping for data categories
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height in pixels
 * @param {boolean} props.showLegend - Whether to show legend
 * @param {boolean} props.showTooltip - Whether to show tooltip
 * @param {string} props.centerText - Text to display in center of donut
 * @returns {JSX.Element}
 */
const DonutChart = ({
  data = [],
  colors = {},
  title,
  height = 300,
  showLegend = true,
  showTooltip = true,
  centerText
}) => {
  // Default colors for common ticket states and priorities
  const defaultColors = {
    abierto: '#10b981', // green
    en_progreso: '#3b82f6', // blue
    vobo: '#f59e0b', // yellow
    cerrado: '#6b7280', // gray
    baja: '#6b7280', // gray
    media: '#3b82f6', // blue
    alta: '#f59e0b', // yellow
    urgente: '#ef4444' // red
  }

  const getColor = (name) => {
    return colors[name] || defaultColors[name] || '#8b5cf6' // fallback to purple
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Cantidad: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Porcentaje: <span className="font-medium">{((data.value / data.payload.total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  // Calculate total for center text
  const total = data.reduce((sum, item) => sum + item.value, 0)

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      )}
      
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend content={<CustomLegend />} />}
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        {centerText && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600">{centerText}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DonutChart