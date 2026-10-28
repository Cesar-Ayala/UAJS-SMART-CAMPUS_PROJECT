import { formatDate } from '../../utils/dates.js'
import './NotificationItem.css'

export default function NotificationItem({ notification }) {
  const modifier = notification.leida ? '' : 'notification-item--unread'
  return (
    <li className={`notification-item ${modifier}`}>
      <span className="notification-item__dot" aria-hidden="true" />
      <div className="notification-item__body">
        <p className="notification-item__message">{notification.mensaje}</p>
        <span className="notification-item__date">{formatDate(notification.fecha)}</span>
      </div>
    </li>
  )
}
