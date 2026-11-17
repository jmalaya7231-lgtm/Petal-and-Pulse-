// Lets other parts of the app tell Poppy something happened
export function poppyEvent(name, detail = {}) {
  try {
    window.dispatchEvent(new CustomEvent("poppy", { detail: { name, ...detail } }));
  } catch {
    // Poppy is optional
  }
}
