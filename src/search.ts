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