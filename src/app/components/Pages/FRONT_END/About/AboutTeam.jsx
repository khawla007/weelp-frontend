'use client';

import { useRef, useSyncExternalStore } from 'react';
import { Users } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Reveal from '@/app/components/ui/Reveal';
import AboutImage from './AboutImage';
import BlurRevealHeading from './BlurRevealHeading';
import SectionBadge from './SectionBadge';
import styles from './AboutPage.module.css';

const team = [
  { id: 'martin-alexander', name: 'Martin Alexander', role: 'Founder & CEO' },
  { id: 'sarah-johnson', name: 'Sarah Johnson', role: 'Head of Guest Experience' },
  { id: 'mike-anderson', name: 'Mike Anderson', role: 'Travel Operations Manager' },
  { id: 'emily-carter', name: 'Emily Carter', role: 'Destination Partnerships Manager' },
  { id: 'david-thompson', name: 'David Thompson', role: 'Experience Design Director' },
  { id: 'jessica-williams', name: 'Jessica Williams', role: 'Booking & Finance Manager' },
].map((member) => ({ ...member, image: `/assets/images/about/team/${member.id}.webp` }));

const revealVariants = ['left', 'lift', 'right'];
const imageSizes = '(max-width: 639px) calc(100vw - 32px), (max-width: 767px) calc(100vw - 48px), (max-width: 991px) 48vw, (max-width: 1479px) 31vw, 440px';
const interactiveSelector = 'a, button, input, select, textarea, [role="button"], [contenteditable="true"]';
const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

const hasMatchMedia = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

const subscribeReducedMotion = (callback) => {
  if (!hasMatchMedia()) return () => {};

  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getReducedMotion = () => (hasMatchMedia() ? window.matchMedia(reducedMotionQuery).matches : false);
const getReducedMotionServer = () => false;

const AboutTeam = () => {
  const swiperRef = useRef(null);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getReducedMotionServer);

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget && event.target.closest(interactiveSelector)) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      swiperRef.current?.slidePrev?.();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      swiperRef.current?.slideNext?.();
    }
  };

  return (
    <section data-about-section="team" className={styles.teamSection}>
      <div className={`container-page ${styles.teamInner}`}>
        <div className={styles.teamHeader}>
          <SectionBadge icon={Users}>Our Team</SectionBadge>
          <BlurRevealHeading className={`mt-4 text-foreground ${styles.teamTitle}`}>Meet Our Amazing Team Members</BlurRevealHeading>
          <p className={styles.teamIntro}>A dedicated group of travel specialists committed to creating meaningful journeys through local insight, thoughtful planning, and genuine care.</p>
        </div>

        <div role="region" aria-label="Weelp team members" tabIndex={0} onKeyDown={handleKeyDown} data-testid="about-team-grid" data-team-layout="reference-carousel" className={styles.teamCarousel}>
          <Swiper
            slidesPerView={1}
            spaceBetween={30}
            speed={reducedMotion ? 0 : 600}
            grabCursor
            watchOverflow
            loop={false}
            rewind={false}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 30 },
              992: { slidesPerView: 3, spaceBetween: 30 },
              1200: { slidesPerView: 3, spaceBetween: 45 },
              1400: { slidesPerView: 3, spaceBetween: 49 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {team.map((member, index) => (
              <SwiperSlide key={member.id}>
                <Reveal as="article" variant={revealVariants[index % revealVariants.length]} data-testid="about-team-card" className={styles.imageShell}>
                  <div className={styles.teamImage}>
                    <AboutImage
                      src={member.image}
                      alt={`${member.name}, ${member.role}`}
                      fallbackLabel={`${member.name} portrait unavailable`}
                      fill
                      sizes={imageSizes}
                      className={`object-cover ${styles.imageZoom}`}
                    />
                  </div>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.role}</p>
                </Reveal>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default AboutTeam;
