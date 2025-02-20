const OpenAI = require("openai");

async function aiInit(req, res, next){
    try{
        const openai = new OpenAI({
                baseURL: 'https://api.deepseek.com',
                apiKey: process.env.DEEPSEEK_API_KEY
        });
    
        async function main() {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant." }],
            model: "deepseek-chat",
        });
    
        console.log(completion.choices[0].message.content);
        }

        await main();
        next();
    }catch(error){
        return res.status(500).json({ message: 'AI initialization failed', error: error.message });
    }
}



module.exports = {
    aiInit
}