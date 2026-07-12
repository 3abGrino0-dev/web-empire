import { evaluateFormula } from "../src/engines/formula.ts";
import {
  normalizeLocalizedNumber,
  parseLocalizedNumber,
} from "../src/lib/tool-number.ts";

interface Case {
  name: string;
  expression: string;
  input: Record<string, number>;
  expected: number;
  tolerance?: number;
}

const cases: Case[] = [
  {
    name: "VAT",
    expression: "price * vat_rate / 100",
    input: { price: 100, vat_rate: 15 },
    expected: 15,
  },
  {
    name: "Price including VAT",
    expression: "price + (price * vat_rate / 100)",
    input: { price: 100, vat_rate: 15 },
    expected: 115,
  },
  {
    name: "Discount",
    expression: "price - (price * discount_rate / 100)",
    input: { price: 200, discount_rate: 25 },
    expected: 150,
  },
  {
    name: "Percentage",
    expression: "part / total * 100",
    input: { part: 50, total: 200 },
    expected: 25,
  },
  {
    name: "BMI",
    expression: "weight / ((height_cm / 100) ^ 2)",
    input: { weight: 70, height_cm: 175 },
    expected: 22.8571428571,
    tolerance: 0.001,
  },
  {
    name: "Celsius to Fahrenheit",
    expression: "(celsius * 9 / 5) + 32",
    input: { celsius: 0 },
    expected: 32,
  },
  {
    name: "Fahrenheit to Celsius",
    expression: "(fahrenheit - 32) * 5 / 9",
    input: { fahrenheit: 32 },
    expected: 0,
  },
  {
    name: "CBM",
    expression: "length * width * height * quantity",
    input: { length: 2, width: 1, height: 1, quantity: 3 },
    expected: 6,
  },
  {
    name: "Hourly wage",
    expression: "monthly_salary / work_days / hours_per_day",
    input: { monthly_salary: 6000, work_days: 30, hours_per_day: 8 },
    expected: 25,
  },
  {
    name: "GPA 4 to percentage",
    expression: "gpa / 4 * 100",
    input: { gpa: 3.2 },
    expected: 80,
  },
];

let failed = 0;

for (const testCase of cases) {
  const actual = evaluateFormula(testCase.expression, testCase.input);
  const tolerance = testCase.tolerance ?? 1e-9;
  const passed = Math.abs(actual - testCase.expected) <= tolerance;

  if (!passed) {
    failed += 1;
    console.error(
      `FAIL ${testCase.name}: expected ${testCase.expected}, received ${actual}`,
    );
  } else {
    console.log(`PASS ${testCase.name}: ${actual}`);
  }
}

const localized = "١٬٢٣٤٫٥";
const normalized = normalizeLocalizedNumber(localized);
const parsed = parseLocalizedNumber(localized);

if (normalized !== "1234.5" || parsed !== 1234.5) {
  failed += 1;
  console.error(
    `FAIL localized numerals: normalized=${normalized}, parsed=${parsed}`,
  );
} else {
  console.log("PASS localized numerals: ١٬٢٣٤٫٥ -> 1234.5");
}

try {
  evaluateFormula("value / zero", { value: 1, zero: 0 });
  failed += 1;
  console.error("FAIL division by zero: expected an exception");
} catch {
  console.log("PASS division by zero protection");
}

if (failed > 0) {
  console.error(`TOOLS_WAVE1_TESTS=FAIL (${failed})`);
  process.exit(1);
}

console.log(`TOOLS_WAVE1_TESTS=PASS (${cases.length + 2})`);
