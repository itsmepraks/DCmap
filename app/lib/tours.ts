'use client'

/**
 * Hand-written tour content for each DC landmark. Fact-checked, no LLM
 * hallucination. Each tour has 4 cards: a quick pitch, a piece of history,
 * a surprising detail, and a tip for being there.
 *
 * The 'voice' card text is what gets spoken via window.speechSynthesis —
 * shorter, more conversational, with periods so the TTS engine pauses
 * cleanly. The 'display' text is the longer card body shown on screen.
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
          "1600 Pennsylvania Avenue. The official residence of the President. Every U.S. President since John Adams in 1800 has lived here. Except George Washington, who never lived in the house bearing his name.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'James Hoban won a 1792 design contest with a building inspired by Leinster House in Dublin. It was burned by British troops in 1814 and rebuilt in the same Aquia Creek sandstone — the soot stains are why it was painted white. Theodore Roosevelt made the name "White House" official in 1901.',
        voice:
          "James Hoban won a design contest in 1792 with a building inspired by Leinster House in Dublin. The British burned it in 1814. It was rebuilt and painted white to hide the soot — that's how it got its name. Theodore Roosevelt made the name official in 1901.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'There is a fully equipped dental office, a chocolate shop, a bowling alley, and a movie theater inside. The annual electric bill is around four million dollars. The walls of the State Dining Room are still scorched from the 1814 fire, hidden behind paint.',
        voice:
          'There is a dental office, a chocolate shop, a bowling alley, and a movie theater inside. The annual electric bill is around four million dollars. The walls still bear scorch marks from the 1814 fire, hidden behind paint.',
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          "Public tours are free but require a request through your Member of Congress at least three weeks in advance. The best photo angle is from the Ellipse to the south — Lafayette Square to the north is blocked off after security upgrades. Look for the Truman Balcony, added in 1948 and controversial at the time.",
        voice:
          "Public tours are free but you request them through your member of Congress, three weeks in advance. The best photo angle is from the Ellipse to the south. Look for the Truman Balcony — added in 1948, controversial at the time.",
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
          "The Capitol, home to the House of Representatives and the Senate. The cast-iron dome rises 288 feet, topped by the Statue of Freedom — a 19-foot bronze figure that always faces east.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          "Construction started in 1793 with George Washington laying the cornerstone. British troops burned the building in 1814, leaving it gutted. The current dome wasn't built until the Civil War — Lincoln insisted construction continue as a symbol that the Union would survive. He was right.",
        voice:
          "Construction started in 1793. George Washington laid the cornerstone. British troops burned it in 1814. The dome you see now was built during the Civil War. Lincoln insisted construction continue as a symbol the Union would survive. He was right.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "The dome is not stone — it is 8.9 million pounds of cast iron, painted to look like the marble below it. The Rotunda's ceiling fresco, 'The Apotheosis of Washington,' was painted in 11 months by Constantino Brumidi while he hung 180 feet in the air on a swinging platform.",
        voice:
          "The dome is not stone. It is 8.9 million pounds of cast iron, painted to look like the marble below. The Rotunda's ceiling fresco was painted in 11 months by an Italian artist hanging 180 feet in the air on a swinging platform.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Free guided tours run six days a week and book up months ahead — reserve through the Capitol Visitor Center. Photography is allowed in the Rotunda but not in the chambers. If Congress is in session, you can sit in the gallery and watch debates live with a separate pass.',
        voice:
          'Free guided tours run six days a week and book up months ahead. If Congress is in session, you can sit in the gallery and watch debates live with a separate pass.',
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
          "A Greek temple with 36 columns — one for each state in the Union when Lincoln died. Inside, Daniel Chester French's 19-foot marble statue of Lincoln. He gazes east, down the Reflecting Pool, toward the Washington Monument.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'Dedicated in 1922, fifty-seven years after Lincoln\'s assassination. Lincoln\'s son Robert attended the ceremony. Booker T. Washington spoke. The audience was segregated. The memorial\'s history with the civil rights movement begins right there — and would return with Marian Anderson in 1939 and Dr. King in 1963.',
        voice:
          "Dedicated in 1922, fifty-seven years after Lincoln's assassination. The audience was segregated. The memorial would later host Marian Anderson's famous Easter Sunday concert in 1939, and Dr. King's 'I Have a Dream' speech in 1963.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'On the north wall is the Gettysburg Address, all 272 words. On the south wall is the Second Inaugural Address. There is a typo: the engraver carved an "E" instead of an "F" in "future" and tried to patch it — you can still see the correction. The hands of the statue are positioned to spell "A" and "L" in American Sign Language.',
        voice:
          "On the wall is the Gettysburg Address, all 272 words. There is a typo — the engraver carved an E instead of an F in 'future' and patched it. You can still see the correction. The statue's hands are said to spell A and L in sign language.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Open 24 hours, free, no tickets. It is at its most powerful at night when the chamber is lit and the crowds thin. Stand on the spot marked "I Have a Dream" on the steps — that is where Dr. King stood on August 28, 1963. The acoustics inside the chamber are unusually intimate; whispers carry.',
        voice:
          "Open 24 hours, free, no tickets. It is at its most powerful at night, when the chamber is lit and the crowds thin. Stand on the spot marked 'I Have a Dream' on the steps — that's where Dr. King stood in 1963.",
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
          "The world's tallest stone obelisk. 555 feet tall. Honors George Washington. When it was finished in 1884, it was the tallest structure on Earth — for five years, until the Eiffel Tower passed it.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'Construction began in 1848 and stopped in 1854 when funding ran out and the Civil War intervened. When work resumed in 1879, the original marble quarry had closed. You can see the seam clearly today — about a third of the way up, the marble shifts color where the second phase began.',
        voice:
          "Construction began in 1848 and stopped for 25 years during the Civil War. When work resumed, the original marble quarry had closed. About a third of the way up, you can see the seam where the marble changes colour.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "It is the world's tallest obelisk and the world's tallest free-standing stone structure. The cap is a 100-ounce solid aluminum pyramid — aluminum was a precious metal in 1884, more valuable than silver. There are 193 memorial stones donated by states, countries, and groups embedded in the interior walls.",
        voice:
          "The cap is a 100-ounce solid aluminum pyramid. In 1884, aluminum was a precious metal — more valuable than silver. There are 193 memorial stones embedded in the interior walls, donated by states, countries, and groups around the world.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'You can ride a 70-second elevator to the observation deck at 500 feet — free timed-entry tickets, often booked out the same day they release. The best photo of the monument is from the WWII Memorial side, at golden hour, with the reflecting pool in front. At night the marble is lit and looks otherworldly.',
        voice:
          'A 70-second elevator takes you to the observation deck at 500 feet. Tickets are free but timed — they often book out the same day. At night the marble is floodlit and looks otherworldly.',
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
          "A neoclassical rotunda modelled on the Pantheon in Rome. It honors Thomas Jefferson — author of the Declaration of Independence and third President. The bronze statue inside is 19 feet tall and gazes north toward the White House.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'FDR dedicated it on Jefferson\'s 200th birthday — April 13, 1943 — in the middle of World War II. The original bronze statue was unavailable due to wartime metal shortages, so it stood in plaster for the first four years. The Tidal Basin had to be reshaped to make room for it.',
        voice:
          "FDR dedicated it on Jefferson's 200th birthday, in the middle of World War II. The original bronze statue was unavailable due to wartime metal shortages — it stood as plaster for the first four years.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'The cherry trees around the Tidal Basin were a gift from Tokyo in 1912. Building the memorial required moving 171 of them. Excerpts of Jefferson\'s writings cover the interior walls — including passages on freedom of religion that quietly contradicted the era\'s segregation. The dome is hollow; sounds inside echo.',
        voice:
          "The cherry trees around the Tidal Basin were a gift from Tokyo in 1912. Building the memorial required moving 171 of them. Sounds inside the hollow dome echo and carry.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          "Free, open 24 hours. Cherry-blossom peak bloom — usually late March to early April — is when the memorial is at its most photographed. The walk from the Lincoln Memorial across the Tidal Basin takes about 25 minutes and passes the FDR and MLK Memorials.",
        voice:
          'Free, open 24 hours. Cherry blossom peak bloom in late March to early April is when this place is at its most photographed. The walk from the Lincoln Memorial across the Tidal Basin takes about 25 minutes.',
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
          "A 2-mile-long park from the Lincoln Memorial to the Capitol. Over 24 million people visit every year. The Smithsonian museums along the edges hold more than 155 million artifacts — and every one of them is free to enter.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          "Pierre L'Enfant's 1791 plan for the capital city included a 'grand avenue' here, but it took 100 years to materialise. The Mall was a swamp, a railroad yard, and a Civil War cattle pen before the McMillan Plan of 1902 redesigned it into the open green axis we know today.",
        voice:
          "It took 100 years for the Mall to look like this. Before 1902, it was a swamp, a railroad yard, and a Civil War cattle pen. The McMillan Plan reshaped it into the open green axis you see today.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "The Mall is one of the most-protested spaces on Earth — it has hosted the 1963 March on Washington, the 1995 Million Man March, women's suffrage marches, anti-war marches, and inaugurations of every president since FDR. The lawn is built to drain and recover quickly.",
        voice:
          "The Mall is one of the most-protested spaces on Earth. It has hosted the March on Washington, the Million Man March, women's suffrage marches, and the inauguration of every president since FDR. The lawn is built to drain and recover quickly.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Most museums open at 10am and close at 5:30pm — and they are all free. The Air and Space Museum and the Natural History Museum are the most crowded; aim for first thing in the morning. The Mall is best walked early or at sunset when the light catches the monuments.',
        voice:
          "All Smithsonian museums on the Mall are free. The Air and Space Museum and the Natural History Museum are the most crowded — go first thing in the morning. The Mall is best walked early or at sunset.",
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
          "The original Smithsonian Institution building, completed in 1855. Designed in red Seneca sandstone — striking against all the white marble around it. It is now the Smithsonian's visitor centre.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'The Smithsonian was funded by an Englishman named James Smithson, who had never set foot in America. He left his fortune in 1829 — about 500,000 dollars in gold sovereigns — to the United States, "to found at Washington, under the name of the Smithsonian Institution, an establishment for the increase and diffusion of knowledge."',
        voice:
          "The Smithsonian was funded by an Englishman named James Smithson who had never set foot in America. He left his fortune to the United States in 1829, 'to found at Washington an establishment for the increase and diffusion of knowledge.'",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "Smithson's crypt is inside the Castle, on the north entrance side. Alexander Graham Bell personally retrieved his remains from Italy in 1904 and brought them back to be re-interred here. Smithson himself never explained, in writing, why he left his fortune to a country he had never visited.",
        voice:
          "Smithson's crypt is inside the Castle. Alexander Graham Bell personally retrieved his remains from Italy in 1904 and brought them back here. To this day, no one knows why Smithson left his fortune to a country he had never visited.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Start your day at the Castle — there is a free orientation desk, a small museum about the Smithsonian itself, and the Haupt Garden is gorgeous in spring. Pick up a map of all 17 free Smithsonian museums; even seasoned DC visitors miss the African Art Museum next door.',
        voice:
          'Start your day at the Castle. Pick up a map of all 17 free Smithsonian museums. Even seasoned DC visitors miss the African Art Museum next door.',
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
          "A Corinthian-columned marble temple, completed in 1935 — surprisingly late considering the Court was established in 1789. 'Equal Justice Under Law' is carved over the entrance.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'For the first 146 years of its existence, the Supreme Court had no building of its own. It met in a basement room of the Capitol, then in a borrowed Senate chamber. Chief Justice William Howard Taft — the only person to be both President and Chief Justice — pushed for a dedicated building. He died before it was finished.',
        voice:
          "For its first 146 years, the Supreme Court had no building of its own. It met in a basement room of the Capitol, then in a borrowed Senate chamber. Chief Justice William Howard Taft pushed for a dedicated building. He died before it was finished.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'The building has its own basketball court — on the top floor, directly above the courtroom. Justices and law clerks have called it "the highest court in the land." The court is closed to spectators when in session, but oral arguments are open to the public on a first-come, first-served basis.',
        voice:
          "The building has its own basketball court on the top floor, directly above the courtroom. Justices and law clerks call it 'the highest court in the land.' Oral arguments are open to the public on a first-come, first-served basis.",
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'When court is not in session (mid-October to late June), free lectures run on the hour in the courtroom. When arguments are open, the line forms outside as early as 6am for high-profile cases. Walking around the building is free and the view down First Street to the Capitol is one of the best in DC.',
        voice:
          'When the court is not in session, free lectures run on the hour in the courtroom. The view down First Street toward the Capitol from the front steps is one of the best in DC.',
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
          "The Thomas Jefferson Building, opened in 1897. The Library of Congress holds over 170 million items — books, maps, manuscripts, recordings, films. It adds 12,000 new items every working day.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'The original Library was burned by British troops in 1814 along with the Capitol. Thomas Jefferson sold his entire personal library to Congress to restart it — about 6,500 books, the largest private collection in America at the time. The current Jefferson Building is named for him.',
        voice:
          "The original Library was burned by the British in 1814. Thomas Jefferson sold his entire personal collection — 6,500 books, the largest in America at the time — to Congress to restart it. The current building is named for him.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          "The Library houses a Gutenberg Bible — one of only three perfect vellum copies in the world. The Main Reading Room's domed ceiling is 160 feet high. Anyone over 16 can get a free reader's card and request to view almost anything in the collection.",
        voice:
          'The Library houses a Gutenberg Bible — one of only three perfect vellum copies in the world. Anyone over 16 can get a free reader card and request to view almost anything in the collection.',
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          'Free, no ticket required. The Main Reading Room is the showpiece — usually viewable from an upper-floor overlook. Free guided tours run several times daily and take about an hour. The underground tunnel to the Capitol is sometimes accessible during guided tours.',
        voice:
          "Free, no ticket required. Free guided tours run several times daily and take about an hour. The Main Reading Room — the showpiece — is usually viewable from an upper-floor overlook.",
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
          "A 639-acre military cemetery established during the Civil War. Over 400,000 service members and their families are buried here. About 27 burials happen here every weekday.",
      },
      {
        kind: 'history',
        title: 'How it came to be',
        display:
          'This was the estate of Robert E. Lee — confiscated by the Union during the Civil War. Union Quartermaster Montgomery Meigs deliberately buried Union dead in Mary Lee\'s rose garden to ensure the Lees could never return. It became an official military cemetery in 1864. The Lee family later sued and won damages, but never reclaimed the land.',
        voice:
          "This was Robert E. Lee's estate, confiscated by the Union in the Civil War. A Union officer deliberately buried Union dead in Mary Lee's rose garden to ensure they could never return. It became a military cemetery in 1864.",
      },
      {
        kind: 'surprise',
        title: 'You probably did not know',
        display:
          'The Tomb of the Unknown Soldier has been guarded 24 hours a day, every day, by a sentinel from the 3rd U.S. Infantry Regiment since 1937. The guards walk 21 steps, pause 21 seconds, turn, pause 21 seconds, walk back — 21 being the highest military honor. The Changing of the Guard happens every 30 minutes in summer.',
        voice:
          'The Tomb of the Unknown Soldier has been guarded 24 hours a day since 1937. The guards walk 21 steps, pause 21 seconds, then turn. 21 is the highest military honor. The Changing of the Guard happens every 30 minutes in summer.',
      },
      {
        kind: 'tip',
        title: 'If you were actually here',
        display:
          "Free entry. The Kennedy gravesite with the eternal flame, the Tomb of the Unknown Soldier, and Arlington House (Lee's home) are the three most-visited spots — all walkable from the visitor center in about an hour. The cemetery is sacred ground; visitors are asked to be quiet and respectful.",
        voice:
          'Free entry. The Kennedy gravesite, the Tomb of the Unknown Soldier, and Arlington House are the three most-visited spots. All walkable from the visitor centre in about an hour.',
      },
    ],
  },
}

export function getTour(landmarkId: string): Tour | undefined {
  return TOURS[landmarkId]
}
