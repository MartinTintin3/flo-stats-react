import axios, { AxiosRequestConfig } from "axios";

import { BaseResponse, BoutsResponse, SearchResults, WrestlersResponse } from "./types/responses";
import { BoutsIncludeString, FloObject, FloObjectTypeString, UUID, WrestlersIncludeString } from "./types/types";
import { Relationship, RelationshipToBout, RelationshipToWrestler } from "./types/relationships";
import { WrestlerObject } from "./types/objects/wrestler";
import { BoutObject } from "./types/objects/bout";

export type FetchConfig = {
	pageSize: number;
	pageOffset: number;
	onProgress?: (progress: number) => void;
}

export default class FloAPI {
	public static searchByName(name: string, config?: AxiosRequestConfig) {
		return axios.get<SearchResults>(`https://api.flowrestling.org/api/experiences/web/legacy-core/search?site_id=2&version=1.24.0&limit=200&view=global-search-web&fields=data%3C1%3E&q=${encodeURIComponent(name)}&page=1&type=person`, config);
	}

	public static fetchWithProgress<O extends FloObject, R extends Relationship | void, I = Exclude<FloObject, O> | void>(url: string, onProgress?: (progress: number) => void): Promise<BaseResponse<O, R, I>> {
		return new Promise(resolve => {
			const xhr = new XMLHttpRequest();
			xhr.open("GET", url, true);
			xhr.addEventListener("progress", e => {
				if (e.lengthComputable && onProgress) onProgress((e.loaded / e.total) * 100);
			});
			xhr.addEventListener("load", () => {
				if (onProgress) onProgress(100);
				resolve(JSON.parse(xhr.responseText) as BaseResponse<O, R, I>);
			});
			xhr.send();
		});
	}

	public static fetchWrestlersByAthleteId<R extends RelationshipToWrestler | void, I extends Exclude<FloObject, WrestlerObject> | void>(athleteId: UUID, config: FetchConfig, include: WrestlersIncludeString[] = ["bracketPlacements.weightClass", "division", "event", "weightClass", "team"], extra?: string): Promise<WrestlersResponse<R, I>> {
		return this.fetchWithProgress<WrestlerObject, R, I>(`https://floarena-api.flowrestling.org/wrestlers/?identityPersonId=${athleteId}&page[size]=${config.pageSize}&page[offset]=${config.pageOffset}` + (include.length ? `&include=${include.join(",")}` : "") + (extra ?? ""), config.onProgress);
	}

	public static fetchBouts<R extends RelationshipToBout | void, I extends Exclude<FloObject, BoutObject> | void>(athleteId: UUID, config: FetchConfig, include: BoutsIncludeString[] = ["bottomWrestler.team", "topWrestler.team", "weightClass", "topWrestler.division", "bottomWrestler.division", "event","roundName"], extra?: string): Promise<BoutsResponse<R, I>> {
		return this.fetchWithProgress<BoutObject, R, I>(`https://floarena-api.flowrestling.org/bouts/?identityPersonId=${athleteId}&page[size]=${config.pageSize}&page[offset]=${config.pageOffset}` + (include.length ? `&include=${include.join(",")}` : "") + (extra ?? ""), config.onProgress);
	}

	public static fetchWrestlersByWeightClass<R extends RelationshipToWrestler | void, I extends Exclude<FloObject, WrestlerObject> | void>(weightClassId: UUID, config: FetchConfig, include: string[] = [], extra?: string): Promise<WrestlersResponse<R, I>> {
		return this.fetchWithProgress<WrestlerObject, R, I>(`https://floarena-api.flowrestling.org/wrestlers/?weightClassId=${weightClassId}&page[size]=${config.pageSize}&page[offset]=${config.pageOffset}` + (include.length ? `&include=${include.join(",")}` : "") + (extra ?? ""),);
	}

	public static findIncludedObjectById<T extends FloObject>(id: UUID, type: FloObjectTypeString, res: BaseResponse<FloObject, Relationship | void, FloObject>) {
		return res.included.find(i => i.type == type && i.id == id) as T | undefined;
	}
}