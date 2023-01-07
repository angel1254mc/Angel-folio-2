import { sync } from "glob";


const tldr = [{type: "text", content: "I am"},
 {type: "emphasis", content: " Angel Lopez,"},
 {type: "text", content: " a 3rd Year "},
 {type: "emphasis", content: "CISE Major "},
 {type: 'text', content: " at UF. "},
 {type: "text", content: "I'm a results-driven Web and Software Developer. My past work experience consists mostly of"},
 {type: "emphasis", content: "Website Development, "},
 {type: "emphasis", content: "Systems Engineering, "},
 {type: "emphasis", content: "and UI/UX Design"},
 {type: "text", content: ". I'm an avid tinkerer who frequents Github in search of new tools to learn and use. "},
 {type: "text", content: "I play a lot of "},
 {type: "link", content: "Video Games ", link:""},
 {type: "text", content: "and I'm pretty good at Racquetball."}
];

const Blog = [
    {
        title: "Getting Started with Typescript on the backend with Node.js and Express",
    },
    {
        title: "Building a Dice Class in C++"
    },
    {
        title: "Setting up Coolify on your Home Server!"
    }
]

export {tldr, Blog};

