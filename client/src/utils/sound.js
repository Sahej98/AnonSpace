
export const playClickSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Soft "thump" click sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
    } catch (error) {
        // Silent fail if audio context not allowed
    }
};
