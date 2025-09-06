/* Climax Hosiery - Splash Screen Controller */

class SplashScreen {
  constructor() {
    this.splashElement = null;
    this.logoElement = null;
    this.barsElement = null;
    this.barElements = [];
    this.isAnimating = false;
    this.hasShown = false;
    
    // Show splash screen on every page reload
    this.shouldShow = true;
    
    this.init();
  }
  
  init() {
    if (!this.shouldShow) {
      return;
    }
    
    this.createSplashHTML();
    this.bindEvents();
    this.startAnimation();
  }
  
  createSplashHTML() {
    // Create splash screen container
    this.splashElement = document.createElement('div');
    this.splashElement.className = 'splash-screen';
    
    // Create logo element
    this.logoElement = document.createElement('img');
    this.logoElement.className = 'splash-logo';
    this.logoElement.src = './assets/images/logo.png';
    this.logoElement.alt = 'Climax Hosiery';
    this.logoElement.loading = 'eager';
    
    // Create bars container
    this.barsElement = document.createElement('div');
    this.barsElement.className = 'splash-bars';
    
    // Create three diagonal bars
    for (let i = 1; i <= 3; i++) {
      const bar = document.createElement('div');
      bar.className = `splash-bar splash-bar-${i}`;
      this.barElements.push(bar);
      this.barsElement.appendChild(bar);
    }
    
    // Assemble splash screen
    this.splashElement.appendChild(this.logoElement);
    this.splashElement.appendChild(this.barsElement);
    
    // Add to DOM
    document.body.appendChild(this.splashElement);
    document.body.classList.add('splash-active');
  }
  
  bindEvents() {
    // Skip animation on click/tap
    this.splashElement.addEventListener('click', () => {
      if (this.isAnimating) {
        this.skipAnimation();
      }
    });
    
    // Skip on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isAnimating) {
        this.skipAnimation();
      }
    });
  }
  
  startAnimation() {
    this.isAnimating = true;
    
    // Stage A: Logo Intro (0-800ms)
    setTimeout(() => {
      this.logoElement.classList.add('animate-in');
    }, 400);
    
    // Stage B: Cross-Angle Mask - Bars In (800-1600ms)
    setTimeout(() => {
      this.barElements.forEach(bar => {
        bar.classList.add('animate-in');
      });
    }, 800);
    
    // Stage C: Logo Scale Out (1600-1800ms)
    setTimeout(() => {
      this.logoElement.classList.add('animate-out');
    }, 1600);
    
    // Stage D: Reverse Reveal (1800-2200ms)
    setTimeout(() => {
      this.barElements.forEach(bar => {
        bar.classList.remove('animate-in');
        bar.classList.add('animate-out');
      });
    }, 1800);
    
    // Complete animation and cleanup (2200ms)
    setTimeout(() => {
      this.completeAnimation();
    }, 2200);
  }
  
  skipAnimation() {
    if (!this.isAnimating) return;
    
    // Clear any pending timeouts
    this.completeAnimation();
  }
  
  completeAnimation() {
    this.isAnimating = false;
    
    // Remove splash screen
    if (this.splashElement) {
      this.splashElement.classList.add('hidden');
      document.body.classList.remove('splash-active');
      
      // Clean up DOM after transition
      setTimeout(() => {
        if (this.splashElement && this.splashElement.parentNode) {
          this.splashElement.parentNode.removeChild(this.splashElement);
        }
      }, 100);
    }
    
    // Trigger any post-splash initialization
    this.onSplashComplete();
  }
  
  onSplashComplete() {
    // Dispatch custom event for other scripts to listen to
    const event = new CustomEvent('splashComplete', {
      detail: { timestamp: Date.now() }
    });
    document.dispatchEvent(event);
    
    // Initialize main site animations
    if (window.climaxHosiery && typeof window.climaxHosiery.setupScrollAnimations === 'function') {
      window.climaxHosiery.setupScrollAnimations();
    }
  }
  
  // Public method to force show splash (for testing)
  static forceShow() {
    location.reload();
  }
  
  // Public method to disable splash for session
  static disable() {
    // Create a flag to disable splash for current session
    window.splashDisabled = true;
  }
}

// Initialize splash screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Show splash on homepage every time (unless manually disabled)
  const isHomepage = window.location.pathname === '/' || 
                    window.location.pathname === '/index.html' ||
                    window.location.pathname.endsWith('/');
  
  if (isHomepage && !window.splashDisabled) {
    window.splashScreen = new SplashScreen();
  }
});

// Export for potential external use
window.SplashScreen = SplashScreen;