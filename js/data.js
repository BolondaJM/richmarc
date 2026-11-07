/* ==========================================================================
   Richmarc — site content
   ----------------------------------------------------------------------------
   SAMPLE CONTENT. Every listing, price, statistic, testimonial and build rate
   below is demo data written for the prototype. Replace it with confirmed
   figures before the site goes live. Everything is kept in this one file so
   it can be swapped (or wired to a CMS) without touching the page code.
   ========================================================================== */

(function () {
  const img = (id, w = 1600) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

  const IMAGES = {
    duskHouse: "1600585154340-be6161a56a0c",
    whitePoolVilla: "1600596542815-ffad4c1539a9",
    woodSoffitPool: "1613490493576-7fde63acd811",
    livingWood: "1600607687939-ce8a6c25118c",
    whiteModern: "1512917774080-9991f1c4c750",
    whiteTerracePool: "1613977257363-707ba9348227",
    timberFacade: "1600566753190-17f0baa2a6c3",
    warmLiving: "1600210492486-724fe5c67fb0",
    bedroom: "1600607687644-c7171b42498f",
    timberCube: "1600047509807-ba8f99d2cdde",
    dunePoolVilla: "1580587771525-78b9dba3b914",
    fireplaceLiving: "1613545325278-f24b0cae1224",
    poolTerrace: "1602343168117-bb8ffe3e2e9f",
    glassStair: "1600573472550-8090b5e0745e"
  };

  const properties = [
    {
      id: "obsidian-residence",
      name: "The Obsidian Residence",
      location: "Hillcrest Ridge",
      status: "For sale",
      price: 4285000,
      beds: 5,
      baths: 6,
      area: 6140,
      lot: 0.92,
      year: 2026,
      energy: "Net zero ready",
      cover: { src: img(IMAGES.duskHouse), alt: "Modern two storey home at dusk with glowing glass walls under a large oak tree" },
      gallery: [
        { src: img(IMAGES.livingWood), alt: "Open living room with walnut wall panelling and floor to ceiling glazing" },
        { src: img(IMAGES.bedroom), alt: "Primary bedroom with soft grey linens and garden views" }
      ],
      summary:
        "Dark brick, blackened steel and a full height glass gallery wrapped around a heritage oak. Every living space opens to the garden, and the lower level holds a wine room, gym and a private screening lounge.",
      features: ["Heritage oak courtyard", "Twelve seat screening lounge", "Climate controlled wine room", "Integrated solar roof with battery storage", "Heated limestone terrace", "Three car gallery garage"]
    },
    {
      id: "villa-lumen",
      name: "Villa Lumen",
      location: "Bayshore Heights",
      status: "For sale",
      price: 6740000,
      beds: 6,
      baths: 7,
      area: 7820,
      lot: 1.24,
      year: 2025,
      energy: "Solar + battery",
      cover: { src: img(IMAGES.whiteTerracePool), alt: "White modern villa with a cantilevered upper floor above a turquoise pool" },
      gallery: [
        { src: img(IMAGES.fireplaceLiving), alt: "Bright white living room with a linear fireplace and double height ceiling" },
        { src: img(IMAGES.glassStair), alt: "Floating steel staircase beside a glass wall overlooking the pool" }
      ],
      summary:
        "A bright white pavilion built around light. The upper floor floats over a 22 metre infinity edge pool, and a floating steel stair ties the gallery hall to a rooftop lounge with views across the bay.",
      features: ["22 metre infinity edge pool", "Rooftop lounge and outdoor kitchen", "Floating steel feature stair", "Whole home automation", "Guest suite with private entry", "Spa with steam room"]
    },
    {
      id: "cedar-line-house",
      name: "Cedar Line House",
      location: "Northwood Estate",
      status: "Under construction",
      price: 3195000,
      beds: 4,
      baths: 5,
      area: 4870,
      lot: 0.61,
      year: 2027,
      energy: "Passive house target",
      cover: { src: img(IMAGES.timberFacade), alt: "Contemporary home with vertical cedar cladding and a sculpted timber entry canopy" },
      gallery: [
        { src: img(IMAGES.warmLiving), alt: "Sunlit living room with leather sofas, plants and a gallery wall" },
        { src: img(IMAGES.bedroom), alt: "Calm bedroom with large windows and neutral textiles" }
      ],
      summary:
        "Charred and natural cedar, a sculpted timber canopy and deep set windows tuned to the sun path. Reserve now and choose your interior finishes while the structure goes up.",
      features: ["Choose your own finishes", "Triple glazed timber windows", "Heat recovery ventilation", "Private study with separate entry", "Landscaped rain garden", "EV ready garage"]
    },
    {
      id: "the-meridian",
      name: "The Meridian",
      location: "Lakeside Reserve",
      status: "For sale",
      price: 5460000,
      beds: 5,
      baths: 6,
      area: 6590,
      lot: 1.08,
      year: 2026,
      energy: "Geothermal heating",
      cover: { src: img(IMAGES.woodSoffitPool), alt: "Two level white residence with warm timber soffits and a long pool with lane markings" },
      gallery: [
        { src: img(IMAGES.livingWood), alt: "Living space with a timber feature wall and modern furniture" },
        { src: img(IMAGES.glassStair), alt: "Glass and steel stair hall looking out to the terrace" }
      ],
      summary:
        "Horizontal lines, warm timber soffits and a lap pool that runs the length of the house. Geothermal heating keeps running costs low through every season.",
      features: ["25 metre lap pool", "Geothermal heating and cooling", "Chef's kitchen with scullery", "Lakeside fire terrace", "Dual primary suites", "Smart glass privacy panels"]
    },
    {
      id: "halo-pavilion",
      name: "Halo Pavilion",
      location: "Coastal Bluffs",
      status: "Coming soon",
      price: 7915000,
      beds: 6,
      baths: 8,
      area: 8340,
      lot: 1.67,
      year: 2027,
      energy: "Net zero",
      cover: { src: img(IMAGES.dunePoolVilla), alt: "Terraced coastal villa with layered white and sandstone volumes above a lawn and pool" },
      gallery: [
        { src: img(IMAGES.fireplaceLiving), alt: "Airy living room with fireplace and pale oak floors" },
        { src: img(IMAGES.warmLiving), alt: "Lounge area with natural light and soft furnishings" }
      ],
      summary:
        "Terraced into the bluff so every level gets an uninterrupted view of the water. Registration of interest opens ahead of public release.",
      features: ["Ocean view from every bedroom", "Private elevator", "Wellness level with spa and gym", "Garden terraces on three levels", "Staff quarters", "Six car garage with gallery"]
    },
    {
      id: "atrium-no-4",
      name: "Atrium No. 4",
      location: "Hillcrest Ridge",
      status: "Under construction",
      price: 2875000,
      beds: 4,
      baths: 4,
      area: 4120,
      lot: 0.48,
      year: 2027,
      energy: "Solar ready",
      cover: { src: img(IMAGES.timberCube), alt: "Modern cubic home with dark timber cladding and white rendered walls" },
      gallery: [
        { src: img(IMAGES.warmLiving), alt: "Living room with large windows and warm wood furniture" },
        { src: img(IMAGES.bedroom), alt: "Bedroom with bright natural light" }
      ],
      summary:
        "A compact, crafted home arranged around a central light well. Clean rendered volumes meet dark timber, and the plan flexes to suit a growing family.",
      features: ["Central atrium light well", "Flexible ground floor suite", "Timber and render facade", "Underfloor heating", "Landscaped courtyard", "Home office pod"]
    },
    {
      id: "casa-aurea",
      name: "Casa Aurea",
      location: "Bayshore Heights",
      status: "For sale",
      price: 4920000,
      beds: 5,
      baths: 5,
      area: 5480,
      lot: 0.86,
      year: 2025,
      energy: "Solar + battery",
      cover: { src: img(IMAGES.whitePoolVilla), alt: "White villa with a curved pool, sun loungers and a rooftop terrace under a blue sky" },
      gallery: [
        { src: img(IMAGES.fireplaceLiving), alt: "White living room with a fireplace and modern seating" },
        { src: img(IMAGES.bedroom), alt: "Guest bedroom with calm neutral styling" }
      ],
      summary:
        "Mediterranean light in a modern frame. Sculpted white walls, a sun deck pool and a rooftop terrace made for long evenings.",
      features: ["Sun deck pool with spa", "Rooftop terrace with bar", "Summer kitchen", "Courtyard olive grove", "Gym and sauna", "Solar with battery backup"]
    },
    {
      id: "terrace-house",
      name: "The Terrace House",
      location: "Lakeside Reserve",
      status: "Coming soon",
      price: 3640000,
      beds: 4,
      baths: 5,
      area: 4960,
      lot: 0.72,
      year: 2027,
      energy: "Net zero ready",
      cover: { src: img(IMAGES.poolTerrace), alt: "Modern home with a wide stepped terrace leading down to a long rectangular pool" },
      gallery: [
        { src: img(IMAGES.glassStair), alt: "Interior stair with a glass balustrade overlooking the pool" },
        { src: img(IMAGES.livingWood), alt: "Living space with timber panelling" }
      ],
      summary:
        "A wide stepped terrace drops from the living level to a resort style pool. Indoor and outdoor rooms run together through 14 metres of sliding glass.",
      features: ["14 metres of sliding glass", "Stepped garden terrace", "Pool house with shower", "Wine wall", "Integrated speakers inside and out", "Two car garage plus workshop"]
    }
  ];

  const stats = [
    { value: 142, suffix: "", label: "Homes delivered" },
    { value: 18, suffix: "", label: "Years building" },
    { value: 97.4, suffix: "%", decimals: 1, label: "Handed over on schedule" },
    { value: 11, suffix: "", label: "Design awards" }
  ];

  const testimonials = [
    {
      quote:
        "We sat down with a sketch on a napkin and walked into a finished home fourteen months later. The weekly site reports meant we never had to chase anyone for an update.",
      name: "Danielle and Marcus Okafor",
      role: "Custom build, Hillcrest Ridge"
    },
    {
      quote:
        "The fixed price contract was the reason we signed. Two years on, the house still costs less to run than our old apartment did.",
      name: "Priya Raman",
      role: "Bought Villa Lumen"
    },
    {
      quote:
        "They treated the old oak on our lot like a member of the family. The whole plan was drawn around it, and it is the first thing every guest notices.",
      name: "Thomas Lindqvist",
      role: "Custom build, Northwood Estate"
    }
  ];

  const faqs = [
    {
      q: "Can I buy a finished home and still personalise it?",
      a: "Yes. Homes marked under construction let you choose interior finishes, joinery and lighting up to the lock up stage. Finished homes can be adjusted after purchase through our interiors team."
    },
    {
      q: "Do you build on land I already own?",
      a: "We do. We start with a site study covering soil, slope, sun path and planning controls, then design the house around what the land allows."
    },
    {
      q: "How long does a custom build take?",
      a: "Most custom homes take 12 to 18 months from signed design to handover. Design and approvals usually take another 4 to 6 months before construction starts."
    },
    {
      q: "Is the build price fixed?",
      a: "Once drawings are approved you receive a fixed price contract. The price only changes if you request a variation, and every variation is priced in writing before work begins."
    },
    {
      q: "What does the first consultation cost?",
      a: "Nothing. The first consultation is free and runs about 60 minutes, at our studio, on your site or by video call."
    },
    {
      q: "How will I know how my build is going?",
      a: "You get a private client portal with weekly photo reports, a live schedule and a direct line to your site manager."
    },
    {
      q: "What warranty comes with a new home?",
      a: "Every home includes a structural warranty and a 12 month maintenance period. We return at the 3 and 12 month marks to check and adjust everything."
    },
    {
      q: "Can you help with financing?",
      a: "We are not lenders, but we work with private banks that understand construction loans and can introduce you during the consultation."
    }
  ];

  /* Indicative custom build estimator (sample rates per sq ft) */
  const buildRates = {
    tiers: [
      { id: "signature", label: "Signature", rate: 465, note: "Premium finishes, smart lighting, engineered stone" },
      { id: "atelier", label: "Atelier", rate: 615, note: "Bespoke joinery, natural stone, full automation" },
      { id: "monolith", label: "Monolith", rate: 840, note: "Architect led, rare materials, wellness suite" }
    ],
    extras: [
      { id: "pool", label: "Pool and spa", cost: 168000 },
      { id: "solar", label: "Solar roof with battery", cost: 74500 },
      { id: "cinema", label: "Private cinema", cost: 92000 },
      { id: "elevator", label: "Residential elevator", cost: 61500 },
      { id: "wellness", label: "Sauna and steam room", cost: 48500 }
    ]
  };

  window.RICHMARC = { properties, stats, testimonials, faqs, buildRates, img, IMAGES };
})();
