import AboutHero from '@/app/components/Pages/FRONT_END/About/AboutHero';
import AboutStory from '@/app/components/Pages/FRONT_END/About/AboutStory';
import AboutMission from '@/app/components/Pages/FRONT_END/About/AboutMission';
import AboutValues from '@/app/components/Pages/FRONT_END/About/AboutValues';
import AboutTeam from '@/app/components/Pages/FRONT_END/About/AboutTeam';
import AboutStats from '@/app/components/Pages/FRONT_END/About/AboutStats';

export const metadata = {
  title: 'About Us - Weelp',
  description: "Learn about Weelp's story, mission, values, and the team behind unforgettable travel experiences.",
};

const AboutPage = () => {
  return (
    <>
      <AboutHero />
      <AboutStory />
      <AboutMission />
      <AboutValues />
      <AboutTeam />
      <AboutStats />
    </>
  );
};

export default AboutPage;
