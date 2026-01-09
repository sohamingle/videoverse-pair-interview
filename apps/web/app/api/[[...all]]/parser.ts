import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { XMLParser } from "fast-xml-parser";
import { db } from "@/db";
import { sitemapMetadata } from "@/db/schema";
import { and, gte, lte } from "drizzle-orm";
import { LRUCache } from "lru-cache";

type CachedSitemap = {
  url: string;
  publicationDate: Date;
  title: string;
  keywords: string[];
};

const sitemapCache = new LRUCache<string, CachedSitemap>({
  max: 500,
  ttl: 48 * 60 * 60 * 1000, // 48 hours
});

const app = new Hono()
  .post(
    "/add",
    zValidator(
      "json",
      z.object({
        sitemapUrl: z.string(),
      })
    ),
    async (c) => {
      const { sitemapUrl } = c.req.valid("json");

      // Fetch the sitemap XML
      const response = await fetch(sitemapUrl, {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        return c.json({ error: "Failed to fetch sitemap" }, 400);
      }

      const xmlText = await response.text();

      // Parse the XML
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      });

      const parsed = parser.parse(xmlText);

      // Standard sitemap structure
      // For a regular sitemap:
      const urls = parsed.urlset?.url || [];

      const newsMetadata: CachedSitemap[] = [];

      for (const url of urls) {
        const newsData = url["news:news"];
        if (!newsData?.["news:publication_date"] || !newsData?.["news:title"]) {
          continue;
        }

        const newsUrl = url.loc;
        if (sitemapCache.has(newsUrl)) {
          continue;
        }

        newsMetadata.push({
          url: newsUrl,
          publicationDate: new Date(newsData["news:publication_date"]),
          title: newsData["news:title"],
          keywords: newsData["news:keywords"]?.split(",") ?? [],
        });
      }

      if (newsMetadata.length === 0) {
        return c.json({
          message: "No new sitemap found",
          data: [],
        });
      }

      await db.insert(sitemapMetadata).values(newsMetadata);

      for (const news of newsMetadata) {
        sitemapCache.set(news.url, news);
      }

      return c.json({
        message: "Sitemap added successfully",
        data: newsMetadata,
      });
    }
  )

  .get(
    "/",
    zValidator(
      "query",
      z.object({
        page: z.coerce.number().optional().default(1),
        limit: z.coerce.number().optional().default(10),
        after: z.coerce.date(),
        before: z.coerce.date(),
      })
    ),
    async (c) => {
      const { page, limit, after, before } = c.req.valid("query");
      const offset = (page - 1) * limit;

      const sitemapData = await db.query.sitemapMetadata.findMany({
        where: and(
          gte(sitemapMetadata.publicationDate, after),
          lte(sitemapMetadata.publicationDate, before)
        ),
        offset,
        limit,
      });

      return c.json({
        data: sitemapData,
        pagination: {
          page,
          limit,
          hasMore: sitemapData.length === limit,
        },
      });
    }
  );

export default app;
