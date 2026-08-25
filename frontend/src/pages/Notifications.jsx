import useFetch from '../hooks/useFetch.js'
import { endpoints } from '../api/client.js'
import { mockNotifications } from '../data/mockData.js'
import NotificationItem from '../components/cards/NotificationItem.jsx'
import Loader from '../components/common/Loader.jsx'

export default function Notifications() {
  const { data: notifications, loading } = useFetch(endpoints.notifications, mockNotifications, [])

  return (
    <div>
      <h1 className="page__title">Notificaciones</h1>
      <p className="page__subtitle">Comunicaciones generadas por la plataforma.</p>

      {loading ? (
        <Loader />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </ul>
      )}
    </div>
  )
}
