import { describe, expect, it } from "vitest";
import { loginDestination } from "./login-destination";

describe("login destination", () => {
  it("preserves the protected page and query after reauthentication", () => {
    expect(loginDestination("/journal/entry-id?edit=1")).toBe("/journal/entry-id?edit=1");
    expect(loginDestination("/intelligence?symbol=XAU%2FUSD")).toBe("/intelligence?symbol=XAU%2FUSD");
  });
  it("rejects external URLs, login loops and URL normalization escapes", () => {
    for (const path of [null, "https://example.com", "//example.com", "/\\example.com", "/login", "/journal/../login", "/journalish", "/\n/example.com"]) {
      expect(loginDestination(path)).toBe("/dashboard");
    }
  });
});
