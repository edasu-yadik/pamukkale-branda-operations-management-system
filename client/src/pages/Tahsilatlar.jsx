import { useEffect, useState } from 'react'
import api from '../api/client'

function formatTL(sayi) {
  if (sayi === null || sayi === undefined) return '—'
  return Number(sayi).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

function formatTarih(tarih) {
  if (!tarih) return '—'
  return new Date(tarih).toLocaleDateString('tr-TR')
}

const odemeYontemiEtiket = {
  nakit: 'Nakit',
  kart: 'Kart',
  havale: 'Havale/EFT',
  cek: 'Çek',
}

export default function Tahsilatlar() {
  const [tahsilatlar, setTahsilatlar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    api.get('/tahsilatlar')
      .then((res) => setTahsilatlar(res.data))
      .catch(() => setHata('Tahsilatlar yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Tahsilatlar</h1>

      {yukleniyor && <p className="text-gray-500 text-center mt-8">Yükleniyor...</p>}
      {hata && <p className="text-red-600 text-center mt-8">{hata}</p>}

      {!yukleniyor && !hata && tahsilatlar.length === 0 && (
        <p className="text-gray-400 text-center mt-12">Henüz tahsilat kaydı yok.</p>
      )}

      {!yukleniyor && !hata && tahsilatlar.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Fiş No</th>
                <th className="px-4 py-3 text-left font-medium">Müşteri</th>
                <th className="px-4 py-3 text-left font-medium">Tahsilat Tarihi</th>
                <th className="px-4 py-3 text-left font-medium">Tutar</th>
                <th className="px-4 py-3 text-left font-medium">Ödeme Yöntemi</th>
                <th className="px-4 py-3 text-left font-medium">Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {tahsilatlar.map((t, i) => (
                <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-left text-gray-400">{t.id}</td>
                  <td className="px-4 py-3 text-left text-gray-700">{t.fis_no || '—'}</td>
                  <td className="px-4 py-3 text-left font-medium text-gray-800">{t.musteri_adi || '—'}</td>
                  <td className="px-4 py-3 text-left text-gray-600">{formatTarih(t.tahsilat_tarihi)}</td>
                  <td className="px-4 py-3 text-left text-green-700 font-medium">{formatTL(t.tutar)}</td>
                  <td className="px-4 py-3 text-left text-gray-600">
                    {odemeYontemiEtiket[t.odeme_yontemi] || t.odeme_yontemi || '—'}
                  </td>
                  <td className="px-4 py-3 text-left text-gray-500">{t.aciklama || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
