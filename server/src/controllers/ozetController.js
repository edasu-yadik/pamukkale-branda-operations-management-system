const pool = require('../db/pool');

async function genelOzet(req, res, next) {
  try {
    const [montajStat, tahsilatStat, musteriSayisi] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                                    AS toplam_montaj,
          COUNT(*) FILTER (WHERE montaj_durumu = 'beklemede')   AS bekleyen_montaj,
          COUNT(*) FILTER (WHERE montaj_durumu = 'planlandi')   AS planlanan_montaj,
          COUNT(*) FILTER (WHERE montaj_durumu = 'tamamlandi')  AS tamamlanan_montaj,
          COUNT(*) FILTER (WHERE odeme_durumu = 'beklemede')    AS odenmemis,
          COUNT(*) FILTER (WHERE odeme_durumu = 'kismi')        AS kismi_odenmis,
          COUNT(*) FILTER (WHERE odeme_durumu = 'tamamlandi')   AS tamamlandi_odeme,
          COALESCE(SUM(toplam_tutar), 0)              AS toplam_alacak
        FROM montajlar
      `),
      pool.query(`
        SELECT
          COALESCE(SUM(tutar), 0) AS toplam_tahsilat,
          COUNT(*)                AS tahsilat_sayisi
        FROM tahsilatlar
      `),
      pool.query('SELECT COUNT(*) AS musteri_sayisi FROM musteriler'),
    ]);

    const m = montajStat.rows[0];
    const t = tahsilatStat.rows[0];

    res.json({
      musteri_sayisi:   parseInt(musteriSayisi.rows[0].musteri_sayisi),
      toplam_montaj:    parseInt(m.toplam_montaj),
      bekleyen_montaj:  parseInt(m.bekleyen_montaj),
      planlanan_montaj: parseInt(m.planlanan_montaj),
      tamamlanan_montaj:parseInt(m.tamamlanan_montaj),
      odeme: {
        odenmemis:    parseInt(m.odenmemis),
        kismi:        parseInt(m.kismi_odenmis),
        tamamlandi:   parseInt(m.tamamlandi_odeme),
      },
      tutar: {
        toplam_alacak:    parseFloat(m.toplam_alacak),
        toplam_tahsilat:  parseFloat(t.toplam_tahsilat),
        kalan:            parseFloat(m.toplam_alacak) - parseFloat(t.toplam_tahsilat),
      },
      tahsilat_sayisi: parseInt(t.tahsilat_sayisi),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { genelOzet };
