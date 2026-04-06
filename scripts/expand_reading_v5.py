import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_READING = [
    {
        "id": "r_46",
        "title": "The Big Bang Theory and the Expanding Universe",
        "level": "C1",
        "text": "The Big Bang theory is the prevailing cosmological model for the universe from the earliest known periods through its subsequent large-scale evolution. The model describes how the universe expanded from a very high-density and high-temperature state and offers a comprehensive explanation for a broad range of phenomena, including the abundance of light elements, the cosmic microwave background (CMB) radiation, and large-scale structure. Crucially, the discovery of 'cosmic redshift'—the stretching of light from distant galaxies—showed that the universe is not static but expanding in all directions. Edwin Hubble's observations in the 1920s transformed our view of the cosmos, suggesting that the farther away a galaxy is, the faster it is moving away from us. This suggests a common point of origin approximately 13.8 billion years ago.",
        "questions": [
            {"q": "What does the Big Bang theory describe?", "options": ["The creation of the first star.", "The expansion of the universe from a hot, dense state.", "The end of the universe.", "The movement of planets around the Sun."], "answer": 1},
            {"q": "What is 'cosmic redshift'?", "options": ["Red stars becoming blue.", "The stretching of light from distant galaxies.", "The slowing down of the universe.", "A type of radio wave."], "answer": 1},
            {"q": "Who made the key observations about expanding galaxies in the 1920s?", "options": ["Albert Einstein.", "Edwin Hubble.", "Isaac Newton.", "Stephen Hawking."], "answer": 1},
            {"q": "How old is the universe estimated to be?", "options": ["1 billion years.", "13.8 billion years.", "4.5 billion years.", "100 trillion years."], "answer": 1},
            {"q": "What are the phenomena explained by the Big Bang model?", "options": ["Weather patterns on Earth.", "Abundance of light elements and CMB radiation.", "The rotation of the Moon.", "The formation of the ocean."], "answer": 1}
        ]
    },
    {
        "id": "r_47",
        "title": "Biodiversity Hotspots and Conservation Priorities",
        "level": "C1",
        "text": "A biodiversity hotspot is a biogeographic region with significant levels of biodiversity that is threatened by human habitation. To qualify as a hotspot, a region must meet two strict criteria: it must contain at least 1,500 species of vascular plants as endemics (found nowhere else on Earth), and it must have lost at least 70% of its primary vegetation. Norman Myers first proposed the concept in 1988 to help conservationists prioritize their efforts. Currently, around 36 areas qualify as hotspots, representing only 2.3% of Earth's land surface but hosting more than half of the world's plant species as endemics. Protecting these areas is seen as the most efficient way to prevent mass extinction, although critics argue that this focus ignores larger, less threatened ecosystems like the Amazon rainforest.",
        "questions": [
            {"q": "What defines a 'biodiversity hotspot'?", "options": ["Any place with a lot of animals.", "A region with high biodiversity that is under threat.", "A place where volcanoes are active.", "A new national park."], "answer": 1},
            {"q": "What is the criteria for plant endemism in a hotspot?", "options": ["At least 100 species.", "At least 1,500 species.", "At least 5,000 species.", "No plants allowed."], "answer": 1},
            {"q": "Who proposed the hotspot concept in 1988?", "options": ["Charles Darwin.", "Norman Myers.", "Jane Goodall.", "David Attenborough."], "answer": 1},
            {"q": "What percentage of Earth's land do hotspots cover?", "options": ["50%.", "2.3%.", "10%.", "25%."], "answer": 1},
            {"q": "What is a major criticism of the hotspot approach?", "options": ["It costs too much money.", "It ignores larger, less threatened ecosystems.", "It doesn't protect enough plants.", "It is too scientific."], "answer": 1}
        ]
    },
    {
        "id": "r_48",
        "title": "Maslow's Hierarchy of Needs and Human Potential",
        "level": "B2",
        "text": "Abraham Maslow's hierarchy of needs is a psychological theory that describes a five-tier model of human motivations, often depicted as levels within a pyramid. From the bottom of the hierarchy upwards, the needs are: physiological (food and clothing), safety (job security), love and belonging needs (friendship), esteem, and self-actualization. Needs lower down in the hierarchy must be satisfied before individuals can attend to needs higher up. Self-actualization refers to the realization of a person's full potential, becoming everything that one is capable of becoming. While popular in management and education, the theory has been criticized for being overly simplistic and culturally biased, as some individuals may prioritize higher-level needs—like artistic expression—even when their basic needs aren't fully met.",
        "questions": [
            {"q": "What is the basic structure of Maslow's model?", "options": ["A map.", "A five-tier pyramid.", "A circle of life.", "A linear timeline."], "answer": 1},
            {"q": "What is at the very bottom of the hierarchy?", "options": ["Self-actualization.", "Physiological needs (food/water).", "Safety.", "Love."], "answer": 1},
            {"q": "Define 'self-actualization'.", "options": ["Buying a house.", "Realizing one's full potential.", "Having many friends.", "Getting a promotion."], "answer": 1},
            {"q": "What must happen before someone can reach higher-level needs?", "options": ["They must be rich.", "They must satisfy lower-level needs first.", "They must go to university.", "They must be alone."], "answer": 1},
            {"q": "Nane one criticism of the theory.", "options": ["It's too difficult to understand.", "It's overly simplistic and culturally biased.", "It ignores physical needs.", "It only applies to children."], "answer": 1}
        ]
    },
    {
        "id": "r_49",
        "title": "The Theory of Comparative Advantage in International Trade",
        "level": "C1",
        "text": "Comparative advantage is an economic theory about the work gains from trade for individuals, firms, or nations that arise from differences in their factor endowments or technological progress. David Ricardo developed the classical theory in 1817 to explain why countries engage in international trade even when one country's workers are more efficient at producing every single good than workers in other countries. He showed that if two countries capable of producing two commodities engage in the free market, then each country will increase its overall consumption by exporting the good for which it has a lower 'opportunity cost.' This leads to global specialization, where everyone does what they are relatively best at. However, critics point out that this can lead to dependency and ignore transition costs for displaced workers.",
        "questions": [
            {"q": "Who developed the theory of comparative advantage?", "options": ["Adam Smith.", "David Ricardo.", "John Maynard Keynes.", "Karl Marx."], "answer": 1},
            {"q": "What does the theory explain?", "options": ["Why trade is dangerous.", "Why countries trade even if one is more efficient at everything.", "How to set high taxes.", "The history of the steam engine."], "answer": 1},
            {"q": "What is the key factor in determining what to export?", "options": ["Highest price.", "Lowest opportunity cost.", "Total weight.", "Government rules."], "answer": 1},
            {"q": "What is the result of applying this theory globally?", "options": ["Total chaos.", "Global specialization.", "Higher prices.", "Less variety."], "answer": 1},
            {"q": "What is a downside mentioned by critics?", "options": ["Too much trade.", "Dependency and worker displacement.", "It is too easy to understand.", "It creates too many jobs."], "answer": 1}
        ]
    },
    {
        "id": "r_50",
        "title": "The Renaissance: Rebirth of Art and Science in Europe",
        "level": "C1",
        "text": "The Renaissance was a fervent period of European cultural, artistic, political, and economic 'rebirth' following the Middle Ages. Generally described as taking place from the 14th century to the 17th century, the Renaissance promoted the rediscovery of classical philosophy, literature, and art. Some of the greatest thinkers, authors, statesmen, scientists, and artists in human history thrived during this era, while global exploration opened up new lands and cultures to European commerce. The movement began in Italy, particularly Florence, powered by the wealth of the Medici banking family. A key concept was 'Humanism,' which shifted the focus from religious dogma to human potential and achievement. This period saw the invention of the printing press by Johannes Gutenberg, which revolutionized the spread of knowledge across the continent.",
        "questions": [
            {"q": "What does the word 'Renaissance' mean?", "options": ["War.", "Rebirth.", "A dark age.", "Technology."], "answer": 1},
            {"q": "Where did the Renaissance movement begin?", "options": ["London.", "Florence, Italy.", "Paris.", "Berlin."], "answer": 1},
            {"q": "Which family's wealth helped power the movement?", "options": ["The Windsors.", "The Medicis.", "The Romanovs.", "The Bourbons."], "answer": 1},
            {"q": "Define 'Humanism' in the Renaissance context.", "options": ["Focus on religious dogma only.", "Focus on human potential and achievement.", "The study of animals.", "Banning all art."], "answer": 1},
            {"q": "Which invention revolutionized the spread of knowledge?", "options": ["The telescope.", "The printing press (Gutenberg).", "The steam engine.", "The radio."], "answer": 1}
        ]
    }
]

data.extend(NEW_READING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_READING)} reading more modules (Total: {len(data)})")
