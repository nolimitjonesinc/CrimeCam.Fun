# Crime Scene - Detective AI Photo Analyzer

Analyze your photos with sarcastic detective commentary. Every image becomes a crime scene investigation.

## Setup Instructions

1. **Add your API keys to `.env.local`:**
   ```
   # Required: At least one of these API keys
   OPENAI_API_KEY=your_openai_api_key_here    # For GPT models
   ANTHROPIC_API_KEY=your_anthropic_api_key_here  # For Claude models
   ```

   Copy `.env.example` for reference on all available options.

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

Required in `.env.local` (at least one):
- `OPENAI_API_KEY` - Your OpenAI API key (for GPT models)
- `ANTHROPIC_API_KEY` - Your Anthropic API key (for Claude models)

### Provider Features
- **Multiple AI Providers**: Supports both OpenAI and Anthropic
- **Quality Selection**: Choose between Speed (GPT-5-mini), Balanced (Claude Haiku), or Premium (Claude Sonnet)
- **Automatic Fallback**: If one provider fails, automatically switches to the next available
- **Cost Tracking**: Displays estimated cost and performance metrics for each analysis

## Development Status

- ✅ Next.js + TypeScript + Tailwind setup
- ✅ OpenAI & Anthropic integration
- ✅ Photo upload interface with camera support
- ✅ Detective AI analysis with multiple modes
- ✅ Share functionality with export
- ✅ Rate limiting
- ✅ Mobile optimization
- ✅ Provider switching with fallback
- ✅ Quality selection (Speed/Balanced/Premium/Auto)
- ✅ Spice level control (1-10)
- ✅ Telemetry tracking (duration, tokens, cost)