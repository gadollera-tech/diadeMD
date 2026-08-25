(() => {
  const ACCESS_HASH = "9a038db45217032e67dfc3889b968322b46b39fe7113011ab1f087f30e0f17df";
  const SESSION_KEY = "medudemyAccessGranted";

  async function sha256(text) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function unlock() {
    sessionStorage.setItem(SESSION_KEY, "yes");
    const gate = document.getElementById("medudemyAccessGate");
    if (gate) gate.remove();
    document.documentElement.classList.remove("accessLocked");
  }

  function makeGate() {
    if (sessionStorage.getItem(SESSION_KEY) === "yes") return;
    document.documentElement.classList.add("accessLocked");

    const gate = document.createElement("div");
    gate.id = "medudemyAccessGate";
    gate.className = "accessGate";
    gate.innerHTML = `
      <div class="accessPanel">
        <img src="assets/images/medudemy-logo.png" alt="MeduDemy">
        <span class="accessLabel">PRIVATE ONGOING PROJECT</span>
        <h1>Welcome to the MeduDemy vault.</h1>
        <p>This build is currently shared only with people who have an owner-issued access code.</p>
        <form id="medudemyAccessForm">
          <label for="medudemyAccessCode">Access code</label>
          <div class="accessRow">
            <input id="medudemyAccessCode" type="password" autocomplete="current-password" placeholder="Enter code" required>
            <button type="submit">Enter</button>
          </div>
          <small id="medudemyAccessError"></small>
        </form>
        <p class="accessFoot">Ongoing med-school vault • reviewers • QBank • references • files</p>
      </div>`;
    document.body.appendChild(gate);

    gate.querySelector("#medudemyAccessForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = gate.querySelector("#medudemyAccessCode");
      const error = gate.querySelector("#medudemyAccessError");
      const enteredHash = await sha256(input.value.trim());
      if (enteredHash === ACCESS_HASH) {
        unlock();
      } else {
        error.textContent = "That access code is not recognized.";
        input.select();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", makeGate);
  } else {
    makeGate();
  }
})();
