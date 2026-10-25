/* Store data. Every page renders from this file — edit here, not in the HTML.
   PLACEHOLDERS: all prices, shipping fees, the ACV product name/flavor, the Daily Multi
   flavor, "when"/"howTo" timing, and dosage (confirm with the production team). */
window.CHWLY = {
  currency: 'ر.س',
  freeShippingFrom: 199,
  promoDate: '2026-11-27T00:00:00+03:00',
  gummiesPerPack: 60,

  // Shipping methods (placeholder fees). freeAbove = free over freeShippingFrom
  shipping: [
    { id: 'standard', label: 'شحن عادي', eta: '2–4 أيام عمل', price: 25, freeAbove: true },
    { id: 'express', label: 'شحن سريع', eta: 'خلال يوم عمل (الرياض، جدة، الدمام)', price: 39, freeAbove: false }
  ],

  // DEMO coupons for the static prototype only — real coupons come from Salla
  coupons: {
    WAITLIST10: { percent: 10, label: 'خصم قائمة الانتظار' }
  },

  // Payment options shown at checkout (all handled by Salla's gateway later)
  payments: [
    { id: 'card', label: 'مدى / بطاقة ائتمانية', note: 'Visa · Mastercard · مدى' },
    { id: 'applepay', label: 'Apple Pay', note: 'من جوالك مباشرة' },
    { id: 'stcpay', label: 'STC Pay', note: 'برقم جوالك' },
    { id: 'tabby', label: 'تابي', note: 'قسّمها على 4 دفعات' },
    { id: 'tamara', label: 'تمارا', note: 'ادفع لاحقاً أو قسّط' },
    { id: 'cod', label: 'الدفع عند الاستلام', note: 'رسوم إضافية [—]' }
  ],

  cities: ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'الأحساء', 'القطيف', 'الطائف', 'بريدة', 'عنيزة', 'حائل', 'تبوك', 'أبها', 'خميس مشيط', 'جازان', 'نجران', 'ينبع', 'الجبيل', 'أخرى'],

  // Pack options shared by every product
  packs: [
    { n: 1, label: 'عبوة وحدة', note: '60 حبّة' },
    { n: 2, label: 'عبوتين', note: '120 حبّة' },
    { n: 3, label: '3 عبوات', note: '180 حبّة' }
  ],

  categories: [
    { id: 'glow', name: 'شعر وبشرة', title: 'روتين شعرك وبشرتك', desc: 'بيوتين وزنك لشعرك وبشرتك وأظافرك، بحبّة صباحية بطعم الخوخ.' },
    { id: 'sleep', name: 'النوم', title: 'نومة أعمق بدون حبوب', desc: 'للي ياخذ وقت لين ينام أو يصحى بالليل كثير. حبّة جيلي قبل النوم بدل الكبسولات.' },
    { id: 'kids', name: 'الأطفال', title: 'فيتامين يطلبه طفلك بنفسه', desc: 'فيتامينات بطعم حلو وشكل نجمة، يطلبها طفلك بنفسه. من عمر 4 سنوات.' },
    { id: 'slim', name: 'الرشاقة', title: 'هضم أخف، وروتين رشاقة يومي', desc: 'خل التفاح بدون طعم الخل. جزء صغير من روتين رشاقة أكبر.' },
    { id: 'daily', name: 'يومي', title: 'فيتاميناتك اليومية بحبّة حلوة', desc: 'فيتاميناتك ومعادنك الأساسية بحبّة وحدة، للي دايم ينسى العلبة بالدرج.' }
  ],

  products: [
    {
      id: 'glow-on',
      name: 'Glow On',
      cat: 'glow',
      catLabel: 'شعر وبشرة',
      line: 'روتين شعرك وبشرتك اليومي',
      desc: 'حبّة جيلي بطعم الخوخ فيها بيوتين وزنك، تدخل روتينك الصباحي بدون ما تحس إنك تاخذ دوا.',
      ingredients: 'Biotin + Zinc',
      ingredientsAr: 'بيوتين + زنك',
      flavor: 'Peach',
      flavorAr: 'خوخ',
      forWho: 'اللي تهتم بشعرها وبشرتها وأظافرها',
      when: 'مع الفطور',
      howTo: 'خذها مع الفطور كل يوم. خل العبوة جنب فرشة أسنانك عشان ما تنساها.',
      benefits: ['بيوتين وزنك بحبّة وحدة', 'بطعم الخوخ، بدون طعم دوا', 'تدخل روتينك الصباحي بسهولة'],
      color: '#EA7E66', soft: '#FCE3D9', ink: '#9A3A25',
      prices: { 1: 89, 2: 159, 3: 219 },
      featured: true
    },
    {
      id: 'sleep-easy',
      name: 'Sleep Easy',
      cat: 'sleep',
      catLabel: 'النوم',
      line: 'نومة أعمق بدون حبوب',
      desc: 'ميلاتونين ومغنيسيوم بحبّة جيلي بطعم التوت المشكّل. خلّها آخر شي تسويه قبل ما تطفي النور.',
      ingredients: 'Melatonin + Magnesium',
      ingredientsAr: 'ميلاتونين + مغنيسيوم',
      flavor: 'Mixed Berry',
      flavorAr: 'توت مشكّل',
      forWho: 'اللي نومهم متأخر أو متقطّع',
      when: 'قبل النوم',
      howTo: 'خذها قبل النوم بنص ساعة تقريباً، بعد ما تبعد عن الجوال.',
      benefits: ['ميلاتونين ومغنيسيوم مع بعض', 'بطعم التوت، تنعضّ ما تنبلع', 'عادة صغيرة قبل النوم'],
      color: '#5A66EA', soft: '#E9EAFC', ink: '#323BA6',
      prices: { 1: 89, 2: 159, 3: 219 }
    },
    {
      id: 'kids-shield',
      name: 'Kids Shield',
      cat: 'kids',
      catLabel: 'الأطفال',
      line: 'فيتامين يطلبه طفلك بنفسه',
      desc: 'بلسان وفيتامين C بحبّة على شكل نجمة وبطعم توت العليق. للأطفال من عمر 4 سنوات.',
      ingredients: 'Elderberry + Vitamin C',
      ingredientsAr: 'بلسان (Elderberry) + فيتامين C',
      flavor: 'Raspberry',
      flavorAr: 'توت العليق',
      forWho: 'الأطفال من عمر 4 سنوات',
      when: 'الصبح قبل المدرسة',
      howTo: 'حبّة الصبح مع الفطور قبل المدرسة. خلها بعيد عن متناول الأطفال واعطهم الجرعة بنفسك.',
      benefits: ['شكل نجمة يحبه الأطفال', 'بلسان وفيتامين C', 'من عمر 4 سنوات وفوق'],
      color: '#D23666', soft: '#FFDDEA', ink: '#9E1F4B',
      prices: { 1: 89, 2: 159, 3: 219 },
      photo: 'assets/img/hero-pour.webp'
    },
    {
      id: 'acv-balance', // name is a placeholder
      name: 'ACV Balance',
      cat: 'slim',
      catLabel: 'الرشاقة',
      line: 'هضم أخف، وروتين رشاقة يومي',
      desc: 'خل التفاح بحبّة جيلي، بدون طعم الخل ولا الكاسة الصباحية. جزء صغير من روتين أكبر.',
      ingredients: 'Apple Cider Vinegar',
      ingredientsAr: 'خل التفاح',
      flavor: 'Green Apple',
      flavorAr: 'تفاح أخضر',
      forWho: 'اللي تبي روتين خفيف بعد الأكل',
      when: 'قبل الغداء',
      howTo: 'خذها قبل الغداء. هي جزء من روتين فيه أكل متوازن وحركة، مو بديل عنهم.',
      benefits: ['خل التفاح بدون طعم الخل', 'بطعم التفاح الأخضر', 'سهلة تاخذها معك للدوام'],
      color: '#1F9E82', soft: '#D9F3EB', ink: '#11634F',
      prices: { 1: 89, 2: 159, 3: 219 }
    },
    {
      id: 'daily-multi',
      name: 'Daily Multi',
      cat: 'daily',
      catLabel: 'يومي',
      line: 'فيتاميناتك اليومية بحبّة حلوة',
      desc: 'فيتامينات ومعادن أساسية بحبّة وحدة. للي ينسى علبة الفيتامينات بالدرج.',
      ingredients: 'Vitamins + Minerals',
      ingredientsAr: 'فيتامينات + معادن',
      flavor: 'Lemon',
      flavorAr: 'ليمون',
      forWho: 'الكبار اللي ينسون فيتاميناتهم',
      when: 'مع الفطور',
      howTo: 'حبّة مع الفطور كل يوم. تمشي مع أي منتج ثاني من تشولي.',
      benefits: ['فيتامينات ومعادن بحبّة وحدة', 'بطعم الليمون', 'تمشي مع باقي الحبّات'],
      color: '#E9B92E', soft: '#FCF0C8', ink: '#6E5200',
      prices: { 1: 89, 2: 159, 3: 219 }
    }
  ],

  // Build-your-own bundle: discount by number of packs picked (placeholder rates)
  builder: {
    tiers: [
      { min: 2, percent: 10 },
      { min: 3, percent: 15 },
      { min: 4, percent: 20 }
    ],
    maxEach: 5
  },

  bundles: [
    { id: 'b-girls', name: 'روتين البنات', items: ['glow-on', 'daily-multi'], price: 149 },
    { id: 'b-home', name: 'باقة البيت', items: ['sleep-easy', 'kids-shield', 'daily-multi'], price: 219 },
    { id: 'b-slim', name: 'روتين الرشاقة', items: ['acv-balance', 'daily-multi'], price: 149 },
    { id: 'b-all', name: 'الخمسة كلها', items: ['glow-on', 'sleep-easy', 'kids-shield', 'acv-balance', 'daily-multi'], price: 369 }
  ]
};
