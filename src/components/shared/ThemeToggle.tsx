import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ThemeToggle({
  className = '',
  showLabel = false,
  size = 'md'
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const iconSize = size === 'sm' ? 14 : 16;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${size === 'sm' ? 'theme-toggle-btn--sm' : ''} ${className}`}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={isDark}
    >
      <span className="theme-toggle-icon-wrap" aria-hidden="true">
        {isDark ? (
          <Sun size={iconSize} className="theme-toggle-icon theme-toggle-icon--sun" />
        ) : (
          <Moon size={iconSize} className="theme-toggle-icon theme-toggle-icon--moon" />
        )}
      </span>
      {showLabel && (
        <span className="theme-toggle-label">
          {isDark ? 'Switch to Light' : 'Switch to Dark'}
        </span>
      )}
    </button>
  );
}
