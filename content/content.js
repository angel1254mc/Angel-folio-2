import { sync } from "glob";

const Projects = [
    {
        name: "ET CRM",
        desc: "Customer Relationship Management System geared towards Government Contractors and Contractees. Centralizes Pipeline Management, Contract Search, Proposal/Quote drafting, and Intercompany collaboration on one single platform.",
        slug: 'et-crm-for-et',
        summary: 'Breadgetter CRM is an in-house utility under active development by the System Engineering, Software Development, and Cybersecurity Intern teams at Emerging Tech LLC. It serves as a scalable, highly customizable SaaS with rich Out-Of-The-Box functionality. The platform gathers listings in real-time to ensure users are presented with actionable RFP’s and RFI’s. By centralizing the data, contacts, and pipelines, capture teams are able to maximize proposal throughput and secure more wins.',
        github: {
            isPublic: false,
            url: 'https://github.com/angel1254mc/et-crm-firebase-draft',
            urls: [{title: "Main Repo", url: 'https://github.com/angel1254mc/et-crm-firebase-draft'}],
        },
        accomplishments: ["Served as the Technical Lead for a team of 7 developers, providing support and mentorship with Infrastructure Provisioning, CI/CD Integration, Frontend Development, Backend Development, and System Architecture", "Leveraged React-Beautiful-DND and Firebase Snapshot Listeners to implement real-time CRUD-compatible Pipeline collaboration", "Helped build contract search system for centralized access leveraging SAM.gov and GSA Ebuy APis to provide centralized access to upwards of 92,000 active contracts at any given time.", "Designed and Implemented Firestore Architecture and Security Rules, collaborating closely with the Frontend, Backend, and Cybersecurity teams to assess, analyze, and implement points of improvement."],
        lessons: ['Dividing tasks among a team by strengths and mutual independence between tasks is a powerful way to increase throughput', 'clever use of sub-collections can help keep bandwidth low in otherwise intrinsically high-bandwidth apps.'],
        authors: [
            {
                name: 'Angel Lopez Pol',
                github: 'angel1254mc',
                responsibilities: [
                    "Overall System Design",
                    "Frontend",
                    "Firebase & Security Rules ",
                    "POC for Project Manager"
                ],
            },
            {
                name: 'Eric Dequevedo',
                github: 'ericdequ',
                role: 'Government API Research',
                responsibilities: [
                    'API research and integration',
                    'System Design Engineer',
                    'Backend Developer',
                ]
            },
            {
                name: 'Luke Cutting',
                github: 'cutluk',
                role: 'System Design and AWS',
                responsibilities: [
                    'Frontend Dev',
                    'UI Design',
                    'AWS Infrastructure',
                ]
            },
            {
                name: 'Ayden Colby',
                github: 'ColbyJack1134',
                role: 'Government API Research',
                responsibilities: [
                    "Backend Lead, API Lead",
                    "Cybersecurity Compliance",
                    "Infrastructure Provisioning, ",
                    "Docker Orchestration"
                ],
            },
            {
                name: 'Carlos Rios',
                github: 'CarlosRios-ET',
                responsibilities: [
                    "UI Design Lead",
                ],
            },
            {
                name: 'Garry Bowman',
                github: 'garrettbowman',
                responsibilities: [
                    "Backend Research",
                ],
            },
            {
                name: 'Anton Salvador',
                github: "Tylerwong2",
                responsibilities: [
                    "Project Supervisor",
                    "Frontend Dev",
                ],
            },
            {
                name: "Conner Goddu",
                github: 'cgoddu',
                responsibilities: [
                    "Frontend Dev",
                ],
            },
            {
                name: "Gateston Johns",
                github: 'gatestonjohns',
                responsibilities: [
                    "Frontend Dev",
                ],
            },

        ],
        tools: ['React', 'Python', 'Firebase', 'AWS', 'SAM.gov', 'Docker', 'Nginx'],
        date: "November 2022 - Present"
    },
    {
        name: "ET GET Extension",
        tools: ['CSS', "JS", "HTML", "Manifest V3", 'MongoDB', 'text-search', 'NextJS', "ExpressJS"],
        slug: 'et-get',
        summary: "Cybersecurity and CsfC Glossary and Term Search Engine that pools definitions from multiple standards-governing agencies and institutions. Client-facing portion is a Manifest V3-type chrome extension that fetches terms and definitions from our backend. Backend is built in ExpressJS and interfaces with a MongoDB instancee on Atlas that stores data for the entire glossary. CloudWatch function calls an endpoint on the Express Server Bi-weekly that syncs new terms with the existing database, ensuring new terms are added and already existing terms are kept up-to-date. Administrators have a web interface to manually search, create, alter, and delete terms as needed",
        desc: "Cybersecurity and CsfC Glossary and Term Search Engine that pools definitions from multiple standards-governing agencies and institutions.",
        github: {
            isPublic: true,
            url: '',
            urls: [
                {title:"Extension Source", url: 'https://github.com/ericdequ/GetExtension'}, 
                {title:"Admin Portal Source", url:'https://github.com/angel1254mc/ET-GET-ADMIN-MOCK'}, 
                {title:"Express Server Source", url:'https://github.com/angel1254mc/express-get-idea'}],
        },
        authors: [
            {
                name: 'Angel Lopez Pol',
                github: 'angel1254mc',
                responsibilities: ['System Design Lead', 'Admin Portal', 'Frontend Dev Lead', 'Backend Dev Lead'],
            },
            {
                name: 'Eric Dequevedo',
                github: 'ericdequ',
                responsibilities: ['Government API Research'],
            },
            {
                name: 'Carlos Rios',
                github: 'CarlosRios-ET',
                responsibilities: ['UI Design'],
            },
            {
                name: 'Garry Bowman',
                github: 'garrettbowman',
                responsibilities: ['Backend Research'],
            },

        ],
        date: "Summer 2022",
        lessons: ['Divying up tasks effectively makes or breaks your MVP delivery timeline.',
                  'Implementing Auth flows with SSR feels much better than on platforms based on CSR', 
                  'Figma and Excalidraw (Shoutout to Theo @ Ping.gg) are Excellent Prototyping Tools',
                  'NextJS dynamically rendered routes + useParams + Paginated Search Functionality = gold']
    },
    {
        name: "MeetYourMajor",
        slug: 'meet-your-major',
        summary: "Empirically-based Skill and Interest assessment that maps college students to majors that best suit them.",
        desc: "Empirically-based Skill and Interest assessment that maps college students to majors that best suit them.",
        authors: [
            {
                name: 'Angel Lopez Pol',
                github: 'angel1254mc',
                responsibilities: ['System Design, Firebase and React']
            },
            {
                name: 'Juan Gonzales',
                github: 'juanrodl',
                responsibilities: ['Frontend Developer'],
            },
            {
                name: 'Shehzad Shah',
                github: 'shehzad02',
                responsibilities: ['Backend Developer'],
            },
            {
                name: 'Jorge Silva',
                github: 'jesv99',
                responsibilities: ['Government API Research'],
            },
        ],
        github: {
            isPublic: true,
            url: 'https://github.com/juanrodl/cen3031_proj',
            urls: [{title: 'Main Repository', url: 'https://github.com/juanrodl/cen3031_proj'}],
        },
        tools: ['React', 'Django', 'Figma', 'CircleCI', 'Trello', 'Agile'],
        date: "Mar 21st, 2022 - April 20th, 2022",
        lessons: [
            "Agile Work Methodology is great at keeping teams transparent and accountable, and splitting work into sprints helps the team better understand/foresee the dev timeline",
            "Agile can be cumbersome when meetings are so frequent that they waste more time than they save",
            "React became my favorite Frontend Library after this project",
            "Writing how my code works for my teammates increased my own understanding of the code I wrote",
            "Wrote Unit Tests in Jest for all pages except the home page."
        ]
    },
    {
        name: "Voxel-Jump",
        desc: "Doodle Jump-esque platformer built on NextJS, HTML Canvas, and SocketIO w/ Firebase Auth and Github integration.",
        summary: "Unfortunately, the website for this project is inactive following the removal of the Heroku free tier. Voxel Jump is a recreation of Doodle Jump built on HTML Canvas, with support for multiplayer with anywhere from 2 to 20 players in one game. You can sign in with github to have your voxel carry your Github Avatar, and compete against your friends in a race mode where you battle it out to get to the finish line first. Not yet mobile-compatible",
        slug: 'voxel-jump',
        authors: [
            {
                name: 'Angel Lopez Pol',
                github: 'angel1254mc',
                responsibilities: ['Everything']
            },
        ],
        github: {
            isPublic: true,
            url: 'https://github.com/angel1254mc/I-do-what-I-must',
            urls: [{title: "Main Repo", url: 'https://github.com/angel1254mc/I-do-what-I-must'}],
        },
        lessons: [
            'Multiplayer Network Architecture is simple to conceptualize, but difficult to implement',
            'Sending the minimum amount of realtime data necessary helps keep bandwidth and latency low in competitive multiplayer games',
            'Having friends playtest your game is a good way of finding out what',
            'Do not expose your Private Firebase API Key on the frontend',
            'Video Game Programming is super fun',
        ],
        tools: ['SocketIO', 'NextJS', 'HTML Canvas', 'Heroku', 'Github Auth', 'Firebase'],
        date: "May 5th 2022 - May 28th 2022",
    },
    {
        name: "Degrees of Separation Finder (DSA)",
        slug: 'degrees-of-separation',
        desc: "Command-line program that implements DFS and Djikstra's Search algorithm to find the minimum degrees of separation between any two nodes in a graph. Utilized on a graph with more than 400,000 nodes and a million edges",
        summary: "Final Project for Data Structures and Algorithms at UF, 2021. Command-line program that implements DFS and Djikstra's Search algorithm to find the minimum degrees of separation between any two nodes in a graph. Utilized on a graph with more than 400,000 nodes and a million edges",
        authors: [
            {
                name: 'Angel Lopez Pol',
                github: 'angel1254mc',
                responsibilities: ['Algorithm - DFS, BFS - Adjacency and Edge Lists - Data pre-processing'],
            },
            {
                name: 'Jenna Sheldon',
                github: 'jennasheldon',
                responsibilities: ['CLI, I/O'],
            },
            {
                name: 'Jeya Iyadurai',
                github: 'JeyaI',
                responsibilities: ['Djikstra Search on Edge and Adjacency Lists'],
            },
        ],
        github: {
            isPublic: true,
            url: 'https://github.com/angel1254mc/TweetTeam-DegreesOfSeparation',
            urls: [{ title: 'Main Repo', url: 'https://github.com/angel1254mc/TweetTeam-DegreesOfSeparation'}]
        },
        tools: ['C++', 'Kaggle', 'DSA', 'Graph Algorithms'],
        date: "Fall Semester 2021",
        lessons: [
            'Graph Implementations can vary greatly in performance depending on what operation is performed.',
            'Kaggle is a great source of large specialized datasets',
            'The need for distributed systems is made apparent by this project. The dataset used comes from Stanford\'s SNAP and it comprises posts and follower-following relationships from 20 million users covering a meager 7 month period. A single computer cannot feasibly compute (in real time) the monstrous amount of data sent to and from twitter everyday',
        ]
    },
    {
        name: "Portfolio Website (Old)",
        slug: 'portfolio-old',
        summary: "My previous portfolio website. A set of static pages generated through NextJS. Most of the styling is done using TailwindCSS. I was very proud of my design and cool project card animations at the time of creating this website, but I later started noticing some glaring issues. Image Load times, project data being badly formatted, and glitch mobile views are only a few of the problems I was hoping to remedy in this new website",
        desc: "A small, modern portfolio website built on a mix of NEXTJS, React, TailwindCSS, and, in the future, Firebase! Deployed on Netlify",
        authors: [
            {
                name: 'Angel Lopez Pol',
                github: 'angel1254mc',
                responsibilities: ['Everything']
            },
        ],
        github: {
            isPublic: true,
            url: 'https://github.com/angel1254mc/angel1254.github.io',
            urls: [{title: 'Main Repo', url:'https://github.com/angel1254mc/angel1254.github.io'}],
        },
        tools: ['NextJS', 'Vercel'],
        date: "March 2022",
        lessons: [
            'TailwindCSS is good for rapidly prototyping pages, without as crazy of an effect on bundle size as its alternative - CSS-in-JS-based styling',
            'Prototyping a design before you code it helps a lot (I had no idea about Figma back then)',
        ]
    },
    {
        name: "Minesweeper Replica",
        slug: 'minesweeper-replica',
        desc: "C++ Application that uses SFML to display a fully-functioning minesweeper replica. Able to read existing boards and generate new ones",
        summary: "C++ Application that uses SFML to display a fully-functioning minesweeper replica. Able to read existing boards and generate new ones",
        authors: [
            {
                name: 'Angel Lopez Pol',
                github: 'angel1254mc',
                responsibilities: ['Everything'],
            },
        ],
        github: {
            isPublic: true,
            url: 'https://github.com/angel1254mc/Angel-Minesweeper-2020',
            urls: [{title: "Main Repo", url: 'https://github.com/angel1254mc/Angel-Minesweeper-2020'}]
        },
        tools: ['SFML', 'C++'],
        date: "Spring Semester 2021",
        lessons: ['SFML is a pretty good library for Game Dev on C++'],
    }
]

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
const Skills = "";
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

export {tldr, Skills, Projects, Blog};