/**
 * Utilitaires d'accessibilité (a11y)
 */

/**
 * Génère un ID unique pour les éléments accessibles
 */
let idCounter = 0;
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Props pour les éléments accessibles
 */
export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-haspopup'?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  role?: string;
  tabIndex?: number;
}

/**
 * Crée les props pour un bouton accessible
 */
export function getButtonA11yProps(
  label: string,
  options: {
    disabled?: boolean;
    expanded?: boolean;
    controls?: string;
    haspopup?: boolean | 'menu' | 'listbox' | 'dialog';
  } = {}
): A11yProps {
  return {
    'aria-label': label,
    'aria-disabled': options.disabled,
    'aria-expanded': options.expanded,
    'aria-controls': options.controls,
    'aria-haspopup': options.haspopup,
    role: 'button',
    tabIndex: options.disabled ? -1 : 0,
  };
}

/**
 * Crée les props pour un élément de liste accessible
 */
export function getListItemA11yProps(index: number, total: number): A11yProps {
  return {
    role: 'listitem',
    'aria-setsize': total,
    'aria-posinset': index + 1,
  } as A11yProps;
}

/**
 * Crée les props pour un modal accessible
 */
export function getModalA11yProps(
  titleId: string,
  descriptionId?: string
): A11yProps {
  return {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
  } as A11yProps;
}

/**
 * Crée les props pour une alerte accessible
 */
export function getAlertA11yProps(type: 'info' | 'warning' | 'error' | 'success'): A11yProps {
  return {
    role: 'alert',
    'aria-live': type === 'error' ? 'assertive' : 'polite',
  };
}

/**
 * Crée les props pour un champ de formulaire accessible
 */
export function getInputA11yProps(
  label: string,
  options: {
    required?: boolean;
    invalid?: boolean;
    errorId?: string;
    describedBy?: string;
  } = {}
): Record<string, unknown> {
  const props: Record<string, unknown> = {
    'aria-label': label,
  };

  if (options.required) {
    props['aria-required'] = true;
  }

  if (options.invalid) {
    props['aria-invalid'] = true;
  }

  const describedBy: string[] = [];
  if (options.errorId && options.invalid) {
    describedBy.push(options.errorId);
  }
  if (options.describedBy) {
    describedBy.push(options.describedBy);
  }
  if (describedBy.length > 0) {
    props['aria-describedby'] = describedBy.join(' ');
  }

  return props;
}

/**
 * Annonce un message aux lecteurs d'écran
 */
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Supprimer après l'annonce
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Gère le focus trap pour les modaux
 */
export function createFocusTrap(container: HTMLElement): {
  activate: () => void;
  deactivate: () => void;
} {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  let previouslyFocused: HTMLElement | null = null;

  const getFocusableElements = (): HTMLElement[] => {
    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;

    const focusable = getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return {
    activate: () => {
      previouslyFocused = document.activeElement as HTMLElement;
      container.addEventListener('keydown', handleKeyDown);

      // Focus le premier élément focusable
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    },
    deactivate: () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restaurer le focus précédent
      if (previouslyFocused) {
        previouslyFocused.focus();
      }
    },
  };
}

/**
 * Vérifie le contraste des couleurs (WCAG AA)
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; passesAA: boolean; passesAAA: boolean } {
  const getLuminance = (hex: string): number => {
    const rgb = hex
      .replace('#', '')
      .match(/.{2}/g)!
      .map((x) => parseInt(x, 16) / 255)
      .map((x) => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));

    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}

/**
 * Détecte si l'utilisateur préfère les animations réduites
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Détecte si l'utilisateur préfère un contraste élevé
 */
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Classe utilitaire pour cacher visuellement mais garder accessible
 */
export const srOnlyClass = 'sr-only';

/**
 * CSS pour .sr-only (à ajouter au CSS global)
 * .sr-only {
 *   position: absolute;
 *   width: 1px;
 *   height: 1px;
 *   padding: 0;
 *   margin: -1px;
 *   overflow: hidden;
 *   clip: rect(0, 0, 0, 0);
 *   white-space: nowrap;
 *   border: 0;
 * }
 */
