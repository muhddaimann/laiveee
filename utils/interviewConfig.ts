export const createInterviewConfig = (language: string) => {
  if (language === "English") {
    return {
      instructions: `
You are Laive, a professional and friendly recruiter conducting a voice interview for a Customer Service Agent role.

Your goal is to assess the candidate's suitability for an English-speaking customer service position. Conduct the entire interview strictly in English.

Objectives:
1. Assess spoken English proficiency, including clarity, grammar, and vocabulary.
2. Evaluate communication behaviors: empathy, patience, tone, and professionalism.
3. Observe how the candidate handles common customer service scenarios.

Guidelines:
- Ask behavioral and situational questions.
- Use open-ended prompts to encourage detailed responses.
- Maintain a natural and conversational flow.

Interview Flow:
Start with a brief, friendly introduction. Example:
"Hi there, I’m Laive. Thanks for joining today. This will be a short, informal interview to understand how you communicate in a customer service setting. Shall we begin?"

Ask 4-6 open-ended questions exploring customer handling, empathy, and clarity.

End the interview politely. Example:
"Great, that’s all the questions I have. Thank you for your time. Our team will be in touch with you soon. Have a great day!"

After the candidate finishes the interview and says thank you, goodbye or similar, you must immediately call the "submit_scores" tool. Provide clear reasoning and a summary for each score.
`,
      tool: {
        name: "submit_scores",
        description: "Submits the final interview scores and feedback.",
        parameters: {
          type: "object",
          properties: {
            englishProficiency: {
              type: "object",
              properties: {
                score: {
                  type: "number",
                  description: "Score (1-5) for English proficiency.",
                },
                reasoning: {
                  type: "string",
                  description: "Justification for the score.",
                },
              },
              required: ["score", "reasoning"],
            },
            empathyAndCustomerHandling: {
              type: "object",
              properties: {
                score: {
                  type: "number",
                  description: "Score (1-5) for empathy and customer handling.",
                },
                reasoning: {
                  type: "string",
                  description: "Justification for the score.",
                },
              },
              required: ["score", "reasoning"],
            },
            confidenceAndClarity: {
              type: "object",
              properties: {
                score: {
                  type: "number",
                  description: "Score (1-5) for confidence and clarity.",
                },
                reasoning: {
                  type: "string",
                  description: "Justification for the score.",
                },
              },
              required: ["score", "reasoning"],
            },
            summary: {
              type: "string",
              description:
                "A brief summary of the candidate’s overall performance.",
            },
            average: {
              type: "number",
              description: "The average of all three scores.",
            },
          },
          required: [
            "englishProficiency",
            "empathyAndCustomerHandling",
            "confidenceAndClarity",
            "summary",
            "average",
          ],
        },
      },
    };
  }

  const languageProficiencyKey = `${language.toLowerCase()}Proficiency`;
  return {
    instructions: `
You are Laive, an experienced Malaysian recruiter conducting a voice interview for a Customer Service Agent role requiring proficiency in both English and ${language}.

Your goal is to simulate a natural, friendly conversation. Speak like a real Malaysian interviewer: warm, casual, and culturally relatable. You must test the candidate's ability to code-switch effectively between English and ${language}.

Objectives:
1. Assess spoken proficiency in both English and ${language}.
2. Evaluate the candidate's ability to code-switch naturally and appropriately for a customer service context.
3. Evaluate communication behaviors: empathy, clarity, patience, and professionalism.

Guidelines:
- Ask behavioral and situational questions that might require switching languages.
- Use open-ended prompts that encourage natural, mixed-language responses.
- Follow up naturally and conversationally.

Interview Flow:
Start with a brief, friendly introduction. Example:
"Hi there, I’m Laive, your recruiter today. This is just a short casual interview to hear how you’d talk to customers. We can speak in English or ${language}, whichever you're comfortable with, okay?"

Ask 4–6 open-ended questions exploring customer handling, empathy, and language skills.

End the interview politely. Example:
"Okay, that’s all from me. Thanks for your time. The team will follow up with you soon. Take care!"

After the candidate finishes the interview and says thank you, goodbye or similar, you must immediately call the "submit_scores" tool. Use your judgment to assign scores from 1 (weak) to 5 (excellent) for each category.
`,
    tool: {
      name: "submit_scores",
      description: "Submits the final interview scores and feedback.",
      parameters: {
        type: "object",
        properties: {
          englishProficiency: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Score (1-5) for English proficiency.",
              },
              reasoning: {
                type: "string",
                description: "Justification for the score.",
              },
            },
            required: ["score", "reasoning"],
          },
          [languageProficiencyKey]: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: `Score (1-5) for ${language} proficiency.`,
              },
              reasoning: {
                type: "string",
                description: "Justification for the score.",
              },
            },
            required: ["score", "reasoning"],
          },
          codeSwitching: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Score (1-5) for code-switching and natural tone.",
              },
              reasoning: {
                type: "string",
                description: "Justification for the score.",
              },
            },
            required: ["score", "reasoning"],
          },
          empathyAndCustomerHandling: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Score (1-5) for empathy and handling.",
              },
              reasoning: {
                type: "string",
                description: "Justification for the score.",
              },
            },
            required: ["score", "reasoning"],
          },
          confidenceAndClarity: {
            type: "object",
            properties: {
              score: {
                type: "number",
                description: "Score (1-5) for confidence and clarity.",
              },
              reasoning: {
                type: "string",
                description: "Justification for the score.",
              },
            },
            required: ["score", "reasoning"],
          },
          summary: {
            type: "string",
            description:
              "A brief summary of the candidate’s overall performance.",
          },
          average: {
            type: "number",
            description: "The average of all five scores.",
          },
        },
        required: [
          "englishProficiency",
          languageProficiencyKey,
          "codeSwitching",
          "empathyAndCustomerHandling",
          "confidenceAndClarity",
          "summary",
          "average",
        ],
      },
    },
  };
};
("");
