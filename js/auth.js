// ── AgriFlow Auth Helper ──────────────────────────────────
import { auth, db }                    from "./firebase.js";
import { initializeApp, deleteApp }    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDpTPibk-7_kqyJdfN94KrLlcKkoNnqIYE",
  authDomain:        "farmledger-e85e3.firebaseapp.com",
  projectId:         "farmledger-e85e3",
  storageBucket:     "farmledger-e85e3.firebasestorage.app",
  messagingSenderId: "922324809308",
  appId:             "1:922324809308:web:05c015ce12e55034e99899"
};

// Role → page map
export const ROLE_ROUTES = {
  admin:    "/AgriFlow/pages/admin.html",
  landlord: "/AgriFlow/pages/landlord.html",
  manager:  "/AgriFlow/pages/manager.html",
};

// Fetch user doc from Firestore safely
export async function getUserDoc(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("getUserDoc error:", e);
    return null;
  }
}

// Redirect by role — called once after login
export function redirectByRole(role) {
  const route = ROLE_ROUTES[role];
  if (!route) return false;
  window.location.href = route;
  return true;
}

// Create a user via secondary app so current session is NOT affected
export async function createUserSecondary(email, password, firestoreData) {
  let secondApp = null;
  try {
    secondApp = initializeApp(FIREBASE_CONFIG, "secondary_" + Date.now());
    const secAuth = getAuth(secondApp);
    const cred = await createUserWithEmailAndPassword(secAuth, email, password);
    const uid = cred.user.uid;

    // Write Firestore doc immediately
    await setDoc(doc(db, "users", uid), {
      uid,
      ...firestoreData,
      status:    "active",
      createdAt: serverTimestamp(),
    });

    await deleteApp(secondApp);
    return { uid, success: true };
  } catch (e) {
    if (secondApp) { try { await deleteApp(secondApp); } catch {} }
    return { success: false, error: e };
  }
}

// Logout
export async function logout() {
  try { await signOut(auth); } catch {}
  window.location.href = "/AgriFlow/index.html";
}
