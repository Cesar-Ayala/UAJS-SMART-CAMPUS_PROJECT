import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './context/UserContext.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Landing from './pages/Landing.jsx'
import Home from './pages/Home.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Requests from './pages/Requests.jsx'
import RequestDetail from './pages/RequestDetail.jsx'
import Reservations from './pages/Reservations.jsx'
import Notifications from './pages/Notifications.jsx'
import Events from './pages/Events.jsx'
import Profile from './pages/Profile.jsx'

function AppLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main className="app__main">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
    <Routes>
      {/* Vista de acceso: landing sin navbar/footer */}
      <Route path="/" element={<Landing />} />

      {/* Vistas internas de la plataforma */}
      <Route path="/inicio" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/servicios/:id" element={<AppLayout><ServiceDetail /></AppLayout>} />
      <Route path="/solicitudes" element={<AppLayout><Requests /></AppLayout>} />
      <Route path="/solicitudes/:id" element={<AppLayout><RequestDetail /></AppLayout>} />
      <Route path="/reservas" element={<AppLayout><Reservations /></AppLayout>} />
      <Route path="/notificaciones" element={<AppLayout><Notifications /></AppLayout>} />
      <Route path="/eventos" element={<AppLayout><Events /></AppLayout>} />
      <Route path="/perfil" element={<AppLayout><Profile /></AppLayout>} />

      {/* Cualquier ruta desconocida vuelve al inicio */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
    </UserProvider>
  )
}
