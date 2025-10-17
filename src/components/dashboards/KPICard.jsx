/**
 * Reusable KPI card component for displaying key metrics
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Optional subtitle
 * @param {string} props.icon - Icon component or emoji
 * @param {string} props.color - Color theme ('blue', 'green', 'yellow', 'red', 'purple')
 * @param {string} props.trend - Trend indicator ('+5%', '-2%', etc.)
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element}
 */
const KPICard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
  trend,
  isLoading = false
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      value: 'text-blue-900',
      trend: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      value: 'text-green-900',
      trend: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      value: 'text-yellow-900',
      trend: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      value: 'text-red-900',
      trend: 'text-red-600'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      value: 'text-purple-900',
      trend: 'text-purple-600'
    },
    fuchsia: {
      bg: 'bg-fuchsia-50',
      icon: 'text-fuchsia-600',
      value: 'text-fuchsia-900',
      trend: 'text-fuchsia-600'
    }
  }

  const classes = colorClasses[color] || colorClasses.blue

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${classes.bg} rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && (
          <div className={`${classes.icon} text-2xl`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline justify-between">
        <div>
          <p className={`text-3xl font-bold ${classes.value}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div className={`text-sm font-medium ${classes.trend}`}>
            {trend}
          </div>
        )}
      </div>
    </div>
  )
}

export default KPICard