import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface QuestionPaperSettings {
  schoolName: string;
  grade: string;
  board: string;
  subject: string;
  chapters: string;
  includeImages: boolean;
  language: string;
  instructionLanguage: string;
  difficulty: string;
  totalMarks: number;
  duration: string;
  includeSolutions: boolean;
  stepWiseMarking: boolean;
  questionDistribution: {
    [key: string]: { count: number; diagrams: number };
  };
}

export async function generateQuestionPaper(settings: QuestionPaperSettings) {
  const prompt = `
    Generate a highly professional academic question paper ${settings.includeSolutions ? "and its marking scheme (solutions)" : ""} based on the following parameters:
    
    School Name: ${settings.schoolName}
    Grade: ${settings.grade}
    Board: ${settings.board}
    Subject: ${settings.subject}
    Chapters/Concepts to Focus On: ${settings.chapters || "Standard Curriculum for this Grade"}
    Overall Difficulty: ${settings.difficulty}
    Language: ${settings.language} (Questions) / ${settings.instructionLanguage} (Instructions)
    Total Marks: ${settings.totalMarks}
    Duration: ${settings.duration}
    
    ${settings.includeSolutions ? `Marking Scheme Requirements: ${settings.stepWiseMarking ? "Provide detailed step-wise marking (e.g. 1 mark for formula, 2 marks for calculation)" : "Provide direct answers/solutions"}` : ""}
    
    Question Distribution Requirements:
    ${Object.entries(settings.questionDistribution)
      .filter(([_, data]) => data.count > 0)
      .map(([type, data]) => `- ${type}: ${data.count} items total, exactly ${data.diagrams} MUST involve a diagram/figure description.`)
      .join("\n")}
    
    Output Format: JSON string matching the following structure:
    {
      "paper": {
        "header": { "school": string, "class": string, "subject": string, "marks": number, "time": string, "board": string },
        "sections": [
          {
            "title": string,
            "instructions": string,
            "questions": [
              { 
                "id": number, 
                "text": string, 
                "marks": number, 
                "options": string[] (for MCQ), 
                "type": string,
                "imageRequirement": string (Provide a detailed prompt of what the image should be ONLY for diagram-based questions, else null)
              }
            ]
          }
        ]
      },
      "solutions": ${settings.includeSolutions ? '[ { "questionId": number, "answer": string } ]' : "[]"}
    }
    
    Guidelines:
    1. STRICTLY follow the diagram counts specified for each section.
    2. Only provide an 'imageRequirement' for questions that are specifically intended to be diagram-based.
    3. THE DIAGRAM DESCRIPTION (imageRequirement) MUST BE EXACT: For Science, specify labels to be depicted (e.g., 'Diagram of Human Heart showing Aorta, Ventricles, and Atria'). For Math, specify coordinates or geometric properties (e.g., 'An isosceles triangle ABC with base BC and vertex A').
    4. Ensure the 'imageRequirement' is a standalone, high-detail prompt suitable for a high-fidelity academic illustration generator.
    5. No placeholders: If a diagram is requested, describe the *exact* scenario or entity required for the grade ${settings.grade} level.
    6. Ensure the questions and diagrams follow ${settings.board} standards accurately.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    
    // Robust parsing: sometimes models output markdown blocks or extra characters
    try {
      return JSON.parse(text);
    } catch (e) {
      // Fallback: search for the first '{' and last '}'
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        const cleanedText = text.substring(firstBrace, lastBrace + 1);
        return JSON.parse(cleanedText);
      }
      throw e;
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
