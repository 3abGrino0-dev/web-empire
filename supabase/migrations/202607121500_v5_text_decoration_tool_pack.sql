-- Web Empire V5: complete deterministic text and decoration tool pack
-- Adds 23 free tools with Arabic and English localization.

insert into public.categories(
  slug, name_ar, name_en, description, icon, style_key, sort_order, is_active
)
values
  ('decoration-tools', 'أدوات الزخرفة والرموز', 'Decoration & Symbols', 'زخرفة الأسماء والنصوص والرموز الجاهزة للنسخ.', 'sparkles', 'violet', 70, true),
  ('text-tools', 'أدوات النصوص', 'Text Tools', 'تنظيف النصوص وتحويلها وترتيبها بسرعة.', 'text', 'violet', 80, true)
on conflict (slug) do update set
  name_ar = excluded.name_ar,
  name_en = excluded.name_en,
  description = excluded.description,
  icon = excluded.icon,
  style_key = excluded.style_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.category_translations(
  category_id, locale_id, name, description
)
select category.id, locale.id, seed.name, seed.description
from (
  values
    ('decoration-tools', 'ar', 'أدوات الزخرفة والرموز', 'زخرفة الأسماء والنصوص والرموز الجاهزة للنسخ.'),
    ('decoration-tools', 'en', 'Decoration & Symbols', 'Decorate names, text, and copy-ready symbols.'),
    ('text-tools', 'ar', 'أدوات النصوص', 'تنظيف النصوص وتحويلها وترتيبها بسرعة.'),
    ('text-tools', 'en', 'Text Tools', 'Clean, transform, and organize text quickly.')
) as seed(category_slug, locale_code, name, description)
join public.categories category on category.slug = seed.category_slug
join public.locales locale on locale.code = seed.locale_code
on conflict (category_id, locale_id) do update set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

create temporary table v5_text_tool_seed (
  category_slug text not null,
  slug text not null,
  title_ar text not null,
  title_en text not null,
  description_ar text not null,
  description_en text not null,
  operations jsonb not null,
  input_fields jsonb not null,
  english_fields jsonb not null,
  submit_ar text not null,
  submit_en text not null,
  sort_order integer not null,
  is_featured boolean not null
) on commit drop;

insert into v5_text_tool_seed(
  category_slug, slug, title_ar, title_en, description_ar, description_en,
  operations, input_fields, english_fields, submit_ar, submit_en, sort_order, is_featured
)
values
  ('decoration-tools', 'text-decoration', 'زخرفة النصوص والأسماء', 'Text & Name Decorator', 'زخرف النصوص والأسماء بأنماط جاهزة قابلة للنسخ.', 'Decorate text and names with copy-ready styles.', '[{"type":"trim"},{"type":"decorate","style_key":"style"}]'::jsonb, '[{"key":"text","label":"النص أو الاسم","type":"text","required":true,"placeholder":"اكتب النص...","maxLength":500},{"key":"style","label":"نمط الزخرفة","type":"select","required":true,"options":[{"value":"plain","label":"بدون زخرفة"},{"value":"crown","label":"تاج"},{"value":"stars","label":"نجوم"},{"value":"sparkles","label":"لمعان"},{"value":"hearts","label":"قلوب"},{"value":"flowers","label":"زخرفة عربية"},{"value":"brackets","label":"أقواس يابانية"},{"value":"double_brackets","label":"أقواس مزدوجة"},{"value":"quotes","label":"اقتباس مزخرف"},{"value":"waves","label":"تموّجات"},{"value":"arrows","label":"أسهم"},{"value":"dots","label":"فواصل نقطية"},{"value":"underline","label":"تحته خط"},{"value":"strike","label":"يتوسطه خط"},{"value":"bold","label":"عريض إنجليزي"},{"value":"monospace","label":"إنجليزي أحادي"},{"value":"fullwidth","label":"إنجليزي عريض المسافات"},{"value":"circled","label":"إنجليزي داخل دوائر"}],"defaultValue":"crown"}]'::jsonb, '[{"key":"text","label":"Text or name","type":"text","required":true,"placeholder":"Enter text...","maxLength":500},{"key":"style","label":"Decoration style","type":"select","required":true,"options":[{"value":"plain","label":"Plain"},{"value":"crown","label":"Crown"},{"value":"stars","label":"Stars"},{"value":"sparkles","label":"Sparkles"},{"value":"hearts","label":"Hearts"},{"value":"flowers","label":"Ornamental"},{"value":"brackets","label":"Japanese brackets"},{"value":"double_brackets","label":"Double brackets"},{"value":"quotes","label":"Fancy quotes"},{"value":"waves","label":"Waves"},{"value":"arrows","label":"Arrows"},{"value":"dots","label":"Dotted"},{"value":"underline","label":"Underline"},{"value":"strike","label":"Strike"},{"value":"bold","label":"English bold"},{"value":"monospace","label":"English monospace"},{"value":"fullwidth","label":"Fullwidth"},{"value":"circled","label":"Circled"}],"defaultValue":"crown"}]'::jsonb, 'زخرف النص', 'Decorate text', 410, true),
  ('decoration-tools', 'arabic-text-decoration', 'زخرفة الأسماء العربية', 'Arabic Name Decorator', 'زخرفة أسماء ونصوص عربية بدون تغيير الحروف.', 'Decorate Arabic names without changing the original letters.', '[{"type":"trim"},{"type":"decorate","style_key":"style"}]'::jsonb, '[{"key":"text","label":"النص أو الاسم","type":"text","required":true,"placeholder":"اكتب النص...","maxLength":500},{"key":"style","label":"النمط","type":"select","required":true,"options":[{"value":"plain","label":"بدون زخرفة"},{"value":"crown","label":"تاج"},{"value":"stars","label":"نجوم"},{"value":"sparkles","label":"لمعان"},{"value":"hearts","label":"قلوب"},{"value":"flowers","label":"زخرفة عربية"},{"value":"brackets","label":"أقواس يابانية"},{"value":"double_brackets","label":"أقواس مزدوجة"},{"value":"quotes","label":"اقتباس مزخرف"},{"value":"waves","label":"تموّجات"},{"value":"arrows","label":"أسهم"},{"value":"dots","label":"فواصل نقطية"},{"value":"underline","label":"تحته خط"},{"value":"strike","label":"يتوسطه خط"}],"defaultValue":"flowers"}]'::jsonb, '[{"key":"text","label":"Text or name","type":"text","required":true,"placeholder":"Enter text...","maxLength":500},{"key":"style","label":"Style","type":"select","required":true,"options":[{"value":"plain","label":"Plain"},{"value":"crown","label":"Crown"},{"value":"stars","label":"Stars"},{"value":"sparkles","label":"Sparkles"},{"value":"hearts","label":"Hearts"},{"value":"flowers","label":"Ornamental"},{"value":"brackets","label":"Japanese brackets"},{"value":"double_brackets","label":"Double brackets"},{"value":"quotes","label":"Fancy quotes"},{"value":"waves","label":"Waves"},{"value":"arrows","label":"Arrows"},{"value":"dots","label":"Dotted"},{"value":"underline","label":"Underline"},{"value":"strike","label":"Strike"}],"defaultValue":"flowers"}]'::jsonb, 'زخرف الاسم', 'Decorate name', 420, true),
  ('decoration-tools', 'english-name-decoration', 'زخرفة الأسماء الإنجليزية', 'English Name Decorator', 'حوّل الاسم الإنجليزي إلى أشكال Unicode مزخرفة.', 'Turn English names into decorative Unicode styles.', '[{"type":"trim"},{"type":"decorate","style_key":"style"}]'::jsonb, '[{"key":"text","label":"النص أو الاسم","type":"text","required":true,"placeholder":"اكتب النص...","maxLength":500},{"key":"style","label":"النمط","type":"select","required":true,"options":[{"value":"plain","label":"بدون زخرفة"},{"value":"crown","label":"تاج"},{"value":"stars","label":"نجوم"},{"value":"sparkles","label":"لمعان"},{"value":"hearts","label":"قلوب"},{"value":"brackets","label":"أقواس يابانية"},{"value":"double_brackets","label":"أقواس مزدوجة"},{"value":"quotes","label":"اقتباس مزخرف"},{"value":"underline","label":"تحته خط"},{"value":"strike","label":"يتوسطه خط"},{"value":"bold","label":"عريض إنجليزي"},{"value":"monospace","label":"إنجليزي أحادي"},{"value":"fullwidth","label":"إنجليزي عريض المسافات"},{"value":"circled","label":"إنجليزي داخل دوائر"}],"defaultValue":"bold"}]'::jsonb, '[{"key":"text","label":"Text or name","type":"text","required":true,"placeholder":"Enter text...","maxLength":500},{"key":"style","label":"Style","type":"select","required":true,"options":[{"value":"plain","label":"Plain"},{"value":"crown","label":"Crown"},{"value":"stars","label":"Stars"},{"value":"sparkles","label":"Sparkles"},{"value":"hearts","label":"Hearts"},{"value":"brackets","label":"Japanese brackets"},{"value":"double_brackets","label":"Double brackets"},{"value":"quotes","label":"Fancy quotes"},{"value":"underline","label":"Underline"},{"value":"strike","label":"Strike"},{"value":"bold","label":"English bold"},{"value":"monospace","label":"English monospace"},{"value":"fullwidth","label":"Fullwidth"},{"value":"circled","label":"Circled"}],"defaultValue":"bold"}]'::jsonb, 'زخرف الاسم', 'Decorate name', 430, true),
  ('decoration-tools', 'username-decoration', 'زخرفة اسم المستخدم', 'Username Decorator', 'جهز اسم مستخدم مزخرفًا للحسابات والألعاب.', 'Create a decorated username for profiles and games.', '[{"type":"trim"},{"type":"collapse_whitespace"},{"type":"decorate","style_key":"style"}]'::jsonb, '[{"key":"text","label":"اسم المستخدم","type":"text","required":true,"placeholder":"اكتب اسم المستخدم","maxLength":80},{"key":"style","label":"النمط","type":"select","required":true,"options":[{"value":"plain","label":"بدون زخرفة"},{"value":"crown","label":"تاج"},{"value":"stars","label":"نجوم"},{"value":"sparkles","label":"لمعان"},{"value":"hearts","label":"قلوب"},{"value":"flowers","label":"زخرفة عربية"},{"value":"brackets","label":"أقواس يابانية"},{"value":"double_brackets","label":"أقواس مزدوجة"},{"value":"quotes","label":"اقتباس مزخرف"},{"value":"waves","label":"تموّجات"},{"value":"arrows","label":"أسهم"},{"value":"dots","label":"فواصل نقطية"},{"value":"underline","label":"تحته خط"},{"value":"strike","label":"يتوسطه خط"},{"value":"bold","label":"عريض إنجليزي"},{"value":"monospace","label":"إنجليزي أحادي"},{"value":"fullwidth","label":"إنجليزي عريض المسافات"},{"value":"circled","label":"إنجليزي داخل دوائر"}],"defaultValue":"stars"}]'::jsonb, '[{"key":"text","label":"Username","type":"text","required":true,"placeholder":"Enter username","maxLength":80},{"key":"style","label":"Style","type":"select","required":true,"options":[{"value":"plain","label":"Plain"},{"value":"crown","label":"Crown"},{"value":"stars","label":"Stars"},{"value":"sparkles","label":"Sparkles"},{"value":"hearts","label":"Hearts"},{"value":"flowers","label":"Ornamental"},{"value":"brackets","label":"Japanese brackets"},{"value":"double_brackets","label":"Double brackets"},{"value":"quotes","label":"Fancy quotes"},{"value":"waves","label":"Waves"},{"value":"arrows","label":"Arrows"},{"value":"dots","label":"Dotted"},{"value":"underline","label":"Underline"},{"value":"strike","label":"Strike"},{"value":"bold","label":"English bold"},{"value":"monospace","label":"English monospace"},{"value":"fullwidth","label":"Fullwidth"},{"value":"circled","label":"Circled"}],"defaultValue":"stars"}]'::jsonb, 'زخرف اسم المستخدم', 'Decorate username', 440, false),
  ('decoration-tools', 'emoji-text-decoration', 'زخرفة النص بالإيموجي', 'Emoji Text Decorator', 'أضف رموزًا وإيموجي متناسقة حول النص.', 'Add balanced symbols and emoji around text.', '[{"type":"trim"},{"type":"decorate","style_key":"style"}]'::jsonb, '[{"key":"text","label":"النص أو الاسم","type":"text","required":true,"placeholder":"اكتب النص...","maxLength":500},{"key":"style","label":"الزخرفة","type":"select","required":true,"options":[{"value":"sparkles","label":"لمعان ✨"},{"value":"crown","label":"تاج ♛"},{"value":"hearts","label":"قلوب ♡"},{"value":"stars","label":"نجوم ✦"},{"value":"arrows","label":"أسهم ➤"},{"value":"flowers","label":"زخرفة ༺"}],"defaultValue":"sparkles"}]'::jsonb, '[{"key":"text","label":"Text or name","type":"text","required":true,"placeholder":"Enter text...","maxLength":500},{"key":"style","label":"Decoration","type":"select","required":true,"options":[{"value":"sparkles","label":"Sparkles ✨"},{"value":"crown","label":"Crown ♛"},{"value":"hearts","label":"Hearts ♡"},{"value":"stars","label":"Stars ✦"},{"value":"arrows","label":"Arrows ➤"},{"value":"flowers","label":"Ornamental ༺"}],"defaultValue":"sparkles"}]'::jsonb, 'أضف الزخرفة', 'Add decoration', 450, false),
  ('decoration-tools', 'quote-wrapper', 'إطارات واقتباسات مزخرفة', 'Fancy Quote Wrapper', 'ضع النص داخل إطار أو اقتباس مزخرف جاهز.', 'Wrap text in a ready-to-copy ornamental frame.', '[{"type":"trim"},{"type":"decorate","style_key":"style"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000},{"key":"style","label":"نوع الإطار","type":"select","required":true,"options":[{"value":"quotes","label":"اقتباس مزخرف"},{"value":"brackets","label":"『أقواس』"},{"value":"double_brackets","label":"【أقواس مزدوجة】"},{"value":"flowers","label":"༺ زخرفة ༻"}],"defaultValue":"quotes"}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000},{"key":"style","label":"Frame style","type":"select","required":true,"options":[{"value":"quotes","label":"Fancy quotes"},{"value":"brackets","label":"『Brackets』"},{"value":"double_brackets","label":"【Double brackets】"},{"value":"flowers","label":"༺ Ornamental ༻"}],"defaultValue":"quotes"}]'::jsonb, 'أنشئ الإطار', 'Create frame', 460, false),
  ('decoration-tools', 'fancy-separator-generator', 'مولد الفواصل والرموز', 'Fancy Separator Generator', 'كرر رمزًا أو فاصلة بعدد تختاره لصناعة فاصل مزخرف.', 'Repeat a symbol to create a decorative separator.', '[{"type":"trim"},{"type":"repeat","count_key":"count","separator_key":"separator"}]'::jsonb, '[{"key":"text","label":"الرمز أو الشكل","type":"text","required":true,"placeholder":"مثال: ✦","maxLength":20},{"key":"count","label":"عدد التكرار","type":"number","required":true,"min":1,"max":100,"step":1,"defaultValue":12},{"key":"separator","label":"المسافة بين الرموز","type":"select","required":true,"options":[{"value":"","label":"بدون مسافة"},{"value":" ","label":"مسافة"},{"value":" · ","label":"نقطة وسطية"}],"defaultValue":" "}]'::jsonb, '[{"key":"text","label":"Symbol","type":"text","required":true,"placeholder":"Example: ✦","maxLength":20},{"key":"count","label":"Repeat count","type":"number","required":true,"min":1,"max":100,"step":1,"defaultValue":12},{"key":"separator","label":"Separator","type":"select","required":true,"options":[{"value":"","label":"No space"},{"value":" ","label":"Space"},{"value":" · ","label":"Middle dot"}],"defaultValue":" "}]'::jsonb, 'أنشئ الفاصل', 'Create separator', 470, false),
  ('text-tools', 'remove-diacritics', 'إزالة التشكيل من النص', 'Remove Arabic Diacritics', 'احذف الحركات والتشكيل مع الحفاظ على الحروف.', 'Remove Arabic diacritics while preserving letters.', '[{"type":"remove_diacritics"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000}]'::jsonb, 'أزل التشكيل', 'Remove diacritics', 510, true),
  ('text-tools', 'normalize-arabic-text', 'تنظيف وتوحيد النص العربي', 'Arabic Text Normalizer', 'وحّد أشكال الهمزات والياء واحذف التشكيل والتطويل.', 'Normalize Arabic letters, diacritics, and tatweel.', '[{"type":"normalize_arabic"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000}]'::jsonb, 'نظف النص', 'Normalize text', 520, true),
  ('text-tools', 'text-case-converter', 'تحويل حالة الأحرف', 'Text Case Converter', 'حوّل النص الإنجليزي إلى أحرف كبيرة أو صغيرة أو عناوين.', 'Convert English text between upper, lower, title, and sentence case.', '[{"type":"trim"},{"type":"case","mode_key":"case_mode"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000},{"key":"case_mode","label":"نوع التحويل","type":"select","required":true,"options":[{"value":"uppercase","label":"أحرف كبيرة"},{"value":"lowercase","label":"أحرف صغيرة"},{"value":"title","label":"حرف كبير لكل كلمة"},{"value":"sentence","label":"تنسيق الجمل"}],"defaultValue":"title"}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000},{"key":"case_mode","label":"Case mode","type":"select","required":true,"options":[{"value":"uppercase","label":"UPPERCASE"},{"value":"lowercase","label":"lowercase"},{"value":"title","label":"Title Case"},{"value":"sentence","label":"Sentence case"}],"defaultValue":"title"}]'::jsonb, 'حوّل النص', 'Convert text', 530, false),
  ('text-tools', 'reverse-text', 'عكس النص والكلمات', 'Reverse Text', 'اعكس ترتيب الأحرف أو الكلمات أو الأسطر.', 'Reverse characters, words, or lines.', '[{"type":"reverse","mode_key":"reverse_mode"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000},{"key":"reverse_mode","label":"نوع العكس","type":"select","required":true,"options":[{"value":"characters","label":"عكس الأحرف"},{"value":"words","label":"عكس الكلمات"},{"value":"lines","label":"عكس الأسطر"}],"defaultValue":"characters"}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000},{"key":"reverse_mode","label":"Reverse mode","type":"select","required":true,"options":[{"value":"characters","label":"Reverse characters"},{"value":"words","label":"Reverse words"},{"value":"lines","label":"Reverse lines"}],"defaultValue":"characters"}]'::jsonb, 'اعكس النص', 'Reverse text', 540, false),
  ('text-tools', 'whitespace-cleaner', 'تنظيف المسافات الزائدة', 'Whitespace Cleaner', 'احذف المسافات المتكررة وحوّلها إلى مسافة واحدة.', 'Remove repeated whitespace and keep one clean space.', '[{"type":"collapse_whitespace"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000}]'::jsonb, 'نظف المسافات', 'Clean whitespace', 550, false),
  ('text-tools', 'punctuation-remover', 'حذف علامات الترقيم والرموز', 'Punctuation Remover', 'احذف علامات الترقيم والرموز من النص بسرعة.', 'Remove punctuation and symbols from text.', '[{"type":"remove_punctuation"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000}]'::jsonb, 'احذف العلامات', 'Remove punctuation', 560, false),
  ('text-tools', 'slug-generator', 'مولد الرابط المختصر Slug', 'Slug Generator', 'حوّل العنوان إلى رابط قصير نظيف مناسب للويب.', 'Convert a title into a clean URL slug.', '[{"type":"trim"},{"type":"slugify"}]'::jsonb, '[{"key":"text","label":"العنوان","type":"text","required":true,"placeholder":"مثال: تصميم متجر إلكتروني","maxLength":500}]'::jsonb, '[{"key":"text","label":"Title","type":"text","required":true,"placeholder":"Example: Online store design","maxLength":500}]'::jsonb, 'أنشئ الرابط', 'Generate slug', 570, true),
  ('text-tools', 'hashtag-generator', 'مولد الهاشتاقات', 'Hashtag Generator', 'حوّل الكلمات والعبارات إلى هاشتاقات مرتبة بدون تكرار.', 'Convert words and phrases into clean unique hashtags.', '[{"type":"hashtags"}]'::jsonb, '[{"key":"text","label":"الكلمات أو العبارات","type":"textarea","required":true,"placeholder":"افصل العبارات بفاصلة أو سطر جديد","maxLength":5000}]'::jsonb, '[{"key":"text","label":"Words or phrases","type":"textarea","required":true,"placeholder":"Separate phrases with commas or new lines","maxLength":5000}]'::jsonb, 'أنشئ الهاشتاقات', 'Generate hashtags', 580, true),
  ('text-tools', 'duplicate-line-remover', 'حذف الأسطر المكررة', 'Duplicate Line Remover', 'احذف الأسطر المكررة مع الحفاظ على أول ظهور.', 'Remove duplicate lines while preserving the first occurrence.', '[{"type":"unique_lines"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000}]'::jsonb, 'احذف التكرار', 'Remove duplicates', 590, false),
  ('text-tools', 'line-sorter', 'ترتيب الأسطر أبجديًا', 'Line Sorter', 'رتب قائمة الأسطر تصاعديًا أو تنازليًا.', 'Sort lines in ascending or descending order.', '[{"type":"sort_lines","direction_key":"direction"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000},{"key":"direction","label":"اتجاه الترتيب","type":"select","required":true,"options":[{"value":"asc","label":"تصاعدي"},{"value":"desc","label":"تنازلي"}],"defaultValue":"asc"}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000},{"key":"direction","label":"Sort direction","type":"select","required":true,"options":[{"value":"asc","label":"Ascending"},{"value":"desc","label":"Descending"}],"defaultValue":"asc"}]'::jsonb, 'رتب الأسطر', 'Sort lines', 600, false),
  ('text-tools', 'prefix-suffix-adder', 'إضافة بادئة ولاحقة', 'Prefix & Suffix Adder', 'أضف نصًا قبل وبعد المحتوى في خطوة واحدة.', 'Add text before and after the content in one step.', '[{"type":"prefix","value_key":"prefix"},{"type":"suffix","value_key":"suffix"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000},{"key":"prefix","label":"البادئة","type":"text","required":false,"placeholder":"مثال: ✦ ","maxLength":100},{"key":"suffix","label":"اللاحقة","type":"text","required":false,"placeholder":"مثال: ✦","maxLength":100}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000},{"key":"prefix","label":"Prefix","type":"text","required":false,"placeholder":"Example: ✦ ","maxLength":100},{"key":"suffix","label":"Suffix","type":"text","required":false,"placeholder":"Example: ✦","maxLength":100}]'::jsonb, 'طبّق الإضافة', 'Apply', 610, false),
  ('text-tools', 'text-repeater', 'مكرر النصوص', 'Text Repeater', 'كرر النص بعدد محدد مع اختيار الفاصل.', 'Repeat text a chosen number of times with a separator.', '[{"type":"repeat","count_key":"count","separator_key":"separator"}]'::jsonb, '[{"key":"text","label":"النص أو الاسم","type":"text","required":true,"placeholder":"اكتب النص...","maxLength":500},{"key":"count","label":"عدد التكرار","type":"number","required":true,"min":1,"max":100,"step":1,"defaultValue":5},{"key":"separator","label":"الفاصل","type":"select","required":true,"options":[{"value":"\n","label":"سطر جديد"},{"value":" ","label":"مسافة"},{"value":" | ","label":"شرطة عمودية"},{"value":" · ","label":"نقطة وسطية"}],"defaultValue":"\n"}]'::jsonb, '[{"key":"text","label":"Text or name","type":"text","required":true,"placeholder":"Enter text...","maxLength":500},{"key":"count","label":"Repeat count","type":"number","required":true,"min":1,"max":100,"step":1,"defaultValue":5},{"key":"separator","label":"Separator","type":"select","required":true,"options":[{"value":"\n","label":"New line"},{"value":" ","label":"Space"},{"value":" | ","label":"Vertical bar"},{"value":" · ","label":"Middle dot"}],"defaultValue":"\n"}]'::jsonb, 'كرر النص', 'Repeat text', 620, false),
  ('text-tools', 'text-counter', 'عداد الكلمات والأحرف', 'Word & Character Counter', 'احسب الكلمات والأحرف والأسطر والأحرف بدون مسافات.', 'Count words, characters, lines, and characters without spaces.', '[{"type":"stats"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000}]'::jsonb, 'احسب النص', 'Count text', 630, true),
  ('text-tools', 'remove-line-breaks', 'إزالة فواصل الأسطر', 'Remove Line Breaks', 'حوّل النص متعدد الأسطر إلى فقرة واحدة نظيفة.', 'Turn multiline text into one clean paragraph.', '[{"type":"collapse_lines"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000}]'::jsonb, 'وحّد الأسطر', 'Join lines', 640, false),
  ('text-tools', 'line-prefix-adder', 'إضافة رمز لكل سطر', 'Line Prefix Adder', 'أضف نقطة أو رقمًا أو رمزًا في بداية كل سطر.', 'Add a bullet, number, or symbol to every line.', '[{"type":"line_prefix","value_key":"prefix"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000},{"key":"prefix","label":"الرمز قبل كل سطر","type":"text","required":true,"placeholder":"مثال: ✓ ","maxLength":30,"defaultValue":"✓ "}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000},{"key":"prefix","label":"Line prefix","type":"text","required":true,"placeholder":"Example: ✓ ","maxLength":30,"defaultValue":"✓ "}]'::jsonb, 'أضف الرمز', 'Add prefix', 650, false),
  ('text-tools', 'find-replace-text', 'بحث واستبدال النص', 'Find & Replace Text', 'استبدل كلمة أو عبارة في كامل النص دفعة واحدة.', 'Replace a word or phrase throughout the text.', '[{"type":"replace","value_key":"find","separator_key":"replacement"}]'::jsonb, '[{"key":"text","label":"النص","type":"textarea","required":true,"placeholder":"أدخل النص هنا...","maxLength":20000},{"key":"find","label":"ابحث عن","type":"text","required":true,"maxLength":500},{"key":"replacement","label":"استبدل بـ","type":"text","required":false,"maxLength":500}]'::jsonb, '[{"key":"text","label":"Text","type":"textarea","required":true,"placeholder":"Enter text here...","maxLength":20000},{"key":"find","label":"Find","type":"text","required":true,"maxLength":500},{"key":"replacement","label":"Replace with","type":"text","required":false,"maxLength":500}]'::jsonb, 'استبدل النص', 'Replace text', 660, false);

insert into public.tools(
  slug, title_ar, title_en, short_description, category_id, engine_type,
  input_schema, output_schema, runtime_config, pricing_mode,
  fixed_points, minimum_points, requires_auth, is_featured, is_active,
  sort_order, seo_title, seo_description
)
select
  seed.slug,
  seed.title_ar,
  seed.title_en,
  seed.description_ar,
  category.id,
  'text_transform',
  jsonb_build_object('submitLabel', seed.submit_ar, 'fields', seed.input_fields),
  jsonb_build_object('type', 'text', 'format', 'plain'),
  jsonb_build_object('input_key', 'text', 'operations', seed.operations),
  'free',
  0,
  0,
  false,
  seed.is_featured,
  true,
  seed.sort_order,
  seed.title_ar,
  seed.description_ar
from v5_text_tool_seed seed
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
  case locale.code when 'ar' then seed.title_ar else seed.title_en end,
  case locale.code when 'ar' then seed.description_ar else seed.description_en end,
  case locale.code when 'ar' then seed.title_ar else seed.title_en end,
  case locale.code when 'ar' then seed.description_ar else seed.description_en end,
  null
from v5_text_tool_seed seed
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
from v5_text_tool_seed seed
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
  case locale.code when 'ar' then seed.submit_ar else seed.submit_en end,
  null,
  null,
  null
from v5_text_tool_seed seed
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
  v_tool_count integer;
  v_translation_count integer;
begin
  select count(*) into v_seed_count from v5_text_tool_seed;
  if v_seed_count <> 23 then
    raise exception 'V5_TEXT_TOOL_SEED_COUNT_MISMATCH:%', v_seed_count;
  end if;

  select count(*) into v_tool_count
  from public.tools tool
  join v5_text_tool_seed seed on seed.slug = tool.slug
  where tool.engine_type = 'text_transform'
    and tool.pricing_mode = 'free'
    and tool.is_active = true;
  if v_tool_count <> 23 then
    raise exception 'V5_ACTIVE_TEXT_TOOL_COUNT_MISMATCH:%', v_tool_count;
  end if;

  select count(*) into v_translation_count
  from public.tool_translations translation
  join public.tools tool on tool.id = translation.tool_id
  join v5_text_tool_seed seed on seed.slug = tool.slug
  join public.locales locale on locale.id = translation.locale_id
  where locale.code in ('ar', 'en');
  if v_translation_count <> 46 then
    raise exception 'V5_TEXT_TRANSLATION_COUNT_MISMATCH:%', v_translation_count;
  end if;
end;
$$;
