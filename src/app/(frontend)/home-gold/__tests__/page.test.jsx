import GoldHomePage, { revalidate as goldRevalidate } from '../page';
import HomePage, { revalidate as homeRevalidate } from '../../page';

describe('/home-gold', () => {
  it('reuses the canonical homepage component and cache interval', () => {
    expect(GoldHomePage).toBe(HomePage);
    expect(goldRevalidate).toBe(homeRevalidate);
  });
});
