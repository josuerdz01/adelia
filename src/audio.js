let context;
export async function playSound(kind, enabled = true) {
  if (!enabled) return;
  try {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    context ||= new Audio();
    await context.resume();
    const now = context.currentTime;
    const tone = (frequency, start, duration, volume, type = 'sine') => {
      const osc = context.createOscillator(), gain = context.createGain();
      osc.type = type; osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(volume, start + .008);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      osc.connect(gain); gain.connect(context.destination); osc.start(start); osc.stop(start + duration);
    };
    if (kind === 'correct') { [523.25, 659.25, 783.99].forEach((n,i) => tone(n, now + i * .10, .35, .075)); }
    else if (kind === 'hint') { tone(330, now, .15, .055); tone(294, now + .1, .2, .04); }
    else {
      const buffer = context.createBuffer(1, context.sampleRate * .045, context.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1)*Math.exp(-i/(data.length/7));
      const noise = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
      noise.buffer = buffer; filter.type = 'highpass'; filter.frequency.value = 1100; gain.gain.value = .14;
      noise.connect(filter); filter.connect(gain); gain.connect(context.destination); noise.start(now);
      tone(kind === 'on' ? 740 : 370, now, .09, .035, 'triangle');
    }
  } catch { /* Audio is enhancement; the complete feedback remains visible. */ }
}
