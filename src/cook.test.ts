import { test, expect, describe, beforeAll, jest } from "@jest/globals"
import { loadRecipe, incrementProgress } from "./cook"
import { initDB } from "./search"
import "isomorphic-fetch"
import "fake-indexeddb/auto"

beforeAll(() => {
  initDB();

  global.fetch = jest.fn((url) => {
    let resp = new Response(`
>> title: Negroni
>> tags: gin,tumbler,rolled,three-ingredient

Add @ice{1%large cube} to #tumbler{}.

Combine @Carpano Antica sweet vermouth{3/4%oz} and @Tuvè Bitter{3/4%oz} in tumbler.

Add @gin{1 1/2%oz} to tumbler.

Roll ingredients together in glass or lightly stir with finger.

Garnish optionally with @orange peel{1} after expressing orange oil on glass.
  `)
    return Promise.resolve(
      resp
    )
  })
})

describe("cook", () => {
  test("incrementProgress", () => {
    expect(incrementProgress(0)).toBeUndefined();
  });
  test("loadRecipe", () => {
    expect(loadRecipe("negroni.cook", 10)).toBeUndefined();
  });
})