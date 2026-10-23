import type { DemoProfile } from "@/types";

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: "cinephile-music-lover",
    title: "The Cinephile + The Music Lover",
    subtitle: "Two worlds of storytelling collide",
    emoji: "🎬",
    personA: {
      name: "Alex",
      ageRange: "25–34",
      rawInput:
        "I love Interstellar, Blade Runner 2049, A.R. Rahman's music, Japanese food — especially ramen and sushi — and quiet cafés where I can read.",
    },
    personB: {
      name: "Jordan",
      ageRange: "25–34",
      rawInput:
        "I'm obsessed with The Weeknd, Frank Ocean, Dune, Italian food, rooftop bars, and live electronic music concerts.",
    },
    location: "New York City",
    goal: "Plan a date night",
  },
  {
    id: "foodie-traveler",
    title: "The Foodie + The Traveler",
    subtitle: "Taste meets adventure",
    emoji: "🌍",
    personA: {
      name: "Priya",
      ageRange: "28–35",
      rawInput:
        "I live for trying new restaurants. My favourites are Nobu, any authentic Thai food, French pastries, and experimental tasting menus. Also love MasterChef and Chef's Table.",
    },
    personB: {
      name: "Marcus",
      ageRange: "28–35",
      rawInput:
        "I'm always planning the next trip — Kyoto, Marrakech, Lisbon are my recent favourites. I love street markets, local craft beer, Anthony Bourdain's style of travel, and hiking to scenic spots.",
    },
    location: "London",
    goal: "Plan a Saturday",
  },
  {
    id: "introvert-social",
    title: "The Introvert + The Social Butterfly",
    subtitle: "Opposite energies, surprising overlap",
    emoji: "✨",
    personA: {
      name: "Sam",
      ageRange: "22–30",
      rawInput:
        "I love Mitski, Phoebe Bridgers, reading literary fiction, art house films like Parasite and Past Lives, cozy dim sum spots, and thrift shopping.",
    },
    personB: {
      name: "Riley",
      ageRange: "22–30",
      rawInput:
        "I love house and techno music, big group dinners, Beyoncé, Korean BBQ, vintage streetwear, and going out dancing. Euphoria is my favourite show.",
    },
    location: "Los Angeles",
    goal: "Plan a hangout",
  },
];
