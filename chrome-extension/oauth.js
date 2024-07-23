chrome.runtime.sendMessage({ action: "AUTH_CHECK" }, (data) => {
  if (data) {
  } else {
    chrome.tabs.create({
      url: "http://localhost:3000/login",
    });
  }
});
