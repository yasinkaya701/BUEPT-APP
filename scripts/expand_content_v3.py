import json
import os

ROOT_DIR = "/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp"
DATA_DIR = os.path.join(ROOT_DIR, "data")

NEW_READING = [
    {
        "id": "READ_BUEPT_11",
        "title": "The Architecture of Nudge: Behavioral Economics in Public Policy",
        "level": "C1",
        "time": "18 min",
        "text": "The conceptual framework of 'Nudge Theory,' pioneered by Richard Thaler and Cass Sunstein, has fundamentally recalibrated the approach to public policy. At its core, a nudge constitutes any aspect of choice architecture that alters people’s behavior in a predictable way without forbidding any options or significantly changing their economic incentives. Unlike mandates or bans, nudges preserve individual autonomy while strategically guiding subjects toward more salutary outcomes. For instance, the default enrollment in pension schemes or the tactical placement of nutritional information in supermarkets serves to minimize inertia and cognitive friction. Critics, however, hypothesize that such interventions risk being paternalistic, potentially manipulating individuals who remain unaware of the subtle architectural shifts influencing their decision-making processes.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What is the primary distinction between a 'nudge' and a mandate?",
                "options": [
                    "Nudges eliminate choice while mandates preserve it.",
                    "Nudges preserve autonomy whereas mandates explicitly forbid options.",
                    "Nudges rely on economic incentives while mandates do not.",
                    "Mandates are always more effective than choice architecture."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The text states nudges alter behavior 'without forbidding any options', unlike mandates."
            }
        ]
    },
    {
        "id": "READ_BUEPT_12",
        "title": "Quantum Decoherence and the Collapse of the Wavefunction",
        "level": "C2",
        "time": "22 min",
        "text": "In the esoteric realm of quantum mechanics, the phenomenon of decoherence elucidates the transition from quantum superposition to classical reality. According to the Schrodinger equation, a quantum system remains in a coherent superposition of all possible states until a measurement occurs. However, decoherence posits that the system’s inevitable interaction with its environment—even a single photon or air molecule—effectively 'scatters' the quantum phase information. This environmental entanglement necessitates the emergence of classical outcomes, rendering the 'cat' either dead or alive long before a macroscopic observer intervenes. Thus, decoherence does not technically 'collapse' the wavefunction in the traditional sense; rather, it suppresses the interference patterns that constitute the visible hallmark of quantum coherence in a macroscopic context.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "According to the passage, what role does the environment play in quantum decoherence?",
                "options": [
                    "It preserves the coherence of the quantum system.",
                    "It acts as a macroscopic observer that intentionally collapses the wavefunction.",
                    "Its interaction with the system causes the scattering of phase information.",
                    "It prevents the system from ever entering a state of superposition."
                ],
                "answer": 2,
                "skill": "main_idea",
                "explain": "The text states 'environmental entanglement necessitates the emergence of classical outcomes... by scattering phase information'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_13",
        "title": "Algorithmic Bias and the Paradox of Judicial Objectivity",
        "level": "C1",
        "time": "20 min",
        "text": "The integration of predictive algorithms into the criminal justice system was initially heralded as a triumph of objective data over human fallibility. Proponents argued that machine learning could mitigate the subconscious biases inherent in traditional judicial sentencing. Yet, empirical studies have elucidated a deleterious reality: these algorithms often perpetuate, and even exacerbate, existing societal stratification. By utilizing historical data points—such as zip codes or employment history—as proxies for risk, the software inadvertently codifies historical racial and socio-economic inequities. Consequently, the facade of mathematical neutrality facilitates a systemic feedback loop that disproportionately penalizes marginalized populations while insulating the technology’s proponents from accusations of overt prejudice.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What is the 'paradox' mentioned in the context of the passage?",
                "options": [
                    "That humans are more objective than machines.",
                    "That technology designed to remove bias actually codifies and perpetuates it.",
                    "That zip codes are more important than judicial sentencing.",
                    "That employment history has no impact on criminal risk."
                ],
                "answer": 1,
                "skill": "inference",
                "explain": "The paradox lies in the fact that algorithms meant to be objective actually 'perpetuate... existing societal stratification'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_14",
        "title": "CRISPR-Cas9 and the Ethics of Human Germline Editing",
        "level": "C2",
        "time": "25 min",
        "text": "The advent of CRISPR-Cas9 technology has revolutionized molecular biology, offering a precise and exceedingly cost-effective tool for genome engineering. While its potential to eradicate hereditary pathologies constitutes a paramount scientific breakthrough, the prospects of germline editing—altering the genetic blueprint of future generations—necessitate profound ethical scrutiny. Unlike somatic cell therapies, germline interventions are heritable, meaning any off-target mutations or unintended consequences would be irrevocably integrated into the human species. Concerns surrounding the emergence of 'designer babies' and the potential for a genetic divide between the affluent and the impoverished have catalyzed a global debate. Hence, the scientific community remains divided on whether the salutary benefits of such technology outweigh the systemic risks to human genetic diversity and societal egalitarianism.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "Why is germline editing considered more ethically significant than somatic editing?",
                "options": [
                    "Because somatic editing is more expensive.",
                    "Because germline changes are heritable and affect all future generations.",
                    "Because CRISPR is only capable of performing germline editing.",
                    "Because somatic cells do not contain DNA."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The text notes germline interventions 'are heritable' and would be 'irrevocably integrated into the human species'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_15",
        "title": "The Machine-a-Habit: Le Corbusier and the Ethics of High Modernism",
        "level": "C1",
        "time": "19 min",
        "text": "Le Corbusier’s dictum that 'a house is a machine for living in' perfectly encapsulates the ethos of high modernism in architecture. His 'Five Points of Architecture'—including pilotis, ribbon windows, and roof gardens—sought to utilize industrial materials like reinforced concrete to liberate the human habitat from the constraints of traditional masonry. While his vision successfully facilitated the rapid urbanization necessitated by post-war recovery, critics hypothesize that its rigid geometric formalism dehumanized the urban experience. The vast, uniform housing blocks of the 'Radiant City' model often fostered a sense of civic detachment and social alienation. Consequently, the high-modernist paradigm is now frequently viewed as a utopian experiment that prioritized schematic efficiency over the complexities of human social interaction and psychological well-being.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "According to critics, what was the primary deficiency of Corbusier’s architectural vision?",
                "options": [
                    "It was too expensive to build with reinforced concrete.",
                    "It failed to facilitate post-war urbanization.",
                    "It prioritized efficiency over human social and psychological needs.",
                    "It ignored the use of industrial materials."
                ],
                "answer": 2,
                "skill": "main_idea",
                "explain": "Critics hypothesize that it 'dehumanized the urban experience' and 'prioritized schematic efficiency over... human social interaction'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_16",
        "title": "Plate Tectonics and the Paleoclimatic Record",
        "level": "C1",
        "time": "21 min",
        "text": "The dynamic movement of Earth’s lithospheric plates constitutes a primary, albeit slow-acting, driver of climatic shifts over geological timescales. The redistribution of continental landmasses alters global ocean circulation patterns and atmospheric heat transport. For instance, the closure of the Isthmus of Panama approximately three million years ago facilitated the intensification of the Gulf Stream, which, paradoxically, may have supplied the moisture necessary for the glaciation of the Northern Hemisphere. Furthermore, the varying rates of subduction and volcanic activity influence the atmospheric concentration of CO2, thereby regulating the planetary greenhouse effect over millions of years. This intricate interplay between tectonic forcing and the paleoclimatic record elucidates why Earth’s climate remains in a state of perpetual, multi-scale flux.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "How did the closure of the Isthmus of Panama influence the climate according to the passage?",
                "options": [
                    "It caused the Gulf Stream to stop entirely.",
                    "It directly reduced the concentration of CO2 in the atmosphere.",
                    "It facilitated the intensification of currents that provided moisture for glaciation.",
                    "It prevented landmasses from redistributing heat."
                ],
                "answer": 2,
                "skill": "detail",
                "explain": "The text states it 'facilitated the intensification of the Gulf Stream... supplied the moisture necessary for glaciation'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_17",
        "title": "The Silk Road: A Network of Economic and Cultural Diffusion",
        "level": "C1",
        "time": "23 min",
        "text": "Far from being a single road, the 'Silk Road' comprised a vast, shifting network of trans-Eurasian trade routes that facilitated the diffusion of commodities, technologies, and ideologies for nearly two millennia. While silk remains the most celebrated commodity of this exchange, the transmission of paper-making, gunpowder, and mathematical concepts from East to West was arguably of greater historical significance. The varying stability of the dominant empires—such as the Han, Roman, and Mongol—dictated the safety and volume of this trans-continental commerce. This economic connectivity fostered the emergence of cosmopolitan hubs like Samarkand and Chang'an, where diverse cultural traditions hybridized. Consequently, the Silk Road serves as a historical precursor to contemporary globalization, demonstrating that systemic interdependence remains a recurring hallmark of human civilization.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What determined the safety and volume of commerce along the Silk Road?",
                "options": [
                    "The quality of the silk produced in the East.",
                    "The stability of the major empires along the route.",
                    "The total distance between Samarkand and Chang'an.",
                    "The discovery of gunpowder."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The text states: 'The varying stability of the dominant empires... dictated the safety and volume of this trans-continental commerce.'"
            }
        ]
    },
    {
        "id": "READ_BUEPT_18",
        "title": "Neuroplasticity and the Myth of the 'Fixed' Adult Brain",
        "level": "C1",
        "time": "20 min",
        "text": "For much of the twentieth century, the prevailing scientific dogma posited that the adult brain was a static, structurally fixed entity, incapable of generating new neurons or significant synaptic reorganization. However, recent advances in neuro-imaging have facilitated a paradigm shift toward 'neuroplasticity.' This concept elucidates the brain’s remarkable capacity to reorganize itself in response to experience and learning throughout the entire human lifespan. Processes such as long-term potentiation (LTP) and neurogenesis in the hippocampus demonstrate that mental exertion can physically alter cerebral architecture. This finding has profound implications for cognitive rehabilitation and tertiary-level education, suggesting that the acquisition of complex fluencies necessitates the continuous 'rewiring' of neural networks, rather than merely retrieving info from a pre-determined hardware.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What was the 'dogma' that neuroplasticity challenged?",
                "options": [
                    "That the brain is incapable of generating any neural signals.",
                    "That the adult brain is a fixed, unchanging structure.",
                    "That neurogenesis only occurs in the hippocampus.",
                    "That neuro-imaging is a reliable tool for researchers."
                ],
                "answer": 1,
                "skill": "main_idea",
                "explain": "The text says it challenged the belief that the adult brain was a 'static, structurally fixed entity'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_19",
        "title": "Game Theory and the Logic of Nuclear Deterrence",
        "level": "C2",
        "time": "24 min",
        "text": "The application of Game Theory to international relations, specifically the doctrine of Mutually Assured Destruction (MAD), constitutes a pillar of Cold War strategic thought. This model hypothesizes that nuclear deterrence remains effective only if two opposing powers possess a 'second-strike capability'—the capacity to retaliate with overwhelming force even after an initial surprise attack. In the logic of the 'Prisoner’s Dilemma,' neither party is incentivized to initiate conflict, as the outcome results in total systemic annihilation. However, critics argue that this paradigm relies on the exceedingly fragile assumption of 'rational actors.' Any breakdown in communication, technical malfunction, or shift toward tactical asymmetric warfare necessitates a significant recalibration of traditional deterrence models, as the zero-sum logic of total war fails to account for the complexities of modern non-state conflict.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "What is 'second-strike capability' in the context of nuclear deterrence?",
                "options": [
                    "The ability to strike an opponent twice before they can react.",
                    "The capacity to retaliate even after being hit by a surprise attack.",
                    "A tactical maneuver designed to avoid nuclear war entirely.",
                    "The economic power to sustain a prolonged conventional war."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The text defines it as 'the capacity to retaliate with overwhelming force even after an initial surprise attack'."
            }
        ]
    },
    {
        "id": "READ_BUEPT_20",
        "title": "The Rise of Megacities: Sociological Implications of Hyper-Urbanization",
        "level": "C1",
        "time": "22 min",
        "text": "The twenty-first century is increasingly defined by the emergence of 'megacities'—urban agglomerations with populations exceeding ten million. This hyper-urbanization is particularly precipitous in the Global South, where rapid industrialization and rural-to-urban migration have outpaced the development of civic infrastructure. While megacities constitute dynamos of economic innovation and cultural hybridization, they also exacerbate systemic inequities. The sprawling 'informal settlements' or shantytowns that fringe these urban centers highlight the catastrophic failure of formal housing markets. Furthermore, the ecological footprint of these concentrated populations necessitates a total restructuring of resource management. Navigating the delicate equilibrium between the benefits of urban density and the deleterious externalities of overcrowded enclaves constitutes the paramount challenge for modern urban sociology and public policy.",
        "questions": [
            {
                "type": "multiple-choice",
                "q": "Which of the following describes a major challenge mentioned in the passage regarding megacities?",
                "options": [
                    "A lack of cultural hybridization in the Global South.",
                    "The inability of formal housing markets to keep pace with population growth.",
                    "The migration of residents from cities back to rural areas.",
                    "The elimination of economic innovation in dense urban areas."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The text mentions that 'informal settlements... highlight the catastrophic failure of formal housing markets'."
            }
        ]
    }
]

NEW_LISTENING = [
    {
        "id": "LIST_BUEPT_11",
        "title": "Dark Matter: The Unseen Scaffolding of the Universe",
        "level": "C2",
        "time": "20 min",
        "transcript": "Good morning. Today we delve into one of the most profound enigmas of contemporary astrophysics: Dark Matter. While baryonic matter—the stars, planets, and gas we can observe—constitutes a mere five percent of the cosmos, dark matter makes up roughly twenty-five percent. We cannot see it directly because it does not interact with the electromagnetic spectrum; it neither absorbs, reflects, nor emits light. So, how do we hypothesize its existence? The evidence primarily elucidates through gravitational effects. When we observe the rotation curves of spiral galaxies, we see that stars at the galactic periphery orbit much faster than their visible mass would suggest. Without some unseen 'scaffolding' providing additional gravitational pull, these galaxies would simply fly apart. Thus, dark matter constitutes the invisible glue that facilitates the structural integrity of the large-scale universe.",
        "questions": [
            {
                "q": "What is the primary evidence for the existence of dark matter mentioned in the talk?",
                "options": [
                    "The observation of dark matter reflecting starlight.",
                    "The rotational speed of stars at the edges of galaxies.",
                    "The fact that baryonic matter emits too much light.",
                    "The absence of gravity in the Global South."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The speaker mentions 'rotation curves of spiral galaxies' and that stars at the periphery orbit faster than expected."
            }
        ]
    },
    {
        "id": "LIST_BUEPT_12",
        "title": "Behavioral Finance: The Psychology of Market Inefficiency",
        "level": "C1",
        "time": "18 min",
        "transcript": "Welcome. In today's seminar, we challenge the Efficient Market Hypothesis, or EMH. EMH posits that financial markets are perfectly rational actors that immediately incorporate all available info into asset prices. However, Behavioral Finance elucidates that human investors are frequently driven by cognitive biases rather than pure logic. For instance, 'loss aversion' suggests that the psychological pain of losing money is twice as powerful as the joy of gaining it. This bias leads to the 'disposition effect,' where investors hold onto losing stocks too long while selling winners too early. Moreover, 'herding behavior'—the tendency to mimic the actions of a larger group—frequently facilitates the formation of speculative bubbles. Consequently, market prices often deviate significantly from their intrinsic value, necessitating a more nuanced psychological framework for modern economic theory.",
        "questions": [
            {
                "q": "What does 'loss aversion' imply about investor behavior?",
                "options": [
                    "Investors enjoy losing money to learn from their mistakes.",
                    "The pain of loss is psychologically more significant than the pleasure of a gain.",
                    "Investors always sell their best-performing stocks immediately.",
                    "Market participants are always rational and avoid any losses."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The talk states 'the psychological pain of losing money is twice as powerful as the joy of gaining it'."
            }
        ]
    },
    {
        "id": "LIST_BUEPT_13",
        "title": "Soil Depletion and the Threat to Global Food Security",
        "level": "C1",
        "time": "22 min",
        "transcript": "The sustainability of our global food supply relies on a resource often taken for granted: the topsoil. Unfortunately, industrialized monoculture and the excessive use of chemical fertilizers have precipitated a catastrophic rate of soil depletion. When we continuously farm the same crop without allowing the land to remain fallow or utilizing regenerative techniques, we strip the soil of its organic matter and microbial diversity. This erosion reduces the land’s hydraulic capacity, making modern agriculture increasingly vulnerable to climatic volatility. Furthermore, as nutrient density in the soil declines, the nutritional value of our crops diminishes. Hence, transitioning to 'conservation tillage' and crop rotation constitutes a paramount imperative to mitigate the looming threat of systemic agricultural failure.",
        "questions": [
            {
                "q": "What is a consequence of continuous monoculture mentioned in the lecture?",
                "options": [
                    "An increase in the nutritional value of crops.",
                    "The restoration of organic matter in the topsoil.",
                    "The reduction of organic matter and microbial diversity.",
                    "A decrease in the use of chemical fertilizers."
                ],
                "answer": 2,
                "skill": "main_idea",
                "explain": "The speaker says it 'strips the soil of its organic matter and microbial diversity'."
            }
        ]
    },
    {
        "id": "LIST_BUEPT_14",
        "title": "The Concept of 'The Other' in Post-Colonial Theory",
        "level": "C2",
        "time": "25 min",
        "transcript": "In post-colonial discourse, the 'Othering' of non-Western cultures constitutes a central mechanism of imperial hegemony. Writers like Edward Said, in his seminal work 'Orientalism,' elucidated how the West constructed a distorted, exoticized image of the East to justify colonial administration. By framing non-Western societies as 'irrational,' 'stagnant,' or 'mystical,' the imperial power establishes itself as the 'Self'—the rational, progressive norm. This binary opposition facilitates the dehumanization of the colonial subject, rendering their displacement and exploitation seemingly legitimate. Understanding this psychological architecture remains critical for deconstructing the enduring power dynamics and cultural stereotypes that continue to influence global geopolitics and academic narratives today.",
        "questions": [
            {
                "q": "What was the purpose of 'Orientalism' according to the passage?",
                "options": [
                    "To promote the beauty of Eastern cultures in the West.",
                    "To justify colonial rule by creating an exoticized and distorted image of the East.",
                    "To encourage the West to adopt Eastern philosophical concepts.",
                    "To demonstrate that all cultures are naturally equal."
                ],
                "answer": 1,
                "skill": "inference",
                "explain": "The speaker says 'Orientalism' showed how the West 'constructed a distorted, exoticized image... to justify colonial administration'."
            }
        ]
    },
    {
        "id": "LIST_BUEPT_15",
        "title": "AI and the Limits of Artistic Creativity",
        "level": "C1",
        "time": "20 min",
        "transcript": "The rise of generative AI has sparked an intense debate regarding the nature of creativity. Can a machine truly 'create' art, or is it merely performing a sophisticated form of statistical mimicry? Generative algorithms, such as Large Language Models and diffusion models, function by analyzing vast datasets of human-produced content and identifying recurring patterns. While these systems can synthesize aesthetically pleasing images or literary passages, they lack the 'intentionality' and 'lived experience' that define human artistic expression. Critics hypothesize that AI-generated art remains derivative by definition, as it cannot transcend its training data. Nevertheless, proponents argue that AI constitutes a new 'brush'—a tool that facilitates human agency rather than replacing it. The question remains: does the value of art reside in the final commodity, or in the human labor and emotion necessitated by its production?",
        "questions": [
            {
                "q": "What is a major criticism of AI-generated art mentioned in the talk?",
                "options": [
                    "It is too expensive for the average consumer.",
                    "It lacks the 'intentionality' and 'lived experience' of human art.",
                    "It is much better than anything humans can create.",
                    "It uses too much hydraulic resource."
                ],
                "answer": 1,
                "skill": "detail",
                "explain": "The text states machines 'lack the intentionality and lived experience that define human artistic expression'."
            }
        ]
    }
]

def expand():
    # Reading
    read_path = os.path.join(DATA_DIR, "reading_tasks.json")
    with open(read_path, "r", encoding="utf-8") as f:
        read_data = json.load(f)
    
    # Avoid duplicates
    existing_ids = {t["id"] for t in read_data}
    added_read = 0
    for task in NEW_READING:
        if task["id"] not in existing_ids:
            read_data.append(task)
            added_read += 1
            
    with open(read_path, "w", encoding="utf-8") as f:
        json.dump(read_data, f, indent=2, ensure_ascii=False)
    
    # Listening
    list_path = os.path.join(DATA_DIR, "listening_tasks.json")
    with open(list_path, "r", encoding="utf-8") as f:
        list_data = json.load(f)
    
    existing_ids = {t["id"] for t in list_data}
    added_list = 0
    for task in NEW_LISTENING:
        if task["id"] not in existing_ids:
            list_data.append(task)
            added_list += 1
            
    with open(list_path, "w", encoding="utf-8") as f:
        json.dump(list_data, f, indent=2, ensure_ascii=False)
        
    print(f"Added {added_read} Reading tasks and {added_list} Listening tasks.")

if __name__ == "__main__":
    expand()
