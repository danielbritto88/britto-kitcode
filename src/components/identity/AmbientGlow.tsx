import { motion } from 'framer-motion';

// Fundo ambiente pulsante inspirado no "Spatial UI" (2026).
// Renderiza orbes sutis usando as cores de acento do Telemetria Íntima.
export function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[-1] overflow-hidden bg-bg pointer-events-none"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          x: ['-2%', '2%', '-2%'],
          y: ['-2%', '2%', '-2%'],
          scale: [1, 1.05, 1],
          opacity: [0.35, 0.5, 0.35],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-[20%] -right-[15%] w-[80vw] h-[80vw] rounded-full blur-[100px]"
        style={{
          background: 'radial-gradient(circle, rgba(232, 168, 92, 0.15) 0%, rgba(232, 168, 92, 0) 70%)',
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          x: ['2%', '-2%', '2%'],
          y: ['2%', '-2%', '2%'],
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute bottom-[5%] -left-[15%] w-[65vw] h-[65vw] rounded-full blur-[90px]"
        style={{
          background: 'radial-gradient(circle, rgba(232, 168, 92, 0.08) 0%, rgba(232, 168, 92, 0) 70%)',
        }}
      />
    </div>
  );
}
