# Crime Scene - Detective AI Photo Analyzer

Analyze your photos with sarcastic detective commentary. Every image becomes a crime scene investigation.

## Setup Instructions

1. **Add your API keys to `.env.local`:**
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

- `/app` - Next.js app router pages and API routes
- `/components` - React components
- `/lib` - Utilities and configurations
- `/public` - Static assets

## Environment Variables

Required variables in `.env.local`:
- `OPENAI_API_KEY` - Your OpenAI API key

Optional (for later):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## Development Status

- ✅ Next.js + TypeScript + Tailwind setup
- 🔄 OpenAI integration
- ⏳ Photo upload interface
- ⏳ Detective AI analysis
- ⏳ Share functionality
- ⏳ Rate limiting
- ⏳ Mobile optimization
- ⏳ Deployment