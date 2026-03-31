const recommendationColumns = [
  ['Cherry Blossom', 'Universal Studios Japan', 'Tokyo Disney Resort Park', 'Mount Fuji'],
  ['Shibuya Sky', 'Tokyo Subway Ticket', 'Buses in Japan', 'Keisei Skyliner'],
  ['Things to do in Tokyo', 'Things to do in Osaka', 'Things to do in Kyoto', 'Things to do in Dubai'],
  ['Disneyland', 'Paris', 'Orlando', 'Bali'],
  ['Nami Island', 'Everland', 'Lotte World', 'Seoul Sky'],
  ['Lotte World', 'Seoul Sky', 'Coex Aquarium', 'N Seoul Tower'],
  ['Visit Busan Pass', 'T-Money Card', 'KTX Train', 'AREX Express Train'],
  ['Tokyo Skytree', 'Things to do in Tokyo', 'Things to do in Osaka', 'Things to do in Kyoto'],
];

const WeelpRecommendations = () => {
  return (
    <section className="bg-[#f3f5f6] w-full px-[60px] py-8">
      <h2 className="text-[#243141] text-lg font-semibold mb-4">Weelp Recommendations</h2>
      <div className="border-t border-[#e3e3e3a6] mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
        {recommendationColumns.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col">
            {column.map((item, itemIndex) => (
              <a key={itemIndex} href="#" className="text-[#6f7680] text-base font-medium leading-[2.06] hover:text-[#435a67] transition-colors">
                {item}
              </a>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default WeelpRecommendations;
