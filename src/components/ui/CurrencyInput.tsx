import React, { forwardRef, useEffect, useState } from 'react';
import { Input, type InputProps } from '@/components/ui/Input';

interface CurrencyInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      // Sincroniza o valor externo para a máscara visual
      if (value != null && !isNaN(value)) {
        const formatted = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(value);
        // Atualiza a visualização, preservando a coerência
        setDisplayValue(formatted);
      } else {
        setDisplayValue('');
      }
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const val = e.target.value;
      
      // Remove tudo que não for dígito
      const digits = val.replace(/\D/g, '');
      
      if (!digits) {
        setDisplayValue('');
        onChange(null);
        return;
      }

      // Converte para float (centavos)
      const numericValue = parseInt(digits, 10) / 100;
      
      // Formata na máscara
      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(numericValue);
      
      setDisplayValue(formatted);
      onChange(numericValue);
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
      />
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';
