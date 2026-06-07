const pool = require('../db/pool');

async function tumTahsilatlar(req, res, next) {
  try {
    const { montaj_id, baslangic, bitis, odeme_yontemi } = req.query;

    let sart = [];
    const params = [];
    let i = 1;

    if (montaj_id)     { params.push(montaj_id);     sart.push(`t.montaj_id = $${i++}`); }
    if (baslangic)     { params.push(baslangic);     sart.push(`t.tahsilat_tarihi >= $${i++}`); }
    if (bitis)         { params.push(bitis);         sart.push(`t.tahsilat_tarihi <= $${i++}`); }
    if (odeme_yontemi) { params.push(odeme_yontemi); sart.push(`t.odeme_yontemi = $${i++}`); }

    const where = sart.length ? `WHERE ${sart.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT t.*, m.fis_no, mu.ad_soyad AS musteri_adi
       FROM tahsilatlar t
       JOIN montajlar m ON m.id = t.montaj_id
       JOIN musteriler mu ON mu.id = m.musteri_id
       ${where}
       ORDER BY t.tahsilat_tarihi DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function tahsilatGetir(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT t.*, m.fis_no, mu.ad_soyad AS musteri_adi
       FROM tahsilatlar t
       JOIN montajlar m ON m.id = t.montaj_id
       JOIN musteriler mu ON mu.id = m.musteri_id
       WHERE t.id = $1`,
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ hata: 'Tahsilat bulunamadı.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function tahsilatOlustur(req, res, next) {
  try {
    const { montaj_id, tutar, tahsilat_tarihi, odeme_yontemi, aciklama } = req.body;

    const montajKontrol = await pool.query('SELECT id, toplam_tutar FROM montajlar WHERE id = $1', [montaj_id]);
    if (!montajKontrol.rows.length) {
      return res.status(404).json({ hata: 'Belirtilen montaj bulunamadı.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO tahsilatlar (montaj_id, tutar, tahsilat_tarihi, odeme_yontemi, aciklama)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        montaj_id,
        tutar,
        tahsilat_tarihi || new Date().toISOString().split('T')[0],
        odeme_yontemi || 'nakit',
        aciklama || null,
      ]
    );

    await odemeOtomatikGuncelle(montaj_id);

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function tahsilatGuncelle(req, res, next) {
  try {
    const mevcut = await pool.query('SELECT * FROM tahsilatlar WHERE id = $1', [req.params.id]);
    if (!mevcut.rows.length) {
      return res.status(404).json({ hata: 'Tahsilat bulunamadı.' });
    }

    const t = mevcut.rows[0];
    const { tutar, tahsilat_tarihi, odeme_yontemi, aciklama } = req.body;

    const { rows } = await pool.query(
      `UPDATE tahsilatlar SET
        tutar = $1, tahsilat_tarihi = $2, odeme_yontemi = $3, aciklama = $4
       WHERE id = $5 RETURNING *`,
      [
        tutar           ?? t.tutar,
        tahsilat_tarihi ?? t.tahsilat_tarihi,
        odeme_yontemi   ?? t.odeme_yontemi,
        aciklama        ?? t.aciklama,
        req.params.id,
      ]
    );

    await odemeOtomatikGuncelle(t.montaj_id);

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function tahsilatSil(req, res, next) {
  try {
    const mevcut = await pool.query('SELECT * FROM tahsilatlar WHERE id = $1', [req.params.id]);
    if (!mevcut.rows.length) {
      return res.status(404).json({ hata: 'Tahsilat bulunamadı.' });
    }

    const montaj_id = mevcut.rows[0].montaj_id;
    await pool.query('DELETE FROM tahsilatlar WHERE id = $1', [req.params.id]);
    await odemeOtomatikGuncelle(montaj_id);

    res.json({ mesaj: 'Tahsilat silindi.', id: parseInt(req.params.id) });
  } catch (err) {
    next(err);
  }
}

async function odemeOtomatikGuncelle(montaj_id) {
  const { rows } = await pool.query(
    `SELECT m.toplam_tutar, COALESCE(SUM(t.tutar), 0) AS odenen
     FROM montajlar m
     LEFT JOIN tahsilatlar t ON t.montaj_id = m.id
     WHERE m.id = $1
     GROUP BY m.toplam_tutar`,
    [montaj_id]
  );
  if (!rows.length) return;

  const { toplam_tutar, odenen } = rows[0];
  let odeme_durumu = 'beklemede';
  if (parseFloat(odenen) >= parseFloat(toplam_tutar)) odeme_durumu = 'tamamlandi';
  else if (parseFloat(odenen) > 0) odeme_durumu = 'kismi';

  await pool.query(
    'UPDATE montajlar SET odeme_durumu = $1 WHERE id = $2',
    [odeme_durumu, montaj_id]
  );
}

module.exports = {
  tumTahsilatlar,
  tahsilatGetir,
  tahsilatOlustur,
  tahsilatGuncelle,
  tahsilatSil,
};
