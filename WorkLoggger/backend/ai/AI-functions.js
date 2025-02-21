const OpenAI = require("openai");

async function analyzeUserData(userData) {
    if (!userData) {
      throw Error({ message: "userData is required" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: `Summarize the following user data into a meaningful summary, don't show any goofy numbers like IDs:
           ${JSON.stringify(userData)}. This is a report of work they have done in a particular period, so show accordingly.
           Summarize subitems & workitems in one paragraph which makes sense even to a layman. 
          '
          `,
        },
      ],
    });
    
    return completion.choices[0].message.content;
}

module.exports = {
  analyzeUserData,
};
