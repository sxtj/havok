-- ============================================================
-- HAVOK Seed Data — Example Products
-- Run AFTER schema.sql
-- ============================================================

INSERT INTO products (name, slug, description, price, compare_at_price, category, stock_quantity, is_active, nutrition_info)
VALUES

-- 1. Whey Protein
(
  'HAVOK Whey Protein',
  'havok-whey-protein',
  '25g of ultra-premium whey protein per serving. Cold-filtered for maximum bioavailability. No artificial fillers — just pure protein engineered for serious athletes who demand results.',
  49.99,
  59.99,
  'protein',
  150,
  TRUE,
  '{
    "servingSize": "1 scoop (33g)",
    "servingsPerContainer": 30,
    "calories": 130,
    "protein": "25g",
    "carbohydrates": "4g",
    "sugar": "2g",
    "fat": "2.5g",
    "sodium": "150mg",
    "cholesterol": "55mg"
  }'::jsonb
),

-- 2. Pre Workout
(
  'HAVOK Pre Workout',
  'havok-pre-workout',
  'Explosive energy. Laser focus. Skin-splitting pumps. Our pre-workout formula is clinically dosed with no proprietary blends. Every ingredient, every dose, fully disclosed. Built for those who train at maximum intensity.',
  44.99,
  NULL,
  'pre-workout',
  200,
  TRUE,
  '{
    "servingSize": "1 scoop (14g)",
    "servingsPerContainer": 30,
    "calories": 15,
    "protein": "0g",
    "carbohydrates": "2g",
    "sugar": "0g",
    "fat": "0g",
    "sodium": "180mg",
    "caffeine": "300mg",
    "betaAlanine": "3.2g",
    "citrullineMalate": "6g"
  }'::jsonb
),

-- 3. Creatine
(
  'HAVOK Creatine Monohydrate',
  'havok-creatine',
  '100% pure pharmaceutical-grade creatine monohydrate. No additives. No fluff. Just the most well-researched performance supplement on the planet. Increase strength, power output, and lean muscle mass.',
  29.99,
  NULL,
  'creatine',
  300,
  TRUE,
  '{
    "servingSize": "1 teaspoon (5g)",
    "servingsPerContainer": 60,
    "calories": 0,
    "protein": "0g",
    "carbohydrates": "0g",
    "fat": "0g",
    "sodium": "0mg",
    "creatineMonohydrate": "5g"
  }'::jsonb
),

-- 4. Electrolytes
(
  'HAVOK Electrolytes',
  'havok-electrolytes',
  'Full-spectrum electrolyte formula for peak hydration and rapid recovery. Replenish what you lose. Stay dominant from your first set to your last. Zero sugar, zero calories, maximum performance.',
  34.99,
  39.99,
  'electrolytes',
  250,
  TRUE,
  '{
    "servingSize": "1 scoop (6g)",
    "servingsPerContainer": 40,
    "calories": 5,
    "protein": "0g",
    "carbohydrates": "1g",
    "sugar": "0g",
    "fat": "0g",
    "sodium": "400mg",
    "potassium": "200mg",
    "magnesium": "100mg",
    "calcium": "50mg"
  }'::jsonb
);
