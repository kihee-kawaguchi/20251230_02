import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Custom tools for web design analysis
const tools: Anthropic.Tool[] = [
  {
    name: "audit_html_accessibility",
    description: "Analyzes HTML for accessibility issues (WCAG compliance, semantic HTML, ARIA labels, color contrast)",
    input_schema: {
      type: "object",
      properties: {
        html_content: {
          type: "string",
          description: "The HTML content to audit",
        },
      },
      required: ["html_content"],
    },
  },
  {
    name: "check_responsive_design",
    description: "Evaluates responsive design implementation (mobile-first, breakpoints, fluid layouts)",
    input_schema: {
      type: "object",
      properties: {
        html_content: {
          type: "string",
          description: "The HTML content to check",
        },
      },
      required: ["html_content"],
    },
  },
  {
    name: "analyze_typography",
    description: "Reviews typography choices (font hierarchy, readability, spacing, premium aesthetics)",
    input_schema: {
      type: "object",
      properties: {
        css_content: {
          type: "string",
          description: "CSS styles to analyze",
        },
      },
      required: ["css_content"],
    },
  },
  {
    name: "performance_recommendations",
    description: "Provides performance optimization suggestions (image optimization, CSS/JS minification, critical CSS)",
    input_schema: {
      type: "object",
      properties: {
        html_content: {
          type: "string",
          description: "The HTML content to optimize",
        },
      },
      required: ["html_content"],
    },
  },
  {
    name: "read_file",
    description: "Reads a file from the filesystem",
    input_schema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the file to read",
        },
      },
      required: ["file_path"],
    },
  },
];

// Tool execution handler
function executeTool(toolName: string, toolInput: any): string {
  switch (toolName) {
    case "audit_html_accessibility": {
      const html = toolInput.html_content;
      const issues: string[] = [];

      // Check for semantic HTML
      if (!html.includes("<header>")) issues.push("Missing <header> semantic tag");
      if (!html.includes("<main>")) issues.push("Missing <main> semantic tag");
      if (!html.includes("<footer>")) issues.push("Missing <footer> semantic tag");

      // Check for alt text on images
      const imgMatches = html.match(/<img[^>]*>/g) || [];
      imgMatches.forEach((img, idx) => {
        if (!img.includes('alt=')) {
          issues.push(`Image #${idx + 1} missing alt attribute`);
        }
      });

      // Check for heading hierarchy
      if (!html.includes("<h1>")) issues.push("Missing <h1> heading");

      // Check for ARIA landmarks
      const hasAriaLandmarks = html.includes('role=') || html.includes('aria-');
      if (!hasAriaLandmarks) issues.push("Consider adding ARIA landmarks for better accessibility");

      // Check for color contrast (basic check - looking for inline styles)
      if (html.includes('background') && html.includes('color')) {
        issues.push("Verify color contrast ratios meet WCAG AA standards (4.5:1 for normal text)");
      }

      return JSON.stringify({
        accessibility_score: Math.max(0, 100 - issues.length * 10),
        issues,
        recommendations: [
          "Use semantic HTML5 elements",
          "Ensure all interactive elements are keyboard accessible",
          "Test with screen readers (NVDA, JAWS)",
          "Verify color contrast with tools like WebAIM",
        ],
      });
    }

    case "check_responsive_design": {
      const html = toolInput.html_content;
      const issues: string[] = [];

      // Check for viewport meta tag
      if (!html.includes('name="viewport"')) {
        issues.push("Missing viewport meta tag for responsive design");
      }

      // Check for media queries
      const mediaQueryCount = (html.match(/@media/g) || []).length;
      if (mediaQueryCount === 0) {
        issues.push("No media queries found - may not be responsive");
      } else if (mediaQueryCount < 3) {
        issues.push("Limited media queries - consider adding more breakpoints");
      }

      // Check for flexible units
      const hasFlexibleUnits = html.includes("rem") || html.includes("em") || html.includes("%") || html.includes("vw") || html.includes("vh");
      if (!hasFlexibleUnits) {
        issues.push("Consider using flexible units (rem, em, %, vw, vh) instead of fixed px");
      }

      // Check for flexbox/grid
      const hasModernLayout = html.includes("display: flex") || html.includes("display: grid");
      if (!hasModernLayout) {
        issues.push("Consider using Flexbox or CSS Grid for modern, responsive layouts");
      }

      return JSON.stringify({
        responsive_score: Math.max(0, 100 - issues.length * 15),
        issues,
        breakpoints_found: mediaQueryCount,
        recommendations: [
          "Test on mobile (320px), tablet (768px), desktop (1024px+)",
          "Use mobile-first approach with min-width media queries",
          "Ensure touch targets are at least 44×44px",
        ],
      });
    }

    case "analyze_typography": {
      const css = toolInput.css_content;
      const analysis: any = {
        font_families: [],
        issues: [],
        premium_features: [],
      };

      // Extract font families
      const fontMatches = css.match(/font-family:\s*([^;]+)/g) || [];
      fontMatches.forEach((match) => {
        const fonts = match.replace(/font-family:\s*/, "").trim();
        analysis.font_families.push(fonts);
      });

      // Check for premium fonts
      if (css.includes("serif")) {
        analysis.premium_features.push("Serif fonts for premium aesthetic");
      }
      if (css.includes("letter-spacing")) {
        analysis.premium_features.push("Letter spacing for elegance");
      }

      // Check for font sizes
      const hasFluidTypography = css.includes("clamp(") || css.includes("calc(");
      if (!hasFluidTypography) {
        analysis.issues.push("Consider fluid typography with clamp() for better scalability");
      }

      // Check line height
      const lineHeightMatches = css.match(/line-height:\s*([\d.]+)/g) || [];
      lineHeightMatches.forEach((match) => {
        const value = parseFloat(match.replace(/line-height:\s*/, ""));
        if (value < 1.4) {
          analysis.issues.push(`Low line-height (${value}) - aim for 1.5-1.8 for readability`);
        }
      });

      return JSON.stringify({
        typography_score: Math.max(0, 100 - analysis.issues.length * 12),
        ...analysis,
        recommendations: [
          "Use font scales (1.25, 1.5, 1.618 ratios) for harmonious hierarchy",
          "Limit to 2-3 font families maximum",
          "Ensure sufficient contrast and spacing for readability",
          "Consider variable fonts for performance",
        ],
      });
    }

    case "performance_recommendations": {
      const html = toolInput.html_content;
      const recommendations: string[] = [];

      // Check for external resources
      const linkCount = (html.match(/<link/g) || []).length;
      const scriptCount = (html.match(/<script/g) || []).length;
      if (linkCount > 5) recommendations.push(`${linkCount} external stylesheets - consider bundling`);
      if (scriptCount > 3) recommendations.push(`${scriptCount} script tags - consider bundling and async loading`);

      // Check for image optimization
      if (html.includes("<img") && !html.includes("loading=")) {
        recommendations.push("Add loading='lazy' to images for better performance");
      }
      if (html.includes("<img") && !html.includes("srcset")) {
        recommendations.push("Use srcset for responsive images");
      }

      // Check for inline styles
      const inlineStyleCount = (html.match(/style=/g) || []).length;
      if (inlineStyleCount > 10) {
        recommendations.push(`${inlineStyleCount} inline styles - consider moving to external CSS`);
      }

      // Check for critical CSS
      if (!html.includes("<style>")) {
        recommendations.push("Consider inlining critical CSS for above-the-fold content");
      }

      // Check for font loading
      if (html.includes("fonts.googleapis.com")) {
        recommendations.push("Use font-display: swap for Google Fonts to prevent FOIT");
      }

      return JSON.stringify({
        performance_score: Math.max(0, 100 - recommendations.length * 8),
        recommendations,
        quick_wins: [
          "Minify CSS and JavaScript",
          "Enable gzip/brotli compression",
          "Add Cache-Control headers",
          "Optimize images (WebP format, compression)",
        ],
      });
    }

    case "read_file": {
      const filePath = toolInput.file_path;
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        return content;
      } catch (error) {
        return `Error reading file: ${error}`;
      }
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

// Main agent execution
async function runDesignerAgent() {
  console.log("🎨 Professional Web Designer Agent Starting...\n");

  const systemPrompt = `You are a world-class web designer with 15+ years of experience creating premium, high-converting landing pages.

Your expertise includes:
- Visual hierarchy and composition
- Premium aesthetics (luxury brands, financial services)
- Conversion optimization (CRO best practices)
- Accessibility (WCAG 2.1 AA compliance)
- Performance optimization
- Responsive design (mobile-first)
- Typography and color theory
- User experience (UX) design

You have access to tools to analyze:
1. HTML accessibility (semantic markup, ARIA, screen reader compatibility)
2. Responsive design (breakpoints, flexible layouts)
3. Typography (hierarchy, readability, premium aesthetics)
4. Performance (optimization opportunities)
5. File reading (to access the current landing page)

Your task is to:
1. Read the current landing page at /c/Users/owner/20251230_02/index.html
2. Analyze it comprehensively using all available tools
3. Provide specific, actionable design recommendations
4. Focus on creating a premium, trustworthy aesthetic for a financial tool
5. Ensure the design appeals to professional investors (IT professionals, 30-40 years old)

Be direct and specific. Provide exact CSS changes, HTML improvements, and design rationale.`;

  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content:
        "Please analyze the landing page at /c/Users/owner/20251230_02/index.html and provide comprehensive design recommendations. Use all available tools to audit accessibility, responsive design, typography, and performance. Then provide specific, prioritized recommendations for improvements.",
    },
  ];

  let continueLoop = true;

  while (continueLoop) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      tools,
      messages,
      system: systemPrompt,
    });

    console.log(`\n[Assistant Response - Stop Reason: ${response.stop_reason}]`);

    // Process response content
    for (const block of response.content) {
      if (block.type === "text") {
        console.log(block.text);
      } else if (block.type === "tool_use") {
        console.log(`\n[Tool Call: ${block.name}]`);
        console.log(`Input: ${JSON.stringify(block.input, null, 2)}`);

        const result = executeTool(block.name, block.input);
        console.log(`Result: ${result.substring(0, 200)}${result.length > 200 ? "..." : ""}\n`);

        // Add tool result to messages
        messages.push({
          role: "assistant",
          content: response.content,
        });

        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: block.id,
              content: result,
            },
          ],
        });
      }
    }

    // Check if we should continue
    if (response.stop_reason === "end_turn") {
      continueLoop = false;
    } else if (response.stop_reason !== "tool_use") {
      continueLoop = false;
    }
  }

  console.log("\n✅ Designer Agent Analysis Complete!");
}

// Execute
runDesignerAgent().catch((error) => {
  console.error("Error running designer agent:", error);
  process.exit(1);
});
