import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
  relatedProducts: string[];
  content: string;
  readingTime: number;
}

const BLOG_DIR = path.join(process.cwd(), "content/blog");

function parseFrontmatter(raw: string): { frontmatter: Record<string, any>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };

  const frontmatter: Record<string, any> = {};
  match[1].split("\n").forEach(line => {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) return;
    const key = line.slice(0, colonIndex).trim();
    let value: any = line.slice(colonIndex + 1).trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      try { value = JSON.parse(value.replace(/'/g, '"')); } catch { value = []; }
    } else if (value === "true") value = true;
    else if (value === "false") value = false;
    else value = value.replace(/^["']|["']$/g, "");
    frontmatter[key] = value;
  });

  return { frontmatter, content: match[2].trim() };
}

function calculateReadingTime(content: string): number {
  return Math.max(1, Math.ceil(content.split(/\s+/).length / 200));
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith(".md"));
  return files.map(file => {
    const slug = file.replace(".md", "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { frontmatter, content } = parseFrontmatter(raw);
    return {
      slug, content,
      title: frontmatter.title ?? slug,
      description: frontmatter.description ?? "",
      date: frontmatter.date ?? "",
      author: frontmatter.author ?? "Pello Nutrition",
      category: frontmatter.category ?? "General",
      tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
      featured: frontmatter.featured ?? false,
      relatedProducts: Array.isArray(frontmatter.relatedProducts) ? frontmatter.relatedProducts : [],
      readingTime: calculateReadingTime(content),
    } as BlogPost;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, content } = parseFrontmatter(raw);
  return {
    slug, content,
    title: frontmatter.title ?? slug,
    description: frontmatter.description ?? "",
    date: frontmatter.date ?? "",
    author: frontmatter.author ?? "Pello Nutrition",
    category: frontmatter.category ?? "General",
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    featured: frontmatter.featured ?? false,
    relatedProducts: Array.isArray(frontmatter.relatedProducts) ? frontmatter.relatedProducts : [],
    readingTime: calculateReadingTime(content),
  };
}