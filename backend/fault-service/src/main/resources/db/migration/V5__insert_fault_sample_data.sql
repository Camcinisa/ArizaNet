INSERT INTO device_models (model_name, description)
VALUES
    ('GFS220', 'Para sayma makinesi modeli'),
    ('ATM', 'Otomatik para çekme makinesi'),
    ('Balyalama Makinesi', 'Para veya evrak balyalama işlemlerinde kullanılan cihaz'),
    ('Bantlama Makinesi', 'Banknot veya evrak bantlama işlemlerinde kullanılan cihaz');

INSERT INTO fault_solutions (
    device_model_id,
    error_code,
    title,
    description,
    possible_causes,
    solution_steps,
    required_tools,
    warnings
)
VALUES
    (
        (SELECT id FROM device_models WHERE model_name = 'GFS220'),
        '2201',
        'Besleme Sensörü Hatası',
        'Para besleme bölümünde sensör algılama hatası oluştu.',
        'Sensör kirlenmiş olabilir. Sensör kablosu çıkmış olabilir. Sensör arızalı olabilir.',
        'Cihaz kapatılır. Besleme bölümü açılır. Sensör temizlenir. Kablo kontrol edilir. Test sayımı yapılır.',
        'Tornavida, hava spreyi, temizlik bezi',
        'Cihaz enerjiliyken müdahale edilmemelidir.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'GFS220'),
        '2202',
        'Para Sıkışması',
        'Para taşıma yolunda sıkışma tespit edildi.',
        'Yıpranmış banknot. Eğilmiş banknot. Kirli taşıma yolu.',
        'Sıkışan banknot çıkarılır. Kanal temizlenir. Rulolar kontrol edilir. Tekrar test edilir.',
        'Tornavida, temizlik bezi',
        'Cihaz çalışırken sıkışan banknota müdahale edilmemelidir.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'GFS220'),
        '2301',
        'CIS Okuma Hatası',
        'Banknot görüntüsü okunamadı.',
        'CIS camı kirli olabilir. CIS kablosu gevşek olabilir. CIS modülü arızalı olabilir.',
        'Cam temizlenir. Kablo kontrol edilir. Test çalıştırılır.',
        'Mikrofiber bez, hava spreyi',
        'CIS yüzeyine sert malzemeyle müdahale edilmemelidir.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'GFS220'),
        '2401',
        'Red Kutusu Dolu',
        'Şüpheli banknot kutusu kapasite sınırına ulaştı.',
        'Red kutusu dolmuş olabilir. Sensör kirli olabilir.',
        'Red kutusu boşaltılır. Sensör temizlenir. Sayım yeniden başlatılır.',
        'Temizlik bezi',
        'Cihazın kapağı açıkken işlem başlatılmamalıdır.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'GFS220'),
        '2501',
        'Motor Hareket Hatası',
        'Taşıma motoru beklenen hareketi gerçekleştiremedi.',
        'Motor bağlantısında sorun olabilir. Kayış gevşemiş olabilir. Motor arızalı olabilir.',
        'Motor bağlantıları kontrol edilir. Kayışlar kontrol edilir. Motor testi yapılır.',
        'Tornavida, test ekipmanı',
        'Motor bölgesine cihaz kapatılmadan müdahale edilmemelidir.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'ATM'),
        'ATM1001',
        'Kart Sıkışması',
        'Kart okuyucu içerisinde kart sıkıştı.',
        'Kart yolu kirli olabilir. Yabancı cisim olabilir. Kart okuyucu mekanizması sıkışmış olabilir.',
        'Kart yolu kontrol edilir. Yabancı cisim temizlenir. Kart okuyucu resetlenir.',
        'Tornavida, temizlik aparatı',
        'Kart okuyucuya zorlayarak müdahale edilmemelidir.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'ATM'),
        'ATM1002',
        'Para Verme Modülü Hatası',
        'Cash dispenser para veremiyor.',
        'Kasetlerde sorun olabilir. Para sıkışması olabilir. Dispenser modülü arızalı olabilir.',
        'Kasetler kontrol edilir. Para sıkışması kontrol edilir. Dispenser testi yapılır.',
        'Servis anahtarı, test ekipmanı',
        'ATM enerjiliyken dispenser bölümüne müdahale edilmemelidir.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'ATM'),
        'ATM1003',
        'Kaset Eksik',
        'Para kasetlerinden biri algılanamadı.',
        'Kaset tam oturmamış olabilir. Sensör arızalı olabilir. Sistem kaseti okuyamıyor olabilir.',
        'Kaset yeniden takılır. Sensörler kontrol edilir. Sistem yeniden başlatılır.',
        'Servis anahtarı',
        'Kaset çıkarma ve takma işlemleri dikkatli yapılmalıdır.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'Balyalama Makinesi'),
        'BAL001',
        'Pres Basınç Hatası',
        'Pres ünitesi yeterli basınca ulaşamadı.',
        'Hidrolik yağ seviyesi düşük olabilir. Kaçak olabilir. Basınç sensörü arızalı olabilir.',
        'Hidrolik yağ seviyesi kontrol edilir. Kaçak kontrol edilir. Basınç sensörü kontrol edilir.',
        'Basınç ölçer, servis anahtarı',
        'Pres ünitesi çalışırken müdahale edilmemelidir.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'Balyalama Makinesi'),
        'BAL002',
        'Kapak Emniyet Hatası',
        'Kapak emniyet switchi aktif değil.',
        'Kapak açık olabilir. Switch bağlantısı çıkmış olabilir. Sensör arızalı olabilir.',
        'Kapak kapatılır. Switch bağlantıları kontrol edilir. Sensör testi yapılır.',
        'Tornavida, test cihazı',
        'Emniyet switchi devre dışı bırakılmamalıdır.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'Bantlama Makinesi'),
        'BNT001',
        'Bant Kopması',
        'Bant taşıma sırasında koptu.',
        'Bant yanlış takılmış olabilir. Gerginlik ayarı bozuk olabilir. Makara sıkışmış olabilir.',
        'Bant yeniden yüklenir. Gerginlik ayarı yapılır. Makara kontrol edilir.',
        'Yeni bant, tornavida',
        'Bant takılırken cihaz kapalı olmalıdır.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'Bantlama Makinesi'),
        'BNT002',
        'Isıtıcı Hatası',
        'Bant yapıştırma ünitesi yeterli sıcaklığa ulaşamadı.',
        'Rezistans arızalı olabilir. Sigorta atmış olabilir. Sıcaklık sensörü bozuk olabilir.',
        'Rezistans kontrol edilir. Sigorta kontrol edilir. Sıcaklık sensörü test edilir.',
        'Multimetre, tornavida',
        'Isıtıcı bölge sıcak olabileceği için dikkatli olunmalıdır.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'Bantlama Makinesi'),
        'BNT003',
        'Bant Sensörü Hatası',
        'Bant varlığı algılanamıyor.',
        'Sensör kirli olabilir. Sensör bağlantısı çıkmış olabilir. Sensör arızalı olabilir.',
        'Sensör temizlenir. Sensör bağlantıları kontrol edilir. Sensör değiştirilir.',
        'Temizlik bezi, tornavida',
        'Sensör değişimi sırasında cihaz kapalı olmalıdır.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'GFS220'),
        '2601',
        'Hazne Dolu',
        'Çıkış haznesi kapasite sınırına ulaştı.',
        'Hazne dolmuş olabilir. Hazne sensörü kirli olabilir.',
        'Banknotlar alınır. Hazne sensörü temizlenir. İşlem tekrar başlatılır.',
        'Temizlik bezi',
        'Hazne boşaltılmadan sayım işlemine devam edilmemelidir.'
    ),
    (
        (SELECT id FROM device_models WHERE model_name = 'GFS220'),
        '2701',
        'Üst Kapak Açık',
        'Üst kapak sensörü açık durumda.',
        'Üst kapak açık kalmış olabilir. Sensör arızalı olabilir. Switch bağlantısı gevşemiş olabilir.',
        'Kapak kapatılır. Sensör kontrol edilir. Switch testi yapılır.',
        'Tornavida, test ekipmanı',
        'Kapak açıkken cihaz çalıştırılmamalıdır.'
    );