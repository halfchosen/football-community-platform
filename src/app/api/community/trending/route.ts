import { getLiveTrending } from "@/lib/community/trending";
export async function GET(){try{return Response.json(await getLiveTrending(),{headers:{"Cache-Control":"public, max-age=15, s-maxage=15"}});}catch{return Response.json({error:"Trending is temporarily unavailable."},{status:503});}}
