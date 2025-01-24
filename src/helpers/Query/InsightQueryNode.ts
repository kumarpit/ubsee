import {Nullable} from "../../types/Constants";
import {Comparator, FilterTypes, ValidField} from "../../types/Query";

export class InsightQueryNode {
	private type: FilterTypes;
	private value: Nullable<string | number>;
	private dataset: Nullable<string>;
	private field: Nullable<ValidField>;
	private comparator: Nullable<Comparator>;
	private filters: InsightQueryNode[];

	constructor(type: FilterTypes, dataset: Nullable<string>, value: Nullable<string | number> = null,
		cmp: Nullable<Comparator> = null, field: Nullable<ValidField> = null,
		filters: InsightQueryNode[] = []) {
		this.type = type;
		this.dataset = dataset;
		this.field = field;
		this.comparator = cmp;
		this.value = value;
		this.filters = filters;
	}

	public addFilter(filter: InsightQueryNode) {
		this.filters.push(filter);
	}

	// getters
	public getType() {
		return this.type;
	}

	public getValue() {
		return this.value;
	}

	public getDataset() {
		return this.dataset;
	}

	public getField(): Nullable<ValidField> {
		return this.field;
	}

	public getComparator() {
		return this.comparator;
	}

	public getFilters() {
		return this.filters;
	}
}
