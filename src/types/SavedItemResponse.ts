import { BaseDto } from "./BaseDto";
import { ItemResponse } from "./ItemResponse";

export interface SavedItemResponse extends BaseDto {
    item: ItemResponse;
}