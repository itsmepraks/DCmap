'use client'

/**
 * Hand-written tour content for each DC landmark. Fact-checked, no LLM
 * hallucination. Each tour has 4 cards: a quick pitch, a piece of history,
 * a surprising detail, and a tip for being there.
 *
 * The 'voice' card text is rendered into pre-generated audio files by
 * scripts/generateTourAudio.ts. Keep it conversational and paced like an
 * in-person guide; the 'display' text is the card body shown on screen.
 */

export interface TourCard {
  kind: 'pitch' | 'history' | 'surprise' | 'tip'
  title: string
  display: string
  voice: string
}

export interface Tour {
  id: string
  name: string
  intro: string
  cards: TourCard[]
}

export const TOURS: Record<string, Tour> = {
  'white-house': {
    id: 'white-house',
    name: 'The White House',
    intro: "You've reached the White House — every U.S. President since 1800 has lived here.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          "1600 Pennsylvania Avenue NW. The official residence and workplace of the President. It has 132 rooms across six floors, sits on 18 acres of grounds, and has been the home of every U.S. President except George Washington — who never lived in the house bearing his name.",
        voice:
          "Alright, you're looking at 1600 Pennsylvania Avenue. This is the President's home and working office, and every president since John Adams has lived here. Small twist: George Washington never did. The house with his city's name was finished after his presidency.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'James Hoban won a 1792 design contest with a building inspired by Leinster House in Dublin. It was burned by British troops in 1814 and rebuilt in the same Aquia Creek sandstone — the soot stains are why it was painted white. Theodore Roosevelt made the name "White House" official in 1901.',
        voice:
          "Here's the movie-scene version. James Hoban won the design contest in 1792, drawing inspiration from Leinster House in Dublin. Then in 1814, British troops burned the building. It was rebuilt and painted white over the fire damage. Theodore Roosevelt later made the name official.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'There is a fully equipped dental office, a chocolate shop, a bowling alley, and a movie theater inside. The annual electric bill is around four million dollars. The walls of the State Dining Room are still scorched from the 1814 fire, hidden behind paint.',
        voice:
          "The fun part is how much is hiding inside. There is a dental office, a chocolate shop, a bowling alley, and a movie theater. And behind all that ceremony, some walls still carry hidden scars from the 1814 fire.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          "Public tours are free but require a request through your Member of Congress at least three weeks in advance. The best photo angle is from the Ellipse to the south — Lafayette Square to the north is blocked off after security upgrades. Look for the Truman Balcony, added in 1948 and controversial at the time.",
        voice:
          "If you were standing here with a guide, I'd send you to the Ellipse for the cleaner photo angle. Public tours are free, but you request them through a member of Congress weeks ahead. And look for the Truman Balcony. It looks normal now, but people argued hard about it in 1948.",
      },
    ],
  },
  'us-capitol': {
    id: 'us-capitol',
    name: 'United States Capitol',
    intro: "You've arrived at the Capitol — the meeting place of the U.S. Congress.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          'The Capitol building, completed in 1800 and home to the House of Representatives and the Senate. The iconic cast-iron dome rises 288 feet and is topped by the Statue of Freedom, a 19-foot bronze figure that always faces east.',
        voice:
          "This is the United States Capitol, the working home of Congress. That dome rises 288 feet, and the figure on top is the Statue of Freedom. She's 19 feet tall, bronze, and always faces east. Tiny from here, enormous up close.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          "Construction started in 1793 with George Washington laying the cornerstone. British troops burned the building in 1814, leaving it gutted. The current dome wasn't built until the Civil War — Lincoln insisted construction continue as a symbol that the Union would survive. He was right.",
        voice:
          "Construction started in 1793, with George Washington laying the cornerstone. The British burned the building in 1814, and the dome you see now came later, during the Civil War. Lincoln insisted the work continue, as a message that the Union would survive. That is a powerful flex in stone and iron.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "The dome is not stone — it is 8.9 million pounds of cast iron, painted to look like the marble below it. The Rotunda's ceiling fresco, 'The Apotheosis of Washington,' was painted in 11 months by Constantino Brumidi while he hung 180 feet in the air on a swinging platform.",
        voice:
          "Here is the detail most people miss: the dome is not stone. It is 8.9 million pounds of cast iron, painted to match the marble below. And the Rotunda fresco was painted by an artist hanging 180 feet up on a swinging platform. No thank you, but also, incredible.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Free guided tours run six days a week and book up months ahead — reserve through the Capitol Visitor Center. Photography is allowed in the Rotunda but not in the chambers. If Congress is in session, you can sit in the gallery and watch debates live with a separate pass.',
        voice:
          "The Capitol Visitor Center runs free tours, and they can book up fast. If Congress is in session, ask about gallery passes. You can actually sit above the chamber and watch American government happen in real time.",
      },
    ],
  },
  'lincoln-memorial': {
    id: 'lincoln-memorial',
    name: 'Lincoln Memorial',
    intro: "You've reached the Lincoln Memorial — Lincoln himself is inside, 19 feet tall.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          'A Greek-temple form with 36 Doric columns — one for each state in the Union when Lincoln died. Inside sits Daniel Chester French\'s 19-foot marble statue of Lincoln, gazing east down the Reflecting Pool toward the Washington Monument and Capitol.',
        voice:
          "Take a second and picture the approach up those steps. The memorial is built like a Greek temple, with 36 columns, one for each state in the Union when Lincoln died. Inside, Lincoln sits 19 feet tall, looking east over the Reflecting Pool.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'Dedicated in 1922, fifty-seven years after Lincoln\'s assassination. Lincoln\'s son Robert attended the ceremony. Booker T. Washington spoke. The audience was segregated. The memorial\'s history with the civil rights movement begins right there — and would return with Marian Anderson in 1939 and Dr. King in 1963.',
        voice:
          "This place carries a complicated history. It was dedicated in 1922, 57 years after Lincoln's assassination, and the audience was segregated. Later, it became a stage for Marian Anderson in 1939 and Dr. King in 1963. Same steps, very different America.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'On the north wall is the Gettysburg Address, all 272 words. On the south wall is the Second Inaugural Address. There is a typo: the engraver carved an "E" instead of an "F" in "future" and tried to patch it — you can still see the correction. The hands of the statue are positioned to spell "A" and "L" in American Sign Language.',
        voice:
          "Inside, look closely at the carved speeches. There is a patched typo in the Second Inaugural Address, where an E was carved instead of an F in future. You can still spot the repair. The statue's hands are also said to form A and L in sign language.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Open 24 hours, free, no tickets. It is at its most powerful at night when the chamber is lit and the crowds thin. Stand on the spot marked "I Have a Dream" on the steps — that is where Dr. King stood on August 28, 1963. The acoustics inside the chamber are unusually intimate; whispers carry.',
        voice:
          "My favorite time here is night. It is free, open 24 hours, and the chamber feels almost quiet enough to whisper. On the steps, find the marker for 'I Have a Dream.' That is where Dr. King stood on August 28, 1963.",
      },
    ],
  },
  'washington-monument': {
    id: 'washington-monument',
    name: 'Washington Monument',
    intro: "You've arrived at the Washington Monument — 555 feet of marble in honor of the first President.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          "The world's tallest stone obelisk: 555 feet, 5⅛ inches. Honors George Washington. When it was finished in 1884, it was the tallest structure on Earth — for five years, until the Eiffel Tower took the title.",
        voice:
          "Look up. This is the world's tallest stone obelisk, 555 feet of marble honoring George Washington. When it was finished in 1884, it was the tallest structure on Earth. It kept that title for five years, until the Eiffel Tower showed up and stole the crown.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'Construction began in 1848 and stopped in 1854 when funding ran out and the Civil War intervened. When work resumed in 1879, the original marble quarry had closed. You can see the seam clearly today — about a third of the way up, the marble shifts color where the second phase began.',
        voice:
          "This monument has a very visible plot twist. Construction started in 1848, then stopped for 25 years because money ran out and the Civil War intervened. When work resumed, the quarry had changed. About a third of the way up, the marble shifts color. That line is the pause in the story.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "It is the world's tallest obelisk and the world's tallest free-standing stone structure. The cap is a 100-ounce solid aluminum pyramid — aluminum was a precious metal in 1884, more valuable than silver. There are 193 memorial stones donated by states, countries, and groups embedded in the interior walls.",
        voice:
          "At the very top is a 100-ounce aluminum pyramid. That sounds ordinary now, but in 1884 aluminum was precious, more valuable than silver. Inside the walls are 193 memorial stones sent by states, countries, and groups around the world.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'You can ride a 70-second elevator to the observation deck at 500 feet — free timed-entry tickets, often booked out the same day they release. The best photo of the monument is from the WWII Memorial side, at golden hour, with the reflecting pool in front. At night the marble is lit and looks otherworldly.',
        voice:
          "If you visit in person, the elevator takes about 70 seconds to reach the 500-foot observation deck. Tickets are free but timed. And at night, when the floodlights hit the marble from below, the whole thing feels unreal in the best way.",
      },
    ],
  },
  'jefferson-memorial': {
    id: 'jefferson-memorial',
    name: 'Jefferson Memorial',
    intro: "You've reached the Jefferson Memorial — modelled on the Pantheon, on the edge of the Tidal Basin.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          'A neoclassical rotunda modelled on the Pantheon in Rome, honoring Thomas Jefferson — author of the Declaration of Independence and third U.S. President. The 19-foot bronze statue inside weighs five tons and gazes north toward the White House.',
        voice:
          "This is the Jefferson Memorial, a neoclassical rotunda inspired by the Pantheon in Rome. Inside is a 19-foot bronze Jefferson, facing north toward the White House. The setting matters too: water, sky, columns, and a very deliberate sense of calm.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'FDR dedicated it on Jefferson\'s 200th birthday — April 13, 1943 — in the middle of World War II. The original bronze statue was unavailable due to wartime metal shortages, so it stood in plaster for the first four years. The Tidal Basin had to be reshaped to make room for it.',
        voice:
          "FDR dedicated this memorial on Jefferson's 200th birthday, right in the middle of World War II. Because metal was needed for the war, the first statue here was plaster. For four years, Jefferson stood in temporary form before the bronze arrived.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'The cherry trees around the Tidal Basin were a gift from Tokyo in 1912. Building the memorial required moving 171 of them. Excerpts of Jefferson\'s writings cover the interior walls — including passages on freedom of religion that quietly contradicted the era\'s segregation. The dome is hollow; sounds inside echo.',
        voice:
          "The cherry trees around the Tidal Basin were a gift from Tokyo in 1912. Building this memorial meant moving 171 of those trees, which was not exactly a quiet decision. Inside, the dome carries sound in a way that makes even small voices feel ceremonial.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          "Free, open 24 hours. Cherry-blossom peak bloom — usually late March to early April — is when the memorial is at its most photographed. The walk from the Lincoln Memorial across the Tidal Basin takes about 25 minutes and passes the FDR and MLK Memorials.",
        voice:
          "Come here during peak bloom if you can, usually late March into early April. It gets crowded, yes, but the view is famous for a reason. From Lincoln, the walk around the Tidal Basin takes about 25 minutes and gives you a greatest-hits route.",
      },
    ],
  },
  'national-mall': {
    id: 'national-mall',
    name: 'The National Mall',
    intro: "You're standing on the National Mall — a 2-mile lawn lined with monuments and free Smithsonian museums.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          'A 2-mile-long landscaped park running from the Lincoln Memorial in the west to the U.S. Capitol in the east. Over 24 million visitors come every year. The Smithsonian museums along its edges hold more than 155 million artifacts — and entrance to every one of them is free.',
        voice:
          "You're looking at America's front yard: a two-mile park from the Lincoln Memorial to the Capitol. More than 24 million people come through every year. And those Smithsonian museums along the edges? Free to enter, holding more than 155 million objects.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          "Pierre L'Enfant's 1791 plan for the capital city included a 'grand avenue' here, but it took 100 years to materialise. The Mall was a swamp, a railroad yard, and a Civil War cattle pen before the McMillan Plan of 1902 redesigned it into the open green axis we know today.",
        voice:
          "The Mall did not always look this graceful. For a long stretch it was swampy, messy, and even used as a Civil War cattle pen. The McMillan Plan of 1902 cleaned up the vision and turned it into the long civic axis you see now.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "The Mall is one of the most-protested spaces on Earth — it has hosted the 1963 March on Washington, the 1995 Million Man March, women's suffrage marches, anti-war marches, and inaugurations of every president since FDR. The lawn is built to drain and recover quickly.",
        voice:
          "This is one of the most important public gathering spaces on Earth. Marches, inaugurations, protests, celebrations: the Mall has seen all of it. Even the lawn is engineered for huge crowds, then drainage and recovery afterward.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Most museums open at 10am and close at 5:30pm — and they are all free. The Air and Space Museum and the Natural History Museum are the most crowded; aim for first thing in the morning. The Mall is best walked early or at sunset when the light catches the monuments.',
        voice:
          "Guide tip: start early. Air and Space and Natural History get busy fast, and the museums are free, so there is no ticket friction to slow the crowds down. For walking, sunrise and sunset are the magic hours.",
      },
    ],
  },
  'smithsonian-castle': {
    id: 'smithsonian-castle',
    name: 'The Smithsonian Castle',
    intro: "You've found the Castle — the red-sandstone home of the Smithsonian Institution.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          'The original Smithsonian Institution building, completed in 1855. Designed in a Norman Revival style with red Seneca sandstone — striking against the white marble around it. It is now the Smithsonian visitor center and the burial place of the institution\'s founder.',
        voice:
          "This red sandstone building is the Smithsonian Castle, completed in 1855. It is the original Smithsonian building, and it still stands out beautifully against all the white marble and pale stone nearby.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'The Smithsonian was funded by an Englishman named James Smithson, who had never set foot in America. He left his fortune in 1829 — about 500,000 dollars in gold sovereigns — to the United States, "to found at Washington, under the name of the Smithsonian Institution, an establishment for the increase and diffusion of knowledge."',
        voice:
          "The origin story is wonderfully strange. The Smithsonian was funded by James Smithson, an Englishman who never visited America. In 1829, he left his fortune to the United States to create an institution for the increase and diffusion of knowledge.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "Smithson's crypt is inside the Castle, on the north entrance side. Alexander Graham Bell personally retrieved his remains from Italy in 1904 and brought them back to be re-interred here. Smithson himself never explained, in writing, why he left his fortune to a country he had never visited.",
        voice:
          "Smithson's crypt is inside the Castle. Alexander Graham Bell personally helped bring his remains from Italy to Washington in 1904. And the big mystery remains: no one knows exactly why Smithson gave his fortune to a country he had never seen.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Start your day at the Castle — there is a free orientation desk, a small museum about the Smithsonian itself, and the Haupt Garden is gorgeous in spring. Pick up a map of all 17 free Smithsonian museums; even seasoned DC visitors miss the African Art Museum next door.',
        voice:
          "Start your Smithsonian day here. Pick up a museum map, then build your route from the Castle outward. Even people who know DC sometimes miss the African Art Museum next door, which is a very good little detour.",
      },
    ],
  },
  'supreme-court': {
    id: 'supreme-court',
    name: 'The Supreme Court',
    intro: "You've reached the Supreme Court — the highest court in the United States.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          'A Corinthian-columned marble temple, completed in 1935 — surprisingly late considering the Court was established in 1789. "Equal Justice Under Law" is carved over the entrance. Inside, nine justices interpret the U.S. Constitution.',
        voice:
          "This is the Supreme Court, and yes, it looks ancient on purpose. The building was actually completed in 1935, surprisingly late for a Court created in 1789. Over the entrance are the words Equal Justice Under Law.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'For the first 146 years of its existence, the Supreme Court had no building of its own. It met in a basement room of the Capitol, then in a borrowed Senate chamber. Chief Justice William Howard Taft — the only person to be both President and Chief Justice — pushed for a dedicated building. He died before it was finished.',
        voice:
          "For its first 146 years, the Supreme Court did not have its own building. It met in the Capitol basement, then in a borrowed Senate chamber. William Howard Taft, the only person to be both President and Chief Justice, pushed for this building. He died before it was finished.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'The building has its own basketball court — on the top floor, directly above the courtroom. Justices and law clerks have called it "the highest court in the land." The court is closed to spectators when in session, but oral arguments are open to the public on a first-come, first-served basis.',
        voice:
          "Here is the best courthouse trivia in town: there is a basketball court upstairs, directly above the courtroom. People call it the highest court in the land. It is a joke, but honestly, it is a pretty perfect one.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'When court is not in session (mid-October to late June), free lectures run on the hour in the courtroom. When arguments are open, the line forms outside as early as 6am for high-profile cases. Walking around the building is free and the view down First Street to the Capitol is one of the best in DC.',
        voice:
          "When the Court is not in session, free courtroom lectures often run on the hour. And before you leave, turn back toward the Capitol from the front steps. That view down First Street is one of the best composed views in DC.",
      },
    ],
  },
  'library-of-congress': {
    id: 'library-of-congress',
    name: 'Library of Congress',
    intro: "You've reached the Library of Congress — the largest library in human history.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          'The Thomas Jefferson Building, opened in 1897 — the most ornate of the Library\'s three buildings. The Library of Congress holds over 170 million items: books, maps, manuscripts, recordings, films. It adds about 12,000 items every working day.',
        voice:
          "This is the Thomas Jefferson Building of the Library of Congress, opened in 1897. It is not just a library; it is the largest library in human history. More than 170 million items, and about 12,000 more arrive on a typical working day.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'The original Library was burned by British troops in 1814 along with the Capitol. Thomas Jefferson sold his entire personal library to Congress to restart it — about 6,500 books, the largest private collection in America at the time. The current Jefferson Building is named for him.',
        voice:
          "The first congressional library burned with the Capitol in 1814. Thomas Jefferson then sold Congress his personal collection, about 6,500 books, to restart it. That is why this building carries his name.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "The Library houses a Gutenberg Bible — one of only three perfect vellum copies in the world. The Main Reading Room's domed ceiling is 160 feet high. Anyone over 16 can get a free reader's card and request to view almost anything in the collection.",
        voice:
          "Inside is a Gutenberg Bible, one of only three perfect vellum copies in the world. And this is not just decoration. If you are over 16, you can get a free reader card and request to see materials from the collection.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Free, no ticket required. The Main Reading Room is the showpiece — usually viewable from an upper-floor overlook. Free guided tours run several times daily and take about an hour. The underground tunnel to the Capitol is sometimes accessible during guided tours.',
        voice:
          "It is free, and guided tours run several times a day. The Main Reading Room is the showpiece, usually seen from the overlook. If you love interiors, this may quietly become your favorite stop.",
      },
    ],
  },
  'arlington-cemetery': {
    id: 'arlington-cemetery',
    name: 'Arlington National Cemetery',
    intro: "You've crossed into Arlington — a military cemetery on what was once Robert E. Lee's estate.",
    cards: [
      {
        kind: 'pitch',
        title: 'What you are looking at',
        display:
          'A 639-acre military cemetery established during the Civil War. Over 400,000 service members and their families are buried here, alongside two U.S. Presidents (Kennedy and Taft) and Justices, astronauts, and Medal of Honor recipients. About 27 burials happen here every weekday.',
        voice:
          "Across the river is Arlington National Cemetery, 639 acres of military cemetery established during the Civil War. More than 400,000 service members and family members are buried here. Around 27 burials happen on a typical weekday.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'This was the estate of Robert E. Lee — confiscated by the Union during the Civil War. Union Quartermaster Montgomery Meigs deliberately buried Union dead in Mary Lee\'s rose garden to ensure the Lees could never return. It became an official military cemetery in 1864. The Lee family later sued and won damages, but never reclaimed the land.',
        voice:
          "This land was once Robert E. Lee's estate. During the Civil War, the Union confiscated it, and Union dead were deliberately buried near the house so the family could never really return. It became an official military cemetery in 1864.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'The Tomb of the Unknown Soldier has been guarded 24 hours a day, every day, by a sentinel from the 3rd U.S. Infantry Regiment since 1937. The guards walk 21 steps, pause 21 seconds, turn, pause 21 seconds, walk back — 21 being the highest military honor. The Changing of the Guard happens every 30 minutes in summer.',
        voice:
          "The Tomb of the Unknown Soldier has been guarded 24 hours a day since 1937. The sentinel walks 21 steps, pauses 21 seconds, turns, and repeats. Twenty-one is the number of the highest military honor.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          "Free entry. The Kennedy gravesite with the eternal flame, the Tomb of the Unknown Soldier, and Arlington House (Lee's home) are the three most-visited spots — all walkable from the visitor center in about an hour. The cemetery is sacred ground; visitors are asked to be quiet and respectful.",
        voice:
          "Give Arlington time and quiet. The Kennedy gravesite, the Tomb of the Unknown Soldier, and Arlington House are the main stops, all reachable from the visitor center. This is sacred ground, so the best pace here is slow.",
      },
    ],
  },
}

export function getTour(landmarkId: string): Tour | undefined {
  return TOURS[landmarkId]
}
