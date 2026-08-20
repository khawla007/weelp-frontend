import { Users } from 'lucide-react';
import Reveal from '@/app/components/ui/Reveal';
import AboutImage from './AboutImage';
import BlurRevealHeading from './BlurRevealHeading';
import SectionBadge from './SectionBadge';
import styles from './AboutPage.module.css';

const team = [
  { name: 'John Smith', role: 'Founder & CEO', image: '/assets/images/team-1.jpg' },
  { name: 'Sarah Johnson', role: 'Chief Technology Officer', image: '/assets/images/team-2.jpg' },
  { name: 'Michael Chen', role: 'Head of Operations', image: '/assets/images/team-3.jpg' },
];

const revealVariants = ['left', 'lift', 'right'];

const AboutTeam = () => (
  <section data-about-section="team" className={styles.teamSection}>
    <div className={styles.teamHeader}>
      <SectionBadge icon={Users}>Our Team</SectionBadge>
      <BlurRevealHeading className="mt-4 text-foreground">Meet the people behind Weelp</BlurRevealHeading>
      <p className="mt-2 max-w-[46ch] text-muted-foreground">A small, dedicated team of travelers building the experiences we&apos;d want ourselves.</p>
    </div>
    <div data-testid="about-team-grid" data-team-layout="reference-compact" className={styles.teamGrid}>
      {team.map((member, index) => (
        <Reveal key={member.name} variant={revealVariants[index]} data-testid="about-team-card" className={styles.imageShell}>
          <div className={styles.teamImage}>
            <AboutImage
              src={member.image}
              alt={member.name}
              fallbackLabel={`${member.name} portrait unavailable`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className={`object-cover ${styles.imageZoom}`}
            />
          </div>
          <h3 className="mb-1 mt-5 text-xl text-foreground">{member.name}</h3>
          <p className="text-sm text-muted-foreground">{member.role}</p>
        </Reveal>
      ))}
    </div>
  </section>
);

export default AboutTeam;
