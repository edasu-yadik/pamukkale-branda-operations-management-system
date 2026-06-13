import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Musteriler() {
  const navigate = useNavigate()
  const [musteriler, setMusteriler] = useState([])
  const [arama, setArama] = useState('')
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    api.get('/musteriler')
      .then((res) => setMusteriler(res.data))
      .catch(() => setHata('Müşteriler yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [])

  const filtreli = musteriler.filter((m) => {
    const q = arama.toLowerCase()
    return (
      (m.ad_soyad  || '').toLowerCase().includes(q) ||
      (m.telefon   || '').toLowerCase().includes(q) ||
      (m.adres     || '').toLowerCase().includes(q)
    )
  })

  if (yukleniyor) return <p className="text-gray-500 mt-8 text-center">Yükleniyor...</p>
  if (hata)       return <p className="text-red-600 mt-8 text-center">{hata}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-4">Müşteriler</h1>

      <input
        type="text"
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        placeholder="Müşteri adı, telefon veya adres ara..."
        className="border rounded-lg px-4 py-2 w-full mb-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      />

      {filtreli.length === 0 ? (
        <p className="text-gray-400 text-center mt-12">
          {arama ? 'Arama sonucu bulunamadı.' : 'Henüz müşteri kaydı yok.'}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="w-full text-sm bg-white">
            <thead>
              <tr className="bg-blue-700 text-white text-left">
                <th className="px-4 py-3 font-medium"></th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Ad Soyad</th>
                <th className="px-4 py-3 font-medium">Telefon</th>
                <th className="px-4 py-3 font-medium">Adres</th>
                <th className="px-4 py-3 font-medium">Notlar</th>
              </tr>
            </thead>
            <tbody>
              {filtreli.map((m, i) => (
                <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/musteriler/${m.id}`)}
                      className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                    >
                      Detay
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{m.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{m.ad_soyad}</td>
                  <td className="px-4 py-3 text-gray-600">{m.telefon || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{m.adres || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{m.notlar || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
