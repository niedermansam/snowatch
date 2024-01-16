'use server'

import { z } from "zod";
import { revalidate } from "~/app/api/snotel/id/[id]/route";
import { USER_AGENT } from "../utils/userAgents";

const discussionItemMetadata = z.object({
    '@id': z.string(),
    id: z.string(),
    'issuanceTime': z.string()
})
const discussionListValidator = z.object({
  "@graph": z.array(discussionItemMetadata),
});


export async function getDiscussionList(station:string){
    try {
    const res = await  fetch("https://api.weather.gov/products/types/AFD/locations/" + station, {
        next: {
            revalidate: 60*5, 
        },
        headers: {
          'User-Agent': USER_AGENT
        }
    });
    
    const data = (await res.json()) as unknown;

    return discussionListValidator.parse(data)
} catch (error) {
    console.error(error)
}
}

const forecastDiscussionValidator = z.object({
    productText: z.string(),
    id: z.string()
})

export async function getDiscussion(url:string) {
    const res = await fetch(url, {
        cache: 'force-cache'
    });
    const data = (await res.json()) as unknown;

 
    return forecastDiscussionValidator.parse(data)
}