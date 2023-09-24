
export default async function handler(req, res) {
    let thirtyMinutesAgo = Math.floor(Date.now() / 1000) - 86400;
    console.log(thirtyMinutesAgo)
    let resp = await fetch(process.env.LOKI_URL + `/loki/api/v1/query_range?query={kind="measurement"}&step=300&start=${thirtyMinutesAgo}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${process.env.LOKI_INSTANCE_ID}:${process.env.LOKI_AUTH_TOKEN}`),
          'Content-Type': 'application/json',
        }
    })
    let json = await resp.json();

    let values = json.data.result.length > 0 ? json.data.result[0].values : {}

    // Oh my god
    let vitalList = ["cls", "lcp", "fcp", "ttfb"]
    let vitalObj = {}
    for (let i = 0; i < 4; i++) {
        let vitalStrTrailing = values[i][1].substr(values[i][1].indexOf(vitalList[i]));
        let vitalPair =  vitalStrTrailing.substr(0, vitalStrTrailing.indexOf(" ")).split("=")
        vitalObj[vitalPair[0]] = vitalPair[1];
    }

    console.log(vitalObj);

    if (vitalObj) {
        return res.json(vitalObj)
    }
    return res
        .status(500)
        .json({
            message:
                "There was an error: last starred repo couldn't be obtained!",
        });
}
