import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { haptic } from '@/lib/haptics';

export function IgnitionSplash() {
  const navigate = useNavigate();
  const { isUnlocked, isInitializing, isLocalMode } = useAuth();
  const reduce = useReducedMotion();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setArmed(true), reduce ? 0 : 700);
    return () => clearTimeout(id);
  }, [reduce]);

  // Auto-navigate se já está desbloqueado ou em modo local
  useEffect(() => {
    if (isInitializing) return;
    if (isUnlocked || isLocalMode) {
      navigate('/inicio', { replace: true });
    }
  }, [isInitializing, isUnlocked, isLocalMode, navigate]);

  function handleStart() {
    haptic('ignition');
    if (isUnlocked) {
      navigate('/inicio', { replace: true });
    } else {
      navigate('/ajustes', { replace: true });
    }
  }

  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-dvh select-none overflow-hidden"
      style={{ backgroundColor: '#F4EFE6' }}
    >
      {/* Decorative corner brackets */}
      <motion.div
        aria-hidden="true"
        className="absolute top-8 left-8 w-12 h-12"
        style={{ borderTop: '3px solid #0D0D0D', borderLeft: '3px solid #0D0D0D' }}
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.2 }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute top-8 right-8 w-12 h-12"
        style={{ borderTop: '3px solid #0D0D0D', borderRight: '3px solid #0D0D0D' }}
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.3 }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-8 left-8 w-12 h-12"
        style={{ borderBottom: '3px solid #0D0D0D', borderLeft: '3px solid #0D0D0D' }}
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.4 }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute bottom-8 right-8 w-12 h-12"
        style={{ borderBottom: '3px solid #0D0D0D', borderRight: '3px solid #0D0D0D' }}
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.5 }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-10 px-8 w-full max-w-sm"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo — text-based brutalist */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              initial={reduce ? { scale: 1 } : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.3, type: 'spring', stiffness: 200 }}
            >
              <div
                className="w-14 h-14 flex items-center justify-center"
                style={{
                  backgroundColor: '#F5D000',
                  border: '3px solid #0D0D0D',
                  boxShadow: '3px 3px 0px #0D0D0D',
                }}
              >
                <Fuel size={28} strokeWidth={2.5} color="#0D0D0D" />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <motion.span
                className="font-bold leading-none"
                style={{
                  fontSize: 42,
                  fontFamily: "'Bodoni Moda Variable', Georgia, serif",
                  color: '#0D0D0D',
                  letterSpacing: '-0.02em',
                }}
                initial={reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.35 }}
              >
                TANQUE
              </motion.span>
              <motion.span
                className="font-bold leading-none"
                style={{
                  fontSize: 42,
                  fontFamily: "'Bodoni Moda Variable', Georgia, serif",
                  color: '#0D0D0D',
                  letterSpacing: '-0.02em',
                }}
                initial={reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.45 }}
              >
                CHEIO
              </motion.span>
            </div>
          </div>

          {/* Divider line */}
          <motion.div
            className="w-full h-[3px]"
            style={{ backgroundColor: '#0D0D0D' }}
            initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: reduce ? 0 : 0.4, delay: reduce ? 0 : 0.55, ease: 'easeOut' }}
          />

          {/* Tagline */}
          <motion.p
            className="text-center"
            style={{
              fontSize: 11,
              letterSpacing: '0.2em',
              color: '#5A5550',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.3, delay: reduce ? 0 : 0.65 }}
          >
            Controle que te leva mais longe
          </motion.p>
        </div>

        {/* CTA Button */}
        {!isInitializing && (
          <motion.button
            type="button"
            disabled={!armed}
            className="w-full py-4 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#F5D000',
              color: '#0D0D0D',
              fontWeight: 800,
              letterSpacing: '0.2em',
              fontSize: 14,
              border: '3px solid #0D0D0D',
              boxShadow: '4px 4px 0px #0D0D0D',
              transition: 'box-shadow 0.1s, transform 0.1s',
            }}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : 0.7 }}
            whileTap={{ scale: 0.98, boxShadow: '2px 2px 0px #0D0D0D', x: 2, y: 2 }}
            onClick={handleStart}
          >
            {isUnlocked ? 'INICIANDO…' : 'COMEÇAR'}
          </motion.button>
        )}
      </motion.div>

      {/* Footer */}
      <motion.p
        className="absolute bottom-8"
        style={{
          fontSize: 10,
          letterSpacing: '0.15em',
          color: '#A09890',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0 : 1 }}
      >
        v1.7.0 · BRUTALISMO ELEGANTE
      </motion.p>
    </main>
  );
}
