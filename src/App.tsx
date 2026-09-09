import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { CartProvider } from './cart/CartContext'
import { MenuProvider } from './menu/MenuContext'
import { RequireAdmin } from './components/RequireAdmin'
import { HomePage } from './pages/HomePage'
import { CartPage } from './pages/CartPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <MenuProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminProductsPage />
                  </RequireAdmin>
                }
              />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </MenuProvider>
    </AuthProvider>
  )
}

export default App
