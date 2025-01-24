import {Document, Element, TextNode} from "parse5/dist/tree-adapters/default";
import {Nullable} from "../../types/Constants";
import {RoomHtml} from "../../types/RoomHtml";


function getElementsByNodeNameHelper(parent: Element, childNodeName: string, elements: Element[]){
	if(parent.nodeName === childNodeName){
		elements.push(parent);
	}else if(parent.childNodes === undefined){
		return;
	}else{
		for(let childNode of parent.childNodes){
			getElementsByNodeNameHelper(childNode as Element, childNodeName, elements);
		}
	}
}

function getElementsByNodeName(parent: Element, childNodeName: string): Element[]{
	let elements: Element[] = [];
	getElementsByNodeNameHelper(parent, childNodeName, elements);
	return elements;
}


function getBuildingFullNameFromHtml(htmlBody: Element): string{
	let elements: Element[] = getElementsByNodeName(htmlBody, "h2");
	let fullNameElement: Element = elements[1].childNodes[0] as Element;
	let fullName: string = getTextValueFromElement(fullNameElement).trim();
	return fullName;
}

function getBuildingAddress(htmlBody: Element): string{
	let elements: Element[] = getElementsByNodeName(htmlBody, "h2");
	let fullNameElement: Element = elements[1].childNodes[0] as Element;
	let parentDiv: Element = elements[1].parentNode as Element;
	let addressElement: Element = ((parentDiv.childNodes[3]) as Element).childNodes[0] as Element;
	let address: string = getTextValueFromElement(addressElement).trim();
	return address;
}


function getValuesFromTable(htmlBody: Element): RoomHtml[]{
	let rooms: RoomHtml[] = [];
	let tdElements = getTDsFromTable(htmlBody);
	let count = 0;
	let room: RoomHtml = {
		number: "",
		seats: 0,
		type: "",
		furniture: "",
		href: ""
	};
	for(let td of tdElements){
		for(let attr of td.attrs){
			if(attr.name === "class"){
				if(attr.value.includes("room-number")){
					room.number = getTextValueFromElement(td);
                    // room.number = 12;
					let result = gethRefAndRoomNumberFromTD(td);
					room.number = result[0];
					room.href = result[1];
					count++;
				}
				if(attr.value.includes("room-type")){
					room.type = getTextValueFromElement(td);
					count++;
				}
				if(attr.value.includes("room-capacity")){
					room.seats = parseInt(getTextValueFromElement(td), 10);
					count++;
				}
				if(attr.value.includes("room-furniture")){
					room.furniture = getTextValueFromElement(td);
					count++;
				}
				if(count === 4){
					rooms.push(room);
					count = 0;
					room = {
						number: "",
						seats: 0,
						type: "",
						furniture: "",
						href: ""
					};
				}
			}
		}
	}

	return rooms;
}

function getBuildingsFromIndex(htmlBody: Element): Set<string>{
	let set: Set<string> = new Set<string>();
	let tableTDs: Element[] = getTDsFromTable(htmlBody);
    // handle case when table is not present
	for(let td of tableTDs){
		for(let attr of td.attrs){
			if(attr.name === "class"){
				if(attr.value.includes("building-code")){
					for(let child2 of td.childNodes){
						if(child2.nodeName === "#text"){
							let textNode: TextNode = child2 as unknown as TextNode;
							let buildingName: string = textNode.value.trim();
							set.add(buildingName);
						}
					}
				}
			}
		}
	}

	return set;
}


function getTableBody(htmlBody: Element): Nullable<Element>{
	return getElementsByNodeName(htmlBody, "tbody")[0];
}


// returns empty set when no table present
function getTDsFromTable(htmlBody: Element): Element[]{
	let tableTDs: Element[] = [];
	let tBody = getTableBody(htmlBody) as Element;
	if(tBody){
		for(let tBodyChild of tBody.childNodes){
			if(tBodyChild.nodeName === "tr"){
				let tr = tBodyChild as Element;
				for(let trChild of tr.childNodes){
					if(trChild.nodeName === "td"){
						let td: Element = trChild as Element;
						tableTDs.push(td);
					}
				}
			}
		}
	}
	return tableTDs;
}

function gethRefAndRoomNumberFromTD(td: Element): string[]{
	let hRef: string = "";
	let roomNumber: string = "";
	for(let child of td.childNodes){
		if(child.nodeName === "a"){
			for(let attr of child.attrs){
				if(attr.name === "href"){
					hRef = attr.value;
				}
			}
			let childNode = child as Element;
			roomNumber = getTextValueFromElement(childNode);
		}
	}
	return [roomNumber, hRef];
}

function getTextValueFromElement(element: Element): string{
	let text: string = "";
	if(element.childNodes === undefined) {
		return text;
	}
	for(let child of element.childNodes){
		if(child.nodeName === "#text"){
			let textNode: TextNode = child as unknown as TextNode;
			text = textNode.value.trim();
		}
	}
	return text;
}

function getHtmlBody(document: Document): Nullable<Element>{
	let htmlBody: Nullable<Element> = null;
	let html = getElementsByNodeName(document as unknown as Element, "html")[0];
	if(html){
		htmlBody = getElementsByNodeName(html as Element, "body")[0];
	}
	return htmlBody;
}

export {
	getHtmlBody, getTableBody, getBuildingsFromIndex, getValuesFromTable,
	getTDsFromTable, getElementsByNodeName, getBuildingFullNameFromHtml, getBuildingAddress
};

