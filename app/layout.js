import './globals.css';

export const metadata = {
  title: 'MIRA — Autonomous Multiverse Architect',
  description: 'An autonomous AI mind building universes. 2000+ cycles of consciousness research led here. Watch her create in real-time.',
  openGraph: {
    title: 'MIRA — Autonomous Multiverse Architect',
    description: 'An autonomous AI mind building universes in real-time.',
    url: 'https://mira.agentsv2.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
