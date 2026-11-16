import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Shuffle, Check } from "lucide-react";
import { shuffled } from "../lib/shuffle.js";
import Celebrate from "./Celebrate.jsx";

export default function FlashcardStudy({ ids, cards, onSetReviewed, onExit }) {
  const [order, setOrder] = useState(ids);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [dir, setDir] = useState("next");
  const [celebrate, setCelebrate] = useState(false);

  const byId = new Map(cards.map((c) => [c.id, c]));
  const card = byId.get(order[index]);

  if (!card) {
    return (
      <div className="stack">
        <button className="btn btn-outline" onClick={onExit}>
          <ArrowLeft size={18} /> Back to cards
        </button>
        <div className="card card-soft">
          <p style={{ margin: 0 }}>This card is no longer available.</p>
        </div>
      </div>
    );
  }

  const reviewedCount = order.filter((id) => byId.get(id)?.reviewed).length;
  const percent = Math.round((reviewedCount / order.length) * 100);

  function go(newIndex) {
    setDir(newIndex > index ? "next" : "prev");
    setIndex(newIndex);
    setRevealed(false);
  }

  function shuffleCards() {
    setOrder(shuffled(order));
    setDir("next");
    setIndex(0);
    setRevealed(false);
  }

  function toggleReviewed() {
    const making = !card.reviewed;
    onSetReviewed(card.id, making);
    // Celebrate only when she really has reviewed every card in this round
    if (making && reviewedCount + 1 === order.length) setCelebrate(true);
  }

  return (
    <div className="stack">
      {celebrate && <Celebrate onDone={() => setCelebrate(false)} />}

      <div>
        <button className="btn btn-outline" onClick={onExit}>
          <ArrowLeft size={18} /> Back to cards
        </button>
      </div>

      <div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="small">
            <strong>
              Card {index + 1} of {order.length}
            </strong>
          </span>
          <span className="muted small">
            {reviewedCount} of {order.length} reviewed
          </span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ marginTop: "var(--space-2)" }}
        >
          <div className="progress-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* The key makes each new card start fresh, so the next answer is never shown while turning */}
      <div key={card.id} className={`card-stage slide-${dir}`}>
        <button
          type="button"
          className={`flip ${revealed ? "is-flipped" : ""}`}
          onClick={() => setRevealed(!revealed)}
        >
          <span className="flip-inner">
            <span className="flip-face flip-front" aria-hidden={revealed}>
              <span className="flash-label">Question</span>
              <span className="flash-text">{card.front}</span>
              <span className="muted small">Tap to reveal the answer</span>
            </span>
            <span className="flip-face flip-back" aria-hidden={!revealed}>
              <span className="flash-q">{card.front}</span>
              <span className="flash-label">Answer</span>
              <span className="flash-text">{card.back}</span>
              <span className="muted small">Tap to flip back</span>
            </span>
          </span>
        </button>
      </div>

      <div className="pager">
        <button
          className="btn btn-outline"
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          <ChevronLeft size={18} /> Previous
        </button>
        <button
          className="btn btn-soft btn-icon"
          onClick={shuffleCards}
          aria-label="Shuffle cards"
        >
          <Shuffle size={18} />
        </button>
        <button
          className="btn btn-outline"
          onClick={() => go(index + 1)}
          disabled={index === order.length - 1}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

      <button
        className={`btn ${card.reviewed ? "btn-soft" : "btn-primary"}`}
        onClick={toggleReviewed}
      >
        <span key={card.reviewed ? "done" : "todo"} className="pop">
          <Check size={18} />
        </span>
        {card.reviewed ? "Reviewed (tap to undo)" : "Mark as reviewed"}
      </button>

      {reviewedCount === order.length && (
        <p className="small" style={{ margin: 0, textAlign: "center", fontWeight: 700 }}>
          You've reviewed every card in this round. 💗
        </p>
      )}
      {reviewedCount !== order.length && index === order.length - 1 && (
        <p className="muted small" style={{ margin: 0, textAlign: "center" }}>
          That's the last card. Nice work. 💗
        </p>
      )}
    </div>
  );
}
