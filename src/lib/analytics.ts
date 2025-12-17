'use client';

import {
  getFirestore,
  writeBatch,
  doc,
  increment,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';

// IIFE to encapsulate the analytics logic
(function () {
  if (typeof window === 'undefined') {
    return;
  }

  // Ensure the script runs only once
  if ((window as any).analyticsScriptAttached) {
    return;
  }
  (window as any).analyticsScriptAttached = true;

  // 1. In-memory object to accumulate click stats for the session.
  const sessionStats: { [elementId: string]: number } = {};
  let isSaving = false;

  // 2. Function to save the accumulated stats to Firestore.
  const saveStatsToFirestore = () => {
    // Prevent saving if a save is already in progress or if there's nothing to save.
    if (isSaving || Object.keys(sessionStats).length === 0) {
      return;
    }

    isSaving = true;

    try {
      const app: FirebaseApp = (window as any)._firebaseApp;
      if (!app) {
        // Silently fail if Firebase is not initialized.
        isSaving = false;
        return;
      }

      const db: Firestore = getFirestore(app);
      const auth: Auth = getAuth(app);
      const user = auth.currentUser;

      const batch = writeBatch(db);
      let totalSessionClicks = 0;

      // Iterate over the accumulated stats.
      for (const elementId in sessionStats) {
        if (Object.prototype.hasOwnProperty.call(sessionStats, elementId)) {
          const clicks = sessionStats[elementId];
          totalSessionClicks += clicks;

          // Update stats_botones for each element.
          const buttonStatRef = doc(db, 'stats_botones', elementId);
          batch.set(
            buttonStatRef,
            { clicks: increment(clicks), lastClicked: Timestamp.now() },
            { merge: true }
          );
        }
      }
      
      // Update stats_usuarios for the current user.
      if (user) {
        const userStatRef = doc(db, 'stats_usuarios', user.uid);
        batch.set(
          userStatRef,
          { 
              total_clicks: increment(totalSessionClicks),
              lastActive: Timestamp.now(),
              email: user.email
          },
          { merge: true }
        );
      }

      // Update global platform clicks.
      const globalStatRef = doc(db, 'config', 'dashboard');
      batch.set(
        globalStatRef,
        { total_clicks_plataforma: increment(totalSessionClicks) },
        { merge: true }
      );
      
      // Commit the batch and clean up.
      batch.commit().then(() => {
        // Clear the session stats after successful save.
        for (const key in sessionStats) {
          delete sessionStats[key];
        }
      }).catch(() => {
        // Silently fail on network/permission error.
        // The data will remain in sessionStats and will be retried on the next event.
      }).finally(() => {
        isSaving = false;
      });

    } catch (error) {
      // Silently catch any errors (e.g., Firebase not initialized).
      isSaving = false;
    }
  };


  // 3. Passive global click listener.
  const trackEvent = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target) return;

    const trackedElement = target.closest('[id]') as HTMLElement;
    const elementId = trackedElement ? trackedElement.id : null;

    if (!elementId) return; // Only track elements with an ID.

    // Increment the counter in the local session object.
    sessionStats[elementId] = (sessionStats[elementId] || 0) + 1;
  };
  
  document.addEventListener('click', trackEvent, {
    capture: true,
    passive: true,
  });

  // 4. Attach listeners to save stats when the user navigates away.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveStatsToFirestore();
    }
  });

  // 'pagehide' is more reliable for mobile browsers.
  window.addEventListener('pagehide', saveStatsToFirestore);

})();
