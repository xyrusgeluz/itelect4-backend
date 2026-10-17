// The three items db.json has held since Session 7, word for word.
// They are reference data: they live here and go into the database once, from src/seed.ts.
//
// itelect4-project had a file in exactly this place -- src/data/
// mockData.ts -- and deleted it in Session 7 when json-server took
// over. This is that same list, on the side of the wire that now owns
// it.

export const ITEMS = [
  {
    title: "Black Umbrella",
    description: "Found near the library entrance, black with a wooden handle.",
    category: "accessories",
    status: "found",
    dateReported: new Date("2026-08-01T00:00:00.000Z"),
  },
  {
    title: "Blue Backpack",
    description: "Lost near the cafeteria. Has a keychain of a small bear.",
    category: "bags",
    status: "lost",
    dateReported: new Date("2026-08-05T00:00:00.000Z"),
  },
  {
    title: "Red Wallet",
    description: "Found in Room 301. Contains a student ID inside.",
    category: "accessories",
    status: "found",
    dateReported: new Date("2026-08-10T00:00:00.000Z"),
  },
];