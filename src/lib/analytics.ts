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

  const trackEvent = (event: MouseEvent) => {
    try {
      // Lazily get Firebase services to ensure they are initialized
      // This is a safeguard; in practice, the provider should ensure this.
      const app: FirebaseApp = (window as any)._firebaseApp; // Assuming provider makes it available
      if (!app) {
        // Silently fail if Firebase is not available
        return;
      }

      const db: Firestore = getFirestore(app);
      const auth: Auth = getAuth(app);
      const user = auth.currentUser;

      const target = event.target as HTMLElement;
      if (!target) return;

      // Find the most relevant element with an ID
      const trackedElement = target.closest('[id]') as HTMLElement;
      const elementId = trackedElement ? trackedElement.id : 'unidentified_element';
      
      // Don't track clicks on non-interactive elements unless they have a specific ID
      const isInteractive = trackedElement?.tagName === 'BUTTON' || trackedElement?.tagName === 'A' || trackedElement?.hasAttribute('role');
      if (elementId === 'unidentified_element' && !isInteractive) {
        return;
      }

      const batch = writeBatch(db);

      // 1. Heatmap: Log interaction details
      const interactionRef = doc(
        db,
        `interacciones/${Timestamp.now().toMillis()}_${user?.uid || 'anonymous'}`
      );
      batch.set(interactionRef, {
        x: event.clientX,
        y: event.clientY,
        elementId: elementId,
        pageUrl: window.location.pathname,
        timestamp: Timestamp.now(),
        userId: user?.uid || 'anonymous',
      });

      // 2. Button Counter: Increment clicks for the specific element ID
      if (elementId !== 'unidentified_element') {
        const buttonStatRef = doc(db, 'stats_botones', elementId);
        batch.set(
          buttonStatRef,
          { clicks: increment(1), lastClicked: Timestamp.now() },
          { merge: true }
        );
      }
      
      // 3. User Metrics: Increment total clicks for the logged-in user
      if (user) {
        const userStatRef = doc(db, 'stats_usuarios', user.uid);
        batch.set(
          userStatRef,
          { 
              total_clicks: increment(1),
              lastActive: Timestamp.now(),
              email: user.email // Store for reference
          },
          { merge: true }
        );
      }

      // 4. Global Metrics: Increment total platform clicks
      const globalStatRef = doc(db, 'config', 'dashboard');
      batch.set(
        globalStatRef,
        { total_clicks_plataforma: increment(1) },
        { merge: true }
      );

      // Commit the batch
      batch.commit().catch(() => {
        // Silently fail on network or permission error
      });
    } catch (error) {
      // Silently catch any errors (e.g., Firebase not initialized)
    }
  };

  // Attach listener to the document
  document.addEventListener('click', trackEvent, {
    capture: true, // Captures event on the way down
    passive: true, // Does not block scrolling or other default actions
  });
})();
