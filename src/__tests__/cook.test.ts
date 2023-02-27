import { test, expect, describe, beforeAll, jest, beforeEach } from "@jest/globals"
import loadRecipes, { loadRecipe, incrementProgress, innerJoin, isInArray, estimateFraction, parseRecipe, prepareLoadRecipes, parseManifest } from "../cook"
import { Parser } from "@cooklang/cooklang-ts"
import { initDB } from "../search"
import "isomorphic-fetch"
import "fake-indexeddb/auto"

const htmlFile = require("../../dist/index.html");

var testRecipe = `
>> title: Negroni
>> tags: gin,tumbler,rolled,three-ingredient

Add @ice{1%large cube} to #tumbler{}.

Combine @Carpano Antica sweet vermouth{3/4%oz} and @Tuvè Bitter{3/4%oz} in tumbler.

Add @gin{1 1/2%oz} to tumbler.

Roll ingredients together in glass or lightly stir with finger.

Garnish optionally with @orange peel{1} after expressing orange oil on glass.
  `
var testManifest = `{
  "files": [
    "negroni.cook"
  ]
}
`
var recipeParser = new Parser;
var parseResult = recipeParser.parse(testRecipe);

beforeEach(() => {
  document.body.outerHTML = htmlFile;
})

beforeAll(() => {
  initDB();

  const mockFetch = jest.fn((url) => {
    let resp = new Response(testRecipe);
    return Promise.resolve(resp)
  })
  global.fetch = mockFetch
})

describe("cook", () => {
  test("incrementProgress", () => {
    expect(incrementProgress(0)).toBeUndefined();
  });

  test("innerJoin", () => {
    let arr1 = ["a", "b", "c", "d"];
    let arr2 = ["b", "c", "d", "e"];
    let result = new Map;
    result.set("b", ["b"]);
    result.set("c", ["c"]);
    result.set("d", ["d"]);
    expect(innerJoin(arr1, arr2)).toEqual(result);
  });

  test.concurrent.each([
    {result: true, array: ["a", "b", "c"], testString: "a"},
    {result: false, array: ["a", "b", "c"], testString: "d"},
  ])('innerJoin: $result', async ({result, array, testString}) => {
    expect(isInArray(array, testString)).toEqual(result)
  });

  test.concurrent.each([
    {num: (1 / 2), result: "½"},
    {num: (1 / 3), result: "⅓"},
    { num: (2 / 3), result: "⅔"},
    { num: (1 / 4), result: "¼"},
    { num: (1 / 6), result: "⅙"},
    { num: (5 / 6), result: "⅚"},
    { num: (1 / 8), result: "⅛"},
    { num: (3 / 8), result: "⅜"},
    { num: (5 / 8), result: "⅝"},
    { num: (7 / 8), result: "⅞"},
  ])('estimateFraction: $result', async ({num, result}) => {
    expect(estimateFraction(num)).toEqual(result)
  })

  test("loadRecipe", () => {
    expect(loadRecipe("negroni.cook", 10)).toBeUndefined();
  });

  test("parseRecipe", () => {
    expect(parseRecipe(parseResult)).toBeUndefined();
  });

  test.each([
    { name: "success", success: true, missingDivs: false},
    { name: "fail", success: false, missingDivs: false},
    { name: "missing divs", success: false, missingDivs: true},
  ])('prepareLoadRecipe: $name', ({success, missingDivs}) => {
    if (!success) {
      document.body.outerHTML = '';
    }

    let recipeHolder = document.getElementById('recipeHolder');
    if (recipeHolder) {
      recipeHolder.innerHTML = "<div><div></div></div>"
    }

    let dropdownList = document.getElementById('recipeDropdownList');
    if (dropdownList) {
      dropdownList.innerHTML = "<li></li><li></li>";
    }

    if (missingDivs) {
      dropdownList?.remove();
    }
    
    expect(prepareLoadRecipes()).toEqual(success);
  })

  test("parseManifest", () => {
    const mockFetch = jest.fn((url: RequestInfo | URL) => {
      let resp = new Response(testRecipe);
      if (url.toString().match("manifest")) {
        resp = new Response(testManifest);
      }
      return Promise.resolve(resp)
    })
    global.fetch = mockFetch

    expect(parseManifest()).toEqual(true);
  });

  test("loadRecipes", () => {
    expect(loadRecipes()).toEqual(true);
  });
})