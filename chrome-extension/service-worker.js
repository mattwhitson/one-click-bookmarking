chrome.runtime.onMessage.addListener(function (request, sender, onSuccess) {
  if (request.action === "AUTH_CHECK") {
    fetch("http://localhost:3000/api/auth/session", {
      mode: "cors",
    })
      .then((response) => response.json())
      .then((session) => {
        if (session && Object.keys(session).length > 0) {
          onSuccess(session);
        } else {
          onSuccess(null);
        }
      });

    return true;
  }
});
