const pool = require('../db/pool');

async function tumMusteriler(req, res, next) {
  try {
    const { ara } = req.query;
    let sorgu = 'SELECT * FROM musteriler';
    const params = [];

    if (ara) {
      params.push(`%${ara}%`);
      sorgu += ` WHERE ad_soyad ILIKE $1 OR telefon ILIKE $1`;
    }

    sorgu += ' ORDER BY ad_soyad ASC';
    const { rows } = await pool.query(sorgu, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function musteriGetir(req, res, next) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM musteriler WHERE id = $1',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ hata: 'Müşteri bulunamadı.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function musteriOlustur(req, res, next) {
  try {
    const { ad_soyad, telefon, adres, notlar } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO musteriler (ad_soyad, telefon, adres, notlar)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [ad_soyad, telefon || null, adres || null, notlar || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function musteriGuncelle(req, res, next) {
  try {
    const { ad_soyad, telefon, adres, notlar } = req.body;

    const mevcut = await pool.query('SELECT * FROM musteriler WHERE id = $1', [req.params.id]);
    if (!mevcut.rows.length) {
      return res.status(404).json({ hata: 'Müşteri bulunamadı.' });
    }

    const m = mevcut.rows[0];
    const { rows } = await pool.query(
      `UPDATE musteriler SET
        ad_soyad = $1, telefon = $2, adres = $3, notlar = $4
       WHERE id = $5 RETURNING *`,
      [
        ad_soyad ?? m.ad_soyad,
        telefon  ?? m.telefon,
        adres    ?? m.adres,
        notlar   ?? m.notlar,
        req.params.id,
      ]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function musteriSil(req, res, next) {
  try {
    const { rows } = await pool.query(
      'DELETE FROM musteriler WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ hata: 'Müşteri bulunamadı.' });
    }
    res.json({ mesaj: 'Müşteri silindi.', id: rows[0].id });
  } catch (err) {
    next(err);
  }
}

async function musteriMontajlari(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM montaj_ozet WHERE musteri_id = $1 ORDER BY siparis_tarihi DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  tumMusteriler,
  musteriGetir,
  musteriOlustur,
  musteriGuncelle,
  musteriSil,
  musteriMontajlari,
};
