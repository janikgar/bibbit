import { Parser, ParseResult } from "@cooklang/cooklang-ts";

export default function loadRecipe() {
  fetch("/sample_recipes/recipe.cook")
  .then((response: Response) => {
    console.log("got text");
    return response.text()
  })
  .then((responseText: string) => {
    let recipeToRead = new Parser;
    return recipeToRead.parse(responseText)
  })
  .then((parseResult: ParseResult) => {
    parseRecipe(parseResult);
  })
  .catch((reason: any) => {
    console.log(`Could not open file: ${reason}`)
  })
}

function parseRecipe(parseResult: ParseResult) {
  let recipeCard = document.getElementById("recipeCard");

  let cardTitle = document.createElement("h5");
  cardTitle.className = "card-title";
  cardTitle.innerText = "Recipe";

  if (parseResult.metadata["title"]) {
    cardTitle.innerText = parseResult.metadata["title"]
  }
  recipeCard?.append(cardTitle);

  if (parseResult.metadata["tags"]) {
    let tags = parseResult.metadata["tags"]
    let tagArray = tags.split(",")
    let cardFooter = document.getElementById("recipeCardFooter");
    for (let tag of tagArray) {
      let tagBadge = document.createElement("span");
      tagBadge.className = "badge rounded-pill bg-primary";
      tagBadge.innerText = `#${tag}`;
      cardFooter?.append(tagBadge);
    }
  }

  let stepList = document.createElement("ol");
  let stepArray = new Array<Node>();

  let ingredientTitle = document.createElement("h6");
  ingredientTitle.innerText = "Ingredients";

  let ingredientList = document.createElement("ul");
  let ingredientArray = new Array<Node>();


  for (let step of parseResult.steps) {
    let stepOfType = "";
    for (let subStep of step) {
      switch (subStep.type) {
        case "ingredient":
          stepOfType += `<abbr title="${subStep.quantity} ${subStep.units}">${subStep.name}</abbr>`;
          let ingredient = document.createElement("li");
          ingredient.innerText = `${subStep.quantity} ${subStep.units} ${subStep.name}`
          ingredientArray.push(ingredient);
          break;
        case "cookware":
          stepOfType += `<abbr title="${subStep.quantity}">${subStep.name}</abbr>`
          break;
        case "text":
          if (subStep.value != "") {
            stepOfType += subStep.value
          }
          break;
        case "timer":
          stepOfType += `<abbr title="${subStep.quantity} ${subStep.units}">${subStep.name}</abbr>`
          break;
        default:
          break;
      }
    }

    // not sure why this is needed, but metadata appears to add zero-length steps
    if (stepOfType.length > 1) {
      let listItem = document.createElement("li");
      listItem.innerHTML = stepOfType;
      stepArray.push(listItem);
    }
  }
  stepList.append(...stepArray);
  ingredientList.append(...ingredientArray);
  recipeCard?.append(ingredientTitle, ingredientList, stepList);
}