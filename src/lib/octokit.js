const { Octokit } = require("octokit");

export const createOctokitClient = () => {
    return new Octokit({
        auth: process.env.GITHUB_AUTH,
    });
};

