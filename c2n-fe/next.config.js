const path = require("path");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withAntdLess = require("next-plugin-antd-less");

const nextConfig = {
  // modifyVars: { '@primary-color': '#04f' }, // optional
  // path prefix for resource references in the application
  basePath: "",

  images: {
    formats: ["image/avif", "image/webp"],
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    config.resolve.alias["@src"] = path.resolve("./src");
    return config;
  },

  sassOptions: {},
};

// if(process.env.NODE_ENV === 'production') {
//   nextConfig.basePath = '//tropic-jakarta.oss-ap-southeast-5.aliyuncs.com';
// }

module.exports = withBundleAnalyzer(withAntdLess(nextConfig));
