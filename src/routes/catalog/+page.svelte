<script>
import { onMount } from "svelte";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import DOMPurify from "dompurify";
import validator from "validator";

let activeTab = "catalog";
let db = null;
let app = null;
let auth = null;
let entries = [];
let componentName = "";
let discoveredBy = "";
let discoveryPeriod = "";
let category = "";
let saving = false;
let loading = true;

function goTo(path) {
  if (typeof window !== "undefined") window.location.href = path;
}

onMount(async () => {
  try {
    const mod = await import("$lib/firebase");
    db = mod.db;
    app = mod.app;
    auth = mod.auth;

    if (!db) { loading = false; return; }

    const q = query(collection(db, "catalog"), orderBy("componentName"));

    // Initial fetch
    try {
      const snap = await getDocs(q);
      entries = snap.docs.map(d => {
        const data = d.data() || {};
        return {
          id: d.id,
          name: data.componentName ?? "",
          discoveredBy: data.discoveredBy ?? "",
          discoveryPeriod: data.discoveryPeriod ?? "",
          category: data.category ?? "",
          sym_img: data.sym_img ?? "",

          editing: false,
          uploading: false
        };
      });
    } catch {
      entries = [];
    } finally {
      loading = false;
    }

    // Real-time listener
    const unsub = onSnapshot(q, snap => {
      entries = snap.docs.map(d => {
        const data = d.data() || {};
        return {
          id: d.id,
          name: data.componentName ?? "",
          discoveredBy: data.discoveredBy ?? "",
          discoveryPeriod: data.discoveryPeriod ?? "",
          category: data.category ?? "",
          image_path: data.image_path ?? "",
          editing: false,
          uploading: false
        };
      });
    });

    // Auth listener
    const { onAuthStateChanged } = await import("firebase/auth");
    const unsubAuth = onAuthStateChanged(auth, async user => {
      if (!user) { window.location.href = "/"; return; }

      try {
        const email = (user.email || "").trim().toLowerCase();
        const snap = await getDocs(collection(db, "Admins"));
        const allowed = snap.docs.some(d => Object.values(d.data() || {}).some(v => String(v || "").trim().toLowerCase() === email));
        if (!allowed) { await auth.signOut(); window.location.href = "/"; }
      } catch (e) { console.error("Auth check failed:", e); }
    });

    return () => { 
      unsub && unsub(); 
      unsubAuth && unsubAuth(); 
    };
  } catch (e) {
    console.error("Firebase init error:", e);
    loading = false;
  }
});

// Add component
async function addEntry() {

const name = componentName.trim();
const discoverer = discoveredBy.trim();
const period = discoveryPeriod.trim();
const cat = category.trim();

  if (!validator.isLength(name, { min: 1 })) { alert("Component name cannot be empty."); return; }
  if (!db) { alert("Database not ready"); return; }

  saving = true;
  try {
    await addDoc(collection(db, "catalog"), {
      componentName: name,
      discoveredBy: discoverer,
      discoveryPeriod: period,
      category: cat,
      image_path: ""
    });
    componentName = discoveredBy = discoveryPeriod = category = "";
  } catch(e) { alert("Failed to add: " + (e?.message || e)); }
  finally { saving = false; }
}

// Edit entry
function editEntry(i) {
  entries[i].editing = true;
  entries = [...entries];
}
// Upload image
async function uploadImage(i) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    entries[i].uploading = true;
    entries = [...entries];

    try {
      const storage = getStorage(app);
      const storageRef = ref(storage, `sym_img/${Date.now()}_${file.name}`);

      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // UI
      entries[i].sym_img = url;
      entries = [...entries];

      // Firestore
      await updateDoc(doc(db, "catalog", entries[i].id), {
        sym_img: url
      });

    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      entries[i].uploading = false;
      entries = [...entries];
    }
  };

  fileInput.click();
}


// Save edited entry
async function saveEntry(i) {
  if (!db) return;
  const e = entries[i];
  if (!e || !e.id) return;

  saving = true;
  try {
    await updateDoc(doc(db, "catalog", e.id), {
      componentName: e.name,
      discoveredBy: e.discoveredBy,
      discoveryPeriod: e.discoveryPeriod,
      category: e.category,
      image_path: e.image_path
    });
    entries[i].editing = false;
    entries = [...entries];
  } catch(err) { console.error(err); }
  finally { saving = false; }
}

// Delete entry
async function deleteEntry(i) {
  if (!db) return;
  const e = entries[i];
  if (!e || !e.id) return;
  if (!confirm("Delete this component?")) return;

  try { await deleteDoc(doc(db,"catalog", e.id)); }
  catch(err) { console.error(err); }
}

// Logout
function logout() {
  auth && signOut(auth)
    .then(()=> window.location.href = "/")
    .catch(err => console.error(err));
}
</script>

<div class="catalog-container">
 <h1>ADMIN CATALOG</h1>
  <div class="button-group">
   <button class="logout-button" class:active={activeTab === "logout"} on:click={logout}>LOG OUT</button>
   <button class="library-button" class:active={activeTab === "library"} on:click={() => goTo("library")}>LIBRARY</button>
   <button class="catalog-button" class:active={activeTab === "catalog"} on:click={() => goTo("catalog")}>CATALOG</button>
  </div>
</div>

<div class="catalog-component-box">
  <input type="text" placeholder="Component Name..." class="component-name-input" bind:value={componentName}/>
  <input type="text" placeholder="Discovered by..." class="discovered-input" bind:value={discoveredBy}/>
  <input type="text" placeholder="Period of discovery..." class="discovery-input" bind:value={discoveryPeriod}/>
  <input type="text" placeholder="Category..." class="category-input" bind:value={category}/>
  <button class="add-button" on:click={addEntry}>ADD</button>
</div>

<div class="title">
  <div class="name-title">Name:</div>
  <div class="description-title">Description:</div>
</div>

{#each entries as entry, i}

  <div class="catalog-entry-box">

    {#if entry.editing}

      <input class="name_edit" placeholder="Component Name..." bind:value={entry.name} on:input={() => (entries = [...entries])}/>
      
      <input class="discovered_edit" placeholder="Discovered by..." bind:value={entry.discoveredBy} on:input={() => (entries = [...entries])}/>
     
      <input class="discovery_edit" placeholder="Period of Discovery..." bind:value={entry.discoveryPeriod} on:input={() => (entries = [...entries])}/>
      
      <input class="category_edit" placeholder="Category..." bind:value={entry.category} on:input={() => (entries = [...entries])}/>
      
      <button class="save_button" on:click={() => saveEntry(i)}>Save</button>

    {:else}

      <div class="name-entry">{entry.name}</div>

      <div class="description-entry">
        {#if entry.discoveredBy || entry.discoveryPeriod || entry.category}
          <div>Discovered by: {entry.discoveredBy}</div>
          <div>Period of Discovery: {entry.discoveryPeriod}</div>
          <div>Category: {entry.category}</div>

        {/if}

      </div>

      <!-- Only show actions when NOT editing -->
      <div class="row-actions">
        <button class="img_path_input" on:click={() => uploadImage(i)}>
          <img src="/add.svg" alt="img_path" class="imgpath" />
        </button>
        <button class="edit_button_input" on:click={() => editEntry(i)}>
          <img src="/write.svg" alt="edit" class="edit" />
        </button>
        <button class="delete_button_input" on:click={() => deleteEntry(i)}>
          <img src="/delete.svg" alt="delete" class="delete" />
        </button>
      </div>
    {/if}
  </div>
{/each}


<style>

  :global(body) {
    background-color: #19333c;
    margin: 0;
    padding: 0;
    color: #fff;
    font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  }

  .catalog-entry-box{
    display: flex;
    gap: 10px;
    padding: 20px;
    margin-top: 5px;
    align-items: flex-start;
  }

  .name-entry{
    background-color: #000000;
    padding: 10px;
    border-radius: 10px;
    border-color: #3E92B5;
    border-width: 2px;
    color: #CF8C44;
    border-style: solid;
    flex: 0 0 160px;
    width: 160px;
    height: 56px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .description-entry{
    background-color: #000000;
    padding: 10px;
    border-radius: 10px;
    border-color: #3E92B5;
    border-width: 2px;
    color: #CF8C44;
    border-style: solid;
    flex: 1 1 auto;
    min-height: 56px;
    box-sizing: border-box;
    word-break: break-word;
    white-space: normal;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }


  .row-actions{
    display: flex;
    gap: 8px;
    align-items: center;
  }


  .title {
    display: flex;
    gap: 10px;
    padding: 0 20px;
    margin-top: 12px;
    align-items: flex-start;
    flex-wrap: nowrap;
  }
  .name-title {
    flex: 0 0 160px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 6px 10px;
    font-weight: 700;
    color: #CF8C44;
    box-sizing: border-box;
  }
  .description-title {
    flex: 1;
    display: flex;
    align-items: flex-start;
    padding: 6px 10px;
    font-weight: 700;
    color: #CF8C44;
    box-sizing: border-box;
  }
  /*.image-title {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 6px 10px;
    font-weight: 700;
    color: #CF8C44;
    box-sizing: border-box;
  }*/

  :global(.button-group) { display: flex; gap: 10px; margin-left: auto; padding: 0 20px; height: 50px; }
  :global(.library-button){ background-color: #3E92B5; color: #fff; border-radius: 10px; max-width: 100px; padding: 6px 10px; border-color: #3E92B5; border-width: 5px; }
  :global(.catalog-button){ background-color:  #CF8C44; color: #fff; border-radius: 10px; max-width: 100px; padding: 6px 10px; border-color: #3E92B5; border-width: 5px; }
  :global(.logout-button){ background-color: #b50b0b; color: #fff; border-radius: 10px; max-width: 100px; padding: 6px 10px; border-color: #841f03; border-width: 5px; }


  .catalog-container {
    background-color: #000000;
    height: 80px;
    width: auto;
    max-width: 2000px;
    margin: 10px 15px 0 15px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 20px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    color: #CF8C44;
    font-size: 24px;
    font-weight: bold;
    border-radius: 20px;
    border: 1px solid #3E92B5;
  }

  .catalog-component-box {
    display: flex;
    gap: 10px;
    padding: 20px;
    margin-top: 100px;
    height: 50px;
  }
  .component-name-input {
  flex: 0 0 160px;
  padding: 6px 10px;
  background-color: #000000;
  color: #CF8C44;
  border: 1px solid #3E92B5;
  border-radius: 10px;
  font-size: 16px;
}


.discovered-input,
.discovery-input,
.category-input {
  flex: 1;
  padding: 6px 10px;
  max-width: 1700px;
  background-color: #000000;
  color: #CF8C44;
  border: 1px solid #3E92B5;
  border-radius: 10px;
  font-size: 16px;
}


  .add-button,.save_button{
    background-color: #CF8C44;
    color: #fff;
    border-radius: 10px;
    max-width: 500px;
    padding: 6px 10px;
    border: none;
    font-size: 16px;
  }
.img_path_input,
.edit_button_input,
.delete_button_input {
  background-color: #000;
  border-radius: 10px;
  width: 50px;      /* give actual width */
  height: 50px;     /* give actual height */
  padding: 5px;
  border: none;
  display: flex; 
  justify-content: center;
  align-items: center;
}
.imgpath,
.edit,
.delete {
  width: 30px;
  height: 30px;
}
  /*
  .img_path_input{
    background-color: #000000;
    border-radius: 10px;
    max-width: 500px;
    max-height:70px;
    padding: 6px 10px;
    border: none;
    font-size: 16px;
  }
  .edit_button_input{
    background-color: #000000;
    border-radius: 10px;
    max-width: 500px;
    max-height:70px;
    padding: 6px 10px;
    border: none;
    font-size: 16px;
  }
  .delete_button_input{
    background-color: #000000;
    border-radius: 10px;
    max-width: 500px;
    max-height: 70px;
    padding: 6px 10px;
    border: none;
    font-size: 16px;
  }*/


  .name_edit {
    flex: 0 0 160px;
    width: 160px;
    height: 56px;
    padding: 6px 10px;
    background-color: #000000;
    color: #CF8C44;
    border: 1px solid #3E92B5;
    border-radius: 10px;
    font-size: 16px;
    box-sizing: border-box;
    align-self: center;
  }


  .discovered_edit,.discovery_edit,.category_edit {
    flex: 1;
    min-height: 140px;
    padding: 8px 10px;
    background-color: #000000;
    color: #CF8C44;
    border: 1px solid #3E92B5;
    border-radius: 10px;
    font-size: 16px;
    box-sizing: border-box;
    resize: vertical;
    white-space: pre-wrap;
  }

</style>