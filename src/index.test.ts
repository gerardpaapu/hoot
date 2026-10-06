import { vi, describe, expect, test } from "vitest";
import { skipRoot, TokenType } from "./index.ts";

describe("lexing some strings", () => {
  test("reads an ask", () => {
    const tokens = [] as any[];
    let end = skipRoot('ask("poos and wees?")', 0, tokens);
    expect(end).toBeGreaterThan(0);
    expect(tokens).toStrictEqual([
      {
        type: TokenType.AskOpen,
        start: 0,
        end: 4,
      },
      {
        type: TokenType.QuotedString,
        start: 4,
        end: 20,
      },
      {
        end: 21,
        start: 20,
        type: TokenType.CloseParen,
      },
    ]);
  });

  test("reads an search", () => {
    const tokens = [] as any[];
    let end = skipRoot('search("poos and wees?")', 0, tokens);
    expect(end).toBeGreaterThan(0);
    expect(tokens).toStrictEqual([
      {
        type: TokenType.SearchOpen,
        start: 0,
        end: 7,
      },
      {
        type: TokenType.QuotedString,
        start: 7,
        end: 23,
      },
      {
        end: 24,
        start: 23,
        type: TokenType.CloseParen,
      },
    ]);
  });

  test('reads "list"', () => {
    const tokens = [] as any[];

    let end = skipRoot("list", 0, tokens);
    expect(end).toBeGreaterThan(0);
    expect(tokens).toStrictEqual([
      {
        end: 4,
        start: 0,
        type: TokenType.List,
      },
    ]);
  });
});
