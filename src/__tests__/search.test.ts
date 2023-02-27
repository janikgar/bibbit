import { addToDB, initDB, genAutocomplete, autoComplete, searchByName } from "../search"
import { Parser } from "@cooklang/cooklang-ts"
import { describe, test, expect, beforeEach, beforeAll, jest } from "@jest/globals"
import "fake-indexeddb/auto"
import { IDBFactory, IDBOpenDBRequest } from "fake-indexeddb"

jest.useFakeTimers();

const htmlFile = require("../../dist/index.html");

var parseText = `
>> title: Negroni
>> tags: gin,tumbler,rolled,three-ingredient

Add @ice{1%large cube} to #tumbler{}.

Combine @Carpano Antica sweet vermouth{3/4%oz} and @Tuvè Bitter{3/4%oz} in tumbler.

Add @gin{1 1/2%oz} to tumbler.

Roll ingredients together in glass or lightly stir with finger.

Garnish optionally with @orange peel{1} after expressing orange oil on glass.
  `
var recipeParser = new Parser;
var parseResult = recipeParser.parse(parseText);

beforeEach(() => {
  indexedDB = new IDBFactory();
  document.body.outerHTML = htmlFile;
})

describe("search", () => {
  test.each([
    {testName: "success", failure: false, upgrade: false},
    // {testName: "failure", failure: true, upgrade: false},
    // {testName: "upgrade", failure: false, upgrade: true},
  ])('initDB: $testName', ({failure, upgrade}) => {
    let mockIDBOpen = jest.fn((name, version) => {
      let req = new IDBOpenDBRequest;
      if (upgrade) {
        req.dispatchEvent(new Event("upgradeneeded"));
      }
      if (failure) {
        req.dispatchEvent(new Event("error"));
      }
      return req
    });
    indexedDB.open = mockIDBOpen;
    expect(initDB()).toBeUndefined();
  });
  test.each([
    {testName: "empty value", value: ""},
    {testName: "existing value", value: "1234"},
  ])('autoComplete: $testName', ({value}) => {
    initDB();
    genAutocomplete(new Set(["foo bar"]));
    let target = document.createElement("input");
    target.value = value;
    target.addEventListener("focus", autoComplete);
    target.dispatchEvent(new Event("focus"));
  });

  test("addToDB", () => {
    initDB();
    expect(addToDB(parseResult)).toBeUndefined();
  });
});

describe("search autocomplete", () => {
  document.body.innerHTML = `<div id="autocomplete"></div>`;
  test("genAutocomplete", () => {
    expect(genAutocomplete(new Set(["foo bar"]))).toBeUndefined();
  })
  test("autocomplete classes", () => {
    genAutocomplete(new Set(["foo bar"]));
    expect(document.getElementsByClassName("list-group").length).toEqual(1);
    expect(document.getElementsByClassName("list-group-item").length).toEqual(1);
    expect(document.getElementsByClassName("list-group-item-action").length).toEqual(1);
  })
});

test("searchByName", () => {
  initDB();
  expect(searchByName("negroni")).toBeUndefined();
});