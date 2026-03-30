export class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem('app-theme') || 'light';
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('app-theme', this.theme);
    this.applyTheme();
    return this.theme;
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('app-theme', theme);
    this.applyTheme();
    return this.theme;
  }

  getTheme() {
    return this.theme;
  }

  applyTheme() {
    if (this.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  getSavedTheme() {
    return localStorage.getItem('app-theme');
  }

  watchSystemTheme() {
    if ('matchMedia' in window) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      mediaQuery.addEventListener('change', (e) => {
        if (!this.getSavedTheme()) {
          const prefersDark = e.matches;
          this.theme = prefersDark ? 'dark' : 'light';
          this.setTheme(this.theme);
          this.applyTheme();
        }
      });
    }
  }
}
