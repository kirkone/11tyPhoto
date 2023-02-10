const image = require("@11ty/eleventy-img");
const eleventySass = require("eleventy-sass");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

async function pictureShortcode(src, alt, sizes) {
    let metadata = await image(src, {
      widths: [
        160,
        320,
        640,
        1024,
        1280,
        1920,
        2560,
        3840,
      ],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "./output/images/",
      urlPath: "/images/",
      cacheOptions: {
        duration: "10d",
        directory: ".cache",
        removeUrlQueryParams: false,
      }
    });
  
    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };
  
    // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
    return image.generateHTML(metadata, imageAttributes, {whitespaceMode: "inline"});
}

async function pictureZoomShortcode(src, alt, sizes) {
  let metadata = await image(src, {
    widths: ["auto"],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./output/images/",
    urlPath: "/images/",
    cacheOptions: {
      duration: "10d",
      directory: ".cache",
      removeUrlQueryParams: false,
    }
  });

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return image.generateHTML(metadata, imageAttributes, {whitespaceMode: "inline"});
}
  
module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("picture", pictureShortcode);
  eleventyConfig.addNunjucksAsyncShortcode("picturezoom", pictureZoomShortcode);
  eleventyConfig.addPlugin(eleventySass);
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  eleventyConfig.addNunjucksFilter(
    "trimExtension",
    function(value) {
      return value.replace(/\.[^/.]+$/, "");
    }
  );

  eleventyConfig.addNunjucksFilter(
    "byYear",
    function(images, year) {
      const result = images.filter((image) => {return image.date.getFullYear() == year});

      return result
    }
  );

  eleventyConfig.addNunjucksFilter("limit", function(array, limit) {
    return array.slice(0, limit);
  });
  
  return {
    dir: {
      input: "src",
      output: "output",
      layouts: "_includes/layouts",
      includes: "_includes",
    },
    templateFormats: ["md", "njk"]
  };
};