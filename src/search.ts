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

export function searchByName(name: string) {
  let lowerName = name.toLowerCase();

  let request = window.indexedDB.open("bibbit", 1);
  var db;
  request.onerror = (event: any) => {
    console.log(`indexeddb error: ${event.target}`);
  }

  request.onsuccess = (event: any) => {
    db = event.target.result as IDBDatabase;
    let objectStore = db.transaction("recipes", "readonly").objectStore("recipes");
    
    objectStore.openCursor().onsuccess = ((event: any) => {
      let successes = new Set<string>();
      let cursor = event.target.result as IDBCursorWithValue;
      if (cursor) {
        let curName = cursor.value.name as string;
        let lowerCurName = curName.toLowerCase();

        if (lowerCurName.includes(lowerName)) {
          successes.add(cursor.key.toString());
          // cursor.continue();
        } else {
          let tags = cursor.value.tags as Array<string>;
          tags.forEach((tag) => {
            if (tag.includes(lowerName)) {
              successes.add(cursor.key.toString());
              // cursor.continue();
            }
          });
          let ingredients = cursor.value.ingredients as Array<string>;
          ingredients.forEach((ingredient) => {
            if (ingredient.includes(lowerName)) { 
              successes.add(cursor.key.toString());
              // cursor.continue();
            }
          })
        }
        cursor.continue();
      }
      console.log(successes);
    })
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
      console.log("IDB transaction OK");
    };
    transaction.onerror = (event: any) => {
      let target = event.target as IDBRequest;
      console.log(`IDB transaction error: ${target.error}`);
    }

    var ingredients = new Array<string>();
    entry.steps.forEach((step) => {
      step.forEach((subStep) => {
        if (subStep.type === "ingredient") {
          ingredients.push(subStep.name);
        }
      })
    })

    let objectStore = transaction.objectStore("recipes");
    // objectStore.get(entry.metadata["title"]).onerror = () => {
    objectStore.add({
      "name": entry.metadata["title"],
      "tags": entry.metadata["tags"].split(","),
      "ingredients": ingredients,
      // })
    })
  }
}