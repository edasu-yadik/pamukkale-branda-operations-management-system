import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

function formatTL(sayi) {
  if (sayi === null || sayi === undefined) return '—'
  return Number(sayi).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

function formatTarih(tarih) {
  if (!tarih) return '—'
  return new Date(tarih).toLocaleDateString('tr-TR')
}

const montajDurumRenk = {
  'beklemede': 'bg-yellow-100 text-yellow-800',
  'tamamlandi': 'bg-green-100 text-green-800',
  'iptal': 'bg-red-100 text-red-800',
}

const odemeDurumRenk = {
  'odenmedi': 'bg-red-100 text-red-800',
  'kismi_odendi': 'bg-yellow-100 text-yellow-800',
  'odendi': 'bg-green-100 text-green-800',
}

function Rozet({ deger, renkMap, etiketMap }) {
  const renk = renkMap[deger] || 'bg-gray-100 text-gray-600'
  const etiket = etiketMap?.[deger] || deger || '—'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${renk}`}>
      {etiket}
    </span>
  )
}

const montajEtiket = {
  'beklemede': 'Beklemede',
  'tamamlandi': 'Tamamlandı',
  'iptal': 'İptal',
}

const odemeEtiket = {
  'odenmedi': 'Ödenmedi',
  'kismi_odendi': 'Kısmi Ödendi',
  'odendi': 'Ödendi',
}

export default function Montajlar() {
  const navigate = useNavigate()
  const [montajlar, setMontajlar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    api.get('/montajlar')
      .then((res) => setMontajlar(res.data))
      .catch(() => setHata('Montajlar yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Montajlar</h1>

      {yukleniyor && <p className="text-gray-500 text-center mt-8">Yükleniyor...</p>}
      {hata && <p className="text-red-600 text-center mt-8">{hata}</p>}

      {!yukleniyor && !hata && montajlar.length === 0 && (
        <p className="text-gray-400 text-center mt-12">Henüz montaj kaydı yok.</p>
      )}

      {!yukleniyor && !hata && montajlar.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="px-4 py-3 text-left font-medium"></th>
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Fiş No</th>
                <th className="px-4 py-3 text-left font-medium">Fatura No</th>
                <th className="px-4 py-3 text-left font-medium">Müşteri</th>
                <th className="px-4 py-3 text-left font-medium">Sipariş Tarihi</th>
                <th className="px-4 py-3 text-left font-medium">Montaj Tarihi</th>
                <th className="px-4 py-3 text-left font-medium">Toplam</th>
                <th className="px-4 py-3 text-left font-medium">Ödenen</th>
                <th className="px-4 py-3 text-left font-medium">Kalan</th>
                <th className="px-4 py-3 text-left font-medium">Montaj Durumu</th>
                <th className="px-4 py-3 text-left font-medium">Ödeme Durumu</th>
              </tr>
            </thead>
            <tbody>
              {montajlar.map((m, i) => (
                <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-left">
                    <button
                      onClick={() => navigate(`/montajlar/${m.id}`)}
                      className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                    >
                      Detay
                    </button>
                  </td>
                  <td className="px-4 py-3 text-left text-gray-400">{m.id}</td>
                  <td className="px-4 py-3 text-left text-gray-700">{m.fis_no || '—'}</td>
                  <td className="px-4 py-3 text-left text-gray-700">{m.fatura_no || '—'}</td>
                  <td className="px-4 py-3 text-left font-medium text-gray-800">{m.musteri_ad_soyad || '—'}</td>
                  <td className="px-4 py-3 text-left text-gray-600">{formatTarih(m.siparis_tarihi)}</td>
                  <td className="px-4 py-3 text-left text-gray-600">{formatTarih(m.montaj_tarihi)}</td>
                  <td className="px-4 py-3 text-left text-gray-800 font-medium">{formatTL(m.toplam_tutar)}</td>
                  <td className="px-4 py-3 text-left text-green-700">{formatTL(m.odenen_tutar)}</td>
                  <td className="px-4 py-3 text-left text-red-600">{formatTL(m.kalan_tutar)}</td>
                  <td className="px-4 py-3 text-left">
                    <Rozet deger={m.montaj_durumu} renkMap={montajDurumRenk} etiketMap={montajEtiket} />
                  </td>
                  <td className="px-4 py-3 text-left">
                    <Rozet deger={m.odeme_durumu} renkMap={odemeDurumRenk} etiketMap={odemeEtiket} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
