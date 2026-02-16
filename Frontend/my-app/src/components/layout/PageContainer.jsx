export function PageContainer({ children, className = '' }) {
  return (
    <div className={`container mx-auto max-w-7xl px-4 py-8 ${className}`}>
      {children}
    </div>
  );
}
