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

function oncelikHesapla(m) {
  if (m.montaj_durumu === 'tamamlandi') return 'tamamlandi'
  if (m.montaj_durumu === 'iptal')      return 'iptal'
  if (m.montaj_durumu === 'beklemede')  return 'cok_acil'

  // planlandi veya diğerleri
  if (m.montaj_tarihi) {
    const bugun = new Date(); bugun.setHours(0,0,0,0)
    const tarih = new Date(m.montaj_tarihi); tarih.setHours(0,0,0,0)
    const yediGun = new Date(bugun); yediGun.setDate(bugun.getDate() + 7)
    if (tarih <= yediGun) return 'acil'
  }
  if (m.montaj_durumu === 'planlandi') return 'planli'
  return 'takip'
}

const oncelikSira = { cok_acil: 0, acil: 1, planli: 2, takip: 3, iptal: 4, tamamlandi: 5 }

const oncelikRenk = {
  cok_acil:   'bg-red-100 text-red-800',
  acil:       'bg-orange-100 text-orange-800',
  planli:     'bg-blue-100 text-blue-700',
  takip:      'bg-gray-100 text-gray-600',
  tamamlandi: 'bg-green-100 text-green-800',
  iptal:      'bg-red-50 text-red-400',
}

const oncelikEtiket = {
  cok_acil:   'Çok Acil',
  acil:       'Acil',
  planli:     'Planlı',
  takip:      'Takip',
  tamamlandi: 'Tamamlandı',
  iptal:      'İptal',
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

function Rozet({ deger, renkMap, etiketMap }) {
  const renk = renkMap[deger] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${renk}`}>
      {etiketMap[deger] || deger || '—'}
    </span>
  )
}

export default function Montajlar() {
  const navigate = useNavigate()
  const [montajlar, setMontajlar] = useState([])
  const [arama, setArama] = useState('')
  const [yukleniyor, setYukleniyor] = useState(true)
  const [hata, setHata] = useState(null)

  useEffect(() => {
    api.get('/montajlar')
      .then((res) => {
        const sirali = res.data
          .map((m) => ({ ...m, _oncelik: oncelikHesapla(m) }))
          .sort((a, b) => {
            const siraCmp = oncelikSira[a._oncelik] - oncelikSira[b._oncelik]
            if (siraCmp !== 0) return siraCmp
            const tarihA = a.montaj_tarihi ? new Date(a.montaj_tarihi) : new Date(9e15)
            const tarihB = b.montaj_tarihi ? new Date(b.montaj_tarihi) : new Date(9e15)
            const tarihCmp = tarihA - tarihB
            if (tarihCmp !== 0) return tarihCmp
            return parseFloat(b.kalan_tutar || 0) - parseFloat(a.kalan_tutar || 0)
          })
        setMontajlar(sirali)
      })
      .catch(() => setHata('Montajlar yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setYukleniyor(false))
  }, [])

  const filtreli = montajlar.filter((m) => {
    const q = arama.toLowerCase()
    return (
      (m.fis_no          || '').toLowerCase().includes(q) ||
      (m.fatura_no       || '').toLowerCase().includes(q) ||
      (m.musteri_adi     || '').toLowerCase().includes(q) ||
      (m.montaj_durumu   || '').toLowerCase().includes(q) ||
      (m.odeme_durumu    || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-700 mb-4">Montajlar</h1>

      {yukleniyor && <p className="text-gray-500 text-center mt-8">Yükleniyor...</p>}
      {hata && <p className="text-red-600 text-center mt-8">{hata}</p>}

      {!yukleniyor && !hata && (
        <>
          <input
            type="text"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="Fiş no, müşteri, fatura veya durum ara..."
            className="border rounded-lg px-4 py-2 w-full mb-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />

          {filtreli.length === 0 ? (
            <p className="text-gray-400 text-center mt-12">
              {arama ? 'Arama sonucu bulunamadı.' : 'Henüz montaj kaydı yok.'}
            </p>
          ) : (
            <div className="mt-2 overflow-x-auto rounded-lg shadow bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="px-4 py-3 text-left font-medium"></th>
                    <th className="px-4 py-3 text-left font-medium">Öncelik</th>
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
                  {filtreli.map((m, i) => (
                    <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-left">
                        <button
                          onClick={() => navigate(`/montajlar/${m.id}`)}
                          className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                        >
                          Detay
                        </button>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${oncelikRenk[m._oncelik]}`}>
                          {oncelikEtiket[m._oncelik]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-left text-gray-400">{m.id}</td>
                      <td className="px-4 py-3 text-left text-gray-700">{m.fis_no || '—'}</td>
                      <td className="px-4 py-3 text-left text-gray-700">{m.fatura_no || '—'}</td>
                      <td className="px-4 py-3 text-left font-medium text-gray-800">{m.musteri_adi || '—'}</td>
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
        </>
      )}
    </div>
  )
}
