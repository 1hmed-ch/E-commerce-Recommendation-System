import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from "./components/Header"
import LandingPage from "./components/LandingPage/LandingPage"
import Products from "./components/Products/Products"
import Footer from "./components/Footer/Footer"
import CartPage from "./components/Pages/CartPage";
import ProductPage from "./components/ProductDescription/ProductPage";
import { AuthProvider } from "./Context/AuthContext";
import AuthPage from "./components/AuthPage/AuthPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className=" bg-white">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App