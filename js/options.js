let port = chrome.runtime.connect({name: "logs"});

//listen for messages from background
port.onMessage.addListener((request) => {
  let logs = request.logs || [];
  logs.reverse();
  updateLogList(logs);
});

//get logs from storage
chrome.storage.local.get(['logs'], (result) => {
  let logs = result.logs || [];
  logs.reverse();
  updateLogList(logs);
});

//update logs when open options
function updateLogList(logs) {
  document.getElementById("logs").innerHTML = "";
  logs.forEach((log) => {
    let li = document.createElement("li");
    li.classList.add("log");
    
    li.textContent = log;
    document.getElementById("logs").appendChild(li);
  });
}

//set data when open options
chrome.storage.local.get(null, (items) => {
    setText('#searchFor', '...');
    optionsForm.timeLoop.value = String(items.timeLoop);
    optionsForm.isActive.checked = Boolean(items.isActive);
    document.getElementById('searchFor').textContent = String(items.searchProduct);

    if (!items.searchUrl || items.timeLoop < 1 || !items.searchProduct) {
        optionsForm.isActive.checked = false;
        optionsForm.isActive.disabled = true;
    }

    setText('#switchText', optionsForm.isActive.checked ? 'Activat' : 'Dezactivat');

    if (items.newProducts) {
        notificationDiv(String(items.newProducts.length), items.manualUrl, items.newProductsDate);
    }
});

//start stop
document.addEventListener('DOMContentLoaded', function () {
    var isActive = document.getElementById('isActive');
    isActive.addEventListener('change', function (event) {
        setText('#switchText', event.target.checked ? 'Activat' : 'Dezactivat');
        chrome.storage.local.set({ isActive: event.target.checked });
    });
});

//save minutes
document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('save_minutes');
  button.addEventListener('click', function() {
    var timeLoop = optionsForm.timeLoop.value;
    chrome.storage.local.set({ timeLoop: timeLoop });
  });
});

//clear logs and add new
function notificationDiv(produs, url, date) {
    if (produs && url && date) {
        let cautare = document.createElement('div');
        cautare.classList.add('last_notify');
        cautare.innerHTML = "<span class='hour'>" + date + '</span> <span>Am gasit <span class="number">' + produs + '</span> produse noi!</span>';

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

//set text for elements
function setText(selector, text) {
    document.querySelector(selector).textContent = text;
}
