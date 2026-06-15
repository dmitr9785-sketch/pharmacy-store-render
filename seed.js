const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { sequelize, User, Category, Product, Store, Promotion } = require('./src/models');

async function seed() {
  try {
    await sequelize.sync({ alter: true });

    const adminExists = await User.findOne({ where: { email: 'admin@pharmacy.ru' } });
    if (!adminExists) {
      const hash = await bcrypt.hash('admin123', 10);
      await User.create({ name: 'Администратор', email: 'admin@pharmacy.ru', passwordHash: hash, role: 'admin', phone: '+7 (999) 123-45-67' });
      console.log('✓ Админ создан: admin@pharmacy.ru / admin123');
    }

    const categories = [
      { name: 'Обезболивающие', slug: 'obezbolivayushchie' },
      { name: 'Противовирусные', slug: 'protivovirusnye' },
      { name: 'Витамины и БАДы', slug: 'vitaminy' },
      { name: 'От простуды и кашля', slug: 'prostuda-kashel' },
      { name: 'Сердечно-сосудистые', slug: 'serdechno-sosudistye' },
      { name: 'ЖКТ и пищеварение', slug: 'zkt' },
      { name: 'Аллергия', slug: 'allergiya' },
      { name: 'Антибиотики', slug: 'antibiotiki' },
      { name: 'Успокоительные', slug: 'uspokoitelnye' },
    ];

    for (const cat of categories) {
      const existing = await Category.findOne({ where: { slug: cat.slug } });
      if (!existing) await Category.create(cat);
    }
    console.log('✓ Категории загружены');

    const allCategories = await Category.findAll();

    const getCatId = (slug) => allCategories.find(c => c.slug === slug)?.id;

    const products = [
      // --- Обезболивающие (12) ---
      { name: 'Нурофен 200 мг', slug: 'nurofen-200', manufacturer: 'Reckitt Benckiser', activeIngredient: 'Ибупрофен', dosage: '200 мг', form: 'таблетки', requiresPrescription: false, price: 180, stock: 100, categorySlug: 'obezbolivayushchie', description: 'Нестероидный противовоспалительный препарат. Оказывает обезболивающее, жаропонижающее и противовоспалительное действие.' },
      { name: 'Нурофен Форте 400 мг', slug: 'nurofen-forte-400', manufacturer: 'Reckitt Benckiser', activeIngredient: 'Ибупрофен', dosage: '400 мг', form: 'таблетки', requiresPrescription: true, price: 280, stock: 50, categorySlug: 'obezbolivayushchie', description: 'Усиленная формула для интенсивной боли. Отпускается по рецепту врача.' },
      { name: 'Парацетамол 500 мг', slug: 'paracetamol-500', manufacturer: 'Фармстандарт', activeIngredient: 'Парацетамол', dosage: '500 мг', form: 'таблетки', requiresPrescription: false, price: 45, stock: 200, categorySlug: 'obezbolivayushchie', description: 'Жаропонижающее и обезболивающее средство.' },
      { name: 'Кеторол 10 мг', slug: 'ketorol-10', manufacturer: 'Синтез', activeIngredient: 'Кеторолак', dosage: '10 мг', form: 'таблетки', requiresPrescription: true, price: 120, stock: 40, categorySlug: 'obezbolivayushchie', description: 'Сильное обезболивающее средство. Отпускается по рецепту.' },
      { name: 'Цитрамон П', slug: 'citramon-p', manufacturer: 'Фармстандарт', activeIngredient: 'Ацетилсалициловая кислота + Кофеин + Парацетамол', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 35, stock: 300, categorySlug: 'obezbolivayushchie', description: 'Комбинированное обезболивающее и жаропонижающее средство.' },
      { name: 'Найз 100 мг', slug: 'nayz-100', manufacturer: 'Д-р Реддис', activeIngredient: 'Нимесулид', dosage: '100 мг', form: 'таблетки', requiresPrescription: false, price: 210, stock: 60, categorySlug: 'obezbolivayushchie', description: 'Нестероидный противовоспалительный препарат с обезболивающим действием.' },
      { name: 'Но-шпа 40 мг', slug: 'noshpa-40', manufacturer: 'Санофи', activeIngredient: 'Дротаверин', dosage: '40 мг', form: 'таблетки', requiresPrescription: false, price: 195, stock: 90, categorySlug: 'obezbolivayushchie', description: 'Спазмолитическое средство для устранения спазмов гладкой мускулатуры.' },
      { name: 'Диклофенак 50 мг', slug: 'diklofenak-50', manufacturer: 'Хемофарм', activeIngredient: 'Диклофенак натрия', dosage: '50 мг', form: 'таблетки', requiresPrescription: true, price: 85, stock: 70, categorySlug: 'obezbolivayushchie', description: 'Противовоспалительное и обезболивающее средство. Отпускается по рецепту.' },
      { name: 'Мелоксикам 15 мг', slug: 'meloksikam-15', manufacturer: 'Берлин-Хеми', activeIngredient: 'Мелоксикам', dosage: '15 мг', form: 'таблетки', requiresPrescription: true, price: 160, stock: 45, categorySlug: 'obezbolivayushchie', description: 'НПВС для лечения воспалительных заболеваний суставов.' },
      { name: 'Спазмалгон', slug: 'spazmalgon', manufacturer: 'Софарма', activeIngredient: 'Метамизол + Питофенон + Фенпивериний', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 130, stock: 85, categorySlug: 'obezbolivayushchie', description: 'Комбинированное спазмолитическое и обезболивающее средство.' },
      { name: 'Кетанов 10 мг', slug: 'ketanov-10', manufacturer: 'Ранбакси', activeIngredient: 'Кеторолак', dosage: '10 мг', form: 'таблетки', requiresPrescription: true, price: 55, stock: 35, categorySlug: 'obezbolivayushchie', description: 'Сильное обезболивающее средство. Отпускается по рецепту.' },
      { name: 'Нимесил 100 мг', slug: 'nimesil-100', manufacturer: 'Берлин-Хеми', activeIngredient: 'Нимесулид', dosage: '100 мг', form: 'порошок', requiresPrescription: true, price: 300, stock: 40, categorySlug: 'obezbolivayushchie', description: 'Противовоспалительное и обезболивающее средство в форме порошка.' },
      // --- Противовирусные (10) ---
      { name: 'Арбидол 100 мг', slug: 'arbidol-100', manufacturer: 'Фармстандарт', activeIngredient: 'Умифеновир', dosage: '100 мг', form: 'капсулы', requiresPrescription: false, price: 250, stock: 80, categorySlug: 'protivovirusnye', description: 'Противовирусное средство для профилактики и лечения гриппа и ОРВИ.' },
      { name: 'Ингавирин 90 мг', slug: 'ingavirin-90', manufacturer: 'Валента', activeIngredient: 'Имидазолилэтанамид', dosage: '90 мг', form: 'капсулы', requiresPrescription: true, price: 480, stock: 30, categorySlug: 'protivovirusnye', description: 'Противовирусный препарат для лечения гриппа и ОРВИ.' },
      { name: 'Кагоцел 12 мг', slug: 'kagocel-12', manufacturer: 'Ниармедик', activeIngredient: 'Кагоцел', dosage: '12 мг', form: 'таблетки', requiresPrescription: false, price: 260, stock: 60, categorySlug: 'protivovirusnye', description: 'Противовирусное средство для профилактики и лечения ОРВИ.' },
      { name: 'Тамифлю 75 мг', slug: 'tamiflu-75', manufacturer: 'Roche', activeIngredient: 'Осельтамивир', dosage: '75 мг', form: 'капсулы', requiresPrescription: true, price: 1250, stock: 20, categorySlug: 'protivovirusnye', description: 'Противовирусное средство для лечения гриппа. Отпускается по рецепту.' },
      { name: 'Амиксин 125 мг', slug: 'amiksin-125', manufacturer: 'Нижфарм', activeIngredient: 'Тилорон', dosage: '125 мг', form: 'таблетки', requiresPrescription: true, price: 580, stock: 35, categorySlug: 'protivovirusnye', description: 'Противовирусное и иммуномодулирующее средство.' },
      { name: 'Циклоферон 150 мг', slug: 'cikloferon-150', manufacturer: 'Полисан', activeIngredient: 'Меглюмина акридонацетат', dosage: '150 мг', form: 'таблетки', requiresPrescription: true, price: 370, stock: 40, categorySlug: 'protivovirusnye', description: 'Противовирусное и иммуномодулирующее средство.' },
      { name: 'Эргоферон', slug: 'ergoferon', manufacturer: 'Материа Медика', activeIngredient: 'Антитела к гамма-интерферону', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 320, stock: 55, categorySlug: 'protivovirusnye', description: 'Противовирусное и противовоспалительное средство.' },
      { name: 'Анаферон', slug: 'anaferon', manufacturer: 'Материа Медика', activeIngredient: 'Антитела к гамма-интерферону', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 220, stock: 70, categorySlug: 'protivovirusnye', description: 'Противовирусное средство для профилактики и лечения ОРВИ.' },
      { name: 'Ремантадин 50 мг', slug: 'remantadin-50', manufacturer: 'Олайнфарм', activeIngredient: 'Римантадин', dosage: '50 мг', form: 'таблетки', requiresPrescription: true, price: 180, stock: 50, categorySlug: 'protivovirusnye', description: 'Противовирусное средство для лечения гриппа.' },
      { name: 'Оксолиновая мазь 0.25%', slug: 'oksolinovaya-maz', manufacturer: 'Фармстандарт', activeIngredient: 'Оксолин', dosage: '0.25%', form: 'мазь', requiresPrescription: false, price: 60, stock: 100, categorySlug: 'protivovirusnye', description: 'Противовирусная мазь для профилактики гриппа.' },
      // --- Витамины и БАДы (12) ---
      { name: 'Компливит', slug: 'komplivit', manufacturer: 'Фармстандарт', activeIngredient: 'Поливитамины', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 180, stock: 150, categorySlug: 'vitaminy', description: 'Сбалансированный витаминно-минеральный комплекс.' },
      { name: 'Витамин С 500 мг', slug: 'vitamin-c-500', manufacturer: 'Эвалар', activeIngredient: 'Аскорбиновая кислота', dosage: '500 мг', form: 'таблетки', requiresPrescription: false, price: 90, stock: 200, categorySlug: 'vitaminy', description: 'Витамин С для укрепления иммунитета.' },
      { name: 'Магний В6', slug: 'magniy-b6', manufacturer: 'Эвалар', activeIngredient: 'Магния цитрат + Пиридоксин', dosage: '100 мг', form: 'таблетки', requiresPrescription: false, price: 150, stock: 120, categorySlug: 'vitaminy', description: 'Магний с витамином В6 для нервной системы.' },
      { name: 'Алфавит Классик', slug: 'alfavit', manufacturer: 'Аквион', activeIngredient: 'Поливитамины + Минералы', dosage: '3 таблетки', form: 'таблетки', requiresPrescription: false, price: 320, stock: 80, categorySlug: 'vitaminy', description: 'Витаминно-минеральный комплекс с раздельным приёмом.' },
      { name: 'Супрадин', slug: 'supradin', manufacturer: 'Байер', activeIngredient: 'Поливитамины', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 580, stock: 60, categorySlug: 'vitaminy', description: 'Мультивитаминный комплекс для энергии и бодрости.' },
      { name: 'Витамин D3 2000 МЕ', slug: 'vitamin-d3-2000', manufacturer: 'Солгар', activeIngredient: 'Холекальциферол', dosage: '2000 МЕ', form: 'капсулы', requiresPrescription: false, price: 450, stock: 90, categorySlug: 'vitaminy', description: 'Витамин D для поддержки иммунитета и здоровья костей.' },
      { name: 'Омега-3 1000 мг', slug: 'omega-3-1000', manufacturer: 'РеалКапс', activeIngredient: 'Омега-3 ПНЖК', dosage: '1000 мг', form: 'капсулы', requiresPrescription: false, price: 380, stock: 75, categorySlug: 'vitaminy', description: 'Полиненасыщенные жирные кислоты для сердца и сосудов.' },
      { name: 'Йодомарин 200 мкг', slug: 'yodomarin-200', manufacturer: 'Берлин-Хеми', activeIngredient: 'Калия йодид', dosage: '200 мкг', form: 'таблетки', requiresPrescription: false, price: 140, stock: 110, categorySlug: 'vitaminy', description: 'Препарат йода для профилактики йододефицитных состояний.' },
      { name: 'Фолиевая кислота 400 мкг', slug: 'folievaya-kislota-400', manufacturer: 'Эвалар', activeIngredient: 'Фолиевая кислота', dosage: '400 мкг', form: 'таблетки', requiresPrescription: false, price: 50, stock: 200, categorySlug: 'vitaminy', description: 'Витамин В9 для кроветворения и здоровья нервной системы.' },
      { name: 'Цинк хелат 25 мг', slug: 'cink-helat-25', manufacturer: 'Эвалар', activeIngredient: 'Цинк', dosage: '25 мг', form: 'таблетки', requiresPrescription: false, price: 200, stock: 85, categorySlug: 'vitaminy', description: 'Цинк для иммунитета, кожи и волос.' },
      { name: 'Селен-актив', slug: 'selen-aktiv', manufacturer: 'Эвалар', activeIngredient: 'Селен + Витамин С', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 120, stock: 90, categorySlug: 'vitaminy', description: 'Антиоксидантный комплекс для защиты клеток.' },
      { name: 'Коэнзим Q10 100 мг', slug: 'koenzim-q10-100', manufacturer: 'Солгар', activeIngredient: 'Убихинон', dosage: '100 мг', form: 'капсулы', requiresPrescription: false, price: 950, stock: 30, categorySlug: 'vitaminy', description: 'Коэнзим Q10 для энергии и молодости сердца.' },
      // --- От простуды и кашля (10) ---
      { name: 'Терафлю от гриппа', slug: 'theraflu', manufacturer: 'Novartis', activeIngredient: 'Парацетамол + Фенирамин', dosage: '1 пакетик', form: 'порошок', requiresPrescription: false, price: 320, stock: 70, categorySlug: 'prostuda-kashel', description: 'Порошок для приготовления горячего напитка при симптомах простуды и гриппа.' },
      { name: 'АЦЦ 200 мг', slug: 'acc-200', manufacturer: 'Sandoz', activeIngredient: 'Ацетилцистеин', dosage: '200 мг', form: 'порошок', requiresPrescription: false, price: 380, stock: 50, categorySlug: 'prostuda-kashel', description: 'Муколитическое средство для разжижения мокроты.' },
      { name: 'Лизобакт', slug: 'lizobakt', manufacturer: 'Босналек', activeIngredient: 'Лизоцим + Пиридоксин', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 290, stock: 60, categorySlug: 'prostuda-kashel', description: 'Антисептическое средство для лечения заболеваний полости рта и горла.' },
      { name: 'Колдрекс МаксГрипп', slug: 'coldrex', manufacturer: 'GlaxoSmithKline', activeIngredient: 'Парацетамол + Аскорбиновая кислота', dosage: '1 пакетик', form: 'порошок', requiresPrescription: false, price: 280, stock: 65, categorySlug: 'prostuda-kashel', description: 'Средство для симптоматического лечения простуды и гриппа.' },
      { name: 'Синекод 0.5%', slug: 'sinekod', manufacturer: 'Novartis', activeIngredient: 'Бутамират', dosage: '0.5%', form: 'капли', requiresPrescription: false, price: 420, stock: 30, categorySlug: 'prostuda-kashel', description: 'Противокашлевое средство центрального действия.' },
      { name: 'Геделикс', slug: 'gedeliks', manufacturer: 'Кревель Мойзельбах', activeIngredient: 'Плюща листьев экстракт', dosage: '1 ч.л.', form: 'сироп', requiresPrescription: false, price: 360, stock: 45, categorySlug: 'prostuda-kashel', description: 'Растительный препарат для отхаркивания при кашле.' },
      { name: 'Мукалтин', slug: 'mukaltin', manufacturer: 'Фармстандарт', activeIngredient: 'Алтея лекарственного экстракт', dosage: '50 мг', form: 'таблетки', requiresPrescription: false, price: 25, stock: 300, categorySlug: 'prostuda-kashel', description: 'Отхаркивающее средство растительного происхождения.' },
      { name: 'Бромгексин 8 мг', slug: 'bromgeksin-8', manufacturer: 'Нижфарм', activeIngredient: 'Бромгексин', dosage: '8 мг', form: 'таблетки', requiresPrescription: false, price: 45, stock: 150, categorySlug: 'prostuda-kashel', description: 'Муколитическое и отхаркивающее средство.' },
      { name: 'Стрепсилс', slug: 'strepsils', manufacturer: 'Reckitt Benckiser', activeIngredient: 'Амилметакрезол + Дихлорбензиловый спирт', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 180, stock: 100, categorySlug: 'prostuda-kashel', description: 'Антисептическое средство для лечения заболеваний горла.' },
      { name: 'Ренгалин', slug: 'rengalin', manufacturer: 'Материа Медика', activeIngredient: 'Антитела к брадикинину', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 200, stock: 50, categorySlug: 'prostuda-kashel', description: 'Противокашлевое и противовоспалительное средство.' },
      // --- Сердечно-сосудистые (12) ---
      { name: 'Каптоприл 25 мг', slug: 'kaptopril-25', manufacturer: 'Синтез', activeIngredient: 'Каптоприл', dosage: '25 мг', form: 'таблетки', requiresPrescription: true, price: 70, stock: 120, categorySlug: 'serdechno-sosudistye', description: 'Средство для лечения артериальной гипертензии и сердечной недостаточности.' },
      { name: 'Эналаприл 5 мг', slug: 'enalapril-5', manufacturer: 'Хемофарм', activeIngredient: 'Эналаприл', dosage: '5 мг', form: 'таблетки', requiresPrescription: true, price: 55, stock: 150, categorySlug: 'serdechno-sosudistye', description: 'Ингибитор АПФ для снижения артериального давления.' },
      { name: 'Лизиноприл 10 мг', slug: 'lizinopril-10', manufacturer: 'Акрихин', activeIngredient: 'Лизиноприл', dosage: '10 мг', form: 'таблетки', requiresPrescription: true, price: 90, stock: 100, categorySlug: 'serdechno-sosudistye', description: 'Препарат для лечения гипертонии и сердечной недостаточности.' },
      { name: 'Бисопролол 5 мг', slug: 'bisoprolol-5', manufacturer: 'Нижфарм', activeIngredient: 'Бисопролол', dosage: '5 мг', form: 'таблетки', requiresPrescription: true, price: 110, stock: 90, categorySlug: 'serdechno-sosudistye', description: 'Бета-адреноблокатор для лечения гипертонии и ИБС.' },
      { name: 'Амлодипин 5 мг', slug: 'amlodipin-5', manufacturer: 'Вертекс', activeIngredient: 'Амлодипин', dosage: '5 мг', form: 'таблетки', requiresPrescription: true, price: 80, stock: 110, categorySlug: 'serdechno-sosudistye', description: 'Блокатор кальциевых каналов для снижения артериального давления.' },
      { name: 'Атенолол 50 мг', slug: 'atenolol-50', manufacturer: 'Зентива', activeIngredient: 'Атенолол', dosage: '50 мг', form: 'таблетки', requiresPrescription: true, price: 60, stock: 130, categorySlug: 'serdechno-sosudistye', description: 'Бета-адреноблокатор для лечения гипертонии и стенокардии.' },
      { name: 'Моксонидин 0.2 мг', slug: 'moksonidin-02', manufacturer: 'Эгис', activeIngredient: 'Моксонидин', dosage: '0.2 мг', form: 'таблетки', requiresPrescription: true, price: 165, stock: 55, categorySlug: 'serdechno-sosudistye', description: 'Агонист имидазолиновых рецепторов для снижения давления.' },
      { name: 'Нитроглицерин 0.5 мг', slug: 'nitroglicerin-05', manufacturer: 'Фармстандарт', activeIngredient: 'Нитроглицерин', dosage: '0.5 мг', form: 'таблетки', requiresPrescription: true, price: 40, stock: 80, categorySlug: 'serdechno-sosudistye', description: 'Средство для купирования приступов стенокардии.' },
      { name: 'Аспирин Кардио 100 мг', slug: 'aspirin-kardio-100', manufacturer: 'Байер', activeIngredient: 'Ацетилсалициловая кислота', dosage: '100 мг', form: 'таблетки', requiresPrescription: false, price: 130, stock: 140, categorySlug: 'serdechno-sosudistye', description: 'Для профилактики тромбозов и сердечно-сосудистых осложнений.' },
      { name: 'Панангин', slug: 'panangin', manufacturer: 'Gedeon Richter', activeIngredient: 'Калия и магния аспарагинат', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: true, price: 140, stock: 70, categorySlug: 'serdechno-sosudistye', description: 'Препарат калия и магния для поддержки сердечной деятельности.' },
      { name: 'Валокордин', slug: 'valokordin', manufacturer: 'Кревель Мойзельбах', activeIngredient: 'Фенобарбитал + Этилбромизовалерианат', dosage: '20 капель', form: 'капли', requiresPrescription: false, price: 110, stock: 80, categorySlug: 'serdechno-sosudistye', description: 'Успокаивающее и сосудорасширяющее средство.' },
      { name: 'Корвалол', slug: 'korvalol', manufacturer: 'Фармстандарт', activeIngredient: 'Фенобарбитал + Ментол', dosage: '25 капель', form: 'капли', requiresPrescription: false, price: 35, stock: 200, categorySlug: 'serdechno-sosudistye', description: 'Успокаивающее средство с сосудорасширяющим эффектом.' },
      // --- ЖКТ и пищеварение (12) ---
      { name: 'Омепразол 20 мг', slug: 'omeprazol-20', manufacturer: 'Синтез', activeIngredient: 'Омепразол', dosage: '20 мг', form: 'капсулы', requiresPrescription: false, price: 95, stock: 100, categorySlug: 'zkt', description: 'Средство для лечения язвенной болезни желудка и гастрита.' },
      { name: 'Смекта', slug: 'smecta', manufacturer: 'Bofur Ipsen', activeIngredient: 'Смектит диоктаэдрический', dosage: '1 пакетик', form: 'порошок', requiresPrescription: false, price: 150, stock: 120, categorySlug: 'zkt', description: 'Противодиарейное средство.' },
      { name: 'Фестал', slug: 'festal', manufacturer: 'Санофи', activeIngredient: 'Панкреатин + Гемицеллюлаза + Желчь', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 240, stock: 60, categorySlug: 'zkt', description: 'Ферментный препарат для улучшения пищеварения.' },
      { name: 'Мезим Форте 10000', slug: 'mezim-forte-10000', manufacturer: 'Берлин-Хеми', activeIngredient: 'Панкреатин', dosage: '10000 ЕД', form: 'таблетки', requiresPrescription: false, price: 190, stock: 80, categorySlug: 'zkt', description: 'Ферментный препарат для облегчения пищеварения.' },
      { name: 'Креон 10000', slug: 'kreon-10000', manufacturer: 'Эбботт', activeIngredient: 'Панкреатин', dosage: '10000 ЕД', form: 'капсулы', requiresPrescription: false, price: 310, stock: 45, categorySlug: 'zkt', description: 'Ферментный препарат при недостаточности поджелудочной железы.' },
      { name: 'Альмагель', slug: 'almagel', manufacturer: 'Балканфарма', activeIngredient: 'Алгелдрат + Магния гидроксид', dosage: '1 мерн. ложка', form: 'раствор', requiresPrescription: false, price: 220, stock: 50, categorySlug: 'zkt', description: 'Антацидное средство при гастрите и изжоге.' },
      { name: 'Гастал', slug: 'gastal', manufacturer: 'Тева', activeIngredient: 'Алгелдрат + Магния гидроксид', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 170, stock: 70, categorySlug: 'zkt', description: 'Антацидное средство для устранения изжоги.' },
      { name: 'Ренни', slug: 'renni', manufacturer: 'Байер', activeIngredient: 'Кальция карбонат + Магния карбонат', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 160, stock: 65, categorySlug: 'zkt', description: 'Антацидное средство для быстрого устранения изжоги.' },
      { name: 'Мотилиум 10 мг', slug: 'motilium-10', manufacturer: 'Янссен', activeIngredient: 'Домперидон', dosage: '10 мг', form: 'таблетки', requiresPrescription: true, price: 380, stock: 35, categorySlug: 'zkt', description: 'Средство для устранения тошноты и стимуляции моторики ЖКТ.' },
      { name: 'Энтеросгель', slug: 'enterosgel', manufacturer: 'Силма', activeIngredient: 'Полиметилсилоксана полигидрат', dosage: '1 ст.л.', form: 'гель', requiresPrescription: false, price: 400, stock: 40, categorySlug: 'zkt', description: 'Энтеросорбент для выведения токсинов из организма.' },
      { name: 'Линекс', slug: 'lineks', manufacturer: 'Sandoz', activeIngredient: 'Лиофилизированные бактерии', dosage: '1 капсула', form: 'капсулы', requiresPrescription: false, price: 350, stock: 55, categorySlug: 'zkt', description: 'Пробиотик для нормализации микрофлоры кишечника.' },
      { name: 'Полисорб', slug: 'polisorb', manufacturer: 'Полисорб', activeIngredient: 'Кремния диоксид коллоидный', dosage: '1 пакетик', form: 'порошок', requiresPrescription: false, price: 280, stock: 45, categorySlug: 'zkt', description: 'Энтеросорбент для очищения организма.' },
      // --- Аллергия (8) ---
      { name: 'Супрастин 25 мг', slug: 'suprastin-25', manufacturer: 'Эгис', activeIngredient: 'Хлоропирамин', dosage: '25 мг', form: 'таблетки', requiresPrescription: false, price: 140, stock: 80, categorySlug: 'allergiya', description: 'Противоаллергическое средство.' },
      { name: 'Цетрин 10 мг', slug: 'cetrin-10', manufacturer: 'Д-р Реддис', activeIngredient: 'Цетиризин', dosage: '10 мг', form: 'таблетки', requiresPrescription: false, price: 210, stock: 70, categorySlug: 'allergiya', description: 'Современный антигистаминный препарат.' },
      { name: 'Зодак 10 мг', slug: 'zodak-10', manufacturer: 'Зентива', activeIngredient: 'Цетиризин', dosage: '10 мг', form: 'таблетки', requiresPrescription: false, price: 190, stock: 75, categorySlug: 'allergiya', description: 'Антигистаминное средство при аллергии.' },
      { name: 'Зиртек 10 мг', slug: 'zirtek-10', manufacturer: 'UCB', activeIngredient: 'Цетиризин', dosage: '10 мг', form: 'капли', requiresPrescription: false, price: 320, stock: 35, categorySlug: 'allergiya', description: 'Антигистаминные капли для приёма внутрь.' },
      { name: 'Тавегил 1 мг', slug: 'tavegil-1', manufacturer: 'Санофи', activeIngredient: 'Клемастин', dosage: '1 мг', form: 'таблетки', requiresPrescription: true, price: 180, stock: 50, categorySlug: 'allergiya', description: 'Противоаллергическое средство. Отпускается по рецепту.' },
      { name: 'Диазолин 100 мг', slug: 'diazolin-100', manufacturer: 'Фармстандарт', activeIngredient: 'Мебгидролин', dosage: '100 мг', form: 'таблетки', requiresPrescription: false, price: 75, stock: 110, categorySlug: 'allergiya', description: 'Противоаллергическое средство.' },
      { name: 'Фенистил', slug: 'fenistil', manufacturer: 'Novartis', activeIngredient: 'Диметиндена малеат', dosage: '0.1%', form: 'капли', requiresPrescription: false, price: 360, stock: 25, categorySlug: 'allergiya', description: 'Противоаллергические капли для детей и взрослых.' },
      { name: 'Аллергодил спрей', slug: 'allergodil', manufacturer: 'Меда Фарма', activeIngredient: 'Азеластин', dosage: '0.1%', form: 'спрей', requiresPrescription: true, price: 450, stock: 20, categorySlug: 'allergiya', description: 'Противоаллергический назальный спрей. Отпускается по рецепту.' },
      // --- Антибиотики (8) ---
      { name: 'Амоксициллин 500 мг', slug: 'amoxicillin-500', manufacturer: 'Синтез', activeIngredient: 'Амоксициллин', dosage: '500 мг', form: 'капсулы', requiresPrescription: true, price: 120, stock: 90, categorySlug: 'antibiotiki', description: 'Антибиотик широкого спектра действия. Отпускается по рецепту.' },
      { name: 'Азитромицин 500 мг', slug: 'azithromycin-500', manufacturer: 'Вертекс', activeIngredient: 'Азитромицин', dosage: '500 мг', form: 'капсулы', requiresPrescription: true, price: 250, stock: 40, categorySlug: 'antibiotiki', description: 'Антибиотик-азалид для лечения инфекций дыхательных путей.' },
      { name: 'Ципрофлоксацин 500 мг', slug: 'ciprofloksacin-500', manufacturer: 'Вертекс', activeIngredient: 'Ципрофлоксацин', dosage: '500 мг', form: 'таблетки', requiresPrescription: true, price: 140, stock: 60, categorySlug: 'antibiotiki', description: 'Антибиотик широкого спектра действия из группы фторхинолонов.' },
      { name: 'Левофлоксацин 500 мг', slug: 'levofloksacin-500', manufacturer: 'Нижфарм', activeIngredient: 'Левофлоксацин', dosage: '500 мг', form: 'таблетки', requiresPrescription: true, price: 310, stock: 35, categorySlug: 'antibiotiki', description: 'Антибиотик для лечения инфекций дыхательных путей и мочевыводящей системы.' },
      { name: 'Доксициклин 100 мг', slug: 'doksiciklin-100', manufacturer: 'Синтез', activeIngredient: 'Доксициклин', dosage: '100 мг', form: 'капсулы', requiresPrescription: true, price: 85, stock: 55, categorySlug: 'antibiotiki', description: 'Антибиотик тетрациклинового ряда широкого спектра действия.' },
      { name: 'Кларитромицин 500 мг', slug: 'klaritromicin-500', manufacturer: 'Д-р Реддис', activeIngredient: 'Кларитромицин', dosage: '500 мг', form: 'таблетки', requiresPrescription: true, price: 360, stock: 30, categorySlug: 'antibiotiki', description: 'Макролидный антибиотик для лечения инфекций дыхательных путей.' },
      { name: 'Флемоксин Солютаб 500 мг', slug: 'flemoksin-solytab-500', manufacturer: 'Астеллас', activeIngredient: 'Амоксициллин', dosage: '500 мг', form: 'таблетки', requiresPrescription: true, price: 310, stock: 45, categorySlug: 'antibiotiki', description: 'Диспергируемые таблетки с амоксициллином. Отпускаются по рецепту.' },
      { name: 'Супракс 400 мг', slug: 'supraks-400', manufacturer: 'Астеллас', activeIngredient: 'Цефиксим', dosage: '400 мг', form: 'капсулы', requiresPrescription: true, price: 720, stock: 20, categorySlug: 'antibiotiki', description: 'Цефалоспориновый антибиотик для лечения инфекций. Отпускается по рецепту.' },
      // --- Успокоительные (10) ---
      { name: 'Ново-Пассит', slug: 'novopassit', manufacturer: 'Teva', activeIngredient: 'Экстракты лекарственных растений', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 260, stock: 60, categorySlug: 'uspokoitelnye', description: 'Успокаивающее средство растительного происхождения.' },
      { name: 'Персен', slug: 'persen', manufacturer: 'Sandoz', activeIngredient: 'Экстракты валерианы и мяты', dosage: '1 капсула', form: 'капсулы', requiresPrescription: false, price: 290, stock: 55, categorySlug: 'uspokoitelnye', description: 'Успокаивающее средство на основе лекарственных растений.' },
      { name: 'Валериана экстракт', slug: 'valeriana-ekstrakt', manufacturer: 'Фармстандарт', activeIngredient: 'Валерианы экстракт', dosage: '20 мг', form: 'таблетки', requiresPrescription: false, price: 45, stock: 200, categorySlug: 'uspokoitelnye', description: 'Успокаивающее средство растительного происхождения.' },
      { name: 'Пустырник форте', slug: 'pustyrnik-forte', manufacturer: 'Эвалар', activeIngredient: 'Пустырника экстракт + Магний', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 110, stock: 90, categorySlug: 'uspokoitelnye', description: 'Успокаивающее средство с магнием.' },
      { name: 'Глицин 100 мг', slug: 'glicin-100', manufacturer: 'Биотики', activeIngredient: 'Глицин', dosage: '100 мг', form: 'таблетки', requiresPrescription: false, price: 35, stock: 250, categorySlug: 'uspokoitelnye', description: 'Метаболическое средство для улучшения мозговой деятельности.' },
      { name: 'Афобазол 10 мг', slug: 'afobazol-10', manufacturer: 'Фармстандарт', activeIngredient: 'Фабомотизол', dosage: '10 мг', form: 'таблетки', requiresPrescription: false, price: 380, stock: 40, categorySlug: 'uspokoitelnye', description: 'Транквилизатор без снотворного эффекта.' },
      { name: 'Тенотен', slug: 'tenoten', manufacturer: 'Материа Медика', activeIngredient: 'Антитела к мозгоспецифическому белку S-100', dosage: '1 таблетка', form: 'таблетки', requiresPrescription: false, price: 230, stock: 50, categorySlug: 'uspokoitelnye', description: 'Успокаивающее и противотревожное средство.' },
      { name: 'Адаптол 500 мг', slug: 'adaptol-500', manufacturer: 'Олайнфарм', activeIngredient: 'Мебикар', dosage: '500 мг', form: 'таблетки', requiresPrescription: true, price: 420, stock: 30, categorySlug: 'uspokoitelnye', description: 'Транквилизатор дневного действия. Отпускается по рецепту.' },
      { name: 'Мелаксен 3 мг', slug: 'melaksen-3', manufacturer: 'Юнифарм', activeIngredient: 'Мелатонин', dosage: '3 мг', form: 'таблетки', requiresPrescription: false, price: 490, stock: 25, categorySlug: 'uspokoitelnye', description: 'Средство для нормализации сна и адаптации к смене часовых поясов.' },
      { name: 'Фенибут 250 мг', slug: 'fenibut-250', manufacturer: 'Олайнфарм', activeIngredient: 'Фенибут', dosage: '250 мг', form: 'таблетки', requiresPrescription: true, price: 320, stock: 35, categorySlug: 'uspokoitelnye', description: 'Ноотропное и противотревожное средство. Отпускается по рецепту.' },
      // --- Прочие (8) ---
      { name: 'Мирамистин 0.01%', slug: 'miramistin', manufacturer: 'Инфамед', activeIngredient: 'Мирамистин', dosage: '0.01%', form: 'раствор', requiresPrescription: false, price: 360, stock: 60, categorySlug: 'prostuda-kashel', description: 'Антисептическое средство широкого спектра действия.' },
      { name: 'Дексаметазон 4 мг', slug: 'deksametazon-4', manufacturer: 'Д-р Реддис', activeIngredient: 'Дексаметазон', dosage: '4 мг', form: 'таблетки', requiresPrescription: true, price: 140, stock: 40, categorySlug: 'obezbolivayushchie', description: 'Глюкокортикостероид. Отпускается по рецепту.' },
      { name: 'Актовегин 200 мг', slug: 'aktovegin-200', manufacturer: 'Такеда', activeIngredient: 'Депротеинизированный гемодериват крови телят', dosage: '200 мг', form: 'таблетки', requiresPrescription: true, price: 900, stock: 25, categorySlug: 'vitaminy', description: 'Средство для улучшения трофики и регенерации тканей.' },
      { name: 'Троксевазин гель', slug: 'troksevazin-gel', manufacturer: 'Балканфарма', activeIngredient: 'Троксерутин', dosage: '2%', form: 'гель', requiresPrescription: false, price: 190, stock: 70, categorySlug: 'obezbolivayushchie', description: 'Венопротекторное и противовоспалительное средство для наружного применения.' },
      { name: 'Диклофенак мазь 1%', slug: 'diklofenak-maz-1', manufacturer: 'Хемофарм', activeIngredient: 'Диклофенак натрия', dosage: '1%', form: 'мазь', requiresPrescription: false, price: 110, stock: 80, categorySlug: 'obezbolivayushchie', description: 'Противовоспалительное и обезболивающее средство для наружного применения.' },
      { name: 'Тауфон 4%', slug: 'taufon-4', manufacturer: 'Фармстандарт', activeIngredient: 'Таурин', dosage: '4%', form: 'капли', requiresPrescription: false, price: 80, stock: 100, categorySlug: 'vitaminy', description: 'Метаболическое средство для лечения заболеваний сетчатки.' },
      { name: 'Грамицидин С спрей', slug: 'gramicidin-s', manufacturer: 'Валента', activeIngredient: 'Грамицидин С', dosage: '1 доза', form: 'спрей', requiresPrescription: false, price: 260, stock: 45, categorySlug: 'prostuda-kashel', description: 'Антибактериальный спрей для лечения заболеваний полости рта и горла.' },
      { name: 'Преднизолон 5 мг', slug: 'prednizolon-5', manufacturer: 'Нижфарм', activeIngredient: 'Преднизолон', dosage: '5 мг', form: 'таблетки', requiresPrescription: true, price: 100, stock: 50, categorySlug: 'obezbolivayushchie', description: 'Глюкокортикостероидное средство. Отпускается по рецепту.' },
    ];

    const lowRated = ['anaferon','ergoferon','remantadin-50','oksolinovaya-maz','korvalol','valokordin','rengalin','tenoten','adaptol-500','afobazol-10'];
    const ratings = {};
    for (const p of products) {
      ratings[p.slug] = lowRated.includes(p.slug) ? (3.0 + Math.random() * 0.9).toFixed(1) * 1 : (4.7 + Math.random() * 0.3).toFixed(1) * 1;
    }

    for (const p of products) {
      const existing = await Product.findOne({ where: { slug: p.slug } });
      if (!existing) {
        await Product.create({
          name: p.name, slug: p.slug, description: p.description,
          manufacturer: p.manufacturer, activeIngredient: p.activeIngredient,
          dosage: p.dosage, form: p.form, requiresPrescription: p.requiresPrescription,
          price: p.price, stock: p.stock, categoryId: getCatId(p.categorySlug),
          image: 'default-product.png', rating: ratings[p.slug] || 4.0, oldPrice: null,
        });
      }
    }
    console.log('✓ Товары загружены');

    // Скидки для ~25% товаров
    const allProducts = await Product.findAll();
    const shuffled = allProducts.sort(() => Math.random() - 0.5);
    const discountCount = Math.round(allProducts.length * 0.25);
    for (let i = 0; i < discountCount; i++) {
      const discount = 10 + Math.floor(Math.random() * 21); // 10-30%
      const oldPrice = Math.round(parseFloat(shuffled[i].price) * (1 + discount / 100) * 100) / 100;
      await shuffled[i].update({ oldPrice });
    }
    console.log('✓ Скидки проставлены');

    const stores = [
      { name: 'Аптека "Здоровье" №1', address: 'г. Казань, ул. Баумана, д. 45', lat: 55.788459, lng: 49.119826, phone: '+7 (843) 238-45-67', workingHours: 'пн-пт 8:00-22:00, сб-вс 9:00-21:00' },
      { name: 'Аптека "Здоровье" №2', address: 'г. Казань, пр. Победы, д. 152', lat: 55.781570, lng: 49.221012, phone: '+7 (843) 234-56-78', workingHours: 'пн-вс 8:00-23:00' },
      { name: 'Аптека "Здоровье" №3', address: 'г. Казань, ул. Чистопольская, д. 32', lat: 55.818346, lng: 49.119871, phone: '+7 (843) 345-67-89', workingHours: 'пн-пт 9:00-21:00, сб 10:00-19:00' },
      { name: 'Аптека "Здоровье" №4', address: 'г. Казань, ул. Петербургская, д. 65А', lat: 55.777879, lng: 49.143173, phone: '+7 (843) 456-78-90', workingHours: 'пн-вс 9:00-22:00' },
      { name: 'Аптека "Здоровье" №5', address: 'г. Казань, ул. Декабристов, д. 85', lat: 55.818786, lng: 49.090199, phone: '+7 (843) 567-89-01', workingHours: 'пн-вс 8:00-21:00' },
      { name: 'Аптека "Здоровье" №6', address: 'г. Казань, ул. Гвардейская, д. 10', lat: 55.791850, lng: 49.171084, phone: '+7 (843) 678-90-12', workingHours: 'пн-вс 9:00-22:00' },
      { name: 'Аптека "Здоровье" №7', address: 'г. Казань, пр. Ямашева, д. 71', lat: 55.825644, lng: 49.136328, phone: '+7 (843) 789-01-23', workingHours: 'пн-пт 8:00-20:00, сб 9:00-18:00' },
      { name: 'Аптека "Здоровье" №8', address: 'г. Казань, ул. Галиаскара Камала, д. 21', lat: 55.783407, lng: 49.108444, phone: '+7 (843) 890-12-34', workingHours: 'пн-вс 9:00-23:00' },
      { name: 'Аптека "Здоровье" №9', address: 'г. Казань, ул. Рихарда Зорге, д. 68', lat: 55.747444, lng: 49.211131, phone: '+7 (843) 901-23-45', workingHours: 'пн-пт 8:00-21:00, сб-вс 9:00-20:00' },
      { name: 'Аптека "Здоровье" №10', address: 'г. Казань, ул. Четаева, д. 54', lat: 55.821148, lng: 49.120544, phone: '+7 (843) 012-34-56', workingHours: 'пн-вс 8:00-22:00' },
      { name: 'Аптека "Здоровье" №11', address: 'г. Казань, ул. Серова, д. 3', lat: 55.830872, lng: 49.062945, phone: '+7 (843) 111-22-33', workingHours: 'пн-пт 8:00-20:00, сб 9:00-17:00' },
      { name: 'Аптека "Здоровье" №12', address: 'г. Казань, ул. Гладилова, д. 22', lat: 55.807248, lng: 49.070122, phone: '+7 (843) 222-33-44', workingHours: 'пн-вс 9:00-21:00' },
    ];

    for (const s of stores) {
      const existing = await Store.findOne({ where: { name: s.name } });
      if (!existing) await Store.create(s);
    }
    console.log('✓ Аптеки загружены');

    const promotions = [
      { title: 'Скидка пенсионерам 10%', description: 'Постоянным покупателям пенсионного возраста предоставляется скидка на все товары.', badgeText: '-10%', discountPercent: 10, requiresPromoCode: false, requirements: 'При предъявлении пенсионного удостоверения в аптеке.', sortOrder: 1, maxUses: 0 },
      { title: 'Скидка на первый заказ 5%', description: 'Для новых клиентов интернет-аптеки скидка на первый заказ.', badgeText: '-5%', discountPercent: 5, requiresPromoCode: false, requirements: 'Автоматически применяется к первому заказу.', sortOrder: 2, maxUses: 0 },
      { title: 'Скидка при заказе от 3000 ₽', description: 'При оформлении заказа на сумму от 3000 рублей — скидка 7%.', badgeText: '-7%', discountPercent: 7, requiresPromoCode: false, requirements: 'Сумма заказа должна быть от 3000 ₽.', sortOrder: 3, maxUses: 0 },
      { title: 'Бесплатная доставка от 2000 ₽', description: 'При заказе от 2000 рублей доставка по Казани бесплатно.', badgeText: 'Подарок', discountPercent: 0, requiresPromoCode: false, requirements: 'Сумма заказа от 2000 ₽.', sortOrder: 4, maxUses: 0 },
      { title: 'Скидка 15% на витамины', description: 'Скидка на все витамины и БАДы по промокоду.', badgeText: '-15%', discountPercent: 15, requiresPromoCode: true, promoCode: 'VITAMIN15', requirements: 'Введите промокод VITAMIN15 при оформлении заказа.', sortOrder: 5, maxUses: 1, applicableCategoryId: 3 },
      { title: 'Скидка 10% на любой заказ', description: 'Персональная скидка 10% на любой заказ по промокоду.', badgeText: '-10%', discountPercent: 10, requiresPromoCode: true, promoCode: 'ZDOROVIE10', requirements: 'Введите промокод ZDOROVIE10 при оформлении заказа.', sortOrder: 6, maxUses: 1 },
    ];

    for (const prom of promotions) {
      const existing = await Promotion.findOne({ where: { title: prom.title } });
      if (!existing) await Promotion.create(prom);
    }
    console.log('✓ Акции загружены');

    console.log('\n✅ База данных успешно заполнена!');
  } catch (err) {
    console.error('Ошибка:', err);
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
