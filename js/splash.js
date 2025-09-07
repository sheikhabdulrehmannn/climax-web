/* Climax Hosiery - New Splash Screen Controller */

class SplashScreen {
  constructor() {
    this.splashElement = null;
    this.logoElement = null;
    this.barsElement = null;
    this.barElements = [];
    this.isAnimating = false;
    
    // Only show on direct page loads/reloads, not internal navigation
    this.shouldShow = this.isDirectPageLoad();
    
    if (this.shouldShow) {
      this.init();
    }
  }
  
  isDirectPageLoad() {
    // Check if this is a direct page load or reload
    // Performance navigation API to detect reload vs navigation
    if (performance.navigation) {
      // Legacy API
      return performance.navigation.type === performance.navigation.TYPE_RELOAD || 
             performance.navigation.type === performance.navigation.TYPE_NAVIGATE;
    } else if (performance.getEntriesByType) {
      // Modern API
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        const navType = navEntries[0].type;
        return navType === 'reload' || navType === 'navigate';
      }
    }
    
    // Fallback: check if referrer is same origin (internal navigation)
    const isInternalNavigation = document.referrer && 
                                new URL(document.referrer).origin === window.location.origin;
    
    return !isInternalNavigation;
  }
  
  init() {
    this.createSplashHTML();
    this.bindEvents();
    this.startAnimation();
  }
  
  createSplashHTML() {
    // Create splash screen container (starts black)
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
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      this.runReducedMotionAnimation();
      return;
    }
    
    // FRAME 1-2: Logo Fade-In (0-500ms)
    setTimeout(() => {
      this.logoElement.classList.add('animate-in');
    }, 100);
    
    // FRAME 3-4: Logo Shrink and Disappear (500-900ms)
    setTimeout(() => {
      this.logoElement.classList.add('animate-shrink');
    }, 500);
    
    // FRAME 5-6: Bars Appear (900-1200ms)
    setTimeout(() => {
      this.barsElement.classList.add('visible');
      this.barElements.forEach(bar => {
        bar.classList.add('animate-in');
      });
    }, 900);
    
    // FRAME 7: Hold with bars covering (1200-1400ms)
    // (Natural pause as bars settle)
    
    // FRAME 8: Bars Retract (1400-1800ms)
    setTimeout(() => {
      this.barElements.forEach(bar => {
        bar.classList.remove('animate-in');
        bar.classList.add('animate-out');
      });
    }, 1400);
    
    // Complete animation and cleanup (1800ms)
    setTimeout(() => {
      this.completeAnimation();
    }, 1800);
  }
  
  runReducedMotionAnimation() {
    // Simple fade for reduced motion users
    setTimeout(() => {
      this.logoElement.classList.add('animate-in');
    }, 100);
    
    setTimeout(() => {
      this.logoElement.classList.add('animate-shrink');
    }, 400);
    
    setTimeout(() => {
      this.splashElement.classList.add('fade-out');
    }, 700);
    
    setTimeout(() => {
      this.completeAnimation();
    }, 1000);
  }
  
  skipAnimation() {
    if (!this.isAnimating) return;
    
    // Clear any pending timeouts and complete immediately
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
    
    // Trigger completion event
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
}

// Initialize splash screen when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only show on homepage and only for direct loads/reloads
  const isHomepage = window.location.pathname === '/' || 
                    window.location.pathname === '/index.html' ||
                    window.location.pathname.endsWith('/') ||
                    window.location.pathname === '';
  
  if (isHomepage) {
    window.splashScreen = new SplashScreen();
  }
});

// Export for potential external use
window.SplashScreen = SplashScreen;