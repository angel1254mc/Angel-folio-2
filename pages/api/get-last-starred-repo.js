import { getLastStarredRepo } from ".";

export default async function handler(req, res) {
    let lastStarredRepo = await getLastStarredRepo();

    if (lastStarredRepo?.data.length > 0) {
        return res.send({
            full_name: lastStarredRepo.data[0].full_name,
            url: lastStarredRepo.data[0].html_url,
            description: lastStarredRepo.data[0].description,
        });
    }
    return res
        .status(500)
        .json({
            message:
                "There was an error: last starred repo couldn't be obtained!",
        });
}
