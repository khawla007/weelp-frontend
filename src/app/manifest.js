export default function manifest() {
  return {
    name: 'Weelp',
    short_name: 'Weelp',
    description: 'A Progressive Web App built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    icons: [
      {
        src: '/assets/images/Weelp..jpg',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/assets/images/Weelp..jpg',
        sizes: '400x400',
        type: 'image/jpeg',
      },
    ],
  };
}
