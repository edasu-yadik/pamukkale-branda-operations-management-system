import { useEffect, useState } from 'react'
import api from '../api/client'

function OzetKart({ baslik, deger, renk = 'blue' }) {
  const renkler = {
    blue:   'border-blue-500 text-blue-700',
    green:  'border-green-500 text-green-700',
    yellow: 'border-yellow-500 text-yellow-700',
    red:    'border-red-500 text-red-700',
  }
  return (
    <div className={`bg-white rounded-xl border-l-4 shadow-sm p-4 ${renkler[renk]}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{baslik}</p>
      <p className="text-2xl font-bold mt-1">{deger}</p>
    </div>
  )
}

function para(sayi) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(sayi)
}

export default function AnaSayfa() {
  const [ozet, setOzet] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    api.get('/ozet')
      .then((res) => setOzet(res.data))
      .catch(() => setHata('Veriler yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [])

  if (yukleniyor) return <p className="text-gray-500 mt-8 text-center">Yükleniyor...</p>
  if (hata) return <p className="text-red-600 mt-8 text-center">{hata}</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Genel Özet</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <OzetKart baslik="Müşteri Sayısı" deger={ozet.musteri_sayisi} renk="blue" />
        <OzetKart baslik="Toplam Montaj" deger={ozet.toplam_montaj} renk="blue" />
        <OzetKart baslik="Bekleyen Montaj" deger={ozet.bekleyen_montaj} renk="yellow" />
        <OzetKart baslik="Tamamlanan Montaj" deger={ozet.tamamlanan_montaj} renk="green" />
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-4">Ödeme Durumu</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <OzetKart baslik="Ödenmemiş" deger={ozet.odeme.odenmemis} renk="red" />
        <OzetKart baslik="Kısmi Ödeme" deger={ozet.odeme.kismi} renk="yellow" />
        <OzetKart baslik="Ödeme Tamamlandı" deger={ozet.odeme.tamamlandi} renk="green" />
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-4">Tutar Özeti</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OzetKart baslik="Toplam Alacak" deger={para(ozet.tutar.toplam_alacak)} renk="blue" />
        <OzetKart baslik="Tahsil Edilen" deger={para(ozet.tutar.toplam_tahsilat)} renk="green" />
        <OzetKart baslik="Kalan Alacak" deger={para(ozet.tutar.kalan)} renk="red" />
      </div>
    </div>
  )
}
