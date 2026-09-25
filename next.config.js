/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 120,

  // Product pages whose ID changed. Permanent (308) redirects so old links and
  // search results land on the new page.
  async redirects() {
    return [
      { source: "/report/the-feed-foundation", destination: "/report/foundation", permanent: true },
      { source: "/report/momentous-vitamin-d3-k2", destination: "/report/momentous-vitamin-d3", permanent: true },
      // Product removed from the site
      { source: "/report/clif-shot-gel", destination: "/products/energy-gel", permanent: true },
      { source: "/report/larabar-original", destination: "/products/energy-bar", permanent: true },
      { source: "/report/kind-bar-original", destination: "/products/energy-bar", permanent: true },
    ];
  },
};

module.exports = nextConfig;
