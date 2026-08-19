import AboutHero from '@/app/components/Pages/FRONT_END/About/AboutHero';
import AboutStory from '@/app/components/Pages/FRONT_END/About/AboutStory';
import AboutOffer from '@/app/components/Pages/FRONT_END/About/AboutOffer';
import AboutWhyChoose from '@/app/components/Pages/FRONT_END/About/AboutWhyChoose';
import AboutTeam from '@/app/components/Pages/FRONT_END/About/AboutTeam';
import AboutTestimonials from '@/app/components/Pages/FRONT_END/About/AboutTestimonials';
import AboutCTA from '@/app/components/Pages/FRONT_END/About/AboutCTA';
import AboutFAQ from '@/app/components/Pages/FRONT_END/About/AboutFAQ';

export const metadata = {
  title: 'About Us - Weelp',
  description: "Learn about Weelp's story, mission, values, and the team behind unforgettable travel experiences.",
};

const AboutPage = () => (
  <>
    <AboutHero />
    <AboutStory />
    <AboutOffer />
    <AboutWhyChoose />
    <AboutTeam />
    <AboutTestimonials />
    <AboutCTA />
    <AboutFAQ />
  </>
);

export default AboutPage;
