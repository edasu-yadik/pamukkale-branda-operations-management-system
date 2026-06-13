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

const odemeDurumRenk = {
  beklemede:  'bg-gray-100 text-gray-600',
  kismi:      'bg-yellow-100 text-yellow-800',
  tamamlandi: 'bg-green-100 text-green-800',
}
const odemeEtiket = {
  beklemede:  'Beklemede',
  kismi:      'Kısmi',
  tamamlandi: 'Ödendi',
}

const montajDurumRenk = {
  beklemede:  'bg-yellow-100 text-yellow-800',
  planlandi:  'bg-blue-100 text-blue-700',
  tamamlandi: 'bg-green-100 text-green-800',
  iptal:      'bg-red-100 text-red-800',
}
const montajEtiket = {
  beklemede:  'Beklemede',
  planlandi:  'Planlandı',
  tamamlandi: 'Tamamlandı',
  iptal:      'İptal',
}

function Rozet({ deger, renkMap, etiketMap }) {
  const renk = renkMap[deger] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${renk}`}>
      {etiketMap[deger] || deger || '—'}
    </span>
  )
}

function MiniTablo({ baslik, bos, kolonlar, satirlar }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-gray-600 mb-3">{baslik}</h2>
      {satirlar.length === 0 ? (
        <p className="text-gray-400 text-sm">{bos}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-700 text-white">
                {kolonlar.map((k) => (
                  <th key={k} className="px-4 py-3 text-left font-medium whitespace-nowrap">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody>{satirlar}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AnaSayfa() {
  const [ozet, setOzet] = useState(null)
  const [montajlar, setMontajlar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/ozet'),
      api.get('/montajlar'),
    ])
      .then(([ozetRes, montajRes]) => {
        setOzet(ozetRes.data)
        setMontajlar(montajRes.data)
      })
      .catch(() => setHata('Veriler yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [])

  if (yukleniyor) return <p className="text-gray-500 mt-8 text-center">Yükleniyor...</p>
  if (hata)       return <p className="text-red-600 mt-8 text-center">{hata}</p>

  // Acil alacaklar: kalan > 0, montaj tarihine göre eskiden yeniye
  const acilAlacaklar = montajlar
    .filter((m) => parseFloat(m.kalan_tutar) > 0)
    .sort((a, b) => {
      const ta = a.montaj_tarihi ? new Date(a.montaj_tarihi) : new Date(9e15)
      const tb = b.montaj_tarihi ? new Date(b.montaj_tarihi) : new Date(9e15)
      return ta - tb
    })
    .slice(0, 5)

  // Bekleyen montajlar: tamamlanmamış ve iptal edilmemiş
  const bekleyenMontajlar = montajlar
    .filter((m) => m.montaj_durumu !== 'tamamlandi' && m.montaj_durumu !== 'iptal')
    .sort((a, b) => {
      const sira = { beklemede: 0, planlandi: 1 }
      const sdiff = (sira[a.montaj_durumu] ?? 2) - (sira[b.montaj_durumu] ?? 2)
      if (sdiff !== 0) return sdiff
      const ta = a.montaj_tarihi ? new Date(a.montaj_tarihi) : new Date(9e15)
      const tb = b.montaj_tarihi ? new Date(b.montaj_tarihi) : new Date(9e15)
      return ta - tb
    })
    .slice(0, 5)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-700 mb-5">Kontrol Paneli</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <OzetKart baslik="Müşteri Sayısı"    deger={ozet.musteri_sayisi}    renk="blue"   />
          <OzetKart baslik="Toplam Montaj"     deger={ozet.toplam_montaj}     renk="blue"   />
          <OzetKart baslik="Bekleyen Montaj"   deger={ozet.bekleyen_montaj}   renk="yellow" />
          <OzetKart baslik="Tamamlanan Montaj" deger={ozet.tamamlanan_montaj} renk="green"  />
          <OzetKart baslik="Toplam Alacak"     deger={formatTL(ozet.tutar.toplam_alacak)}   renk="blue"  />
          <OzetKart baslik="Tahsil Edilen"     deger={formatTL(ozet.tutar.toplam_tahsilat)} renk="green" />
          <OzetKart baslik="Kalan Alacak"      deger={formatTL(ozet.tutar.kalan)}           renk="red"   />
        </div>
      </div>

      <MiniTablo
        baslik="Acil Alacaklar"
        bos="Acil alacak bulunmuyor."
        kolonlar={['Fiş No', 'Müşteri', 'Montaj Tarihi', 'Kalan', 'Ödeme Durumu']}
        satirlar={acilAlacaklar.map((m, i) => (
          <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-4 py-3 text-gray-700">{m.fis_no || '—'}</td>
            <td className="px-4 py-3 font-medium text-gray-800">{m.musteri_adi || '—'}</td>
            <td className="px-4 py-3 text-gray-600">{formatTarih(m.montaj_tarihi)}</td>
            <td className="px-4 py-3 text-red-600 font-semibold">{formatTL(m.kalan_tutar)}</td>
            <td className="px-4 py-3">
              <Rozet deger={m.odeme_durumu} renkMap={odemeDurumRenk} etiketMap={odemeEtiket} />
            </td>
          </tr>
        ))}
      />

      <MiniTablo
        baslik="Bekleyen / Yaklaşan Montajlar"
        bos="Bekleyen montaj bulunmuyor."
        kolonlar={['Fiş No', 'Müşteri', 'Montaj Tarihi', 'Durum', 'Kalan']}
        satirlar={bekleyenMontajlar.map((m, i) => (
          <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="px-4 py-3 text-gray-700">{m.fis_no || '—'}</td>
            <td className="px-4 py-3 font-medium text-gray-800">{m.musteri_adi || '—'}</td>
            <td className="px-4 py-3 text-gray-600">{formatTarih(m.montaj_tarihi)}</td>
            <td className="px-4 py-3">
              <Rozet deger={m.montaj_durumu} renkMap={montajDurumRenk} etiketMap={montajEtiket} />
            </td>
            <td className="px-4 py-3 text-red-600 font-semibold">{formatTL(m.kalan_tutar)}</td>
          </tr>
        ))}
      />
    </div>
  )
}
