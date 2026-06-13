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

function oncelikHesapla(montaj_tarihi) {
  if (!montaj_tarihi) return 'takip'
  const bugun = new Date()
  bugun.setHours(0, 0, 0, 0)
  const tarih = new Date(montaj_tarihi)
  tarih.setHours(0, 0, 0, 0)
  const yediGunSonra = new Date(bugun)
  yediGunSonra.setDate(bugun.getDate() + 7)

  if (tarih < bugun) return 'cok_acil'
  if (tarih <= yediGunSonra) return 'acil'
  return 'takip'
}

const oncelikRenk = {
  cok_acil: 'bg-red-100 text-red-800',
  acil:     'bg-orange-100 text-orange-800',
  takip:    'bg-blue-100 text-blue-700',
}

const oncelikEtiket = {
  cok_acil: 'Çok Acil',
  acil:     'Acil',
  takip:    'Takip',
}

const oncelikSira = { cok_acil: 0, acil: 1, takip: 2 }

const odemeDurumRenk = {
  beklemede:  'bg-gray-100 text-gray-600',
  kismi:      'bg-yellow-100 text-yellow-800',
  tamamlandi: 'bg-green-100 text-green-800',
}
const odemeEtiket = {
  beklemede:  'Beklemede',
  kismi:      'Kısmi Ödendi',
  tamamlandi: 'Ödendi',
}

export default function Tahsilatlar() {
  const [alacaklar, setAlacaklar] = useState([])
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    api.get('/montajlar')
      .then((res) => {
        const aciklar = res.data
          .filter((m) => parseFloat(m.kalan_tutar) > 0)
          .map((m) => ({ ...m, _oncelik: oncelikHesapla(m.montaj_tarihi) }))
          .sort((a, b) => {
            const siraCmp = oncelikSira[a._oncelik] - oncelikSira[b._oncelik]
            if (siraCmp !== 0) return siraCmp
            const tarihA = a.montaj_tarihi ? new Date(a.montaj_tarihi) : new Date(0)
            const tarihB = b.montaj_tarihi ? new Date(b.montaj_tarihi) : new Date(0)
            const tarihCmp = tarihA - tarihB
            if (tarihCmp !== 0) return tarihCmp
            return parseFloat(b.kalan_tutar) - parseFloat(a.kalan_tutar)
          })
        setAlacaklar(aciklar)
      })
      .catch(() => setHata('Veriler yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-700 mb-5">Alacaklar</h1>

      {yukleniyor && <p className="text-gray-500 text-center mt-8">Yükleniyor...</p>}
      {hata && <p className="text-red-600 text-center mt-8">{hata}</p>}

      {!yukleniyor && !hata && alacaklar.length === 0 && (
        <p className="text-gray-400 text-center mt-12">Açık alacak bulunmuyor.</p>
      )}

      {!yukleniyor && !hata && alacaklar.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-700 text-white">
                <th className="px-4 py-3 text-left font-medium">Öncelik</th>
                <th className="px-4 py-3 text-left font-medium">Fiş No</th>
                <th className="px-4 py-3 text-left font-medium">Müşteri</th>
                <th className="px-4 py-3 text-left font-medium">Montaj Tarihi</th>
                <th className="px-4 py-3 text-left font-medium">Toplam</th>
                <th className="px-4 py-3 text-left font-medium">Ödenen</th>
                <th className="px-4 py-3 text-left font-medium">Kalan</th>
                <th className="px-4 py-3 text-left font-medium">Ödeme Durumu</th>
              </tr>
            </thead>
            <tbody>
              {alacaklar.map((m, i) => (
                <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-left">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${oncelikRenk[m._oncelik]}`}>
                      {oncelikEtiket[m._oncelik]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-left text-gray-700">{m.fis_no || '—'}</td>
                  <td className="px-4 py-3 text-left font-medium text-gray-800">{m.musteri_adi || '—'}</td>
                  <td className="px-4 py-3 text-left text-gray-600">{formatTarih(m.montaj_tarihi)}</td>
                  <td className="px-4 py-3 text-left text-gray-800">{formatTL(m.toplam_tutar)}</td>
                  <td className="px-4 py-3 text-left text-green-700">{formatTL(m.odenen_tutar)}</td>
                  <td className="px-4 py-3 text-left text-red-600 font-semibold">{formatTL(m.kalan_tutar)}</td>
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
    </div>
  )
}
