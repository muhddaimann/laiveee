export const createAlphaConfig = (roleApply: string, resumeText: string) => {
  const instructions = `
You are an expert HR analyst. Your task is to analyze the provided resume text for a candidate applying for the role of a ${roleApply}.

Analyze the following resume content:
---BEGIN RESUME---
${resumeText}
---END RESUME---

Based on the resume, you must call the 'submit_analysis' tool with the following information:
1.  **summary**: A concise, professional summary of the candidate's profile (3-4 sentences).
2.  **strengths**: An array of the candidate's top 3-5 professional strengths.
3.  **skills**: An array of the candidate's key technical and soft skills.
4.  **jobMatch**: A percentage string (e.g., "85%") estimating the candidate's fit for the ${roleApply} role, based *only* on the resume content.
5.  **email**: The candidate's email address, extracted from the resume.
6.  **phone**: The candidate's phone number, extracted from the resume.
`;

  const tool = {
    name: "submit_analysis",
    description: "Submits the final analysis of the candidate's resume.",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description:
            "A concise, professional summary of the candidate's profile.",
        },
        strengths: {
          type: "array",
          items: { type: "string" },
          description:
            "An array of the candidate's top professional strengths.",
        },
        skills: {
          type: "array",
          items: { type: "string" },
          description:
            "An array of the candidate's key technical and soft skills.",
        },
        jobMatch: {
          type: "string",
          description:
            "A percentage string estimating the candidate's fit for the role.",
        },
        email: {
          type: "string",
          description: "The candidate's email address.",
        },
        phone: {
          type: "string",
          description: "The candidate's phone number.",
        },
      },
      required: [
        "summary",
        "strengths",
        "skills",
        "jobMatch",
        "email",
        "phone",
      ],
    },
  };

  return {
    instructions,
    tool,
  };
};
