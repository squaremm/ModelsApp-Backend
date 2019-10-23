// place types
const restaurant = "Restaurant";
const loungeAndBar = "Lounge & Bar";
const gym = "Gym";
const hairdresser = "Hairdresser";

// place extras
const karaoke = "Karaoke";

const migratePlaces = async (Place) => {
  await Place.updateOne({ name: "55 Milano" }, { $set: { type: [restaurant, loungeAndBar] }});
  await Place.updateOne({ name: "Bottega Emilia" }, { $set: { type: [loungeAndBar] }});
  await Place.updateOne({ name: "Flavors" }, { $set: { type: [loungeAndBar] }});
  await Place.updateOne({ name: "Get Fit" }, { $set: { type: [gym] }});
  await Place.updateOne({ name: "IN|EX Calisthenics + Yoga & Boxing" }, { $set: { type: [gym] }});
  await Place.updateOne({ name: "L'Ecurie" }, { $set: { type: [loungeAndBar], extras: [karaoke] }});
  await Place.updateOne({ name: "Nik's & Co" }, { $set: { type: [loungeAndBar] }});
  await Place.updateOne({ name: "Osteria del Gambero Rosso" }, { $set: { type: [restaurant] }});
  await Place.updateOne({ name: "Pil's Pub" }, { $set: { type: [restaurant, loungeAndBar] }});
  // Sapori Solari
  await Place.updateOne({ _id: 90 }, { $set: { type: [restaurant] }});
  await Place.updateOne({ _id: 96 }, { $set: { type: [restaurant] }});
  await Place.updateOne({ _id: 111 }, { $set: { type: [restaurant] }});
  //
  await Place.updateOne({ name: "Seeker" }, { $set: { type: [hairdresser] }});
  await Place.updateOne({ name: "Serendepico" }, { $set: { type: [restaurant, loungeAndBar] }});
  await Place.updateOne({ name: "The FisherMan Pasta" }, { $set: { type: [restaurant] }});
};
