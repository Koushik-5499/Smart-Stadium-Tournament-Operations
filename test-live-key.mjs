async function run() {
  const r = await fetch('https://smart-stadium-wc2026.vercel.app/');
  const t = await r.text();
  const match = t.match(/src="(\/assets\/index-[^"]+\.js)"/);
  if (match) {
    const jsUrl = 'https://smart-stadium-wc2026.vercel.app' + match[1];
    const jsResp = await fetch(jsUrl);
    const jsText = await jsResp.text();
    const apiKeyMatches = jsText.match(/AIzaSy[A-Za-z0-9_-]+/g) || [];
    console.log("API Keys found:", [...new Set(apiKeyMatches)]);
    const apiKeyIndex = jsText.indexOf("AIzaSy");
    if (apiKeyIndex > -1) {
      console.log("Context around API Key:");
      console.log(jsText.substring(Math.max(0, apiKeyIndex - 100), Math.min(jsText.length, apiKeyIndex + 300)));
    } else {
      console.log("API Key not found in bundle!");
    }
  } else {
    console.log("Could not find index.js", t.substring(0, 500));
  }
}
run().catch(console.error);
