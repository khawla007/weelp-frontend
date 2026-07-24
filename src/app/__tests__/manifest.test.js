import manifest from '../manifest';

describe('web app manifest', () => {
  it('uses the Deep Forest install colors without changing the app identity or icons', () => {
    expect(manifest()).toEqual({
      name: 'Weelp',
      short_name: 'Weelp',
      description: 'A Progressive Web App built with Next.js',
      start_url: '/',
      display: 'standalone',
      background_color: '#08110e',
      theme_color: '#08110e',
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
    });
  });
});
