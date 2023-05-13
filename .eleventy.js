const image = require("@11ty/eleventy-img");
const eleventySass = require("eleventy-sass");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const sharp = require("sharp");

async function getAverageColor(image) {
  // Resize to one pixel and get raw buffer
  const buffer = await image.clone().resize(1,1).raw().toBuffer();
  // Convert values to percentages
  const values = [...buffer].map(
    (value) => `${((value * 100) / 255).toFixed(0)}%`
  );
  // Output rgb or rgba color
  return `${values.length < 4 ? "rgb" : "rgba"}(${values.join(",")})`;
}

async function pictureShortcode(src, alt, sizes = "") {
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
        "auto"
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

    console.log('---Image-----\n', metadata.jpeg[metadata.jpeg.length - 1].filename);

    const color = await getAverageColor(sharp(metadata.jpeg[metadata.jpeg.length - 1].outputPath));
    const style = `background-color: ${color}`;

    let imageAttributes = {
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
      style
    };

    // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
    return image.generateHTML(metadata, imageAttributes, {whitespaceMode: "inline"});
}

async function placeholderShortcode(src) {
  let metadata = await image(src, {
    widths: [50],
    formats: ["jpeg"],
    outputDir: "./output/images/",
    urlPath: "/images/",
    cacheOptions: {
      duration: "10d",
      directory: ".cache",
      removeUrlQueryParams: false,
    }
  });

  const placeholder = await sharp(metadata.jpeg[0].outputPath)
  .resize(50,50, { fit: sharp.fit.inside })
  .toFormat('jpeg');

  const {  data, info } = await placeholder.toBuffer({ resolveWithObject: true });  
  const base64 = data.toString("base64");

  return `url(&quot;data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http%3A//www.w3.org/2000/svg' xmlns%3Axlink='http%3A//www.w3.org/1999/xlink' viewBox='0 0 ${info.width} ${info.height}' preserveAspectRatio='xMidYMid meet'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='.5'%3E%3C/feGaussianBlur%3E%3CfeComponentTransfer%3E%3CfeFuncA type='discrete' tableValues='1 1'%3E%3C/feFuncA%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Cimage filter='url(%23b)' x='0' y='0' height='100%25' width='100%25' xlink%3Ahref='data%3Aimage/jpeg;base64,${base64}'%3E%3C/image%3E%3C/svg%3E&quot;)`
}

async function pictureZoomShortcode(src, alt, sizes) {
  let metadata = await image(src, {
    widths: [75,"auto"],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./output/images/",
    urlPath: "/images/",
    cacheOptions: {
      duration: "10d",
      directory: ".cache",
      removeUrlQueryParams: false,
    }
  });

  const style = "";

  let imageAttributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
    style
  };

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  return image.generateHTML(metadata, imageAttributes, {whitespaceMode: "inline"});
}
  
module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("placeholder", placeholderShortcode);
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