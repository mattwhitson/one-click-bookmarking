chrome.runtime.sendMessage({ action: "AUTH_CHECK" }, (data) => {
  if (data) {
    //session = data;
    console.log("Logged in");
  } else {
    console.log("oops");
    chrome.tabs.create({
      url: "http://localhost:3000/login",
    });
  }
});
