<template>
	<cl-crud ref="Crud">
		<el-row>
			<cl-refresh-btn />

			<el-button
				v-permission="service.base.sys.log.permission.clear"
				type="danger"
				@click="clear"
			>
				清空
			</el-button>

			<cl-filter label="日誌保存天數">
				<el-input-number
					v-model="day"
					controls-position="right"
					:max="10000"
					:min="1"
					@change="saveDay"
				/>
			</cl-filter>

			<cl-flex1 />
			<cl-search-key placeholder="請求地址、參數、ip" />
		</el-row>

		<el-row>
			<cl-table ref="Table" :default-sort="{ prop: 'createTime', order: 'descending' }" />
		</el-row>

		<el-row>
			<cl-flex1 />
			<cl-pagination />
		</el-row>
	</cl-crud>
</template>

<script lang="ts" name="sys-log" setup>
import { onMounted, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useCool } from "/@/cool";
import { useCrud, useTable } from "@cool-vue/crud";

const { service } = useCool();

// 天數
const day = ref<number>(1);

// cl-crud 配置
const Crud = useCrud({ service: service.base.sys.log }, (app) => {
	app.refresh();
});

// cl-table 配置
const Table = useTable({
	contextMenu: ["refresh"],
	columns: [
		{
			type: "index",
			label: "#",
			width: 60
		},
		{
			prop: "userId",
			label: "用戶ID"
		},
		{
			prop: "name",
			label: "暱稱",
			minWidth: 150
		},
		{
			prop: "action",
			label: "請求地址",
			minWidth: 200,
			showOverflowTooltip: true
		},
		{
			prop: "params",
			label: "參數",
			minWidth: 200,
			showOverflowTooltip: true
		},
		{
			prop: "ip",
			label: "ip",
			minWidth: 150
		},
		{
			prop: "ipAddr",
			label: "ip地址",
			minWidth: 150
		},
		{
			prop: "createTime",
			label: "創建時間",
			minWidth: 160,
			sortable: true
		}
	]
});

// 保存天數
function saveDay() {
	service.base.sys.log.setKeep({ value: day.value }).then(() => {
		ElMessage.success("保存成功");
	});
}

// 清空日誌
function clear() {
	ElMessageBox.confirm("是否要清空日誌", "提示", {
		type: "warning"
	})
		.then(() => {
			service.base.sys.log
				.clear()
				.then(() => {
					ElMessage.success("清空成功");
					Crud.value?.refresh();
				})
				.catch((err) => {
					ElMessage.error(err.message);
				});
		})
		.catch(() => null);
}

onMounted(() => {
	// 獲取天數
	service.base.sys.log.getKeep().then((res: number) => {
		day.value = Number(res);
	});
});
</script>
