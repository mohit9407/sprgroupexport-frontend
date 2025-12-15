const SectionHeader = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`text-center mb-8 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-600 mt-2 text-sm uppercase tracking-wider">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionHeader
