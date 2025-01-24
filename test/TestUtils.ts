import * as fs from "fs-extra";
import path from "path";

const getContentFromArchives = (name: string): string => {
	return fs.readFileSync(`test/resources/archives/${name}`).toString("base64");
};

const clearDisk = () => {
	let dirPath = path.resolve(__dirname,"../data");
	if(fs.existsSync(dirPath)){
		fs.rmdirSync(dirPath, {recursive: true});
	}
};

export {getContentFromArchives, clearDisk};
