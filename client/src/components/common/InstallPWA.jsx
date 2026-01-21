import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSince = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        return;
      }
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('📱 PWA: Install prompt received');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For testing: show banner after 3 seconds if on mobile Chrome
    const isMobileChrome = /Android/i.test(navigator.userAgent) && /Chrome/i.test(navigator.userAgent);
    if (isMobileChrome && !dismissed) {
      setTimeout(() => {
        // If no prompt received, still show banner for manual installation instructions
        if (!deferredPrompt) {
          console.log('📱 PWA: Showing banner for mobile Chrome');
          setShowInstallBanner(true);
        }
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // No native prompt available, show manual instructions
      alert('To install:\n1. Tap the menu (⋮)\n2. Select "Add to Home screen" or "Install app"');
      return;
    }

    // Show install prompt
    deferredPrompt.prompt();

    // Wait for user response
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa-install-dismissed', Date.now());
  };

  if (!showInstallBanner) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 left-4 right-4 z-50 animate-comic-pop"
      style={{ maxWidth: '400px', margin: '0 auto' }}
    >
      <div 
        className="p-4 border-4 border-black rounded-2xl flex items-center gap-3"
        style={{
          backgroundColor: '#FFD700',
          boxShadow: '6px 6px 0 black',
        }}
      >
        <div className="flex-shrink-0 w-12 h-12 bg-white border-3 border-black rounded-lg flex items-center justify-center">
          <span className="text-2xl">📱</span>
        </div>
        
        <div className="flex-1">
          <p className="font-black text-sm uppercase mb-1">Install DuBu Chat!</p>
          <p className="text-xs font-bold">Use it like a native app 🚀</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleInstallClick}
            className="px-3 py-2 font-black text-xs uppercase border-3 border-black rounded-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: '#00D9FF',
              boxShadow: '3px 3px 0 black',
            }}
          >
            ✓ Install
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-2 py-2 font-black text-xs border-3 border-black rounded-lg transition-transform hover:scale-105"
            style={{
              backgroundColor: 'white',
              boxShadow: '3px 3px 0 black',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPWA;
