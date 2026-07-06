type Operator = "+" | "-" | "*" | "/" | "%" | "^";
type Token =
  | { type: "number"; value: number }
  | { type: "identifier"; value: string }
  | { type: "operator"; value: Operator }
  | { type: "paren"; value: "(" | ")" };

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const char = expression[index];

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(char)) {
      let raw = "";
      while (index < expression.length && /[0-9.]/.test(expression[index])) {
        raw += expression[index++];
      }
      const value = Number(raw);
      if (!Number.isFinite(value)) throw new Error("Invalid number in formula.");
      tokens.push({ type: "number", value });
      continue;
    }

    if (/[a-zA-Z_]/.test(char)) {
      let value = "";
      while (index < expression.length && /[a-zA-Z0-9_]/.test(expression[index])) {
        value += expression[index++];
      }
      tokens.push({ type: "identifier", value });
      continue;
    }

    if ("+-*/%^".includes(char)) {
      tokens.push({ type: "operator", value: char as Operator });
      index += 1;
      continue;
    }

    if (char === "(" || char === ")") {
      tokens.push({ type: "paren", value: char });
      index += 1;
      continue;
    }

    throw new Error(`Unsupported formula character: ${char}`);
  }

  return tokens;
}

export function evaluateFormula(
  expression: string,
  variables: Record<string, unknown>
): number {
  const tokens = tokenize(expression);
  let position = 0;
  const peek = () => tokens[position];
  const consume = () => tokens[position++];

  function primary(): number {
    const token = consume();
    if (!token) throw new Error("Unexpected end of formula.");
    if (token.type === "number") return token.value;

    if (token.type === "identifier") {
      const value = Number(variables[token.value]);
      if (!Number.isFinite(value)) {
        throw new Error(`Variable ${token.value} must be numeric.`);
      }
      return value;
    }

    if (token.type === "paren" && token.value === "(") {
      const value = addSubtract();
      const closing = consume();
      if (closing?.type !== "paren" || closing.value !== ")") {
        throw new Error("Missing closing parenthesis.");
      }
      return value;
    }

    if (token.type === "operator" && token.value === "-") {
      return -primary();
    }

    throw new Error("Invalid formula.");
  }

  function power(): number {
    let value = primary();
    while (peek()?.type === "operator" && peek().value === "^") {
      consume();
      value = value ** primary();
    }
    return value;
  }

  function multiplyDivide(): number {
    let value = power();

    while (true) {
      const next = peek();
      if (
        next?.type !== "operator" ||
        !["*", "/", "%"].includes(next.value)
      ) break;

      const operator = consume();
      const right = power();
      if (operator.type !== "operator") throw new Error("Invalid operator.");

      if ((operator.value === "/" || operator.value === "%") && right === 0) {
        throw new Error("القسمة على صفر غير مسموحة.");
      }

      if (operator.value === "*") value *= right;
      if (operator.value === "/") value /= right;
      if (operator.value === "%") value %= right;
    }

    return value;
  }

  function addSubtract(): number {
    let value = multiplyDivide();

    while (true) {
      const next = peek();
      if (
        next?.type !== "operator" ||
        !["+", "-"].includes(next.value)
      ) break;

      const operator = consume();
      const right = multiplyDivide();
      if (operator.type !== "operator") throw new Error("Invalid operator.");
      value = operator.value === "+" ? value + right : value - right;
    }

    return value;
  }

  const result = addSubtract();

  if (position !== tokens.length) throw new Error("Unexpected formula tokens.");
  if (!Number.isFinite(result)) throw new Error("Formula produced an invalid result.");

  return result;
}
