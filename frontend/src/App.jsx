import { Routes, Route, Navigate } from 'react-router-dom'
import { UserProvider } from './context/UserContext.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Navbar from './components/layout/Navbar.jsx'
import Footer from './components/layout/Footer.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import ServiceDetail from './pages/ServiceDetail.jsx'
import Requests from './pages/Requests.jsx'
import NewRequest from './pages/NewRequest.jsx'
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

// Envuelve una página con el layout (navbar/footer) Y la protección de login.
function Protected({ children }) {
  return (
    <RequireAuth>
      <AppLayout>{children}</AppLayout>
    </RequireAuth>
  )
}

export default function App() {
  return (
    <UserProvider>
      <Routes>
        {/* Pantalla de acceso: login real contra el backend */}
        <Route path="/" element={<Login />} />

        {/* Vistas internas de la plataforma (requieren sesión iniciada) */}
        <Route path="/inicio" element={<Protected><Home /></Protected>} />
        <Route path="/servicios/:id" element={<Protected><ServiceDetail /></Protected>} />
        <Route path="/solicitudes" element={<Protected><Requests /></Protected>} />
        <Route path="/solicitudes/nueva" element={<Protected><NewRequest /></Protected>} />
        <Route path="/solicitudes/:id" element={<Protected><RequestDetail /></Protected>} />
        <Route path="/reservas" element={<Protected><Reservations /></Protected>} />
        <Route path="/notificaciones" element={<Protected><Notifications /></Protected>} />
        <Route path="/eventos" element={<Protected><Events /></Protected>} />
        <Route path="/perfil" element={<Protected><Profile /></Protected>} />

        {/* Cualquier ruta desconocida vuelve al inicio (o al login si no hay sesión) */}
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Routes>
    </UserProvider>
  )
}
