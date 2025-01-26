import { getLastStarredRepo } from '@/app/api';

export const dynamic = 'force-dynamic'

export const GET = async () => {

   let lastStarredRepo = await getLastStarredRepo();

   if (lastStarredRepo?.data.length > 0) {
      return Response.json({
         full_name: lastStarredRepo.data[0].full_name,
         url: lastStarredRepo.data[0].html_url,
         description: lastStarredRepo.data[0].description,
      });
   }
   return Response.status(500).json({
      message: "There was an error: last starred repo couldn't be obtained!",
   });
};
