//set data to seee
chrome.storage.local.get(null, (items) => {
    console.log(items);
    optionsForm.searchFor.value = String(items.searchProduct);
    optionsForm.timeLoop.value = String(items.timeLoop);
    optionsForm.isActive.checked = Boolean(items.isActive);
    document.getElementById("itemsFound").innerHTML = String(items.items);
});

//start stop
optionsForm.isActive.addEventListener("change", (event) => {
    var isActive = event.target.checked;
    chrome.storage.local.set({ isActive: isActive });
    console.log(isActive);
});

//save data
optionsForm.saveData.addEventListener("click", (event) => {
    var searchFor = optionsForm.searchFor.value;
    var timeLoop = optionsForm.timeLoop.value;
    chrome.storage.local.set({ searchProduct: searchFor, timeLoop: timeLoop });
    console.log("Data saved");
});
