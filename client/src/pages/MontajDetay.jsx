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

const montajDurumRenk = {
  beklemede:   'bg-yellow-100 text-yellow-800',
  tamamlandi:  'bg-green-100 text-green-800',
  iptal:       'bg-red-100 text-red-800',
}
const montajEtiket = {
  beklemede:  'Beklemede',
  tamamlandi: 'Tamamlandı',
  iptal:      'İptal',
}

const odemeDurumRenk = {
  odenmedi:     'bg-red-100 text-red-800',
  kismi_odendi: 'bg-yellow-100 text-yellow-800',
  odendi:       'bg-green-100 text-green-800',
}
const odemeEtiket = {
  odenmedi:     'Ödenmedi',
  kismi_odendi: 'Kısmi Ödendi',
  odendi:       'Ödendi',
}

function Rozet({ deger, renkMap, etiketMap }) {
  const renk = renkMap[deger] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${renk}`}>
      {etiketMap[deger] || deger || '—'}
    </span>
  )
}

function BilgiSatiri({ etiket, deger }) {
  return (
    <div className="flex py-3 border-b border-gray-100 last:border-0">
      <span className="w-44 text-sm text-gray-500 shrink-0">{etiket}</span>
      <span className="text-sm text-gray-800 font-medium">{deger}</span>
    </div>
  )
}

export default function MontajDetay() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [montaj, setMontaj] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    api.get(`/montajlar/${id}`)
      .then((res) => setMontaj(res.data))
      .catch(() => setHata('Montaj bulunamadı veya backend çalışmıyor.'))
      .finally(() => setYukleniyor(false))
  }, [id])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/montajlar')}
        className="mb-5 text-sm text-blue-600 hover:underline"
      >
        ← Montajlar listesine dön
      </button>

      <h1 className="text-xl font-semibold text-gray-700 mb-5">Montaj Detayı</h1>

      {yukleniyor && <p className="text-gray-500 text-center mt-8">Yükleniyor...</p>}
      {hata && <p className="text-red-600 text-center mt-8">{hata}</p>}

      {!yukleniyor && !hata && montaj && (
        <div className="bg-white rounded-lg shadow p-6 max-w-xl">
          <BilgiSatiri etiket="Fiş No"         deger={montaj.fis_no || '—'} />
          <BilgiSatiri etiket="Fatura No"       deger={montaj.fatura_no || '—'} />
          <BilgiSatiri etiket="Müşteri"         deger={montaj.musteri_adi || '—'} />
          <BilgiSatiri etiket="Sipariş Tarihi"  deger={formatTarih(montaj.siparis_tarihi)} />
          <BilgiSatiri etiket="Montaj Tarihi"   deger={formatTarih(montaj.montaj_tarihi)} />
          <BilgiSatiri etiket="Montaj Ekibi"   deger={montaj.montaj_ekibi || '—'} />
          <BilgiSatiri etiket="Toplam Tutar"    deger={formatTL(montaj.toplam_tutar)} />
          <BilgiSatiri etiket="Ödenen Tutar"    deger={formatTL(montaj.odenen_tutar)} />
          <BilgiSatiri etiket="Kalan Tutar"     deger={formatTL(montaj.kalan_tutar)} />
          <div className="flex py-3 border-b border-gray-100">
            <span className="w-44 text-sm text-gray-500 shrink-0">Montaj Durumu</span>
            <Rozet deger={montaj.montaj_durumu} renkMap={montajDurumRenk} etiketMap={montajEtiket} />
          </div>
          <div className="flex py-3">
            <span className="w-44 text-sm text-gray-500 shrink-0">Ödeme Durumu</span>
            <Rozet deger={montaj.odeme_durumu} renkMap={odemeDurumRenk} etiketMap={odemeEtiket} />
          </div>
        </div>
      )}
    </div>
  )
}
