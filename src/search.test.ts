import { addToDB, initDB, genAutocomplete, searchByName, autoComplete } from "./search"
import { Parser } from "@cooklang/cooklang-ts"
import { describe, test, expect, beforeEach, beforeAll, jest } from "@jest/globals"
import "fake-indexeddb/auto"

jest.useFakeTimers();

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

describe("search", () => {
  test("initDB", () => {
    expect(initDB()).toBeUndefined();
    expect(indexedDB.open("bibbit", 1)).toBeInstanceOf(IDBOpenDBRequest);
    let request = indexedDB.open("bibbit", 1);
    request.onsuccess = (event: any) => {
      let db = event.target.result as IDBDatabase;
      let objectStore = db.transaction("recipes", "readonly").objectStore("recipes");
      objectStore.openCursor().onsuccess = ((event: any) => {
        let cursor = event.target.result as IDBCursorWithValue;
      })
    }
  });
  test("autoComplete", () => {
    document.body.innerHTML = `<div id="autocomplete"></div>`;
    genAutocomplete(["foo bar"]);
    let target = document.createElement("input");
    target.value = "1234";
    target.addEventListener("focus", autoComplete);
    target.dispatchEvent(new Event("focus"));
  });
  test("addToDB", () => {
    expect(addToDB(parseResult)).toBeUndefined();
  });
});

describe("search autocomplete", () => {
  document.body.innerHTML = `<div id="autocomplete"></div>`;
  test("genAutocomplete", () => {
    expect(genAutocomplete(["foo bar"])).toBeUndefined();
  })
  test("autocomplete classes", () => {
    expect(document.getElementsByClassName("list-group").length).toEqual(1);
    expect(document.getElementsByClassName("list-group-item").length).toEqual(1);
    expect(document.getElementsByClassName("list-group-item-action").length).toEqual(1);
  })
});

test("searchByName", () => {
  document.body.innerHTML = `<div id="autocomplete"></div>`;
  // jest.mock("./search", () => {
  //   const originalModule = jest.requireActual("./search") as any;

  //   return {
  //     __esModule: true,
  //     ...originalModule,
  //     genAutocomplete: jest.fn(() => {return}),
  //   }
  // });
  expect(searchByName("negroni")).toBeUndefined();
});