import { ItemIndex } from "./ItemIndex";

export interface ItemIndexResponse {
    item: ItemIndex;
    highlights: Map<string, string[]>;
}
