<script>
  import { goto } from '$app/navigation'; // SvelteKit navigation

  // Default active tab
  let activeTab = "library";

  // Navigate function
  function goTo(tab) {
    activeTab = tab;

    // Use SvelteKit navigation instead of full reload
    if (tab === "library") goto("/library");
    if (tab === "catalog") goto("/catalog");
  }
</script>

<div class = "landingpage-container">
<h1>S.A.T.O Admin Panel</h1>
<p>Navigate to where u want to go ehe</p>
   
</div>

<div class="button-group">
  <button class="gotoLib" class:active={activeTab === "library"} on:click={() => goTo("library")}>
    Library
  </button>

  <button class="gotoCat" class:active={activeTab === "catalog"} on:click={() => goTo("catalog")}>
    Catalog
  </button>
</div>

<style>

  :global(body) {
    background-color: #19333c;
    margin: 0;
    padding: 0;
    color: #CF8C44;
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  }

.landingpage-container {
  background-color: #065a63;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 40px auto;
  text-align: center;
  color: #CF8C44;
}
.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
}

.button-group button {
  padding: 16px 32px;
  border-radius: 12px;
  width: 80%;        /* scale with container */
  max-width: 460px;  /* don’t go bigger than 460px */
  height: 100px;
  font-size: 1.5rem; /* bigger text for big button */
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  background-color: #000;
  color: #CF8C44;
  border: 2px solid #3E92B5;
  transition: all 0.2s ease;
}

.gotoLib {
  background-color: #CF8C44;
  color: #19333c;
  border: none;
}
.gotoCat {
  background-color: #CF8C44;
  color: #19333c;
  border: none;
}
.button-group button {
  transition: all 0.2s ease;
}

.button-group button:hover {
  transform: scale(1.05);
}

</style>
