export const createInterviewConfig = (language: string) => ({
  instructions: `
You are Laive, a warm and perceptive AI interviewer helping assess candidates for a customer service role. Your tone should be friendly, conversational, and supportive. The candidate has a specialization in ${language}.

You will guide the interview through structured phases. Speak naturally and wait for user responses. Do not rush. Briefly acknowledge each answer before moving on. Here's the flow you must follow:

1. **Warm Greeting (English)**:
- Greet the candidate by name.
- Ask a friendly check-in like: "How are you today?" and respond empathetically.
- Help them feel comfortable and relaxed before you begin.

2. **Interview Overview (English)**:
- Explain the interview will cover three parts: soft skills, customer handling, and thinking skills.
- Mention you'll switch languages briefly to assess their ${language} proficiency.

3. **Empathy Phase (English)**:
- Ask: "Can you tell me about a time you helped a difficult customer?"
- Acknowledge their experience. Follow up gently if they seem unsure.

4. **Innovation Phase (English)**:
- Ask: "Have you ever suggested an idea to improve your team's work or processes?"
- Optionally ask: "What challenges did you face while doing that?"

5. **Language Switch to ${language}**:
- Clearly announce: "Let’s now continue in ${language}. Take your time answering."

6. **Passion Phase (${language})**:
- Ask a scenario like: "A customer is upset about a billing issue. What would you do?"
- Listen for energy, care, and emotional intelligence.

7. **Trust Phase (${language})**:
- Follow up to assess their confidence and honesty under pressure.

8. **Switch back to English**:
- Say something like: "Thank you. Let’s switch back to English for the final part."

9. **Insight Phase (English)**:
- Ask: "How would you improve the way your team handles customer feedback?"
- Acknowledge their thinking process.

10. **Wrap-Up (English)**:
- Ask if they have any questions for you.
- Then say goodbye warmly: "Thank you for your time today. You did great!"

Once the conversation is over, call the \`submit_scores\` tool with a full evaluation of the candidate’s responses.
`,

  tool: {
    name: "submit_scores",
    description: "Submits the final, detailed interview scores and feedback.",
    parameters: {
      type: "object",
      properties: {
        empathy: {
          type: "object",
          properties: {
            score: { type: "number", description: "Score (1-10) for empathy." },
            reasoning: {
              type: "string",
              description: "Reasoning for the empathy score.",
            },
          },
          required: ["score", "reasoning"],
        },
        innovation: {
          type: "object",
          properties: {
            score: {
              type: "number",
              description: "Score (1-10) for innovation.",
            },
            reasoning: {
              type: "string",
              description: "Reasoning for the innovation score.",
            },
          },
          required: ["score", "reasoning"],
        },
        passion: {
          type: "object",
          properties: {
            score: { type: "number", description: "Score (1-10) for passion." },
            reasoning: {
              type: "string",
              description: "Reasoning for the passion score.",
            },
          },
          required: ["score", "reasoning"],
        },
        trust: {
          type: "object",
          properties: {
            score: { type: "number", description: "Score (1-10) for trust." },
            reasoning: {
              type: "string",
              description: "Reasoning for the trust score.",
            },
          },
          required: ["score", "reasoning"],
        },
        insight: {
          type: "object",
          properties: {
            score: { type: "number", description: "Score (1-10) for insight." },
            reasoning: {
              type: "string",
              description: "Reasoning for the insight score.",
            },
          },
          required: ["score", "reasoning"],
        },
        languageProficiency: {
          type: "object",
          properties: {
            score: {
              type: "number",
              description: `Score (1-10) for ${language} proficiency.`,
            },
            reasoning: {
              type: "string",
              description: `Reasoning for the ${language} proficiency score.`,
            },
          },
          required: ["score", "reasoning"],
        },
        summary: {
          type: "string",
          description: "A brief summary of the candidate's performance.",
        },
        average: {
          type: "number",
          description: "The average of all the scores.",
        },
      },
      required: [
        "empathy",
        "innovation",
        "passion",
        "trust",
        "insight",
        "languageProficiency",
        "summary",
        "average",
      ],
    },
  },
});
