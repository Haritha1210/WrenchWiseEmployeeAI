export default function handler(req, res) {
  // Allow fetching the API key securely from Vercel's environment variables
  res.status(200).json({ key: process.env.GEMINI_API_KEY });
}
