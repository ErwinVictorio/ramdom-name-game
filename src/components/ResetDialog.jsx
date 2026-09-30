import { useEffect, useRef } from "react";

export default function ResetDialog({ onCancel, onReset }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="reset-dialog"
      aria-labelledby="reset-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <h2 id="reset-title">Reset the game?</h2>
      <p>
        All current names and results will be cleared. The timer will return to
        5 seconds.
      </p>
      <div className="dialog-actions">
        <button autoFocus className="secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary" onClick={onReset}>
          Reset Game
        </button>
      </div>
    </dialog>
  );
}
