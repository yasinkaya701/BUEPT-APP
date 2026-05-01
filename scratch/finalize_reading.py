import json
import os

filepath = '/Users/yasinkaya/Desktop/BUEPT-APP/BUEPTApp/data/reading_tasks.json'

with open(filepath, 'r', encoding='utf-8') as f:
    data = json.load(f)

new_r2_tasks = [
    {
        "id": "READ_R2_01",
        "level": "C1",
        "title": "The Science of Boredom",
        "sub_type": "careful_reading",
        "is_pro_book_style": True,
        "time": "55 min",
        "text": "[Paragraph 1] Boredom has long been dismissed as a trivial emotional state — the minor irritation of a restless mind with nothing to do. In recent years, however, psychologists and neuroscientists have begun to study it more seriously, revealing it to be a remarkably complex and consequential experience. Boredom is now understood not merely as the absence of stimulation, but as an active state in which the mind is searching for meaning and engagement it cannot find. This distinction matters because it shifts the question from 'How do we stop being bored?' to 'What is boredom trying to tell us?'\n\n[Paragraph 2] Research has established a useful distinction between two forms of boredom: state boredom and trait boredom. State boredom is situational — it arises from a specific environment or task that offers insufficient stimulation, and it passes when the situation changes. Trait boredom, on the other hand, is a relatively stable personality characteristic: some individuals are chronically prone to boredom regardless of their circumstances. These individuals report lower life satisfaction, are more likely to engage in risk-taking behavior, and are at greater risk of depression and substance abuse than those who rarely experience boredom. However, researchers caution that the relationship may be mediated by third factors such as difficulty with self-regulation.\n\n[Paragraph 3] One of the more counterintuitive findings in boredom research is that boredom may have significant creative benefits. Studies by Sandi Mann and Rebekah Cadman found that participants who performed a boring task — copying out a phone book — subsequently showed greater creativity on divergent thinking tasks than a control group. The researchers proposed that boredom triggers the mind to wander in search of stimulation, and that mind-wandering activates what neuroscientists call the 'default mode network' — brain regions associated with daydreaming, imagination, and loose associative thinking underlying creativity. This suggests that immediately reaching for a phone at the first sign of boredom may be counterproductive, effectively short-circuiting a mental process with real cognitive value.\n\n[Paragraph 4] Despite its potential benefits, chronic boredom has serious negative consequences. Studies have linked it to overeating, excessive social media use, impulsive spending, and aggressive behavior. In occupational settings, boredom at work — sometimes called 'boreout,' in contrast to 'burnout' — leads to disengagement, absenteeism, and reduced productivity. Importantly, workplace boredom does not stem exclusively from tasks that are too simple; it can also arise when tasks are too complex and overwhelming, when workers lack clear goals, or when they feel their skills are being wasted. This complexity means that solutions must be more sophisticated than simply making jobs more challenging.\n\n[Paragraph 5] Perhaps the most philosophically interesting question raised by boredom research is what boredom reveals about the human need for meaning. Existentialist philosophers such as Martin Heidegger argued that profound boredom — the kind that strips away all distractions — forces the question of what one genuinely values. Modern psychologists have found empirical support for this view: studies show that individuals who tend to experience boredom as deeply aversive also score lower on measures of meaning in life and are more likely to describe their existence as purposeless. In this sense, boredom may function as an emotional signal — not simply an unpleasant state to be escaped, but a prompt to examine whether one's life is genuinely aligned with one's values.",
        "questions": [
            {
                "type": "short_answer",
                "q": "According to paragraph 1, how has the scientific understanding of boredom changed in recent years?",
                "answer": ["Boredom was previously dismissed as trivial — the absence of stimulation. Recent research has revealed it to be a complex, active state in which the mind searches for meaning and engagement it cannot find, raising deeper questions about what boredom signals."],
                "skill": "reading_comprehension"
            },
            {
                "type": "short_answer",
                "q": "From paragraph 2, we can understand that people with trait boredom are bored regardless of their environment and tend to have lower life satisfaction. (True/False)",
                "answer": ["True"],
                "skill": "reading_comprehension"
            },
            {
                "type": "short_answer",
                "q": "Considering paragraph 3, what makes the finding about boring tasks and creativity 'counterintuitive'?",
                "answer": ["It is counterintuitive because we would normally expect a boring task to reduce creativity or mental performance. Instead, the research found that doing a boring task actually increased creativity afterward — the opposite of what common sense would predict."],
                "skill": "reading_comprehension"
            },
            {
                "type": "short_answer",
                "q": "How does the author explain the relationship between boredom and creativity?",
                "answer": ["The author suggests that boredom triggers mind-wandering, which activates the brain's default mode network — associated with daydreaming and loose, associative thinking. This mental state is the kind of thinking that underlies creative idea generation."],
                "skill": "reading_comprehension"
            },
            {
                "type": "short_answer",
                "q": "What does boredom function as in the final paragraph?",
                "answer": ["Boredom functions as an emotional signal or a prompt to examine whether one's life is genuinely aligned with one's values and meaning."],
                "skill": "reading_comprehension"
            }
        ]
    },
    {
        "id": "READ_R2_02",
        "level": "C1",
        "title": "The Social Construction of Beauty",
        "sub_type": "careful_reading",
        "is_pro_book_style": True,
        "time": "55 min",
        "text": "[Paragraph 1] Beauty, most people feel, is immediately and personally recognizable — 'I know it when I see it.' Yet decades of research across psychology, anthropology, and cultural studies have increasingly challenged this intuition. While certain features — facial symmetry, clear skin, youthful appearance — appear to be preferred across cultures and may reflect evolutionary adaptations signaling health and reproductive fitness, the overwhelming evidence suggests that much of what any given society considers beautiful is not universal, not innate, and certainly not fixed. Beauty standards are socially constructed: they are produced, maintained, and contested through culture, power, and history.\n\n[Paragraph 2] Anthropological research has documented remarkable variation in beauty standards across societies and time periods. In many pre-industrial cultures, a heavier body was often seen as a sign of wealth and health, whereas in contemporary Western societies, thinness is frequently idealized as a marker of self-discipline and higher socioeconomic status. Similarly, skin tone preferences vary widely; while many cultures have historically prized light skin as a sign of leisure and status, others have celebrated deeper tones for their association with vitality and connection to the land. These shifts demonstrate that beauty is less about objective physical traits and more about the social meanings assigned to those traits.\n\n[Paragraph 3] The media plays a crucial role in the dissemination and reinforcement of these socially constructed standards. Through advertising, films, and social media, specific 'ideal' images are ubiquitous, often presenting an unattainable standard of perfection. This saturation can lead to 'social comparison,' where individuals evaluate their own appearance against these idealized images, often resulting in body dissatisfaction and lower self-esteem. Psychologists note that these standards are often racially biased and Eurocentric, marginalizing those who do not fit into a narrow, Western-defined category of beauty.\n\n[Paragraph 4] Furthermore, beauty standards are deeply intertwined with power dynamics. Historically, dominant groups have often defined beauty in ways that reflect their own characteristics, reinforcing their social status while stigmatizing 'the other.' In this way, beauty standards can function as a form of social control, pressuring individuals to conform to specific norms in order to achieve social and professional success. However, there is also resistance to these rigid standards. Movements promoting body positivity, inclusivity, and the celebration of natural features challenge the dominant narrative and advocate for a more diverse and equitable understanding of beauty.\n\n[Paragraph 5] In conclusion, while there may be some biological foundations to our aesthetic preferences, beauty is overwhelmingly a social product. It is a dynamic and evolving concept that reflects the values, biases, and power structures of a society. By recognizing beauty as a social construct, we can begin to deconstruct the harmful standards that contribute to inequality and body dissatisfaction, moving toward a culture that values human diversity in all its forms.",
        "questions": [
            {
                "type": "short_answer",
                "q": "What is the primary argument of the passage regarding beauty standards?",
                "answer": ["The primary argument is that beauty standards are socially constructed, meaning they are produced and maintained by culture and history rather than being universal or fixed."],
                "skill": "main_idea"
            },
            {
                "type": "short_answer",
                "q": "According to paragraph 2, why was a heavier body prized in some pre-industrial cultures?",
                "answer": ["A heavier body was seen as a sign of wealth and health in many pre-industrial cultures."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "What role does the media play in shaping beauty standards?",
                "answer": ["The media reinforces socially constructed standards by making specific 'ideal' images ubiquitous, leading to social comparison and often body dissatisfaction."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "How can beauty standards function as a form of social control?",
                "answer": ["They function as social control by pressuring individuals to conform to specific norms established by dominant groups in order to achieve success."],
                "skill": "inference"
            },
            {
                "type": "short_answer",
                "q": "What is the goal of movements like body positivity mentioned in paragraph 4?",
                "answer": ["The goal is to challenge rigid, dominant beauty standards and advocate for a more diverse and inclusive understanding of beauty."],
                "skill": "detail"
            }
        ]
    },
    {
        "id": "READ_R2_03",
        "level": "C1",
        "title": "The Impact of Urbanization on Mental Health",
        "sub_type": "careful_reading",
        "is_pro_book_style": True,
        "time": "55 min",
        "text": "[Paragraph 1] Urbanization is one of the most defining trends of the 21st century, with more than half of the world's population now living in cities. While urban living offers numerous economic and social opportunities, it also presents significant challenges for mental health. Research consistently shows that urban dwellers are at a higher risk for mental health disorders, such as anxiety and depression, compared to those living in rural areas. This 'urban penalty' is often attributed to a combination of environmental stressors, social isolation, and the fast-paced nature of city life.\n\n[Paragraph 2] One of the primary environmental stressors in cities is noise pollution. Constant exposure to traffic, construction, and high population density can lead to chronic stress and sleep disruption, both of which are major risk factors for mental illness. Additionally, the lack of green spaces and natural light in many urban environments can negatively impact mood and cognitive function. 'Biophilia,' the innate human tendency to seek connections with nature, is often stifled in modern cities, leading to a sense of disconnection and increased psychological distress.\n\n[Paragraph 3] Socially, cities can be paradoxically isolating. Despite the high density of people, urban environments often lack the close-knit social support systems found in rural communities. The transient nature of urban populations and the prevalence of single-person households can lead to feelings of loneliness and social fragmentation. Furthermore, the high level of social competition and the pressure to succeed in a competitive urban environment can exacerbate stress and feelings of inadequacy.\n\n[Paragraph 4] The fast-paced nature of city life also contributes to 'urban stress.' The constant demand for attention and the rapid influx of information can lead to cognitive overload and mental fatigue. This state of perpetual 'fight-or-flight' can drain mental resources and reduce an individual's resilience to stress. Psychologists argue that the 'always-on' culture of modern cities prevents individuals from having the necessary downtime for mental recovery and reflection.\n\n[Paragraph 5] To address these challenges, urban planners and policymakers must prioritize mental health in city design. This includes increasing the amount of green and blue spaces, reducing noise pollution, and creating environments that foster social connection and community. 'Healthy urbanism' advocates for cities that are designed with human needs in mind, promoting physical activity, social interaction, and access to nature. Ultimately, creating mentally healthy cities requires a holistic approach that recognizes the deep connection between our environment and our psychological well-being.",
        "questions": [
            {
                "type": "short_answer",
                "q": "What is the 'urban penalty' referred to in paragraph 1?",
                "answer": ["The 'urban penalty' refers to the higher risk of mental health disorders, such as anxiety and depression, experienced by urban dwellers compared to rural populations."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "How does noise pollution in cities affect mental health?",
                "answer": ["Constant noise from traffic and construction leads to chronic stress and sleep disruption, which are significant risk factors for mental illness."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "Explain the concept of 'biophilia' and its importance in urban design.",
                "answer": ["Biophilia is the innate human need to connect with nature. Its stifling in cities due to lack of green space leads to disconnection and psychological distress."],
                "skill": "inference"
            },
            {
                "type": "short_answer",
                "q": "Why is city living described as 'paradoxically isolating'?",
                "answer": ["It is paradoxical because despite being surrounded by many people, urban environments lack close-knit support systems, leading to loneliness and fragmentation."],
                "skill": "inference"
            },
            {
                "type": "short_answer",
                "q": "What are some recommendations for urban planners to improve mental health?",
                "answer": ["Recommendations include increasing green/blue spaces, reducing noise, and designing environments that foster social connection and community."],
                "skill": "detail"
            }
        ]
    },
    {
        "id": "READ_R2_04",
        "level": "C1",
        "title": "The Ethical Implications of Genetic Engineering",
        "sub_type": "careful_reading",
        "is_pro_book_style": True,
        "time": "55 min",
        "text": "[Paragraph 1] The rapid advancement of genetic engineering technologies, particularly CRISPR-Cas9, has opened up unprecedented possibilities for modifying the human genome. While these technologies hold the promise of curing genetic diseases and improving human health, they also raise profound ethical questions. The ability to edit DNA at the embryonic stage, known as germline editing, is particularly controversial because these changes are heritable and could permanently alter the human gene pool.\n\n[Paragraph 2] One of the primary ethical concerns is the potential for 'designer babies.' Proponents of genetic engineering argue that parents should have the right to choose certain traits for their children, such as increased intelligence or physical prowess. However, critics warn that this could lead to a new form of eugenics, where social and economic inequalities are reinforced through genetic enhancement. The fear is that only the wealthy will have access to these technologies, creating a genetically 'enhanced' upper class and further marginalizing those who cannot afford it.\n\n[Paragraph 3] Furthermore, the long-term consequences of germline editing are unknown. Genetic engineering is a complex process, and unintended 'off-target' effects could lead to unforeseen health problems in future generations. The lack of consensus on the safety and efficacy of these technologies has led many scientists and ethicists to call for a global moratorium on germline editing until its implications are fully understood. The irreversibility of such changes means that we must proceed with extreme caution.\n\n[Paragraph 4] There are also concerns about the impact of genetic engineering on human diversity and our understanding of what it means to be human. By choosing certain traits and eliminating others, we risk narrowing the range of human variation. This could lead to a loss of the very diversity that has allowed our species to thrive and adapt. Additionally, the move toward genetic perfection could increase social pressure to conform to specific norms, further stigmatizing those with disabilities or 'non-ideal' traits.\n\n[Paragraph 5] In conclusion, while genetic engineering offers immense potential for medical advancement, it also presents significant ethical and social challenges. Navigating this new frontier requires careful consideration of the potential risks and benefits, as well as a robust public dialogue on the values we want to uphold. Ultimately, the future of genetic engineering should be guided by a commitment to justice, equity, and the preservation of human dignity for all.",
        "questions": [
            {
                "type": "short_answer",
                "q": "Why is germline editing particularly controversial?",
                "answer": ["It is controversial because the changes are heritable and could permanently alter the human gene pool."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "What is the 'designer baby' concern mentioned in paragraph 2?",
                "answer": ["The concern is that parents might choose specific traits for their children, potentially leading to a new form of eugenics and reinforcing socioeconomic inequalities."],
                "skill": "inference"
            },
            {
                "type": "short_answer",
                "q": "What are 'off-target' effects in genetic engineering?",
                "answer": ["Off-target effects are unintended genetic changes that could lead to unforeseen health problems in future generations."],
                "skill": "detail"
            },
            {
                "type": "short_answer",
                "q": "How might genetic engineering impact human diversity?",
                "answer": ["It might narrow the range of human variation by selecting only 'ideal' traits, potentially reducing our species' ability to adapt."],
                "skill": "inference"
            },
            {
                "type": "short_answer",
                "q": "What values should guide the future of genetic engineering according to the author?",
                "answer": ["The author argues that it should be guided by commitment to justice, equity, and the preservation of human dignity."],
                "skill": "main_idea"
            }
        ]
    }
]

existing_ids = {item.get('id') for item in data if item.get('id') is not None}
for item in new_r2_tasks:
    if item.get('id') not in existing_ids:
        data.append(item)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print(f"Finalizing Reading Library: Added R2 series tasks. Total is now {len(data)}.")
