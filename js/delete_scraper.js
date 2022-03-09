(async () => {
  console.log(`EMAG STOCK HELPER v${chrome.runtime.getManifest().version}`);

      chrome.storage.local.get(defaultOptions, (result) => {
          console.log(result);
      });

  const defaultOptions = {
    productToCheck: 'iphone 13 pro',
    minDelay: 3000,
    soundAlerts: true,
  };
  
  let counter = 0;
  let requestTimeout;
  let isFetching = false;
  let pauseQueue = false;

  const activeOptions = {
    productToCheck: '6700xt',
    minDelay: 3000,
  };

  function showStatusPane() {
    document.getElementById('startDiv').style.display = 'none';
    document.getElementById('statusPane').style.display = 'flex';
    chrome.runtime.sendMessage({ command: 'addGACookie' }, () => {
      initiateCartCheck();
    });
  }

  function pauseOrResume() {
    if (document.getElementById('pauseButton').innerHTML === 'Pause') {
      if (isFetching) {
        document.getElementById('pauseButton').disabled = true;
        pauseQueue = true;
      } else {
        clearTimeout(requestTimeout);
        document.getElementById('currentCheckInfo').innerHTML = 'Paused';
        document.getElementById('pauseButton').innerHTML = 'Resume';
      }
    } else {
      document.getElementById('pauseButton').innerHTML = 'Pause';
      initiateCartCheck();
    }
  }

  function sequentialCartCheck(productArg2) {
    chrome.storage.local.get(defaultOptions, (result) => {
      isFetching = true;
      const time1 = performance.now();
      fetchAsync(productArg2)
        .then((data) => {
          isFetching = false;
          const time2 = performance.now();
          let delayDeduction;
          if (time2 - time1 < activeOptions.minDelay) {
            delayDeduction = time2 - time1;
          } else {
            delayDeduction = activeOptions.minDelay;
          }
          counter += 1;
          document.getElementById('countInfo').innerHTML = counter;
          try {
            if (data === 403) {
              console.log(`${productNames[productArg2]} (${counter}) [Temp IP ban - 403 (Consider pausing/increasing min delay)]`);
              document.getElementById('responseInfo').innerHTML = '<span style=\'color:#de0000;\'>[Temp IP ban - 403 (Consider pausing/increasing min delay)]</span>';
              if (!IPBanFlag) {
                if (result.soundAlerts) {
                  chrome.runtime.sendMessage({ command: 'playIPBanSound' }, () => {});
                }
                chrome.runtime.sendMessage({
                  command: 'notification',
                  options: {
                    title: 'Temporarily IP banned from AMD.com', message: 'Consider pausing the script for a few minutes and increasing the min delay between requests.', iconUrl: '../img/icon128.png', type: 'basic',
                  },
                }, () => {});
                IPBanFlag = true;
              }
            } else {
              if (IPBanFlag) { IPBanFlag = false; }
              if (data >= 500 && data <= 599) {
                console.log(`${productNames[productArg2]} (${counter}) [Server error - ${data}]`);
                document.getElementById('responseInfo').innerHTML = `[Server error - ${data}]`;
              } else if (data >= 400 && data <= 499) {
                console.log(`${productNames[productArg2]} (${counter}) [Client error - ${data}]`);
                document.getElementById('responseInfo').innerHTML = `[Client error - ${data}]`;
              } else if (data === 'maintenance') {
                console.log(`${productNames[productArg2]} (${counter}) [Listing in maintenance]`);
                document.getElementById('responseInfo').innerHTML = '[Listing in maintenance]';
              } else if ((CAPTCHAMode && data.includes('Add to cart')) || (!CAPTCHAMode && data.some((item) => item.text === 'Product added to cart.'))) { // In stock
                if (result.soundAlerts) {
                  chrome.runtime.sendMessage({ command: 'playInStockSound' }, () => {});
                }
                if (CAPTCHAMode) {
                  window.open(`https://www.amd.com/en/direct-buy/${productIDs[productArg2]}`, '_blank');
                } else {
                  addToCartAndCheckout(data[6].data);
                }
                chrome.runtime.sendMessage({
                  command: 'notification',
                  options: {
                    title: `${productNames[productArg2]} IN STOCK`, message: 'GO, GO, GO!!!', iconUrl: '../img/icon128.png', type: 'basic',
                  },
                }, () => {});
                console.log(`${productNames[productArg2]} (${counter}) [In stock ${new Date(Date.now()).toString()}]`);
                document.getElementById('responseInfo').innerHTML = `[In stock ${new Date(Date.now()).toString()}]`;
                document.getElementById('pauseDiv').style.display = 'none';
                return;
              } else if (!CAPTCHAMode && data.length === 4) {
                // I need a better way to check for CAPTCHA than the length of the data array...
                CAPTCHAMode = true;
                console.log(`${productNames[productArg2]} (${counter}) [CAPTCHA detected. Enabling CAPTCHA mode]`);
                document.getElementById('responseInfo').innerHTML = '[CAPTCHA detected. Enabling CAPTCHA mode]';
              } else {
                console.log(`${productNames[productArg2]} (${counter}) [Not in stock]`);
                document.getElementById('responseInfo').innerHTML = '[Not in stock]';
              }
            }
          } catch (e) {
            console.log(`${productNames[productArg2]} (${counter}) [Unhandled parsing error - ${e}]`);
            document.getElementById('responseInfo').innerHTML = `[Unhandled parsing error - ${e}]`;
          } finally {
            if (document.getElementById('pauseDiv').style.display !== 'none') {
              if (pauseQueue) {
                pauseQueue = false;
                pauseOrResume();
                document.getElementById('pauseButton').disabled = false;
              } else {
                requestTimeout = setTimeout(() => { initiateCartCheck(); },
                  activeOptions.minDelay - delayDeduction);
              }
            }
          }
        }).catch((reason) => {
          isFetching = false;
          const time2 = performance.now();
          let delayDeduction;
          if (time2 - time1 < activeOptions.minDelay) {
            delayDeduction = time2 - time1;
          } else {
            delayDeduction = activeOptions.minDelay;
          }
          console.log(`Connection error: ${reason.message}`);
          if (reason.message === 'Failed to fetch') {
            document.getElementById('countInfo').innerHTML = counter;
            document.getElementById('responseInfo').innerHTML = '<span style=\'color:#de0000;\'>[No Internet connection]</span>';
          } else {
            document.getElementById('countInfo').innerHTML = counter;
            document.getElementById('responseInfo').innerHTML = `[Unhandled connection error - ${reason.message}]`;
          }
          if (pauseQueue) {
            document.getElementById('pauseButton').disabled = false;
            pauseQueue = false;
            pauseOrResume();
          } else {
            requestTimeout = setTimeout(() => { initiateCartCheck(); },
              activeOptions.minDelay - delayDeduction);
          }
        });
    });
  }
})();
