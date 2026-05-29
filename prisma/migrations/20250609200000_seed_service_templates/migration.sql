-- Seed: Paslaugų katalogo šablonai populiariausiems sportams
-- INSERT IGNORE -- nekeis esančių eilučių pakartotinai diegiant

INSERT IGNORE INTO `ServiceTemplate` (`id`, `name`, `description`, `createdAt`) VALUES

-- ─── PADELIS ────────────────────────────────────────────────────────────────
(
  'tpl_padelis_pradedant',
  'Padelio treniruotė pradedantiesiems',
  'Individuali treniruotė tiems, kurie žengią pirmuosius žingsnius padelo pasaulyje. Mokome taisyklių, pagrindinių smūgių ir taisyklingos padėties aikštelėje.',
  NOW()
),
(
  'tpl_padelis_technika',
  'Padelio technikos tobulinimas',
  'Treniruotė žaidėjams, norintiems patobulinti smūgių tikslumą, kojų darbą ir padėtį aikštelėje. Analizuojame klaidas ir jas koreguojame.',
  NOW()
),
(
  'tpl_padelis_taktika',
  'Padelio taktikos ir strategijos treniruotė',
  'Gilesnė taktikos analizė: pozicionavimas, ryšys su partneriu, oponento žaidimo analizė ir kontraatakų kūrimas.',
  NOW()
),
(
  'tpl_padelis_grupine',
  'Grupinė padelio treniruotė',
  'Treniruotė mažai grupei – daugiau praktikos rungtynėmis, interaktyvios pratybos ir bendravimas su kitais žaidėjais.',
  NOW()
),
(
  'tpl_padelis_vaiku',
  'Vaikų padelio treniruotė',
  'Padelo pagrindai vaikams žaismingai ir saugiai. Laviname koordinaciją, refleksus ir meilę aktyviam gyvenimo būdui.',
  NOW()
),
(
  'tpl_padelis_intensyvi',
  'Intensyvi padelio treniruotė',
  'Treniruotė pažengusiems žaidėjams: greitis, reakcija, fizinis pasiruošimas ir sudėtingos taktinės situacijos aukštame tempe.',
  NOW()
),

-- ─── TENISAS ────────────────────────────────────────────────────────────────
(
  'tpl_tenisas_pradedant',
  'Teniso treniruotė pradedantiesiems',
  'Tvirtas pagrindas: taisyklingas raketos laikymas, servas, forhendas ir bekhendas. Puiki pradžia ilgai kelionei su tenisu.',
  NOW()
),
(
  'tpl_tenisas_technika',
  'Teniso technikos tobulinimas',
  'Smūgių mechanikos, kojų darbo ir balanso analizė bei korekcija. Skirta žaidėjams, norintiems padaryti šuolį į kitą lygį.',
  NOW()
),
(
  'tpl_tenisas_taktika',
  'Teniso taktikos treniruotė',
  'Žaidimo schemos, padėties aikštelėje, servo taktikos ir atakuojančio žaidimo tobulinimas pažengusiems teniso žaidėjams.',
  NOW()
),
(
  'tpl_tenisas_grupine',
  'Grupinė teniso treniruotė',
  'Dinamiška grupinė sesija: techniniai pratimai, mini-rungtynės ir kovos situacijos. Idealu treniruotis kartu su draugais.',
  NOW()
),
(
  'tpl_tenisas_vaiku',
  'Vaikų teniso treniruotė',
  'Pritaikyta vaikams programa: žaismingi pratimai, koordinacijos lavinimas ir tenisininkų ugdymas nuo mažų dienų.',
  NOW()
),

-- ─── BADMINTONAS ────────────────────────────────────────────────────────────
(
  'tpl_badminton_pradedant',
  'Badmintono treniruotė pradedantiesiems',
  'Badmintono abėcėlė: smūgiai nuo žemės ir virš galvos, servas, judėjimas aikštelėje ir bazinė taktika nuo nulio.',
  NOW()
),
(
  'tpl_badminton_technika',
  'Badmintono technikos ir greičio treniruotė',
  'Smūgių greičio, tikslingumo ir reakcijos lavinimas. Pratimai skirti padidinti žaidimo tempą ir efektyvumą.',
  NOW()
),
(
  'tpl_badminton_grupine',
  'Grupinė badmintono treniruotė',
  'Grupinė sesija porose ir ketvertais: techniniai elementai, koordinaciniai pratimai ir laisvosios rungtynės.',
  NOW()
),

-- ─── SKVOŠAS ────────────────────────────────────────────────────────────────
(
  'tpl_skvosas_pradedant',
  'Skvošo treniruotė pradedantiesiems',
  'Skvošo pagrindai: aikštelės geometrija, smūgiai į sienas, servas ir bazinė taktika. Saugi ir efektyvi pradžia.',
  NOW()
),
(
  'tpl_skvosas_technika',
  'Skvošo technikos tobulinimas',
  'Smūgių variacijų, kampinių kamuoliukų ir padėties aikštelės centre tobulinimas pažengusiems žaidėjams.',
  NOW()
),

-- ─── STALO TENISAS ──────────────────────────────────────────────────────────
(
  'tpl_stalotenisas_pradedant',
  'Stalo teniso treniruotė pradedantiesiems',
  'Taisyklingas raketos laikymas, forhendo ir bekhendo smūgiai, servas ir kamuoliuko kontrolė – viskas nuo nulio.',
  NOW()
),
(
  'tpl_stalotenisas_technika',
  'Stalo teniso technikos tobulinimas',
  'Sukimų (topspino, slajso) technika, greičio pratybos ir taktinės schemos pažengusiems stalo teniso žaidėjams.',
  NOW()
),

-- ─── KREPŠINIS ──────────────────────────────────────────────────────────────
(
  'tpl_krepsin_pradedant',
  'Krepšinio treniruotė pradedantiesiems',
  'Krepšinio pagrindai: kamuolio valdymas, perdavimai, metimai, gynybos ir puolimo padėtys aikštelėje.',
  NOW()
),
(
  'tpl_krepsin_grupine',
  'Grupinė krepšinio treniruotė',
  'Komandinio krepšinio pratybos: žaidimo schemos, gynybos principai, puolimo kombinacijos ir kontrolinės rungtynės.',
  NOW()
),

-- ─── BENDRA ─────────────────────────────────────────────────────────────────
(
  'tpl_bendra_fizinis',
  'Fizinio pasiruošimo treniruotė',
  'Sportinis fizinis rengimas: ištvermė, greitis, koordinacija, lankstumas ir jėga. Tinka kaip papildoma treniruotė prie bet kurio sporto.',
  NOW()
);
