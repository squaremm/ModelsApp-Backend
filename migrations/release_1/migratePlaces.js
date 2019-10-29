// place types
const restaurant = "Restaurant";
const loungeAndBar = "Lounge & Bar";
const gym = "Gym";
const hairdresser = "Hairdresser";
const caffe = "Caffé";
const beautySalon = "Beauty Salon"
const store = "Store";
const juiceBar = "Juice Bar";
const icecreamBar = "Icecream Bar"

// place extras
const karaoke = "Karaoke";
const vegan = "Vegan";
const vegetarian = "Vegetarian";
const eyebrowns = "Eyebrowns"
const yoga = "Yoga";
const massage = "Massage";
const treatmentCutAndBlow = "treatment cut&Blow";
const glutenFree = "Gluten-Free"

// timeframes
const snack = "Snack";
const aperitiv = "Aperitiv";
const breakfast = "Breakfast";
const dinner = "Dinner";
const lunch = "Lunch";

const migratePlaces = async (Place) => {
  await Place.updateOne({ name: "55 Milano" }, { $set: { type: [loungeAndBar] }});
  await Place.updateOne({ name: "Adda 11" }, { $set: { type: [restaurant] }});
  await Place.updateOne({ name: "Bottega Emilia" }, { $set: { type: [loungeAndBar] }});
  await Place.updateOne({ name: "CaBarET" }, { $set: { type: [restaurant] }});
  // caffe napoli
  await Place.updateOne({ _id: 143 }, { $set: { type: [caffe] }});
  await Place.updateOne({ _id: 144 }, { $set: { type: [caffe] }});
  await Place.updateOne({ _id: 145 }, { $set: { type: [caffe] }});
  //
  // Cenere
  await Place.updateOne({ _id: 108 }, { $set: { type: [restaurant] }});
  //
  // Cocciuto - Bergognone
  await Place.updateOne({ _id: 164 }, { $set: { type: [restaurant] }});
  //
  // Copernico
  await Place.updateOne({ _id: 124 }, { $set: { type: [loungeAndBar], extras: [vegan, vegetarian] }});
  await Place.updateOne({ _id: 125 }, { $set: { type: [loungeAndBar], extras: [vegan, vegetarian] }});
  await Place.updateOne({ _id: 126 }, { $set: { type: [loungeAndBar], extras: [vegan, vegetarian] }});
  //
  await Place.updateOne({ name: "East River" }, { $set: { type: [restaurant] }});
  await Place.updateOne({ name: "Estea" }, { $set: { type: [beautySalon], extras: eyebrowns }});
  await Place.updateOne({ name: "Extro Parrucchieri" }, { $set: { type: [hairdresser] }});
  await Place.updateOne({ name: "Filetteria" }, { $set: { type: [restaurant] }});
  await Place.updateOne({ name: "Flavors" }, { $set: { type: [loungeAndBar], extras: [vegan, vegetarian] }});
  await Place.updateOne({ name: "Frankies" }, { $set: { type: [restaurant] }});
  // Gamy Robata & More
  await Place.updateOne({ _id: 134 }, { $set: { type: [restaurant], extras: [vegetarian] }});
  //
  await Place.updateOne({ name: "GetFit | Piranesi" }, { $set: { type: [gym] }});
  await Place.updateOne({ name: "Il Telefono Due" }, { $set: { type: [store] }});
  await Place.updateOne({ name: "Get Fit" }, { $set: { type: [gym] }});
  // IN|EX
  await Place.updateOne({ _id: 71 }, { $set: { type: [gym], extras: [yoga] }});
  //
  await Place.updateOne({ name: "IN|EX Calisthenics + Yoga & Boxing" }, { $set: { type: [gym] }});
  await Place.updateOne({ name: "Jeidant" }, { $set: { type: [beautySalon], extras: [massage, treatmentCutAndBlow] }});
  await Place.updateOne({ name: "Jeidant hairdresser" }, { $set: { type: [hairdresser], extras: [massage, treatmentCutAndBlow] }});
  await Place.updateOne({ name: "L'Ecurie" }, { $set: { type: [loungeAndBar], extras: [karaoke] }});
  await Place.updateOne({ name: "La Tartina" }, { $set: { type: [restaurant] }});
  // Lievità Pizzeria Gourmet
  await Place.updateOne({ _id: 132 }, { $set: { type: [restaurant] }});
  //
  await Place.updateOne({ name: "Mani in Pasta - Via Pisacane" }, { $set: { type: [restaurant], extras: [vegetarian, vegan] }});
  await Place.updateOne({ name: "Mani in Pasta - V.le Monza" }, { $set: { type: [restaurant], extras: [vegetarian, vegan] }});
  // MGM
  await Place.updateOne({ _id: 135 }, { $set: { type: [gym] }});
  //
  await Place.updateOne({ name: "Milano Fit Nolo" }, { $set: { type: [gym] }});
  await Place.updateOne({ name: "New Fitness Club" }, { $set: { type: [gym] }});
  await Place.updateOne({ name: "Nik's & Co" }, { $set: { type: [restaurant], extras: [vegetarian] }});
  await Place.updateOne({ name: "Nina Roll" }, { $set: { type: [restaurant] }});
  await Place.updateOne({ name: "Officina del Riso" }, { $set: { type: [restaurant], extras: [vegetarian] }});
  await Place.updateOne({ name: "Oro Restaurant" }, { $set: { type: [restaurant], extras: [vegetarian] }});
  await Place.updateOne({ name: "Piedra del Sol" }, { $set: { type: [restaurant], extras: [vegetarian] }});
  await Place.updateOne({ name: "Osteria del Gambero Rosso" }, { $set: { type: [restaurant] }});
  // Rita's Juice
  await Place.updateOne({ _id: 104 }, { $set: { type: [juiceBar] }});
  // Rosa&Co
  await Place.updateOne({ _id: 115 }, { $set: { type: [restaurant], extras: [vegetarian] }});
  // Salt Food Atelier
  await Place.updateOne({ _id: 140 }, { $set: { type: [restaurant] }});
  // Salvatore Mazzotta
  await Place.updateOne({ _id: 72 }, { $set: { type: [hairdresser] }});
  await Place.updateOne({ name: "Pil's Pub" }, { $set: { type: [restaurant, loungeAndBar] }});
  // Sapori Solari
  await Place.updateOne({ _id: 90 }, { $set: { type: [restaurant], extras: [glutenFree] }});
  await Place.updateOne({ _id: 96 }, { $set: { type: [restaurant], extras: [glutenFree] }});
  await Place.updateOne({ _id: 111 }, { $set: { type: [restaurant], extras: [glutenFree] }});
  // Sardynia Ristorante
  await Place.updateOne({ _id: 119 }, { $set: { type: [restaurant] }});
  // Seeker
  await Place.updateOne({ _id: 58 }, { $set: { type: [hairdresser] }});
  // S10
  await Place.updateOne({ _id: 157 }, { $set: { type: [gym] }});
  // Serendepico
  await Place.updateOne({ _id: 82 }, { $set: { type: [restaurant], extras: [vegetarian] }});
  // T.O.M. [The Ordinary Market]
  await Place.updateOne({ _id: 87 }, { $set: { type: [restaurant], extras: [vegetarian, glutenFree] }});
  // TripBurger
  await Place.updateOne({ _id: 101 }, { $set: { type: [restaurant] }});
  // Poké Samba [Missori]
  await Place.updateOne({ _id: 101 }, { $set: { type: [restaurant] }});
  await Place.updateOne({ _id: 155 }, { $set: { type: [restaurant] }});
  // Vasoo
  await Place.updateOne({ _id: 153 }, { $set: { type: [restaurant], extras: [vegetarian] }});
  // Verde Pistacchio Ice cream
  await Place.updateOne({ _id: 112 }, { $set: { type: [icecreamBar], extras: [vegetarian] }});
  // The FisherMan Pasta
  await Place.updateOne({ _id: 67 }, { $set: { type: [restaurant], extras: [vegetarian] }});
  // Visca
  await Place.updateOne({ _id: 148 }, { $set: { type: [restaurant], extras: [vegetarian] }});
};

module.exports = migratePlaces;
