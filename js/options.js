//set data to seee
chrome.storage.local.get(null, (items) => {
    optionsForm.timeLoop.value = String(items.timeLoop);
    optionsForm.isActive.checked = Boolean(items.isActive);
    document.getElementById('searchFor').innerHTML = String(items.searchProduct);

    if (!items.searchUrl || items.timeLoop < 1 || !items.searchProduct) {
        optionsForm.isActive.checked = false;
        optionsForm.isActive.disabled = true;
    }

    if (items.newProducts) {
        notificationDiv(String(items.newProducts.length), items.manualUrl, items.newProductsDate);
    }
});

//start stop
optionsForm.isActive.addEventListener('change', (event) => {
    var isActive = event.target.checked;
    chrome.storage.local.set({ isActive: isActive });
    console.log(isActive);
});

//save data
optionsForm.saveData.addEventListener('click', (event) => {
    var timeLoop = optionsForm.timeLoop.value;
    chrome.storage.local.set({ timeLoop: timeLoop });
    console.log('Data saved');
});

function notificationDiv(produs, url, date) {
    if (produs && url && date) {
        let cautare = document.createElement('div');
        cautare.classList.add('last_notify');
        cautare.innerHTML = "<span class='hour'>" + date + '</span> Am gasit ' + produs + ' produse noi! | ';

        let buttonLink = document.createElement('button');
        buttonLink.classList.add('buttonLink');
        buttonLink.innerHTML = 'Verifica';

        cautare.appendChild(buttonLink);
        document.getElementById('productNotification').appendChild(cautare);

        cautare.addEventListener('click', function () {
            chrome.tabs.create({
                url: url,
            });
        });
    }
}
