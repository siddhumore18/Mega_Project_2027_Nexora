/**
 * Cross-platform, popup-blocker-proof printing engine for Nexora.
 * Works seamlessly on localhost, Vercel deployments, mobile, and desktop browsers.
 * Avoids window.open() popup blocking and avoids blank print dialogs caused by SPA CSS hiding.
 */
export const printViaIsolatedFrame = (html: string, documentTitle?: string): void => {
  try {
    const existing = document.getElementById("nexora-print-frame");
    if (existing) {
      try {
        document.body.removeChild(existing);
      } catch (_) {}
    }

    const frame = document.createElement("iframe");
    frame.id = "nexora-print-frame";
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.visibility = "hidden";
    frame.style.zIndex = "-9999";
    document.body.appendChild(frame);

    const frameDoc = frame.contentWindow?.document || frame.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(html);
      frameDoc.close();

      if (documentTitle && frameDoc.title !== documentTitle) {
        frameDoc.title = documentTitle;
      }

      const win = frame.contentWindow;
      if (win) {
        win.focus();
        setTimeout(() => {
          try {
            win.print();
          } catch (e) {
            console.warn("Iframe print threw, falling back to window.open", e);
            const w = window.open("", "_blank");
            if (w) {
              w.document.write(html);
              w.document.close();
              w.focus();
              setTimeout(() => w.print(), 350);
            }
          }
          setTimeout(() => {
            try {
              if (document.body.contains(frame)) {
                document.body.removeChild(frame);
              }
            } catch (_) {}
          }, 4000);
        }, 400);
        return;
      }
    }
  } catch (err) {
    console.warn("Error initializing isolated print iframe:", err);
  }

  // Fallback if iframe fails completely
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 350);
  } else {
    window.print();
  }
};
