export const Background = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-base" />
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      <div className="gradient-orb orb-3" />
      <div className="gradient-orb orb-4" />
      <div className="gradient-orb orb-5" />
      <div className="absolute inset-0 noise-overlay" />
    </div>
  );
};
