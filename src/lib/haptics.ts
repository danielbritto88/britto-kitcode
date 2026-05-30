// Haptic vocabulary — Telemetria Íntima v1.5.
// Documentado em PROJETO.md §8.6. Usar SEMPRE estes nomes; nada de vibrate() solto.
// Valores em milissegundos: tap=toque leve, success=duplo pulso, warning=alerta longo,
// error=pulso firme, ignition=sequência de partida (sucesso + confirmação).

type HapticKind = 'tap' | 'success' | 'warning' | 'error' | 'ignition';

const PATTERNS: Record<HapticKind, number | number[]> = {
  tap: 10,             // toque sutil de UI
  success: [10, 40, 10], // duplo pulso: confirmação
  warning: [40, 60, 40], // alerta: pulso mais longo
  error: 80,            // pulso firme: erro
  ignition: [10, 40, 10], // partida: sucesso + confirmação
};

export function haptic(kind: HapticKind): void {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  navigator.vibrate(PATTERNS[kind]);
}
