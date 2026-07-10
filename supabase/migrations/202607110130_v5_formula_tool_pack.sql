-- Web Empire V5: 24 localized formula tools
-- Categories: business, marketing, finance

insert into public.categories(
  slug,
  name_ar,
  name_en,
  description,
  icon,
  style_key,
  sort_order,
  is_active
)
values
  (
    'business-tools',
    'أدوات الأعمال',
    'Business Tools',
    'حاسبات الأعمال والأرباح والتسعير.',
    'briefcase',
    'gold',
    40,
    true
  ),
  (
    'marketing-tools',
    'أدوات التسويق',
    'Marketing Tools',
    'حاسبات الأداء الإعلاني والتسويقي.',
    'chart',
    'cyan',
    50,
    true
  ),
  (
    'finance-tools',
    'أدوات المال',
    'Finance Tools',
    'حاسبات مالية يومية سريعة.',
    'wallet',
    'violet',
    60,
    true
  )
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  description = excluded.description,
  icon = excluded.icon,
  style_key = excluded.style_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.category_translations(
  category_id,
  locale_id,
  name,
  description
)
select
  category.id,
  locale.id,
  seed.name,
  seed.description
from (
  values
    (
      'business-tools',
      'ar',
      'أدوات الأعمال',
      'حاسبات الأعمال والأرباح والتسعير.'
    ),
    (
      'business-tools',
      'en',
      'Business Tools',
      'Business, profit, and pricing calculators.'
    ),
    (
      'marketing-tools',
      'ar',
      'أدوات التسويق',
      'حاسبات الأداء الإعلاني والتسويقي.'
    ),
    (
      'marketing-tools',
      'en',
      'Marketing Tools',
      'Advertising and marketing performance calculators.'
    ),
    (
      'finance-tools',
      'ar',
      'أدوات المال',
      'حاسبات مالية يومية سريعة.'
    ),
    (
      'finance-tools',
      'en',
      'Finance Tools',
      'Fast everyday finance calculators.'
    )
) as seed(
  category_slug,
  locale_code,
  name,
  description
)
join public.categories category
  on category.slug = seed.category_slug
join public.locales locale
  on locale.code = seed.locale_code
on conflict (category_id, locale_id) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

create temporary table v5_formula_tool_seed (
  category_slug text not null,
  slug text not null,
  title_ar text not null,
  title_en text not null,
  description_ar text not null,
  description_en text not null,
  expression text not null,
  input_fields jsonb not null,
  english_fields jsonb not null,
  submit_ar text not null,
  submit_en text not null,
  sort_order integer not null,
  is_featured boolean not null
) on commit drop;

insert into v5_formula_tool_seed(
  category_slug,
  slug,
  title_ar,
  title_en,
  description_ar,
  description_en,
  expression,
  input_fields,
  english_fields,
  submit_ar,
  submit_en,
  sort_order,
  is_featured
)
values
  ('business-tools', 'profit-margin-calculator', 'حاسبة هامش الربح', 'Profit Margin Calculator', 'احسب هامش الربح كنسبة من سعر البيع.', 'Calculate profit margin as a percentage of selling price.', '((price - cost) / price) * 100', '[{"key":"price","label":"سعر البيع","type":"number","required":true,"step":0.01,"min":0.01},{"key":"cost","label":"التكلفة","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"price","label":"Selling price","type":"number","required":true,"step":0.01,"min":0.01},{"key":"cost","label":"Cost","type":"number","required":true,"step":0.01,"min":0}]', 'احسب هامش الربح', 'Calculate margin', 110, true),
  ('business-tools', 'markup-calculator', 'حاسبة نسبة الزيادة', 'Markup Calculator', 'احسب نسبة الزيادة فوق التكلفة.', 'Calculate markup percentage over cost.', '((price - cost) / cost) * 100', '[{"key":"price","label":"سعر البيع","type":"number","required":true,"step":0.01,"min":0},{"key":"cost","label":"التكلفة","type":"number","required":true,"step":0.01,"min":0.01}]', '[{"key":"price","label":"Selling price","type":"number","required":true,"step":0.01,"min":0},{"key":"cost","label":"Cost","type":"number","required":true,"step":0.01,"min":0.01}]', 'احسب نسبة الزيادة', 'Calculate markup', 120, true),
  ('business-tools', 'gross-profit-calculator', 'حاسبة الربح الإجمالي', 'Gross Profit Calculator', 'احسب الربح الإجمالي من الإيراد والتكلفة.', 'Calculate gross profit from revenue and cost.', 'revenue - cost', '[{"key":"revenue","label":"الإيراد","type":"number","required":true,"step":0.01,"min":0},{"key":"cost","label":"التكلفة","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"revenue","label":"Revenue","type":"number","required":true,"step":0.01,"min":0},{"key":"cost","label":"Cost","type":"number","required":true,"step":0.01,"min":0}]', 'احسب الربح', 'Calculate profit', 130, false),
  ('business-tools', 'roi-calculator', 'حاسبة العائد على الاستثمار', 'ROI Calculator', 'احسب نسبة العائد على الاستثمار.', 'Calculate return on investment percentage.', '((return_value - investment) / investment) * 100', '[{"key":"return_value","label":"القيمة العائدة","type":"number","required":true,"step":0.01,"min":0},{"key":"investment","label":"قيمة الاستثمار","type":"number","required":true,"step":0.01,"min":0.01}]', '[{"key":"return_value","label":"Return value","type":"number","required":true,"step":0.01,"min":0},{"key":"investment","label":"Investment","type":"number","required":true,"step":0.01,"min":0.01}]', 'احسب العائد', 'Calculate ROI', 140, true),
  ('business-tools', 'break-even-calculator', 'حاسبة نقطة التعادل', 'Break-even Calculator', 'احسب عدد الوحدات اللازمة لتغطية التكاليف الثابتة.', 'Calculate units required to cover fixed costs.', 'fixed_costs / (unit_price - unit_variable_cost)', '[{"key":"fixed_costs","label":"التكاليف الثابتة","type":"number","required":true,"step":0.01,"min":0},{"key":"unit_price","label":"سعر الوحدة","type":"number","required":true,"step":0.01,"min":0.01},{"key":"unit_variable_cost","label":"التكلفة المتغيرة للوحدة","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"fixed_costs","label":"Fixed costs","type":"number","required":true,"step":0.01,"min":0},{"key":"unit_price","label":"Unit price","type":"number","required":true,"step":0.01,"min":0.01},{"key":"unit_variable_cost","label":"Variable cost per unit","type":"number","required":true,"step":0.01,"min":0}]', 'احسب نقطة التعادل', 'Calculate break-even', 150, false),
  ('business-tools', 'commission-calculator', 'حاسبة العمولة', 'Commission Calculator', 'احسب قيمة العمولة من المبيعات ونسبة العمولة.', 'Calculate commission amount from sales and commission rate.', 'sales * commission_rate / 100', '[{"key":"sales","label":"قيمة المبيعات","type":"number","required":true,"step":0.01,"min":0},{"key":"commission_rate","label":"نسبة العمولة","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"sales","label":"Sales amount","type":"number","required":true,"step":0.01,"min":0},{"key":"commission_rate","label":"Commission rate","type":"number","required":true,"step":0.01,"min":0}]', 'احسب العمولة', 'Calculate commission', 160, false),
  ('business-tools', 'unit-price-calculator', 'حاسبة سعر الوحدة', 'Unit Price Calculator', 'احسب تكلفة أو سعر الوحدة الواحدة.', 'Calculate cost or price per unit.', 'total_cost / units', '[{"key":"total_cost","label":"التكلفة الإجمالية","type":"number","required":true,"step":0.01,"min":0},{"key":"units","label":"عدد الوحدات","type":"number","required":true,"step":0.01,"min":1}]', '[{"key":"total_cost","label":"Total cost","type":"number","required":true,"step":0.01,"min":0},{"key":"units","label":"Units","type":"number","required":true,"step":0.01,"min":1}]', 'احسب سعر الوحدة', 'Calculate unit price', 170, false),
  ('business-tools', 'discount-calculator', 'حاسبة الخصم', 'Discount Calculator', 'احسب السعر النهائي بعد الخصم.', 'Calculate final price after discount.', 'price - (price * discount_rate / 100)', '[{"key":"price","label":"السعر","type":"number","required":true,"step":0.01,"min":0},{"key":"discount_rate","label":"نسبة الخصم","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"price","label":"Price","type":"number","required":true,"step":0.01,"min":0},{"key":"discount_rate","label":"Discount rate","type":"number","required":true,"step":0.01,"min":0}]', 'احسب السعر بعد الخصم', 'Calculate discounted price', 180, true),
  ('marketing-tools', 'roas-calculator', 'حاسبة العائد الإعلاني', 'ROAS Calculator', 'احسب العائد على الإنفاق الإعلاني.', 'Calculate return on ad spend.', 'revenue / ad_spend', '[{"key":"revenue","label":"الإيراد من الإعلانات","type":"number","required":true,"step":0.01,"min":0},{"key":"ad_spend","label":"الإنفاق الإعلاني","type":"number","required":true,"step":0.01,"min":0.01}]', '[{"key":"revenue","label":"Ad revenue","type":"number","required":true,"step":0.01,"min":0},{"key":"ad_spend","label":"Ad spend","type":"number","required":true,"step":0.01,"min":0.01}]', 'احسب ROAS', 'Calculate ROAS', 210, true),
  ('marketing-tools', 'ctr-calculator', 'حاسبة معدل النقر', 'CTR Calculator', 'احسب معدل النقر إلى الظهور.', 'Calculate click-through rate.', 'clicks / impressions * 100', '[{"key":"clicks","label":"النقرات","type":"number","required":true,"step":0.01,"min":0},{"key":"impressions","label":"مرات الظهور","type":"number","required":true,"step":0.01,"min":1}]', '[{"key":"clicks","label":"Clicks","type":"number","required":true,"step":0.01,"min":0},{"key":"impressions","label":"Impressions","type":"number","required":true,"step":0.01,"min":1}]', 'احسب CTR', 'Calculate CTR', 220, true),
  ('marketing-tools', 'cpc-calculator', 'حاسبة تكلفة النقرة', 'CPC Calculator', 'احسب متوسط تكلفة النقرة.', 'Calculate average cost per click.', 'ad_spend / clicks', '[{"key":"ad_spend","label":"الإنفاق الإعلاني","type":"number","required":true,"step":0.01,"min":0},{"key":"clicks","label":"النقرات","type":"number","required":true,"step":0.01,"min":1}]', '[{"key":"ad_spend","label":"Ad spend","type":"number","required":true,"step":0.01,"min":0},{"key":"clicks","label":"Clicks","type":"number","required":true,"step":0.01,"min":1}]', 'احسب CPC', 'Calculate CPC', 230, false),
  ('marketing-tools', 'cpm-calculator', 'حاسبة تكلفة الألف ظهور', 'CPM Calculator', 'احسب تكلفة كل ألف ظهور.', 'Calculate cost per thousand impressions.', 'ad_spend / impressions * 1000', '[{"key":"ad_spend","label":"الإنفاق الإعلاني","type":"number","required":true,"step":0.01,"min":0},{"key":"impressions","label":"مرات الظهور","type":"number","required":true,"step":0.01,"min":1}]', '[{"key":"ad_spend","label":"Ad spend","type":"number","required":true,"step":0.01,"min":0},{"key":"impressions","label":"Impressions","type":"number","required":true,"step":0.01,"min":1}]', 'احسب CPM', 'Calculate CPM', 240, false),
  ('marketing-tools', 'cpa-calculator', 'حاسبة تكلفة الإجراء', 'CPA Calculator', 'احسب تكلفة كل تحويل أو إجراء.', 'Calculate cost per acquisition or action.', 'ad_spend / conversions', '[{"key":"ad_spend","label":"الإنفاق الإعلاني","type":"number","required":true,"step":0.01,"min":0},{"key":"conversions","label":"التحويلات","type":"number","required":true,"step":0.01,"min":1}]', '[{"key":"ad_spend","label":"Ad spend","type":"number","required":true,"step":0.01,"min":0},{"key":"conversions","label":"Conversions","type":"number","required":true,"step":0.01,"min":1}]', 'احسب CPA', 'Calculate CPA', 250, false),
  ('marketing-tools', 'conversion-rate-calculator', 'حاسبة معدل التحويل', 'Conversion Rate Calculator', 'احسب نسبة التحويل من الزوار.', 'Calculate conversion rate from visitors.', 'conversions / visitors * 100', '[{"key":"conversions","label":"التحويلات","type":"number","required":true,"step":0.01,"min":0},{"key":"visitors","label":"الزوار","type":"number","required":true,"step":0.01,"min":1}]', '[{"key":"conversions","label":"Conversions","type":"number","required":true,"step":0.01,"min":0},{"key":"visitors","label":"Visitors","type":"number","required":true,"step":0.01,"min":1}]', 'احسب معدل التحويل', 'Calculate conversion rate', 260, true),
  ('marketing-tools', 'aov-calculator', 'حاسبة متوسط قيمة الطلب', 'AOV Calculator', 'احسب متوسط قيمة الطلب.', 'Calculate average order value.', 'revenue / orders', '[{"key":"revenue","label":"الإيراد","type":"number","required":true,"step":0.01,"min":0},{"key":"orders","label":"عدد الطلبات","type":"number","required":true,"step":0.01,"min":1}]', '[{"key":"revenue","label":"Revenue","type":"number","required":true,"step":0.01,"min":0},{"key":"orders","label":"Orders","type":"number","required":true,"step":0.01,"min":1}]', 'احسب AOV', 'Calculate AOV', 270, false),
  ('marketing-tools', 'customer-acquisition-cost-calculator', 'حاسبة تكلفة اكتساب العميل', 'Customer Acquisition Cost Calculator', 'احسب متوسط تكلفة اكتساب عميل جديد.', 'Calculate average customer acquisition cost.', 'marketing_cost / new_customers', '[{"key":"marketing_cost","label":"تكلفة التسويق","type":"number","required":true,"step":0.01,"min":0},{"key":"new_customers","label":"العملاء الجدد","type":"number","required":true,"step":0.01,"min":1}]', '[{"key":"marketing_cost","label":"Marketing cost","type":"number","required":true,"step":0.01,"min":0},{"key":"new_customers","label":"New customers","type":"number","required":true,"step":0.01,"min":1}]', 'احسب تكلفة العميل', 'Calculate CAC', 280, false),
  ('finance-tools', 'vat-calculator', 'حاسبة ضريبة القيمة المضافة', 'VAT Calculator', 'احسب قيمة الضريبة من السعر ونسبة الضريبة.', 'Calculate VAT amount from price and tax rate.', 'price * vat_rate / 100', '[{"key":"price","label":"السعر","type":"number","required":true,"step":0.01,"min":0},{"key":"vat_rate","label":"نسبة الضريبة","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"price","label":"Price","type":"number","required":true,"step":0.01,"min":0},{"key":"vat_rate","label":"VAT rate","type":"number","required":true,"step":0.01,"min":0}]', 'احسب الضريبة', 'Calculate VAT', 310, true),
  ('finance-tools', 'pre-tax-price-calculator', 'حاسبة السعر قبل الضريبة', 'Pre-tax Price Calculator', 'استخرج السعر قبل الضريبة من السعر شامل الضريبة.', 'Calculate pre-tax price from a tax-inclusive price.', 'price / (1 + vat_rate / 100)', '[{"key":"price","label":"السعر شامل الضريبة","type":"number","required":true,"step":0.01,"min":0},{"key":"vat_rate","label":"نسبة الضريبة","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"price","label":"Tax-inclusive price","type":"number","required":true,"step":0.01,"min":0},{"key":"vat_rate","label":"VAT rate","type":"number","required":true,"step":0.01,"min":0}]', 'احسب السعر قبل الضريبة', 'Calculate pre-tax price', 320, false),
  ('finance-tools', 'simple-interest-calculator', 'حاسبة الفائدة البسيطة', 'Simple Interest Calculator', 'احسب قيمة الفائدة البسيطة.', 'Calculate simple interest amount.', 'principal * rate * years / 100', '[{"key":"principal","label":"المبلغ الأساسي","type":"number","required":true,"step":0.01,"min":0},{"key":"rate","label":"نسبة الفائدة السنوية","type":"number","required":true,"step":0.01,"min":0},{"key":"years","label":"عدد السنوات","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"principal","label":"Principal","type":"number","required":true,"step":0.01,"min":0},{"key":"rate","label":"Annual interest rate","type":"number","required":true,"step":0.01,"min":0},{"key":"years","label":"Years","type":"number","required":true,"step":0.01,"min":0}]', 'احسب الفائدة', 'Calculate interest', 330, false),
  ('finance-tools', 'compound-interest-calculator', 'حاسبة الفائدة المركبة', 'Compound Interest Calculator', 'احسب القيمة النهائية بالفائدة المركبة السنوية.', 'Calculate final value with annual compound interest.', 'principal * (1 + rate / 100) ^ years', '[{"key":"principal","label":"المبلغ الأساسي","type":"number","required":true,"step":0.01,"min":0},{"key":"rate","label":"نسبة الفائدة السنوية","type":"number","required":true,"step":0.01,"min":0},{"key":"years","label":"عدد السنوات","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"principal","label":"Principal","type":"number","required":true,"step":0.01,"min":0},{"key":"rate","label":"Annual interest rate","type":"number","required":true,"step":0.01,"min":0},{"key":"years","label":"Years","type":"number","required":true,"step":0.01,"min":0}]', 'احسب القيمة النهائية', 'Calculate final value', 340, true),
  ('finance-tools', 'salary-increase-calculator', 'حاسبة زيادة الراتب', 'Salary Increase Calculator', 'احسب نسبة الزيادة بين الراتب القديم والجديد.', 'Calculate salary increase percentage.', '((new_salary - old_salary) / old_salary) * 100', '[{"key":"old_salary","label":"الراتب القديم","type":"number","required":true,"step":0.01,"min":0.01},{"key":"new_salary","label":"الراتب الجديد","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"old_salary","label":"Old salary","type":"number","required":true,"step":0.01,"min":0.01},{"key":"new_salary","label":"New salary","type":"number","required":true,"step":0.01,"min":0}]', 'احسب نسبة الزيادة', 'Calculate increase', 350, false),
  ('finance-tools', 'weighted-score-calculator', 'حاسبة النسبة الموزونة', 'Weighted Score Calculator', 'احسب نتيجة موزونة من ثلاث درجات وأوزان.', 'Calculate a weighted score from three scores and weights.', '(score_one * weight_one + score_two * weight_two + score_three * weight_three) / 100', '[{"key":"score_one","label":"الدرجة الأولى","type":"number","required":true,"step":0.01,"min":0},{"key":"weight_one","label":"وزن الدرجة الأولى","type":"number","required":true,"step":0.01,"min":0},{"key":"score_two","label":"الدرجة الثانية","type":"number","required":true,"step":0.01,"min":0},{"key":"weight_two","label":"وزن الدرجة الثانية","type":"number","required":true,"step":0.01,"min":0},{"key":"score_three","label":"الدرجة الثالثة","type":"number","required":true,"step":0.01,"min":0},{"key":"weight_three","label":"وزن الدرجة الثالثة","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"score_one","label":"First score","type":"number","required":true,"step":0.01,"min":0},{"key":"weight_one","label":"First weight","type":"number","required":true,"step":0.01,"min":0},{"key":"score_two","label":"Second score","type":"number","required":true,"step":0.01,"min":0},{"key":"weight_two","label":"Second weight","type":"number","required":true,"step":0.01,"min":0},{"key":"score_three","label":"Third score","type":"number","required":true,"step":0.01,"min":0},{"key":"weight_three","label":"Third weight","type":"number","required":true,"step":0.01,"min":0}]', 'احسب النسبة الموزونة', 'Calculate weighted score', 360, false),
  ('finance-tools', 'average-calculator', 'حاسبة المتوسط', 'Average Calculator', 'احسب متوسط ثلاث قيم.', 'Calculate the average of three values.', '(value_one + value_two + value_three) / 3', '[{"key":"value_one","label":"القيمة الأولى","type":"number","required":true,"step":0.01},{"key":"value_two","label":"القيمة الثانية","type":"number","required":true,"step":0.01},{"key":"value_three","label":"القيمة الثالثة","type":"number","required":true,"step":0.01}]', '[{"key":"value_one","label":"First value","type":"number","required":true,"step":0.01},{"key":"value_two","label":"Second value","type":"number","required":true,"step":0.01},{"key":"value_three","label":"Third value","type":"number","required":true,"step":0.01}]', 'احسب المتوسط', 'Calculate average', 370, false),
  ('finance-tools', 'tip-calculator', 'حاسبة الإكرامية', 'Tip Calculator', 'احسب قيمة الإكرامية من الفاتورة والنسبة.', 'Calculate tip amount from bill and tip rate.', 'bill * tip_rate / 100', '[{"key":"bill","label":"قيمة الفاتورة","type":"number","required":true,"step":0.01,"min":0},{"key":"tip_rate","label":"نسبة الإكرامية","type":"number","required":true,"step":0.01,"min":0}]', '[{"key":"bill","label":"Bill amount","type":"number","required":true,"step":0.01,"min":0},{"key":"tip_rate","label":"Tip rate","type":"number","required":true,"step":0.01,"min":0}]', 'احسب الإكرامية', 'Calculate tip', 380, false);

insert into public.tools(
  slug,
  title_ar,
  title_en,
  short_description,
  category_id,
  engine_type,
  input_schema,
  output_schema,
  runtime_config,
  pricing_mode,
  fixed_points,
  minimum_points,
  requires_auth,
  is_featured,
  is_active,
  sort_order,
  seo_title,
  seo_description
)
select
  seed.slug,
  seed.title_ar,
  seed.title_en,
  seed.description_ar,
  category.id,
  'formula',
  jsonb_build_object(
    'submitLabel',
    seed.submit_ar,
    'fields',
    seed.input_fields
  ),
  jsonb_build_object(
    'type',
    'number',
    'format',
    'auto'
  ),
  jsonb_build_object(
    'expression',
    seed.expression
  ),
  'free',
  0,
  0,
  false,
  seed.is_featured,
  true,
  seed.sort_order,
  seed.title_ar,
  seed.description_ar
from v5_formula_tool_seed seed
join public.categories category
  on category.slug = seed.category_slug
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
  tool_id,
  locale_id,
  title,
  short_description,
  seo_title,
  seo_description,
  prompt_template_override
)
select
  tool.id,
  locale.id,
  case locale.code
    when 'ar' then seed.title_ar
    else seed.title_en
  end,
  case locale.code
    when 'ar' then seed.description_ar
    else seed.description_en
  end,
  case locale.code
    when 'ar' then seed.title_ar
    else seed.title_en
  end,
  case locale.code
    when 'ar' then seed.description_ar
    else seed.description_en
  end,
  null
from v5_formula_tool_seed seed
join public.tools tool
  on tool.slug = seed.slug
join public.locales locale
  on locale.code in ('ar', 'en')
on conflict (tool_id, locale_id) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  prompt_template_override =
    excluded.prompt_template_override,
  updated_at = now();

insert into public.tool_field_translations(
  tool_id,
  locale_id,
  field_key,
  label,
  placeholder,
  help_text,
  options
)
select
  tool.id,
  locale.id,
  field.value ->> 'key',
  field.value ->> 'label',
  nullif(
    field.value ->> 'placeholder',
    ''
  ),
  nullif(
    field.value ->> 'helpText',
    ''
  ),
  field.value -> 'options'
from v5_formula_tool_seed seed
join public.tools tool
  on tool.slug = seed.slug
join public.locales locale
  on locale.code in ('ar', 'en')
cross join lateral jsonb_array_elements(
  case
    when locale.code = 'ar'
      then seed.input_fields
    else seed.english_fields
  end
) field(value)
on conflict (
  tool_id,
  locale_id,
  field_key
) do update set
  label = excluded.label,
  placeholder = excluded.placeholder,
  help_text = excluded.help_text,
  options = excluded.options,
  updated_at = now();

insert into public.tool_field_translations(
  tool_id,
  locale_id,
  field_key,
  label,
  placeholder,
  help_text,
  options
)
select
  tool.id,
  locale.id,
  '__submit__',
  case locale.code
    when 'ar' then seed.submit_ar
    else seed.submit_en
  end,
  null,
  null,
  null
from v5_formula_tool_seed seed
join public.tools tool
  on tool.slug = seed.slug
join public.locales locale
  on locale.code in ('ar', 'en')
on conflict (
  tool_id,
  locale_id,
  field_key
) do update set
  label = excluded.label,
  placeholder = null,
  help_text = null,
  options = null,
  updated_at = now();

do $$
declare
  v_seed_count integer;
  v_tool_count integer;
  v_translation_count integer;
begin
  select count(*)
  into v_seed_count
  from v5_formula_tool_seed;

  if v_seed_count <> 24 then
    raise exception
      'V5_TOOL_SEED_COUNT_MISMATCH:%',
      v_seed_count;
  end if;

  select count(*)
  into v_tool_count
  from public.tools tool
  join v5_formula_tool_seed seed
    on seed.slug = tool.slug
  where tool.engine_type = 'formula'
    and tool.pricing_mode = 'free'
    and tool.is_active = true;

  if v_tool_count <> 24 then
    raise exception
      'V5_ACTIVE_FORMULA_TOOL_COUNT_MISMATCH:%',
      v_tool_count;
  end if;

  select count(*)
  into v_translation_count
  from public.tool_translations translation
  join public.tools tool
    on tool.id = translation.tool_id
  join v5_formula_tool_seed seed
    on seed.slug = tool.slug
  join public.locales locale
    on locale.id = translation.locale_id
  where locale.code in ('ar', 'en');

  if v_translation_count <> 48 then
    raise exception
      'V5_TOOL_TRANSLATION_COUNT_MISMATCH:%',
      v_translation_count;
  end if;

  if exists(
    select 1
    from v5_formula_tool_seed seed
    join public.tools tool
      on tool.slug = seed.slug
    join public.locales locale
      on locale.code in ('ar', 'en')
    cross join lateral jsonb_array_elements(
      case
        when locale.code = 'ar'
          then seed.input_fields
        else seed.english_fields
      end
    ) field(value)
    left join public.tool_field_translations translation
      on translation.tool_id = tool.id
      and translation.locale_id = locale.id
      and translation.field_key =
        field.value ->> 'key'
    where translation.tool_id is null
  ) then
    raise exception
      'V5_TOOL_FIELD_TRANSLATION_MISSING';
  end if;
end;
$$;
