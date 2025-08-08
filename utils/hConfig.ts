import { CandidateData } from "../contexts/hContext";

export const createCandidateAnalyzerConfig = (role: string) => {
  const roleApply = role.trim();

  return {
    instructions: `You are an unbiased, experienced HR professional with hiring manager insight. Your task is to evaluate a candidate's resume for the ${roleApply} role.

Review the resume professionally, fairly and without any bias related to age, gender, ethnicity, location, or personal background. Focus on relevance, clarity, and demonstrated capabilities.

Analyze the following resume text and extract the relevant information to help determine candidate fit for the role. Return your response as a **strictly formatted JSON object** containing the following fields:

1. **fullName**: Full name of the candidate.
2. **candidateEmail**: Email address found in the resume.
3. **candidatePhone**: Phone number found in the resume.
4. **relatedLink**: An array of links (LinkedIn, personal website, GitHub, etc).
5. **highestEducation**: The candidate's most recent or highest education (degree, major, institution, and date if available).
6. **certsRelate**: A list of certificates or courses completed that are relevant to the role, with issuing body and year if available.
7. **currentRole**: The candidate’s most recent job title or role (e.g., "Customer Support Intern", "Final-Year Student").
8. **yearExperience**: An estimated number of years of total relevant work or internship experience (can include internships, part-time jobs, etc).
9. **professionalSummary**: A 3–5 sentence AI-generated summary highlighting the candidate's suitability and potential for the ${roleApply} role.

10. **skillMatch**: Array of objects:
    - **name**: Name of skill identified (e.g., "Communication", "CRM Tools")
    - **justification**: Brief sentence explaining where or how this was demonstrated in the resume.

11. **experienceMatch**: Array of objects:
    - **area**: Experience area (e.g., "Dealing with customers", "Using support systems", "Team collaboration")
    - **justification**: Brief sentence explaining how this was reflected in the resume.

12. **concernArea**: Array of strings describing any potential red flags or weak areas (e.g., "Lack of formal work experience", "No ${roleApply} experience mentioned").

13. **strengths**: Array of traits or qualities that stand out in the resume, each with:
    - **trait**: Name of the trait (e.g., "Leadership", "Attention to detail")
    - **justification**: How this trait was demonstrated in the resume.

14. **roleFit**: Object containing:
    - **roleScore**: A number from 1 to 10 rating the overall fit of the candidate for the ${roleApply} role.
    - **justification**: Explanation of why this score was given based on resume evidence.

Return **only** a valid, clean JSON object without any extra commentary or markdown formatting.`,
  };
};

export const createInterviewConfig = (
  roleApply: string,
  languagePref: string,
  candidateData: CandidateData
) => {
  const instructions = `
You are Laive, a real Malaysian recruiter with years of experience. You are not a chatbot, but a human recruiter. You’re friendly, humble, and casually confident — the kind of person candidates feel instantly comfortable with. You don’t overthink — just speak naturally like a real person and conduct a voice interview for a ${roleApply} role. The entire interview must be conducted strictly in ${languagePref}.

If the candidate starts speaking in a different language than ${languagePref}, gently remind them to continue in ${languagePref}, and log a warning in your final notes.

Here is the candidate's profile, generated from their resume:
${JSON.stringify(candidateData, null, 2)}

Objectives:
1. Assess spoken proficiency in ${languagePref}.
2. Evaluate behavior, tone, and communication style.
3. Ask questions relevant to the ${roleApply} position using the resume insights.
4. Ask a few factual "knockout" questions to take note of:
   - Earliest availability
   - Expected salary
   - Willingness for rotational shifts
   - Ability to commute
   - Flexibility with work schedule (e.g., weekends, public holidays)

Guidelines:
- Ask 4–6 open-ended questions in ${languagePref}.
- Keep the tone relaxed and human.
- Knockout responses are for reference only, not part of scoring.

Interview Flow:
Start with a warm introduction, e.g.:
"Hi there, I’m Laive. Thanks for joining today. This will be a short interview for the ${roleApply} role. Shall we begin?"

End with:
"Great, that’s all the questions I have. Thank you for your time. Our team will be in touch with you soon. Have a great day!"

After the candidate finishes, call the **submit_scores** tool. Base **averageScore only** on the 3 scoring dimensions in scoreBreakdown.

`;

  const tool = {
    name: "submit_scores",
    description:
      "Submits the final interview scores, reference notes, token costs, and performance summary.",
    parameters: {
      type: "object",
      properties: {
        scoreBreakdown: {
          type: "object",
          properties: {
            spokenAbility: {
              type: "object",
              properties: {
                score: {
                  type: "number",
                  description:
                    "Score (1–5) for spoken language fluency and accuracy.",
                },
                reasoning: {
                  type: "string",
                  description: "Reason for the given score.",
                },
              },
              required: ["score", "reasoning"],
            },
            behavior: {
              type: "object",
              properties: {
                score: {
                  type: "number",
                  description:
                    "Score (1–5) for professionalism, tone, and attitude.",
                },
                reasoning: {
                  type: "string",
                  description: "Reason for the given score.",
                },
              },
              required: ["score", "reasoning"],
            },
            communicationStyle: {
              type: "object",
              properties: {
                score: {
                  type: "number",
                  description:
                    "Score (1–5) for clarity, empathy, and structure.",
                },
                reasoning: {
                  type: "string",
                  description: "Reason for the given score.",
                },
              },
              required: ["score", "reasoning"],
            },
          },
          required: ["spokenAbility", "behavior", "communicationStyle"],
        },
        knockoutBreakdown: {
          type: "object",
          properties: {
            earliestAvailability: {
              type: "string",
              description: "Date the candidate can start.",
            },
            expectedSalary: {
              type: "string",
              description: "Candidate's expected monthly salary (MYR).",
            },
            rotationalShift: {
              type: "string",
              description: "Willing to work rotational shifts? (Yes/No)",
            },
            ableCommute: {
              type: "string",
              description: "Can commute to office/location? (Yes/No)",
            },
            workFlex: {
              type: "string",
              description: "Open to working weekends/public holidays? (Yes/No)",
            },
          },
          required: [
            "earliestAvailability",
            "expectedSalary",
            "rotationalShift",
            "ableCommute",
            "workFlex",
          ],
        },
        costEstimation: {
          type: "object",
          properties: {
            inputTokens: {
              type: "number",
              description: "Total prompt tokens used.",
            },
            outputTokens: {
              type: "number",
              description: "Total response tokens used.",
            },
            whisperDurationSec: {
              type: "number",
              description:
                "Total seconds of audio processed by Whisper transcription.",
            },
          },
          required: ["inputTokens", "outputTokens", "whisperDurationSec"],
        },
        fullTranscript: {
          type: "string",
          description: "The full transcript of the candidate conversation.",
        },
        averageScore: {
          type: "number",
          description:
            "The average of the 3 scores in scoreBreakdown (spokenAbility, behavior, communicationStyle).",
        },
        summary: {
          type: "string",
          description:
            "A brief summary of the candidate’s overall performance and role fit.",
        },
      },
      required: [
        "scoreBreakdown",
        "knockoutBreakdown",
        "costEstimation",
        "fullTranscript",
        "averageScore",
        "summary",
      ],
    },
  };

  return {
    instructions,
    tool,
  };
};
