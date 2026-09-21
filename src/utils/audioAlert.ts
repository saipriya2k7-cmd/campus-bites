// Web Audio API chime generator for kitchen order alerts
let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        sharedAudioCtx = new AudioContextClass();
      }
    }
    if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (err) {
    return null;
  }
}

// Unlock audio context on first user click/touch anywhere on the page
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

export function playOrderAlertChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Triple cheerful kitchen chime: D5 (587Hz) -> A5 (880Hz) -> D6 (1174Hz)
    const playTone = (freq: number, start: number, duration: number, peakGain = 0.35) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Richer, more resonant timbre for kitchen alerts
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(peakGain, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration);
    };

    // First bell chime (587.33 Hz)
    playTone(587.33, now, 0.45, 0.3);
    // Second higher bell chime (880 Hz)
    playTone(880.00, now + 0.18, 0.55, 0.35);
    // Third high attention chime (1174.66 Hz)
    playTone(1174.66, now + 0.36, 0.75, 0.4);

  } catch (err) {
    console.debug('Chef notification audio chime skipped:', err);
  }
}

// Optional Desktop Notification for Chef if browser permissions are granted
export function sendChefDesktopNotification(title: string, body: string) {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/assets/canteen_hero_banner.jpg',
          tag: 'campus-bites-order'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification(title, {
              body,
              icon: '/assets/canteen_hero_banner.jpg',
              tag: 'campus-bites-order'
            });
          }
        });
      }
    }
  } catch (e) {
    // Non-fatal if notifications not supported in iframe
  }
}

