const AboutHero = () => {
  return (
    <section className="weelp-hero-rise relative flex items-center justify-center h-[400px] md:h-[500px] bg-[#f2f7f5] mb-10 md:mb-16 lg:mb-24">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <h1 className="mb-3">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '200ms' }}>About Weelp</span>
          </span>
        </h1>
        <p className="lead max-w-[640px]">
          <span className="weelp-rise-mask weelp-rise-mask--block">
            <span className="weelp-rise-item" style={{ '--weelp-rise-delay': '280ms' }}>Connecting travelers with unforgettable experiences worldwide</span>
          </span>
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
