import json

def overhaul_listening_batch_3():
    path = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/listening_tasks.json'
    with open(path, 'r') as f:
        tasks = json.load(f)

    # --- Task 7: Water Policy (id: l_p5_h03) ---
    task7 = next((t for t in tasks if t.get("title") == "Seminar Briefing: Water Policy Under Climate Uncertainty"), None)
    if task7:
        task7["questions"] = [
            {
                "type": "short_answer",
                "q": "Why have historical baselines for water supply become less reliable for planners?",
                "answer": ["Climate volatility"],
                "skill": "detail",
                "explain": "The speaker says climate volatility has made long-term averages less reliable."
            },
            {
                "type": "short_answer",
                "q": "Compare the two planning models: What does the first model prioritize?",
                "answer": ["Efficiency"],
                "skill": "detail",
                "explain": "The first model prioritizes efficiency by allocating to high-value sectors."
            },
            {
                "type": "short_answer",
                "q": "What is the core strategy of the 'resilience' model?",
                "answer": ["Reserving a strategic buffer"],
                "skill": "detail",
                "explain": "The resilience model reserves a buffer even when short-term indicators are favorable."
            },
            {
                "type": "short_answer",
                "q": "What is the primary risk of the 'efficiency' model when forecasts are inaccurate?",
                "answer": ["It can amplify shortages"],
                "skill": "inference",
                "explain": "Efficiency performs well in stable years but can amplify shortages when forecasts fail."
            },
            {
                "type": "short_answer",
                "q": "Why do agricultural groups oppose reserve targets?",
                "answer": ["They worry it will limit seasonal flexibility"],
                "skill": "detail",
                "explain": "Agricultural groups worry that reserve targets limit flexibility."
            },
            {
                "type": "short_answer",
                "q": "What do both municipal and agricultural groups agree on despite their differences?",
                "answer": ["Clearer trigger thresholds and transparent communication"],
                "skill": "main_idea",
                "explain": "Both groups support thresholds and transparency."
            },
            {
                "type": "short_answer",
                "q": "Mention two of the adaptive rules recommended in the final summary.",
                "answer": ["Update allocations monthly / Publish uncertainty ranges / Targeted compensation"],
                "skill": "detail",
                "explain": "The speaker recommends monthly updates, uncertainty ranges, and compensation."
            },
            {
                "type": "cloze",
                "q": "The group in the pilot study scored ______ higher on delayed recall thanks to better recap timing.",
                "options": ["5%", "10%", "15%", "25%"],
                "answer": 2,
                "skill": "detail",
                "explain": "The pilot showed a 15% improvement."
            }
        ]

    # --- Task 8: Dark Matter (id: LIST_BUEPT_11) ---
    task8 = next((t for t in tasks if t.get("title") == "Dark Matter: The Unseen Scaffolding of the Universe"), None)
    if task8:
        task8["questions"] = [
            {
                "type": "short_answer",
                "q": "What percentage of the cosmos is made of baryonic matter versus dark matter?",
                "answer": ["5% baryonic, 25% dark matter"],
                "skill": "detail",
                "explain": "Baryonic matter is 5%, dark matter is 25%."
            },
            {
                "type": "short_answer",
                "q": "Why is dark matter impossible to observe directly with telescopes?",
                "answer": ["It does not interact with the electromagnetic spectrum", "It neither absorbs, reflects, nor emits light"],
                "skill": "mechanism",
                "explain": "The talk explains it doesn't interact with the electromagnetic spectrum."
            },
            {
                "type": "short_answer",
                "q": "What specifically is observed about the rotation of spiral galaxies that suggests dark matter?",
                "answer": ["Stars at the galactic periphery orbit much faster than their visible mass suggests"],
                "skill": "detail",
                "explain": "Peripheral stars orbit faster than visible mass alone would allow."
            },
            {
                "type": "short_answer",
                "q": "How does the speaker describe the role of dark matter in the universe's structure?",
                "answer": ["The unseen scaffolding / The invisible glue"],
                "skill": "vocabulary",
                "explain": "The speaker uses these terms to describe dark matter's role."
            },
            {
                "type": "cloze",
                "q": "Explicit signposting in speech reduced listener confusion by ______ in the second pilot observation.",
                "options": ["8%", "12%", "18%", "24%"],
                "answer": 2,
                "skill": "detail",
                "explain": "Confusion was reduced by 18%."
            },
            {
                "type": "short_answer",
                "q": "What is the speaker's main purpose in the final segment regarding 'signposting'?",
                "answer": ["To show that organization directly shapes comprehension"],
                "skill": "summary",
                "explain": "The speaker argues organization is not merely cosmetic."
            }
        ]

    # --- Task 9: Behavioral Finance (id: LIST_BUEPT_12) ---
    task9 = next((t for t in tasks if t.get("title") == "Behavioral Finance: The Psychology of Market Inefficiency"), None)
    if task9:
        task9["questions"] = [
            {
                "type": "short_answer",
                "q": "What does the Efficient Market Hypothesis (EMH) assume about investors?",
                "answer": ["They are perfectly rational actors"],
                "skill": "detail",
                "explain": "EMH assumes rational actors who incorporate all info immediately."
            },
            {
                "type": "short_answer",
                "q": "According to 'loss aversion,' how does the pain of losing money compare to the joy of gaining it?",
                "answer": ["It is twice as powerful", "2x"],
                "skill": "detail",
                "explain": "Loss aversion suggests the pain is twice as powerful."
            },
            {
                "type": "short_answer",
                "q": "Define the 'disposition effect' as mentioned in the lecture.",
                "answer": ["Investors hold onto losing stocks too long while selling winners too early"],
                "skill": "vocabulary",
                "explain": "This is the specific behavioral effect defined in the talk."
            },
            {
                "type": "short_answer",
                "q": "How does 'herding behavior' contribute to market instability?",
                "answer": ["It facilitates the formation of speculative bubbles"],
                "skill": "inference",
                "explain": "Herding (mimicking others) leads to speculative bubbles."
            },
            {
                "type": "short_answer",
                "q": "What happens to market prices as a result of these cognitive biases?",
                "answer": ["They deviate significantly from their intrinsic value"],
                "skill": "detail",
                "explain": "Biases cause prices to move away from intrinsic value."
            },
            {
                "type": "short_answer",
                "q": "What is the critical listening pace mentioned in the caution?",
                "answer": ["170 words per minute", "170 wpm"],
                "skill": "detail",
                "explain": "Accuracy drops sharply above 170 wpm."
            }
        ]

    with open(path, 'w') as f:
        json.dump(tasks, f, indent=4)
    print("Successfully overhauled batch 3 (Tasks 7-9).")

if __name__ == "__main__":
    overhaul_listening_batch_3()
