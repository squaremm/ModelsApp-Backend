const _ = require("lodash");

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
const spa = "Spa";

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
const aperitiv = "Aperitif";
const breakfast = "Breakfast";
const dinner = "Dinner";
const lunch = "Lunch";

// cities
const bali = "Bali";
const london = "London";

const newDefaultTimeFrames = (...args) => ({
  monday: [...args],
  tuesday: [...args],
  wednesday: [...args],
  thursday: [...args],
  friday: [...args],
  saturday: [...args],
  sunday: [...args],
});

const newGetPlaceServingDays = (Interval) => async (id) => {
  const interval = await Interval.findOne({ place: id });
  const { intervals } = interval;
  const days = {};
  for (const interval of intervals) {
    days[interval.day.toLowerCase()] = 1;
  }
  return Object.keys(days);
}

const migratePlaces = async (Place, Interval) => {
  const getPlaceServingDays = newGetPlaceServingDays(Interval);
  await Place.updateOne({ name: "55 Milano" }, { $set: { type: [loungeAndBar], servingTimeFrames: _.pick(newDefaultTimeFrames(aperitiv), await getPlaceServingDays(79)), city: "Milan" }});
  await Place.updateOne({ name: "Adda 11" }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Bottega Emilia" }, { $set: { type: [loungeAndBar], servingTimeFrames: _.pick(newDefaultTimeFrames(breakfast, lunch, dinner, snack), await getPlaceServingDays(95)) }});
  await Place.updateOne({ name: "CaBarET" }, { $set: { type: [restaurant], servingTimeFrames: _.pick(newDefaultTimeFrames([]), await getPlaceServingDays(100)) }});
  // caffe napoli
  await Place.updateOne({ _id: 143 }, { $set: { type: [caffe], servingTimeFrames: _.pick(newDefaultTimeFrames(breakfast, snack), await getPlaceServingDays(143)) }});
  await Place.updateOne({ _id: 144 }, { $set: { type: [caffe], servingTimeFrames: _.pick(newDefaultTimeFrames(breakfast, lunch), await getPlaceServingDays(144)) }});
  await Place.updateOne({ _id: 145 }, { $set: { type: [caffe], servingTimeFrames: _.pick(newDefaultTimeFrames(breakfast, snack), await getPlaceServingDays(145)) }});
  //
  // Cenere
  await Place.updateOne({ _id: 108 }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  //
  // Cocciuto - Bergognone
  await Place.updateOne({ _id: 164 }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  //
  // Copernico
  await Place.updateOne({ _id: 124 }, { $set: { type: [loungeAndBar], extras: [vegan, vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(breakfast, snack, lunch), await getPlaceServingDays(124)) }});
  await Place.updateOne({ _id: 125 }, { $set: { type: [loungeAndBar], extras: [vegan, vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(breakfast, snack, lunch, aperitiv), await getPlaceServingDays(125)) }});
  await Place.updateOne({ _id: 126 }, { $set: { type: [loungeAndBar], extras: [vegan, vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(breakfast, snack, lunch), await getPlaceServingDays(126)) }});
  //
  await Place.updateOne({ name: "East River" }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Estea" }, { $set: { type: [beautySalon], extras: eyebrowns, servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Extro Parrucchieri" }, { $set: { type: [hairdresser], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Filetteria" }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Flavors" }, { $set: { type: [loungeAndBar], extras: [vegan, vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch, dinner), await getPlaceServingDays(80)) }});
  await Place.updateOne({ name: "Frankies" }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Gamy Robata & More
  await Place.updateOne({ _id: 134 }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: newDefaultTimeFrames([]) }});
  //
  await Place.updateOne({ name: "GetFit | Piranesi" }, { $set: { type: [gym], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Il Telefono Due" }, { $set: { type: [store], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Get Fit" }, { $set: { type: [gym], servingTimeFrames: newDefaultTimeFrames([]) }});
  // IN|EX
  await Place.updateOne({ _id: 71 }, { $set: { type: [gym], extras: [yoga], servingTimeFrames: newDefaultTimeFrames([]) }});
  //
  await Place.updateOne({ name: "IN|EX Calisthenics + Yoga & Boxing" }, { $set: { type: [gym], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Jeidant" }, { $set: { type: [beautySalon], extras: [massage, treatmentCutAndBlow], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Jeidant hairdresser" }, { $set: { type: [hairdresser], extras: [massage, treatmentCutAndBlow], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "L'Ecurie" }, { $set: { type: [loungeAndBar], extras: [karaoke], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "La Tartina" }, { $set: { type: [restaurant], servingTimeFrames: _.pick(newDefaultTimeFrames(aperitiv), await getPlaceServingDays(91)) }});
  // Lievità Pizzeria Gourmet
  await Place.updateOne({ _id: 132 }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  //
  await Place.updateOne({ name: "Mani in Pasta - Via Pisacane" }, { $set: { type: [restaurant], extras: [vegetarian, vegan], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch, dinner), await getPlaceServingDays(116)) }});
  await Place.updateOne({ name: "Mani in Pasta - V.le Monza" }, { $set: { type: [restaurant], extras: [vegetarian, vegan], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch, dinner), await getPlaceServingDays(117) ) }});
  // MGM
  await Place.updateOne({ _id: 135 }, { $set: { type: [gym], servingTimeFrames: newDefaultTimeFrames([]) }});
  //
  await Place.updateOne({ name: "Milano Fit Nolo" }, { $set: { type: [gym], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "New Fitness Club" }, { $set: { type: [gym], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Nik's & Co" }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(dinner, aperitiv), await getPlaceServingDays(81)) }});
  await Place.updateOne({ name: "Nina Roll" }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Officina del Riso" }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(dinner), await getPlaceServingDays(130)) }});
  await Place.updateOne({ name: "Oro Restaurant" }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch, dinner), await getPlaceServingDays(127)) }});
  await Place.updateOne({ name: "Piedra del Sol" }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(dinner), await getPlaceServingDays(98)) }});
  await Place.updateOne({ name: "Osteria del Gambero Rosso" }, { $set: { type: [restaurant], servingTimeFrames: _.pick(newDefaultTimeFrames([]), await getPlaceServingDays(92)) }});
  // Rita's Juice
  await Place.updateOne({ _id: 104 }, { $set: { type: [juiceBar], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Rosa&Co
  await Place.updateOne({ _id: 115 }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch), await getPlaceServingDays(115)) }});
  // Salt Food Atelier
  await Place.updateOne({ _id: 140 }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Salvatore Mazzotta
  await Place.updateOne({ _id: 72 }, { $set: { type: [hairdresser], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ name: "Pil's Pub" }, { $set: { type: [restaurant, loungeAndBar], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Sapori Solari
  await Place.updateOne({ _id: 90 }, { $set: { type: [restaurant], extras: [glutenFree], servingTimeFrames: _.pick(newDefaultTimeFrames(aperitiv), await getPlaceServingDays(90)) }});
  await Place.updateOne({ _id: 96 }, { $set: { type: [restaurant], extras: [glutenFree], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch, dinner), await getPlaceServingDays(96)) }});
  await Place.updateOne({ _id: 111 }, { $set: { type: [restaurant], extras: [glutenFree], servingTimeFrames: _.pick(newDefaultTimeFrames(dinner, aperitiv), await getPlaceServingDays(111)) }});
  // Sardynia Ristorante
  await Place.updateOne({ _id: 119 }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Seeker
  await Place.updateOne({ _id: 58 }, { $set: { type: [hairdresser], servingTimeFrames: newDefaultTimeFrames([]) }});
  // S10
  await Place.updateOne({ _id: 157 }, { $set: { type: [gym], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Serendepico
  await Place.updateOne({ _id: 82 }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch, dinner, aperitiv), await getPlaceServingDays(82)) }});
  // T.O.M. [The Ordinary Market]
  await Place.updateOne({ _id: 87 }, { $set: { type: [restaurant], extras: [vegetarian, glutenFree], servingTimeFrames: newDefaultTimeFrames([]) }});
  // TripBurger
  await Place.updateOne({ _id: 101 }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Poké Samba [Missori]
  await Place.updateOne({ _id: 101 }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  await Place.updateOne({ _id: 155 }, { $set: { type: [restaurant], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Vasoo
  await Place.updateOne({ _id: 153 }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch), await getPlaceServingDays(153)) }});
  // Verde Pistacchio Ice cream
  await Place.updateOne({ _id: 112 }, { $set: { type: [icecreamBar], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(snack), await getPlaceServingDays(112)) }});
  // The FisherMan Pasta
  await Place.updateOne({ _id: 67 }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: newDefaultTimeFrames([]) }});
  // Visca
  await Place.updateOne({ _id: 148 }, { $set: { type: [restaurant], extras: [vegetarian], servingTimeFrames: _.pick(newDefaultTimeFrames(lunch), await getPlaceServingDays(148)) }});
  // Odyssey
  await Place.updateOne({ _id: 121 }, { $set: { city: bali, type: [gym] }});
  // Bali Smoothie
  await Place.updateOne({ _id: 123 }, { $set: { city: bali, type: [restaurant] }});
  // The Lawn
  await Place.updateOne({ _id: 131 }, { $set: { city: bali, type: [restaurant] }});
  // Front Cafe
  await Place.updateOne({ _id: 133 }, { $set: { city: bali, type: [restaurant] }});
  // Canggu Nest
  await Place.updateOne({ _id: 128 }, { $set: { city: bali, type: [restaurant] }});
  // Kilo Kitchen
  await Place.updateOne({ _id: 136 }, { $set: { city: bali, type: [restaurant] }});
  // Bali Climbing
  await Place.updateOne({ _id: 137 }, { $set: { city: bali, type: [gym] }});
  // Essential Canngu
  await Place.updateOne({ _id: 139 }, { $set: { city: bali, type: [restaurant] }});
  // Amo spa
  await Place.updateOne({ _id: 141 }, { $set: { city: bali, type: [spa] }});
  // Mai Tai
  await Place.updateOne({ _id: 147 }, { $set: { city: bali, type: [restaurant] }});
  // Cibo
  await Place.updateOne({ _id: 151 }, { $set: { city: bali, type: [restaurant] }});
  // The Dusty Cafe
  await Place.updateOne({ _id: 160 }, { $set: { city: bali, type: [restaurant] }});
  // Superfood
  await Place.updateOne({ _id: 162 }, { $set: { city: bali, type: [restaurant] }});
  // CP Lounge
  await Place.updateOne({ _id: 173 }, { $set: { city: bali, type: [restaurant] }});
  // BB52
  await Place.updateOne({ _id: 166 }, { $set: { city: bali, type: [restaurant] }});
  // Hippie Fish
  await Place.updateOne({ _id: 169 }, { $set: { city: bali, type: [restaurant] }});
  // Avocado Factory
  await Place.updateOne({ _id: 170 }, { $set: { city: bali, type: [restaurant] }});
  // LAFS Pizza
  await Place.updateOne({ _id: 171 }, { $set: { city: bali, type: [restaurant] }});
  // Liban Tapas
  await Place.updateOne({ _id: 152 }, { $set: { city: london, type: [restaurant] }});
  // Matcha and Beyond
  await Place.updateOne({ _id: 156 }, { $set: { city: london, type: [restaurant] }});
  // Imperial Treasure
  await Place.updateOne({ _id: 163 }, { $set: { city: london, type: [restaurant] }});
};

module.exports = migratePlaces;
