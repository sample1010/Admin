<template>
	<el-button
		:size="size"
		:type="type"
		:plain="plain"
		:round="round"
		:circle="circle"
		:icon="icon"
		:loading="loading"
		:disabled="disabled"
		@click="toExport"
	>
		<slot>導出</slot>
	</el-button>
</template>

<script lang="ts" name="cl-export-btn" setup>
import { useCrud } from "@cool-vue/crud";
import { ElMessage } from "element-plus";
import { ref } from "vue";
import { currentDate, export_json_to_excel } from "../utils";

const props = defineProps({
	filename: [Function, String],
	autoWidth: {
		type: Boolean,
		default: true
	},
	bookType: {
		type: String,
		default: "xlsx"
	},
	header: Array,
	columns: {
		type: Array,
		required: true
	},
	data: [Function, Array],
	maxExportLimit: Number, // 最大導出條數，不傳或者小於等於0為不限制
	size: String,
	disabled: Boolean,
	type: String,
	plain: Boolean,
	round: Boolean,
	circle: Boolean,
	icon: String
});

// 加載狀態
const loading = ref<boolean>(false);

// crud
const Crud = useCrud();

async function getHeader(columns: any[], fields: any[]) {
	return columns.filter((e) => !e.hidden && fields.includes(e.prop)).map((e) => e.label);
}

function getData() {
	if (typeof props.data === "function") {
		return props.data();
	} else {
		if (props.data) {
			return props.data;
		} else {
			return Crud.value?.service
				.page({
					...Crud.value?.paramsReplace(Crud.value.params),
					maxExportLimit: props.maxExportLimit,
					isExport: true
				})
				.then((res) => {
					return res.list.map((e: any) => {
						for (const i in e) {
							const col: any = props.columns.find((c: any) => c.prop == i);

							if (col) {
								if (col.dict) {
									const d = col.dict.find((d: any) => d.value == e[i]);

									if (d) {
										e[i] = d.label;
									}
								}
							}
						}

						return e;
					});
				})
				.catch((err) => {
					ElMessage.error(err.message);
					return null;
				});
		}
	}
}

async function getFileName() {
	if (typeof props.filename === "function") {
		return await props?.filename();
	} else {
		const { year, month, day, hour, minu, sec } = currentDate();
		return props.filename || `報表（${year}-${month}-${day} ${hour}_${minu}_${sec}）`;
	}
}

async function toExport() {
	if (!props.columns) {
		return console.error("cl-export-btn.columns 不能為空！");
	}

	// 加載
	loading.value = true;

	// 表格列
	const columns = props.columns.filter(
		(e: any) =>
			!(
				e.hidden === true ||
				["selection", "expand", "index"].includes(e.type) ||
				e.filterExport ||
				e["filter-export"]
			)
	);

	// 字段
	const fields = columns.map((e: any) => e.prop).filter(Boolean);

	// 表頭
	let header = await getHeader(columns, fields);

	// 數據
	let data = await getData();

	if (!data) {
		loading.value = false;
		return console.error("導出數據異常");
	}

	// 文件名
	let filename = await getFileName();

	// 過濾
	data = data.map((d: any) => fields.map((f) => d[f]));

	// 導出 excel
	export_json_to_excel({
		header,
		data,
		filename,
		autoWidth: props.autoWidth,
		bookType: props.bookType
	});

	loading.value = false;
}
</script>
