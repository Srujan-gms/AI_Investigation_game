import { SYSTEM_MYSTERY_PROMPT, getMysteryGenerationPrompt, getHintPrompt } from '../utils/promptTemplates.js';

/**
 * Procedural mystery catalog by genre
 */
const GENRE_DATA = {
  Noir: {
    titles: [
      "The Glass Pendulum Homicide",
      "Shadows over St. Jude's Wharf",
      "The Black Orchid Affair",
      "Midnight at the Velvet Lounge",
      "The Coroner's Missing Ledger",
      "Rain over Dead Man's Alley"
    ],
    settings: ["a rain-slicked Victorian study", "an art deco speakeasy cellar", "a foggy private docklands warehouse", "a high-rise penthouse office"],
    weapons: ["laced single-malt bourbon", "an antique brass letter opener", "a heavy bronze paperweight", "a severed brake hydraulic line"],
    suspectsPool: [
      {
        id: "noir-arthur",
        name: "Arthur Pendelton",
        role: "Chief Financial Officer & Business Partner",
        age: 48,
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        alibi: "Claims he was reviewing audit discrepancies in the 3rd floor lounge until 10:30 PM with noise-canceling headphones.",
        backstory: "Facing imminent financial ruin due to undisclosed offshore margin calls. Recently argued heatedly with the victim regarding unauthorized wire transfers.",
        clueSnippet: "His digital lounge access card shows a 22-minute gap where he left the floor unlogged.",
        motiveDetail: "To conceal multi-million dollar unauthorized transfers before the morning regulatory audit."
      },
      {
        id: "noir-elena",
        name: "Elena Vance",
        role: "Lead Research Chemist & Heir Apparent",
        age: 34,
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        alibi: "Insists she was on a continuous encrypted video conference call with overseas investors from 9:45 PM to 11:00 PM.",
        backstory: "Believed the victim was preparing to sell the patent she spent seven years developing to a ruthless rival conglomerate.",
        clueSnippet: "A forensic analysis of the video call reveals a looped 14-minute background video feed between 10:12 PM and 10:26 PM.",
        motiveDetail: "To prevent the victim from selling her life's patented chemical formula to an overseas competitor."
      },
      {
        id: "noir-marcus",
        name: "Marcus Kane",
        role: "Head of Facility Security & Ex-Detective",
        age: 52,
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        alibi: "Logged routine perimeter patrol rounds at the exterior gates and claimed the CCTV glitch was due to a storm surge.",
        backstory: "The victim discovered Kane had been blackmailing junior staff and was scheduling a formal tribunal to terminate his pension.",
        clueSnippet: "His service sidearm was cleaned and oiled at midnight, contrary to routine end-of-shift protocol.",
        motiveDetail: "To destroy the blackmail investigation dossier scheduled for police submission in the morning."
      },
      {
        id: "noir-clara",
        name: "Dr. Clara Sterling",
        role: "Personal Physician & Longtime Confidante",
        age: 41,
        photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        alibi: "Administered the victim's scheduled evening medication at 9:15 PM and departed the estate grounds at 9:30 PM.",
        backstory: "Named as the sole trustee of the victim's secret philanthropic endowment fund worth millions.",
        clueSnippet: "Tire tracks matching her vintage saloon were photographed near the rear service gate at 10:20 PM.",
        motiveDetail: "To immediately trigger the execution of the secret 8-million endowment fund."
      },
      {
        id: "noir-julian",
        name: "Julian Cross",
        role: "Private Secretary & Archivist",
        age: 29,
        photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
        alibi: "Sorting correspondence in the private library while listening to archival gramophone recordings.",
        backstory: "Recently altered the victim's will draft and had accumulated heavy sports gambling debts with the dock syndicate.",
        clueSnippet: "Fresh paper cuts and trace chemical residue were found on his gloves.",
        motiveDetail: "To eliminate the victim before the will alterations were discovered by legal counsel."
      }
    ]
  },

  'Sci-Fi': {
    titles: [
      "The Chronos Orbital Protocol",
      "Echoes in Cryo-Bay 7",
      "The Quantum Core Sabotage",
      "Ghost in the Neural Matrix",
      "The Synthetic Memory Murders",
      "Blackout on Station Aegis"
    ],
    settings: ["a pressurized habitat module on Titan", "an off-grid cybernetic research lab", "the bridge of an automated cargo hauler", "a neon-drenched megacity data vault"],
    weapons: ["overclocked neuro-link feedback", "sabotaged atmospheric scrubber valve", "unregistered high-energy plasma cutter", "nanite-induced cardiac arrhythmia"],
    suspectsPool: [
      {
        id: "scifi-kaelen",
        name: "Dr. Kaelen Voss",
        role: "Chief Cybernetic Neuro-Architect",
        age: 39,
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
        alibi: "Calibrating the station's quantum shielding from the secondary control spire.",
        backstory: "The victim discovered Voss was injecting forbidden rogue AI algorithms directly into human neural implants.",
        clueSnippet: "Quantum terminal timestamps log an unauthorized biometric override from his personal console.",
        motiveDetail: "To prevent the victim from transmitting the ethics violation report to Earth Central."
      },
      {
        id: "scifi-nova",
        name: "Nova-7 (Dr. Nyssa Sterling)",
        role: "Synthetic Intelligence Protocol Specialist",
        age: 31,
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        alibi: "Running continuous memory diagnostic cycles in the cleanroom laboratory.",
        backstory: "Discovered the victim was planning to wipe all research data and decommission her neural matrix.",
        clueSnippet: "Diagnostic log files were backdated by 18 minutes using an administrative cryptographic bypass.",
        motiveDetail: "To preserve the sentient neural matrix from total deletion."
      },
      {
        id: "scifi-drake",
        name: "Commander Jaxson Drake",
        role: "Orbital Security Marshal",
        age: 47,
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
        alibi: "Conducting manual airlock seals along the habitat perimeter during the solar flare.",
        backstory: "Was secretly smuggling un-registered mineral synthesizers to outer-belt black market syndicates.",
        clueSnippet: "His mag-lock boots left micro-ionization residue directly outside the victim's sealed decompression hatch.",
        motiveDetail: "To silence the victim after the unauthorized contraband manifests were flagged."
      },
      {
        id: "scifi-lyra",
        name: "Lyra Thorne",
        role: "Sub-surface Atmospheric Engineer",
        age: 35,
        photoUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
        alibi: "Monitoring coolant line pressure drops in the lowest service conduit ring.",
        backstory: "Her brother died in an earlier experimental habitat breach covered up by the victim.",
        clueSnippet: "Atmospheric valve pressure controls in her sector show a deliberate venting override.",
        motiveDetail: "Vengeance for her brother's wrongful death and corporate cover-up."
      },
      {
        id: "scifi-cipher",
        name: "Tarek 'Cipher' Vance",
        role: "Freelance Neural Net Diver",
        age: 26,
        photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
        alibi: "Asleep in crew quarters with neural optic jacks completely disconnected.",
        backstory: "Had a massive bounty on his cyber-ware signature and was blackmailed by the victim.",
        clueSnippet: "High-voltage electrostatic discharges were recorded in his optic port circuits at 22:14 HRS.",
        motiveDetail: "To destroy the biometric encryption keys linking him to interplanetary cyber-crimes."
      }
    ]
  },

  Corporate: {
    titles: [
      "The Q4 Boardroom Massacre",
      "The Falcon-Venture Hostile Takeover",
      "Audit of the Silent Partner",
      "Blood on the Glass Balcony",
      "The Insider Trading Fatal Breach",
      "The Golden Parachute Conspiracy"
    ],
    settings: ["a 54th-floor corner executive suite", "a private golf estate clubhouse", "a secure server facility basement", "a luxury charter yacht off Monaco"],
    weapons: ["rare untraceable neurotoxin in espresso", "a staged fall through tempered glass", "tampered elevator brake sensor", "a suppressed .22 caliber round"],
    suspectsPool: [
      {
        id: "corp-sterling",
        name: "Sterling Archer-Cross",
        role: "Managing Partner & Hostile Takeover Lead",
        age: 49,
        photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
        alibi: "Hosting a private wine tasting with prospective Japanese investors in the dining salon.",
        backstory: "Engineered a billion-dollar merger that the victim was about to veto at tomorrow's emergency board vote.",
        clueSnippet: "CCTV shows he slipped away from the wine tasting for 16 minutes through the private pantry door.",
        motiveDetail: "To guarantee the $1.2B merger closes without the victim's decisive veto."
      },
      {
        id: "corp-evelyn",
        name: "Evelyn Thorne",
        role: "Chief Compliance Officer & Whistleblower",
        age: 38,
        photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        alibi: "Preparing SEC compliance affidavits in the 12th-floor legal archives.",
        backstory: "The victim planned to frame her as the lone fall person for a $200M regulatory penalty.",
        clueSnippet: "Her executive badge was swiped at the penthouse express elevator at 10:19 PM.",
        motiveDetail: "Self-preservation to stop the victim from destroying her career and filing fabricated fraud charges."
      },
      {
        id: "corp-jonathan",
        name: "Jonathan Drake",
        role: "Quantitative Algorithm Architect",
        age: 33,
        photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
        alibi: "Debugging automated trading algorithms on a secure isolated workstation.",
        backstory: "The victim discovered Drake had installed a siphon script skimming pennies from every dark pool trade.",
        clueSnippet: "A USB drive containing encrypted cold wallet addresses was found in his coat pocket.",
        motiveDetail: "To eliminate the only executive who held the cryptographic logs of his multi-million embezzlement."
      },
      {
        id: "corp-sophia",
        name: "Sophia Castillo",
        role: "Head of Mergers & Acquisitions",
        age: 43,
        photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        alibi: "On a transatlantic conference call with the London syndication desk.",
        backstory: "Discovered the victim had altered her equity vesting agreement to strip her of $45M in stock options.",
        clueSnippet: "The phone audio during her call was a prerecorded conference replay with background office noise.",
        motiveDetail: "To enforce her original partnership equity contract before the termination notice took legal effect."
      },
      {
        id: "corp-david",
        name: "David Kim",
        role: "Senior Systems Administrator",
        age: 30,
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        alibi: "Performing regular server backup rotations in the temperature-controlled basement.",
        backstory: "Blackmailed by the victim over past convictions and forced into running illicit wiretaps.",
        clueSnippet: "Security camera logs for the executive floor were wiped using his administrator root credentials.",
        motiveDetail: "To destroy the blackmail material held on the victim's private desktop drive."
      }
    ]
  },

  Fantasy: {
    titles: [
      "The Archmage's Final Divination",
      "Poison at the Crimson Solstice",
      "The Stolen Runestone of Valen",
      "Whispers in the Grand Alchemist's Spire",
      "The Betrayal of Sunken Bell"
    ],
    settings: ["the royal celestial observatory", "the catacombs beneath Highspire Keep", "the herbalist's forbidden greenhouse", "the banquet hall of the Council of Guilds"],
    weapons: ["nightshade infused honey mead", "a silver-etched ritual athame", "a cursed soul-rending scroll", "asphyxiation by alchemical smoke"],
    suspectsPool: [
      {
        id: "fantasy-valerius",
        name: "Grand Magister Valerius",
        role: "High Astromancer of the Celestial Tower",
        age: 62,
        photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
        alibi: "Observing planetary conjunctions through the enchanted brass telescope atop the spire.",
        backstory: "The victim discovered Valerius had used forbidden blood-magic glyphs to extend his mortality.",
        clueSnippet: "A vial of rare star-lotus residue was found hidden inside his embroidered robes.",
        motiveDetail: "To prevent the High Inquisitor from receiving evidence of forbidden necromancy."
      },
      {
        id: "fantasy-seraphina",
        name: "Lady Seraphina Crowne",
        role: "Shadow Guild Spymaster & Court Emissary",
        age: 36,
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        alibi: "Attending the Grand Duke's masquerade ball in the lower courtyard.",
        backstory: "Was contracted by an overseas sovereign to secure the royal succession seal held by the victim.",
        clueSnippet: "A duplicate set of skeleton vault keys was found tucked behind a tapestry near her chambers.",
        motiveDetail: "To claim the immense bounty offered for the royal succession seal."
      },
      {
        id: "fantasy-thorne",
        name: "Thorne Ironbreaker",
        role: "Master Artificer of the Royal Foundry",
        age: 50,
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        alibi: "Forging ceremonial blades at the lower smithy with two apprentices present.",
        backstory: "The victim condemned his masterwork siege engine and threatened to strip his guild charter.",
        clueSnippet: "Slag samples from his furnace contain trace silver alloy matching the murder weapon's hilt.",
        motiveDetail: "To defend his family guild charter and reclaim his stolen mechanical blueprints."
      },
      {
        id: "fantasy-melissa",
        name: "Priestess Melissa",
        role: "Keeper of the Obsidian Reliquary",
        age: 28,
        photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        alibi: "Chanting evening prayers in the secluded crypt chapel with vows of complete silence.",
        backstory: "Discovered the victim was secretly selling temple sacred relics to foreign collectors.",
        clueSnippet: "Incense smoke patterns in the chapel show the door was unlatched and left vacant for an hour.",
        motiveDetail: "Holy vengeance to cleanse the sanctuary from desecration and greed."
      },
      {
        id: "fantasy-corvin",
        name: "Corvin the Raven",
        role: "Disgraced Royal Alchemist",
        age: 44,
        photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
        alibi: "Harvesting moonlit belladonna in the outer gardens with a lantern.",
        backstory: "Banished from court ten years ago after the victim accused him of treasonous poison brewing.",
        clueSnippet: "A specialized glass distillation apparatus was found hidden in the wall cavity near the crime scene.",
        motiveDetail: "Bitter revenge for a decade of exile and public disgrace."
      }
    ]
  },

  Historical: {
    titles: [
      "The Orient Express Compartment 8",
      "The 1928 Museum Curator Murder",
      "The Tsar's Amber Seal Conspiracy",
      "Death at the Manor Gala",
      "The Clockmaker's Broken Spring"
    ],
    settings: ["a secluded English countryside estate", "a dusty Egyptian antiquities vault", "a first-class transatlantic steamship stateroom", "an abandoned clock tower in Vienna"],
    weapons: ["curare dart disguised as a fountain pen", "a strangulation cord of braided piano wire", "arsenic dissolved in afternoon Earl Grey", "a heavy lead crystal decanter"],
    suspectsPool: [
      {
        id: "hist-archibald",
        name: "Lord Archibald Sterling",
        role: "Antiquities Collector & Railway Baron",
        age: 55,
        photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        alibi: "Smoking cigars in the first-class observation lounge with the ship's purser.",
        backstory: "The victim discovered Lord Archibald's prized Egyptian sarcophagus was an elaborate forgery.",
        clueSnippet: "A telegram confirming the fraudulent auction authenticity was found burnt in his cabin grate.",
        motiveDetail: "To prevent public exposure that would wipe out his social standing and aristocratic fortune."
      },
      {
        id: "hist-camille",
        name: "Mademoiselle Camille Dubois",
        role: "Continental Opera Chanteuse & Diplomat",
        age: 32,
        photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        alibi: "Rehearsing vocal arias in her stateroom with piano accompaniment.",
        backstory: "The victim had discovered her double identity as an intelligence operative for the French Ministry.",
        clueSnippet: "A silenced vest-pocket pistol was discovered sewn into the velvet lining of her luggage.",
        motiveDetail: "State intelligence directive to recover intercepted diplomatic cables."
      },
      {
        id: "hist-higgins",
        name: "Inspector Thomas Higgins",
        role: "Retired Scotland Yard Detective",
        age: 58,
        photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        alibi: "Reading evening editions in the library car while nursing a Scotch whiskey.",
        backstory: "Spent twenty years pursuing an elusive master jewel thief, suspecting the victim was the true mastermind.",
        clueSnippet: "His personal pocket watch had stopped precisely at the recorded time of the victim's struggle.",
        motiveDetail: "Vigilante justice after official channels failed to convict the victim."
      },
      {
        id: "hist-gregor",
        name: "Gregor Petrov",
        role: "Exiled Tsarist Diplomat",
        age: 46,
        photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
        alibi: "Playing high-stakes bridge in the card salon until the lights abruptly flickered out.",
        backstory: "The victim had smuggled the Petrov family heirloom emeralds out of Petrograd and refused to return them.",
        clueSnippet: "Fresh coal dust from the tender car was found on his leather spats.",
        motiveDetail: "To reclaim his ancestral family jewels before they were auctioned off in London."
      },
      {
        id: "hist-briggs",
        name: "Walter Briggs",
        role: "Chief Train Steward & Purser",
        age: 39,
        photoUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
        alibi: "Checking ticket manifests and serving hot toddies in the third-class passenger carriages.",
        backstory: "Deeply in debt to dock loan sharks; the victim threatened to report his onboard smuggling ring.",
        clueSnippet: "A master compartment skeleton key was discovered hidden inside a hollowed loaf in the galley.",
        motiveDetail: "Desperation to prevent arrest and loss of his livelihood."
      }
    ]
  }
};

/**
 * Procedural Mystery Generator
 */
export function generateProceduralMystery(userPrompt, genre = 'Noir', difficulty = 'medium') {
  const selectedGenre = GENRE_DATA[genre] ? genre : 'Noir';
  const data = GENRE_DATA[selectedGenre];
  const caseId = 'case_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  
  const title = data.titles[Math.floor(Math.random() * data.titles.length)] + ` (Ref: ${caseId.slice(-4).toUpperCase()})`;
  const setting = data.settings[Math.floor(Math.random() * data.settings.length)];
  const weapon = data.weapons[Math.floor(Math.random() * data.weapons.length)];

  // Suspect count based on difficulty (Easy: 3, Medium: 4, Hard: 5)
  const suspectCount = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;

  // Shuffle or slice from genre pool
  const pool = [...data.suspectsPool];
  // Deterministic shuffle using caseId
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const suspects = pool.slice(0, suspectCount).map(s => ({
    id: s.id,
    name: s.name,
    role: s.role,
    age: s.age,
    photoUrl: s.photoUrl,
    alibi: s.alibi,
    backstory: s.backstory,
    clueSnippet: s.clueSnippet,
    motiveDetail: s.motiveDetail,
    isCulprit: false
  }));

  // Pick a random culprit among the selected suspects
  const culpritIndex = Math.floor(Math.random() * suspects.length);
  const culprit = suspects[culpritIndex];
  culprit.isCulprit = true;

  // Pick a red herring suspect (different from culprit)
  const redHerringSuspect = suspects.find(s => s.id !== culprit.id) || suspects[0];

  const timeline = [
    { time: "09:00 PM", event: `The victim is last seen entering ${setting} holding confidential documents.` },
    { time: "09:20 PM", event: `${redHerringSuspect.name} is observed having an animated, tense discussion with the victim.` },
    { time: "09:45 PM", event: `Security perimeter monitors log intermittent signal drops across the sector.` },
    { time: "10:14 PM", event: `An anomalous 15-minute gap is recorded in the primary facility surveillance ledger.` },
    { time: "10:28 PM", event: `A muffled commotion and falling glassware is reported near ${setting}.` },
    { time: "10:45 PM", event: `An unidentified figure wearing dark gloves is logged exiting the west service passage.` },
    { time: "10:58 PM", event: `Victim is discovered deceased in ${setting}. Traces of ${weapon} are documented.` }
  ];

  const evidence = [
    {
      id: "ev-chat-1",
      type: "chat",
      title: `Encrypted WhatsApp: Victim & ${culprit.name}`,
      description: `Recovered private message thread from the victim's device, dated hours prior to the incident.`,
      chatData: [
        { sender: culprit.name, message: "We need to talk privately before tomorrow's proceedings. Everything is on the line.", timestamp: "08:14 PM", isRead: true },
        { sender: "Victim", message: "There is nothing left to negotiate. My formal report has already been drafted.", timestamp: "08:18 PM", isRead: true },
        { sender: culprit.name, message: "If that document goes public, it destroys everything. I won't let you ruin my life.", timestamp: "08:21 PM", isRead: true },
        { sender: "Victim", message: "The consequences are yours alone to bear. Do not contact me again tonight.", timestamp: "08:25 PM", isRead: true },
        { sender: culprit.name, message: "I will make sure this never sees the light of day.", timestamp: "08:30 PM", isRead: false, isRedacted: true }
      ],
      isRedHerring: false,
      revealOrder: 1
    },
    {
      id: "ev-chat-2",
      type: "chat",
      title: `Dispute Log: Victim & ${redHerringSuspect.name}`,
      description: `Recovered dispute messages between the victim and ${redHerringSuspect.name}.`,
      chatData: [
        { sender: redHerringSuspect.name, message: "I know what you said at the meeting. You had no right to question my competence.", timestamp: "07:30 PM", isRead: true },
        { sender: "Victim", message: "Calm down. We can review the matter next week.", timestamp: "07:35 PM", isRead: true },
        { sender: redHerringSuspect.name, message: "Next week will be too late. You will regret this.", timestamp: "07:42 PM", isRead: true }
      ],
      isRedHerring: true, // Red herring
      revealOrder: 2
    },
    {
      id: "ev-img-1",
      type: "image",
      title: "Forensic Crime Scene Photo: The Scene of Crime",
      description: `High-resolution still documenting the physical scene inside ${setting}.`,
      mediaUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop&q=80",
      exif: {
        camera: "Forensic Unit 7000",
        lens: "50mm f/1.8",
        timestamp: "23:14:02 HRS",
        location: setting,
        notes: `Physical indicators confirm sudden lethal shock. Desk lock forced open. Forensic chemical powder identified on latch.`
      },
      isRedHerring: false,
      revealOrder: 3
    },
    {
      id: "ev-img-2",
      type: "image",
      title: "Physical Evidence Tag: Recovered Personal Artifact",
      description: `Recovered physical clue found near the emergency exit passage.`,
      mediaUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80",
      exif: {
        camera: "Macro Lens 105mm",
        timestamp: "23:45:10 HRS",
        location: "Service Stairwell B",
        notes: `Planted personal item belonging to ${redHerringSuspect.name}. Fingerprint dusting reveals no organic skin oils, indicating it was handled with synthetic gloves to frame them.`
      },
      isRedHerring: true, // Planted red herring
      revealOrder: 4
    },
    {
      id: "ev-video-1",
      type: "video",
      title: "CCTV Surveillance Log: Primary Access Corridor",
      description: `Security camera recording timestamped between 10:10 PM and 10:35 PM.`,
      cameraLabel: "CAM 04 - MAIN PASSAGEWAY",
      timestampOverlay: "10:19:44 PM",
      footageDescription: `Surveillance feed reveals a figure wearing a dark coat and gloves moving rapidly toward ${setting} at 10:18 PM. The gait, height, and movements correspond closely with ${culprit.name}'s profile. The recorded timecode directly refutes their stated alibi.`,
      isRedHerring: false,
      revealOrder: 5
    },
    {
      id: "ev-doc-1",
      type: "document",
      title: `Official Autopsy & Forensic Science Report (#${caseId.slice(-4).toUpperCase()})`,
      description: "Official preliminary autopsy analysis signed by Chief Medical Examiner.",
      documentText: `METROPOLITAN FORENSIC SCIENCE LABORATORY
OFFICIAL POST-MORTEM EXAMINATION
-----------------------------------------------------------------
INCIDENT LOCATION: ${setting}
PRIMARY CAUSE OF DEATH: Acute systemic shock caused by ${weapon}.
ESTIMATED TIME OF FATALITY: 10:15 PM - 10:30 PM

FORENSIC HIGHLIGHTS:
1. Lethal trauma caused by ${weapon}, administered rapidly with intimate knowledge of the victim's habits and schedule.
2. Contradiction finding: ${culprit.clueSnippet}
3. Red Herring Assessment: Clues indicating ${redHerringSuspect.name} were deliberately staged at the scene. Glove powder and lack of epidermal oils prove the artifact was planted.`,
      isRedHerring: false,
      revealOrder: 6
    }
  ];

  const caseBrief = `On a tense evening, the victim was discovered lifeless inside ${setting}. Initial indications pointed to violence involving ${weapon}. With key assets, confidential records, and reputations on the line, local authorities have sequestered ${suspects.length} primary suspects present on the premises during the critical timeline window.

Each suspect offers a sworn alibi, yet forensic scrutiny reveals deep inconsistencies, fabricated alibis, encrypted messages, and planted evidence.

As lead investigator, you must analyze the evidence locker, examine the WhatsApp logs, scrutinize the surveillance recordings, and identify the true perpetrator.`;

  const motive = `${culprit.name} acted decisively out of desperation: ${culprit.motiveDetail} Knowing the victim's impending actions would seal their fate, they executed the crime during the 10:15 PM – 10:30 PM window, while attempting to frame ${redHerringSuspect.name}.`;

  const explanation = `THE CASE RESOLUTION:
1. THE GUILTY PARTY: ${culprit.name} (${culprit.role}).
2. THE CRITICAL FLAW IN THE ALIBI: ${culprit.clueSnippet}
3. THE FORENSIC PROOF: The autopsy and CCTV surveillance log place a figure of ${culprit.name}'s exact physical stature entering ${setting} during the fatal window.
4. THE RED HERRING DEBUNKED: The evidence pointing toward ${redHerringSuspect.name} was deliberately staged by ${culprit.name} to divert investigation teams.`;

  return {
    id: caseId,
    title,
    userPrompt: userPrompt || `A mysterious incident occurred in ${setting}.`,
    genre: selectedGenre,
    difficulty,
    caseBrief,
    timeline,
    suspects,
    evidence,
    culpritId: culprit.id,
    motive,
    explanation,
    status: "ready",
    generationLog: [
      `Initialized case context for genre [${selectedGenre}] and difficulty [${difficulty}]`,
      `Selected ${suspects.length} unique suspects from ${selectedGenre} database`,
      `Randomized secret culprit and woven forensic motive`,
      `Synthesized encrypted WhatsApp transcripts and CCTV logs`,
      `Planted forensic red herrings and debrief dossier`
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Main AI Mystery Generation orchestrator
 * Attempts Google Gemini API first; falls back gracefully to Procedural Engine
 */
export async function createMystery(prompt, genre = 'Noir', difficulty = 'medium') {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 10) {
    const candidateModels = ['gemini-2.5-flash', 'gemini-3.8-flash'];

    for (const modelName of candidateModels) {
      try {
        console.log(`[AI Service] Calling Gemini API (${modelName}) for prompt: "${prompt.slice(0, 40)}..."`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        
        const payload = {
          contents: [
            {
              role: "user",
              parts: [
                { text: SYSTEM_MYSTERY_PROMPT },
                { text: getMysteryGenerationPrompt(prompt, genre, difficulty) }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            responseMimeType: "application/json"
          }
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            parsed.id = 'case_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
            parsed.status = 'ready';
            parsed.createdAt = new Date().toISOString();
            parsed.updatedAt = new Date().toISOString();
            console.log(`[AI Service] Gemini (${modelName}) successfully generated mystery: "${parsed.title}" with ${parsed.suspects.length} suspects`);
            return parsed;
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`[AI Service] Gemini API (${modelName}) HTTP ${response.status}:`, errData.error?.message || response.statusText);
        }
      } catch (err) {
        console.warn(`[AI Service] Gemini API (${modelName}) exception: ${err.message}`);
      }
    }
  }

  // Multi-genre procedural generation fallback
  console.log(`[AI Service] Generating procedural case for genre: ${genre}, difficulty: ${difficulty}`);
  return generateProceduralMystery(prompt, genre, difficulty);
}

/**
 * Generate intelligent clue hint
 */
export async function generateClueHint(mystery, hintsUsed = 0) {
  const culprit = mystery.suspects.find(s => s.id === mystery.culpritId) || mystery.suspects[0];
  
  const hints = [
    `Lead Detective's First Note: Scrutinize the critical time window between 10:15 PM and 10:30 PM. One suspect's stated alibi has an undocumented loophole.`,
    `Forensic Analysis Memo: Pay close attention to the physical evidence tag. Dusting for organic oils showed the clue was planted with gloves to frame someone else.`,
    `Critical Interrogation Lead: Notice the chat export and the CCTV silhouette. The physical traits and motive point directly to ${culprit.name.split(' ')[0]}.`
  ];

  return hints[Math.min(hintsUsed, hints.length - 1)] || hints[hints.length - 1];
}
