require("dotenv").config(); // Load .env for environment variables
const Anthropic = require("@anthropic-ai/sdk");

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env["CLAUDE_API_KEY"], // Ensure your API key is set in the environment variables
});

// Function to send a prompt to Claude
async function sendPromptToClaude(theme) {
  if (!theme || typeof theme !== "string") {
    throw new Error("Invalid theme: Please provide a valid theme string.");
  }

  try {
    const prompt = `
Hello, Claude! I want you to be a color palette generator. Can you keep the same names but change the theme of these colors? If the theme has or names multiple colors, make sure to have an even split of each color. Print only the same names and their values.

Theme: ${theme}

--white: #fff;
  --light--beige: #ffebdd;
  --dull--beige: #ede0d4;
  --beige: #fae0cf;
  --off--beige: #f2d3be;
  --dark--beige: #e1b89c;
  --off--dark--beige: #d2a68a;
  --light--beige--glass: rgba(255, 226, 203, 0.353);
  --beige--glass: rgba(202, 162, 130, 0.874);
  --brown--glass: rgba(140, 100, 73, 0.708);
  --light--brown: #b08968;
  --off--light--brown: #b17f59;
  --dark--light--brown: #a87a55;
  --brown: #7f5239;
  --beige--shadow: rgb(179, 136, 87);

  --off--brown: #6e452f;
  --dull--dark--brown: #5e402c;
  --dark--brown: #4a230f;
  --dark--brown--glass: #4a230fcf;

  --off--dark--brown: #411e0c;

  Return only the color names and values, no other text.
`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Replace with the correct model version
      max_tokens: 1024, // Adjust token limit as needed
      messages: [{ role: "user", content: prompt }],
    });

    console.log("Claude's response:", response);
    return response;
  } catch (error) {
    console.error("Error communicating with Claude API:", error.message);
    throw error;
  }
}

module.exports = {
    sendPromptToClaude,
};
