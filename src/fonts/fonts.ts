import { Cormorant_Garamond, DM_Sans, Lora, Quicksand } from 'next/font/google';

export const lora = Lora({
  subsets: ['latin'],
  variable: '--lora'
});
export const quicksand = Quicksand({ subsets: ['latin'], variable: '--quicksand' });

export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--cormorant'
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--dm-sans'
});
