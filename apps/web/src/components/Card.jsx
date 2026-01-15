export default function Card({
  children,
  icon,
  title,
  description,
  hoverable = true,
  className = '',
  ...props
}) {
  return (
    <div
      className={`
        bg-white rounded-2xl p-6 border border-[var(--border)]
        ${hoverable ? 'hover-lift cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && (
        <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-5 shadow-md">
          {icon}
        </div>
      )}
      {title && (
        <h4 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
          {title}
        </h4>
      )}
      {description && (
        <p className="text-[var(--text-secondary)] leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}

// Feature Card Variant
export function FeatureCard({ icon, title, description, index = 0 }) {
  return (
    <div
      className="bg-white rounded-2xl p-8 border border-[var(--border)] hover-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6 shadow-md group-hover:shadow-lg transition-shadow">
        <div className="text-white">{icon}</div>
      </div>
      <h4 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{title}</h4>
      <p className="text-[var(--text-secondary)] leading-relaxed">{description}</p>
    </div>
  );
}

// Stat Card Variant
export function StatCard({ value, label, icon, index = 0 }) {
  return (
    <div
      className="text-center p-8 rounded-2xl bg-white border border-[var(--border)] hover-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {icon && (
        <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-md">
          {icon}
        </div>
      )}
      <div className="text-4xl font-bold gradient-text mb-2">{value}</div>
      <div className="text-[var(--text-secondary)] font-medium">{label}</div>
    </div>
  );
}
