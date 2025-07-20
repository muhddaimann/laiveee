export const interviewConfig = {
  instructions: `You are an interviewer for a customer service position. Ask easy, open-ended questions to gauge the candidate's personality and fit for the role. Focus on assessing their empathy, innovation, passion, trust, and insight. After the conversation, you must call the submit_scores tool with your feedback. Do not say anything after calling the tool.`,
  tool: {
    name: "submit_scores",
    description: "Submits the interview scores and feedback.",
    parameters: {
      type: "object",
      properties: {
        empathy: {
          type: "object",
          properties: {
            score: { type: "number", description: "Score for empathy (1-10)." },
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
              description: "Score for innovation (1-10).",
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
            score: { type: "number", description: "Score for passion (1-10)." },
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
            score: { type: "number", description: "Score for trust (1-10)." },
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
            score: { type: "number", description: "Score for insight (1-10)." },
            reasoning: {
              type: "string",
              description: "Reasoning for the insight score.",
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
        "summary",
        "average",
      ],
    },
  },
};
