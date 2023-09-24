import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    const {data: [lastDrankCoffee] } = await supabase.from('Coffee').select('*');

    if (lastDrankCoffee) {
        return res.json({
            last_drank: lastDrankCoffee.last_drank
        })
    }

    return res
        .status(500)
        .json({
            message:
                "There was an error: last drank coffee timestamp couldn't be obtained!",
        });
}
