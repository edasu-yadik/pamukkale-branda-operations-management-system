import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AnaSayfa from './pages/AnaSayfa'
import Musteriler from './pages/Musteriler'
import Montajlar from './pages/Montajlar'
import Tahsilatlar from './pages/Tahsilatlar'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<AnaSayfa />} />
          <Route path="/musteriler" element={<Musteriler />} />
          <Route path="/montajlar" element={<Montajlar />} />
          <Route path="/tahsilatlar" element={<Tahsilatlar />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
