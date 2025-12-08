<script>
  import { onMount } from "svelte";
  import DOMPurify from "dompurify";
  import validator from "validator";

  let activeTab = "library";
  let db = null;
  let app = null;
  let auth = null;
  let entries = [];
  let componentName = "";
  let description = "";
  let saving = false;
  let loading = true;

  function goTo(path) {
    if (typeof window !== "undefined") window.location.href = path;
  }

  onMount(async () => {
    try {
      const { collection, query, orderBy, onSnapshot, getDocs, addDoc, updateDoc, deleteDoc, doc } = await import("firebase/firestore");
      const { signOut, onAuthStateChanged } = await import("firebase/auth");
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");

      const mod = await import("$lib/firebase");
      db = mod.db;
      app = mod.app;
      auth = mod.auth;

      if (!db) { loading = false; return; }

      const q = query(collection(db, "components"), orderBy("componentName"));

      try {
        const snap = await getDocs(q);
        entries = snap.docs.map(d => {
          const data = d.data() || {};
          return {
            id: d.id,
            name: data.componentName ?? "",
            description: data.description ?? "",
            image_path: data.image_path ?? "",
            editing: false,
            uploading: false
          };
        });
      } catch {
        entries = [];
      } finally {
        loading = false;
      }

      const unsub = onSnapshot(q, snap => {
        entries = snap.docs.map(d => {
          const data = d.data() || {};
          return {
            id: d.id,
            name: data.componentName ?? "",
            description: data.description ?? "",
            image_path: data.image_path ?? "",
            editing: false,
            uploading: false
          };
        });
      });

      const unsubAuth = onAuthStateChanged(auth, async user => {
        if (!user) { window.location.href = "/"; return; }
        try {
          const email = (user.email || "").trim().toLowerCase();
          const snap = await getDocs(collection(db, "Admins"));
          const allowed = snap.docs.some(d => Object.values(d.data() || {}).some(v => String(v || "").trim().toLowerCase() === email));
          if (!allowed) { await signOut(auth); window.location.href = "/"; }
        } catch (e) { console.error(e); }
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

  async function addEntry() {
    const { collection, addDoc } = await import("firebase/firestore");

    const name = DOMPurify.sanitize(componentName.trim());
    const desc = DOMPurify.sanitize(description.trim());

    if (!validator.isLength(name, { min: 1 })) { alert("Component name cannot be empty."); return; }
    if (!db) { alert("Database not ready"); return; }

    saving = true;
    try {
      await addDoc(collection(db, "components"), {
        componentName: name,
        description: desc,
        image_path: ""
      });
      componentName = "";
      description = "";
    } catch (e) { alert("Failed to add: " + (e?.message || e)); }
    finally { saving = false; }
  }

  function editEntry(i) {
    entries[i].editing = true;
    entries = [...entries];
  }

  async function uploadImage(i) {
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    const { doc, updateDoc } = await import("firebase/firestore");

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
        const storageRef = ref(storage, `image_path/${Date.now()}_${file.name}`);

        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        entries[i].image_path = url;
        entries = [...entries];

        await updateDoc(doc(db, "components", entries[i].id), { image_path: url });
      } catch (err) {
        console.error("Upload failed:", err);
      }

      entries[i].uploading = false;
      entries = [...entries];
    };

    fileInput.click();
  }

  async function saveEntry(i) {
    const { doc, updateDoc } = await import("firebase/firestore");

    if (!db) return;
    const e = entries[i];
    if (!e || !e.id) return;

    saving = true;
    try {
      await updateDoc(doc(db, "components", e.id), {
        componentName: e.name,
        description: e.description,
        image_path: e.image_path
      });
      entries[i].editing = false;
      entries = [...entries];
    } catch(err) { console.error(err); }
    finally { saving = false; }
  }

  async function deleteEntry(i) {
    const { doc, deleteDoc } = await import("firebase/firestore");

    if (!db) return;
    const e = entries[i];
    if (!e || !e.id) return;
    if (!confirm("Delete this component?")) return;

    try { await deleteDoc(doc(db, "components", e.id)); }
    catch(err) { console.error(err); }
  }

  async function logout() {
    const { signOut } = await import("firebase/auth");
    auth && signOut(auth)
      .then(() => window.location.href = "/")
      .catch(err => console.error(err));
  }
</script>

<div class="catalog-container">
 <h1>ADMIN LIBRARY</h1>
  <div class="button-group">
   <button class="logout-button" class:active={activeTab === "logout"} on:click={logout}>LOG OUT</button>
   <button class="library-button" class:active={activeTab === "library"} on:click={() => goTo("library")}>LIBRARY</button>
   <button class="catalog-button" class:active={activeTab === "catalog"} on:click={() => goTo("catalog")}>CATALOG</button>
  </div>
</div>

<div class="catalog-component-box">
  <input type="text" placeholder="Component Name..." class="component-name-input" bind:value={componentName}/>
  <input type="text" placeholder="Description..." class="description-input" bind:value={description}/>
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
      <textarea class="description_edit" placeholder="Description..." bind:value={entry.description} on:input={() => (entries = [...entries])}></textarea>
      <button class="save_button" on:click={() => saveEntry(i)}>Save</button>
    {:else}
      <div class="name-entry">{entry.name}</div>
      <div class="description-entry">{entry.description}</div>
      <div class="row-actions">
        <button class="img_path_input" on:click={() => uploadImage(i)}>
          <img src="/add.svg" alt="upload" class="imgpath" />
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
    border: 2px solid #3E92B5;
    color: #CF8C44;
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
    border: 2px solid #3E92B5;
    color: #CF8C44;
    flex: 1 1 auto;
    min-height: 56px;
    box-sizing: border-box;
    word-break: break-word;
    white-space: normal;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
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
  }

  .name-title {
    flex: 0 0 160px;
    padding: 6px 10px;
    font-weight: 700;
    color: #CF8C44;
    box-sizing: border-box;
  }

  .description-title {
    flex: 1;
    padding: 6px 10px;
    font-weight: 700;
    color: #CF8C44;
    box-sizing: border-box;
  }

  :global(.button-group) { display: flex; gap: 10px; margin-left: auto; padding: 0 20px; height: 50px; }
  :global(.library-button){ background-color: #CF8C44; color: #fff; border-radius: 10px; max-width: 100px; padding: 6px 10px; }
  :global(.catalog-button){ background-color: #3E92B5; color: #fff; border-radius: 10px; max-width: 100px; padding: 6px 10px; }
  :global(.logout-button){ background-color: #b50b0b; color: #fff; border-radius: 10px; max-width: 100px; padding: 6px 10px; }

  .catalog-container {
    background-color: #000000;
    height: 80px;
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

  .description-input {
    flex: 1;
    padding: 6px 10px;
    background-color: #000000;
    color: #CF8C44;
    border: 1px solid #3E92B5;
    border-radius: 10px;
    font-size: 16px;
  }

  .add-button, .save_button{
    background-color: #CF8C44;
    color: #fff;
    border-radius: 10px;
    padding: 6px 10px;
    border: none;
    font-size: 16px;
  }

  .img_path_input,
  .edit_button_input,
  .delete_button_input {
    background-color: #000;
    border-radius: 10px;
    width: 50px;
    height: 50px;
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
  }

  .description_edit {
    flex: 1;
    padding: 8px 10px;
    background-color: #000000;
    color: #CF8C44;
    border: 1px solid #3E92B5;
    border-radius: 10px;
    font-size: 16px;
    box-sizing: border-box;
    resize: vertical;
    min-height: 80px;
  }
</style>