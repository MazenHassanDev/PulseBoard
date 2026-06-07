import { Navigate } from 'react-router-dom'

// Gate for authenticated routes — no access token means back to login.
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}
