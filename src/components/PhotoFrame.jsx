import { useRef, useState } from "react";
import { Camera, AlertCircle } from "lucide-react";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { Flower } from "./Flower.jsx";

const MAX_MB = 15;
const SIDE = 360;

// Crops to a centered square and shrinks it, so the saved photo stays small
function toSquareJpeg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        if (!side) throw new Error("empty");
        const canvas = document.createElement("canvas");
        canvas.width = SIDE;
        canvas.height = SIDE;
        canvas
          .getContext("2d")
          .drawImage(
            img,
            (img.naturalWidth - side) / 2,
            (img.naturalHeight - side) / 2,
            side,
            side,
            0,
            0,
            SIDE,
            SIDE
          );
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        reject(new Error("That image couldn't be processed."));
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file couldn't be opened as an image."));
    };
    img.src = url;
  });
}

export default function PhotoFrame() {
  const inputRef = useRef(null);
  const [photo, setPhoto] = useLocalStorage("pp:photo", "");
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Only a photo made by this app is ever shown
  const valid = typeof photo === "string" && photo.startsWith("data:image/jpeg;base64,");

  async function onFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`That image is larger than ${MAX_MB} MB.`);
      return;
    }

    setBusy(true);
    try {
      setPhoto(await toSquareJpeg(file));
      setMenu(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    if (window.confirm("Remove your photo?")) {
      setPhoto("");
      setMenu(false);
    }
  }

  function onMainClick() {
    if (valid) setMenu(!menu);
    else inputRef.current.click();
  }

  return (
    <div className="photo-frame">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        hidden
      />

      <button
        type="button"
        className={`photo-btn ${valid ? "has-photo" : "empty-photo"}`}
        onClick={onMainClick}
        disabled={busy}
        aria-label={valid ? "Your photo. Open options" : "Add a photo"}
        aria-expanded={valid ? menu : undefined}
      >
        {valid ? (
          <img src={photo} alt="Your photo" className="photo-img" />
        ) : (
          <Camera size={22} />
        )}
      </button>

      {valid && (
        <span className="photo-flower" aria-hidden="true">
          <Flower size={24} tone="rose" />
        </span>
      )}

      {(menu || error) && (
        <div className="photo-menu" role="dialog" aria-label="Photo options">
          {error && (
            <div className="photo-error">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <button
            className="btn btn-soft"
            onClick={() => inputRef.current.click()}
            disabled={busy}
          >
            {busy ? "Working..." : valid ? "Change photo" : "Choose photo"}
          </button>
          {valid && (
            <button className="btn btn-outline" onClick={remove}>
              Remove photo
            </button>
          )}
          <button
            className="link-btn small"
            onClick={() => {
              setMenu(false);
              setError("");
            }}
          >
            Close
          </button>
          <span className="muted small">
            Saved in this browser only. It isn't uploaded anywhere.
          </span>
        </div>
      )}
    </div>
  );
}
