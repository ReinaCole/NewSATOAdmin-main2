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
  import { auth } from "$lib/firebase";
  import { signOut } from "firebase/auth";
  import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization
  import validator from 'validator'; // Import a validator library

  // prevent SSR 500 by defining variables used in the template
  let activeTab = "library";
  function goTo(path) { if (typeof window !== "undefined") window.location.href = path; }

  let db = null;
  let entries = [];
  let componentName = "";
  let description = "";
  let saving = false;
  let loading = true; // show loading UI immediately

  onMount(async () => {
    try {
      // dynamic import to avoid SSR firebase init problems
      const mod = await import("$lib/firebase");
      db = mod.db;
      const auth = mod.auth;

      if (!db) {
        console.error("Firestore not initialized (db is undefined)");
        loading = false;
        return;
      }

      // Build query
      const q = query(collection(db, "Components"), orderBy("Name"));

      // fast initial load
      try {
        const snap = await getDocs(q);
        entries = snap.docs.map(d => ({ id: d.id, ...d.data(), editing: false }));
      } catch (err) {
        console.warn("initial getDocs failed:", err);
      } finally {
        loading = false;
      }

      // realtime listener to keep UI updated
      const unsubSnapshot = onSnapshot(q, (snap) => {
        console.log("Snapshot received:", snap.docs); // Check if this logs any documents
        entries = snap.docs.map(d => ({ id: d.id, ...d.data(), editing: false }));
      }, (err) => {
        console.error("onSnapshot error:", err);
      });

      // set up auth guard (non-blocking while not signed in)
      const { onAuthStateChanged, signOut } = await import("firebase/auth");
      const { collection: colFn, getDocs: getDocsFn } = await import("firebase/firestore");
      const unsubAuth = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          // not signed in — do nothing (stay on page or login page should handle)
          return;
        }

        // check Admins collection for any field matching the signed-in email (case-insensitive)
        try {
          const email = (user.email || "").trim().toLowerCase();
          const snap = await getDocsFn(colFn(db, "Admins"));
          const allowed = snap.docs.some(d =>
            Object.values(d.data() || {}).some(v =>
              String(v || "").trim().toLowerCase() === email
            )
          );
          console.log("Is user allowed:", allowed); // Log whether the user is allowed

          if (!allowed) {
            await signOut(auth);
            alert("You are not authorized.");
            window.location.href = "/";
          }
        } catch (err) {
          console.error("admin-check error:", err);
        }
      });

      // cleanup both listeners on destroy
      return () => {
        try { unsubSnapshot && unsubSnapshot(); } catch(e) {}
        try { unsubAuth && unsubAuth(); } catch(e) {}
      };
    } catch (err) {
      console.error("onMount init error:", err);
      loading = false;
    }
  });

  async function addEntry() {
    const name = DOMPurify.sanitize(componentName.trim());
    const desc = DOMPurify.sanitize(description.trim());

    // Validate input
    if (!validator.isLength(name, { min: 1 })) {
      alert("Component name cannot be empty.");
      return;
    }

    if (!db) { alert("Database not ready"); return; }
    saving = true;
    try {
      await addDoc(collection(db, "Components"), { Name: name, Description: desc });
      componentName = "";
      description = "";
    } catch (err) {
      console.error(err);
      alert("Failed to add: " + (err?.message || err));
    } finally {
      saving = false;
    }
  }

  function editEntry(i) {
    entries[i].editing = true;
    entries = [...entries];
  }

  async function saveEntry(i) {
    if (!db) { console.error("saveEntry: db not ready"); return; }
    const e = entries[i];
    if (!e || !e.id) return;
    try {
      saving = true;
      await updateDoc(doc(db, "Components", e.id), {
        Name: e.Name,
        Description: e.Description
      });
      entries[i].editing = false;
      entries = [...entries];
      console.log("saved", e.id);
    } catch (err) {
      console.error("save error", err);
    } finally {
      saving = false;
    }
  }

  async function deleteEntry(i) {
    if (!db) { console.error("deleteEntry: db not ready"); return; }
    const e = entries[i];
    if (!e || !e.id) return;
    if (!confirm("Delete this component?")) return;
    try {
      await deleteDoc(doc(db, "Components", e.id));
      console.log("deleted", e.id);
    } catch (err) {
      console.error("delete error", err);
    }
  }

  function logout() {
    signOut(auth)
      .then(() => {
        // ensure client returns to login and session cleared
        window.location.href = "/";
      })
      .catch(err => {
        console.error("signOut failed:", err);
        alert("Sign out failed: " + err.message);
      });
  }

  async function addTestData() {
    if (!db) return;
    try {
      await addDoc(collection(db, "Components"), { Name: "Test Component", Description: "This is a test." });
      console.log("Test data added.");
    } catch (err) {
      console.error("Error adding test data:", err);
    }
  }
</script>

<div class="page">
    <header class="topbar">
        <div class="title">ADMIN LIBRARY</div>

        <div class="controls">
            <button class="pill logout" on:click={logout}>LOGOUT</button>
            <button class="pill" class:active={activeTab === "library"} on:click={() => goTo("/library")}>LIBRARY</button>
            <button class="pill accent" class:active={activeTab === "catalog"} on:click={() => goTo("/catalog")}>CATALOG</button>
        </div>
    </header>

    <main class="container">
        <section class="input-row">
            <input
                class="input name"
                placeholder="Component name..."
                bind:value={componentName} />

            <input
                class="input desc"
                placeholder="Description..."
                bind:value={description} />

            <button class="add" on:click={addEntry}>ADD</button>
        </section>

        <section class="list-headers">
            <div class="col name-col">Name:</div>
            <div class="col desc-col">Description:</div>
        </section>

        {#each entries as entry, i (entry.id)}
          <div class="row">
            {#if entry.editing}
              <div class="name-box">
                <input class="name-edit" bind:value={entry.Name} />
              </div>

              <div class="desc-box">
                <textarea class="desc-edit" bind:value={entry.Description}></textarea>
              </div>

              <button class="icon save" type="button" on:click={() => saveEntry(i)} title="Save">
                ✓
              </button>
              <button class="icon del" type="button" on:click={() => { entry.editing = false; entries = [...entries]; }} title="Cancel">
                ✕
              </button>
            {:else}
              <div class="name-box">{entry.Name}</div>
              <div class="desc-box">{entry.Description}</div>
              <button class="icon edit" type="button" on:click={() => editEntry(i)} title="Edit">✎</button>
              <button class="icon del" type="button" on:click={() => deleteEntry(i)} title="Delete">🗑</button>
            {/if}
          </div>
        {/each}
    </main>
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        background: #112327;
        color: #e6e6e6;
    }

    .page { min-height: 100vh; }

    .topbar {
        position: sticky;
        top: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 22px;
        background: linear-gradient(90deg,#0f2b2f,#081c1e);
        border-bottom: 2px solid #7aa6c6;
        box-shadow: 0 6px 18px rgba(0,0,0,0.6);
        z-index: 50;
    }

    .title {
        color: #f4b454;
        font-weight: 700;
        letter-spacing: .6px;
    }

    .controls { display: flex; gap: 10px; align-items: center; }

    .pill {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.05);
        color: #ddd;
        padding: 8px 12px;
        border-radius: 16px;
        cursor: pointer;
        font-weight: 600;
    }
    .pill.accent { background: #123e48; border-color: #2e85a8; color: #fff; }
    .pill.logout { background: #931f1f; border-color: #742020; color: #fff; }

    .container {
        max-width: 1100px;
        margin: 24px auto;
        padding: 16px;
    }

    .input-row {
        display: flex;
        gap: 10px;
        align-items: center;
        margin-bottom: 14px;
    }

    .input {
        background: #081818;
        color: #e6e6e6;
        border: 1px solid #234d57;
        padding: 10px 12px;
        border-radius: 10px;
        outline: none;
    }
    .input.name { width: 180px; }
    .input.desc { flex: 1; }

    .add {
        background: linear-gradient(180deg,#f0b86b,#c77e3c);
        border: none;
        color: #080808;
        padding: 10px 18px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
    }

    .list-headers {
        display: flex;
        gap: 10px;
        margin-bottom: 8px;
        color: #c7a36d;
        font-weight: 700;
        padding: 8px 6px;
    }

    .col { padding-left: 6px; }
    .name-col { width: 160px; }
    .desc-col { flex: 1; }

    /* set a single row item height variable so name, desc and icons match */
    :root {
        --row-item-height: 56px;
    }

    .row {
        display: flex;
        gap: 10px;
        align-items: flex-start;   /* allow independent heights, align children to top */
        padding: 8px 0;
        margin-bottom: 10px;
        background: transparent;
        border: none;
        border-radius: 0;
        position: relative;        /* keep layout stable when pushing icons to the right */
    }

    /* keep name fixed height (does NOT follow description) */
    .name-box {
        background: #000000;
        color: #ffd89b;
        border: 1px solid #3e92b5;
        display: flex;
        align-items: center; /* vertically center the name text */
        padding: 12px;
        width: 160px;
        flex: 0 0 160px;
        white-space: normal;
        word-break: break-word;
        border-radius: 8px;
        box-sizing: border-box;

        /* FIXED height — does NOT stretch with description */
        height: 56px;
        min-height: 56px;
        max-height: 56px;
        overflow: hidden;
        align-self: flex-start;
    }

    /* description grows, name stays fixed-height (unchanged) */
    .desc-box {
        background: #1b1313;
        color: #ffd89b;
        border: 1px solid rgba(62,146,181,0.08);
        padding: 10px;
        flex: 1 1 auto;
        white-space: normal;
        word-break: break-word;
        border-radius: 8px;
        box-shadow: inset 0 -6px 14px rgba(0,0,0,0.35);

        height: auto;
        min-height: 56px;
        overflow: visible;
        box-sizing: border-box;
    }

    /* icons: keep fixed square size, align to the top of the row (same "latitude" as name),
       and push the first icon to the far right so the icon pair sits where you marked */
    .icon {
        background: #000000;
        border: 1px solid #3e92b5;
        color: #ffd89b;

        width: 44px;
        height: 44px;
        flex: 0 0 44px;
        display: flex;
        align-items: center;
        justify-content: center;

        align-self: flex-start;    /* align to top (same latitude as name) */
        margin-left: 12px;         /* small gap from description */
        box-sizing: border-box;
        padding: 0;
        border-radius: 8px;
        cursor: pointer;
        box-shadow: inset 0 -6px 14px rgba(0,0,0,0.35);
    }

    /* push the icon group to the far right of the row */
    .icon:first-of-type {
        margin-left: auto;
    }

    .icon img { width: 18px; height: 18px; }
    .icon.del { background: #3a0b0b; border-color: #742020; }

    /* editing inputs - ensure textarea wraps and is scrollable */
    .name-edit, .desc-edit {
        background: #071818;
        color: #e6e6e6;
        border: 1px solid #234d57;
        min-height: 36px;
        padding: 8px;
        width: 100%;
    }
    .desc-edit {
        resize: vertical;
        max-height: 200px;
        overflow: auto;
    }

    /* save/cancel buttons keep the same size/alignment as other icons */
    .icon.save, .icon.del {
      width: 44px;
      height: 44px;
      flex: 0 0 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: flex-start; /* same latitude as name-box top */
      margin-left: 12px;
    }

    @media (max-width: 800px) {
        .row { grid-template-columns: 1fr; gap:8px; }
        .icon { justify-self: end; }
        .list-headers { display:none; }
    }

    /* keep edit inputs filling the same boxes so layout doesn't jump */
    .name-box, .desc-box { box-sizing: border-box; }

    .name-edit {
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      color: inherit;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      font: inherit;
      outline: none;
    }

    .desc-edit {
      width: 100%;
      min-height: 56px; /* same visual min as read view */
      border: none;
      background: transparent;
      color: inherit;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      font: inherit;
      resize: vertical; /* allow resizing when editing */
      outline: none;
    }
</style>