const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageBreak, VerticalAlign
} = require('docx');
const fs = require('fs');

const GRAY = "4A4A4A";
const DARK = "1A1A1A";
const ACCENT = "2E5FA3";
const LIGHT_BLUE = "DCE9F8";
const ANSWER_BG = "E8F4E8";
const ANSWER_BORDER = "2E7D32";
const LINE_BG = "F5F5F5";

const border0 = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: border0, bottom: border0, left: border0, right: border0 };
const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const allThin = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const accentBorder = { style: BorderStyle.SINGLE, size: 4, color: ANSWER_BORDER };

function sp(before = 0, after = 0) {
  return { before: before * 20, after: after * 20 };
}

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 36, color: ACCENT, font: "Arial" })],
    spacing: sp(14, 6),
    shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: ACCENT } },
    indent: { left: 0 },
  });
}

function heading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 28, color: ACCENT, font: "Arial" })],
    spacing: sp(12, 4),
  });
}

function heading3(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, color: DARK, font: "Arial" })],
    spacing: sp(10, 4),
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: GRAY, font: "Arial", ...opts })],
    spacing: sp(3, 3),
  });
}

function bodyBold(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: DARK, font: "Arial", bold: true })],
    spacing: sp(3, 3),
  });
}

function italicPara(text) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: GRAY, font: "Arial", italics: true })],
    spacing: sp(3, 3),
  });
}

function paraNum(num, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}   `, bold: true, size: 22, color: ACCENT, font: "Arial" }),
      new TextRun({ text, size: 22, color: GRAY, font: "Arial" }),
    ],
    spacing: sp(4, 4),
  });
}

function qLine(num, text) {
  return new Paragraph({
    children: [
      new TextRun({ text: `${num}. `, bold: true, size: 22, color: DARK, font: "Arial" }),
      new TextRun({ text, size: 22, color: DARK, font: "Arial" }),
    ],
    spacing: sp(5, 2),
  });
}

function option(letter, text, correct = false) {
  return new Paragraph({
    children: [
      new TextRun({ text: `    ${letter}. `, bold: correct, size: 22, color: correct ? ANSWER_BORDER : GRAY, font: "Arial" }),
      new TextRun({ text, bold: correct, size: 22, color: correct ? ANSWER_BORDER : GRAY, font: "Arial" }),
      ...(correct ? [new TextRun({ text: "  ✓", bold: true, size: 22, color: ANSWER_BORDER, font: "Arial" })] : []),
    ],
    spacing: sp(1, 1),
  });
}

function answerBox(label, answer) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [2200, 6826],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: { top: { style: BorderStyle.SINGLE, size: 3, color: ANSWER_BORDER }, bottom: { style: BorderStyle.SINGLE, size: 3, color: ANSWER_BORDER }, left: { style: BorderStyle.SINGLE, size: 3, color: ANSWER_BORDER }, right: thinBorder },
            shading: { fill: "D5EDD5", type: ShadingType.CLEAR },
            width: { size: 2200, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: `✎ ${label}`, bold: true, size: 20, color: ANSWER_BORDER, font: "Arial" })] })],
          }),
          new TableCell({
            borders: { top: { style: BorderStyle.SINGLE, size: 3, color: ANSWER_BORDER }, bottom: { style: BorderStyle.SINGLE, size: 3, color: ANSWER_BORDER }, left: thinBorder, right: { style: BorderStyle.SINGLE, size: 3, color: ANSWER_BORDER } },
            shading: { fill: ANSWER_BG, type: ShadingType.CLEAR },
            width: { size: 6826, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: answer, size: 20, color: "1B5E20", font: "Arial", bold: true })] })],
          }),
        ],
      }),
    ],
  });
}

function blankLine() {
  return new Paragraph({ children: [new TextRun({ text: "" })], spacing: sp(2, 2) });
}

function divider() {
  return new Paragraph({
    children: [new TextRun({ text: "" })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
    spacing: sp(6, 6),
  });
}

function pageBreakPara() {
  return new Paragraph({ children: [new PageBreak()] });
}

function sectionHeader(type, num, title) {
  const color = type === "R1" ? "2E5FA3" : "7B3FA3";
  const bg = type === "R1" ? "DCE9F8" : "EDE0F8";
  return new Paragraph({
    children: [
      new TextRun({ text: `${type} — TEXT ${num}: `, bold: true, size: 30, color, font: "Arial" }),
      new TextRun({ text: title, bold: true, size: 30, color: DARK, font: "Arial" }),
    ],
    spacing: sp(16, 8),
    shading: { fill: bg, type: ShadingType.CLEAR },
    border: {
      top: { style: BorderStyle.SINGLE, size: 4, color },
      bottom: { style: BorderStyle.SINGLE, size: 2, color },
    },
  });
}

function vocabTable(pairs) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [4513, 4513],
    rows: pairs.map(([left, right], i) =>
      new TableRow({
        children: [
          new TableCell({
            borders: allThin,
            shading: { fill: i % 2 === 0 ? "F0F4F8" : "FFFFFF", type: ShadingType.CLEAR },
            width: { size: 4513, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: left, size: 20, font: "Arial", color: DARK })] })],
          }),
          new TableCell({
            borders: allThin,
            shading: { fill: i % 2 === 0 ? "F0F4F8" : "FFFFFF", type: ShadingType.CLEAR },
            width: { size: 4513, type: WidthType.DXA },
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: right, size: 20, font: "Arial", color: GRAY })] })],
          }),
        ],
      })
    ),
  });
}

// ─────────────────────────────────────────────
// ALL TEXTS AND QUESTIONS
// ─────────────────────────────────────────────

const children = [];

// TITLE PAGE
children.push(
  new Paragraph({
    children: [new TextRun({ text: "PROGRAM 2 — SPRING 2025–2026", bold: true, size: 48, color: ACCENT, font: "Arial" })],
    alignment: AlignmentType.CENTER,
    spacing: sp(40, 6),
  }),
  new Paragraph({
    children: [new TextRun({ text: "ORIGINAL READING PRACTICE SET", bold: true, size: 36, color: DARK, font: "Arial" })],
    alignment: AlignmentType.CENTER,
    spacing: sp(4, 4),
  }),
  new Paragraph({
    children: [new TextRun({ text: "Weeks 7–10 | Levels Matching R1 & R2 | With Full Answer Keys", size: 26, color: GRAY, font: "Arial" })],
    alignment: AlignmentType.CENTER,
    spacing: sp(4, 20),
  }),
  new Paragraph({
    children: [new TextRun({ text: "10 Reading 1 Texts  +  10 Reading 2 Texts  =  20 Original Passages", bold: true, size: 24, color: ACCENT, font: "Arial" })],
    alignment: AlignmentType.CENTER,
    spacing: sp(4, 4),
  }),
  divider(),
  new Paragraph({
    children: [new TextRun({ text: "Question types included per text:", bold: true, size: 22, font: "Arial", color: DARK })],
    spacing: sp(10, 4),
  }),
  body("R1: Paragraph purpose (MC) · NOT mentioned (MC) · Short answer · Sentence insertion · Vocabulary in context · Paragraph relationship · CANNOT infer · Free response"),
  body("R2: Short answer · MC from paragraph · Counterintuitive / explain in own words · Stage/process matching · TRUE statements · Reference tracking · Summary fill-in"),
  pageBreakPara()
);

// ══════════════════════════════════════════════
// READING 1 TEXTS
// ══════════════════════════════════════════════

children.push(
  new Paragraph({
    children: [new TextRun({ text: "READING 1 — TEXTS 1–10", bold: true, size: 40, color: ACCENT, font: "Arial" })],
    alignment: AlignmentType.CENTER,
    spacing: sp(10, 10),
    shading: { fill: LIGHT_BLUE, type: ShadingType.CLEAR },
  }),
  blankLine()
);

// ────────────────────────────────────────────
// R1 TEXT 1: THE PSYCHOLOGY OF PROCRASTINATION
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 1, "THE PSYCHOLOGY OF PROCRASTINATION"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. Do you ever put off tasks until the last minute? What kinds of tasks do you tend to delay most?"),
  body("2. Do you think procrastination is a bad habit or a personality trait? Discuss with a partner."),
  blankLine(),
  bodyBold("Vocabulary: Match the words with their definitions."),
  vocabTable([
    ["1. defer (v.)", "a. a strong dislike or unwillingness"],
    ["2. aversion (n.)", "b. lasting for a long time; persistent"],
    ["3. chronic (adj.)", "c. a strategy used to deal with stress"],
    ["4. coping mechanism (n.)", "d. to delay or postpone"],
    ["5. self-sabotage (n.)", "e. behavior that prevents one from achieving goals"],
  ]),
  blankLine(),
  bodyBold("Vocabulary Answer Key:"),
  answerBox("1.", "d — to delay or postpone"),
  answerBox("2.", "a — a strong dislike or unwillingness"),
  answerBox("3.", "b — lasting for a long time; persistent"),
  answerBox("4.", "c — a strategy used to deal with stress"),
  answerBox("5.", "e — behavior that prevents one from achieving goals"),
  blankLine(),
  divider()
);

children.push(
  bodyBold("THE PSYCHOLOGY OF PROCRASTINATION"),
  blankLine(),
  bodyBold("Why We Delay"),
  paraNum("1", "Procrastination is far more complex than simple laziness. Nearly everyone puts off tasks from time to time, but for a significant portion of the population, delay has become a chronic pattern. Research consistently shows that procrastination is not primarily about time management — it is about emotion management. When people encounter a task they find unpleasant, anxiety-provoking, or boring, the brain's impulse is to seek short-term relief, even at the cost of long-term consequences. This emotional avoidance, rather than poor organization or lack of intelligence, is what drives most habitual procrastinators."),
  blankLine(),
  bodyBold("What the Brain Is Doing"),
  paraNum("2", "Neuroscience has shed light on why some people procrastinate more than others. Studies using brain imaging have found that habitual procrastinators tend to have a larger amygdala — the brain region associated with processing emotions and detecting potential threats. When these individuals are confronted with a difficult task, the amygdala interprets it as a threat and sends signals to avoid it. At the same time, the connection between the amygdala and the part of the brain responsible for goal-directed behavior tends to be weaker in procrastinators, making it harder for them to override emotional impulses with rational intentions."),
  blankLine(),
  bodyBold("The Role of Self-Compassion"),
  paraNum("3", "One of the most counterintuitive findings in procrastination research is that self-criticism actually worsens the problem rather than solving it. Many people believe that being hard on themselves after a procrastination episode will motivate better behavior in the future. In reality, the guilt and shame produced by self-criticism increase the emotional discomfort associated with the task, making the individual even more likely to avoid it next time. Studies at Carleton University found that students who forgave themselves after procrastinating on the first exam procrastinated significantly less on the second exam compared to those who did not. Self-compassion, it seems, breaks the cycle rather than enabling it."),
  blankLine(),
  bodyBold("Perfectionism as a Hidden Driver"),
  paraNum("4", "A less obvious cause of procrastination is perfectionism. While the stereotype of a procrastinator is someone who is disorganized and careless, many procrastinators are, in fact, deeply invested in doing things well. The fear of producing work that falls short of their own high standards leads them to delay starting — and sometimes finishing — tasks altogether. (A) This type of avoidance is known as self-handicapping: by not starting, the individual can attribute any eventual failure to a lack of effort rather than a lack of ability. (B) Rather than reflecting disorganization, this behavior paradoxically stems from caring too much. (C) In a distorted way, procrastination becomes a strategy for protecting self-esteem. (D)"),
  blankLine(),
  bodyBold("Breaking the Pattern"),
  paraNum("5", "Research suggests several evidence-based strategies for overcoming procrastination. Breaking tasks into smaller, more manageable steps reduces the sense of overwhelm that triggers avoidance. Implementation intentions — specific plans that specify when, where, and how a task will be completed — have been shown to dramatically improve follow-through. Removing environmental temptations (such as turning off notifications) decreases the cognitive effort required to stay focused. Some researchers also recommend 'temptation bundling' — pairing an unpleasant task with something enjoyable, such as only listening to a favorite podcast while exercising. The key insight is that fighting the behavior with willpower alone is rarely effective; instead, restructuring the environment and reframing the emotional relationship with tasks produces more lasting change."),
  blankLine(),
  divider()
);

children.push(
  bodyBold("QUESTIONS"),
  blankLine(),
  qLine("1", "What is the primary purpose of paragraph 1?"),
  option("A", "To argue that procrastination is caused by a lack of discipline"),
  option("B", "To distinguish between occasional and chronic procrastination"),
  option("C", "To present procrastination as an emotional rather than a time management issue", true),
  option("D", "To persuade readers to seek professional help for procrastination"),
  answerBox("Answer", "C — The paragraph explicitly states that procrastination 'is not primarily about time management — it is about emotion management.'"),
  blankLine(),

  qLine("2", "Which of the following is NOT supported by paragraph 2?"),
  option("A", "Procrastinators may be neurologically predisposed to avoid difficult tasks."),
  option("B", "The amygdala plays a role in how threatening a task feels to a procrastinator."),
  option("C", "People with smaller amygdalae are more likely to be habitual procrastinators.", true),
  option("D", "A weaker brain connection in procrastinators makes rational goal-setting harder."),
  answerBox("Answer", "C — The text says procrastinators have a LARGER amygdala. Option C reverses this, making it unsupported."),
  blankLine(),

  qLine("3", "Based on paragraph 3, what is the relationship between self-criticism and procrastination?"),
  answerBox("Answer", "Self-criticism worsens procrastination. It increases guilt and shame, which raises emotional discomfort around the task, making the person even more likely to avoid it in the future. Self-compassion, by contrast, reduces future procrastination."),
  blankLine(),

  qLine("4", "Where does the following sentence best fit in paragraph 4? Write the letter (A, B, C, or D). 'Rather than reflecting disorganization, this behavior paradoxically stems from caring too much.'"),
  answerBox("Answer", "B — The sentence logically follows the definition of self-handicapping and explains why it occurs (caring too much), before the paragraph concludes with the self-esteem protection idea."),
  blankLine(),

  qLine("5", "What does 'self-handicapping' mean as used in paragraph 4?"),
  option("A", "Deliberately limiting one's own performance to have an excuse for failure", true),
  option("B", "Avoiding competition by refusing to participate in challenging tasks"),
  option("C", "Setting unrealistically high standards that can never be reached"),
  option("D", "Damaging one's physical health through excessive stress and worry"),
  answerBox("Answer", "A — Self-handicapping means not starting so that failure can be blamed on effort, not ability — a deliberate limitation of one's own performance."),
  blankLine(),

  qLine("6", "Which paragraph from 1–5 best supports the following case? 'A student delays submitting her essay for weeks, finishes it in one rushed night, receives a poor grade, and then feels terrible about herself — yet repeats the same pattern the following semester.'"),
  answerBox("Answer", "Paragraph 3 — The student's cycle of guilt after procrastinating and then repeating the behavior matches the paragraph's argument that self-criticism increases avoidance and perpetuates the pattern."),
  blankLine(),

  qLine("7", "According to paragraph 5, what makes willpower an insufficient solution to procrastination?"),
  answerBox("Answer", "Willpower alone is rarely effective because it does not address the emotional and environmental factors that trigger avoidance. Restructuring the environment and reframing one's emotional relationship with tasks produces more lasting change."),
  blankLine(),

  qLine("8", "What is 'temptation bundling,' and how does it help overcome procrastination?"),
  answerBox("Answer", "Temptation bundling means pairing an unpleasant task with something enjoyable (e.g., only listening to a favorite podcast while exercising). It makes the aversive task more tolerable by associating it with a reward, reducing the emotional barrier to starting."),
  blankLine(),

  qLine("9", "What CANNOT be inferred from the text as a whole?"),
  option("A", "Procrastination is partly linked to brain structure."),
  option("B", "Being forgiving toward oneself can reduce future procrastination."),
  option("C", "People who procrastinate due to perfectionism care more about results than average people."),
  option("D", "Procrastinators who use implementation intentions never relapse into old patterns.", true),
  answerBox("Answer", "D — The text says implementation intentions 'dramatically improve follow-through,' not that they eliminate relapse entirely. The word 'never' makes D an unsupported overstatement."),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 2: URBAN HEAT ISLANDS
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 2, "URBAN HEAT ISLANDS"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. Have you ever noticed that cities feel hotter than the surrounding countryside? What might explain this?"),
  body("2. What do you think are the environmental consequences of cities being warmer than rural areas?"),
  blankLine(),
  bodyBold("Vocabulary: Fill in the blanks with the correct word."),
  italicPara("impervious / mitigation / canopy / radiate / retrofit"),
  body("1. The roof was designed to __________________ heat rather than absorb it."),
  body("2. New buildings must be __________________(ed) with green spaces to meet environmental standards."),
  body("3. Concrete is nearly __________________ to water, meaning rainfall runs straight off its surface."),
  body("4. Tree __________________ coverage in the city dropped significantly over the last decade."),
  body("5. Government policies aim at the __________________ of carbon emissions in urban areas."),
  blankLine(),
  bodyBold("Vocabulary Answer Key:"),
  answerBox("1.", "radiate"),
  answerBox("2.", "retrofit"),
  answerBox("3.", "impervious"),
  answerBox("4.", "canopy"),
  answerBox("5.", "mitigation"),
  blankLine(), divider(),
  bodyBold("URBAN HEAT ISLANDS"),
  blankLine(),
  bodyBold("The Phenomenon"),
  paraNum("1", "Walk through any major city on a hot summer evening, and something becomes immediately apparent: it is noticeably warmer than the surrounding countryside, even after the sun has set. This is not an illusion. Cities are measurably hotter than nearby rural areas — a phenomenon scientists call the 'urban heat island' (UHI) effect. The temperature difference is rarely dramatic during the day, but at night it can reach as high as 10°C in some cities. Understanding why this happens is the first step toward designing cities that do not trap their residents in man-made heat."),
  bodyBold("Why Cities Are Hotter"),
  paraNum("2", "The UHI effect arises from a combination of factors specific to urban environments. First, the materials that make up most cities — asphalt, concrete, and brick — absorb solar radiation during the day and slowly release it as heat at night, long after temperatures in surrounding fields have begun to drop. This is fundamentally different from natural surfaces such as soil and vegetation, which use much of the solar energy they absorb to evaporate moisture, a process that cools the surrounding air. Second, cities replace natural landscapes with impervious surfaces that prevent rainwater from soaking into the ground. Without the cooling effect of evaporation, urban surfaces simply grow warmer. Third, the geometry of cities — tall buildings in dense blocks — creates a 'canyon' effect that traps heat and blocks cooling winds. Finally, human activities produce enormous amounts of waste heat from vehicles, air conditioning, and industry, which further raises urban temperatures."),
  bodyBold("Who Is Most at Risk?"),
  paraNum("3", "Not everyone in a city feels the UHI effect equally. Poorer neighborhoods tend to have less tree coverage, more paved surfaces, older buildings, and fewer parks. In contrast, wealthier areas often feature wider streets, more trees, and greater access to air conditioning. Research consistently shows that heat-related illness and death are significantly more common in lower-income urban areas during heatwaves. The elderly and very young children are particularly vulnerable. A 2003 heatwave in Europe killed an estimated 70,000 people — the majority of whom were elderly individuals from urban, lower-income backgrounds."),
  bodyBold("Solutions"),
  paraNum("4", "Cities around the world are exploring various strategies to reduce urban heat. One widely discussed approach is increasing green infrastructure — planting trees, creating parks, and installing 'green roofs' covered with vegetation. Trees and plants provide shade and release moisture, cooling the air significantly. Singapore has integrated lush vertical gardens into its urban planning strategy and requires new buildings to compensate for any green space they displace at ground level. Another approach involves replacing dark road surfaces with reflective 'cool' materials that absorb less solar radiation. Los Angeles has begun painting some streets white as a pilot measure, reporting surface temperature reductions of up to 11°C compared to conventional asphalt."),
  paraNum("5", "Water features — fountains, canals, and artificial wetlands — also play a cooling role. Some urban planners have begun to 'daylight' buried rivers and streams, restoring their natural cooling function. However, experts caution that no single solution is sufficient on its own. Effective UHI mitigation requires an integrated approach combining green infrastructure, reflective materials, reduced waste heat, and careful urban planning. Cities that address the problem in a piecemeal fashion risk investing heavily in measures that have limited real-world impact when implemented alone."),
  blankLine(), divider()
);
children.push(
  bodyBold("QUESTIONS"),
  blankLine(),
  qLine("1", "What is the main purpose of paragraph 1?"),
  option("A", "To introduce the UHI effect and establish its significance", true),
  option("B", "To compare daytime and nighttime temperatures in cities and the countryside"),
  option("C", "To explain why summer temperatures are rising globally"),
  option("D", "To warn residents about the dangers of living in cities"),
  answerBox("Answer", "A — Paragraph 1 defines the UHI effect, provides its basic characteristics, and frames it as a problem worth understanding."),
  blankLine(),

  qLine("2", "According to paragraph 2, which is NOT listed as a cause of the UHI effect?"),
  option("A", "Heat-absorbing building materials releasing warmth at night"),
  option("B", "The absence of moisture evaporation from urban surfaces"),
  option("C", "The increased use of air conditioning in modern cities", true),
  option("D", "The way tall buildings block the flow of wind"),
  answerBox("Answer", "C — Air conditioning is mentioned as a source of waste heat, not as a separate cause of the UHI effect in the structural sense that options A, B, and D describe."),
  blankLine(),

  qLine("3", "What word in paragraph 2 is closest in meaning to 'sealed' or 'not allowing water to pass through'?"),
  answerBox("Answer", "impervious"),
  blankLine(),

  qLine("4", "How does paragraph 3 relate to paragraph 2?"),
  option("A", "It introduces new causes of the UHI effect not covered in paragraph 2."),
  option("B", "It explains that not all city residents are exposed to the same degree of urban heat.", true),
  option("C", "It argues that the UHI effect is more dangerous than paragraph 2 suggests."),
  option("D", "It provides statistical evidence to prove that the temperature figures in paragraph 2 are correct."),
  answerBox("Answer", "B — Paragraph 2 explains what causes UHI; paragraph 3 shifts focus to who is most affected, establishing inequality in exposure."),
  blankLine(),

  qLine("5", "Which of the following can be inferred from paragraph 3?"),
  option("A", "Elderly people from wealthy urban areas were not affected by the 2003 European heatwave."),
  option("B", "Wealthier neighborhoods tend to be better protected against the effects of urban heat.", true),
  option("C", "Heat-related deaths are equally distributed across all income levels in urban areas."),
  option("D", "Children's bodies are better equipped to deal with extreme heat than those of adults."),
  answerBox("Answer", "B — Wealthier neighborhoods are described as having more trees, wider streets, and better access to air conditioning — all features that reduce heat exposure."),
  blankLine(),

  qLine("6", "What specific measure has Los Angeles used to combat the UHI effect, and what results has it achieved?"),
  answerBox("Answer", "Los Angeles has been painting some streets white (using reflective materials). This has reportedly reduced surface temperatures by up to 11°C compared to conventional black asphalt."),
  blankLine(),

  qLine("7", "In paragraph 5, what does the author suggest about cities that tackle the UHI problem using only one or two measures?"),
  answerBox("Answer", "The author suggests that piecemeal approaches — relying on only one or two measures — risk investing heavily in strategies that have limited real-world impact when implemented alone. An integrated approach combining multiple strategies is needed."),
  blankLine(),

  qLine("8", "Which of the following would best serve as a subtitle for paragraph 4?"),
  option("A", "The failure of green infrastructure programs"),
  option("B", "How vegetation and reflective surfaces help cool cities", true),
  option("C", "Singapore's unique contribution to global climate science"),
  option("D", "Why traditional urban planning has worsened the heat island effect"),
  answerBox("Answer", "B — Paragraph 4 discusses both green roofs/trees (vegetation) and reflective street surfaces as cooling strategies."),
  blankLine(),

  qLine("9", "What CANNOT be inferred from the text as a whole?"),
  option("A", "The UHI effect is partly a product of how cities are physically designed."),
  option("B", "Poorer communities bear a disproportionate burden of the risks associated with urban heat."),
  option("C", "Green roofs and reflective surfaces are equally effective in all city climates.", true),
  option("D", "Restoring buried waterways can contribute to reducing urban temperatures."),
  answerBox("Answer", "C — The text does not compare the effectiveness of different measures in different climates. This claim is an overstatement not supported by the text."),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 3: SLEEP DEPRIVATION
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 3, "SLEEP DEPRIVATION AND COGNITIVE PERFORMANCE"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. How many hours of sleep do you get on a typical night? Do you feel it is enough?"),
  body("2. Do you think sleeping less can become a cultural habit? What might be the long-term consequences?"),
  blankLine(),
  bodyBold("SLEEP DEPRIVATION AND COGNITIVE PERFORMANCE"),
  blankLine(),
  bodyBold("A Modern Epidemic"),
  paraNum("1", "In many parts of the world, insufficient sleep has become so normalized that people wear it as a badge of pride. 'I only need five hours,' is the kind of boast one hears in competitive professional environments. Yet the scientific consensus is unambiguous: almost no one functions well on five hours, and virtually no one is genuinely immune to the cognitive consequences of sleep loss. The assumption that sleep deprivation is a minor inconvenience — something that coffee and willpower can overcome — is not just incorrect; it is demonstrably dangerous."),
  bodyBold("Memory and Learning"),
  paraNum("2", "Sleep plays a crucial role in the formation and consolidation of memory. During sleep — particularly during the slow-wave and REM stages — the brain replays and organizes the information it encountered during waking hours, transferring it from short-term into long-term memory. People who sleep after learning new material retain significantly more than those who remain awake. A single night of poor sleep before an exam can reduce recall ability by up to 40%, according to studies at the University of California, Berkeley. Crucially, a well-rested brain also takes in new information more effectively, suggesting that sleep functions both before and after learning to maximize retention."),
  bodyBold("Decision-Making and Risk"),
  paraNum("3", "Beyond memory, sleep deprivation severely impairs decision-making, particularly the ability to assess risk. Studies consistently show a pattern researchers call 'optimism bias under fatigue': exhausted people tend to underestimate dangers and overestimate their own abilities. (A) This is especially concerning in high-stakes environments. (B) Research on medical professionals found that doctors working shifts longer than 24 hours make significantly more diagnostic errors. (C) One landmark study found that surgical residents on such shifts made 36% more serious medical errors than those on shorter schedules. (D) Data from the US Centers for Disease Control indicates that drowsy driving causes around 72,000 crashes and 800 deaths every year."),
  bodyBold("The Body's Long-Term Response"),
  paraNum("4", "Chronic sleep deprivation — consistently sleeping fewer than the recommended seven to nine hours — does not merely affect mental performance. Over time, it disrupts hormonal balance, suppresses immune function, increases inflammation, and raises the risk of Type 2 diabetes, cardiovascular disease, and obesity. Sleep-deprived individuals produce more ghrelin (which signals hunger) and less leptin (which signals satiety), leading to increased caloric intake. In studies where participants slept only six hours per night for two weeks, their cognitive performance declined to the equivalent of two full nights without sleep — yet the participants themselves reported feeling only slightly impaired, revealing a worrying lack of self-awareness about their actual functioning."),
  bodyBold("What Can Be Done?"),
  paraNum("5", "Public health experts recommend consistent sleep schedules, limiting screen exposure before bed, keeping bedrooms cool and dark, and avoiding caffeine after midday. At the institutional level, several US high schools have experimented with later start times for teenagers, whose circadian rhythms shift during adolescence to favor later sleep and waking. The results have been broadly positive: more sleep, better moods, and improved academic performance. The challenge, however, is cultural: in societies that equate busyness with virtue, the idea of deliberately making space for rest remains a difficult sell."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "What is the author's attitude toward the claim that some people only need five hours of sleep?"),
  option("A", "Neutral — the author acknowledges it is true for some individuals"),
  option("B", "Skeptical — the author implies it is incorrect and potentially harmful", true),
  option("C", "Supportive — the author cites it as evidence of human adaptability"),
  option("D", "Uncertain — the author says more research is needed to confirm or deny it"),
  answerBox("Answer", "B — The author calls the assumption 'not just incorrect; it is demonstrably dangerous,' which is clearly skeptical and dismissive of the claim."),
  blankLine(),

  qLine("2", "According to paragraph 2, what does sleep do both BEFORE and AFTER learning?"),
  answerBox("Answer", "Sleep before learning allows a rested brain to take in new information more effectively. Sleep after learning helps consolidate and transfer that information from short-term to long-term memory. Both processes maximize retention."),
  blankLine(),

  qLine("3", "What does 'optimism bias under fatigue' mean as used in paragraph 3?"),
  option("A", "The tendency of tired people to feel more positive about their work"),
  option("B", "The tendency of exhausted people to misjudge risks and overrate their own capabilities", true),
  option("C", "The belief that getting less sleep makes a person more resilient over time"),
  option("D", "The pattern in which tired workers make better decisions in familiar situations"),
  answerBox("Answer", "B — The text defines it as a state in which exhausted people 'underestimate dangers and overestimate their own abilities.'"),
  blankLine(),

  qLine("4", "Where does the following sentence best fit in paragraph 3? Write the letter (A, B, C, or D). 'One landmark study found that surgical residents on such shifts made 36% more serious medical errors than those on shorter schedules.'"),
  answerBox("Answer", "C — It follows directly from the general claim that doctors on long shifts make more diagnostic errors, providing specific statistical evidence for that claim."),
  blankLine(),

  qLine("5", "According to paragraph 4, two hormones are involved in the link between sleep loss and weight gain. What role does each play?"),
  answerBox("Ghrelin", "Ghrelin signals hunger — sleep-deprived individuals produce more of it, increasing appetite and caloric intake."),
  answerBox("Leptin", "Leptin signals satiety (fullness) — sleep-deprived individuals produce less of it, so they feel less full and eat more."),
  blankLine(),

  qLine("6", "Which paragraph from 1–5 best supports the following statement? 'A construction site manager who regularly sleeps only five hours begins to authorize shortcuts in safety procedures without fully recognizing the risks he is accepting.'"),
  answerBox("Answer", "Paragraph 3 — The manager's pattern of underestimating danger ('authorize shortcuts') and not recognizing his impairment matches the 'optimism bias under fatigue' described in paragraph 3."),
  blankLine(),

  qLine("7", "What made the finding about participants sleeping six hours per night particularly alarming?"),
  answerBox("Answer", "Although participants' cognitive performance declined to the equivalent of two full nights without sleep, they themselves reported feeling only slightly impaired. This shows that chronically sleep-deprived people are often unaware of how severely their performance has actually deteriorated."),
  blankLine(),

  qLine("8", "What CANNOT be inferred from the text?"),
  option("A", "Cultural attitudes toward sleep can make it difficult to implement healthier sleep habits."),
  option("B", "Schools that adopted later start times saw improvements in both student wellbeing and learning."),
  option("C", "Chronically sleep-deprived people are always aware that their performance has declined.", true),
  option("D", "Hormonal changes caused by lack of sleep can contribute to long-term weight gain."),
  answerBox("Answer", "C — Paragraph 4 explicitly states that participants reported feeling only slightly impaired despite severe performance decline, which contradicts option C entirely."),
  blankLine(),

  qLine("9", "SUMMARY — Fill in the blanks."),
  body("Sleep deprivation has become (1)__________________ in many cultures. Its effects are wide-ranging: it damages (2)__________________ and learning, impairs decision-making and risk assessment, and over the long term disrupts the body's hormonal balance. Interestingly, people who are chronically sleep-deprived often fail to accurately perceive how much their (3)__________________ has declined. Both individual behavioral changes and (4)__________________ reforms can help address the problem."),
  answerBox("1.", "normalized / widespread"),
  answerBox("2.", "memory / recall ability"),
  answerBox("3.", "cognitive performance / functioning"),
  answerBox("4.", "institutional (e.g., later school start times)"),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 4: THE ECONOMICS OF HAPPINESS
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 4, "THE ECONOMICS OF HAPPINESS"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. Do you think wealthier people are necessarily happier? Why or why not?"),
  body("2. How do you define 'happiness'? Is it a feeling, a way of life, or something else?"),
  blankLine(),
  bodyBold("THE ECONOMICS OF HAPPINESS"),
  blankLine(),
  bodyBold("Does Money Buy Happiness?"),
  paraNum("1", "For most of recorded history, the relationship between wealth and happiness seemed obvious: more money meant a better life. Richer people could afford better food, safer homes, superior healthcare, and more leisure. This intuition was partly correct but, as decades of research have revealed, dramatically incomplete. The relationship between income and happiness turns out to be considerably more complicated, shaped by factors such as comparison with others, adaptation, and the distinction between experiencing and evaluating one's own life."),
  bodyBold("The Easterlin Paradox"),
  paraNum("2", "In the early 1970s, economist Richard Easterlin identified a puzzle that has generated debate ever since. Comparing data from multiple countries, he found that wealthier nations were not consistently happier than poorer ones, and that within countries, increases in national income over time did not appear to produce corresponding increases in average happiness. This became known as the 'Easterlin Paradox.' One explanation is hedonic adaptation: people quickly adapt to improvements in their material circumstances and return to a baseline level of happiness. A significant pay raise produces initial elation, but within months the new income level becomes normal, and the emotional benefit fades. Another explanation is social comparison: people evaluate their income not in absolute terms but relative to those around them. If everyone becomes wealthier at the same rate, no one feels richer relative to their neighbors."),
  bodyBold("Where the Relationship Breaks Down"),
  paraNum("3", "More recent research has complicated Easterlin's findings. A widely cited study by economists Angus Deaton and Daniel Kahneman found that emotional wellbeing — how happy people feel day-to-day — increases with income, but only up to a certain threshold. Beyond roughly $75,000 per year (in 2010 U.S. dollars), additional income appeared to have little further effect on emotional wellbeing. However, life satisfaction — how people evaluate their lives overall — continued to rise with income even beyond this point. This suggests that money may help people feel their lives are going well in an abstract sense without necessarily making their everyday emotional experience more joyful."),
  bodyBold("What Does Predict Happiness?"),
  paraNum("4", "If income explains relatively little of the variance in happiness, what does? Research consistently points to strong predictors. Social relationships — the quality of connections with family, friends, and community — are among the most powerful. A Harvard study tracking hundreds of individuals across their adult lives found that the warmth of close relationships predicted not only happiness but also physical health in old age, far better than income or professional success. Meaningful work — providing a sense of purpose, competence, and autonomy — is another powerful predictor. Leisure activities that involve full engagement, what psychologist Mihaly Csikszentmihalyi called 'flow' states, produce more lasting happiness than passive activities like watching television, even when the latter feels more immediately appealing."),
  bodyBold("Policy Implications"),
  paraNum("5", "These findings have significant implications for public policy. If national income growth does not reliably translate into greater wellbeing, governments may be misallocating effort by focusing almost exclusively on economic growth. Several countries — most notably Bhutan, but more recently New Zealand, Scotland, and Iceland — have begun developing alternative national metrics that include measures of mental health, social connection, environmental quality, and leisure time alongside or in place of GDP. Critics argue that economic growth remains essential for meeting basic needs and that happiness-oriented policies risk being vague and unmeasurable. Advocates counter that continuing to treat GDP as the primary index of progress ignores the very things research shows matter most to human wellbeing."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "According to paragraph 1, what did most people historically assume about wealth and happiness, and why was this assumption only 'partly correct'?"),
  answerBox("Answer", "Most people assumed more money always produced a better, happier life because wealth provides material advantages (food, safety, healthcare). It was only partly correct because the relationship is far more complex — factors such as social comparison and adaptation mean that money alone does not reliably increase happiness."),
  blankLine(),

  qLine("2", "Which best describes the 'Easterlin Paradox'?"),
  option("A", "The observation that income always improves happiness in developing nations"),
  option("B", "The finding that increasing national wealth does not reliably increase national happiness", true),
  option("C", "The argument that poorer individuals are happier than wealthier ones in all societies"),
  option("D", "The paradox that people who earn more tend to work longer hours"),
  answerBox("Answer", "B — Easterlin found that wealthier nations were not consistently happier and that rising national income over time did not produce corresponding happiness gains."),
  blankLine(),

  qLine("3", "What does 'hedonic adaptation' mean as explained in paragraph 2?"),
  answerBox("Answer", "Hedonic adaptation refers to the tendency of people to quickly return to a baseline level of happiness after an improvement in their circumstances. For example, the positive emotional effect of a pay raise fades within months as the new income level becomes the new 'normal.'"),
  blankLine(),

  qLine("4", "Based on paragraphs 2 and 3, fill in the table."),
  vocabTable([
    ["Type of happiness measured", "Does income above ~$75,000 help?"],
    ["Day-to-day emotional wellbeing", "No — it plateaus beyond this threshold"],
    ["Overall life satisfaction", "Yes — it continues to rise with income"],
  ]),
  blankLine(),

  qLine("5", "According to paragraph 4, what did the Harvard study reveal about relationships and happiness?"),
  answerBox("Answer", "The Harvard study found that the warmth and quality of close relationships were among the strongest predictors of happiness — and also of good physical health in old age — outperforming income and professional success as predictors of wellbeing."),
  blankLine(),

  qLine("6", "Which of the following is NOT mentioned as a predictor of happiness?"),
  option("A", "Strong social connections with family and community"),
  option("B", "High levels of professional prestige and social status", true),
  option("C", "Meaningful work that provides autonomy and a sense of purpose"),
  option("D", "Activities that produce states of deep engagement and flow"),
  answerBox("Answer", "B — The text mentions meaningful work and social relationships but never says prestige or status alone predicts happiness. That claim is not supported."),
  blankLine(),

  qLine("7", "What is the purpose of paragraph 5?"),
  option("A", "To argue that economic growth should be abandoned as a national goal"),
  option("B", "To present the policy relevance of happiness research and the debate around it", true),
  option("C", "To show that Bhutan's model has been adopted successfully worldwide"),
  option("D", "To demonstrate that GDP is an unreliable measure in all contexts"),
  answerBox("Answer", "B — The paragraph presents both sides: those who advocate for happiness metrics and those who criticize them, making it a balanced discussion of policy implications."),
  blankLine(),

  qLine("8", "What CANNOT be inferred from the text?"),
  option("A", "Social relationships may be more important to long-term happiness than professional achievement."),
  option("B", "Passive leisure activities such as watching TV produce less lasting happiness than engaging ones."),
  option("C", "Countries that have adopted alternative happiness metrics have achieved better outcomes than GDP-focused nations.", true),
  option("D", "Adaptation to improved circumstances may explain why lottery winners often return to earlier happiness levels."),
  answerBox("Answer", "C — The text mentions that countries have adopted alternative metrics but does not provide evidence that they have achieved better outcomes. That claim goes beyond what the text states."),
  blankLine(),

  qLine("9", "One sentence below does NOT belong in a paragraph about the Easterlin Paradox. Which disrupts the logical flow?"),
  option("A", "Wealthier nations did not consistently report higher levels of happiness than poorer ones."),
  option("B", "National income growth over time did not produce equivalent growth in average wellbeing."),
  option("C", "Bhutan has been measuring national happiness since the 1970s using the Gross National Happiness index.", true),
  option("D", "Social comparison means that relative wealth matters more than absolute wealth for perceived happiness."),
  answerBox("Answer", "C — This sentence is about Bhutan's measurement policy, which is from paragraph 5. It disrupts the scope of a paragraph focused on the Easterlin Paradox and its explanations."),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 5: THE MICROBIOME AND HUMAN HEALTH
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 5, "THE MICROBIOME AND HUMAN HEALTH"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. Have you heard the word 'microbiome' before? What do you think it refers to?"),
  body("2. Do you think the bacteria in our bodies can affect our mood or mental health? Discuss."),
  blankLine(),
  bodyBold("THE MICROBIOME AND HUMAN HEALTH"),
  blankLine(),
  bodyBold("An Ecosystem Within"),
  paraNum("1", "The human body contains roughly 37 trillion cells — yet it is also home to an estimated 38 trillion microbial cells, including bacteria, viruses, and fungi. The collection of these microorganisms and their genetic material is known as the microbiome. For much of medical history, bacteria were viewed primarily as pathogens — agents of disease to be eliminated. The growing science of the microbiome has fundamentally challenged this view. Far from being passive passengers or unwelcome invaders, the microorganisms that colonize the human body play active roles in digestion, immune development, mental health, and protection against disease."),
  bodyBold("The Gut Microbiome and Digestion"),
  paraNum("2", "The gut microbiome — the community of microorganisms residing in the digestive tract — is the most studied component of the human microbiome. It contains thousands of species of bacteria that help digest dietary fiber, synthesize vitamins such as B12 and K, and break down compounds that the body cannot process on its own. The composition of the gut microbiome varies considerably between individuals and is shaped by diet, genetics, early childhood exposure, and antibiotic use. Diets rich in processed foods and low in fiber tend to reduce microbial diversity, which research increasingly links to a range of health problems. Conversely, high-fiber, plant-rich diets appear to support a more diverse and stable microbial community."),
  bodyBold("The Gut-Brain Axis"),
  paraNum("3", "Perhaps the most surprising dimension of microbiome research is the growing evidence for communication between the gut and the brain — a relationship scientists call the 'gut-brain axis.' The gut contains more than 100 million nerve cells and produces the majority of the body's serotonin, a neurotransmitter closely associated with mood regulation. Research has found associations between gut microbial composition and conditions such as depression, anxiety, and autism spectrum disorder. Studies have shown that administering probiotics to individuals with depression can reduce symptoms, and that transferring gut bacteria from anxious mice to previously calm ones induces anxiety-like behavior in the recipients."),
  bodyBold("Immunity and the Microbiome"),
  paraNum("4", "The microbiome also plays a fundamental role in training and regulating the immune system. In early infancy, exposure to microorganisms — through birth, breastfeeding, and contact with dirt, animals, and other children — appears critical to the proper development of immune responses. The 'hygiene hypothesis,' first proposed in the late 1980s, suggests that excessive cleanliness in early childhood deprives the immune system of the microbial stimulation it needs, potentially contributing to the rise of allergies, asthma, and autoimmune diseases in industrialized societies. Evidence includes consistently lower rates of allergic conditions observed in children raised on farms or in households with pets compared to those raised in highly sanitized urban environments."),
  bodyBold("Threats to the Microbiome"),
  paraNum("5", "Modern lifestyles pose significant threats to microbial diversity. Overuse of antibiotics — in both human medicine and livestock farming — kills beneficial bacteria alongside harmful ones, disrupting the balance of the gut ecosystem. Highly processed diets, cesarean section births, and formula feeding instead of breastfeeding have all been associated with reduced microbial diversity in infancy. Researchers are now investigating whether targeted interventions — such as fecal microbiota transplantation (FMT), personalized probiotic therapies, and dietary modifications — can restore lost microbial communities and treat conditions ranging from recurrent gut infections to metabolic disease."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "According to paragraph 1, how has the scientific view of bacteria within the body changed?"),
  answerBox("Answer", "Bacteria were once viewed primarily as pathogens — harmful agents to be eliminated. The science of the microbiome has challenged this view by showing that microorganisms play active, beneficial roles in digestion, immune development, mental health, and disease protection."),
  blankLine(),

  qLine("2", "Which is NOT listed in paragraph 2 as a function of gut bacteria?"),
  option("A", "Helping to process dietary fiber"),
  option("B", "Producing certain vitamins needed by the body"),
  option("C", "Eliminating harmful pathogens from the digestive tract", true),
  option("D", "Breaking down compounds the body cannot digest on its own"),
  answerBox("Answer", "C — Paragraph 2 lists fiber digestion, vitamin synthesis, and breaking down compounds. Eliminating pathogens is not mentioned as a gut bacteria function in that paragraph."),
  blankLine(),

  qLine("3", "What is the 'gut-brain axis' as described in paragraph 3?"),
  answerBox("Answer", "The gut-brain axis refers to the bidirectional communication between the gut and the brain. The gut contains millions of nerve cells and produces most of the body's serotonin, and the composition of gut bacteria has been linked to mood-related conditions such as depression and anxiety."),
  blankLine(),

  qLine("4", "Which finding most directly supports the idea that gut bacteria can influence psychological states?"),
  option("A", "The gut contains more than 100 million nerve cells."),
  option("B", "Most of the body's serotonin is produced in the gut."),
  option("C", "Transferring gut bacteria from anxious mice to calm ones caused the calm mice to behave anxiously.", true),
  option("D", "Probiotics have been found to reduce depression symptoms in some individuals."),
  answerBox("Answer", "C — This is the most direct causal evidence: changing the bacteria directly caused a change in psychological behavior. Options A and B are mechanisms; D is correlational."),
  blankLine(),

  qLine("5", "What is the main argument of the 'hygiene hypothesis'?"),
  option("A", "Modern hygiene practices have greatly reduced the incidence of infectious disease."),
  option("B", "Children raised in clean environments develop stronger immune systems than others."),
  option("C", "Excessive cleanliness in early childhood may impair proper immune development.", true),
  option("D", "Bacteria in the environment are the primary cause of autoimmune conditions."),
  answerBox("Answer", "C — The hypothesis proposes that too much cleanliness deprives the immune system of microbial stimulation it needs to develop properly, potentially leading to allergies and autoimmune diseases."),
  blankLine(),

  qLine("6", "Which paragraph from 1–5 best supports the following case? 'A pediatric doctor notices that children on farms who regularly play in soil and interact with animals show far lower rates of asthma than urban children the same age.'"),
  answerBox("Answer", "Paragraph 4 — This matches the hygiene hypothesis evidence cited in paragraph 4: lower rates of allergic conditions in children raised on farms or in households with pets, compared to highly sanitized urban environments."),
  blankLine(),

  qLine("7", "According to the text, in what way has antibiotic overuse harmed the microbiome?"),
  answerBox("Answer", "Overuse of antibiotics kills beneficial bacteria alongside harmful ones, disrupting the balance of the gut ecosystem and reducing microbial diversity."),
  blankLine(),

  qLine("8", "What CANNOT be inferred from paragraph 5?"),
  option("A", "Antibiotics used in livestock farming may affect the human microbiome."),
  option("B", "Babies born via cesarean section may have less diverse gut microbiomes."),
  option("C", "Fecal microbiota transplantation is a widely available standard treatment in most hospitals.", true),
  option("D", "Diet can play a role in restoring or disrupting the balance of gut bacteria."),
  answerBox("Answer", "C — FMT is described as something researchers are 'investigating' — meaning it is still experimental, not a widely available standard treatment. The text does not support that claim."),
  blankLine(),

  qLine("9", "SUMMARY — Fill in the blanks using words from the box."),
  italicPara("diversity / gut-brain axis / pathogens / immune / probiotics / microbiome / serotonin / fiber"),
  body("Once viewed simply as (1)__________________, the microorganisms living in the human body are now recognized as essential contributors to health. The (2)__________________ helps process (3)__________________, produces vitamins, and interacts with the brain through a relationship called the (4)__________________. Much of the body's (5)__________________ is produced in the gut. The microbiome also trains the (6)__________________ system from early infancy. Modern threats to microbial (7)__________________ include antibiotic overuse and processed diets. Treatments such as (8)__________________ therapies are currently being explored as potential solutions."),
  answerBox("1.", "pathogens"),
  answerBox("2.", "microbiome"),
  answerBox("3.", "fiber"),
  answerBox("4.", "gut-brain axis"),
  answerBox("5.", "serotonin"),
  answerBox("6.", "immune"),
  answerBox("7.", "diversity"),
  answerBox("8.", "probiotics"),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 6: DARK TOURISM
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 6, "DARK TOURISM: VISITING SITES OF TRAGEDY"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. Would you visit a site where a historical tragedy occurred, such as a prison, a battlefield, or a memorial? Why or why not?"),
  body("2. Do you think there is a difference between learning about tragedies and treating them as tourist attractions?"),
  blankLine(),
  bodyBold("Vocabulary: Match the words with their definitions."),
  vocabTable([
    ["1. commemorate (v.)", "a. to raise a serious moral question about"],
    ["2. exploitation (n.)", "b. the use of something for personal benefit in an unfair way"],
    ["3. commodification (n.)", "c. to honor or remember an event or person"],
    ["4. ethical (adj.)", "d. the process of turning something into a product to be sold"],
    ["5. implicate (v.)", "e. relating to moral principles of right and wrong"],
  ]),
  blankLine(),
  bodyBold("Vocabulary Answer Key:"),
  answerBox("1.", "c — to honor or remember an event or person"),
  answerBox("2.", "b — the use of something for personal benefit in an unfair way"),
  answerBox("3.", "d — the process of turning something into a product to be sold"),
  answerBox("4.", "e — relating to moral principles of right and wrong"),
  answerBox("5.", "a — to raise a serious moral question about"),
  blankLine(), divider(),
  bodyBold("DARK TOURISM: VISITING SITES OF TRAGEDY"),
  blankLine(),
  bodyBold("What Is Dark Tourism?"),
  paraNum("1", "Each year, millions of people visit places associated with death, suffering, and disaster — from Auschwitz concentration camp in Poland to Chernobyl in Ukraine, from Ground Zero in New York to the killing fields of Cambodia. This phenomenon has come to be known as 'dark tourism,' a term coined by researchers John Lennon and Malcolm Foley in their 1996 study. Though the idea of seeking out places of tragedy might seem morbid, scholars argue that the motivations of dark tourists are rarely straightforward — and almost never ghoulish. People visit these sites to learn, to pay respect, to grieve, to reflect on the fragility of human life, or simply to connect with a history they have only read about in books."),
  bodyBold("A Long History"),
  paraNum("2", "Dark tourism is not a modern invention. Pilgrimages to the sites of saints' deaths, public executions in medieval town squares, and battlefield tours following the Napoleonic Wars all represent early forms of what we now call dark tourism. What distinguishes contemporary dark tourism is scale and accessibility: the rise of affordable air travel and the internet has made it possible for millions of people to visit sites that were once remote or unknown. The commercialization that has accompanied this growth, however, has generated considerable controversy. When a site of mass tragedy becomes a heavily marketed tourist destination with gift shops, paid-for photographs, and online booking systems, legitimate questions arise about the line between commemoration and exploitation."),
  bodyBold("Who Visits — and Why?"),
  paraNum("3", "Research into the demographics and motivations of dark tourists has produced complex and sometimes surprising results. Studies consistently show that dark tourists are, on average, more educated than the general tourist population and that educational motivation is the most commonly cited reason for visiting. Many visitors report feeling that physical presence at a site conveys historical reality in a way that books or documentaries cannot. Survivors, descendants of victims, and members of communities affected by past events also form a significant portion of visitors to sites such as Auschwitz or Hiroshima — for these individuals, the visit is explicitly memorial rather than touristic in nature. However, research also identifies a smaller segment of visitors drawn by what scholars call 'morbid curiosity,' a fascination with death and disaster that is not primarily educational."),
  bodyBold("The Ethics of Dark Tourism"),
  paraNum("4", "Perhaps the most debated aspect of dark tourism is its ethics. Critics argue that transforming sites of mass suffering into consumer experiences risks trivializing the events that took place there and commodifying human pain for profit. The proliferation of selfie-taking at sites such as Auschwitz and the sale of merchandise connected to historical atrocities have provoked particular outrage. (A) Site managers and scholars have increasingly developed codes of conduct for visitors, emphasizing respectful behavior, silence in certain areas, and the prohibition of photographs in others. (B) Proponents of dark tourism counter that these sites already exist and would deteriorate without the revenue that visitor numbers generate. (C) They also argue that witnessing places of tragedy fosters empathy, prevents the fading of historical memory, and may even contribute to conflict prevention. (D) The question, then, is not whether dark tourism should exist but how it should be managed."),
  bodyBold("A Site's Perspective"),
  paraNum("5", "The perspective of local communities surrounding dark tourism sites is often overlooked in academic debates. In Cambodia, many residents living near the Khmer Rouge killing fields have mixed feelings about the tourism that has developed around these sites. On one hand, the sites bring income to local guides, businesses, and cultural institutions. On the other hand, many survivors and their descendants feel discomfort at the sight of foreign visitors photographing mass graves with expressions of curiosity or excitement. Similar tensions exist near Ground Zero in New York, where some residents and victims' families have objected to what they perceive as the over-commercialization of a site of national grief. These perspectives suggest that the ethical dimensions of dark tourism cannot be resolved through academic debate alone — they require ongoing dialogue with the communities most directly affected."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "What is the primary purpose of paragraph 1?"),
  option("A", "To argue that dark tourism is a harmful and disrespectful practice"),
  option("B", "To define dark tourism and present the range of motivations behind it", true),
  option("C", "To demonstrate how dark tourism has grown in scale and popularity"),
  option("D", "To introduce a debate about the commercialization of historical tragedies"),
  answerBox("Answer", "B — Paragraph 1 defines dark tourism, gives examples of its sites, names those who coined the term, and discusses the variety of visitor motivations."),
  blankLine(),

  qLine("2", "According to paragraph 2, what distinguishes contemporary dark tourism from earlier forms?"),
  answerBox("Answer", "Contemporary dark tourism is distinguished by its scale and accessibility, made possible by affordable air travel and the internet, which allow millions of people to visit sites that were once remote or unknown. Earlier forms (like pilgrimage or battlefield tours) existed but were far less accessible."),
  blankLine(),

  qLine("3", "Which of the following is NOT mentioned in paragraph 3 as a reason people visit dark tourism sites?"),
  option("A", "To gain a sense of historical reality through physical presence"),
  option("B", "To participate in commemorating the deaths of victims"),
  option("C", "To satisfy a fascination with death and disaster"),
  option("D", "To experience the thrilling and exciting atmosphere of the site", true),
  answerBox("Answer", "D — 'Thrilling and exciting atmosphere' is not mentioned. The text mentions education, memorial purposes, and morbid curiosity — but not entertainment in a thrill-seeking sense."),
  blankLine(),

  qLine("4", "There is a missing sentence in paragraph 4. Where does the following sentence best fit? 'The ethical debate is further complicated by the fact that many of these sites rely on admission fees and donations to fund their preservation.' Write A, B, C, or D."),
  answerBox("Answer", "C — It fits logically between the statement that proponents say sites would deteriorate without visitor revenue (C) and the broader argument that dark tourism fosters empathy (D). The sentence develops the financial sustainability argument."),
  blankLine(),

  qLine("5", "What does the word 'commodifying' mean as used in paragraph 4?"),
  option("A", "Destroying the historical value of an event for future generations"),
  option("B", "Turning human suffering into a product to be sold or consumed for profit", true),
  option("C", "Refusing to acknowledge the suffering of victims of historical atrocities"),
  option("D", "Creating physical memorials to preserve the memory of tragic events"),
  answerBox("Answer", "B — Commodification means converting something into a commercial product. In the context of the paragraph, it refers to turning mass suffering into a consumer experience for profit."),
  blankLine(),

  qLine("6", "How does paragraph 5 relate to paragraphs 3 and 4?"),
  option("A", "It introduces additional statistical data about dark tourist demographics."),
  option("B", "It adds the overlooked perspective of communities affected by dark tourism sites.", true),
  option("C", "It summarizes the ethical arguments presented in paragraphs 3 and 4."),
  option("D", "It provides historical examples that support the arguments made in paragraph 4."),
  answerBox("Answer", "B — Paragraphs 3 and 4 discuss tourists and scholars. Paragraph 5 explicitly says the perspective of local communities is 'often overlooked' and then presents their complex and ambivalent views."),
  blankLine(),

  qLine("7", "According to paragraph 5, what specifically makes survivors and victims' descendants uncomfortable about dark tourism at sites like the Cambodian killing fields?"),
  answerBox("Answer", "Survivors and their descendants feel discomfort when foreign visitors photograph mass graves with expressions of curiosity or excitement — a reaction that may appear disrespectful or voyeuristic to those with personal connections to the tragedies."),
  blankLine(),

  qLine("8", "What CANNOT be inferred from the text as a whole?"),
  option("A", "Educational motivation is the primary driver of most visits to dark tourism sites."),
  option("B", "Revenue from dark tourism can fund the preservation of historical sites."),
  option("C", "Codes of conduct at dark tourism sites have successfully eliminated disrespectful behavior.", true),
  option("D", "The growth of dark tourism has been facilitated by modern technology and transport."),
  answerBox("Answer", "C — The text mentions that codes of conduct have been developed, but it does not state they have been successful or that disrespectful behavior (such as selfie-taking) has been eliminated."),
  blankLine(),

  qLine("9", "Which paragraph from 1–5 best supports the following case? 'A museum near a former slave plantation charges admission and sells replica plantation-era items in its gift shop. Some descendants of enslaved people have protested outside, calling the gift shop disrespectful. The museum director responds that without revenue, the site could not be maintained.'"),
  answerBox("Answer", "Paragraph 4 — This case directly illustrates the ethical tension in paragraph 4: commodification of historical suffering (gift shop sales), protest about disrespect (echoing criticism of Auschwitz merchandise), and the counter-argument that revenue is necessary for site preservation."),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 7: THE GLOBAL WATER CRISIS
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 7, "THE GLOBAL WATER CRISIS"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. Do you think about water conservation in your daily life? What habits do you have?"),
  body("2. Which parts of the world do you think are most affected by water scarcity? Why?"),
  blankLine(),
  bodyBold("Vocabulary: Fill in the blanks with the correct word."),
  italicPara("scarcity / desalination / aquifer / contamination / sanitation"),
  body("1. The __________________ of the river with industrial chemicals made the water unsafe to drink."),
  body("2. Countries in the Middle East rely heavily on __________________ to convert seawater into drinking water."),
  body("3. Poor __________________ infrastructure has contributed to outbreaks of waterborne diseases in the region."),
  body("4. Underground water reserves stored in rock formations are called __________________(s)."),
  body("5. Many experts predict that water __________________ will be the defining environmental crisis of the 21st century."),
  blankLine(),
  bodyBold("Vocabulary Answer Key:"),
  answerBox("1.", "contamination"),
  answerBox("2.", "desalination"),
  answerBox("3.", "sanitation"),
  answerBox("4.", "aquifer"),
  answerBox("5.", "scarcity"),
  blankLine(), divider(),
  bodyBold("THE GLOBAL WATER CRISIS"),
  blankLine(),
  paraNum("1", "Water covers more than 70 percent of the Earth's surface, yet access to safe, clean freshwater remains one of the most pressing challenges of the 21st century. Of all the water on the planet, only about 2.5 percent is freshwater, and the vast majority of that is locked in glaciers and polar ice caps. Less than 1 percent of the world's water is accessible for human use. According to the United Nations, approximately 2.2 billion people currently lack access to safely managed drinking water, and around 4.2 billion people — more than half the global population — lack access to safely managed sanitation. These figures are not static: as global populations grow, as climate change alters precipitation patterns, and as agricultural and industrial demand intensifies, competition for freshwater resources is expected to become more acute."),
  bodyBold("Causes of the Crisis"),
  paraNum("2", "The global water crisis is not caused by a single factor but by the interaction of several converging trends. Population growth is perhaps the most straightforward: more people require more water for drinking, cooking, hygiene, and agricultural production. Agriculture alone accounts for approximately 70 percent of global freshwater withdrawals, largely because of the enormous quantities of water required to grow crops and raise livestock. Climate change is adding additional pressure by disrupting the hydrological cycle — altering where and when rain falls, accelerating glacier retreat, and increasing the frequency and severity of droughts. Groundwater depletion presents another serious challenge: across the world, aquifers that took thousands of years to fill are being pumped dry in decades, with no realistic prospect of replenishment in any human timescale."),
  bodyBold("Unequal Access"),
  paraNum("3", "The water crisis does not affect all people equally. Geographic location is an obvious factor: regions such as sub-Saharan Africa, South Asia, and the Middle East face the most severe shortfalls. But within any given country, water insecurity tends to follow the contours of poverty. In many developing nations, wealthier urban residents enjoy reliable piped water, while rural and peri-urban populations — disproportionately women and girls, who are traditionally responsible for water collection — spend hours each day walking to collect water from distant or contaminated sources. The health consequences are severe: waterborne diseases such as cholera, typhoid, and dysentery kill hundreds of thousands of people annually, the overwhelming majority of whom are children under five in low-income countries."),
  bodyBold("Geopolitical Dimensions"),
  paraNum("4", "Water scarcity increasingly has geopolitical consequences. Many of the world's major rivers — including the Nile, the Mekong, and the Tigris and Euphrates — flow across international borders, making water a source of diplomatic tension and, in some cases, conflict. The Grand Ethiopian Renaissance Dam on the Nile, for example, has become a major point of contention between Ethiopia, which sees it as essential for development and electricity generation, and downstream Egypt and Sudan, which fear its impact on the flow of the river on which their agriculture depends. International frameworks for managing shared water resources remain inadequate, and as water becomes scarcer, these tensions are likely to intensify."),
  bodyBold("Potential Solutions"),
  paraNum("5", "Addressing the global water crisis requires action on multiple fronts. Improving water-use efficiency in agriculture — through drip irrigation, drought-resistant crops, and better soil management — could significantly reduce demand without compromising food security. Investment in sanitation infrastructure and the treatment and reuse of wastewater represent enormous untapped opportunities. Desalination technology, which converts seawater into freshwater, has become increasingly affordable and is now a significant source of drinking water in water-scarce countries such as Israel and Saudi Arabia, though its high energy costs and the environmental challenges posed by the disposal of brine waste remain concerns. Perhaps most importantly, addressing the water crisis requires confronting the underlying inequalities that determine who has access to safe water and who does not — a challenge that is as political as it is technical."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "What is the primary purpose of paragraph 1?"),
  option("A", "To argue that the Earth's water supply is sufficient for current needs"),
  option("B", "To establish the scale of the global water crisis using statistics", true),
  option("C", "To explain why most of the Earth's water is found in oceans"),
  option("D", "To introduce the political causes of global water inequality"),
  answerBox("Answer", "B — Paragraph 1 opens with a paradox (water covers 70% of the Earth but is scarce), then presents figures on the inaccessibility of freshwater and the number of people currently without safe water access."),
  blankLine(),

  qLine("2", "According to paragraph 2, which uses the largest share of global freshwater?"),
  answerBox("Answer", "Agriculture — it accounts for approximately 70 percent of global freshwater withdrawals, due to the large amounts of water needed for crop production and livestock."),
  blankLine(),

  qLine("3", "Which of the following is NOT stated as a consequence of climate change in paragraph 2?"),
  option("A", "Changes in when and where rainfall occurs"),
  option("B", "The accelerating retreat of glaciers"),
  option("C", "More frequent and severe droughts"),
  option("D", "A global decrease in total ocean water volume", true),
  answerBox("Answer", "D — The paragraph discusses the disruption of the hydrological cycle, glacier retreat, and droughts. A decrease in ocean water volume is not mentioned."),
  blankLine(),

  qLine("4", "How does paragraph 3 relate to paragraph 2?"),
  option("A", "It provides historical background for the causes described in paragraph 2."),
  option("B", "It shifts from describing general causes to showing how the crisis affects people unequally.", true),
  option("C", "It introduces additional causes of the water crisis not covered in paragraph 2."),
  option("D", "It argues that the causes in paragraph 2 are less important than political factors."),
  answerBox("Answer", "B — Paragraph 2 explains what causes the crisis; paragraph 3 narrows the focus to how its effects are distributed unequally across geography, income, and gender."),
  blankLine(),

  qLine("5", "According to paragraph 3, why are women and girls disproportionately affected by water insecurity in developing nations?"),
  answerBox("Answer", "In many developing nations, women and girls are traditionally responsible for water collection. This means they must spend hours each day walking to collect water from distant or contaminated sources, taking time away from education, work, and other activities."),
  blankLine(),

  qLine("6", "What does the conflict over the Grand Ethiopian Renaissance Dam illustrate, according to paragraph 4?"),
  answerBox("Answer", "It illustrates that water from shared international rivers can become a source of serious geopolitical tension and conflict. Ethiopia prioritizes the dam for development and electricity; Egypt and Sudan fear it will reduce the water flow they depend on for agriculture."),
  blankLine(),

  qLine("7", "Which word in paragraph 4 means 'a subject of dispute or argument'?"),
  answerBox("Answer", "'contention' — 'The Grand Ethiopian Renaissance Dam has become a major point of contention.'"),
  blankLine(),

  qLine("8", "According to paragraph 5, what are two concerns about desalination as a solution to water scarcity?"),
  answerBox("Answer", "1. High energy costs — desalination requires large amounts of energy, making it expensive to run. 2. Environmental challenges from brine waste disposal — the salty by-product of the desalination process poses environmental risks."),
  blankLine(),

  qLine("9", "What CANNOT be inferred from the text as a whole?"),
  option("A", "The water crisis affects poorer populations more severely than wealthier ones."),
  option("B", "Improving agricultural water efficiency could reduce demand without harming food production."),
  option("C", "Desalination is currently too expensive to be used in any country on a large scale.", true),
  option("D", "International agreements for managing shared rivers are currently insufficient."),
  answerBox("Answer", "C — The text says desalination 'has become increasingly affordable' and is 'a significant source of drinking water in water-scarce countries such as Israel and Saudi Arabia.' The claim in option C directly contradicts this."),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 8: ARTIFICIAL INTELLIGENCE AND THE FUTURE OF WORK
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 8, "ARTIFICIAL INTELLIGENCE AND THE FUTURE OF WORK"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. Do you think artificial intelligence will create more jobs or eliminate more jobs in the next 20 years? Why?"),
  body("2. Are there any jobs you believe could never be replaced by a machine? What makes them unique?"),
  blankLine(),
  bodyBold("ARTIFICIAL INTELLIGENCE AND THE FUTURE OF WORK"),
  blankLine(),
  bodyBold("A Shifting Landscape"),
  paraNum("1", "Automation has reshaped the economy before. The industrial revolution replaced artisans with machines; the mechanization of agriculture displaced millions of farm laborers; the spread of computers in the late 20th century transformed office work beyond recognition. Each of these transitions produced short-term disruption and long-term structural change, and each generated its own wave of anxiety about the future of human employment. The emergence of modern artificial intelligence — capable of performing not just routine physical and clerical tasks but complex cognitive work such as image recognition, legal analysis, medical diagnosis, and creative content generation — has reawakened this anxiety with unprecedented intensity."),
  bodyBold("What AI Does Well"),
  paraNum("2", "Current AI systems excel at a specific set of tasks. They are extraordinarily good at recognizing patterns in large datasets — far faster and more accurately than any human. This capability makes them highly effective at a wide range of applications: diagnosing diseases from medical images, detecting fraud in financial transactions, filtering spam, translating languages, and generating text that is indistinguishable from that produced by a human writer. They are also effective at optimization — finding the most efficient solution to a well-defined problem — which makes them valuable in logistics, manufacturing scheduling, and resource allocation. Critically, these capabilities are not limited to manual or low-skill work: many high-skill, well-paid professional tasks are also vulnerable to automation."),
  bodyBold("What AI Does Less Well"),
  paraNum("3", "Despite these capabilities, current AI systems have significant limitations. They struggle with tasks that require genuine common-sense reasoning, physical dexterity in complex and unpredictable environments, deep empathy, and ethical judgment. Jobs that combine these qualities — skilled trades such as plumbing, electrical work, and surgery; care-based professions such as nursing, social work, and early childhood education; and roles requiring creative leadership and interpersonal trust — have proven more resilient to automation than many economists initially predicted. AI systems are also brittle in the face of novelty: they perform well within the boundaries of the data they were trained on but can fail unpredictably when confronted with genuinely new situations."),
  bodyBold("Distributional Effects"),
  paraNum("4", "The economic impact of AI-driven automation is unlikely to be evenly distributed. Research by economists Daron Acemoglu and Pascual Restrepo suggests that the adoption of industrial robots has depressed wages and employment for workers in affected industries, with limited evidence of compensating job creation in other sectors. Workers without post-secondary education — those most likely to hold automatable jobs — face the greatest risk of displacement. Geographically, regions whose economies depend heavily on manufacturing and routine service work face more severe impacts than economically diverse urban centers. These distributional effects raise serious concerns about widening inequality, as the gains from automation accrue primarily to the owners of capital and to highly skilled workers whose expertise complements AI, while the costs fall disproportionately on those with the least capacity to adapt."),
  bodyBold("Responses and Responsibilities"),
  paraNum("5", "There is no consensus on how best to respond to the challenges posed by AI-driven automation. Some economists and technologists are optimistic: they argue that, as in previous technological transitions, new forms of work will emerge to replace those lost, and that the net effect of AI on employment will be positive. Others are more skeptical, pointing out that the pace of this transition may outstrip the ability of educational systems and labor markets to adapt. Policy proposals range from investment in education, retraining programs, and lifelong learning infrastructure, to more radical ideas such as robot taxes — levies on the use of automation that would fund social support systems — and universal basic income schemes that would provide all citizens with a minimum income regardless of employment status. What seems clear is that the social consequences of AI-driven automation will be shaped not only by the technology itself, but by the political choices societies make about how to manage and distribute its effects."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "What is the primary purpose of paragraph 1?"),
  option("A", "To argue that AI is fundamentally different from all previous forms of automation"),
  option("B", "To explain why the industrial revolution caused long-term unemployment"),
  option("C", "To place AI-driven automation in the context of historical economic transitions", true),
  option("D", "To present AI as a solution to the problems created by industrial mechanization"),
  answerBox("Answer", "C — Paragraph 1 traces previous automation waves (industrial revolution, agriculture, computers) to frame AI as the latest in a series of transformative technologies, contextualizing current anxiety."),
  blankLine(),

  qLine("2", "According to paragraph 2, which of the following is NOT listed as a current application of AI?"),
  option("A", "Detecting fraudulent financial transactions"),
  option("B", "Generating text similar to that written by humans"),
  option("C", "Designing new drugs through chemical simulation", true),
  option("D", "Translating content from one language to another"),
  answerBox("Answer", "C — Drug design through chemical simulation is not mentioned in paragraph 2. The paragraph lists fraud detection, language translation, text generation, and medical image analysis among its examples."),
  blankLine(),

  qLine("3", "According to paragraph 3, what characteristics make certain jobs more resilient to automation?"),
  answerBox("Answer", "Jobs requiring genuine common-sense reasoning, physical dexterity in complex/unpredictable environments, deep empathy, ethical judgment, and interpersonal trust have proven more resilient. AI systems struggle with novelty and real-world complexity, making such jobs harder to automate."),
  blankLine(),

  qLine("4", "What does the phrase 'brittle in the face of novelty' mean as used in paragraph 3?"),
  option("A", "AI systems become outdated very quickly as new models are released"),
  option("B", "AI performs well within its training data but fails unpredictably in genuinely new situations", true),
  option("C", "AI systems are too fragile to be used in professional work environments"),
  option("D", "AI struggles to process creative and artistic content effectively"),
  answerBox("Answer", "B — 'Brittle' here means likely to break down, and 'novelty' means new, unfamiliar situations. The sentence explains: 'they perform well within the boundaries of the data they were trained on but can fail unpredictably when confronted with genuinely new situations.'"),
  blankLine(),

  qLine("5", "According to paragraph 4, who benefits most from AI-driven automation and who bears the greatest cost?"),
  answerBox("Answer", "The gains primarily accrue to owners of capital and highly skilled workers whose expertise complements AI. The costs fall disproportionately on workers without post-secondary education in automatable jobs, particularly in manufacturing and routine service industries."),
  blankLine(),

  qLine("6", "How does paragraph 4 relate to paragraph 3?"),
  option("A", "It provides historical evidence for the limitations of AI described in paragraph 3."),
  option("B", "It introduces a new set of AI capabilities not discussed in paragraphs 2 and 3."),
  option("C", "It shifts from discussing which jobs are at risk to exploring who will be most economically harmed.", true),
  option("D", "It challenges the argument in paragraph 3 by showing that AI has overcome its limitations."),
  answerBox("Answer", "C — Paragraph 3 identifies which types of jobs are more or less vulnerable. Paragraph 4 shifts to examining who — which workers, which regions — will bear the economic costs."),
  blankLine(),

  qLine("7", "What is a 'robot tax' as described in paragraph 5?"),
  answerBox("Answer", "A robot tax is a proposed levy (charge) on the use of automation by companies. The revenue generated would be used to fund social support systems to help workers displaced by automation."),
  blankLine(),

  qLine("8", "What CANNOT be inferred from the text as a whole?"),
  option("A", "The impact of AI automation will vary significantly by industry, education level, and geography."),
  option("B", "AI systems currently lack the ability to fully replicate human empathy and ethical reasoning."),
  option("C", "A universal basic income scheme has been successfully implemented and proven effective in multiple countries.", true),
  option("D", "Whether AI creates net job gains or losses is still a matter of significant debate among economists."),
  answerBox("Answer", "C — The text presents UBI as a 'proposal' — it does not state that it has been successfully implemented or proven effective anywhere. This claim goes far beyond what the text supports."),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 9: FOOD SECURITY AND CLIMATE CHANGE
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 9, "FOOD SECURITY AND CLIMATE CHANGE"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. How do you think changes in weather patterns could affect the food you eat? Have you noticed any changes in food prices recently?"),
  body("2. Which regions of the world do you think are most vulnerable to disruptions in food supply? Why?"),
  blankLine(),
  bodyBold("FOOD SECURITY AND CLIMATE CHANGE"),
  blankLine(),
  bodyBold("A Threatened System"),
  paraNum("1", "Global food security — the ability of all people at all times to access sufficient, safe, and nutritious food — rests on an agricultural system that is highly sensitive to climate conditions. Temperature, rainfall, soil moisture, and the frequency of extreme weather events all directly influence crop yields and livestock production. As climate change intensifies, altering these variables in ways that are both gradual and increasingly unpredictable, the agricultural systems on which billions of people depend face a range of interconnected challenges. The consequences are not distributed equally: the regions most vulnerable to climate-driven disruptions in food production are often the same regions that are already most food insecure and least equipped to adapt."),
  bodyBold("How Climate Change Affects Crops"),
  paraNum("2", "The relationship between temperature and crop yields is not simple. For some crops and in some regions, moderate warming may initially improve growing conditions — extending frost-free growing seasons in higher latitudes, for instance. However, the overall trend projected by agricultural scientists is deeply concerning. Research suggests that for every degree Celsius of warming beyond current temperatures, yields of major staple crops such as wheat, rice, and maize may decline by between 3 and 10 percent. Higher temperatures also increase rates of evaporation and crop water stress, making irrigation more necessary precisely in regions where water is already scarce. Meanwhile, elevated atmospheric carbon dioxide — the primary driver of warming — has a complex relationship with plant growth: while higher CO2 levels can stimulate plant growth under controlled conditions, field studies suggest the benefit is far smaller than laboratory experiments implied, and that increased CO2 also reduces the protein content of some staple crops."),
  bodyBold("Extreme Weather and Supply Chains"),
  paraNum("3", "Beyond gradual warming, the increasing frequency and severity of extreme weather events — droughts, floods, heatwaves, and storms — poses immediate and acute risks to food production. A single severe drought can devastate a regional harvest; flooding can destroy crops, contaminate water supplies, and damage transport infrastructure in ways that take years to repair. In 2010–2011, a combination of drought in Russia and floods in Australia and Pakistan contributed to a global spike in wheat prices that was linked to food insecurity and political instability across North Africa and the Middle East. Importantly, as supply chains have become more globally integrated, shocks in one region increasingly transmit rapidly to global food prices, meaning that a harvest failure in a major exporting country can affect food affordability in countries thousands of miles away."),
  bodyBold("Who Is Most Vulnerable?"),
  paraNum("4", "Vulnerability to climate-driven food insecurity is shaped by a combination of geographic, economic, and political factors. Smallholder farmers in tropical and subtropical regions — who produce much of the food consumed in developing nations — are especially exposed, as these regions are projected to experience the most severe warming and changes in precipitation. Countries that are heavily dependent on food imports and lack the foreign exchange reserves to manage price volatility face particular risks. Urban populations in developing countries, who may spend 50 to 80 percent of their income on food, are disproportionately affected by price spikes caused by supply disruptions. In contrast, wealthier countries and wealthier households within all countries have greater capacity to absorb higher food prices and to shift to alternative food sources."),
  bodyBold("Adapting the Food System"),
  paraNum("5", "Responding to the threat of climate-driven food insecurity requires simultaneous action on multiple fronts. In the short term, strengthening social protection systems — food subsidies, cash transfers, and nutritional programs — can help the most vulnerable households weather supply disruptions. Over the longer term, investment in climate-resilient agriculture is essential: developing and disseminating drought-resistant crop varieties, improving water management, restoring degraded soils, and diversifying agricultural systems to reduce dependence on a small number of vulnerable staple crops. Reducing food loss and waste — currently estimated at around one third of global food production — represents another major opportunity. Ultimately, however, addressing food insecurity also requires addressing climate change itself: without significant reductions in greenhouse gas emissions, the adaptive measures available to agricultural systems will be progressively overwhelmed by the scale of climate disruption."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "According to paragraph 1, what factors make certain regions more vulnerable to food insecurity caused by climate change?"),
  answerBox("Answer", "The most vulnerable regions are those that are already food insecure and least equipped to adapt — which often overlap with regions where climate-driven disruptions to food production are projected to be most severe."),
  blankLine(),

  qLine("2", "Which of the following is NOT mentioned as an effect of higher atmospheric CO2 on crops?"),
  option("A", "Stimulating plant growth under controlled conditions"),
  option("B", "Reducing the protein content of some staple crops"),
  option("C", "Increasing the rate at which insects damage crops", true),
  option("D", "Producing smaller growth benefits in real fields than in laboratory experiments"),
  answerBox("Answer", "C — Increased insect damage is not mentioned in paragraph 2. The text discusses growth stimulation, reduced protein content, and the discrepancy between lab and field results."),
  blankLine(),

  qLine("3", "How does paragraph 3 relate to paragraph 2?"),
  option("A", "It challenges the argument in paragraph 2 by providing contradictory evidence."),
  option("B", "It shifts from describing gradual climate effects on crops to the immediate risks of extreme weather.", true),
  option("C", "It provides data that proves the warming projections in paragraph 2 are underestimated."),
  option("D", "It introduces the role of global food trade as an additional cause of food insecurity."),
  answerBox("Answer", "B — Paragraph 2 focuses on the gradual effects of warming on crop yields. Paragraph 3 shifts to sudden, extreme weather events and their more acute and immediate impacts."),
  blankLine(),

  qLine("4", "According to paragraph 3, how has global supply chain integration worsened the impact of regional crop failures?"),
  answerBox("Answer", "Because supply chains are now globally integrated, a harvest failure in one major exporting country can rapidly transmit to global food prices, affecting food affordability in countries thousands of miles away from the original disruption."),
  blankLine(),

  qLine("5", "There is a missing sentence in paragraph 4. Where does the following sentence best fit? 'In some cases, governments have responded to domestic price pressures by banning food exports, which can further destabilize global food markets.' Write A, B, C, or D."),
  body("(A) Vulnerability to climate-driven food insecurity is shaped by a combination of geographic, economic, and political factors. (B) Smallholder farmers in tropical and subtropical regions are especially exposed. (C) Countries heavily dependent on food imports and lacking foreign exchange face particular risks. (D) In contrast, wealthier countries and households have greater capacity to absorb higher food prices."),
  answerBox("Answer", "C — The sentence about export bans logically follows the point about countries dependent on food imports, adding another dimension of risk: they not only face import vulnerability but also destabilizing policy responses from exporting nations."),
  blankLine(),

  qLine("6", "According to paragraph 4, why are urban populations in developing countries particularly affected by food supply disruptions?"),
  answerBox("Answer", "Urban populations in developing countries may spend 50 to 80 percent of their income on food, meaning that even small price spikes caused by supply disruptions represent a disproportionately large share of their budget and can quickly make food unaffordable."),
  blankLine(),

  qLine("7", "What does the phrase 'progressively overwhelmed' mean as used in paragraph 5?"),
  option("A", "Gradually replaced by more effective technologies"),
  option("B", "Increasingly unable to cope with the scale of the problem they face", true),
  option("C", "Entirely eliminated by large-scale political reform"),
  option("D", "Forcefully rejected by international organizations"),
  answerBox("Answer", "B — 'Overwhelmed' means unable to cope with; 'progressively' means gradually, over time. Together they mean that adaptive measures will become less and less effective as the scale of climate disruption grows."),
  blankLine(),

  qLine("8", "What CANNOT be inferred from the text as a whole?"),
  option("A", "Reducing food loss and waste could meaningfully reduce pressure on the global food supply."),
  option("B", "Climate change affects food security both through slow temperature increases and sudden extreme events."),
  option("C", "Drought-resistant crop varieties are already being widely distributed to smallholder farmers in tropical regions.", true),
  option("D", "Addressing climate change itself is ultimately necessary for ensuring long-term food security."),
  answerBox("Answer", "C — The text says investment in developing and disseminating drought-resistant varieties is 'essential' — implying it is a future goal, not something already happening widely. The 'already' and 'widely' in option C are not supported."),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R1 TEXT 10: THE NEUROSCIENCE OF ADDICTION
// ────────────────────────────────────────────
children.push(sectionHeader("R1", 10, "THE NEUROSCIENCE OF ADDICTION"));
children.push(
  bodyBold("Pre-Reading:"),
  body("1. How do you define addiction? Do you think it is primarily a moral failing, a disease, or something else?"),
  body("2. What kinds of things can people become addicted to, other than alcohol and drugs? Discuss."),
  blankLine(),
  bodyBold("Vocabulary: Match the words with their definitions."),
  vocabTable([
    ["1. compulsive (adj.)", "a. relating to the structure and function of the brain"],
    ["2. tolerance (n.)", "b. driven by an irresistible, repeated urge"],
    ["3. neurological (adj.)", "c. the brain's ability to change and reorganize itself"],
    ["4. neuroplasticity (n.)", "d. the need for increasing amounts of a substance to achieve the same effect"],
    ["5. relapse (v.)", "e. to return to a problematic behavior after a period of improvement"],
  ]),
  blankLine(),
  bodyBold("Vocabulary Answer Key:"),
  answerBox("1.", "b — driven by an irresistible, repeated urge"),
  answerBox("2.", "d — the need for increasing amounts of a substance to achieve the same effect"),
  answerBox("3.", "a — relating to the structure and function of the brain"),
  answerBox("4.", "c — the brain's ability to change and reorganize itself"),
  answerBox("5.", "e — to return to a problematic behavior after a period of improvement"),
  blankLine(), divider(),
  bodyBold("THE NEUROSCIENCE OF ADDICTION"),
  blankLine(),
  bodyBold("Beyond Willpower"),
  paraNum("1", "For most of the 20th century, addiction was understood primarily as a moral or social failing — a product of weak willpower, poor character, or a dysfunctional environment. This view shaped how societies responded: with punishment, shame, and social exclusion rather than medical treatment. The revolution in neuroscience over the past three decades has fundamentally challenged this framing. Advances in brain imaging technology have allowed researchers to observe what actually happens in the brains of people with addictions, revealing that addiction is a chronic brain disorder with neurological and behavioral components — and that the compulsive nature of addictive behavior reflects changes in brain structure and function, not simply a lack of moral resolve."),
  bodyBold("The Reward System"),
  paraNum("2", "At the heart of addiction is the brain's reward system — a set of structures, centered on the nucleus accumbens and connected to the prefrontal cortex, that evolved to motivate survival behaviors by associating them with feelings of pleasure. When a person eats a satisfying meal or completes a fulfilling task, the brain releases dopamine, a neurotransmitter that produces feelings of pleasure and reinforces the behavior that produced it. Addictive substances and behaviors hijack this system, triggering dopamine release at levels far beyond what natural rewards can produce. Over time, the brain adapts to these artificially high dopamine levels by reducing its natural dopamine production and the sensitivity of its dopamine receptors — a process that underlies both tolerance (needing more of the substance to achieve the same effect) and withdrawal (feeling worse than before in the substance's absence)."),
  bodyBold("Changes in Brain Structure"),
  paraNum("3", "Chronic exposure to addictive substances also produces structural changes in the brain. Research has shown that prolonged substance use weakens the connections between the prefrontal cortex — the region responsible for rational decision-making, impulse control, and the evaluation of long-term consequences — and the limbic system, which governs emotional responses and immediate desires. This weakening of top-down cognitive control explains why people with severe addictions often continue using substances even when they are fully aware of the catastrophic consequences for their health, relationships, and careers. It also explains why the cycle of relapse is so common: cravings triggered by environmental cues — particular places, people, or emotions associated with past use — can overwhelm the damaged prefrontal cortex's capacity to exert control."),
  bodyBold("Vulnerability and Risk"),
  paraNum("4", "Not everyone who uses addictive substances becomes addicted. Individual vulnerability to addiction is shaped by a complex interaction of genetic, developmental, and environmental factors. Studies of twins have established that genetic factors account for approximately 40 to 60 percent of the risk of addiction. Early exposure to trauma, neglect, or adverse childhood experiences significantly increases risk, as does early onset of substance use — the brain's prefrontal cortex is not fully developed until the mid-twenties, making adolescents particularly vulnerable to the neurological effects of substance use. Mental health conditions — particularly depression, anxiety, and post-traumatic stress disorder — are also strongly associated with addiction, partly because individuals may use substances as a form of self-medication."),
  bodyBold("Implications for Treatment"),
  paraNum("5", "Understanding addiction as a brain disorder rather than a moral failing has important implications for how it is treated. It suggests that effective treatment must address the neurological as well as the behavioral and social dimensions of the condition. Evidence-based approaches include pharmacological treatments that reduce cravings and manage withdrawal, behavioral therapies that help individuals recognize and resist triggering cues, and social support systems that reduce the isolation and environmental triggers associated with relapse. Because addiction involves lasting changes in brain structure, treatment is often a long-term process, and relapse — like the recurrence of other chronic conditions such as diabetes or hypertension — should be understood as a signal that treatment needs adjustment rather than as evidence of personal failure."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "What is the primary purpose of paragraph 1?"),
  option("A", "To argue that punishing addicts is morally wrong"),
  option("B", "To show how neuroscience has changed the understanding of addiction from a moral to a medical issue", true),
  option("C", "To explain why addiction rates have increased over the past three decades"),
  option("D", "To describe the social consequences of treating addiction as a moral failing"),
  answerBox("Answer", "B — Paragraph 1 traces the shift from viewing addiction as a moral failing to understanding it as a neurological disorder, framing the rest of the text."),
  blankLine(),

  qLine("2", "According to paragraph 2, how do addictive substances affect the brain's reward system?"),
  answerBox("Answer", "Addictive substances trigger dopamine release at levels far beyond what natural rewards produce. Over time, the brain adapts by reducing natural dopamine production and receptor sensitivity — leading to tolerance (needing more of the substance for the same effect) and withdrawal (feeling worse in its absence)."),
  blankLine(),

  qLine("3", "Which of the following best explains why people with severe addictions often continue using substances despite being aware of the consequences?"),
  option("A", "They have lost the ability to feel the negative effects of the substance."),
  option("B", "The weakening of the prefrontal cortex reduces their capacity to regulate impulses and consider long-term outcomes.", true),
  option("C", "They are unable to access information about the harmful effects of the substance."),
  option("D", "Their dopamine receptors have become so sensitive that they cannot resist any pleasurable stimulus."),
  answerBox("Answer", "B — Paragraph 3 explains that chronic use weakens prefrontal cortex connections responsible for impulse control and long-term thinking, making it neurologically difficult to resist urges even when consequences are known."),
  blankLine(),

  qLine("4", "There is a missing sentence in paragraph 3. Where does the following sentence best fit? 'This is why addiction researchers often describe relapse not as a failure of willpower but as a predictable consequence of the neurological damage the addiction has caused.' Write A, B, C, or D."),
  body("(A) Chronic exposure to addictive substances also produces structural changes in the brain. (B) Research has shown that prolonged substance use weakens the connections between the prefrontal cortex and the limbic system. (C) This weakening of top-down cognitive control explains why people with severe addictions often continue using substances even when fully aware of the consequences. (D) It also explains why the cycle of relapse is so common."),
  answerBox("Answer", "D — The sentence about how researchers describe relapse ('not as a failure of willpower') directly elaborates on and follows from the sentence that introduces relapse ('It also explains why the cycle of relapse is so common')."),
  blankLine(),

  qLine("5", "According to paragraph 4, what three factors shape individual vulnerability to addiction?"),
  answerBox("1.", "Genetic factors (accounting for 40–60% of addiction risk, established through twin studies)"),
  answerBox("2.", "Developmental and environmental factors — early trauma, neglect, adverse childhood experiences, and early-onset substance use"),
  answerBox("3.", "Mental health conditions — particularly depression, anxiety, and PTSD, often involving substance use as self-medication"),
  blankLine(),

  qLine("6", "Why are adolescents particularly vulnerable to the neurological effects of substance use, according to paragraph 4?"),
  answerBox("Answer", "The prefrontal cortex — the brain region responsible for rational decision-making and impulse control — is not fully developed until the mid-twenties. Adolescents therefore lack the fully mature cognitive brakes that could limit the neurological impact of substance use."),
  blankLine(),

  qLine("7", "What does the comparison to diabetes and hypertension in paragraph 5 suggest about relapse?"),
  answerBox("Answer", "The comparison suggests that relapse should be understood as a signal that treatment needs adjustment — not as evidence of personal failure. Just as recurrence of a chronic illness like diabetes does not mean the patient is morally at fault, relapse in addiction reflects the chronic nature of the condition rather than a failure of willpower."),
  blankLine(),

  qLine("8", "What CANNOT be inferred from the text as a whole?"),
  option("A", "Neuroimaging has provided direct evidence for structural brain changes associated with addiction."),
  option("B", "Treating addiction purely through punishment is likely to be ineffective given what neuroscience has revealed."),
  option("C", "All people who relapse after addiction treatment will ultimately fail to achieve long-term recovery.", true),
  option("D", "Social support and environmental changes are considered part of effective addiction treatment."),
  answerBox("Answer", "C — The text says relapse is common and should be treated as a sign that treatment needs adjustment — it does not say people who relapse will not recover. Option C is an unwarranted and pessimistic extrapolation."),
  pageBreakPara()
);

// ══════════════════════════════════════════════
// READING 2 TEXTS
// ══════════════════════════════════════════════

children.push(
  new Paragraph({
    children: [new TextRun({ text: "READING 2 — TEXTS 1–10", bold: true, size: 40, color: "7B3FA3", font: "Arial" })],
    alignment: AlignmentType.CENTER,
    spacing: sp(10, 10),
    shading: { fill: "EDE0F8", type: ShadingType.CLEAR },
  }),
  blankLine()
);

// ────────────────────────────────────────────
// R2 TEXT 1: THE SCIENCE OF BOREDOM
// ────────────────────────────────────────────
children.push(sectionHeader("R2", 1, "THE SCIENCE OF BOREDOM"));
children.push(
  bodyBold("THE SCIENCE OF BOREDOM"),
  blankLine(),
  paraNum("1", "Boredom has long been dismissed as a trivial emotional state — the minor irritation of a restless mind with nothing to do. In recent years, however, psychologists and neuroscientists have begun to study it more seriously, revealing it to be a remarkably complex and consequential experience. Boredom is now understood not merely as the absence of stimulation, but as an active state in which the mind is searching for meaning and engagement it cannot find. This distinction matters because it shifts the question from 'How do we stop being bored?' to 'What is boredom trying to tell us?'"),
  paraNum("2", "Research has established a useful distinction between two forms of boredom: state boredom and trait boredom. State boredom is situational — it arises from a specific environment or task that offers insufficient stimulation, and it passes when the situation changes. Trait boredom, on the other hand, is a relatively stable personality characteristic: some individuals are chronically prone to boredom regardless of their circumstances. These individuals report lower life satisfaction, are more likely to engage in risk-taking behavior, and are at greater risk of depression and substance abuse than those who rarely experience boredom. However, researchers caution that the relationship may be mediated by third factors such as difficulty with self-regulation."),
  paraNum("3", "One of the more counterintuitive findings in boredom research is that boredom may have significant creative benefits. Studies by Sandi Mann and Rebekah Cadman found that participants who performed a boring task — copying out a phone book — subsequently showed greater creativity on divergent thinking tasks than a control group. The researchers proposed that boredom triggers the mind to wander in search of stimulation, and that mind-wandering activates what neuroscientists call the 'default mode network' — brain regions associated with daydreaming, imagination, and loose associative thinking underlying creativity. This suggests that immediately reaching for a phone at the first sign of boredom may be counterproductive, effectively short-circuiting a mental process with real cognitive value."),
  paraNum("4", "Despite its potential benefits, chronic boredom has serious negative consequences. Studies have linked it to overeating, excessive social media use, impulsive spending, and aggressive behavior. In occupational settings, boredom at work — sometimes called 'boreout,' in contrast to 'burnout' — leads to disengagement, absenteeism, and reduced productivity. Importantly, workplace boredom does not stem exclusively from tasks that are too simple; it can also arise when tasks are too complex and overwhelming, when workers lack clear goals, or when they feel their skills are being wasted. This complexity means that solutions must be more sophisticated than simply making jobs more challenging."),
  paraNum("5", "Perhaps the most philosophically interesting question raised by boredom research is what boredom reveals about the human need for meaning. Existentialist philosophers such as Martin Heidegger argued that profound boredom — the kind that strips away all distractions — forces the question of what one genuinely values. Modern psychologists have found empirical support for this view: studies show that individuals who tend to experience boredom as deeply aversive also score lower on measures of meaning in life and are more likely to describe their existence as purposeless. In this sense, boredom may function as an emotional signal — not simply an unpleasant state to be escaped, but a prompt to examine whether one's life is genuinely aligned with one's values."),
  blankLine(), divider(),
  bodyBold("QUESTIONS"),
  blankLine(),

  qLine("1", "According to paragraph 1, how has the scientific understanding of boredom changed in recent years?"),
  answerBox("Answer", "Boredom was previously dismissed as trivial — the absence of stimulation. Recent research has revealed it to be a complex, active state in which the mind searches for meaning and engagement it cannot find, raising deeper questions about what boredom signals."),
  blankLine(),

  qLine("2", "From paragraph 2, we can understand that people with trait boredom"),
  option("A", "are bored only in specific, under-stimulating situations"),
  option("B", "are bored regardless of their environment and tend to have lower life satisfaction", true),
  option("C", "are more creative than people who rarely experience boredom"),
  option("D", "become bored only when they face complex and overwhelming tasks"),
  answerBox("Answer", "B — Trait boredom is defined as a 'stable personality characteristic' that occurs regardless of circumstances, and the text states these individuals 'report lower life satisfaction.'"),
  blankLine(),

  qLine("3", "Considering paragraph 3, what makes the finding about boring tasks and creativity 'counterintuitive'?"),
  answerBox("Answer", "It is counterintuitive because we would normally expect a boring task to reduce creativity or mental performance. Instead, the research found that doing a boring task actually increased creativity afterward — the opposite of what common sense would predict."),
  blankLine(),

  qLine("4", "The mind-wandering process described in paragraph 3 corresponds to which stage in Wallas's (1926) model of creativity? (Refer to your course text: preparation / incubation / illumination / verification)"),
  option("A", "Preparation"),
  option("B", "Incubation", true),
  option("C", "Illumination"),
  option("D", "Verification"),
  answerBox("Answer", "B — Incubation is the stage in which information 'settles' and the mind works passively on a problem — which matches the mind-wandering and default mode network activation described in paragraph 3."),
  blankLine(),

  qLine("5", "How does the author seem to explain the relationship between boredom and creativity? Explain in your own words."),
  answerBox("Answer", "The author suggests that boredom triggers mind-wandering, which activates the brain's default mode network — associated with daydreaming and loose, associative thinking. This mental state, rather than being wasted time, is actually the kind of thinking that underlies creative idea generation. By immediately escaping boredom through phones or screens, people short-circuit this potentially valuable cognitive process."),
  blankLine(),

  qLine("6", "Which of the following are TRUE according to paragraphs 3 and 4? (There may be more than one correct answer.)"),
  option("A", "Boredom can sometimes function as a creative catalyst.", true),
  option("B", "Workplace boredom only affects employees whose jobs are too simple."),
  option("C", "Immediately using a phone to escape boredom may prevent a potentially useful mental process.", true),
  option("D", "Burnout and boreout are the same phenomenon described differently."),
  answerBox("Answer", "A and C — A is supported by the creativity research in paragraph 3. C is explicitly stated: 'reaching for a phone at the first sign of boredom may be counterproductive.' B is false — paragraph 4 says boredom can also come from tasks that are too complex. D is false — they are contrasted as different phenomena."),
  blankLine(),

  qLine("7", "In paragraph 5, Heidegger's view of profound boredom is cited to illustrate that"),
  answerBox("Answer", "...boredom, at its deepest level, is not simply an unpleasant feeling to be avoided, but can serve a philosophically important function — forcing a person to confront what they genuinely value and whether their life has meaning. It prompts self-examination rather than distraction."),
  blankLine(),

  qLine("8", "A student who finds himself scrolling social media for hours, feeling vaguely dissatisfied, then returning to his phone almost immediately after putting it down is demonstrating which two concepts from the text?"),
  answerBox("Answer", "1. He is demonstrating the 'counterproductive' escape from boredom (paragraph 3) — by immediately reaching for his phone, he prevents the mind-wandering and creative thinking that boredom could activate. 2. His dissatisfaction may reflect the link between boredom and lack of meaning in life (paragraph 5) — his inability to feel satisfied may signal a deeper issue with purpose."),
  blankLine(),

  qLine("9", "SUMMARY — Fill in the blanks using words from the box."),
  italicPara("trait boredom / default mode network / meaning / state boredom / creativity / chronic / mind-wandering / regulation"),
  body("Boredom can be divided into (1)__________________, which is situation-specific, and (2)__________________, which is a stable personality feature linked to lower wellbeing. Despite its negative reputation, boredom may stimulate (3)__________________ by triggering (4)__________________, which activates the (5)__________________. However, when boredom becomes (6)__________________, it leads to disengagement and harmful behaviors. At a deeper level, frequent boredom may signal a lack of (7)__________________ in one's life. One factor that may mediate the relationship between trait boredom and negative outcomes is difficulty with self-(8)__________________."),
  answerBox("1.", "state boredom"),
  answerBox("2.", "trait boredom"),
  answerBox("3.", "creativity"),
  answerBox("4.", "mind-wandering"),
  answerBox("5.", "default mode network"),
  answerBox("6.", "chronic"),
  answerBox("7.", "meaning"),
  answerBox("8.", "regulation"),
  blankLine(),

  bodyBold("References: What do the following words/phrases refer to?"),
  body("1. (Par. 2) 'these individuals': _______________________________________________"),
  answerBox("1.", "People with trait boredom — those who are chronically prone to boredom regardless of their circumstances"),
  body("2. (Par. 3) 'this distinction': _______________________________________________"),
  answerBox("2.", "The redefinition of boredom from 'the absence of stimulation' to 'an active state in which the mind searches for meaning' (from paragraph 1)"),
  body("3. (Par. 5) 'this view': _______________________________________________"),
  answerBox("3.", "Heidegger's argument that profound boredom forces a person to confront what they genuinely value — the philosophical importance of boredom"),
  pageBreakPara()
);

// ────────────────────────────────────────────
// R2 TEXT 2: THE SOCIAL CONSTRUCTION OF BEAUTY
// ────────────────────────────────────────────
children.push(sectionHeader("R2", 2, "THE SOCIAL CONSTRUCTION OF BEAUTY"));
children.push(
  bodyBold("THE SOCIAL CONSTRUCTION OF BEAUTY"),
  blankLine(),
  paraNum("1", "Beauty, most people feel, is immediately and personally recognizable — 'I know it when I see it.' Yet decades of research across psychology, anthropology, and cultural studies have increasingly challenged this intuition. While certain features — facial symmetry, clear skin, youthful appearance — appear to be preferred across cultures and may reflect evolutionary adaptations signaling health and reproductive fitness, the overwhelming evidence suggests that much of what any given society considers beautiful is not universal, not innate, and certainly not fixed. Beauty standards are socially constructed: they are produced, maintained, and contested through culture, power, and history."),
  paraNum("2", "Anthropological research has documented remarkable variation in beauty standards across societies and time periods. In many pre-industrial cultures, h
