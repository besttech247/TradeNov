const fs = require('fs');
let code = fs.readFileSync('tailwind.config.js', 'utf8');

// I will just add the crypto and jiade colors into the theme.extend.colors block.
const cryptoColors = `
        jiade: {
          bg: '#f3f4f7',
          card: '#ffffff',
          cardSub: '#f8f9fa',
          border: '#e6e8ec',
          textMain: '#181f39',
          textMuted: '#717579',
          primary: '#3eacff',
        },
        crypto: {
          dark: '#0B0E14',
          card: 'rgba(255, 255, 255, 0.03)',
          cardHover: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
          accent: '#00f0ff',
          green: '#10b981',
          greenBg: 'rgba(16, 185, 129, 0.1)',
          red: '#ef4444',
          redBg: 'rgba(239, 68, 68, 0.1)',
          yellow: '#f59e0b',
          muted: '#8b949e',
        },
`;

if(!code.includes('crypto: {')) {
  code = code.replace("colors: {", "colors: {" + cryptoColors);
  fs.writeFileSync('tailwind.config.js', code);
}
