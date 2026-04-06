import json

PATH = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'

with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

NEW_LISTENING = [
    {
        "id": "l_21",
        "title": "Environmental Science: The Carbon Cycle and Global Warming",
        "level": "C1",
        "type": "Lecture",
        "transcript": "Today, we delve into the carbon cycle, the biogeochemical cycle by which carbon is exchanged among the biosphere, pedosphere, geosphere, hydrosphere, and atmosphere of the Earth. While carbon is a naturally occurring element essential for life, human activity has significantly disrupted this balance. The burning of fossil fuels and extensive deforestation have led to a net increase in atmospheric carbon dioxide. This, in turn, amplifies the greenhouse effect, trapping more heat in the Earth's atmosphere and leading to global warming. We'll also examine 'carbon sinks'—natural reservoirs like oceans and forests that absorb CO2. However, as oceans warm, their capacity to absorb carbon diminishes, creating a dangerous feedback loop that accelerates climatic shifts.",
        "questions": [
            {"q": "What is the primary subject of the lecture?", "options": ["The water cycle.", "The carbon cycle and global warming.", "The fossilization of dinosaurs.", "The growth of forests."], "answer": 1},
            {"q": "How has human activity disrupted the carbon balance?", "options": ["By planting too many trees.", "By burning fossil fuels and deforestation.", "By stopping all industrial work.", "By cooling the oceans."], "answer": 1},
            {"q": "What is the 'greenhouse effect' described as?", "options": ["A way to grow vegetables.", "The trapping of heat in the atmosphere.", "A method to clean the air.", "The cooling of the planet."], "answer": 1},
            {"q": "What are 'carbon sinks'?", "options": ["Kitchen appliances.", "Natural reservoirs that absorb CO2.", "Sources of carbon emissions.", "Waste disposal sites."], "answer": 1},
            {"q": "What happens as the oceans warm?", "options": ["They absorb more carbon.", "Their capacity to absorb carbon decreases.", "They turn into ice.", "They stop moving."], "answer": 1}
        ]
    },
    {
        "id": "l_22",
        "title": "Economics: The Concept of Opportunity Cost",
        "level": "B2",
        "type": "Lecture",
        "transcript": "In our introduction to microeconomics, we must master the concept of 'opportunity cost.' It's defined as the value of the next best alternative that is given up when a choice is made. Since resources—like time and money—are finite, every decision has an associated cost. For example, if you spend two hours studying for an economics exam, the opportunity cost is the two hours you could have spent sleeping or working. This principle applies to individuals, businesses, and even governments. When a government decides to invest in defense, the opportunity cost might be the schools or hospitals that could have been built with that same funding. Recognizing opportunity costs helps us make more rational decisions by evaluating the hidden trade-offs in our lives.",
        "questions": [
            {"q": "What is 'opportunity cost'?", "options": ["The price of a product.", "The value of the next best alternative given up.", "The profit made from a sale.", "The cost of manufacturing."], "answer": 1},
            {"q": "Why do all choices have an opportunity cost?", "options": ["Because people are greedy.", "Because resources like time and money are finite.", "Because of inflation.", "Because everything is free."], "answer": 1},
            {"q": "Give an example of an opportunity cost for a student.", "options": ["Paying for books.", "Time that could have been spent sleeping or working.", "Getting a high grade.", "The cost of tuition."], "answer": 1},
            {"q": "How does this concept apply to governments?", "options": ["They have unlimited money.", "Choosing to build schools instead of hospitals.", "Investing in one area means giving up another.", "They ignore costs."], "answer": 2},
            {"q": "What is the benefit of recognizing opportunity costs?", "options": ["It makes people unhappy.", "It helps in making rational decisions.", "It avoids all costs.", "It increases spending."], "answer": 1}
        ]
    },
    {
        "id": "l_23",
        "title": "Psychology: Cognitive Dissonance Theory",
        "level": "C1",
        "type": "Discussion",
        "transcript": "Let's discuss Leon Festinger's theory of 'cognitive dissonance,' which describes the mental discomfort we feel when we hold two conflicting beliefs or when our behavior contradicts our values. For example, if someone knows that smoking is harmful but continues to smoke, they experience dissonance. To reduce this discomfort, individuals often change their attitudes or justify their behavior. They might say, 'I only smoke occasionally' or 'It helps me relax.' This internal drive for consistency is a powerful motivator. We see this in everything from consumer choices to political affiliations, where people actively avoid information that challenges their existing worldview. Understanding dissonance helps us realize why people are often so resistant to change, even when faced with clear evidence.",
        "questions": [
            {"q": "What is 'cognitive dissonance'?", "options": ["A type of memory loss.", "Mental discomfort from conflicting beliefs.", "A positive state of mind.", "The ability to multitask."], "answer": 1},
            {"q": "Who is the primary theorist mentioned?", "options": ["Sigmund Freud.", "Leon Festinger.", "B.F. Skinner.", "Abraham Maslow."], "answer": 1},
            {"q": "Give an example of dissonance mentioned in the text.", "options": ["Cooking a meal.", "A smoker knowing that smoking is harmful.", "Reading a book.", "Going for a walk."], "answer": 1},
            {"q": "How do people typically reduce dissonance?", "options": ["By ignoring it forever.", "By changing attitudes or justifying behavior.", "By experiencing more stress.", "By asking for help."], "answer": 1},
            {"q": "Why is this theory important for understanding human behavior?", "options": ["It explains why people love change.", "It explains resistance to change and evidence.", "It shows that people are always rational.", "It helps in learning languages."], "answer": 1}
        ]
    },
    {
        "id": "l_24",
        "title": "Architecture: The Principles of High-Tech Architecture",
        "level": "C1",
        "type": "Lecture",
        "transcript": "High-tech architecture, also known as Late Modernism or Structural Expressionism, emerged in the 1970s, incorporating elements of high-tech industry and technology into building design. The primary characteristic is the 'honesty of structure,' where the functional elements—like pipes, ducts, and stairs—are placed on the exterior rather than being hidden. Think of the Pompidou Centre in Paris by Richard Rogers and Renzo Piano. This approach allows for a flexible 'well-serviced floor' inside, free from structural obstructions. It's a celebrate of engineering, often utilizing steel, glass, and prefabricated parts. While some critics called it 'cold' or 'inhuman,' proponents argue that it's the ultimate expression of the machine age, where the building's function is literally its form.",
        "questions": [
            {"q": "What is another name for High-tech architecture?", "options": ["Classical revival.", "Structural Expressionism.", "Gothic style.", "Minimalism."], "answer": 1},
            {"q": "What is meant by 'honesty of structure'?", "options": ["Using cheap materials.", "Exposing functional elements like pipes and ducts.", "Building small houses.", "Hiding the foundation."], "answer": 1},
            {"q": "Which famous building in Paris is given as an example?", "options": ["The Louvre.", "The Pompidou Centre.", "The Eiffel Tower.", "Notre Dame."], "answer": 1},
            {"q": "What is a benefit of placing structural elements on the outside?", "options": ["It's easier to paint.", "It allows for a flexible, open interior space.", "It's more expensive.", "It protects from the rain."], "answer": 1},
            {"q": "What materials are commonly used in this style?", "options": ["Wood and brick.", "Steel, glass, and prefabricated parts.", "Mud and straw.", "Stone and marble."], "answer": 1}
        ]
    },
    {
        "id": "l_25",
        "title": "Political Science: The Origins of the European Union",
        "level": "C1",
        "type": "Lecture",
        "transcript": "To understand the European Union, we must go back to the aftermath of World War II. The goal was to ensure that such devastation would never happen again. In 1951, the European Coal and Steel Community was formed, primarily by France and West Germany. The logic was simple: by integrating the industries needed for war—coal and steel—war between the members became 'not only unthinkable but materially impossible.' This was a revolutionary move toward supranationalism, where nations give up some sovereignty to a larger body. Over decades, this evolved through the Treaty of Rome and later the Maastricht Treaty into the EU we know today—a unique economic and political union of 27 member states. It's a constant experiment in balancing national identity with continental integration.",
        "questions": [
            {"q": "What was the primary initial goal of European integration?", "options": ["To increase trade with Asia.", "To prevent future wars in Europe.", "To build a common language.", "To explore space."], "answer": 1},
            {"q": "Which community was formed in 1951?", "options": ["The United Nations.", "The European Coal and Steel Community.", "The World Bank.", "The Olympic Committee."], "answer": 1},
            {"q": "What was the logic behind integrating coal and steel?", "options": ["To make them cheaper.", "To make war between members materially impossible.", "To build stronger houses.", "To protect the environment."], "answer": 1},
            {"q": "Define 'supranationalism' in this context.", "options": ["Creating more nations.", "Giving up some sovereignty to a larger body.", "Promoting local culture only.", "Ending all immigration."], "answer": 1},
            {"q": "Which treaty officially created the European Union as we know it?", "options": ["Treaty of Versailles.", "Maastricht Treaty.", "Treaty of London.", "Treaty of Paris."], "answer": 1}
        ]
    }
]

data.extend(NEW_LISTENING)
with open(PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Added {len(NEW_LISTENING)} listening more modules (Total: {len(data)})")
