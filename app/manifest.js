export default function manifest() {
  return {
    name: 'SwayHouse',
    short_name: 'SwayHouse',
    description: 'SwayHouse handles brand deals, strategy, and growth for creators who are serious about building a career.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FF5A36',
    icons: [
      {
        src: '/assets/swayhouse-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/assets/swayhouse-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
