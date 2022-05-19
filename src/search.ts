import { ParseResult } from "@cooklang/cooklang-ts";

const searchBox = document.getElementById("searchBox");
if (searchBox) {
  searchBox.oninput = ((event) => {
    let targetElement = event.target as HTMLInputElement;
    searchContent(targetElement.value);
  })
}

function searchContent(searchString: string) {
  console.log(searchString);
}

export function initDB() {
  let request = window.indexedDB.open("bibbit", 1);
  var db;
  request.onerror = (event: any) => {
    console.log(`indexeddb error: ${event.target}`);
  }
  request.onupgradeneeded = (event: any) => {
    db = event.target.result as IDBDatabase;
    let objectStore = db.createObjectStore("recipes", {keyPath: "name"});

    objectStore.createIndex("name", "name", {unique: true});
    objectStore.createIndex("ingredients", "ingredients", {multiEntry: true, unique: false});
    objectStore.createIndex("tags", "tags", {multiEntry: true, unique: false});
  }
}

export function addToDB(entry: ParseResult) {
  let request = window.indexedDB.open("bibbit", 1);
  var db;
  request.onerror = (event: any) => {
    console.log(`indexeddb error: ${event.target}`);
  }
  request.onsuccess = (event: any) => {
    db = event.target.result as IDBDatabase;
    let transaction = db.transaction("recipes", "readwrite");

    transaction.oncomplete = () => {
      console.log("IDB transaction added");
    };
    transaction.onerror = (event) => {
      console.log(`IDB transaction error: ${event.target}`);
    }

    var ingredients = new Array<string>();
    entry.steps.forEach((step) => {
      step.forEach((subStep) => {
        if (subStep.type === "ingredient") {
          ingredients.push(subStep.name);
        }
      })
    })

    // for (let step of entry.steps) {
    //   for (let s)
    // }

    let objectStore = transaction.objectStore("recipes");
    objectStore.add({
      "name": entry.metadata["title"],
      "tags": entry.metadata["tags"].split(","),
      "ingredients": ingredients,
    })
  }
}