const fs = require('fs');

const readingTasksPath = './data/reading_tasks.json';
const listeningTasksPath = './data/listening_tasks.json';
const grammarTasksPath = './data/grammar_tasks.json';

// --- READING ---
const newReadingTasks = [
    {
        "id": "r_acad_p1",
        "level": "P1",
        "title": "The Sociological Paradigm of Urban Sprawl",
        "time": "20 min",
        "text": "The phenomenon of urban sprawl—the uncontrolled expansion of urban areas—has long been a subject of sociological inquiry. While early twentieth-century urbanists frequently championed suburbanization as a panacea for the overcrowding and systemic poverty endemic to industrial city centers, contemporary sociological paradigms paint a decidedly more critical portrait. Modern scholars argue that suburban expansion, far from alleviating social stratification, inherently exacerbates it by physically segregating populations along socioeconomic lines.\n\nAccording to spatial mismatch theory, an inevitable consequence of urban sprawl is the relocation of entry-level and manufacturing employment to the peripheral rings of a city. This geographic shift leaves marginalized communities, predominantly situated in the inner city, isolated from viable economic opportunities. Lacking reliable or extensive public transportation, residents of these inner-city enclaves face prohibitive commute times, effectively barring them from the very jobs designed to facilitate upward economic mobility. Consequently, poverty becomes concentrated, compounding issues of underfunded educational institutions and inadequate healthcare access.\n\nFurthermore, environmental sociologists point to the ecological degradation inextricably linked to sprawl. The reliance on automobiles, necessitated by low-density zoning and the physical distance between residential zones and commercial hubs, not only contributes significantly to greenhouse gas emissions but also discourages communal interaction. The resulting 'windshield perspective'—where individuals experience their community primarily through the glass of a moving vehicle—fosters a profound sense of civic detachment and social alienation.\n\nHowever, it would be reductive to categorize sprawl entirely as a deliberate mechanism of exclusion. Market forces, particularly the post-war demand for affordable, single-family housing, undeniably drove initial suburban migration. Yet, the persistence of sprawl, despite its documented ecological and social detriments, suggests a failure of modern urban policy. Unregulated zoning laws and implicit subsidies for highway construction over public transit infrastructure continue to incentivize outward expansion.\n\nUltimately, addressing the inequities of urban sprawl requires moving beyond mere aesthetic critiques of 'strip mall' architecture. It necessitates a fundamental restructuring of urban planning policies—one that prioritizes high-density, mixed-use development and robust, equitable public transportation networks. Only by actively dismantling these spatial barriers can cities begin to foster genuine socioeconomic integration.",
        "questions": [
            {
                "q": "Which of the following best captures the author's primary attitude toward urban sprawl?",
                "options": [
                    "Unwavering support for its economic benefits.",
                    "Nostalgic appreciation for early suburbanization.",
                    "Critical condemnation of its social and ecological impacts.",
                    "Objective neutrality regarding market forces."
                ],
                "answer": 2,
                "skill": "tone",
                "explain": "The author uses phrases like 'exacerbates it', 'prohibitive commute times', and 'civic detachment', clearly indicating a critical stance against the impacts of sprawl."
            },
            {
                "q": "What is the primary function of the second paragraph?",
                "options": [
                    "To provide a historical overview of suburban migration.",
                    "To refute the claims of early twentieth-century urbanists.",
                    "To demonstrate how geographic shifts isolate inner-city populations from employment.",
                    "To argue that public transportation is inherently flawed."
                ],
                "answer": 2,
                "skill": "main_idea",
                "explain": "The paragraph explains 'spatial mismatch theory' and details how jobs moving to the periphery isolate inner-city residents from economic opportunities."
            },
            {
                "q": "Based on the passage, the 'windshield perspective' refers to:",
                "options": [
                    "A method used by urban planners to design safer highways.",
                    "A type of environmental degradation caused by car emissions.",
                    "A social phenomenon where reliance on driving reduces community engagement.",
                    "A purely aesthetic critique of modern suburban architecture."
                ],
                "answer": 2,
                "skill": "vocab_context",
                "explain": "The text states that experiencing the community through a car window 'fosters a profound sense of civic detachment and social alienation'."
            },
            {
                "q": "What can be inferred about the author's view on early twentieth-century urbanists?",
                "options": [
                    "They perfectly understood the long-term consequences of sprawl.",
                    "Their view that suburbanization was a 'panacea' was ultimately flawed.",
                    "They were primarily concerned with environmental degradation.",
                    "They actively sought to increase social stratification."
                ],
                "answer": 1,
                "skill": "inference",
                "explain": "The author states they championed it as a 'panacea', but immediately contrasts this with modern views that show sprawl exacerbates problems, implying the early view was incorrect."
            }
        ]
    },
    {
        "id": "r_acad_p2",
        "level": "P2",
        "title": "Chomskyan Linguistics and the Innateness Hypothesis",
        "time": "22 min",
        "text": "Before the mid-twentieth century, the dominant paradigm in linguistics and psychology was behaviorism. Propounded largely by B.F. Skinner, this theory posited that language acquisition was fundamentally a process of habit formation—children learned language through environmental exposure, imitating adults, and receiving positive reinforcement. The human mind was viewed as a 'blank slate' (tabula rasa) upon which linguistic rules were gradually imprinted. However, in 1959, Noam Chomsky published a scathing critique of Skinner's work, fundamentally revolutionizing the study of language and initiating the cognitive revolution.\n\nChomsky introduced what is now known as the Innateness Hypothesis. He argued that the behavioral model was woefully inadequate to explain the 'poverty of the stimulus'. According to this concept, the linguistic input a child receives is often fragmented, ungrammatical, and limited. Yet, despite this impoverished input, children universally acquire highly complex grammatical systems rapidly and effortlessly. Chomsky deduced that this feat is impossible unless humans are born with a specialized cognitive architecture—a biological predisposition for language.\n\nCentral to Chomsky's theory is the concept of Universal Grammar (UG). UG is not a specific set of rules for English or Japanese, but rather an innate, generalized linguistic blueprint wired into the human brain. It dictates the structural parameters that all human languages must adhere to. When a child is exposed to a specific language, they do not learn the rules from scratch; instead, environmental exposure merely 'triggers' the setting of specific parameters within the pre-existing framework of UG. This explains why children make predictable grammatical errors, such as overregularization (e.g., saying 'goed' instead of 'went'), which they have never actually heard adults produce.\n\nCritics of Chomskyan linguistics, particularly proponents of usage-based models, argue that Chomsky overstates the innateness of language. These scholars suggest that general cognitive abilities—such as pattern recognition, memory, and social intention-reading—are sufficient to explain language acquisition without the need for a hyper-specialized 'language organ' like Universal Grammar. They point to the immense variation across the world's languages as evidence that a rigid underlying structure is unlikely.\n\nRegardless of the ongoing debates, Chomsky's paradigm shift remains foundational. By repositioning language not as a cultural artifact learned through mimicry, but as a biological property of the human species, he forced disciplines from psychology to computer science to reconsider the profound inherent capabilities of the human mind.",
        "questions": [
            {
                "q": "What is the primary purpose of the passage?",
                "options": [
                    "To prove that behaviorism is the only valid theory of language.",
                    "To detail the biological structure of the human brain.",
                    "To explain Chomsky's Innateness Hypothesis and its contrast with behaviorism.",
                    "To argue that language acquisition is entirely dependent on environment."
                ],
                "answer": 2,
                "skill": "main_idea",
                "explain": "The passage traces the shift from Skinner's behaviorism to Chomsky's Innateness Hypothesis and Universal Grammar."
            },
            {
                "q": "In the context of the passage, the phrase 'poverty of the stimulus' refers to the idea that:",
                "options": [
                    "Children are not exposed to enough complex vocabulary.",
                    "The language children hear is too messy and limited to explain their flawless grammar acquisition.",
                    "Parents do not speak to their children frequently enough.",
                    "Behaviorism lacks the scientific evidence to be considered a true theory."
                ],
                "answer": 1,
                "skill": "vocab_context",
                "explain": "The text defines it as the idea that 'the linguistic input a child receives is often fragmented... Yet, children universally acquire highly complex grammatical systems'."
            },
            {
                "q": "According to the passage, why do children say things like 'goed' instead of 'went'?",
                "options": [
                    "Because they are imitating errors made by adults.",
                    "Because they possess a cognitive deficit in early childhood.",
                    "Because they are applying innate, underlying grammatical rules rather than just mimicking.",
                    "Because their parents reinforced the incorrect behavior."
                ],
                "answer": 2,
                "skill": "detail",
                "explain": "The passage uses 'goed' as an example of overregularization to show they apply rules (UG) rather than just mimicking what they hear (since adults don't say 'goed')."
            }
        ]
    }
];

// --- LISTENING ---
const newListeningTasks = [
    {
        "id": "l_acad_p1",
        "level": "P1",
        "title": "Lecture: Cognitive Load Theory in Multimedia Learning",
        "time": "18 min",
        "transcript": "Good morning, everyone. Today, we're shifting our focus from general pedagogy to a specific, highly influential framework in instructional design: Cognitive Load Theory, originally developed by John Sweller in the late 1980s. Now, to understand Sweller's theory, we must first accept a fundamental biological limitation—the bottleneck of working memory. Unlike long-term memory, which is theoretically infinite, working memory can only hold a few pieces of novel information at any given time, typically about four to seven 'chunks'.\n\nSweller hypothesized that our instructional methods often overwhelm this limited capacity, leading to poor learning outcomes. He categorized cognitive load into three distinct types: intrinsic, extraneous, and germane. Let's break these down.\n\nIntrinsic cognitive load is the inherent difficulty of the material itself. You can't change it. Learning multivariate calculus simply requires more mental effort than memorizing the alphabet. It depends on the 'element interactivity'—how many concepts must be processed simultaneously to understand the whole.\n\nThe second type, extraneous cognitive load, is where instructional designers have the most control. This refers to the mental effort required to process poorly designed instruction. For example, imagine a PowerPoint slide with a complex diagram, but the explanatory text for that diagram is on the next slide. The student has to hold the image in their working memory while reading the text, creating a 'split-attention effect'. This unnecessary mental gymnastics is extraneous load, and our primary goal as educators is to eliminate it entirely.\n\nFinally, we have germane cognitive load. For a long time, this was considered a separate category—the effort dedicated specifically to processing, constructing, and automating cognitive schemas. In other words, germane load is the 'good' mental effort that leads to actual learning. When we reduce extraneous load, we free up working memory capacity, which the learner can then redirect toward germane load.",
        "questions": [
            {
                "q": "What is the primary constraint that Cognitive Load Theory seeks to address?",
                "options": [
                    "The infinite capacity of long-term memory.",
                    "The limitations of the auditory processing channel.",
                    "The bottleneck of working memory capacity.",
                    "The inherent difficulty of all academic subjects."
                ],
                "answer": 2,
                "skill": "detail",
                "explain": "The lecturer explicitly states the theory requires accepting 'a fundamental biological limitation—the bottleneck of working memory'."
            },
            {
                "q": "Which type of cognitive load is described as 'unnecessary mental gymnastics' caused by poor design?",
                "options": [
                    "Intrinsic",
                    "Germane",
                    "Working",
                    "Extraneous"
                ],
                "answer": 3,
                "skill": "detail",
                "explain": "Extraneous load is the effort 'to process poorly designed instruction', like the 'split-attention effect' example."
            }
        ],
        "type": "selective"
    },
    {
        "id": "l_acad_p2",
        "level": "P2",
        "title": "Panel Discussion: The Economics of Renewable Subsidies",
        "time": "24 min",
        "transcript": "[Moderator]: Welcome back. We're discussing the economic viability of government subsidies for renewable energy. Dr. Aris, neoclassical models often argue that subsidies distort free markets. Are we simply throwing taxpayer money at inefficient technologies?\n\n[Dr. Aris]: It's a common, yet overly simplistic, critique. Yes, subsidies intervene in the market. But we must acknowledge that the global energy market is already profoundly distorted. For over a century, fossil fuels have enjoyed massive, often hidden, subsidies in the form of unpriced negative externalities—specifically, the devastating costs of carbon emissions, public health impacts, and environmental degradation. When a coal plant pollutes, society pays the price, not the company. Renewable subsidies are not 'distorting' a perfect market; they are a necessary, albeit imperfect, corrective measure to offset the historical market failure of unpriced carbon.\n\n[Dr. Chen]: I agree with Dr. Aris regarding negative externalities, but we have to be pragmatic about allocation. The problem with aggressive, open-ended renewable subsidies—like early feed-in tariffs in certain European nations—is that they often guarantee profits regardless of technological innovation. This creates a moral hazard. Companies become reliant on the subsidy rather than striving to lower the Levelized Cost of Energy (LCOE) through R&D. We saw this with early solar panels; the subsidies were so generous that there was little incentive to improve efficiency. It's only when subsidies are tapered, forcing companies to compete, that we see the dramatic cost curves drop as we have in the last decade.",
        "questions": [
            {
                "q": "How does Dr. Aris justify renewable energy subsidies against the claim that they 'distort the market'?",
                "options": [
                    "By claiming that free markets do not actually exist in any sector.",
                    "By arguing the market is already distorted because fossil fuels do not pay for their negative impacts.",
                    "By stating that renewable energy is inherently cheaper than fossil fuels.",
                    "By suggesting that taxpayer money should not be used for energy at all."
                ],
                "answer": 1,
                "skill": "main_idea",
                "explain": "Dr. Aris states: 'fossil fuels have enjoyed massive... subsidies in the form of unpriced negative externalities'."
            },
            {
                "q": "What is the 'moral hazard' Dr. Chen worries about regarding aggressive subsidies?",
                "options": [
                    "Companies might use the money to build fossil fuel plants instead.",
                    "Companies become dependent on government money rather than innovating to lower costs.",
                    "Consumers will stop buying electricity entirely.",
                    "The government will go bankrupt immediately."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "Dr. Chen says subsidies 'guarantee profits regardless of technological innovation... Companies become reliant on the subsidy rather than striving to lower... Cost'."
            }
        ],
        "type": "selective"
    }
];

// --- GRAMMAR ---
const newGrammarTasks = [
    {
        "id": "g_acad_01",
        "level": "P4",
        "title": "Advanced Inversion (Negative Adverbials)",
        "time": "10 min",
        "explain": "Inversion in Academic English happens when a sentence starts with a restrictive or negative adverbial (e.g., Never, Rarely, Seldom, Not only, Under no circumstances, On no account). The subject and auxiliary verb invert, as if forming a question. For example: 'Under no circumstances should you leave.' This structure is heavily favored in formal and academic writing to add emphasis.",
        "questions": [
            {
                "q": "Not only ________ the ecosystem, but it also poisoned the groundwater.",
                "options": [
                    "the oil spill devastated",
                    "did the oil spill devastate",
                    "was the oil spill devastated",
                    "devastated the oil spill"
                ],
                "answer": 1,
                "explain": "Because the sentence starts with 'Not only', the auxiliary 'did' must invert with the subject 'the oil spill'."
            }
        ]
    },
    {
        "id": "g_acad_02",
        "level": "P4",
        "title": "Reduced Relative Clauses (Active and Passive)",
        "time": "12 min",
        "explain": "Relative clauses can be reduced to participles to make academic writing more concise. If the verb in the clause is active, it becomes present participle (V-ing): 'The scientists who conduct the research...' -> 'The scientists conducting the research...'. If passive, it becomes a past participle (V3): 'The data which was collected by the team...' -> 'The data collected by the team...'.",
        "questions": [
            {
                "q": "The sociological data ________ during the massive urban sprawl study was highly controversial.",
                "options": [
                    "collecting",
                    "was collected",
                    "collected",
                    "which collecting"
                ],
                "answer": 2,
                "explain": "The data 'which was collected' corresponds to the passive reduced clause 'collected'."
            }
        ]
    }
];

function appendToFile(filePath, newItems) {
    try {
        const rawData = fs.readFileSync(filePath, 'utf8');
        const db = JSON.parse(rawData);
        // Remove duplicates if already appended
        const existingIds = new Set(db.map(item => item.id));
        let addedCount = 0;

        newItems.forEach(item => {
            if (!existingIds.has(item.id)) {
                db.push(item);
                addedCount++;
            }
        });

        fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
        console.log(`Added ${addedCount} academic items to ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
    }
}

appendToFile(readingTasksPath, newReadingTasks);
appendToFile(listeningTasksPath, newListeningTasks);
appendToFile(grammarTasksPath, newGrammarTasks);

console.log('Appended academic texts to JSON databases successfully!');
