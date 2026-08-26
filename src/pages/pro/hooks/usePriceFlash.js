import { useState, useEffect, useRef } from 'react';

export function usePriceFlash(currentPrice) {
  const [flashClass, setFlashClass] = useState('');
  const prevPriceRef = useRef(currentPrice);

  useEffect(() => {
    // Only trigger if we have a previous price and it actually changed
    if (prevPriceRef.current !== undefined && currentPrice !== undefined) {
      if (currentPrice > prevPriceRef.current) {
        setFlashClass('flash-green');
      } else if (currentPrice < prevPriceRef.current) {
        setFlashClass('flash-red');
      }
      
      // Clear the class after animation completes (1s)
      const timer = setTimeout(() => {
        setFlashClass('');
      }, 1000);

      // Update ref
      prevPriceRef.current = currentPrice;

      return () => clearTimeout(timer);
    } else {
      prevPriceRef.current = currentPrice;
    }
  }, [currentPrice]);

  return flashClass;
}
