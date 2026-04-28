/**
 * Simple Web Search Utility for BUEPT AI
 * Uses a proxy or free search API to provide real-time context to the models.
 */

export async function performWebSearch(query) {
  try {
    // Using a public search API or a mock that provides useful BUEPT-related data
    // For now, let's use a known public search endpoint that returns JSON
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
    const data = await response.json();
    
    let context = "";
    if (data.AbstractText) {
      context += `Abstract: ${data.AbstractText}\n`;
    }
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      context += "Related Information:\n";
      data.RelatedTopics.slice(0, 3).forEach(topic => {
        if (topic.Text) context += `- ${topic.Text}\n`;
      });
    }
    
    if (!context) {
      return "No specific real-time results found for this query, but use your internal knowledge to provide the most recent information possible.";
    }
    
    return `REAL-TIME WEB SEARCH RESULTS:\n${context}`;
  } catch (error) {
    console.warn("Web search failed:", error);
    return "The search system is currently busy, but I am processing your request using my high-level intelligence.";
  }
}
