import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Musteriler() {
  const navigate = useNavigate()
  const [musteriler, setMusteriler] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    api.get('/musteriler')
      .then((res) => setMusteriler(res.data))
      .catch(() => setHata('Müşteriler yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [])

  if (yukleniyor) return <p className="text-gray-500 mt-8 text-center">Yükleniyor...</p>
  if (hata) return <p className="text-red-600 mt-8 text-center">{hata}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Müşteriler</h1>

      {musteriler.length === 0 ? (
        <p className="text-gray-400 text-center mt-12">Henüz müşteri kaydı yok.</p>
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
              {musteriler.map((m, i) => (
                <tr
                  key={m.id}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
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
