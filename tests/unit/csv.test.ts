import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("writes a header row and one line per record with CRLF endings", () => {
    const csv = toCsv(["name", "email"], [["Jordan", "jordan@example.com"]]);
    expect(csv).toBe("name,email\r\nJordan,jordan@example.com\r\n");
  });

  it("quotes values containing commas, quotes, or newlines", () => {
    const csv = toCsv(["name"], [['Lee, "JJ"'], ["two\nlines"]]);
    expect(csv).toBe('name\r\n"Lee, ""JJ"""\r\n"two\nlines"\r\n');
  });

  it("neutralises spreadsheet formulas", () => {
    for (const value of ["=HYPERLINK(1)", "+1", "-2", "@SUM(A1)"]) {
      expect(toCsv(["v"], [[value]])).toBe(`v\r\n'${value}\r\n`);
    }
  });

  it("writes empty strings for null values", () => {
    expect(toCsv(["a", "b"], [[null, "x"]])).toBe("a,b\r\n,x\r\n");
  });
});
