import Reveal from '@/app/components/ui/Reveal';

const BlurRevealHeading = ({ as = 'h2', children, className = '', delay = 0 }) => {
  const text = String(children);
  let characterIndex = 0;

  return (
    <Reveal as={as} variant="blur" delay={delay} aria-label={text} className={`weelp-blur-reveal ${className}`}>
      <span aria-hidden="true" className="weelp-blur-reveal__visual">
        {text.split(' ').map((word, wordIndex, words) => (
          <span key={`${word}-${wordIndex}`} className="weelp-blur-reveal__word">
            {Array.from(word).map((character) => {
              const index = characterIndex;
              characterIndex += 1;

              return (
                <span key={`${character}-${index}`} data-testid="blur-reveal-character" className="weelp-blur-reveal__character" style={{ '--weelp-blur-index': index }}>
                  {character}
                </span>
              );
            })}
            {wordIndex < words.length - 1 ? <span className="weelp-blur-reveal__space"> </span> : null}
          </span>
        ))}
      </span>
    </Reveal>
  );
};

export default BlurRevealHeading;
