<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/firebase";
  import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth"; // Import GoogleAuthProvider
  import DOMPurify from 'dompurify'; // Import DOMPurify for sanitization

  let activeTab = "/";
  let loading = false;
  let error = "";

  onMount(async () => {
    const { db } = await import("$lib/firebase");
    const { collection, getDocs } = await import("firebase/firestore");

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        return; // Stay on the login page
      }

      const email = (user.email || "").trim().toLowerCase();
      const snap = await getDocs(collection(db, "Admins"));
      const allowed = snap.docs.some(doc =>
        Object.values(doc.data() || {}).some(v =>
          String(v || "").trim().toLowerCase() === email
        )
      );

      if (allowed) {
        window.location.href = "/library";
      } else {
        await signOut(auth);
        alert("You are not authorized.");
      }
    });

    return unsub;
  });

  async function loginWithGoogle() {
    loading = true;
    error = "";
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const email = (result.user?.email || "").trim().toLowerCase();

      const { db } = await import("$lib/firebase");
      const { collection, getDocs } = await import("firebase/firestore");

      const snap = await getDocs(collection(db, "Admins"));
      const allowed = snap.docs.some(doc =>
        Object.values(doc.data() || {}).some(v =>
          String(v || "").trim().toLowerCase() === email
        )
      );

      if (allowed) {
        window.location.href = "/library";
      } else {
        await signOut(auth);
        error = "Access denied: your account is not an admin.";
      }
    } catch (err) {
      console.error("login error:", err);
      error = DOMPurify.sanitize(err?.message || "Login failed."); // Sanitize error message
    } finally {
      loading = false;
    }
  }

  function goTo(path) { if (typeof window !== "undefined") window.location.href = path; }
</script>

<div class="login-container">
    <div class="login-box">
        <div class="logo-wrapper">
            <img src="/logo.png" alt="Logo" class="logo" />
        </div>

        <h2>S.A.T.O ADMIN</h2>
        <p>SIGN-IN</p>

        {#if error}
            <p class="error-msg">{error}</p>
        {/if}

        <button
            class="google-btn"
            class:active={activeTab === "/"}
            on:click={loginWithGoogle}
            disabled={loading}
        >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" class="google-icon" />
            <span>{loading ? "Signing in..." : "Continue using Google"}</span>
        </button>
    </div>
</div>

<style>
    /* Whole background */
    .login-container {
        background-color: #19333c;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    /* Center box */
    .login-box {
        background: #122831;
        padding: 3rem 4rem;
        border-radius: 15px;
        box-shadow: 0 0 25px rgba(0,0,0,0.4);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        position: relative;
        min-width: 320px;
        border: 1px solid rgb(69,120,165);
    }

    /* Logo circle floating (bigger version) */
    .logo-wrapper {
        position: absolute;
        top: -160px;
        width: 250px;
        height: 250px;
        border-radius: 50%;
        border: 3px solid #1e4b3a;
        box-shadow: 0 0 20px rgba(0,0,0,0.3);
    }

    .logo {
        width: 250px;
        height: 250px;
        border-radius: 50%;
        object-fit: cover;
    }

    h2 {
        margin-top: 60px;
        color: white;
        font-weight: 700;
    }

    p {
        color: #b9e4d3;
    }

    .google-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.8rem;
        background-color: black;
        color: white;
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 10px;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .google-btn:hover:not(:disabled) {
        background-color: #0c0c0c;
        transform: scale(1.03);
    }

    .google-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .google-icon {
        width: 22px;
        height: 22px;
    }

    .error-msg {
        color: #ff6b6b;
        font-size: 0.9rem;
        margin-bottom: 0.6rem;
    }
</style>
