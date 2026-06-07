const pool = require('../db/pool');

async function tumMontajlar(req, res, next) {
  try {
    const { montaj_durumu, odeme_durumu, musteri_id, baslangic, bitis, ara } = req.query;

    let sart = [];
    const params = [];
    let i = 1;

    if (montaj_durumu) { params.push(montaj_durumu); sart.push(`m.montaj_durumu = $${i++}`); }
    if (odeme_durumu)  { params.push(odeme_durumu);  sart.push(`m.odeme_durumu = $${i++}`); }
    if (musteri_id)    { params.push(musteri_id);    sart.push(`m.musteri_id = $${i++}`); }
    if (baslangic)     { params.push(baslangic);     sart.push(`m.siparis_tarihi >= $${i++}`); }
    if (bitis)         { params.push(bitis);         sart.push(`m.siparis_tarihi <= $${i++}`); }
    if (ara) {
      params.push(`%${ara}%`);
      sart.push(`(mu.ad_soyad ILIKE $${i} OR m.fis_no ILIKE $${i} OR m.fatura_no ILIKE $${i})`);
      i++;
    }

    const where = sart.length ? `WHERE ${sart.join(' AND ')}` : '';

    const sorgu = `
      SELECT
        m.id, m.fis_no, m.fatura_no, m.musteri_id,
        mu.ad_soyad AS musteri_adi,
        m.siparis_tarihi, m.montaj_tarihi,
        m.toplam_tutar,
        COALESCE(SUM(t.tutar), 0) AS odenen_tutar,
        m.toplam_tutar - COALESCE(SUM(t.tutar), 0) AS kalan_tutar,
        m.montaj_durumu, m.odeme_durumu, m.aciklama,
        m.olusturma_tarihi
      FROM montajlar m
      JOIN musteriler mu ON mu.id = m.musteri_id
      LEFT JOIN tahsilatlar t ON t.montaj_id = m.id
      ${where}
      GROUP BY m.id, mu.ad_soyad
      ORDER BY m.olusturma_tarihi DESC
    `;

    const { rows } = await pool.query(sorgu, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function montajGetir(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT
        m.*, mu.ad_soyad AS musteri_adi,
        COALESCE(SUM(t.tutar), 0) AS odenen_tutar,
        m.toplam_tutar - COALESCE(SUM(t.tutar), 0) AS kalan_tutar
       FROM montajlar m
       JOIN musteriler mu ON mu.id = m.musteri_id
       LEFT JOIN tahsilatlar t ON t.montaj_id = m.id
       WHERE m.id = $1
       GROUP BY m.id, mu.ad_soyad`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ hata: 'Montaj bulunamadı.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function montajOlustur(req, res, next) {
  try {
    const { musteri_id, fis_no, fatura_no, siparis_tarihi, montaj_tarihi, toplam_tutar, montaj_durumu, aciklama } = req.body;

    const musteriKontrol = await pool.query('SELECT id FROM musteriler WHERE id = $1', [musteri_id]);
    if (!musteriKontrol.rows.length) {
      return res.status(404).json({ hata: 'Belirtilen müşteri bulunamadı.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO montajlar
        (musteri_id, fis_no, fatura_no, siparis_tarihi, montaj_tarihi, toplam_tutar, montaj_durumu, aciklama)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        musteri_id,
        fis_no,
        fatura_no || null,
        siparis_tarihi || new Date().toISOString().split('T')[0],
        montaj_tarihi || null,
        toplam_tutar,
        montaj_durumu || 'beklemede',
        aciklama || null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function montajGuncelle(req, res, next) {
  try {
    const mevcut = await pool.query('SELECT * FROM montajlar WHERE id = $1', [req.params.id]);
    if (!mevcut.rows.length) {
      return res.status(404).json({ hata: 'Montaj bulunamadı.' });
    }

    const m = mevcut.rows[0];
    const { fatura_no, siparis_tarihi, montaj_tarihi, toplam_tutar, montaj_durumu, odeme_durumu, aciklama } = req.body;

    const { rows } = await pool.query(
      `UPDATE montajlar SET
        fatura_no      = $1,
        siparis_tarihi = $2,
        montaj_tarihi  = $3,
        toplam_tutar   = $4,
        montaj_durumu  = $5,
        odeme_durumu   = $6,
        aciklama       = $7
       WHERE id = $8 RETURNING *`,
      [
        fatura_no      ?? m.fatura_no,
        siparis_tarihi ?? m.siparis_tarihi,
        montaj_tarihi  !== undefined ? montaj_tarihi : m.montaj_tarihi,
        toplam_tutar   ?? m.toplam_tutar,
        montaj_durumu  ?? m.montaj_durumu,
        odeme_durumu   ?? m.odeme_durumu,
        aciklama       ?? m.aciklama,
        req.params.id,
      ]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function montajSil(req, res, next) {
  try {
    const tahsilatKontrol = await pool.query(
      'SELECT COUNT(*) FROM tahsilatlar WHERE montaj_id = $1',
      [req.params.id]
    );
    if (parseInt(tahsilatKontrol.rows[0].count) > 0) {
      return res.status(409).json({ hata: 'Bu montaja ait tahsilatlar mevcut. Önce tahsilatları siliniz.' });
    }

    const { rows } = await pool.query(
      'DELETE FROM montajlar WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ hata: 'Montaj bulunamadı.' });
    }
    res.json({ mesaj: 'Montaj silindi.', id: rows[0].id });
  } catch (err) {
    next(err);
  }
}

async function montajTahsilatlari(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tahsilatlar WHERE montaj_id = $1 ORDER BY tahsilat_tarihi DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  tumMontajlar,
  montajGetir,
  montajOlustur,
  montajGuncelle,
  montajSil,
  montajTahsilatlari,
};
