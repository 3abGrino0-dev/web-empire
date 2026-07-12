-- Web Empire V5: tools library wave 1
-- Adds/updates 59 free formula tools and 13 localized categories.
-- Safe, idempotent upserts. No destructive deletes.

insert into public.categories(
  slug, name_ar, name_en, description, icon, style_key, sort_order, is_active
)
values
  ('business-tools', 'أدوات الأعمال', 'Business Tools', 'حاسبات الأعمال والأرباح والتسعير.', 'briefcase', 'gold', 10, true),
  ('marketing-tools', 'أدوات التسويق', 'Marketing Tools', 'حاسبات الأداء الإعلاني والتسويقي.', 'chart', 'cyan', 20, true),
  ('finance-tools', 'أدوات المال', 'Finance Tools', 'حاسبات المال والضرائب والادخار.', 'wallet', 'violet', 30, true),
  ('general-tools', 'أدوات عامة', 'General Tools', 'حاسبات عامة سريعة للاستخدام اليومي.', 'calculator', 'violet', 40, true),
  ('converter-tools', 'أدوات التحويل', 'Converter Tools', 'أدوات تحويل القياسات والمساحات والأحجام.', 'convert', 'cyan', 50, true),
  ('date-time-tools', 'أدوات التاريخ والوقت', 'Date & Time Tools', 'أدوات التاريخ والوقت والفروقات الزمنية.', 'calendar', 'gold', 60, true),
  ('health-tools', 'أدوات الصحة', 'Health Tools', 'حاسبات صحية تقديرية للاستخدام العام.', 'heart', 'violet', 130, true),
  ('education-tools', 'أدوات الطلاب', 'Education Tools', 'أدوات المعدلات والدرجات للطلاب.', 'graduation-cap', 'cyan', 140, true),
  ('employment-tools', 'أدوات الرواتب والموظفين', 'Employment Tools', 'حاسبات الرواتب والأجور والعمل الإضافي.', 'users', 'gold', 150, true),
  ('internet-tools', 'أدوات الإنترنت', 'Internet Tools', 'أدوات روابط الإنترنت وQR ومعلومات الاتصال.', 'globe', 'cyan', 160, true),
  ('file-tools', 'أدوات الملفات', 'File Tools', 'أدوات معالجة الملفات والصور داخل المتصفح.', 'file', 'violet', 170, true),
  ('whatsapp-tools', 'أدوات واتساب', 'WhatsApp Tools', 'أدوات إنشاء روابط واتساب وتجهيز الرسائل.', 'message-circle', 'green', 180, true),
  ('saudi-tools', 'أدوات السعودية', 'Saudi Tools', 'أدوات مخصصة للاستخدامات الشائعة في السعودية.', 'landmark', 'gold', 190, true)
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  description = excluded.description,
  icon = excluded.icon,
  style_key = excluded.style_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.category_translations(category_id, locale_id, name, description)
select category.id, locale.id, seed.name, seed.description
from (
  values
    ('business-tools', 'ar', 'أدوات الأعمال', 'حاسبات الأعمال والأرباح والتسعير.'),
    ('business-tools', 'en', 'Business Tools', 'Business, profit, and pricing calculators.'),
    ('marketing-tools', 'ar', 'أدوات التسويق', 'حاسبات الأداء الإعلاني والتسويقي.'),
    ('marketing-tools', 'en', 'Marketing Tools', 'Advertising and marketing performance calculators.'),
    ('finance-tools', 'ar', 'أدوات المال', 'حاسبات المال والضرائب والادخار.'),
    ('finance-tools', 'en', 'Finance Tools', 'Finance, tax, and savings calculators.'),
    ('general-tools', 'ar', 'أدوات عامة', 'حاسبات عامة سريعة للاستخدام اليومي.'),
    ('general-tools', 'en', 'General Tools', 'Fast general-purpose calculators.'),
    ('converter-tools', 'ar', 'أدوات التحويل', 'أدوات تحويل القياسات والمساحات والأحجام.'),
    ('converter-tools', 'en', 'Converter Tools', 'Measurement, area, and volume converters.'),
    ('date-time-tools', 'ar', 'أدوات التاريخ والوقت', 'أدوات التاريخ والوقت والفروقات الزمنية.'),
    ('date-time-tools', 'en', 'Date & Time Tools', 'Date, time, and duration tools.'),
    ('health-tools', 'ar', 'أدوات الصحة', 'حاسبات صحية تقديرية للاستخدام العام.'),
    ('health-tools', 'en', 'Health Tools', 'General health estimation calculators.'),
    ('education-tools', 'ar', 'أدوات الطلاب', 'أدوات المعدلات والدرجات للطلاب.'),
    ('education-tools', 'en', 'Education Tools', 'GPA and score tools for students.'),
    ('employment-tools', 'ar', 'أدوات الرواتب والموظفين', 'حاسبات الرواتب والأجور والعمل الإضافي.'),
    ('employment-tools', 'en', 'Employment Tools', 'Salary, wage, and overtime calculators.'),
    ('internet-tools', 'ar', 'أدوات الإنترنت', 'أدوات روابط الإنترنت وQR ومعلومات الاتصال.'),
    ('internet-tools', 'en', 'Internet Tools', 'Internet links, QR, and connectivity tools.'),
    ('file-tools', 'ar', 'أدوات الملفات', 'أدوات معالجة الملفات والصور داخل المتصفح.'),
    ('file-tools', 'en', 'File Tools', 'Browser-based file and image utilities.'),
    ('whatsapp-tools', 'ar', 'أدوات واتساب', 'أدوات إنشاء روابط واتساب وتجهيز الرسائل.'),
    ('whatsapp-tools', 'en', 'WhatsApp Tools', 'WhatsApp link and message preparation tools.'),
    ('saudi-tools', 'ar', 'أدوات السعودية', 'أدوات مخصصة للاستخدامات الشائعة في السعودية.'),
    ('saudi-tools', 'en', 'Saudi Tools', 'Tools tailored to common Saudi use cases.')
) as seed(category_slug, locale_code, name, description)
join public.categories category on category.slug = seed.category_slug
join public.locales locale on locale.code = seed.locale_code
on conflict (category_id, locale_id) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

create temporary table wave1_formula_tool_seed (
  category_slug text not null,
  slug text not null,
  title_ar text not null,
  title_en text not null,
  description_ar text not null,
  description_en text not null,
  runtime_config jsonb not null,
  input_fields jsonb not null,
  english_fields jsonb not null,
  submit_ar text not null,
  submit_en text not null,
  sort_order integer not null,
  is_featured boolean not null
) on commit drop;

insert into wave1_formula_tool_seed(
  category_slug, slug, title_ar, title_en, description_ar, description_en,
  runtime_config, input_fields, english_fields, submit_ar, submit_en,
  sort_order, is_featured
)
values
  ('finance-tools', 'vat-calculator', 'حاسبة ضريبة القيمة المضافة', 'VAT Calculator', 'احسب قيمة ضريبة القيمة المضافة من السعر والنسبة.', 'Calculate VAT amount from price and rate.', '{"expression":"price * vat_rate / 100","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"قيمة الضريبة","resultLabelEn":"VAT amount","decimals":2,"showEquation":true}'::jsonb, '[{"key":"price","label":"السعر قبل الضريبة","type":"number","required":true,"min":0,"step":0.01},{"key":"vat_rate","label":"نسبة الضريبة","type":"number","required":true,"min":0,"max":100,"step":0.01,"defaultValue":15}]'::jsonb, '[{"key":"price","label":"Price before VAT","type":"number","required":true,"min":0,"step":0.01},{"key":"vat_rate","label":"VAT rate","type":"number","required":true,"min":0,"max":100,"step":0.01,"defaultValue":15}]'::jsonb, 'احسب الضريبة', 'Calculate VAT', 100, true),
  ('finance-tools', 'price-with-vat-calculator', 'حاسبة السعر شامل الضريبة', 'Price Including VAT Calculator', 'احسب السعر النهائي بعد إضافة ضريبة القيمة المضافة.', 'Calculate the final price after VAT.', '{"expression":"price + (price * vat_rate / 100)","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"السعر شامل الضريبة","resultLabelEn":"Price including VAT","decimals":2,"showEquation":true}'::jsonb, '[{"key":"price","label":"السعر قبل الضريبة","type":"number","required":true,"min":0,"step":0.01},{"key":"vat_rate","label":"نسبة الضريبة","type":"number","required":true,"min":0,"max":100,"step":0.01,"defaultValue":15}]'::jsonb, '[{"key":"price","label":"Price before VAT","type":"number","required":true,"min":0,"step":0.01},{"key":"vat_rate","label":"VAT rate","type":"number","required":true,"min":0,"max":100,"step":0.01,"defaultValue":15}]'::jsonb, 'احسب السعر شامل الضريبة', 'Calculate total with VAT', 101, true),
  ('finance-tools', 'pre-tax-price-calculator', 'حاسبة السعر قبل الضريبة', 'Pre-tax Price Calculator', 'استخرج السعر قبل الضريبة من السعر شامل الضريبة.', 'Find the pre-tax price from a VAT-inclusive amount.', '{"expression":"price_with_vat / (1 + vat_rate / 100)","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"السعر قبل الضريبة","resultLabelEn":"Pre-tax price","decimals":2,"showEquation":true}'::jsonb, '[{"key":"price_with_vat","label":"السعر شامل الضريبة","type":"number","required":true,"min":0,"step":0.01},{"key":"vat_rate","label":"نسبة الضريبة","type":"number","required":true,"min":0,"max":100,"step":0.01,"defaultValue":15}]'::jsonb, '[{"key":"price_with_vat","label":"Price including VAT","type":"number","required":true,"min":0,"step":0.01},{"key":"vat_rate","label":"VAT rate","type":"number","required":true,"min":0,"max":100,"step":0.01,"defaultValue":15}]'::jsonb, 'احسب السعر قبل الضريبة', 'Calculate pre-tax price', 102, false),
  ('finance-tools', 'discount-calculator', 'حاسبة الخصم', 'Discount Calculator', 'احسب السعر النهائي بعد تطبيق نسبة الخصم.', 'Calculate the final price after a discount.', '{"expression":"price - (price * discount_rate / 100)","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"السعر بعد الخصم","resultLabelEn":"Discounted price","decimals":2,"showEquation":true}'::jsonb, '[{"key":"price","label":"السعر الأصلي","type":"number","required":true,"min":0,"step":0.01},{"key":"discount_rate","label":"نسبة الخصم","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, '[{"key":"price","label":"Original price","type":"number","required":true,"min":0,"step":0.01},{"key":"discount_rate","label":"Discount rate","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, 'احسب السعر بعد الخصم', 'Calculate discounted price', 103, true),
  ('finance-tools', 'percentage-of-amount-calculator', 'حاسبة نسبة من مبلغ', 'Percentage of Amount Calculator', 'احسب قيمة نسبة مئوية من مبلغ محدد.', 'Calculate a percentage of a given amount.', '{"expression":"amount * percentage / 100","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"قيمة النسبة","resultLabelEn":"Percentage amount","decimals":2,"showEquation":true}'::jsonb, '[{"key":"amount","label":"المبلغ","type":"number","required":true,"min":0,"step":0.01},{"key":"percentage","label":"النسبة المئوية","type":"number","required":true,"min":0,"max":100000,"step":0.01}]'::jsonb, '[{"key":"amount","label":"Amount","type":"number","required":true,"min":0,"step":0.01},{"key":"percentage","label":"Percentage","type":"number","required":true,"min":0,"max":100000,"step":0.01}]'::jsonb, 'احسب القيمة', 'Calculate amount', 104, false),
  ('finance-tools', 'percentage-change-calculator', 'حاسبة نسبة التغير', 'Percentage Change Calculator', 'احسب نسبة الزيادة أو الانخفاض بين قيمتين.', 'Calculate percentage increase or decrease between two values.', '{"expression":"((new_value - old_value) / old_value) * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"نسبة التغير","resultLabelEn":"Percentage change","decimals":2,"showEquation":true,"negativeResultLabelAr":"نسبة الانخفاض","negativeResultLabelEn":"Percentage decrease","positiveResultLabelAr":"نسبة الزيادة","positiveResultLabelEn":"Percentage increase"}'::jsonb, '[{"key":"old_value","label":"القيمة القديمة","type":"number","required":true,"min":1e-08,"step":0.01},{"key":"new_value","label":"القيمة الجديدة","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"old_value","label":"Old value","type":"number","required":true,"min":1e-08,"step":0.01},{"key":"new_value","label":"New value","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب نسبة التغير', 'Calculate change', 105, false),
  ('finance-tools', 'reverse-percentage-calculator', 'حاسبة النسبة العكسية', 'Reverse Percentage Calculator', 'استخرج القيمة الأصلية عندما تعرف قيمة نسبة منها.', 'Find the original amount when a percentage value is known.', '{"expression":"known_value / (percentage / 100)","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"القيمة الأصلية","resultLabelEn":"Original amount","decimals":2,"showEquation":true}'::jsonb, '[{"key":"known_value","label":"قيمة النسبة","type":"number","required":true,"min":0,"step":0.01},{"key":"percentage","label":"النسبة المئوية","type":"number","required":true,"min":1e-08,"max":100000,"step":0.01}]'::jsonb, '[{"key":"known_value","label":"Percentage value","type":"number","required":true,"min":0,"step":0.01},{"key":"percentage","label":"Percentage","type":"number","required":true,"min":1e-08,"max":100000,"step":0.01}]'::jsonb, 'احسب القيمة الأصلية', 'Calculate original value', 106, false),
  ('finance-tools', 'profit-margin-calculator', 'حاسبة هامش الربح', 'Profit Margin Calculator', 'احسب هامش الربح كنسبة من سعر البيع.', 'Calculate profit margin as a percentage of selling price.', '{"expression":"((price - cost) / price) * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"هامش الربح","resultLabelEn":"Profit margin","decimals":2,"showEquation":true,"negativeResultLabelAr":"هامش خسارة","negativeResultLabelEn":"Loss margin"}'::jsonb, '[{"key":"price","label":"سعر البيع","type":"number","required":true,"min":1e-08,"step":0.01},{"key":"cost","label":"التكلفة","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"price","label":"Selling price","type":"number","required":true,"min":1e-08,"step":0.01},{"key":"cost","label":"Cost","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب هامش الربح', 'Calculate margin', 107, true),
  ('finance-tools', 'markup-calculator', 'حاسبة نسبة الزيادة على التكلفة', 'Markup Calculator', 'احسب نسبة الزيادة فوق تكلفة المنتج.', 'Calculate markup percentage over cost.', '{"expression":"((price - cost) / cost) * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"نسبة الزيادة","resultLabelEn":"Markup","decimals":2,"showEquation":true,"negativeResultLabelAr":"نسبة انخفاض عن التكلفة","negativeResultLabelEn":"Below-cost percentage"}'::jsonb, '[{"key":"price","label":"سعر البيع","type":"number","required":true,"min":0,"step":0.01},{"key":"cost","label":"التكلفة","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, '[{"key":"price","label":"Selling price","type":"number","required":true,"min":0,"step":0.01},{"key":"cost","label":"Cost","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, 'احسب نسبة الزيادة', 'Calculate markup', 108, false),
  ('finance-tools', 'gross-profit-calculator', 'حاسبة الربح الإجمالي', 'Gross Profit Calculator', 'احسب الربح أو الخسارة الإجمالية من الإيراد والتكلفة.', 'Calculate gross profit or loss from revenue and cost.', '{"expression":"revenue - cost","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"الربح الإجمالي","resultLabelEn":"Gross profit","decimals":2,"showEquation":true,"negativeResultLabelAr":"الخسارة الإجمالية","negativeResultLabelEn":"Gross loss","negativeWarningAr":"التكلفة أعلى من الإيراد، لذلك النتيجة تمثل خسارة إجمالية.","negativeWarningEn":"Cost exceeds revenue, so the result represents a gross loss."}'::jsonb, '[{"key":"revenue","label":"الإيراد","type":"number","required":true,"min":0,"step":0.01},{"key":"cost","label":"التكلفة","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"revenue","label":"Revenue","type":"number","required":true,"min":0,"step":0.01},{"key":"cost","label":"Cost","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب الربح الإجمالي', 'Calculate gross profit', 109, true),
  ('finance-tools', 'roi-calculator', 'حاسبة العائد على الاستثمار', 'ROI Calculator', 'احسب نسبة العائد على الاستثمار.', 'Calculate return on investment percentage.', '{"expression":"((return_value - investment) / investment) * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"العائد على الاستثمار","resultLabelEn":"ROI","decimals":2,"showEquation":true,"negativeResultLabelAr":"عائد سلبي","negativeResultLabelEn":"Negative ROI"}'::jsonb, '[{"key":"return_value","label":"القيمة العائدة","type":"number","required":true,"min":0,"step":0.01},{"key":"investment","label":"قيمة الاستثمار","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, '[{"key":"return_value","label":"Return value","type":"number","required":true,"min":0,"step":0.01},{"key":"investment","label":"Investment","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, 'احسب العائد', 'Calculate ROI', 110, true),
  ('finance-tools', 'commission-calculator', 'حاسبة العمولة', 'Commission Calculator', 'احسب قيمة العمولة من المبيعات ونسبة العمولة.', 'Calculate commission from sales and rate.', '{"expression":"sales * commission_rate / 100","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"قيمة العمولة","resultLabelEn":"Commission amount","decimals":2,"showEquation":true}'::jsonb, '[{"key":"sales","label":"قيمة المبيعات","type":"number","required":true,"min":0,"step":0.01},{"key":"commission_rate","label":"نسبة العمولة","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, '[{"key":"sales","label":"Sales amount","type":"number","required":true,"min":0,"step":0.01},{"key":"commission_rate","label":"Commission rate","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, 'احسب العمولة', 'Calculate commission', 111, false),
  ('finance-tools', 'unit-price-calculator', 'حاسبة سعر الوحدة', 'Unit Price Calculator', 'احسب تكلفة أو سعر الوحدة الواحدة.', 'Calculate cost or price per unit.', '{"expression":"total_cost / units","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"سعر الوحدة","resultLabelEn":"Unit price","decimals":2,"showEquation":true}'::jsonb, '[{"key":"total_cost","label":"التكلفة الإجمالية","type":"number","required":true,"min":0,"step":0.01},{"key":"units","label":"عدد الوحدات","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"total_cost","label":"Total cost","type":"number","required":true,"min":0,"step":0.01},{"key":"units","label":"Units","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب سعر الوحدة', 'Calculate unit price', 112, false),
  ('finance-tools', 'installment-calculator', 'حاسبة الأقساط', 'Installment Calculator', 'احسب القسط الشهري التقريبي مع فائدة بسيطة.', 'Estimate monthly installment using simple interest.', '{"expression":"(amount + (amount * annual_rate / 100 * years)) / months","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"القسط الشهري التقريبي","resultLabelEn":"Estimated monthly installment","decimals":2,"showEquation":true}'::jsonb, '[{"key":"amount","label":"مبلغ التمويل","type":"number","required":true,"min":0,"step":0.01},{"key":"annual_rate","label":"النسبة السنوية","type":"number","required":true,"min":0,"max":100,"step":0.01},{"key":"years","label":"عدد السنوات","type":"number","required":true,"min":0,"step":0.01},{"key":"months","label":"عدد الأقساط بالشهور","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"amount","label":"Financed amount","type":"number","required":true,"min":0,"step":0.01},{"key":"annual_rate","label":"Annual rate","type":"number","required":true,"min":0,"max":100,"step":0.01},{"key":"years","label":"Years","type":"number","required":true,"min":0,"step":0.01},{"key":"months","label":"Installment months","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب القسط', 'Calculate installment', 113, true),
  ('finance-tools', 'loan-payment-calculator', 'حاسبة دفعة القرض', 'Loan Payment Calculator', 'احسب الدفعة الشهرية لقرض بفائدة شهرية مركبة.', 'Calculate monthly loan payment with compound monthly interest.', '{"expression":"(principal * (annual_rate / 100 / 12) * ((1 + annual_rate / 100 / 12) ^ months)) / (((1 + annual_rate / 100 / 12) ^ months) - 1)","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"الدفعة الشهرية","resultLabelEn":"Monthly payment","decimals":2,"showEquation":true,"noteAr":"عند نسبة فائدة صفر استخدم حاسبة الأقساط البسيطة.","noteEn":"For a zero interest rate, use the simple installment calculator."}'::jsonb, '[{"key":"principal","label":"مبلغ القرض","type":"number","required":true,"min":0.01,"step":0.01},{"key":"annual_rate","label":"الفائدة السنوية","type":"number","required":true,"min":1e-06,"max":100,"step":0.01},{"key":"months","label":"عدد الأشهر","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"principal","label":"Loan principal","type":"number","required":true,"min":0.01,"step":0.01},{"key":"annual_rate","label":"Annual interest rate","type":"number","required":true,"min":1e-06,"max":100,"step":0.01},{"key":"months","label":"Months","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب الدفعة', 'Calculate payment', 114, true),
  ('finance-tools', 'savings-goal-calculator', 'حاسبة هدف الادخار', 'Savings Goal Calculator', 'احسب المبلغ المطلوب ادخاره شهريًا للوصول إلى هدفك.', 'Calculate monthly savings needed to reach a goal.', '{"expression":"(target_amount - current_savings) / months","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"الادخار الشهري المطلوب","resultLabelEn":"Required monthly savings","decimals":2,"showEquation":true,"negativeResultLabelAr":"تم تجاوز الهدف","negativeResultLabelEn":"Goal already exceeded","negativeWarningAr":"مدخراتك الحالية تتجاوز المبلغ المستهدف.","negativeWarningEn":"Current savings already exceed the target."}'::jsonb, '[{"key":"target_amount","label":"المبلغ المستهدف","type":"number","required":true,"min":0,"step":0.01},{"key":"current_savings","label":"المدخرات الحالية","type":"number","required":true,"min":0,"step":0.01},{"key":"months","label":"عدد الأشهر","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"target_amount","label":"Target amount","type":"number","required":true,"min":0,"step":0.01},{"key":"current_savings","label":"Current savings","type":"number","required":true,"min":0,"step":0.01},{"key":"months","label":"Months","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب الادخار الشهري', 'Calculate monthly savings', 115, false),
  ('finance-tools', 'simple-interest-calculator', 'حاسبة الفائدة البسيطة', 'Simple Interest Calculator', 'احسب قيمة الفائدة البسيطة.', 'Calculate simple interest.', '{"expression":"principal * annual_rate / 100 * years","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"قيمة الفائدة","resultLabelEn":"Interest amount","decimals":2,"showEquation":true}'::jsonb, '[{"key":"principal","label":"رأس المال","type":"number","required":true,"min":0,"step":0.01},{"key":"annual_rate","label":"النسبة السنوية","type":"number","required":true,"min":0,"max":100,"step":0.01},{"key":"years","label":"عدد السنوات","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"principal","label":"Principal","type":"number","required":true,"min":0,"step":0.01},{"key":"annual_rate","label":"Annual rate","type":"number","required":true,"min":0,"max":100,"step":0.01},{"key":"years","label":"Years","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب الفائدة', 'Calculate interest', 116, false),
  ('finance-tools', 'compound-interest-calculator', 'حاسبة الفائدة المركبة', 'Compound Interest Calculator', 'احسب الأرباح المتراكمة بفائدة مركبة.', 'Calculate accumulated compound interest earnings.', '{"expression":"(principal * ((1 + annual_rate / 100 / compounds_per_year) ^ (compounds_per_year * years))) - principal","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"أرباح الفائدة المركبة","resultLabelEn":"Compound interest earnings","decimals":2,"showEquation":true}'::jsonb, '[{"key":"principal","label":"رأس المال","type":"number","required":true,"min":0,"step":0.01},{"key":"annual_rate","label":"النسبة السنوية","type":"number","required":true,"min":0,"max":100,"step":0.01},{"key":"compounds_per_year","label":"مرات التركيب سنويًا","type":"number","required":true,"min":1,"max":365,"step":1,"defaultValue":12},{"key":"years","label":"عدد السنوات","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"principal","label":"Principal","type":"number","required":true,"min":0,"step":0.01},{"key":"annual_rate","label":"Annual rate","type":"number","required":true,"min":0,"max":100,"step":0.01},{"key":"compounds_per_year","label":"Compounds per year","type":"number","required":true,"min":1,"max":365,"step":1,"defaultValue":12},{"key":"years","label":"Years","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب الفائدة المركبة', 'Calculate compound interest', 117, false),
  ('finance-tools', 'zakat-calculator', 'حاسبة الزكاة', 'Zakat Calculator', 'احسب زكاة المال بنسبة تختارها.', 'Calculate monetary zakat using a selected rate.', '{"expression":"eligible_amount * zakat_rate / 100","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"مقدار الزكاة","resultLabelEn":"Zakat amount","decimals":2,"showEquation":true,"noteAr":"تحقق من بلوغ النصاب وحولان الحول وفق حالتك الشرعية.","noteEn":"Confirm nisab and the holding-period requirements for your circumstances."}'::jsonb, '[{"key":"eligible_amount","label":"المال الخاضع للزكاة","type":"number","required":true,"min":0,"step":0.01},{"key":"zakat_rate","label":"نسبة الزكاة","type":"number","required":true,"min":0,"max":100,"step":0.001,"defaultValue":2.5}]'::jsonb, '[{"key":"eligible_amount","label":"Zakat-eligible amount","type":"number","required":true,"min":0,"step":0.01},{"key":"zakat_rate","label":"Zakat rate","type":"number","required":true,"min":0,"max":100,"step":0.001,"defaultValue":2.5}]'::jsonb, 'احسب الزكاة', 'Calculate zakat', 118, true),
  ('finance-tools', 'gold-zakat-calculator', 'حاسبة زكاة الذهب', 'Gold Zakat Calculator', 'احسب القيمة التقديرية لزكاة الذهب من الوزن وسعر الجرام.', 'Estimate gold zakat from weight and gram price.', '{"expression":"gold_weight * gold_price_per_gram * zakat_rate / 100","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"مقدار زكاة الذهب","resultLabelEn":"Gold zakat amount","decimals":2,"showEquation":true,"noteAr":"سعر الذهب يدخله المستخدم، والنتيجة تقديرية وليست فتوى.","noteEn":"You provide the gold price; the result is an estimate, not a religious ruling."}'::jsonb, '[{"key":"gold_weight","label":"وزن الذهب بالجرام","type":"number","required":true,"min":0,"step":0.01},{"key":"gold_price_per_gram","label":"سعر جرام الذهب","type":"number","required":true,"min":0,"step":0.01},{"key":"zakat_rate","label":"نسبة الزكاة","type":"number","required":true,"min":0,"max":100,"step":0.001,"defaultValue":2.5}]'::jsonb, '[{"key":"gold_weight","label":"Gold weight in grams","type":"number","required":true,"min":0,"step":0.01},{"key":"gold_price_per_gram","label":"Gold price per gram","type":"number","required":true,"min":0,"step":0.01},{"key":"zakat_rate","label":"Zakat rate","type":"number","required":true,"min":0,"max":100,"step":0.001,"defaultValue":2.5}]'::jsonb, 'احسب زكاة الذهب', 'Calculate gold zakat', 119, false),
  ('finance-tools', 'net-after-tax-calculator', 'حاسبة الصافي بعد الضريبة', 'Net After Tax Calculator', 'احسب صافي المبلغ بعد خصم نسبة ضريبية.', 'Calculate net amount after a tax deduction.', '{"expression":"gross_income - (gross_income * tax_rate / 100)","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"الصافي بعد الضريبة","resultLabelEn":"Net after tax","decimals":2,"showEquation":true}'::jsonb, '[{"key":"gross_income","label":"المبلغ الإجمالي","type":"number","required":true,"min":0,"step":0.01},{"key":"tax_rate","label":"نسبة الضريبة","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, '[{"key":"gross_income","label":"Gross amount","type":"number","required":true,"min":0,"step":0.01},{"key":"tax_rate","label":"Tax rate","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, 'احسب الصافي', 'Calculate net', 120, false),
  ('finance-tools', 'tip-calculator', 'حاسبة الإكرامية', 'Tip Calculator', 'احسب قيمة الإكرامية من إجمالي الفاتورة.', 'Calculate tip amount from a bill total.', '{"expression":"bill_amount * tip_rate / 100","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"قيمة الإكرامية","resultLabelEn":"Tip amount","decimals":2,"showEquation":true}'::jsonb, '[{"key":"bill_amount","label":"إجمالي الفاتورة","type":"number","required":true,"min":0,"step":0.01},{"key":"tip_rate","label":"نسبة الإكرامية","type":"number","required":true,"min":0,"max":100,"step":0.01,"defaultValue":10}]'::jsonb, '[{"key":"bill_amount","label":"Bill amount","type":"number","required":true,"min":0,"step":0.01},{"key":"tip_rate","label":"Tip rate","type":"number","required":true,"min":0,"max":100,"step":0.01,"defaultValue":10}]'::jsonb, 'احسب الإكرامية', 'Calculate tip', 121, false),
  ('business-tools', 'break-even-calculator', 'حاسبة نقطة التعادل', 'Break-even Calculator', 'احسب عدد الوحدات اللازمة لتغطية التكاليف الثابتة.', 'Calculate units required to cover fixed costs.', '{"expression":"fixed_costs / (unit_price - unit_variable_cost)","outputUnitAr":" وحدة","outputUnitEn":" units","resultLabelAr":"نقطة التعادل","resultLabelEn":"Break-even point","decimals":0,"showEquation":true,"noteAr":"يجب أن يكون سعر الوحدة أعلى من التكلفة المتغيرة للوحدة.","noteEn":"Unit price must exceed variable cost per unit."}'::jsonb, '[{"key":"fixed_costs","label":"التكاليف الثابتة","type":"number","required":true,"min":0,"step":0.01},{"key":"unit_price","label":"سعر الوحدة","type":"number","required":true,"min":1e-08,"step":0.01},{"key":"unit_variable_cost","label":"التكلفة المتغيرة للوحدة","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"fixed_costs","label":"Fixed costs","type":"number","required":true,"min":0,"step":0.01},{"key":"unit_price","label":"Unit price","type":"number","required":true,"min":1e-08,"step":0.01},{"key":"unit_variable_cost","label":"Variable cost per unit","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب نقطة التعادل', 'Calculate break-even', 300, true),
  ('marketing-tools', 'roas-calculator', 'حاسبة العائد الإعلاني', 'ROAS Calculator', 'احسب الإيراد الناتج عن كل وحدة إنفاق إعلاني.', 'Calculate revenue generated per unit of ad spend.', '{"expression":"revenue / ad_spend","outputUnitAr":"×","outputUnitEn":"×","resultLabelAr":"العائد الإعلاني","resultLabelEn":"ROAS","decimals":2,"showEquation":true,"insightTemplateAr":"كل 1 ر.س من الإنفاق الإعلاني حقق {result} ر.س من الإيراد.","insightTemplateEn":"Each 1 SAR of ad spend generated {result} SAR in revenue."}'::jsonb, '[{"key":"revenue","label":"الإيراد من الإعلانات","type":"number","required":true,"min":0,"step":0.01},{"key":"ad_spend","label":"الإنفاق الإعلاني","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, '[{"key":"revenue","label":"Ad revenue","type":"number","required":true,"min":0,"step":0.01},{"key":"ad_spend","label":"Ad spend","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, 'احسب ROAS', 'Calculate ROAS', 320, true),
  ('marketing-tools', 'ctr-calculator', 'حاسبة معدل النقر', 'CTR Calculator', 'احسب معدل النقر إلى الظهور.', 'Calculate click-through rate.', '{"expression":"clicks / impressions * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"معدل النقر","resultLabelEn":"CTR","decimals":2,"showEquation":true}'::jsonb, '[{"key":"clicks","label":"النقرات","type":"number","required":true,"min":0,"step":1},{"key":"impressions","label":"مرات الظهور","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"clicks","label":"Clicks","type":"number","required":true,"min":0,"step":1},{"key":"impressions","label":"Impressions","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب CTR', 'Calculate CTR', 321, true),
  ('marketing-tools', 'cpc-calculator', 'حاسبة تكلفة النقرة', 'CPC Calculator', 'احسب متوسط تكلفة النقرة.', 'Calculate average cost per click.', '{"expression":"ad_spend / clicks","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"تكلفة النقرة","resultLabelEn":"CPC","decimals":2,"showEquation":true}'::jsonb, '[{"key":"ad_spend","label":"الإنفاق الإعلاني","type":"number","required":true,"min":0,"step":0.01},{"key":"clicks","label":"النقرات","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"ad_spend","label":"Ad spend","type":"number","required":true,"min":0,"step":0.01},{"key":"clicks","label":"Clicks","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب CPC', 'Calculate CPC', 322, false),
  ('marketing-tools', 'cpm-calculator', 'حاسبة تكلفة الألف ظهور', 'CPM Calculator', 'احسب تكلفة كل ألف ظهور.', 'Calculate cost per thousand impressions.', '{"expression":"ad_spend / impressions * 1000","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"تكلفة الألف ظهور","resultLabelEn":"CPM","decimals":2,"showEquation":true}'::jsonb, '[{"key":"ad_spend","label":"الإنفاق الإعلاني","type":"number","required":true,"min":0,"step":0.01},{"key":"impressions","label":"مرات الظهور","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"ad_spend","label":"Ad spend","type":"number","required":true,"min":0,"step":0.01},{"key":"impressions","label":"Impressions","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب CPM', 'Calculate CPM', 323, false),
  ('marketing-tools', 'cpa-calculator', 'حاسبة تكلفة الإجراء', 'CPA Calculator', 'احسب تكلفة كل تحويل أو إجراء.', 'Calculate cost per acquisition or action.', '{"expression":"ad_spend / conversions","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"تكلفة الإجراء","resultLabelEn":"CPA","decimals":2,"showEquation":true}'::jsonb, '[{"key":"ad_spend","label":"الإنفاق الإعلاني","type":"number","required":true,"min":0,"step":0.01},{"key":"conversions","label":"التحويلات","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"ad_spend","label":"Ad spend","type":"number","required":true,"min":0,"step":0.01},{"key":"conversions","label":"Conversions","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب CPA', 'Calculate CPA', 324, false),
  ('marketing-tools', 'conversion-rate-calculator', 'حاسبة معدل التحويل', 'Conversion Rate Calculator', 'احسب نسبة التحويل من الزوار.', 'Calculate conversion rate from visitors.', '{"expression":"conversions / visitors * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"معدل التحويل","resultLabelEn":"Conversion rate","decimals":2,"showEquation":true}'::jsonb, '[{"key":"conversions","label":"التحويلات","type":"number","required":true,"min":0,"step":1},{"key":"visitors","label":"الزوار","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"conversions","label":"Conversions","type":"number","required":true,"min":0,"step":1},{"key":"visitors","label":"Visitors","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب معدل التحويل', 'Calculate conversion rate', 325, true),
  ('marketing-tools', 'aov-calculator', 'حاسبة متوسط قيمة الطلب', 'AOV Calculator', 'احسب متوسط قيمة الطلب.', 'Calculate average order value.', '{"expression":"revenue / orders","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"متوسط قيمة الطلب","resultLabelEn":"AOV","decimals":2,"showEquation":true}'::jsonb, '[{"key":"revenue","label":"الإيراد","type":"number","required":true,"min":0,"step":0.01},{"key":"orders","label":"عدد الطلبات","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"revenue","label":"Revenue","type":"number","required":true,"min":0,"step":0.01},{"key":"orders","label":"Orders","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب AOV', 'Calculate AOV', 326, false),
  ('marketing-tools', 'customer-acquisition-cost-calculator', 'حاسبة تكلفة اكتساب العميل', 'Customer Acquisition Cost Calculator', 'احسب متوسط تكلفة اكتساب عميل جديد.', 'Calculate average customer acquisition cost.', '{"expression":"marketing_cost / new_customers","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"تكلفة اكتساب العميل","resultLabelEn":"CAC","decimals":2,"showEquation":true}'::jsonb, '[{"key":"marketing_cost","label":"تكلفة التسويق","type":"number","required":true,"min":0,"step":0.01},{"key":"new_customers","label":"العملاء الجدد","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"marketing_cost","label":"Marketing cost","type":"number","required":true,"min":0,"step":0.01},{"key":"new_customers","label":"New customers","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب تكلفة العميل', 'Calculate CAC', 327, false),
  ('general-tools', 'percentage-calculator', 'حاسبة النسبة المئوية', 'Percentage Calculator', 'احسب نسبة جزء من إجمالي.', 'Calculate a part as a percentage of a total.', '{"expression":"part / total * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"النسبة المئوية","resultLabelEn":"Percentage","decimals":2,"showEquation":true,"warningWhenPartExceedsTotal":true,"partExceedsTotalWarningAr":"الجزء أكبر من الإجمالي، لذلك النتيجة تتجاوز 100%.","partExceedsTotalWarningEn":"The part is greater than the total, so the result exceeds 100%."}'::jsonb, '[{"key":"part","label":"الجزء","type":"number","required":true,"min":0,"step":0.01},{"key":"total","label":"الإجمالي","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, '[{"key":"part","label":"Part","type":"number","required":true,"min":0,"step":0.01},{"key":"total","label":"Total","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, 'احسب النسبة', 'Calculate percentage', 400, true),
  ('general-tools', 'average-calculator', 'حاسبة المتوسط', 'Average Calculator', 'احسب المتوسط من المجموع وعدد القيم.', 'Calculate an average from a total and item count.', '{"expression":"total / count","outputUnitAr":"","outputUnitEn":"","resultLabelAr":"المتوسط","resultLabelEn":"Average","decimals":2,"showEquation":true}'::jsonb, '[{"key":"total","label":"مجموع القيم","type":"number","required":true,"step":0.01},{"key":"count","label":"عدد القيم","type":"number","required":true,"min":1,"step":1}]'::jsonb, '[{"key":"total","label":"Total of values","type":"number","required":true,"step":0.01},{"key":"count","label":"Number of values","type":"number","required":true,"min":1,"step":1}]'::jsonb, 'احسب المتوسط', 'Calculate average', 401, false),
  ('general-tools', 'square-root-calculator', 'حاسبة الجذر التربيعي', 'Square Root Calculator', 'احسب الجذر التربيعي لعدد غير سالب.', 'Calculate the square root of a non-negative number.', '{"expression":"value ^ 0.5","outputUnitAr":"","outputUnitEn":"","resultLabelAr":"الجذر التربيعي","resultLabelEn":"Square root","decimals":6,"showEquation":true}'::jsonb, '[{"key":"value","label":"العدد","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"value","label":"Number","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب الجذر', 'Calculate square root', 402, false),
  ('general-tools', 'ratio-calculator', 'حاسبة النسبة بين قيمتين', 'Ratio Calculator', 'احسب نسبة القيمة الأولى إلى الثانية.', 'Calculate the ratio of the first value to the second.', '{"expression":"first_value / second_value","outputUnitAr":" : 1","outputUnitEn":" : 1","resultLabelAr":"النسبة","resultLabelEn":"Ratio","decimals":4,"showEquation":true}'::jsonb, '[{"key":"first_value","label":"القيمة الأولى","type":"number","required":true,"step":0.01},{"key":"second_value","label":"القيمة الثانية","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, '[{"key":"first_value","label":"First value","type":"number","required":true,"step":0.01},{"key":"second_value","label":"Second value","type":"number","required":true,"min":1e-08,"step":0.01}]'::jsonb, 'احسب النسبة', 'Calculate ratio', 403, false),
  ('general-tools', 'sample-size-calculator', 'حاسبة حجم العينة', 'Sample Size Calculator', 'احسب حجم عينة تقريبي باستخدام معادلة سلوفين.', 'Estimate sample size using Slovin''s formula.', '{"expression":"population / (1 + population * (margin_error ^ 2))","outputUnitAr":" مشارك","outputUnitEn":" respondents","resultLabelAr":"حجم العينة التقريبي","resultLabelEn":"Estimated sample size","decimals":0,"showEquation":true,"noteAr":"هذه نتيجة تقريبية وليست بديلًا عن تصميم إحصائي متخصص.","noteEn":"This is an estimate, not a substitute for specialist statistical design."}'::jsonb, '[{"key":"population","label":"حجم المجتمع","type":"number","required":true,"min":1,"step":1},{"key":"margin_error","label":"هامش الخطأ كعدد عشري","type":"number","required":true,"min":0.001,"max":1,"step":0.001,"defaultValue":0.05,"helpText":"مثال: 0.05 يعني 5%"}]'::jsonb, '[{"key":"population","label":"Population size","type":"number","required":true,"min":1,"step":1},{"key":"margin_error","label":"Margin of error as decimal","type":"number","required":true,"min":0.001,"max":1,"step":0.001,"defaultValue":0.05,"helpText":"Example: 0.05 means 5%"}]'::jsonb, 'احسب حجم العينة', 'Calculate sample size', 404, false),
  ('general-tools', 'weighted-score-calculator', 'حاسبة الدرجة الموزونة', 'Weighted Score Calculator', 'احسب مساهمة درجة وفق وزنها النسبي.', 'Calculate a score contribution using its weight.', '{"expression":"score * weight / 100","outputUnitAr":"","outputUnitEn":"","resultLabelAr":"الدرجة الموزونة","resultLabelEn":"Weighted score","decimals":2,"showEquation":true}'::jsonb, '[{"key":"score","label":"الدرجة","type":"number","required":true,"min":0,"max":100,"step":0.01},{"key":"weight","label":"الوزن النسبي","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, '[{"key":"score","label":"Score","type":"number","required":true,"min":0,"max":100,"step":0.01},{"key":"weight","label":"Weight","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, 'احسب الدرجة الموزونة', 'Calculate weighted score', 405, false),
  ('converter-tools', 'cbm-calculator', 'حاسبة الحجم CBM', 'CBM Calculator', 'احسب الحجم بالمتر المكعب لعدد من الصناديق.', 'Calculate cubic meters for multiple boxes.', '{"expression":"length * width * height * quantity","outputUnitAr":" م³","outputUnitEn":" m³","resultLabelAr":"الحجم الإجمالي","resultLabelEn":"Total volume","decimals":3,"showEquation":true}'::jsonb, '[{"key":"length","label":"الطول بالمتر","type":"number","required":true,"min":0,"step":0.001},{"key":"width","label":"العرض بالمتر","type":"number","required":true,"min":0,"step":0.001},{"key":"height","label":"الارتفاع بالمتر","type":"number","required":true,"min":0,"step":0.001},{"key":"quantity","label":"الكمية","type":"number","required":true,"min":1,"step":1,"defaultValue":1}]'::jsonb, '[{"key":"length","label":"Length in meters","type":"number","required":true,"min":0,"step":0.001},{"key":"width","label":"Width in meters","type":"number","required":true,"min":0,"step":0.001},{"key":"height","label":"Height in meters","type":"number","required":true,"min":0,"step":0.001},{"key":"quantity","label":"Quantity","type":"number","required":true,"min":1,"step":1,"defaultValue":1}]'::jsonb, 'احسب CBM', 'Calculate CBM', 500, true),
  ('converter-tools', 'centimeter-to-meter-converter', 'محول السنتيمتر إلى متر', 'Centimeter to Meter Converter', 'حوّل السنتيمترات إلى أمتار.', 'Convert centimeters to meters.', '{"expression":"centimeters / 100","outputUnitAr":" م","outputUnitEn":" m","resultLabelAr":"الطول بالمتر","resultLabelEn":"Length in meters","decimals":4,"showEquation":true}'::jsonb, '[{"key":"centimeters","label":"السنتيمتر","type":"number","required":true,"step":0.01}]'::jsonb, '[{"key":"centimeters","label":"Centimeters","type":"number","required":true,"step":0.01}]'::jsonb, 'حوّل إلى متر', 'Convert to meters', 501, false),
  ('converter-tools', 'meter-to-kilometer-converter', 'محول المتر إلى كيلومتر', 'Meter to Kilometer Converter', 'حوّل الأمتار إلى كيلومترات.', 'Convert meters to kilometers.', '{"expression":"meters / 1000","outputUnitAr":" كم","outputUnitEn":" km","resultLabelAr":"المسافة بالكيلومتر","resultLabelEn":"Distance in kilometers","decimals":4,"showEquation":true}'::jsonb, '[{"key":"meters","label":"المتر","type":"number","required":true,"step":0.01}]'::jsonb, '[{"key":"meters","label":"Meters","type":"number","required":true,"step":0.01}]'::jsonb, 'حوّل إلى كيلومتر', 'Convert to kilometers', 502, false),
  ('converter-tools', 'kilogram-to-pound-converter', 'محول الكيلوجرام إلى رطل', 'Kilogram to Pound Converter', 'حوّل الكيلوجرامات إلى أرطال.', 'Convert kilograms to pounds.', '{"expression":"kilograms * 2.2046226218","outputUnitAr":" رطل","outputUnitEn":" lb","resultLabelAr":"الوزن بالرطل","resultLabelEn":"Weight in pounds","decimals":4,"showEquation":true}'::jsonb, '[{"key":"kilograms","label":"الكيلوجرام","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"kilograms","label":"Kilograms","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'حوّل إلى رطل', 'Convert to pounds', 503, false),
  ('converter-tools', 'pound-to-kilogram-converter', 'محول الرطل إلى كيلوجرام', 'Pound to Kilogram Converter', 'حوّل الأرطال إلى كيلوجرامات.', 'Convert pounds to kilograms.', '{"expression":"pounds / 2.2046226218","outputUnitAr":" كجم","outputUnitEn":" kg","resultLabelAr":"الوزن بالكيلوجرام","resultLabelEn":"Weight in kilograms","decimals":4,"showEquation":true}'::jsonb, '[{"key":"pounds","label":"الرطل","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"pounds","label":"Pounds","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'حوّل إلى كيلوجرام', 'Convert to kilograms', 504, false),
  ('converter-tools', 'celsius-to-fahrenheit-converter', 'محول مئوي إلى فهرنهايت', 'Celsius to Fahrenheit Converter', 'حوّل درجة الحرارة المئوية إلى فهرنهايت.', 'Convert Celsius temperature to Fahrenheit.', '{"expression":"(celsius * 9 / 5) + 32","outputUnitAr":"°F","outputUnitEn":"°F","resultLabelAr":"درجة فهرنهايت","resultLabelEn":"Fahrenheit","decimals":2,"showEquation":true}'::jsonb, '[{"key":"celsius","label":"الدرجة المئوية","type":"number","required":true,"step":0.01}]'::jsonb, '[{"key":"celsius","label":"Celsius","type":"number","required":true,"step":0.01}]'::jsonb, 'حوّل إلى فهرنهايت', 'Convert to Fahrenheit', 505, false),
  ('converter-tools', 'fahrenheit-to-celsius-converter', 'محول فهرنهايت إلى مئوي', 'Fahrenheit to Celsius Converter', 'حوّل درجة فهرنهايت إلى مئوية.', 'Convert Fahrenheit temperature to Celsius.', '{"expression":"(fahrenheit - 32) * 5 / 9","outputUnitAr":"°C","outputUnitEn":"°C","resultLabelAr":"الدرجة المئوية","resultLabelEn":"Celsius","decimals":2,"showEquation":true}'::jsonb, '[{"key":"fahrenheit","label":"درجة فهرنهايت","type":"number","required":true,"step":0.01}]'::jsonb, '[{"key":"fahrenheit","label":"Fahrenheit","type":"number","required":true,"step":0.01}]'::jsonb, 'حوّل إلى مئوي', 'Convert to Celsius', 506, false),
  ('converter-tools', 'rectangle-area-calculator', 'حاسبة مساحة المستطيل', 'Rectangle Area Calculator', 'احسب مساحة المستطيل من الطول والعرض.', 'Calculate rectangle area from length and width.', '{"expression":"length * width","outputUnitAr":" م²","outputUnitEn":" m²","resultLabelAr":"مساحة المستطيل","resultLabelEn":"Rectangle area","decimals":2,"showEquation":true}'::jsonb, '[{"key":"length","label":"الطول","type":"number","required":true,"min":0,"step":0.01},{"key":"width","label":"العرض","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"length","label":"Length","type":"number","required":true,"min":0,"step":0.01},{"key":"width","label":"Width","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب المساحة', 'Calculate area', 507, false),
  ('converter-tools', 'land-share-area-calculator', 'حاسبة مساحة حصة الأرض', 'Land Share Area Calculator', 'احسب مساحة حصة من أرض وفق نسبة الملكية.', 'Calculate land-share area from an ownership percentage.', '{"expression":"total_area * share_percentage / 100","outputUnitAr":" م²","outputUnitEn":" m²","resultLabelAr":"مساحة الحصة","resultLabelEn":"Share area","decimals":2,"showEquation":true}'::jsonb, '[{"key":"total_area","label":"مساحة الأرض الكلية","type":"number","required":true,"min":0,"step":0.01},{"key":"share_percentage","label":"نسبة الحصة","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, '[{"key":"total_area","label":"Total land area","type":"number","required":true,"min":0,"step":0.01},{"key":"share_percentage","label":"Share percentage","type":"number","required":true,"min":0,"max":100,"step":0.01}]'::jsonb, 'احسب مساحة الحصة', 'Calculate share area', 508, false),
  ('converter-tools', 'box-volume-liter-calculator', 'حاسبة حجم الصندوق باللتر', 'Box Volume in Liters Calculator', 'احسب حجم صندوق بالسنتيمتر وحوّله إلى لترات.', 'Calculate box volume in centimeters and convert to liters.', '{"expression":"length_cm * width_cm * height_cm / 1000","outputUnitAr":" لتر","outputUnitEn":" L","resultLabelAr":"حجم الصندوق","resultLabelEn":"Box volume","decimals":2,"showEquation":true}'::jsonb, '[{"key":"length_cm","label":"الطول بالسنتيمتر","type":"number","required":true,"min":0,"step":0.01},{"key":"width_cm","label":"العرض بالسنتيمتر","type":"number","required":true,"min":0,"step":0.01},{"key":"height_cm","label":"الارتفاع بالسنتيمتر","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, '[{"key":"length_cm","label":"Length in cm","type":"number","required":true,"min":0,"step":0.01},{"key":"width_cm","label":"Width in cm","type":"number","required":true,"min":0,"step":0.01},{"key":"height_cm","label":"Height in cm","type":"number","required":true,"min":0,"step":0.01}]'::jsonb, 'احسب الحجم', 'Calculate volume', 509, false),
  ('health-tools', 'bmi-calculator', 'حاسبة مؤشر كتلة الجسم', 'BMI Calculator', 'احسب مؤشر كتلة الجسم من الوزن والطول.', 'Calculate body mass index from weight and height.', '{"expression":"weight / ((height_cm / 100) ^ 2)","outputUnitAr":"","outputUnitEn":"","resultLabelAr":"مؤشر كتلة الجسم","resultLabelEn":"BMI","decimals":2,"showEquation":true,"noteAr":"النتيجة مؤشر عام ولا تغني عن التقييم الطبي.","noteEn":"This is a general indicator and not a substitute for medical assessment."}'::jsonb, '[{"key":"weight","label":"الوزن بالكيلوجرام","type":"number","required":true,"min":1,"step":0.1},{"key":"height_cm","label":"الطول بالسنتيمتر","type":"number","required":true,"min":1,"step":0.1}]'::jsonb, '[{"key":"weight","label":"Weight in kg","type":"number","required":true,"min":1,"step":0.1},{"key":"height_cm","label":"Height in cm","type":"number","required":true,"min":1,"step":0.1}]'::jsonb, 'احسب BMI', 'Calculate BMI', 600, true),
  ('health-tools', 'daily-water-intake-calculator', 'حاسبة شرب الماء اليومي', 'Daily Water Intake Calculator', 'قدّر كمية الماء اليومية اعتمادًا على الوزن.', 'Estimate daily water intake based on body weight.', '{"expression":"weight * 0.033","outputUnitAr":" لتر","outputUnitEn":" L","resultLabelAr":"الكمية اليومية التقديرية","resultLabelEn":"Estimated daily intake","decimals":2,"showEquation":true,"noteAr":"الاحتياج يختلف حسب النشاط والجو والحالة الصحية.","noteEn":"Needs vary by activity, climate, and health conditions."}'::jsonb, '[{"key":"weight","label":"الوزن بالكيلوجرام","type":"number","required":true,"min":1,"step":0.1}]'::jsonb, '[{"key":"weight","label":"Weight in kg","type":"number","required":true,"min":1,"step":0.1}]'::jsonb, 'احسب كمية الماء', 'Calculate water intake', 601, false),
  ('health-tools', 'bmr-male-calculator', 'حاسبة معدل الأيض الأساسي للرجال', 'Male BMR Calculator', 'قدّر معدل الأيض الأساسي للرجال بمعادلة ميفلين.', 'Estimate male basal metabolic rate using Mifflin-St Jeor.', '{"expression":"10 * weight + 6.25 * height_cm - 5 * age + 5","outputUnitAr":" سعرة/يوم","outputUnitEn":" kcal/day","resultLabelAr":"معدل الأيض الأساسي","resultLabelEn":"Basal metabolic rate","decimals":0,"showEquation":true,"noteAr":"النتيجة تقديرية وليست توصية طبية.","noteEn":"The result is an estimate, not medical advice."}'::jsonb, '[{"key":"weight","label":"الوزن بالكيلوجرام","type":"number","required":true,"min":1,"step":0.1},{"key":"height_cm","label":"الطول بالسنتيمتر","type":"number","required":true,"min":1,"step":0.1},{"key":"age","label":"العمر بالسنوات","type":"number","required":true,"min":1,"max":120,"step":1}]'::jsonb, '[{"key":"weight","label":"Weight in kg","type":"number","required":true,"min":1,"step":0.1},{"key":"height_cm","label":"Height in cm","type":"number","required":true,"min":1,"step":0.1},{"key":"age","label":"Age in years","type":"number","required":true,"min":1,"max":120,"step":1}]'::jsonb, 'احسب BMR', 'Calculate BMR', 602, false),
  ('health-tools', 'bmr-female-calculator', 'حاسبة معدل الأيض الأساسي للنساء', 'Female BMR Calculator', 'قدّر معدل الأيض الأساسي للنساء بمعادلة ميفلين.', 'Estimate female basal metabolic rate using Mifflin-St Jeor.', '{"expression":"10 * weight + 6.25 * height_cm - 5 * age - 161","outputUnitAr":" سعرة/يوم","outputUnitEn":" kcal/day","resultLabelAr":"معدل الأيض الأساسي","resultLabelEn":"Basal metabolic rate","decimals":0,"showEquation":true,"noteAr":"النتيجة تقديرية وليست توصية طبية.","noteEn":"The result is an estimate, not medical advice."}'::jsonb, '[{"key":"weight","label":"الوزن بالكيلوجرام","type":"number","required":true,"min":1,"step":0.1},{"key":"height_cm","label":"الطول بالسنتيمتر","type":"number","required":true,"min":1,"step":0.1},{"key":"age","label":"العمر بالسنوات","type":"number","required":true,"min":1,"max":120,"step":1}]'::jsonb, '[{"key":"weight","label":"Weight in kg","type":"number","required":true,"min":1,"step":0.1},{"key":"height_cm","label":"Height in cm","type":"number","required":true,"min":1,"step":0.1},{"key":"age","label":"Age in years","type":"number","required":true,"min":1,"max":120,"step":1}]'::jsonb, 'احسب BMR', 'Calculate BMR', 603, false),
  ('education-tools', 'gpa-4-to-percentage-calculator', 'محول المعدل من 4 إلى نسبة', 'GPA 4 to Percentage Calculator', 'حوّل المعدل من 4 إلى نسبة مئوية.', 'Convert a GPA out of 4 to a percentage.', '{"expression":"gpa / 4 * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"النسبة المئوية","resultLabelEn":"Percentage","decimals":2,"showEquation":true}'::jsonb, '[{"key":"gpa","label":"المعدل من 4","type":"number","required":true,"min":0,"max":4,"step":0.01}]'::jsonb, '[{"key":"gpa","label":"GPA out of 4","type":"number","required":true,"min":0,"max":4,"step":0.01}]'::jsonb, 'حوّل إلى نسبة', 'Convert to percentage', 700, true),
  ('education-tools', 'gpa-5-to-percentage-calculator', 'محول المعدل من 5 إلى نسبة', 'GPA 5 to Percentage Calculator', 'حوّل المعدل من 5 إلى نسبة مئوية.', 'Convert a GPA out of 5 to a percentage.', '{"expression":"gpa / 5 * 100","outputUnitAr":"%","outputUnitEn":"%","resultLabelAr":"النسبة المئوية","resultLabelEn":"Percentage","decimals":2,"showEquation":true}'::jsonb, '[{"key":"gpa","label":"المعدل من 5","type":"number","required":true,"min":0,"max":5,"step":0.01}]'::jsonb, '[{"key":"gpa","label":"GPA out of 5","type":"number","required":true,"min":0,"max":5,"step":0.01}]'::jsonb, 'حوّل إلى نسبة', 'Convert to percentage', 701, false),
  ('education-tools', 'gpa-4-to-5-converter', 'محول المعدل من 4 إلى 5', 'GPA 4 to 5 Converter', 'حوّل المعدل من مقياس 4 إلى مقياس 5.', 'Convert GPA from a 4-point scale to a 5-point scale.', '{"expression":"gpa / 4 * 5","outputUnitAr":" من 5","outputUnitEn":" out of 5","resultLabelAr":"المعدل المحول","resultLabelEn":"Converted GPA","decimals":2,"showEquation":true}'::jsonb, '[{"key":"gpa","label":"المعدل من 4","type":"number","required":true,"min":0,"max":4,"step":0.01}]'::jsonb, '[{"key":"gpa","label":"GPA out of 4","type":"number","required":true,"min":0,"max":4,"step":0.01}]'::jsonb, 'حوّل إلى مقياس 5', 'Convert to 5-point scale', 702, false),
  ('employment-tools', 'hourly-wage-calculator', 'حاسبة الأجر بالساعة', 'Hourly Wage Calculator', 'احسب الأجر بالساعة من الراتب الشهري وأيام وساعات العمل.', 'Calculate hourly wage from monthly salary and work schedule.', '{"expression":"monthly_salary / work_days / hours_per_day","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"الأجر بالساعة","resultLabelEn":"Hourly wage","decimals":2,"showEquation":true}'::jsonb, '[{"key":"monthly_salary","label":"الراتب الشهري","type":"number","required":true,"min":0,"step":0.01},{"key":"work_days","label":"أيام العمل الشهرية","type":"number","required":true,"min":1,"max":31,"step":1,"defaultValue":30},{"key":"hours_per_day","label":"ساعات العمل اليومية","type":"number","required":true,"min":0.1,"max":24,"step":0.1,"defaultValue":8}]'::jsonb, '[{"key":"monthly_salary","label":"Monthly salary","type":"number","required":true,"min":0,"step":0.01},{"key":"work_days","label":"Work days per month","type":"number","required":true,"min":1,"max":31,"step":1,"defaultValue":30},{"key":"hours_per_day","label":"Hours per day","type":"number","required":true,"min":0.1,"max":24,"step":0.1,"defaultValue":8}]'::jsonb, 'احسب أجر الساعة', 'Calculate hourly wage', 800, true),
  ('employment-tools', 'daily-wage-calculator', 'حاسبة الأجر اليومي', 'Daily Wage Calculator', 'احسب الأجر اليومي من الراتب الشهري.', 'Calculate daily wage from monthly salary.', '{"expression":"monthly_salary / work_days","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"الأجر اليومي","resultLabelEn":"Daily wage","decimals":2,"showEquation":true}'::jsonb, '[{"key":"monthly_salary","label":"الراتب الشهري","type":"number","required":true,"min":0,"step":0.01},{"key":"work_days","label":"أيام العمل الشهرية","type":"number","required":true,"min":1,"max":31,"step":1,"defaultValue":30}]'::jsonb, '[{"key":"monthly_salary","label":"Monthly salary","type":"number","required":true,"min":0,"step":0.01},{"key":"work_days","label":"Work days per month","type":"number","required":true,"min":1,"max":31,"step":1,"defaultValue":30}]'::jsonb, 'احسب الأجر اليومي', 'Calculate daily wage', 801, false),
  ('employment-tools', 'overtime-pay-calculator', 'حاسبة أجر العمل الإضافي', 'Overtime Pay Calculator', 'احسب أجر ساعات العمل الإضافي باستخدام معامل تختاره.', 'Calculate overtime pay using a selected multiplier.', '{"expression":"hourly_rate * overtime_hours * multiplier","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"أجر العمل الإضافي","resultLabelEn":"Overtime pay","decimals":2,"showEquation":true}'::jsonb, '[{"key":"hourly_rate","label":"الأجر بالساعة","type":"number","required":true,"min":0,"step":0.01},{"key":"overtime_hours","label":"ساعات العمل الإضافي","type":"number","required":true,"min":0,"step":0.1},{"key":"multiplier","label":"معامل الإضافي","type":"number","required":true,"min":0,"step":0.01,"defaultValue":1.5}]'::jsonb, '[{"key":"hourly_rate","label":"Hourly rate","type":"number","required":true,"min":0,"step":0.01},{"key":"overtime_hours","label":"Overtime hours","type":"number","required":true,"min":0,"step":0.1},{"key":"multiplier","label":"Overtime multiplier","type":"number","required":true,"min":0,"step":0.01,"defaultValue":1.5}]'::jsonb, 'احسب أجر الإضافي', 'Calculate overtime pay', 802, false),
  ('employment-tools', 'salary-increase-calculator', 'حاسبة زيادة الراتب', 'Salary Increase Calculator', 'احسب مقدار زيادة الراتب كنسبة مئوية.', 'Calculate salary increase amount by percentage.', '{"expression":"current_salary * increase_rate / 100","outputUnitAr":" ر.س","outputUnitEn":" SAR","resultLabelAr":"مقدار زيادة الراتب","resultLabelEn":"Salary increase amount","decimals":2,"showEquation":true}'::jsonb, '[{"key":"current_salary","label":"الراتب الحالي","type":"number","required":true,"min":0,"step":0.01},{"key":"increase_rate","label":"نسبة الزيادة","type":"number","required":true,"min":0,"max":1000,"step":0.01}]'::jsonb, '[{"key":"current_salary","label":"Current salary","type":"number","required":true,"min":0,"step":0.01},{"key":"increase_rate","label":"Increase rate","type":"number","required":true,"min":0,"max":1000,"step":0.01}]'::jsonb, 'احسب مقدار الزيادة', 'Calculate increase', 803, false),
  ('employment-tools', 'retirement-years-remaining-calculator', 'حاسبة السنوات المتبقية للتقاعد', 'Retirement Years Remaining Calculator', 'احسب عدد السنوات المتبقية حتى سن التقاعد المحدد.', 'Calculate years remaining until a selected retirement age.', '{"expression":"retirement_age - current_age","outputUnitAr":" سنة","outputUnitEn":" years","resultLabelAr":"السنوات المتبقية","resultLabelEn":"Years remaining","decimals":0,"showEquation":true,"negativeResultLabelAr":"تجاوز سن التقاعد المحدد","negativeResultLabelEn":"Past selected retirement age","negativeWarningAr":"العمر الحالي يتجاوز سن التقاعد المحدد.","negativeWarningEn":"Current age exceeds the selected retirement age."}'::jsonb, '[{"key":"current_age","label":"العمر الحالي","type":"number","required":true,"min":0,"max":120,"step":1},{"key":"retirement_age","label":"سن التقاعد","type":"number","required":true,"min":1,"max":120,"step":1,"defaultValue":60}]'::jsonb, '[{"key":"current_age","label":"Current age","type":"number","required":true,"min":0,"max":120,"step":1},{"key":"retirement_age","label":"Retirement age","type":"number","required":true,"min":1,"max":120,"step":1,"defaultValue":60}]'::jsonb, 'احسب السنوات المتبقية', 'Calculate remaining years', 804, false)
;

insert into public.tools(
  slug, title_ar, title_en, short_description, category_id, engine_type,
  input_schema, output_schema, runtime_config, pricing_mode, fixed_points,
  minimum_points, requires_auth, is_featured, is_active, sort_order,
  seo_title, seo_description
)
select
  seed.slug,
  seed.title_ar,
  seed.title_en,
  seed.description_ar,
  category.id,
  'formula',
  jsonb_build_object('submitLabel', seed.submit_ar, 'fields', seed.input_fields),
  jsonb_build_object('type', 'number', 'format', 'runtime'),
  seed.runtime_config,
  'free',
  0,
  0,
  false,
  seed.is_featured,
  true,
  seed.sort_order,
  seed.title_ar || ' مجانًا | أمبراطورية الويب',
  seed.description_ar
from wave1_formula_tool_seed seed
join public.categories category on category.slug = seed.category_slug
on conflict (slug) do update set
  title_ar = excluded.title_ar,
  title_en = excluded.title_en,
  short_description = excluded.short_description,
  category_id = excluded.category_id,
  engine_type = excluded.engine_type,
  input_schema = excluded.input_schema,
  output_schema = excluded.output_schema,
  runtime_config = excluded.runtime_config,
  pricing_mode = excluded.pricing_mode,
  fixed_points = excluded.fixed_points,
  minimum_points = excluded.minimum_points,
  requires_auth = excluded.requires_auth,
  is_featured = excluded.is_featured,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  updated_at = now();

insert into public.tool_translations(
  tool_id, locale_id, title, short_description, seo_title, seo_description,
  prompt_template_override
)
select
  tool.id,
  locale.id,
  case when locale.code = 'ar' then seed.title_ar else seed.title_en end,
  case when locale.code = 'ar' then seed.description_ar else seed.description_en end,
  case
    when locale.code = 'ar' then seed.title_ar || ' مجانًا | أمبراطورية الويب'
    else seed.title_en || ' Free | Web Empire'
  end,
  case when locale.code = 'ar' then seed.description_ar else seed.description_en end,
  null
from wave1_formula_tool_seed seed
join public.tools tool on tool.slug = seed.slug
join public.locales locale on locale.code in ('ar', 'en')
on conflict (tool_id, locale_id) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  prompt_template_override = null,
  updated_at = now();

insert into public.tool_field_translations(
  tool_id, locale_id, field_key, label, placeholder, help_text, options
)
select
  tool.id,
  locale.id,
  field.value ->> 'key',
  field.value ->> 'label',
  nullif(field.value ->> 'placeholder', ''),
  nullif(field.value ->> 'helpText', ''),
  field.value -> 'options'
from wave1_formula_tool_seed seed
join public.tools tool on tool.slug = seed.slug
join public.locales locale on locale.code in ('ar', 'en')
cross join lateral jsonb_array_elements(
  case when locale.code = 'ar' then seed.input_fields else seed.english_fields end
) field(value)
on conflict (tool_id, locale_id, field_key) do update set
  label = excluded.label,
  placeholder = excluded.placeholder,
  help_text = excluded.help_text,
  options = excluded.options,
  updated_at = now();

insert into public.tool_field_translations(
  tool_id, locale_id, field_key, label, placeholder, help_text, options
)
select
  tool.id,
  locale.id,
  '__submit__',
  case when locale.code = 'ar' then seed.submit_ar else seed.submit_en end,
  null, null, null
from wave1_formula_tool_seed seed
join public.tools tool on tool.slug = seed.slug
join public.locales locale on locale.code in ('ar', 'en')
on conflict (tool_id, locale_id, field_key) do update set
  label = excluded.label,
  placeholder = null,
  help_text = null,
  options = null,
  updated_at = now();

do $$
declare
  v_seed_count integer;
  v_category_count integer;
  v_tool_count integer;
  v_translation_count integer;
  v_expected_field_count integer;
  v_field_count integer;
  v_runtime_count integer;
begin
  select count(*) into v_seed_count from wave1_formula_tool_seed;
  if v_seed_count <> 59 then
    raise exception 'TOOLS_WAVE1_SEED_COUNT_MISMATCH:%', v_seed_count;
  end if;

  select count(*) into v_category_count from public.categories where slug in ('business-tools', 'marketing-tools', 'finance-tools', 'general-tools', 'converter-tools', 'date-time-tools', 'health-tools', 'education-tools', 'employment-tools', 'internet-tools', 'file-tools', 'whatsapp-tools', 'saudi-tools') and is_active = true;
  if v_category_count <> 13 then
    raise exception 'TOOLS_WAVE1_CATEGORY_COUNT_MISMATCH:%', v_category_count;
  end if;

  select count(*) into v_tool_count
  from public.tools tool
  join wave1_formula_tool_seed seed on seed.slug = tool.slug
  where tool.engine_type = 'formula'
    and tool.pricing_mode = 'free'
    and tool.requires_auth = false
    and tool.is_active = true;
  if v_tool_count <> 59 then
    raise exception 'TOOLS_WAVE1_ACTIVE_TOOL_COUNT_MISMATCH:%', v_tool_count;
  end if;

  select count(*) into v_translation_count
  from public.tool_translations translation
  join public.tools tool on tool.id = translation.tool_id
  join wave1_formula_tool_seed seed on seed.slug = tool.slug
  join public.locales locale on locale.id = translation.locale_id
  where locale.code in ('ar', 'en');
  if v_translation_count <> 118 then
    raise exception 'TOOLS_WAVE1_TRANSLATION_COUNT_MISMATCH:%', v_translation_count;
  end if;

  select sum(jsonb_array_length(input_fields) + jsonb_array_length(english_fields) + 2)
  into v_expected_field_count
  from wave1_formula_tool_seed;

  select count(*) into v_field_count
  from wave1_formula_tool_seed seed
  join public.tools tool on tool.slug = seed.slug
  join public.locales locale on locale.code in ('ar', 'en')
  cross join lateral (
    select field.value ->> 'key' as field_key
    from jsonb_array_elements(
      case when locale.code = 'ar' then seed.input_fields else seed.english_fields end
    ) field(value)
    union all
    select '__submit__'
  ) expected
  join public.tool_field_translations translation
    on translation.tool_id = tool.id
   and translation.locale_id = locale.id
   and translation.field_key = expected.field_key;

  if v_field_count <> v_expected_field_count then
    raise exception 'TOOLS_WAVE1_FIELD_TRANSLATION_MISMATCH:%/%', v_field_count, v_expected_field_count;
  end if;

  select count(*) into v_runtime_count
  from public.tools tool
  join wave1_formula_tool_seed seed on seed.slug = tool.slug
  where jsonb_typeof(tool.runtime_config -> 'expression') = 'string'
    and jsonb_typeof(tool.runtime_config -> 'decimals') = 'number'
    and tool.runtime_config ? 'resultLabelAr'
    and tool.runtime_config ? 'resultLabelEn'
    and tool.runtime_config ? 'outputUnitAr'
    and tool.runtime_config ? 'outputUnitEn';
  if v_runtime_count <> 59 then
    raise exception 'TOOLS_WAVE1_RUNTIME_CONFIG_MISMATCH:%', v_runtime_count;
  end if;
end
$$;
