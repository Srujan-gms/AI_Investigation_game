/**
 * AI Prompt Templates for Gemini Integration
 * As specified in spec.md Section 6.
 */

export const SYSTEM_MYSTERY_PROMPT = `You are a world-class mystery novelist and crime game designer.
Given a user scenario, genre, and difficulty, generate a complete investigation challenge in JSON format.
Rules:
- Create 3-5 unique suspects (Easy: 3, Medium: 4, Hard: 5) with distinct motives, alibis, roles, and backstories.
- Secretly choose one culprit. Hide their true guilt behind subtle, fair clues in the evidence.
- Generate at least 2 red herrings that make innocent suspects look suspicious.
- Include min 6 pieces of diverse evidence:
  * 2 WhatsApp-style chat conversations with subtle clues
  * 2 scene/forensic images with visual descriptions & EXIF metadata
  * 1 CCTV security camera footage clip log with timestamp overlays
  * 1 official typed document (autopsy, police memo, or contract)
- Construct a chronological timeline of events leading up to and following the crime.
- Output MUST be valid, raw JSON only. Do not enclose in markdown code blocks.`;

export const getMysteryGenerationPrompt = (userPrompt, genre = 'Noir', difficulty = 'medium') => {
  const suspectCount = difficulty === 'easy' ? 3 : difficulty === 'hard' ? 5 : 4;
  return `Generate a murder mystery case based on:
Scenario: "${userPrompt}"
Genre: ${genre}
Difficulty: ${difficulty} (Requires ${suspectCount} suspects, realistic clues, and clever red herrings)

Output Schema:
{
  "title": "string",
  "genre": "${genre}",
  "difficulty": "${difficulty}",
  "caseBrief": "Comprehensive narrative summary (2-3 paragraphs)",
  "culpritId": "suspect-id-string",
  "motive": "Clear, compelling motive for the crime",
  "explanation": "Full forensic breakdown of how the culprit committed the crime, how the evidence proves it, and how the red herrings work",
  "timeline": [
    { "time": "e.g., 08:30 PM", "event": "description" }
  ],
  "suspects": [
    {
      "id": "slug-name",
      "name": "Full Name",
      "role": "Role / Relationship to victim",
      "age": 35,
      "photoPrompt": "Visual description for portrait",
      "alibi": "Stated whereabouts and witness claims",
      "backstory": "Background and secret grievances",
      "isCulprit": false
    }
  ],
  "evidence": [
    {
      "id": "ev-1",
      "type": "chat",
      "title": "WhatsApp Export: Character A & B",
      "description": "Recovered text logs from victim's phone",
      "chatData": [
        { "sender": "Name", "message": "text", "timestamp": "10:14 PM", "isRead": true, "isRedacted": false }
      ],
      "isRedHerring": false,
      "revealOrder": 1
    },
    {
      "id": "ev-2",
      "type": "image",
      "title": "Crime Scene Still",
      "description": "Photo taken by lead forensic investigator",
      "imagePrompt": "Description of the scene",
      "exif": { "camera": "Nikon D850", "lens": "35mm f/1.8", "timestamp": "23:40 HRS", "location": "Study Room" },
      "isRedHerring": false,
      "revealOrder": 2
    },
    {
      "id": "ev-3",
      "type": "video",
      "title": "CCTV Feed: Corridor West",
      "description": "Camera footage snippet timestamped shortly before the incident",
      "cameraLabel": "CAM 04 - WEST CORRIDOR",
      "timestampOverlay": "22:15:30",
      "footageDescription": "Visual breakdown of shadows and movement caught on tape",
      "isRedHerring": false,
      "revealOrder": 3
    },
    {
      "id": "ev-4",
      "type": "document",
      "title": "Preliminary Coroner Report",
      "description": "Official medical examiner findings",
      "documentText": "Official autopsy notes and toxicology analysis",
      "isRedHerring": false,
      "revealOrder": 4
    }
  ]
}`;
};

export const getHintPrompt = (caseTitle, culpritName, cluesViewed = []) => {
  return `You are a cryptic senior detective consulting on the case "${caseTitle}".
The user has examined the following evidence: ${cluesViewed.join(', ') || 'initial case briefing'}.
The true culprit is ${culpritName}.
Provide a subtle, atmospheric 1-2 sentence hint that gently redirects the player's attention toward inconsistencies in the timeline or evidence without naming ${culpritName} directly. Do not reveal the answer.`;
};
