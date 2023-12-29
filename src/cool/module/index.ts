// @ts-nocheck
import { Module } from "../types";
import { Data } from "../utils";

// 數據列表
const list: Module[] = Data.get("modules", []);

// 模块
const module = {
	list,
	req: Promise.resolve(),
	get(name: string): Module {
		return this.list.find((e) => e.name == name);
	},
	add(data: Module) {
		this.list.push(data);
	},
	wait() {
		return this.req;
	}
};

export { module };
