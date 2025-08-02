const yaml = require("js-yaml");
const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const htmlmin = require("html-minifier-terser");
const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("date", function (dateObj) {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });
  // Date filter (human readable)
  eleventyConfig.addFilter("readableDate", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("dd LLL yyyy"),
  );

  // Syntax Highlighting for Code blocks
  eleventyConfig.addPlugin(syntaxHighlight);

  // Data merge and gitignore config
  eleventyConfig.setUseGitIgnore(false);
  eleventyConfig.setDataDeepMerge(true);

  // Custom image shortcode for optimized images
  eleventyConfig.addNunjucksAsyncShortcode(
    "image",
    async function (
      src,
      alt,
      widths = [320, 640, 1024],
      formats = ["webp", "jpeg"],
    ) {
      if (!alt) throw new Error(`Missing \`alt\` for image: ${src}`);
      let metadata = await Image(src, {
        widths: widths,
        formats: formats,
        urlPath: "/static/img/",
        outputDir: "./_site/static/img/",
      });
      let imageAttrs = {
        alt,
        sizes: "(max-width: 1024px) 100vw, 1024px",
        loading: "lazy",
        decoding: "async",
      };
      return Image.generateHTML(metadata, imageAttrs);
    },
  );

  // Collections
  eleventyConfig.addCollection("photos", (collectionApi) =>
    collectionApi.getFilteredByGlob("./src/photos/*.md"),
  );
  eleventyConfig.addCollection("videos", (collectionApi) =>
    collectionApi.getFilteredByGlob("./src/music/*.md"),
  );
  eleventyConfig.addCollection("current_events", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/events/current/*.md");
  });
  eleventyConfig.addCollection("past_events", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/events/past/*.md")
      .sort((a, b) => {
        // Compare dates, descending (newest first)
        return new Date(b.data.date) - new Date(a.data.date);
      });
  });

  // YAML Data support
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  // Passthrough Copy (improved for image types)
  eleventyConfig.addPassthroughCopy({
    "./src/admin/config.yml": "./admin/config.yml",
    "./node_modules/alpinejs/dist/cdn.min.js": "./static/js/alpine.js",
    "./node_modules/prismjs/themes/prism-tomorrow.css":
      "./static/css/prism-tomorrow.css",
    "./src/favicon.ico": "./favicon.ico",
  });
  // Copy all images (including webp, avif) from static/img
  eleventyConfig.addPassthroughCopy("./src/static/img");

  // Minify HTML only in production
  eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
    if (
      outputPath &&
      outputPath.endsWith(".html") &&
      process.env.NODE_ENV === "production"
    ) {
      try {
        return htmlmin.minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
        });
      } catch (err) {
        console.error("HTML Minification error:", err);
        return content;
      }
    }
    return content;
  });

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // Output formats for each image.
    formats: ["avif", "webp", "auto"],

    // widths: ["auto"],

    failOnError: false,
    htmlOptions: {
      imgAttributes: {
        // e.g. <img loading decoding> assigned on the HTML tag will override these values.
        loading: "lazy",
        decoding: "async",
      },
    },

    sharpOptions: {
      animated: true,
    },
  });

  eleventyConfig.addNunjucksAsyncShortcode(
    "image",
    async function (
      src,
      alt,
      widths = [320, 640, 1024],
      formats = ["webp", "jpeg"],
    ) {
      if (!alt) throw new Error(`Missing \`alt\` for image: ${src}`);
      let metadata = await Image(src, {
        widths: widths,
        formats: formats,
        urlPath: "/static/img/",
        outputDir: "./_site/static/img/",
        cacheOptions: {
          duration: "1y",
          directory: ".cache", // You can change this if you want
        },
      });
      let imageAttrs = {
        alt,
        sizes: "(max-width: 1024px) 100vw, 1024px",
        loading: "lazy",
        decoding: "async",
      };
      return Image.generateHTML(metadata, imageAttrs);
    },
  );

  // Directory config and template engine
  return {
    dir: {
      input: "src",
      output: "_site", // explicitly set output folder
    },
    htmlTemplateEngine: "njk",
  };
};
