-- Pamukkale Branda - Veritabanı Schema
-- Çalıştırma: psql -U postgres -d pamukkale_branda -f schema.sql

-- Veritabanını oluştur (ilk kurulumda psql ile manuel çalıştır)
-- CREATE DATABASE pamukkale_branda;

-- =====================
-- MÜŞTERİLER
-- =====================
CREATE TABLE IF NOT EXISTS musteriler (
  id          SERIAL PRIMARY KEY,
  ad_soyad    VARCHAR(150) NOT NULL,
  telefon     VARCHAR(20),
  adres       TEXT,
  notlar      TEXT,
  olusturma_tarihi  TIMESTAMP DEFAULT NOW(),
  guncelleme_tarihi TIMESTAMP DEFAULT NOW()
);

-- =====================
-- MONTAJ İŞLERİ
-- =====================
CREATE TABLE IF NOT EXISTS montajlar (
  id                SERIAL PRIMARY KEY,
  musteri_id        INTEGER NOT NULL REFERENCES musteriler(id) ON DELETE RESTRICT,
  fis_no            VARCHAR(50) UNIQUE NOT NULL,
  fatura_no         VARCHAR(50),
  siparis_tarihi    DATE NOT NULL DEFAULT CURRENT_DATE,
  montaj_tarihi     DATE,
  aciklama          TEXT,
  toplam_tutar      NUMERIC(12, 2) NOT NULL DEFAULT 0,
  montaj_durumu     VARCHAR(20) NOT NULL DEFAULT 'beklemede'
                    CHECK (montaj_durumu IN ('beklemede', 'planlandi', 'tamamlandi', 'iptal')),
  odeme_durumu      VARCHAR(20) NOT NULL DEFAULT 'beklemede'
                    CHECK (odeme_durumu IN ('beklemede', 'kismi', 'tamamlandi')),
  olusturma_tarihi  TIMESTAMP DEFAULT NOW(),
  guncelleme_tarihi TIMESTAMP DEFAULT NOW()
);

-- =====================
-- TAHSİLATLAR
-- =====================
CREATE TABLE IF NOT EXISTS tahsilatlar (
  id                SERIAL PRIMARY KEY,
  montaj_id         INTEGER NOT NULL REFERENCES montajlar(id) ON DELETE RESTRICT,
  tutar             NUMERIC(12, 2) NOT NULL CHECK (tutar > 0),
  tahsilat_tarihi   DATE NOT NULL DEFAULT CURRENT_DATE,
  odeme_yontemi     VARCHAR(30) DEFAULT 'nakit'
                    CHECK (odeme_yontemi IN ('nakit', 'havale', 'kredi_karti', 'cek', 'diger')),
  aciklama          TEXT,
  olusturma_tarihi  TIMESTAMP DEFAULT NOW()
);

-- =====================
-- TRIGGER: updated_at otomatik güncelle
-- =====================
CREATE OR REPLACE FUNCTION guncelleme_tarihi_set()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guncelleme_tarihi = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER musteriler_guncelleme
  BEFORE UPDATE ON musteriler
  FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_set();

CREATE OR REPLACE TRIGGER montajlar_guncelleme
  BEFORE UPDATE ON montajlar
  FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_set();

-- =====================
-- TRIGGER: ödeme durumunu otomatik hesapla
-- =====================
CREATE OR REPLACE FUNCTION odeme_durumunu_guncelle()
RETURNS TRIGGER AS $$
DECLARE
  toplam_odenen NUMERIC(12,2);
  montaj_toplam NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(tutar), 0) INTO toplam_odenen
  FROM tahsilatlar
  WHERE montaj_id = COALESCE(NEW.montaj_id, OLD.montaj_id);

  SELECT toplam_tutar INTO montaj_toplam
  FROM montajlar
  WHERE id = COALESCE(NEW.montaj_id, OLD.montaj_id);

  UPDATE montajlar SET
    odeme_durumu = CASE
      WHEN toplam_odenen <= 0          THEN 'beklemede'
      WHEN toplam_odenen >= montaj_toplam THEN 'tamamlandi'
      ELSE 'kismi'
    END
  WHERE id = COALESCE(NEW.montaj_id, OLD.montaj_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tahsilat_sonrasi_odeme_durumu
  AFTER INSERT OR UPDATE OR DELETE ON tahsilatlar
  FOR EACH ROW EXECUTE FUNCTION odeme_durumunu_guncelle();

-- =====================
-- VİEW: montaj özet (kalan tutar hesaplamalı)
-- =====================
CREATE OR REPLACE VIEW montaj_ozet AS
SELECT
  m.id,
  m.fis_no,
  m.fatura_no,
  m.musteri_id,
  mu.ad_soyad AS musteri_adi,
  m.siparis_tarihi,
  m.montaj_tarihi,
  m.toplam_tutar,
  COALESCE(SUM(t.tutar), 0)              AS odenen_tutar,
  m.toplam_tutar - COALESCE(SUM(t.tutar), 0) AS kalan_tutar,
  m.montaj_durumu,
  m.odeme_durumu,
  m.aciklama,
  m.olusturma_tarihi
FROM montajlar m
JOIN musteriler mu ON mu.id = m.musteri_id
LEFT JOIN tahsilatlar t ON t.montaj_id = m.id
GROUP BY m.id, mu.ad_soyad;

-- =====================
-- ÖRNEK VERİ (isteğe bağlı, test için)
-- =====================
-- INSERT INTO musteriler (ad_soyad, telefon, adres) VALUES
--   ('Ahmet Yılmaz', '0532 111 2233', 'Denizli Merkez'),
--   ('Fatma Kaya',   '0543 444 5566', 'Pamukkale');
