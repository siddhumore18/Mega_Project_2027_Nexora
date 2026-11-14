/**
 * Cross-platform, popup-blocker-proof printing engine for Nexora.
 * Works seamlessly on localhost, Vercel deployments, mobile, and desktop browsers.
 * Avoids window.open() popup blocking and avoids blank print dialogs.
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
    // Place off-screen with positive geometry so Chromium/WebKit computes full layout & paint tree
    frame.style.position = "fixed";
    frame.style.top = "-10000px";
    frame.style.left = "-10000px";
    frame.style.width = "1024px";
    frame.style.height = "768px";
    frame.style.border = "0";
    frame.style.opacity = "0.01";
    frame.style.pointerEvents = "none";
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

/**
 * Downloads a self-contained HTML document to disk directly as a file.
 */
export const downloadHtmlDocument = (html: string, filename: string): void => {
  try {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error("Failed to download document:", err);
  }
};
