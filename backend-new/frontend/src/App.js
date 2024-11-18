import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { store } from './store'
import { checkAuth } from './store/slices/authSlice'
import ProtectedRoute from './components/ProtectedRoute'

// Import axios interceptor
import './services/axiosInterceptor'

// Containers
const DefaultLayout = React.lazy(() => import('./layouts/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

const AppRoutes = () => {
  const dispatch = useDispatch()
  const { isAuthenticated, checking } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  if (checking) {
    return loading
  }

  return (
    <Routes>
      <Route
        exact
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        exact
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />
      <Route exact path="/404" element={<Page404 />} />
      <Route exact path="/500" element={<Page500 />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <DefaultLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <Provider store={store}>
      <HashRouter>
        <Suspense fallback={loading}>
          <AppRoutes />
        </Suspense>
      </HashRouter>
    </Provider>
  )
}

export default App