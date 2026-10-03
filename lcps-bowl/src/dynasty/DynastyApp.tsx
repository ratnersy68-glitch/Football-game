export function DynastyApp({ onExit }: { mode: 'new' | 'continue' | 'play'; onExit: () => void }) {
  return <div className="screen"><button onClick={onExit}>Back</button></div>;
}
