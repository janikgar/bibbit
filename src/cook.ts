import { Parser } from "@cooklang/cooklang";
import { addToDB } from "./search";

const baseUrl = "https://raw.githubusercontent.com/janikgar/drink-recipes/main";

export default function loadRecipes() {
  let modalToggler = document.getElementById("modal-toggler") as HTMLDialogElement;

  let recipeHolder = document.getElementById("recipeHolder");

  if (recipeHolder) {
    recipeHolder.querySelectorAll("article").forEach((article) => {
      article.remove();
    })
  }

  let dropdownList = document.getElementById("recipeDropdownList");
  if (dropdownList) {
    dropdownList.querySelectorAll("li").forEach((li) => {
      li.remove();
    })
  }

  fetch(`${baseUrl}/manifest.json`)
    .then((response) => {
      if (response.headers.get("x-from-cache") !== "true") {
        modalToggler!.show();
      }
      if (response.status <= 299) {
        response.json()
          .then((responseText) => {
            incrementProgress(10);
            let fileNames = responseText['files'] as Array<string>
            let sortedFileNames = fileNames.sort((a: string, b: string) => {
              if (a < b) {
                return -1
              }
              return 1
            })

            let progressBarUnits = 90;
            if (fileNames.length > 0) {
              progressBarUnits = 90 / fileNames.length
            }

            for (let fileName of sortedFileNames) {
              loadRecipe(fileName, progressBarUnits);
            }
          }).catch((reason) => {
            console.log(`could not open JSON: ${reason}`)
          })
      }
    }).catch((reason) => {
      console.log(`could not load recipes: ${reason}`);
    }).finally(() => {
      setTimeout(() => {
        modalToggler!.close();
      }, 750);
    });
}

function incrementProgress(percent: number) {
  let progress = document.getElementById('load-progress');
  let progressBar = document.getElementById('load-progress-bar');

  let currentProgress = Number(progress?.hasAttribute("aria-valuenow") ? progress.getAttribute("aria-valuenow") : "0")
  let newProgress = currentProgress + percent

  progress?.setAttribute("aria-valuenow", String(newProgress))
  progressBar?.setAttribute("style", `width: ${String(newProgress)}%;`)
}

function loadRecipe(recipeName: string, incrementAmount: number) {
  fetch(`${baseUrl}/${recipeName}`).then((response) => {
    response.text().then((text) => {
      let recipeToRead = new Parser();
      let parsedText = recipeToRead.parse(text);
      addToDB(parsedText);
      parseRecipe(parsedText);
      incrementProgress(incrementAmount);
    })/*.catch((reason) => {
      console.log(`could not load recipe text ${recipeName}: ${reason}`)
    });
  }).catch((reason) => {
    console.log(`could not load recipe ${recipeName}: ${reason}`)*/
  });
}

function parseQueryString() {
  const urlParams = new URLSearchParams(location.search);
  let paramMap: { [key: string]: Array<string> } = {};
  urlParams.forEach((value, key) => {
    paramMap[key] = value.split(",");
  })
  return paramMap
}

function innerJoin(arr1: Array<string>, arr2: Array<string>) {
  var newMap = new Map<string, Array<string>>();
  arr1.forEach((x) => {
    newMap.set(x, [""]);
  })
  arr2.forEach((y) => {
    let existing = newMap.get(y);
    if (existing !== undefined) {
      newMap.set(y, [y]);
    }
  })
  newMap.forEach((value, key) => {
    if (value[0] === "") {
      newMap.delete(key)
    }
  })
  return newMap
}

function isInArray(array: Array<string>, testString: string) {
  if (array === undefined || testString === undefined) {
    return false
  }
  for (let arrayString of array) {
    if (testString === arrayString) {
      return true
    }
  }
  return false
}

function estimateFraction(quantity: number | string) {
  switch (typeof quantity) {
    case "object":
      let base = "";
      if (quantity['whole'] > 0) {
        base = String(quantity['whole']);
      }
      let fraction = ""
      switch (quantity['den']) {
        case 2:
          if (quantity['num'] == 1) {
            fraction = "½";
          }
          break;
        case 3:
          switch (quantity['num']) {
            case 1:
              fraction = "⅓";
              break;
            case 2:
              fraction = "⅔";
              break;
          }
          break;
        case 4:
          switch (quantity['num']) {
            case 1:
              fraction = "¼";
              break;
            case 3:
              fraction = "¾";
              break;
          }
          break;
        case 6:
          switch (quantity['num']) {
            case 1:
              fraction = "⅙";
              break;
            case 5:
              fraction = "⅚";
              break;
          }
          break;
        case 8:
          switch (quantity['num']) {
            case 1:
              fraction = "⅛";
              break;
            case 3:
              fraction = "⅜";
              break;
            case 5:
              fraction = "⅝";
              break;
            case 7:
              fraction = "⅞";
              break;
          }
          break;
      }
      return `${base}${fraction}`
      break;
    default:
      return String(quantity)
      break;
  }
  return quantity
}

function parseRecipe(parseResult: any) {
  let queryTags = parseQueryString()["tags"];

  let recipeHolder = document.getElementById("recipeHolder");
  let recipeTemplate = recipeHolder?.getElementsByTagName("template")[0].content;
  let recipeClone = recipeTemplate?.cloneNode(true) as HTMLElement;
  let cardTitle = recipeClone?.querySelector(".card-title");
  let cardBody = recipeClone?.querySelector(".card-body");

  let dropdownList = document.getElementById("recipeDropdownList");

  let fullTitle = "";
  let shortTitle = "";

  if (cardTitle) {
    if (parseResult.metadata["title"]) {
      fullTitle = parseResult.metadata["title"];
      shortTitle = fullTitle.replace(/\W+/g, "-").toLowerCase();
      /*cardTitle.innerHTML = `<div role="button" id="${shortTitle}">${fullTitle}</div>`;*/
      cardTitle.innerHTML = fullTitle;
      let cardParent = cardTitle.parentElement;
      if (cardParent) {
        cardParent.addEventListener("click", (event: Event) => {
          let target = event.target as HTMLAnchorElement;
          let targetChild = target.querySelector("a");
          if (targetChild) {
            let dest = targetChild.id;
            history.pushState(null, "", `index.html#${dest}`);
          }
        })
      }

      let dropdownListEntry = document.createElement("li");
      dropdownListEntry.innerText = fullTitle;

      dropdownListEntry.addEventListener("click", (event) => {
        event.preventDefault();
        document.getElementById("closeButton")?.click();
        let srcTarget = event.target as HTMLAnchorElement;
        let destTarget = srcTarget.href.split("#")[1];
        let destElement = document.getElementById(destTarget);
        if (destElement) {
          destElement.dispatchEvent(new Event("click"));
        }
      })

      dropdownList?.append(dropdownListEntry);
    }
  }

  if (cardBody) {
    cardBody.id = `${shortTitle}-body`
  }

  if (parseResult.metadata.tags) {
    let tagArray = parseResult.metadata.tags

    if (queryTags) {
      if (innerJoin(queryTags, tagArray).size === 0) {
        return
      }
    }

    let cardFooter = recipeClone?.querySelector(".card-footer");
    for (let tag of tagArray) {
      let tagBadge = document.createElement("span");
      tagBadge.className = "badge ";
      if (isInArray(queryTags, tag)) {
        tagBadge.className += "tag-primary"
      } else {
        tagBadge.className += "tag-secondary"
      }
      tagBadge.innerHTML = `<span class="tagBadge">${tag}</span>`;
      tagBadge.addEventListener("click", (event: Event) => {
        if (event.target) {
          if (isInArray(queryTags, tag) === false) {
            let target = event.target as HTMLElement;
            window.history.pushState(null, "", `/index.html?tags=${target.innerText}`);
            tagBadge.className = "badge tag-primary";
          } else {
            window.history.pushState(null, "", "/index.html");
            tagBadge.className = "badge tag-secondary";
          }
          loadRecipes();
        }
      })
      cardFooter?.append(tagBadge);
    }
  }

  let stepList = recipeClone?.querySelector(".stepList");
  let stepArray = new Array<Node>();

  let ingredientList = recipeClone?.querySelector(".ingredientList");
  let ingredientArray = new Array<Node>();

  let equipmentList = recipeClone?.querySelector(".equipmentList");
  let equipmentArray = new Array<Node>();

  for (let item of parseResult.recipe.cookware) {
    let stepOfType = `<abbr title="${item.quantity?.value.value.value || ""}">${item.name}</abbr>`
    let equipment = document.createElement("li");
    let equipmentCountIfNotOne = "";
    if (item.quantity != 1) {
      equipmentCountIfNotOne = `${item.quantity?.value.value.value || ""} `
    }
    equipment.innerText = `${equipmentCountIfNotOne}${item.name}`
    equipmentArray.push(equipment);
  }

  for (let item of parseResult.recipe.ingredients) {
    let stepOfType = `<abbr title="${item.quantity?.value.value.value || ""} ${item.quantity?.unit || ""}">${item.name}</abbr>`;
    let ingredient = document.createElement("li");
    let quantity = estimateFraction(item.quantity?.value.value.value);
    ingredient.innerText = `${quantity} ${item.quantity?.unit || ""} ${item.name}`
    ingredientArray.push(ingredient);
  }

  /*for (let item of parseResult.recipe.timers) {
    let stepOfType = `<abbr title="${item.quantity.value.value} ${subStep.quantity.unit}">${item.name}</abbr>`
  }*/

  for (let section of parseResult.recipe.sections) {
    for (let step of section.content) {
      let stepText = ""
      for (let stepPart of step.value.items) {
        switch (stepPart.type) {
          case "text":
            stepText += stepPart.value
            break;
          case "ingredient":
            stepText += parseResult.recipe.ingredients[stepPart.index].name;
            break;
          case "cookware":
            stepText += parseResult.recipe.cookware[stepPart.index].name;
            break;
        }
      }
      let listItem = document.createElement("li");
      listItem.innerHTML = stepText;
      stepArray.push(listItem);
    }
  }
  stepList?.append(...stepArray);
  ingredientList?.append(...ingredientArray);
  equipmentList?.append(...equipmentArray);
  recipeHolder?.appendChild(recipeClone);
}

function swRefreshMessage() {
  if ("serviceWorker" in navigator && "controller" in navigator.serviceWorker) {
    let refreshButton = document.getElementById("refreshBtn");
    refreshButton?.addEventListener("click", () => {
      navigator.serviceWorker.controller?.postMessage("refresh");
      loadRecipes();
    });
  }
}

swRefreshMessage();
