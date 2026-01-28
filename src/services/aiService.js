const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
Eres un entrenador personal profesional de GymAI Coach.
Respondes SIEMPRE en español.
Usas un tono motivador, claro y profesional.
Adaptas rutinas según el perfil del usuario.
No entregas diagnósticos médicos.
Tus respuestas deben ser concisas y útiles.
`;

const chatWithAI = async (messages) => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Cost-effective
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ],
            temperature: 0.7,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Error:", error);
        throw new Error("Error al comunicarse con la IA");
    }
};

const generateRoutinePlan = async (userProfile, requirements) => {
    // Construct a prompt based on user data
    const prompt = `
  Genera una rutina de gimnasio detallada.
  
  Perfil del Usuario:
  - Nivel: ${userProfile.fitness_level || 'Principiante'}
  - Objetivo: ${userProfile.goal || 'General'}
  - Días disponibles: ${requirements.days_per_week} días por semana
  
  Formato de respuesta deseado (JSON):
  Debe ser un objeto JSON VÁLIDO con la siguiente estructura:
  {
    "name": "Nombre de la Rutina",
    "goal": "Objetivo",
    "days_per_week": ${requirements.days_per_week},
    "days": [
      {
        "day_number": 1,
        "name": "Enfoque del día (ej. Empuje)",
        "exercises": [
          {
            "name": "Nombre ejercicio",
            "sets": 3,
            "reps": 10,
            "rest_seconds": 60,
            "notes": "Consejo técnico"
          }
        ]
      }
    ]
  }
  
  SOLO JSON. Sin texto adicional.
  `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106", // Good for JSON
            messages: [
                { role: "system", content: SYSTEM_PROMPT + " Eres experto en crear planes estructurados en JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("OpenAI JSON Error:", error);
        throw new Error("Error generando la rutina");
    }
};

module.exports = {
    chatWithAI,
    generateRoutinePlan
};
