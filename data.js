const regions = [
  { slug: "central-london", name: "Central London", boroughs: ["City of London", "Westminster", "Camden", "Islington", "Kensington and Chelsea"], neighbourhoods: ["Mayfair", "Soho", "Covent Garden", "Marylebone", "Fitzrovia", "Holborn", "Bloomsbury", "Pimlico", "Victoria", "Belgravia", "Knightsbridge", "Chelsea", "Kensington", "South Kensington", "Notting Hill", "Paddington", "Clerkenwell", "Angel", "Barbican"] },
  { slug: "north-london", name: "North London", boroughs: ["Barnet", "Enfield", "Haringey"], neighbourhoods: ["Hampstead", "Finchley", "Hendon", "Golders Green", "Edgware", "Mill Hill", "Enfield Town", "Edmonton", "Palmers Green", "Southgate", "Muswell Hill", "Crouch End", "Wood Green", "Tottenham"] },
  { slug: "north-west-london", name: "North West London", boroughs: ["Brent", "Harrow"], neighbourhoods: ["Wembley", "Kilburn", "Willesden", "Neasden", "Harlesden", "Kingsbury", "Kenton", "Harrow", "Pinner", "Stanmore", "Queensbury"] },
  { slug: "west-london", name: "West London", boroughs: ["Hillingdon", "Ealing", "Hammersmith and Fulham", "Hounslow"], neighbourhoods: ["Uxbridge", "Hayes", "West Drayton", "Ruislip", "Northwood", "Southall", "Acton", "Ealing Broadway", "Hanwell", "Greenford", "Chiswick", "Brentford", "Hounslow", "Isleworth", "Feltham", "Hammersmith", "Fulham", "Shepherd's Bush"] },
  { slug: "south-west-london", name: "South West London", boroughs: ["Richmond upon Thames", "Kingston upon Thames", "Merton", "Wandsworth"], neighbourhoods: ["Richmond", "Twickenham", "Teddington", "Hampton", "Kingston", "Surbiton", "New Malden", "Wimbledon", "Morden", "Mitcham", "Putney", "Battersea", "Balham", "Tooting", "Earlsfield", "Wandsworth"] },
  { slug: "south-london", name: "South London", boroughs: ["Sutton", "Croydon", "Lambeth"], neighbourhoods: ["Sutton", "Carshalton", "Wallington", "Cheam", "Croydon", "Purley", "Thornton Heath", "South Norwood", "Norbury", "Brixton", "Clapham", "Streatham", "Vauxhall", "Kennington", "Stockwell"] },
  { slug: "south-east-london", name: "South East London", boroughs: ["Southwark", "Lewisham", "Greenwich", "Bexley", "Bromley"], neighbourhoods: ["London Bridge", "Bermondsey", "Rotherhithe", "Peckham", "Dulwich", "Camberwell", "Deptford", "Lewisham", "Catford", "Blackheath", "Greenwich", "Woolwich", "Eltham", "Thamesmead", "Bexleyheath", "Sidcup", "Bromley", "Orpington", "Beckenham"] },
  { slug: "east-london", name: "East London", boroughs: ["Tower Hamlets", "Newham", "Barking and Dagenham", "Havering"], neighbourhoods: ["Canary Wharf", "Poplar", "Limehouse", "Whitechapel", "Bethnal Green", "Bow", "Mile End", "Stratford", "West Ham", "East Ham", "Canning Town", "Plaistow", "Barking", "Dagenham", "Romford", "Hornchurch", "Upminster"] },
  { slug: "north-east-london", name: "North East London", boroughs: ["Hackney", "Waltham Forest", "Redbridge"], neighbourhoods: ["Hackney Central", "Dalston", "Shoreditch", "Stoke Newington", "Clapton", "Homerton", "Walthamstow", "Leyton", "Leytonstone", "Chingford", "Woodford", "Wanstead", "Ilford", "Seven Kings", "Gants Hill", "South Woodford"] }
];

const services = [
  ["house-removals", "House removals", "Plan a home move around your rooms, belongings, access and preferred date.", "Residential"],
  ["home-removals", "Home removals", "Tell us about your household move and the help you would like to arrange.", "Residential"],
  ["flat-removals", "Flat removals", "Share floor, lift, stair and parking details to help assess a flat move.", "Residential"],
  ["apartment-moving", "Apartment removals", "Describe your apartment move, building access and the items to be moved.", "Residential"],
  ["studio-removals", "Studio removals", "Outline a compact move, access details and any larger or fragile items.", "Residential"],
  ["small-house-moves", "Small house moves", "Share an inventory for a smaller household move and request an individual assessment.", "Residential"],
  ["large-house-moves", "Large house moves", "List rooms, furniture, access requirements and preferred timings for a larger move.", "Residential"],
  ["family-home-moves", "Family home moves", "Plan around household belongings, practical access and your family's moving schedule.", "Residential"],
  ["office-removals", "Office removals", "Describe desks, equipment, floors and building access for an office move.", "Commercial"],
  ["office-relocation", "Office relocation", "Coordinate an office move with details about furniture, equipment and access.", "Commercial"],
  ["commercial-removals", "Commercial removals", "Discuss moving requirements for commercial premises and business equipment.", "Commercial"],
  ["business-relocation", "Business relocation", "Outline your business premises, equipment and preferred moving schedule.", "Commercial"],
  ["shop-removals", "Shop removals", "Share shop access, fixtures, stock and the timing requirements for a move.", "Commercial"],
  ["retail-relocation", "Retail relocation", "Plan a retail move around fixtures, equipment, stock and premises access.", "Commercial"],
  ["restaurant-removals", "Restaurant removals", "Describe restaurant furniture, equipment and site access for an assessment.", "Commercial"],
  ["warehouse-relocation", "Warehouse relocation", "Outline the premises, inventory, equipment and loading access involved.", "Commercial"],
  ["factory-relocation", "Factory relocation", "Provide details of site access and equipment for an initial relocation assessment.", "Commercial"],
  ["man-and-van", "Man and van", "Request an assessment for a smaller move, collection or furniture transport.", "Transport"],
  ["small-removals", "Small removals", "Describe a smaller move, its route and the items that need to be transported.", "Transport"],
  ["single-item-moving", "Single item moving", "Request an item collection or delivery and describe its size and access.", "Transport"],
  ["furniture-collection-delivery", "Furniture collection and delivery", "Share collection, destination and item details for a furniture transport enquiry.", "Transport"],
  ["packing-services", "Packing services", "Ask about full or partial packing, fragile belongings and materials.", "Packing"],
  ["full-packing", "Full packing", "Describe the property and belongings if you would like to ask about full packing.", "Packing"],
  ["partial-packing", "Partial packing", "List the rooms or belongings you would like help preparing.", "Packing"],
  ["house-packing", "House packing", "Share your household packing requirements and preferred moving date.", "Packing"],
  ["office-packing", "Office packing", "Outline workplace contents, equipment and packing arrangements to discuss.", "Packing"],
  ["fragile-item-packing", "Fragile item packing", "Identify delicate belongings and any known packing or handling requirements.", "Packing"],
  ["unpacking-services", "Unpacking services", "Include unpacking assistance in your moving requirements.", "Packing"],
  ["packing-materials", "Packing materials", "Ask about packing materials and describe the size of your move.", "Packing"],
  ["furniture-removals", "Furniture removals", "Plan transport for household or office furniture and individual items.", "Furniture"],
  ["sofa-removals", "Sofa removals", "Describe sofa dimensions, access and whether it needs dismantling.", "Furniture"],
  ["bed-removals", "Bed removals", "Include bed sizes, frames and any dismantling requirements in your enquiry.", "Furniture"],
  ["wardrobe-removals", "Wardrobe removals", "Share wardrobe dimensions, floors and whether it needs to be dismantled.", "Furniture"],
  ["table-removals", "Table removals", "Describe table size, access and any protective handling needs.", "Furniture"],
  ["cabinet-moving", "Cabinet moving", "List cabinet dimensions and access at both addresses for an assessment.", "Furniture"],
  ["furniture-dismantling", "Furniture dismantling and assembly", "Let us know which items need dismantling or reassembly.", "Furniture"],
  ["storage-solutions", "Storage solutions", "Enquire about storage as part of your move; availability is confirmed individually.", "Storage"],
  ["household-storage", "Household storage", "Describe the household belongings and storage duration you would like to discuss.", "Storage"],
  ["furniture-storage", "Furniture storage", "List furniture items and the approximate storage period for an enquiry.", "Storage"],
  ["short-term-storage", "Short-term storage", "Ask about short-term storage options and share your timing requirements.", "Storage"],
  ["long-term-storage", "Long-term storage", "Describe your storage needs and intended duration for an individual assessment.", "Storage"],
  ["business-storage", "Business storage", "Outline business items, access and storage timing requirements.", "Storage"],
  ["moving-and-storage", "Moving and storage", "Include storage alongside your moving dates and inventory.", "Storage"],
  ["piano-removals", "Piano removals", "Specialist-item requests are assessed before availability can be confirmed.", "Specialist"],
  ["antique-removals", "Antique removals", "Describe delicate or antique pieces and any handling guidance you know.", "Specialist"],
  ["artwork-moving", "Artwork moving", "Share artwork size, fragility and access details for an initial assessment.", "Specialist"],
  ["safe-moving", "Safe moving", "Provide approximate dimensions, weight if known and access details for review.", "Specialist"],
  ["heavy-item-moving", "Heavy item removals", "Describe the item and access so handling requirements can be assessed.", "Specialist"],
  ["gym-equipment-moving", "Gym equipment moving", "List equipment and any dismantling, access or specialist handling needs.", "Specialist"],
  ["specialist-equipment-moving", "Specialist equipment moving", "Explain the equipment and handling requirements so capability can be checked.", "Specialist"],
  ["student-removals", "Student removals", "Plan a move between student accommodation, home or another address.", "Additional"],
  ["same-day-moving", "Same-day moving", "Urgent requests can be submitted; timing and availability are not guaranteed.", "Additional"],
  ["urgent-moving", "Urgent moving enquiries", "Share your timing and requirements; short-notice availability must be confirmed.", "Additional"],
  ["weekend-moving", "Weekend moving enquiries", "Tell us if a weekend date is preferred; availability is confirmed individually.", "Additional"],
  ["senior-moving-assistance", "Senior moving assistance", "Describe the support and timing that would make a move more manageable.", "Additional"],
  ["long-distance-removals", "Long-distance removals", "Share your route and inventory for a move beyond the local area.", "Additional"],
  ["international-removals", "International removals enquiries", "Provide origin, destination and shipment details so requirements can be assessed.", "Additional"]
].map(([slug, name, summary, category]) => ({ slug, name, summary, category }));

const popularAreas = ["Mayfair", "Soho", "Covent Garden", "Marylebone", "Chelsea", "Kensington", "Westminster", "Camden", "Islington", "Hampstead", "Finchley", "Wembley", "Harrow", "Ealing", "Acton", "Chiswick", "Hammersmith", "Richmond", "Twickenham", "Kingston", "Wimbledon", "Morden", "Croydon", "Brixton", "Clapham", "Peckham", "Greenwich", "Lewisham", "Bromley", "Canary Wharf", "Stratford", "Hackney", "Ilford", "Romford", "Walthamstow"];

const premises = [
  "Houses", "Flats", "Apartments", "Studio apartments", "Shared accommodation", "Student accommodation",
  "Offices", "Shops", "Retail units", "Restaurants", "Cafes", "Hotels", "Warehouses", "Factories", "Workshops",
  "Schools", "Colleges", "Universities", "Nurseries", "Childcare centres", "Libraries",
  "Clinics", "Dental practices", "Private practices", "Care homes", "Hospitals",
  "Churches", "Mosques", "Temples", "Synagogues",
  "Museums and galleries", "Gyms and fitness studios", "Sports clubs", "Theatres",
  "Council buildings", "Government buildings", "Police stations", "Fire stations", "Ambulance stations",
  "Storage units", "Garages", "Community centres", "Event venues", "Commercial buildings"
];

const articles = [
  ["london-moving-checklist", "Your London moving checklist", "A practical timeline for preparing addresses, belongings, access and moving-day essentials."],
  ["prepare-for-moving-day", "How to prepare for moving day", "Simple steps to confirm arrangements, protect belongings and make collection easier."],
  ["how-to-pack-your-house", "How to pack your home", "A room-by-room approach to organising boxes and identifying fragile items."],
  ["moving-into-a-london-flat", "Moving into a London flat", "What to check about lifts, stairs, loading access and building arrangements."],
  ["office-relocation-checklist", "Office relocation checklist", "Plan communications, equipment, access and the sequence of a workplace move."],
  ["preparing-furniture", "Preparing furniture for a move", "Measure, empty and label furniture before it is moved."],
  ["moving-between-boroughs", "Moving between London boroughs", "Coordinate a local move with realistic timings and address details."],
  ["choosing-a-removals-company", "Choosing a removals company", "Questions to ask when comparing quotations and moving arrangements."]
].map(([slug, title, summary]) => ({ slug, title, summary }));

const faqs = [
  ["How much does a London move cost?", "The cost depends on factors such as the amount to move, route, access, date and any packing or storage requested. Share those details for an individual quotation; we do not publish unverified fixed prices."],
  ["How do I request a quotation?", "Use the quote form to share your addresses, property details, inventory and preferred date. You will receive an enquiry reference after the information is saved."],
  ["Which London areas do you cover?", "The directory organises London by region, borough and neighbourhood. Specific service availability is not yet confirmed; please include your postcodes so the team can check."],
  ["Can you help with different property types?", "You can submit a request for residential, business or other premises. Restricted buildings require the appropriate authorisation and access permission."],
  ["Can I request packing or unpacking?", "Yes, you can include packing, unpacking and packing materials in an enquiry. Availability is confirmed individually."],
  ["Do you provide storage?", "You can ask about storage in your enquiry. Facilities, duration and availability must be confirmed before a booking."],
  ["Can you move heavy or specialist items?", "Describe the item, dimensions where known, and access at both addresses. Requests are subject to an assessment of handling requirements."],
  ["What about parking and access?", "Include parking restrictions, loading distance, stairs, lifts and any building rules. You may need to arrange permits or notify building management."],
  ["Can I change my moving date?", "Submit your preferred date and whether it is flexible. Any change to a confirmed arrangement must be agreed with the company."],
  ["Are same-day moves available?", "You can submit an urgent enquiry, but same-day availability is not guaranteed and must be confirmed."],
  ["How do cancellations work?", "Cancellation terms depend on the agreed booking terms. Review your written confirmation and contact the company directly with questions."],
  ["Do you move pianos and fragile items?", "You can request specialist handling. The item and access details need to be reviewed before the service can be confirmed."]
];

const boroughSlug = (name) => name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const locations = regions.flatMap((region) => region.boroughs.map((name) => ({ name, slug: boroughSlug(name), regionSlug: region.slug, regionName: region.name, type: name === "City of London" ? "city" : "borough" })));
const allNeighbourhoods = regions.flatMap((region) => region.neighbourhoods.map((name) => ({ name, slug: boroughSlug(name), regionSlug: region.slug, regionName: region.name, type: "neighbourhood" })));
const neighbourhoodRouteSegments = (area) => [
  area.regionSlug,
  ...(locations.some((location) => location.regionSlug === area.regionSlug && location.slug === area.slug) ? ["neighbourhoods"] : []),
  area.slug,
];
const neighbourhoodUrl = (area) => `/areas-we-cover/${neighbourhoodRouteSegments(area).join("/")}`;

export { regions, services, popularAreas, premises, articles, faqs, locations, allNeighbourhoods, boroughSlug, neighbourhoodRouteSegments, neighbourhoodUrl };
