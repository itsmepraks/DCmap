export interface MuseumGuideFact {
  match: RegExp
  signature: string
  whyItMatters: string
  hiddenDetail: string
  visitMission: string
  nearbyPairing: string
}

export const MUSEUM_GUIDE_FACTS: MuseumGuideFact[] = [
  {
    match: /natural history/i,
    signature: 'Start with the Hope Diamond, the dinosaur hall, and the Hall of Human Origins. This is the Smithsonian stop where science feels huge and immediate.',
    whyItMatters: 'It is one of the most visited natural history museums in the world, built around specimens that help explain Earth, life, extinction, geology, and human origins at public scale.',
    hiddenDetail: 'The Hope Diamond is famous for its color and legend, but the quieter move is to compare it with the mineral cases nearby; the room is really a crash course in pressure, time, and chemistry.',
    visitMission: 'If you only have 45 minutes, choose either gems and minerals or dinosaurs. Trying to sprint both usually turns the visit into hallway traffic.',
    nearbyPairing: 'Pair it with the National Museum of American History across the Mall for a science-to-culture contrast.',
  },
  {
    match: /african american history/i,
    signature: 'The building itself tells part of the story: bronze-colored lattice panels wrap a form inspired by the corona shape in Yoruban art.',
    whyItMatters: 'This museum places African American history at the center of the national story, from slavery and segregation to music, foodways, military service, entrepreneurship, and everyday life.',
    hiddenDetail: 'The history galleries descend below ground before rising upward, so the visitor path physically mirrors a movement from buried history toward public memory.',
    visitMission: 'Reserve real time here. The lower history galleries are emotionally heavy and deserve a slower pace than a quick photo stop.',
    nearbyPairing: 'Step outside afterward toward the Washington Monument. The open Mall gives the museum experience room to breathe.',
  },
  {
    match: /american history/i,
    signature: 'The Star-Spangled Banner is the anchor: the enormous flag that inspired the national anthem during the War of 1812.',
    whyItMatters: 'This museum turns national history into objects: first-lady gowns, transportation, protest signs, inventions, military artifacts, and pop-culture pieces that people actually remember.',
    hiddenDetail: 'The flag is displayed in dim light because preservation matters more than spectacle. Its darkness is part of the conservation story.',
    visitMission: 'Go straight to the flag first, then choose one wing: democracy, transportation, food, or entertainment.',
    nearbyPairing: 'Pair it with the National Museum of African American History and Culture to see how public memory changes depending on whose objects lead the story.',
  },
  {
    match: /american indian/i,
    signature: 'The curving limestone building is intentionally different from the classical boxes nearby, with landscape and water shaping the arrival.',
    whyItMatters: 'It presents Native nations as living cultures, not as a closed chapter. The strongest visits notice sovereignty, language, food, art, and contemporary life together.',
    hiddenDetail: 'The Mitsitam Cafe is part of the experience, with regional Indigenous food traditions represented through the menu.',
    visitMission: 'Do not rush to generalize. Pick one nation, one artist, or one food tradition and follow it closely.',
    nearbyPairing: 'Pair it with the U.S. Capitol view nearby for a sharp contrast between Indigenous sovereignty and federal power.',
  },
  {
    match: /air and space/i,
    signature: 'This is the big one for aircraft and spacecraft: the Wright Flyer, Apollo artifacts, spacesuits, rockets, and the machines that made the sky feel reachable.',
    whyItMatters: 'It connects engineering ambition with national myth, Cold War competition, commercial flight, and the human urge to leave the ground.',
    hiddenDetail: 'The best story is not just the machines; it is how fragile many of them look up close. Space history is heroic, but it is also wires, fabric, heat shields, and risk.',
    visitMission: 'Choose aviation or space first. If you try to absorb both equally, the museum becomes a blur of famous metal.',
    nearbyPairing: 'Pair it with the Hirshhorn nearby if you want a great left turn from engineering to contemporary art.',
  },
  {
    match: /phillips collection/i,
    signature: 'America’s first museum of modern art feels more like entering a collector’s home than a national institution.',
    whyItMatters: 'Duncan Phillips built a collection around emotional intensity, not just chronology, which is why the museum feels intimate and personal.',
    hiddenDetail: 'Rothko Room is the quiet prize. The scale is small, the seating matters, and the paintings reward stillness more than a quick glance.',
    visitMission: 'Treat this as a slow art stop. Choose three rooms and actually sit with them.',
    nearbyPairing: 'Pair it with Dupont Circle before or after; the neighborhood walk is part of the charm.',
  },
  {
    match: /women in the arts/i,
    signature: 'This museum centers women artists across centuries instead of treating them as footnotes in someone else’s timeline.',
    whyItMatters: 'Its collection pushes against a real imbalance in art history: who gets collected, exhibited, remembered, and taught.',
    hiddenDetail: 'The building began as a Masonic temple, so part of the visit is watching a monumental historic structure get repurposed for a very different cultural mission.',
    visitMission: 'Look for one older work and one contemporary work, then compare what changed and what did not.',
    nearbyPairing: 'Pair it with the National Portrait Gallery for a broader conversation about visibility and recognition.',
  },
  {
    match: /portrait gallery/i,
    signature: 'This is where American biography becomes visual: presidents, activists, artists, athletes, writers, and cultural figures sharing one civic stage.',
    whyItMatters: 'Portraits are never just likenesses. They are arguments about who matters enough to be remembered.',
    hiddenDetail: 'The building once housed the U.S. Patent Office. During the Civil War, parts of it served as a hospital where Walt Whitman visited wounded soldiers.',
    visitMission: 'Start with the presidential portraits, then find one person you did not expect to see.',
    nearbyPairing: 'Pair it with dinner or a walk through Penn Quarter; this is one of the easiest museums to fold into a city evening.',
  },
  {
    match: /hirshhorn/i,
    signature: 'The round concrete form already tells you this is not a polite marble museum. It is the Smithsonian’s bold modern and contemporary art stop.',
    whyItMatters: 'The Hirshhorn gives the Mall a living-art counterweight to monuments and history museums.',
    hiddenDetail: 'The sculpture garden is not a side dish. It is often the best entry point because scale, shadow, and walking distance change the art.',
    visitMission: 'Let one strange piece win. Contemporary art gets better when you stop asking “what is it?” and start asking “what is it doing to me?”',
    nearbyPairing: 'Pair it with Air and Space across the street for a fun machine-versus-imagination contrast.',
  },
  {
    match: /spy museum/i,
    signature: 'This is the high-energy stop: gadgets, covers, codes, dead drops, disguises, and the messy ethics of intelligence work.',
    whyItMatters: 'It turns espionage from movie fantasy into tradecraft, politics, technology, and human pressure.',
    hiddenDetail: 'The best exhibits are often the ordinary-looking objects. Spy tools work because they disappear into daily life.',
    visitMission: 'Use the interactive identity mission if you have time. It makes the museum feel less like cases on a wall and more like a role you are playing.',
    nearbyPairing: 'Pair it with L’Enfant Plaza or the Wharf if you want food and a very different DC mood afterward.',
  },
  {
    match: /building museum/i,
    signature: 'The Great Hall is the star: colossal Corinthian columns, red brick, and enough interior volume to make people instinctively look up.',
    whyItMatters: 'It explains architecture, engineering, housing, city planning, and the built environment as things that shape daily life.',
    hiddenDetail: 'The building was originally the Pension Building, and the frieze around the exterior shows Civil War military units.',
    visitMission: 'Before reading anything, stand in the Great Hall and feel the scale. Then choose one exhibition about how cities are made.',
    nearbyPairing: 'Pair it with the National Portrait Gallery; both are adaptive reuse stories hiding in plain sight.',
  },
  {
    match: /holocaust/i,
    signature: 'This is a living memorial, not a casual museum stop. Its architecture, pacing, and artifacts are designed to make history morally unavoidable.',
    whyItMatters: 'It documents the Holocaust while asking visitors to recognize propaganda, persecution, bureaucracy, and choices made by ordinary people and institutions.',
    hiddenDetail: 'The ID card experience gives visitors an individual life story to carry through the permanent exhibition.',
    visitMission: 'Do not stack this between light attractions. Give yourself time afterward before jumping back into normal sightseeing.',
    nearbyPairing: 'Walk toward the Tidal Basin or the Mall afterward if you need quiet space.',
  },
  {
    match: /ford/i,
    signature: 'This is still a working theater, but it is also the site where Abraham Lincoln was assassinated on April 14, 1865.',
    whyItMatters: 'The museum connects the end of the Civil War, Lincoln’s death, Reconstruction, and national memory in one compact place.',
    hiddenDetail: 'The Petersen House across the street is where Lincoln died the next morning. The story is not complete without crossing over.',
    visitMission: 'Visit the theater and Petersen House together. The physical distance across the street makes the night feel startlingly real.',
    nearbyPairing: 'Pair it with the National Portrait Gallery nearby for more Civil War-era context.',
  },
  {
    match: /marine corps/i,
    signature: 'The building silhouette evokes the flag raising at Iwo Jima, so the architecture announces the Marine story before you enter.',
    whyItMatters: 'It traces Marine Corps history through immersive galleries, aircraft, vehicles, weapons, personal stories, and battlefield environments.',
    hiddenDetail: 'The leatherneck gallery layout is intentionally theatrical; sound and scale are used to make history feel close.',
    visitMission: 'Give this one more time than expected. It is outside central DC, so treat it as a dedicated trip.',
    nearbyPairing: 'Pair it with Quantico-area military history stops rather than trying to squeeze it into a Mall day.',
  },
  {
    match: /mount vernon/i,
    signature: 'Mount Vernon is George Washington’s estate on the Potomac, where biography, slavery, farming, politics, and landscape all collide.',
    whyItMatters: 'It makes Washington less like a marble symbol and more like a landowner, military leader, enslaver, entrepreneur, and president.',
    hiddenDetail: 'The river view from the piazza is one of the most revealing parts of the estate; Washington designed life here around that prospect.',
    visitMission: 'Do the mansion, the enslaved people’s memorial, and the river-facing grounds. Those three together tell a fuller story.',
    nearbyPairing: 'Pair it with the reconstructed distillery and gristmill if you want the working-estate story.',
  },
  {
    match: /arlington national cemetery/i,
    signature: 'Arlington is sacred ground: rolling hills, military honors, presidential graves, and the Tomb of the Unknown Soldier.',
    whyItMatters: 'It connects national service, grief, memory, and ceremony on land that once belonged to Robert E. Lee’s family.',
    hiddenDetail: 'The Changing of the Guard follows a precise ritual of steps, pauses, turns, and inspection. The discipline is part of the memorial language.',
    visitMission: 'Move slowly. The Kennedy gravesite, Tomb of the Unknown Soldier, and Arlington House form the essential first route.',
    nearbyPairing: 'Pair it with the Lincoln Memorial view across the river for a powerful civic-memory arc.',
  },
]

export const DEFAULT_MUSEUM_GUIDE_FACT: Omit<MuseumGuideFact, 'match'> = {
  signature: 'This stop adds another layer to the DC museum map: a focused collection, a specific story, and a reason to slow down instead of only chasing monuments.',
  whyItMatters: 'Museums in this region work best as lenses. Each one gives you a different way to read the city: art, memory, design, science, service, community, or power.',
  hiddenDetail: 'The useful trick is to look for the curatorial choice: what did this place decide to put first, and what does that say about its mission?',
  visitMission: 'Pick one question before entering. A museum visit gets much better when you are searching for something, not trying to absorb everything.',
  nearbyPairing: 'If this is near the Mall, pair it with a monument walk. If it is outside central DC, treat the neighborhood or grounds as part of the visit.',
}

export function getMuseumGuideFact(name: string): Omit<MuseumGuideFact, 'match'> {
  const fact = MUSEUM_GUIDE_FACTS.find((item) => item.match.test(name))
  if (!fact) return DEFAULT_MUSEUM_GUIDE_FACT
  const { match: _match, ...rest } = fact
  return rest
}
