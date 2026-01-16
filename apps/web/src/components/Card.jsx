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
        bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[var(--border)]
        ${hoverable ? 'hover-lift cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {icon && (
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl gradient-bg flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
          {icon}
        </div>
      )}
      {title && (
        <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-[var(--text-primary)]">
          {title}
        </h4>
      )}
      {description && (
        <p className="text-[var(--text-secondary)] text-sm sm:text-base leading-relaxed">
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
      className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-[var(--border)] hover-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-bg flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform">
        <div className="text-white [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-7 sm:[&>svg]:h-7">{icon}</div>
      </div>
      <h4 className="text-base sm:text-lg font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{title}</h4>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// Stat Card Variant
export function StatCard({ value, label, icon, index = 0 }) {
  return (
    <div
      className="group text-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[var(--border)] hover-lift animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {icon && (
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform">
          <div className="text-white [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">{icon}</div>
        </div>
      )}
      <div className="text-xl sm:text-2xl md:text-3xl font-extrabold gradient-text mb-1">{value}</div>
      <div className="text-[var(--text-secondary)] text-xs sm:text-sm font-medium">{label}</div>
    </div>
  );
}
