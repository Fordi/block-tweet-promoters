(async () => {
  const delay = (t) => new Promise(r => setTimeout(r, t));
  const aqs = async (sel, root = document, timeout = 125, poll = 10) => {
    let el = root.querySelector(sel);
    const start = Date.now();
    while (!el) {
      if (Date.now() - start + poll >= timeout) {
          return Promise.reject(new Error(`Timed out looking for ${sel}`));
      }
      await delay(poll);
      el = root.querySelector(sel);
    }
    return el;
  };
  let suspend = false;
  const clearAds = async () => {
    if (suspend) {
        setTimeout(clearAds, 125);
        return;
    }
    suspend = true;
    const blks = Array.from(document.querySelectorAll('[data-testid="placementTracking"] article svg+[dir="auto"]>span')).filter(span => span.textContent.toLowerCase().indexOf('promote') !== -1).map(el => el.closest('article').querySelector('[data-testid="caret"]'));
    for (let blk of blks) {
        console.log('Clearing an ad');
      blk.click();
      (await aqs('div[role="menuitem"][data-testid="block"]')).click();
      (await aqs('div[role="alertdialog"] div[role="button"][data-testid="confirmationSheetConfirm"]')).click();
    }
    suspend = false;
  };
  const observer = new MutationObserver((mutationsList) => {
    for(const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            if (/^[0-9\.]+[kMG]?$/.test(mutation.target.textContent.trim())) return;
            clearAds();
        }
    }
  });
  observer.observe(
    document.querySelector('[data-testid="primaryColumn"] section>h1+div>div'),
    { subtree: true, childList: true }
  );
})();
