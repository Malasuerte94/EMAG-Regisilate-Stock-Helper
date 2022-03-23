//set data to seee
chrome.storage.local.get(null, (items) => {
    console.log(items);
    optionsForm.timeLoop.value = String(items.timeLoop);
    optionsForm.isActive.checked = Boolean(items.isActive);
    document.getElementById("searchFor").innerHTML = String(
      items.searchProduct
    );
});

//start stop
optionsForm.isActive.addEventListener("change", (event) => {
    var isActive = event.target.checked;
    chrome.storage.local.set({ isActive: isActive });
    console.log(isActive);
});

//save data
optionsForm.saveData.addEventListener("click", (event) => {
    var timeLoop = optionsForm.timeLoop.value;
    chrome.storage.local.set({ timeLoop: timeLoop });
    console.log("Data saved");
});
