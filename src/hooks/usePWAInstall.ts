import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__deferredPrompt) {
      return window.__deferredPrompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect standalone mode (already installed PWA)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };

    checkStandalone();

    // Detect OS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // If early prompt was caught
    if (window.__deferredPrompt) {
      setDeferredPrompt(window.__deferredPrompt);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__deferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const handlePromptCaptured = () => {
      if (window.__deferredPrompt) {
        setDeferredPrompt(window.__deferredPrompt);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-captured', handlePromptCaptured);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-captured', handlePromptCaptured);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<{ success: boolean; reason?: string }> => {
    // If prompt is ready, trigger native browser install prompt directly
    const promptToUse = deferredPrompt || (typeof window !== 'undefined' ? window.__deferredPrompt : null);
    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          if (typeof window !== 'undefined') window.__deferredPrompt = null;
          return { success: true };
        }
        return { success: false, reason: 'Dibatalkan oleh pengguna' };
      } catch (err: any) {
        console.warn('Install prompt error:', err);
        return { success: false, reason: err?.message || 'Gagal memicu install' };
      }
    }

    return { success: false, reason: 'prompt_not_ready' };
  }, [deferredPrompt]);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    deferredPrompt,
    install,
  };
}
