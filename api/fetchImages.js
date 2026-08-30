const cars = [
  "Bugatti Chiron",
  "Ferrari SF90 Stradale",
  "Porsche 911 GT3",
  "Rolls-Royce Phantom VIII",
  "Lamborghini Aventador"
];

async function run() {
  for (const car of cars) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(car)}&prop=pageimages&format=json&pithumbsize=1000`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      const pages = json.query.pages;
      const pageId = Object.keys(pages)[0];
      const imgUrl = pages[pageId]?.thumbnail?.source || null;
      console.log(`${car}|${imgUrl}`);
    } catch (e) {
      console.log(`${car}|ERROR`);
    }
  }
}
run();
