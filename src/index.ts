const Junction = {
  Replace: "Replace",
  Intersection: "Intersection",
  Union: "Union",
} as const;

type Values<T extends Record<any, any>> = T[keyof T];

export type Junction = Values<typeof Junction>;

export type Root =
  | { $: "root"; t: "ask"; v: string }
  | { $: "root"; t: "search"; v: string }
  | { $: "root"; t: "list" }
  | { $: "root"; t: "slug"; v: string };

export type NonEmpty<T> = [T, ...T[]];

export type Selector = {
  $: "selector";
  t: "created_date" | "updated_date" | "title" | "tags";
};
export type Comparison = ">=" | "<=" | "==" | "!=" | "~=";
export type Constant = { $: "constant"; v: string | number | null };
export type List = { $: "list"; v: (string | number | null)[] };

export type Wither =
  | {
      $: "wither";
      t: "predicate";
      v: [Selector, Comparison, Constant] | [Selector, "in", List];
    }
  | { $: "wither"; t: "OR"; v: NonEmpty<Wither> }
  | { $: "wither"; t: "AND"; v: NonEmpty<Wither> };

export type Bloom = { $: "bloom"; t: "follow"; rel: string };

export type Ast = {
  root: Root;
  children: Array<[Junction, Wither | Bloom]>;
};

type Token = { type: number; start: number; end: number };
export const TokenType = {
  List: 1,
  AskOpen: 2,
  CloseParen: 3,
  SearchOpen: 4,
  QuotedString: 6,
} as const;

const LexingError = {
  Unexpected: -1,
  UnclosedQuote: -2,
  EndOfInput: -3,
};

const src = `ask("what's going on?")
:| tags in ['poop', 'wees'] OR title ~= 'butts'
:| => link
&| fm.status in ['done', 'cancelled']
`;

function skipWhitespace(src: string, start: number) {
  for (let i = start; i < src.length; i++) {
    switch (src.charAt(i)) {
      case " ":
      case "\t":
      case "\n":
        continue;

      default:
        return i;
    }
  }

  return LexingError.EndOfInput;
}

function readQuotedString(src: string, start: number, tokens: Token[]) {
  let end = start;
  if (src.charAt(end) != '"') {
    return -1;
  }
  end++;
  while (src.charAt(end) !== '"') {
    end++;
  }

  end++;
  tokens.push({ type: TokenType.QuotedString, start, end });
  return end;
}

export function readRoot(src: string, start: number, tokens: Token[]) {
  let i = skipWhitespace(src, start);

  if (src.startsWith("list", i)) {
    i += "list".length;
    tokens.push({ type: TokenType.List, start, end: i });
    return i;
  }

  if (src.startsWith("ask(", i)) {
    i += "ask(".length;
    tokens.push({ type: TokenType.AskOpen, start, end: i });
    i = readQuotedString(src, i, tokens);
    if (i < 0) {
      return i;
    }

    if (!src.startsWith(")", i)) {
      return -1;
    }

    tokens.push({ type: TokenType.CloseParen, start: i, end: ++i });
    return i;
  }

  if (src.startsWith("search(", i)) {
    i += "search(".length;
    tokens.push({ type: TokenType.SearchOpen, start, end: i });
    i = readQuotedString(src, i, tokens);
    if (i < 0) {
      return i;
    }

    if (!src.startsWith(")", i)) {
      return -1;
    }

    tokens.push({ type: TokenType.CloseParen, start: i, end: ++i });
    return i;
  }

  return -1;
}
