const formData = [
  // ==================== PUNJAB ====================
  {
    id: 'caste-certificate',
    name: 'Caste Certificate',
    nameHindi: 'जाति प्रमाण पत्र',
    state: 'punjab',
    category: 'income',
    categoryIcon: '📄',
    documents: [
      { name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', note: 'Original + photocopy' },
      { name: 'Self Declaration / Affidavit', nameHindi: 'स्व-घोषणा पत्र / शपथ पत्र', note: 'Signed by applicant/parent' },
      { name: 'Residence Proof', nameHindi: 'निवास प्रमाण पत्र (Aadhaar/Voter ID/Electricity Bill)', note: 'Photocopy' },
      { name: 'Caste Proof of Father/Relative', nameHindi: 'पिता/रिश्तेदार का जाति प्रमाण पत्र', note: 'If available' },
      { name: 'School Leaving Certificate', nameHindi: 'स्कूल छोड़ने का प्रमाण पत्र', note: 'Photocopy showing caste' }
    ],
    office: {
      type: 'Tehsil Office / Suwidha Kendra',
      typeHindi: 'तहसील कार्यालय / सुविधा केंद्र',
      counter: 'Counter 4',
      hours: '9:00 AM – 1:00 PM, Mon–Sat',
      onlineUrl: 'https://esewa.punjab.gov.in',
      onlineAvailable: true
    },
    fees: '₹40 (Government Fee) + Suwidha charges',
    processingDays: '15–21 दिन',
    helpline: '1800-180-1551',
    tips: [
      'सभी documents की photocopy पहले से बनवा लें।',
      'Dalal को पैसे न दें — यह सेवा पूरी तरह मुफ्त या निर्धारित शुल्क पर है।',
      'अपने सरपंच या पार्षद से जाति सत्यापन लिखवा लें, इससे काम जल्दी होगा।'
    ]
  },
  {
    id: 'income-certificate',
    name: 'Income Certificate',
    nameHindi: 'आय प्रमाण पत्र',
    state: 'punjab',
    category: 'income',
    categoryIcon: '💰',
    documents: [
      { name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', note: 'Original + photocopy' },
      { name: 'Self Declaration of Income', nameHindi: 'आय का स्व-घोषणा पत्र', note: 'Attested by Sarpanch/MC' },
      { name: 'Salary Slip / ITR / Form 16', nameHindi: 'सैलरी स्लिप / ITR / फॉर्म 16', note: 'For salaried employees' },
      { name: 'Land Record (Fard)', nameHindi: 'जमीन की फर्द', note: 'For farmers (if applicable)' },
      { name: 'Ration Card', nameHindi: 'राशन कार्ड', note: 'Photocopy' }
    ],
    office: {
      type: 'Tehsil Office / Sewa Kendra',
      typeHindi: 'तहसील कार्यालय / सेवा केंद्र',
      counter: 'Counter 2',
      hours: '9:00 AM – 5:00 PM, Mon–Fri',
      onlineUrl: 'https://esewa.punjab.gov.in',
      onlineAvailable: true
    },
    fees: '₹40 (Sewa Kendra Service Fee)',
    processingDays: '10–15 दिन',
    helpline: '1800-180-1551',
    tips: [
      'घोषणा पत्र पर सरपंच, पार्षद या राजपत्रित अधिकारी के हस्ताक्षर अवश्य करवाएं।',
      'यदि नौकरी करते हैं, तो पिछले 3 महीनों की सैलरी स्लिप लगाना आवश्यक है।'
    ]
  },
  {
    id: 'domicile-certificate',
    name: 'Domicile / Residence Certificate',
    nameHindi: 'निवास प्रमाण पत्र',
    state: 'punjab',
    category: 'identity',
    categoryIcon: '🏠',
    documents: [
      { name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', note: 'Original + photocopy' },
      { name: 'Age Proof (Birth Certificate/School Matric Certificate)', nameHindi: 'आयु प्रमाण (जन्म प्रमाण पत्र / 10वीं सर्टिफिकेट)', note: 'Photocopy' },
      { name: 'Stay Proof for 5 Years (Voter List/Electricity Bill)', nameHindi: '5 साल का निवास प्रमाण (वोटर लिस्ट/बिजली बिल/स्कूल सर्टिफिकेट)', note: 'Copy of last 5 years' },
      { name: 'Self Declaration / Affidavit', nameHindi: 'स्व-घोषणा पत्र / शपथ पत्र', note: 'Signed' }
    ],
    office: {
      type: 'Tehsil Office / Sewa Kendra',
      typeHindi: 'तहसील कार्यालय / सेवा केंद्र',
      counter: 'Counter 3',
      hours: '9:00 AM – 5:00 PM, Mon–Fri',
      onlineUrl: 'https://esewa.punjab.gov.in',
      onlineAvailable: true
    },
    fees: '₹40 (Sewa Kendra Fee)',
    processingDays: '15–20 दिन',
    helpline: '1800-180-1551',
    tips: [
      'पंजाब में निवास का प्रमाण देने के लिए 5 साल पुराने दस्तावेज का होना जरूरी है।',
      'स्कूल का चरित्र प्रमाण पत्र या 10वीं का पासिंग सर्टिफिकेट निवास प्रमाण के रूप में बहुत मान्य है।'
    ]
  },
  {
    id: 'birth-certificate',
    name: 'Birth Certificate',
    nameHindi: 'जन्म प्रमाण पत्र',
    state: 'punjab',
    category: 'identity',
    categoryIcon: '👶',
    documents: [
      { name: 'Hospital Birth Record / Slip', nameHindi: 'अस्पताल से जन्म का पर्चा', note: 'Original' },
      { name: 'Aadhaar Card of Parents', nameHindi: 'माता-पिता का आधार कार्ड', note: 'Photocopy' },
      { name: 'Application Form', nameHindi: 'आवेदन पत्र', note: 'Filled completely' },
      { name: 'Affidavit (If delayed)', nameHindi: 'शपथ पत्र (यदि 1 साल से देरी हो)', note: 'Required for delayed registration' }
    ],
    office: {
      type: 'Municipal Corporation / Civil Hospital / Sewa Kendra',
      typeHindi: 'नगर निगम / सिविल अस्पताल / सेवा केंद्र',
      counter: 'Birth/Death Wing',
      hours: '9:00 AM – 3:00 PM, Mon–Sat',
      onlineUrl: 'https://esewa.punjab.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (यदि 21 दिनों में हो) / ₹10-50 (देरी होने पर)',
    processingDays: '7–10 दिन',
    helpline: '104',
    tips: [
      'जन्म के 21 दिनों के भीतर पंजीकरण कराने पर कोई सरकारी शुल्क नहीं लगता।',
      'अस्पताल से डिस्चार्ज स्लिप संभाल कर रखें, पंजीकरण के समय मुख्य दस्तावेज है।'
    ]
  },
  {
    id: 'death-certificate',
    name: 'Death Certificate',
    nameHindi: 'मृत्यु प्रमाण पत्र',
    state: 'punjab',
    category: 'identity',
    categoryIcon: '✝️',
    documents: [
      { name: 'Hospital Death Report', nameHindi: 'अस्पताल से मृत्यु की रिपोर्ट', note: 'Original (if died in hospital)' },
      { name: 'Cremation Ground Receipt', nameHindi: 'शमशान घाट की रसीद / पर्ची', note: 'Original' },
      { name: 'Aadhaar Card of Deceased', nameHindi: 'मृतक का आधार कार्ड', note: 'Photocopy' },
      { name: 'Aadhaar Card of Applicant', nameHindi: 'आवेदक का आधार कार्ड', note: 'Photocopy' }
    ],
    office: {
      type: 'Municipal Corporation / Civil Hospital / Sewa Kendra',
      typeHindi: 'नगर निगम / सिविल अस्पताल / सेवा केंद्र',
      counter: 'Birth/Death Registry',
      hours: '9:00 AM – 3:00 PM, Mon–Sat',
      onlineUrl: 'https://esewa.punjab.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (यदि 21 दिनों में हो) / ₹10-50 (देरी होने पर)',
    processingDays: '7–10 दिन',
    helpline: '104',
    tips: [
      'श्मशान घाट या कब्रिस्तान से मिलने वाली पर्ची को सुरक्षित रखें, यह सबसे महत्वपूर्ण प्रमाण है।',
      'मृत्यु पंजीकरण भी 21 दिनों के भीतर कराना अनिवार्य और मुफ्त है।'
    ]
  },
  {
    id: 'ration-card-new',
    name: 'New Ration Card (Smart Ration Card)',
    nameHindi: 'नया राशन कार्ड',
    state: 'punjab',
    category: 'ration',
    categoryIcon: '🌾',
    documents: [
      { name: 'Aadhaar Cards of All Family Members', nameHindi: 'परिवार के सभी सदस्यों के आधार कार्ड', note: 'Photocopy' },
      { name: 'Income Certificate', nameHindi: 'आय प्रमाण पत्र', note: 'From Tehsil' },
      { name: 'Electricity Bill / Residence Proof', nameHindi: 'बिजली का बिल / निवास प्रमाण', note: 'Photocopy' },
      { name: 'Group Photo of Family', nameHindi: 'परिवार का सामूहिक फोटो', note: '3 copies' }
    ],
    office: {
      type: 'Food & Civil Supplies Department / Sewa Kendra',
      typeHindi: 'खाद्य एवं नागरिक आपूर्ति विभाग / सेवा केंद्र',
      counter: 'Ration Desk Counter 7',
      hours: '9:30 AM – 4:30 PM, Mon–Fri',
      onlineUrl: 'https://ercms.punjab.gov.in/',
      onlineAvailable: true
    },
    fees: '₹50 (Service Fee)',
    processingDays: '30–45 दिन',
    helpline: '1967',
    tips: [
      'नया राशन कार्ड महिला मुखिया (घर की सबसे बड़ी महिला सदस्य) के नाम पर बनता है।',
      'सभी सदस्यों के आधार कार्ड में नाम और जन्मतिथि सही होनी चाहिए।'
    ]
  },
  {
    id: 'ration-card-correction',
    name: 'Ration Card Correction / Member Addition',
    nameHindi: 'राशन कार्ड सुधार / नया सदस्य जोड़ना',
    state: 'punjab',
    category: 'ration',
    categoryIcon: '✏️',
    documents: [
      { name: 'Original Ration Card', nameHindi: 'मूल राशन कार्ड', note: 'Must be submitted' },
      { name: 'Aadhaar Card of Member to Add/Correct', nameHindi: 'जिस सदस्य को जोड़ना या सुधारना है उसका आधार कार्ड', note: 'Photocopy' },
      { name: 'Marriage Certificate (for wife)', nameHindi: 'विवाह प्रमाण पत्र (पत्नी के लिए)', note: 'Photocopy' },
      { name: 'Birth Certificate (for child)', nameHindi: 'जन्म प्रमाण पत्र (बच्चे के लिए)', note: 'Photocopy' }
    ],
    office: {
      type: 'Food & Civil Supplies Department / Sewa Kendra',
      typeHindi: 'खाद्य एवं नागरिक आपूर्ति विभाग / सेवा केंद्र',
      counter: 'Ration Desk Counter 7',
      hours: '9:30 AM – 4:30 PM, Mon–Fri',
      onlineUrl: 'https://ercms.punjab.gov.in/',
      onlineAvailable: true
    },
    fees: '₹30 (Service Fee)',
    processingDays: '15–20 दिन',
    helpline: '1967',
    tips: [
      'शादी के बाद पत्नी का नाम ससुराल के राशन कार्ड में जोड़ने से पहले पीहर के राशन कार्ड से नाम कटवाना (Surrender Certificate) अनिवार्य है।'
    ]
  },
  // ==================== ALL-INDIA ====================
  {
    id: 'voter-id-new',
    name: 'New Voter ID Card (Form 6)',
    nameHindi: 'नया वोटर ID',
    state: 'all',
    category: 'identity',
    categoryIcon: '🗳️',
    documents: [
      { name: 'Aadhaar Card / Age Proof', nameHindi: 'आधार कार्ड / आयु प्रमाण', note: 'Photocopy (18+ years)' },
      { name: 'Address Proof (Electricity Bill/Gas Connection)', nameHindi: 'पते का प्रमाण (बिजली बिल/गैस कनेक्शन)', note: 'Photocopy' },
      { name: 'Passport Size Photo', nameHindi: 'पासपोर्ट साइज फोटो', note: '1 Copy, white background' }
    ],
    office: {
      type: 'Election Office / BLO (Booth Level Officer) / Sewa Kendra',
      typeHindi: 'चुनाव कार्यालय / बीएलओ / सेवा केंद्र',
      counter: 'Voter Registration Window',
      hours: '10:00 AM – 5:00 PM, Mon–Sat',
      onlineUrl: 'https://voters.eci.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (निःशुल्क)',
    processingDays: '20–30 दिन',
    helpline: '1950',
    tips: [
      'Voter Helpline App से आप खुद घर बैठे अपने मोबाइल से ऑनलाइन फॉर्म 6 भर सकते हैं, यह बिल्कुल मुफ्त है।',
      'अपने क्षेत्र के BLO (Booth Level Officer) से संपर्क करने पर कार्ड आसानी से मिल जाता है।'
    ]
  },
  {
    id: 'driving-licence',
    name: 'Driving Licence (Learner/Permanent)',
    nameHindi: 'ड्राइविंग लाइसेंस',
    state: 'all',
    category: 'other',
    categoryIcon: '🚗',
    documents: [
      { name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', note: 'Original + photocopy' },
      { name: 'Age Proof (10th Marksheet/Birth Certificate)', nameHindi: 'आयु प्रमाण (10वीं की अंकसूची/जन्म प्रमाण पत्र)', note: 'Photocopy' },
      { name: 'Medical Certificate Form 1A', nameHindi: 'मेडिकल सर्टिफिकेट फॉर्म 1A', note: 'Signed by Gov Doctor (for 40+ age or transport)' },
      { name: 'Learner License Copy', nameHindi: 'लर्नर लाइसेंस की कॉपी', note: 'For permanent licence application' }
    ],
    office: {
      type: 'RTA (Regional Transport Authority) / Sewa Kendra',
      typeHindi: 'क्षेत्रीय परिवहन प्राधिकरण / सेवा केंद्र',
      counter: 'Licencing Desk',
      hours: '9:00 AM – 4:00 PM, Mon–Fri',
      onlineUrl: 'https://sarathi.parivahan.gov.in',
      onlineAvailable: true
    },
    fees: '₹200 (Learner) + ₹1000+ (Permanent/Test Fee)',
    processingDays: '15 दिन (टेस्ट पास करने के बाद)',
    helpline: '108',
    tips: [
      'परिवहन विभाग की आधिकारिक वेबसाइट (Sarathi Parivahan) पर जाकर टेस्ट का स्लॉट बुक करें, बिचौलियों से बचें।',
      'लर्नर लाइसेंस मिलने के 30 दिन बाद और 180 दिन के भीतर स्थायी लाइसेंस के लिए टेस्ट देना होता है।'
    ]
  },
  {
    id: 'pm-awas-yojana',
    name: 'Pradhan Mantri Awas Yojana (PMAY - Urban/Rural)',
    nameHindi: 'PM आवास योजना',
    state: 'all',
    category: 'welfare',
    categoryIcon: '⛺',
    documents: [
      { name: 'Aadhaar Card of All Family Members', nameHindi: 'परिवार के सभी सदस्यों के आधार कार्ड', note: 'Photocopy' },
      { name: 'Bank Passbook Copy', nameHindi: 'बैंक पासबुक की कॉपी', note: 'Direct Benefit Transfer (DBT) के लिए' },
      { name: 'Swachh Bharat Mission (SBM) Register Number', nameHindi: 'शौचालय पंजीकरण नंबर (यदि लागू हो)', note: 'Copy' },
      { name: 'Job Card (MGNREGA)', nameHindi: 'जॉब कार्ड (मनरेगा)', note: 'If available' },
      { name: 'Affidavit of No Pucca House in India', nameHindi: 'पक्के मकान न होने का शपथ पत्र', note: 'Notarized' }
    ],
    office: {
      type: 'Block Development Officer (BDO) / Municipal Office',
      typeHindi: 'खंड विकास अधिकारी (BDO) / नगर पालिका कार्यालय',
      counter: 'Awas Yojana Desk',
      hours: '10:00 AM – 4:00 PM, Mon–Fri',
      onlineUrl: 'https://pmaymis.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (निःशुल्क)',
    processingDays: '60–90 दिन (सत्यापन के बाद)',
    helpline: '1800-11-3377',
    tips: [
      'इस योजना के तहत अनुदान सीधा आपके बैंक खाते में चरणों में ट्रांसफर होता है।',
      'आवेदन के बाद ग्राम सभा या स्थानीय निकाय द्वारा भौतिक सत्यापन (Geotagging) किया जाता है।'
    ]
  },
  {
    id: 'aadhaar-correction',
    name: 'Aadhaar Card Demographics Update',
    nameHindi: 'आधार सुधार',
    state: 'all',
    category: 'identity',
    categoryIcon: '🆔',
    documents: [
      { name: 'Proof of Identity (POI) (Passport/PAN/Voter ID)', nameHindi: 'पहचान का प्रमाण (पासपोर्ट/पैन/वोटर आईडी)', note: 'Photocopy + Original for scan' },
      { name: 'Proof of Address (POA) (Electricity Bill/Bank Statement)', nameHindi: 'पते का प्रमाण (बिजली बिल/बैंक स्टेटमेंट)', note: 'Photocopy + Original' },
      { name: 'Birth Certificate (for DOB change)', nameHindi: 'जन्म प्रमाण पत्र (जन्म तिथि बदलने के लिए)', note: 'Photocopy + Original' }
    ],
    office: {
      type: 'Aadhaar Seva Kendra / Selected Banks / Post Offices',
      typeHindi: 'आधार सेवा केंद्र / नामित बैंक / डाकघर',
      counter: 'Aadhaar Operator Counter',
      hours: '9:00 AM – 5:00 PM, Mon–Sat',
      onlineUrl: 'https://myaadhaar.uidai.gov.in',
      onlineAvailable: true
    },
    fees: '₹50 (Demographic Update) / ₹100 (Biometric)',
    processingDays: '5–10 दिन',
    helpline: '1947',
    tips: [
      'UIDAI की वेबसाइट से ऑनलाइन अपॉइंटमेंट बुक करके जाएं, इससे लंबी लाइनों से बचेंगे।',
      'ऑनलाइन सुधार (केवल पता) myaadhaar पोर्टल से खुद भी किया जा सकता है।'
    ]
  },
  {
    id: 'marriage-certificate',
    name: 'Marriage Registration Certificate',
    nameHindi: 'विवाह प्रमाण पत्र',
    state: 'all',
    category: 'identity',
    categoryIcon: '💍',
    documents: [
      { name: 'Age Proof of Groom (21+) & Bride (18+)', nameHindi: 'दूल्हा (21+) और दुल्हन (18+) का आयु प्रमाण', note: 'Birth Cert/10th Certificate' },
      { name: 'Address Proof of Groom & Bride', nameHindi: 'दूल्हा और दुल्हन के पते का प्रमाण', note: 'Photocopy' },
      { name: 'Marriage Invitation Card / Temple-Gurudwara Receipt', nameHindi: 'शादी का कार्ड / मंदिर-गुरुद्वारा की रसीद', note: 'Original' },
      { name: 'Joint Wedding Photograph', nameHindi: 'शादी का संयुक्त फोटो', note: '2 copies' },
      { name: 'Witness Identity Proof (2 Witnesses)', nameHindi: 'गवाहों का पहचान पत्र (2 गवाह)', note: 'Aadhaar/Voter ID' }
    ],
    office: {
      type: 'Tehsil Office / Registrar of Marriages / Sewa Kendra',
      typeHindi: 'तहसील कार्यालय / विवाह रजिस्ट्रार / सेवा केंद्र',
      counter: 'Marriage Registry Counter',
      hours: '10:00 AM – 3:00 PM, Mon–Fri',
      onlineUrl: 'https://esewa.punjab.gov.in',
      onlineAvailable: true
    },
    fees: '₹100 (1 महीने के भीतर) / ₹250+ (देरी होने पर)',
    processingDays: '15–30 दिन',
    helpline: '1800-180-1551',
    tips: [
      'शादी के बाद जितनी जल्दी हो सके पंजीकरण करा लें, विलंब होने पर सरकारी चक्कर काटने पड़ सकते हैं।',
      'सर्टिफिकेट कलेक्ट करने के समय पति, पत्नी और गवाहों का भौतिक रूप से उपस्थित होना अनिवार्य है।'
    ]
  },
  // ==================== BIHAR ====================
  {
    id: 'bihar-caste-certificate',
    name: 'Caste Certificate (Bihar)',
    nameHindi: 'जाति प्रमाण पत्र (बिहार)',
    state: 'bihar',
    category: 'income',
    categoryIcon: '📄',
    documents: [
      { name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', note: 'Original + photocopy' },
      { name: 'Voter ID / Ration Card', nameHindi: 'वोटर आईडी / राशन कार्ड', note: 'Photocopy' },
      { name: 'Self Declaration / Affidavit', nameHindi: 'स्व-घोषणा पत्र / शपथ पत्र', note: 'Notarized' },
      { name: 'Father/Guardian Caste Certificate', nameHindi: 'पिता/अभिभावक का जाति प्रमाण पत्र', note: 'If available' },
      { name: 'School Certificate showing Caste', nameHindi: 'स्कूल का प्रमाण पत्र जिसमें जाति हो', note: 'Photocopy' }
    ],
    office: {
      type: 'Circle Office (CO) / Block Office / RTPS Counter',
      typeHindi: 'अंचल कार्यालय (CO) / प्रखंड कार्यालय / RTPS काउंटर',
      counter: 'RTPS Window',
      hours: '10:00 AM – 5:00 PM, Mon–Sat',
      onlineUrl: 'https://serviceonline.bihar.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (RTPS के तहत निःशुल्क)',
    processingDays: '15 दिन (RTPS)',
    helpline: '1800-345-6188',
    tips: [
      'बिहार में RTPS (Right to Public Services) के तहत जाति प्रमाण पत्र 15 दिन में मिलना अनिवार्य है।',
      'serviceonline.bihar.gov.in पर ऑनलाइन आवेदन करें, CSC (Common Service Centre) से भी बनवा सकते हैं।',
      'अंचलाधिकारी (CO) के कार्यालय में सुबह 10 बजे से पहले पहुंचें।'
    ]
  },
  {
    id: 'bihar-income-certificate',
    name: 'Income Certificate (Bihar)',
    nameHindi: 'आय प्रमाण पत्र (बिहार)',
    state: 'bihar',
    category: 'income',
    categoryIcon: '💰',
    documents: [
      { name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', note: 'Original + photocopy' },
      { name: 'Self Declaration of Income', nameHindi: 'आय का स्व-घोषणा पत्र', note: 'Signed by Ward Member/Mukhiya' },
      { name: 'Salary Slip / ITR', nameHindi: 'सैलरी स्लिप / ITR', note: 'For salaried employees' },
      { name: 'Ration Card', nameHindi: 'राशन कार्ड', note: 'Photocopy' },
      { name: 'Residence Proof', nameHindi: 'निवास प्रमाण', note: 'Voter ID/Electricity Bill' }
    ],
    office: {
      type: 'Circle Office (CO) / RTPS Counter',
      typeHindi: 'अंचल कार्यालय (CO) / RTPS काउंटर',
      counter: 'RTPS Window',
      hours: '10:00 AM – 5:00 PM, Mon–Sat',
      onlineUrl: 'https://serviceonline.bihar.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (RTPS के तहत निःशुल्क)',
    processingDays: '15 दिन (RTPS)',
    helpline: '1800-345-6188',
    tips: [
      'बिहार में आय प्रमाण पत्र RTPS के तहत 15 दिन में बनना चाहिए।',
      'मुखिया/वार्ड सदस्य से घोषणा पत्र पर हस्ताक्षर करवा लें।',
      'ऑनलाइन आवेदन serviceonline.bihar.gov.in पर करें।'
    ]
  },
  {
    id: 'bihar-domicile-certificate',
    name: 'Domicile / Residential Certificate (Bihar)',
    nameHindi: 'निवास प्रमाण पत्र (बिहार)',
    state: 'bihar',
    category: 'identity',
    categoryIcon: '🏠',
    documents: [
      { name: 'Aadhaar Card', nameHindi: 'आधार कार्ड', note: 'Original + photocopy' },
      { name: 'Voter ID Card', nameHindi: 'वोटर आईडी कार्ड', note: 'Photocopy' },
      { name: 'Electricity Bill / Water Bill', nameHindi: 'बिजली बिल / पानी बिल', note: 'Last 3 months' },
      { name: 'Ration Card', nameHindi: 'राशन कार्ड', note: 'Photocopy' },
      { name: 'School Certificate', nameHindi: 'स्कूल प्रमाण पत्र', note: 'For students' }
    ],
    office: {
      type: 'Circle Office (CO) / RTPS Counter',
      typeHindi: 'अंचल कार्यालय (CO) / RTPS काउंटर',
      counter: 'RTPS Window',
      hours: '10:00 AM – 5:00 PM, Mon–Sat',
      onlineUrl: 'https://serviceonline.bihar.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (RTPS के तहत निःशुल्क)',
    processingDays: '15 दिन (RTPS)',
    helpline: '1800-345-6188',
    tips: [
      'बिहार में निवास प्रमाण पत्र भी RTPS अधिनियम के तहत निर्धारित समय में मिलना अनिवार्य है।',
      'CSC (जन सेवा केंद्र) या ऑनलाइन serviceonline.bihar.gov.in से आवेदन करें।'
    ]
  },
  {
    id: 'bihar-birth-certificate',
    name: 'Birth Certificate (Bihar)',
    nameHindi: 'जन्म प्रमाण पत्र (बिहार)',
    state: 'bihar',
    category: 'identity',
    categoryIcon: '👶',
    documents: [
      { name: 'Hospital Birth Record / Slip', nameHindi: 'अस्पताल से जन्म का पर्चा', note: 'Original' },
      { name: 'Aadhaar Card of Parents', nameHindi: 'माता-पिता का आधार कार्ड', note: 'Photocopy' },
      { name: 'Application Form', nameHindi: 'आवेदन पत्र', note: 'Filled' },
      { name: 'Affidavit (If delayed)', nameHindi: 'शपथ पत्र (यदि 21 दिन से देरी)', note: 'Notarized' }
    ],
    office: {
      type: 'Nagar Nigam / Nagar Parishad / Block Health Office',
      typeHindi: 'नगर निगम / नगर परिषद / प्रखंड स्वास्थ्य कार्यालय',
      counter: 'Birth/Death Registration',
      hours: '10:00 AM – 4:00 PM, Mon–Sat',
      onlineUrl: 'https://crsorgi.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (21 दिन के भीतर) / ₹50+ (विलंब होने पर)',
    processingDays: '7–14 दिन',
    helpline: '104',
    tips: [
      'बिहार में अस्पताल में जन्म होने पर अस्पताल ही पंजीकरण करता है — डिस्चार्ज से पहले पूछें।',
      'घर पर जन्म होने पर 21 दिन के भीतर ग्राम पंचायत / नगर निगम में पंजीकरण करें।'
    ]
  },
  {
    id: 'bihar-ration-card',
    name: 'New Ration Card (Bihar)',
    nameHindi: 'नया राशन कार्ड (बिहार)',
    state: 'bihar',
    category: 'ration',
    categoryIcon: '🌾',
    documents: [
      { name: 'Aadhaar Cards of All Family Members', nameHindi: 'परिवार के सभी सदस्यों के आधार कार्ड', note: 'Photocopy' },
      { name: 'Income Certificate', nameHindi: 'आय प्रमाण पत्र', note: 'From CO Office' },
      { name: 'Electricity Bill / Residence Proof', nameHindi: 'बिजली बिल / निवास प्रमाण', note: 'Photocopy' },
      { name: 'Family Photo', nameHindi: 'परिवार का फोटो', note: '2 copies' },
      { name: 'Bank Passbook', nameHindi: 'बैंक पासबुक', note: 'Photocopy' }
    ],
    office: {
      type: 'SDO Office / Block Supply Office',
      typeHindi: 'SDO कार्यालय / प्रखंड आपूर्ति कार्यालय',
      counter: 'Ration Card Desk',
      hours: '10:00 AM – 5:00 PM, Mon–Fri',
      onlineUrl: 'https://epds.bihar.gov.in',
      onlineAvailable: true
    },
    fees: '₹0 (RTPS)',
    processingDays: '30–45 दिन',
    helpline: '1800-345-6188',
    tips: [
      'बिहार में ePDS पोर्टल पर ऑनलाइन आवेदन करें।',
      'राशन कार्ड महिला मुखिया के नाम पर बनता है।',
      'सभी सदस्यों का आधार-सीडिंग (eKYC) अनिवार्य है।'
    ]
  }
]

// Supported states for reference
const SUPPORTED_STATES = ['punjab', 'bihar', 'all']

module.exports = formData
module.exports.SUPPORTED_STATES = SUPPORTED_STATES
