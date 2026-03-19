const paws = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + Math.random() * 80}%`,
  delay: `${i * 0.8}s`,
  size: 16 + Math.random() * 12,
  duration: `${5 + Math.random() * 4}s`,
}));

const FloatingPaws = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
    {paws.map((p) => (
      <span
        key={p.id}
        className="absolute bottom-0 animate-paw-drift text-primary/20"
        style={{
          left: p.left,
          animationDelay: p.delay,
          animationDuration: p.duration,
          fontSize: p.size,
        }}
      >
        🐾
      </span>
    ))}
  </div>
);

export default FloatingPaws;
