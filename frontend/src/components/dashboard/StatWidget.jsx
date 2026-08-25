import './StatWidget.css'

export default function StatWidget({ label, value, icon }) {
  return (
    <div className="stat-widget">
      <span className="stat-widget__icon" aria-hidden="true">{icon}</span>
      <div>
        <p className="stat-widget__value">{value}</p>
        <p className="stat-widget__label">{label}</p>
      </div>
    </div>
  )
}
