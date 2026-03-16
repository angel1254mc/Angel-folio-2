const { Octokit } = require("octokit");

export const createOctokitClient = () => {
    return new Octokit({
        auth: process.env.GITHUB_AUTH,
        request: {
            fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
        },
    });
};

