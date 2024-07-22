window.onload = async function() {
    document.querySelector('button').addEventListener('click', async function() {
      const url = await getTabURL();                                  
      const response = await fetch("http://localhost:3000/api/bookmarks", 
        { 
            method: "POST", 
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({ url })
        });
      const data = await response.json();

      if (!response.ok) {
        console.error(data);
      }
    });
  };

// why i need to do this hacky shit just to get the URL is beyond me, but async/await would always return undefined
function getTabURL() {
    return new Promise((resolve, reject) => {
        try {
            chrome.tabs.query({
                active: true,
            }, function (tabs) {
                resolve(tabs[0].url);
            })
        } catch (error) {
            reject(error);
        }
    })
}