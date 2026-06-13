import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

function formatTL(sayi) {
  if (sayi === null || sayi === undefined) return '—'
  return Number(sayi).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })
}

function formatTarih(tarih) {
  if (!tarih) return '—'
  return new Date(tarih).toLocaleDateString('tr-TR')
}

const odemeDurumRenk = {
  beklemede:    'bg-gray-100 text-gray-600',
  kismi:        'bg-yellow-100 text-yellow-800',
  tamamlandi:   'bg-green-100 text-green-800',
}
const odemeEtiket = {
  beklemede:    'Beklemede',
  kismi:        'Kısmi Ödendi',
  tamamlandi:   'Ödendi',
}

function BilgiSatiri({ etiket, deger }) {
  return (
    <div className="flex py-3 border-b border-gray-100 last:border-0">
      <span className="w-36 text-sm text-gray-500 shrink-0">{etiket}</span>
      <span className="text-sm text-gray-800">{deger || '—'}</span>
    </div>
  )
}

export default function MusteriDetay() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [musteri, setMusteri] = useState(null)
  const [montajlar, setMontajlar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/musteriler/${id}`),
      api.get(`/musteriler/${id}/montajlar`),
    ])
      .then(([musteriRes, montajRes]) => {
        setMusteri(musteriRes.data)
        setMontajlar(montajRes.data)
      })
      .catch(() => setHata('Müşteri bilgisi yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [id])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/musteriler')}
        className="mb-5 text-sm text-blue-600 hover:underline"
      >
        ← Müşteri listesine dön
      </button>

      {yukleniyor && <p className="text-gray-500 text-center mt-8">Yükleniyor...</p>}
      {hata && <p className="text-red-600 text-center mt-8">{hata}</p>}

      {!yukleniyor && !hata && musteri && (
        <>
          <h1 className="text-xl font-semibold text-gray-700 mb-5">{musteri.ad_soyad}</h1>

          <div className="bg-white rounded-lg shadow p-6 max-w-lg mb-8">
            <BilgiSatiri etiket="Ad Soyad" deger={musteri.ad_soyad} />
            <BilgiSatiri etiket="Telefon"  deger={musteri.telefon} />
            <BilgiSatiri etiket="Adres"    deger={musteri.adres} />
            <BilgiSatiri etiket="Notlar"   deger={musteri.notlar} />
          </div>

          <h2 className="text-base font-semibold text-gray-600 mb-3">Montajlar</h2>

          {montajlar.length === 0 ? (
            <p className="text-gray-400 text-sm">Bu müşteriye ait montaj kaydı yok.</p>
          ) : (
            <div className="mt-2 overflow-x-auto rounded-lg shadow bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="px-4 py-3 text-left font-medium">Fiş No</th>
                    <th className="px-4 py-3 text-left font-medium">Fatura No</th>
                    <th className="px-4 py-3 text-left font-medium">Sipariş Tarihi</th>
                    <th className="px-4 py-3 text-left font-medium">Montaj Tarihi</th>
                    <th className="px-4 py-3 text-left font-medium">Toplam</th>
                    <th className="px-4 py-3 text-left font-medium">Ödenen</th>
                    <th className="px-4 py-3 text-left font-medium">Kalan</th>
                    <th className="px-4 py-3 text-left font-medium">Ödeme Durumu</th>
                  </tr>
                </thead>
                <tbody>
                  {montajlar.map((m, i) => (
                    <tr
                      key={m.id}
                      className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-3 text-left text-gray-700">{m.fis_no || '—'}</td>
                      <td className="px-4 py-3 text-left text-gray-700">{m.fatura_no || '—'}</td>
                      <td className="px-4 py-3 text-left text-gray-600">{formatTarih(m.siparis_tarihi)}</td>
                      <td className="px-4 py-3 text-left text-gray-600">{formatTarih(m.montaj_tarihi)}</td>
                      <td className="px-4 py-3 text-left text-gray-800 font-medium">{formatTL(m.toplam_tutar)}</td>
                      <td className="px-4 py-3 text-left text-green-700">{formatTL(m.odenen_tutar)}</td>
                      <td className="px-4 py-3 text-left text-red-600">{formatTL(m.kalan_tutar)}</td>
                      <td className="px-4 py-3 text-left">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${odemeDurumRenk[m.odeme_durumu] || 'bg-gray-100 text-gray-600'}`}>
                          {odemeEtiket[m.odeme_durumu] || m.odeme_durumu || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
