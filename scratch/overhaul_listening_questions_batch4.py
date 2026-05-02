import json

def overhaul_listening_batch_4():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- Task 10: Soil Depletion (id: LIST_BUEPT_13) ---
    task10 = next((t for t in tasks if t.get("title") == "Soil Depletion and the Threat to Global Food Security"), None)
    if task10:
        task10["questions"] = [
            {
                "type": "short_answer",
                "q": "Which specific layer of soil is identified as a vital but neglected resource?",
                "answer": ["The topsoil"],
                "skill": "detail",
                "explain": "The talk states the topsoil is often taken for granted."
            },
            {
                "type": "short_answer",
                "q": "What two industrial farming practices have accelerated soil depletion?",
                "answer": ["Industrialized monoculture and excessive use of chemical fertilizers"],
                "skill": "detail",
                "explain": "Monoculture and fertilizers are named as the primary causes."
            },
            {
                "type": "short_answer",
                "q": "What happens to the soil when it is not allowed to remain fallow?",
                "answer": ["It is stripped of organic matter and microbial diversity"],
                "skill": "detail",
                "explain": "Continuous farming without fallow periods strips the soil of vital components."
            },
            {
                "type": "short_answer",
                "q": "How does soil erosion affect the land's relationship with water?",
                "answer": ["It reduces the land’s hydraulic capacity"],
                "skill": "inference",
                "explain": "Erosion makes agriculture more vulnerable to climatic volatility by reducing water capacity."
            },
            {
                "type": "short_answer",
                "q": "What is the consequence of declining nutrient density in the soil for human nutrition?",
                "answer": ["The nutritional value of crops diminishes"],
                "skill": "detail",
                "explain": "Less nutrients in the soil means less nutrients in the food."
            },
            {
                "type": "short_answer",
                "q": "Name two regenerative techniques recommended by the speaker to mitigate soil depletion.",
                "answer": ["Conservation tillage and crop rotation"],
                "skill": "detail",
                "explain": "The speaker suggests these as paramount imperatives."
            },
            {
                "type": "cloze",
                "q": "In a pilot study, recap segments delivered immediately after a complex section improved recall by ______.",
                "options": ["5%", "10%", "15%", "20%"],
                "answer": 2,
                "skill": "detail",
                "explain": "The pilot showed a 15% improvement."
            }
        ]

    # --- Task 11: The Concept of 'The Other' (id: LIST_BUEPT_14) ---
    task11 = next((t for t in tasks if t.get("title") == "The Concept of 'The Other' in Post-Colonial Theory"), None)
    if task11:
        task11["questions"] = [
            {
                "type": "short_answer",
                "q": "What mechanism does Edward Said identify as central to imperial hegemony?",
                "answer": ["The 'Othering' of non-Western cultures"],
                "skill": "detail",
                "explain": "Said's 'Orientalism' focuses on the mechanism of Othering."
            },
            {
                "type": "short_answer",
                "q": "How did Western powers justify colonial administration through 'Orientalism'?",
                "answer": ["By constructing a distorted, exoticized image of the East"],
                "skill": "detail",
                "explain": "The West exoticized the East to make colonial rule seem necessary."
            },
            {
                "type": "short_answer",
                "q": "What are the common binary oppositions used to frame non-Western societies?",
                "answer": ["Irrational, stagnant, or mystical (versus the rational 'Self')"],
                "skill": "detail",
                "explain": "The East was framed as irrational/stagnant while the West was the 'Self'."
            },
            {
                "type": "short_answer",
                "q": "What is the psychological consequence of this binary framing for the colonial subject?",
                "answer": ["Dehumanization"],
                "skill": "inference",
                "explain": "This binary opposition facilitates the dehumanization of the subject."
            },
            {
                "type": "short_answer",
                "q": "Why is understanding this 'psychological architecture' still relevant today?",
                "answer": ["To deconstruct stereotypes in global geopolitics and academic narratives"],
                "skill": "main_idea",
                "explain": "These dynamics still influence modern narratives and politics."
            },
            {
                "type": "cloze",
                "q": "Explicit signposting was found to reduce listener confusion by ______ in a comparative run.",
                "options": ["10%", "15%", "18%", "22%"],
                "answer": 2,
                "skill": "detail",
                "explain": "Confusion was reduced by 18%."
            }
        ]

    # --- Task 12: AI and Artistic Creativity (id: LIST_BUEPT_15) ---
    task12 = next((t for t in tasks if t.get("title") == "AI and the Limits of Artistic Creativity"), None)
    if task12:
        task12["questions"] = [
            {
                "type": "short_answer",
                "q": "What is the primary argument against the idea that AI is truly 'creative'?",
                "answer": ["It relies on pattern recognition and existing data rather than intent or emotion"],
                "skill": "main_idea",
                "explain": "AI lacks the human 'spark' of original intent and emotional experience."
            },
            {
                "type": "short_answer",
                "q": "How do generative models produce art, according to the speaker?",
                "answer": ["By synthesizing vast datasets of human-made work"],
                "skill": "detail",
                "explain": "AI art is a synthesis of previous human work."
            },
            {
                "type": "short_answer",
                "q": "What essential human quality is missing from AI-generated content?",
                "answer": ["Subjectivity", "Conscious intent", "Lived experience"],
                "skill": "inference",
                "explain": "AI lacks the subjective experience that defines human art."
            },
            {
                "type": "short_answer",
                "q": "What do proponents of AI art argue about the role of the AI?",
                "answer": ["It is a tool that expands the creative potential of the human artist"],
                "skill": "detail",
                "explain": "Proponents see AI as a sophisticated brush or instrument."
            },
            {
                "type": "short_answer",
                "q": "What ethical concern is raised regarding the training of AI models?",
                "answer": ["Unauthorized use of copyrighted human work"],
                "skill": "detail",
                "explain": "The debate often centers on intellectual property rights."
            }
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Successfully overhauled batch 4 (Tasks 10-12).")

if __name__ == "__main__":
    overhaul_listening_batch_4()
