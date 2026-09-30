/** Minimal typed event bus used by the fight engine to publish FightEvents to presentation systems. */
export class EventBus<E extends { type: string }> {
  private handlers: Array<(e: E) => void> = [];
  on(h: (e: E) => void): () => void {
    this.handlers.push(h);
    return () => {
      this.handlers = this.handlers.filter((x) => x !== h);
    };
  }
  emit(e: E) {
    for (const h of this.handlers) h(e);
  }
}
