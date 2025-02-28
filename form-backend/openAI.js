// Function to read Excel and fetch student responses
function fetchStudentResponses() {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet); // Convert to JSON
}


/**
 * Evaluate a student's response using OpenAI API
 * @param {string} question - The original question
 * @param {string} studentResponse - The student's answer
 * @param {string} expectedAnswer - The expected correct answer
 * @returns {Promise<{score: number, feedback: string, breakdown: object}>}
 */
async function evaluateResponse(question, studentResponse, expectedAnswer) {
    try {
        const messages = [
            {
                role: "system",
                content: `
                You are an AI grader evaluating student responses based on a 100-point system.
                Score the response based on these weighted criteria:
                
                1. **Task Completion (30%)** – Did the student complete all tasks within the timeframe?
                2. **Decision-Making Quality (20%)** – Are the decisions logical, well-reasoned, and data-driven?
                3. **Accuracy & Relevance (15%)** – Is the response correct and relevant to the given scenario?
                4. **Time Management (10%)** – Did the student use time efficiently?
                5. **Communication & Clarity (10%)** – Is the response well-articulated and coherent?
                6. **Creativity & Innovation (10%)** – Is the response original and beyond standard answers?
                7. **Collaboration & Adaptability (5%)** – If teamwork was required, how well did they adapt?

                Provide a JSON response in the following format:
                {
                    "score": <total score out of 100>,
                    "feedback": "<brief reasoning for the score>",
                    "breakdown": {
                        "Task Completion": <score out of 30>,
                        "Decision-Making Quality": <score out of 20>,
                        "Accuracy & Relevance": <score out of 15>,
                        "Time Management": <score out of 10>,
                        "Communication & Clarity": <score out of 10>,
                        "Creativity & Innovation": <score out of 10>,
                        "Collaboration & Adaptability": <score out of 5>
                    }
                }
                `
            },
            {
                role: "user",
                content: `Question: ${question}\nExpected Answer: ${expectedAnswer}\nStudent's Response: ${studentResponse}`
            }
        ];

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
            temperature: 0.3,
            max_tokens: 300,
            response_format: "json"
        });

        // Ensure the response contains valid JSON
        const result = response.choices?.[0]?.message?.content;
        if (result) {
            return JSON.parse(result);
        } else {
            throw new Error("Invalid response from OpenAI");
        }
    } catch (error) {
        console.error("OpenAI API Error:", error);
        return { score: 0, feedback: "Error in evaluation", breakdown: {} };
    }
}

