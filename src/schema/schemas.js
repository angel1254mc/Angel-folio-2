import * as yup from 'yup';

export const postSchema = yup.object({
   id: yup.number(),
   created_at: yup.string(),
   title: yup.string().required(),
   excerpt: yup.string().required(),
   content: yup.string().required(),
   imageURI: yup.string().required(),
   emoji: yup.string().required(),
   project: yup.string(),
   slug: yup.string().required(),
   tags: yup.string(),
   likes: yup.number(),
});

export const projectSchema = yup.object({
   id: yup.number(),
   date: yup.string().required(),
   created_at: yup.string(),
   name: yup.string().required(),
   tools: yup.string().required(),
   slug: yup.string().required(),
   summary: yup.string().required(),
   desc: yup.string().required(),
   github: yup.object({
      url: yup.string(),
      urls: yup.array().of(yup.object({})),
      isPublic: yup.bool().required(),
   }),
   authors: yup.array().of(
      yup.object({
         name: yup.string(),
         github: yup.string(),
         responsibilities: yup.string(),
      })
   ),
   lessons: yup.array().of(yup.string()),
   added: yup.number(),
});
