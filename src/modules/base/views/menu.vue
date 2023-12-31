<template>
  <cl-crud ref="Crud">
    <el-row>
      <cl-refresh-btn />
      <cl-add-btn />
      <menu-create v-if="isDev" />
    </el-row>

    <el-row>
      <cl-table ref="Table" row-key="id" @row-click="onRowClick">
        <!-- 名稱 -->
        <template #column-name="{ scope }">
          <span>{{ scope.row.name }}</span>
          <el-tag
            v-if="!scope.row.isShow"
            effect="dark"
            type="danger"
            size="small"
            disable-transitions
            style="margin-left: 10px"
            >隱藏</el-tag
          >
        </template>

        <!-- 圖標 -->
        <template #column-icon="{ scope }">
          <cl-svg :name="scope.row.icon" size="16px" style="margin-top: 5px" />
        </template>

        <!-- 權限 -->
        <template #column-perms="{ scope }">
          <el-tag
            v-for="(item, index) in scope.row.permList"
            :key="index"
            effect="plain"
            size="small"
            style="margin: 2px; letter-spacing: 0.5px"
            >{{ item }}</el-tag
          >
        </template>

        <!-- 路由 -->
        <template #column-router="{ scope }">
          <el-link v-if="scope.row.type == 1" type="success" :href="scope.row.router">{{
            scope.row.router
          }}</el-link>
          <span v-else>{{ scope.row.router }}</span>
        </template>

        <!-- 路由緩存 -->
        <template #column-keepAlive="{ scope }">
          <el-icon v-if="scope.row.type == 1">
            <check v-if="scope.row.keepAlive" />
            <close v-else />
          </el-icon>
          <span v-else></span>
        </template>

        <!-- 行新增 -->
        <template #slot-add="{ scope }">
          <el-button
            type="success"
            text
            bg
            v-permission="{
              and: [service.base.sys.menu.permission.add, scope.row.type != 2]
            }"
            @click="append(scope.row)"
            >新增</el-button
          >
        </template>
      </cl-table>
    </el-row>

    <el-row>
      <cl-flex1 />
      <cl-pagination layout="total" />
    </el-row>

    <!-- 新增、編輯 -->
    <cl-upsert ref="Upsert">
      <template #slot-parentId="{ scope }">
        <menu-select v-model="scope.parentId" :type="scope.type" />
      </template>
    </cl-upsert>
  </cl-crud>
</template>

<script lang="ts" name="sys-menu" setup>
import { Check, Close } from "@element-plus/icons-vue";
import { useCrud, useTable, useUpsert } from "@cool-vue/crud";
import { useCool, isDev } from "/@/cool";
import { deepTree } from "/@/cool/utils";
import MenuCreate from "./components/menu/create.vue";
import MenuSelect from "./components/menu/select.vue";
import MenuFile from "./components/menu/file.vue";
import MenuPerms from "./components/menu/perms.vue";
import IconSelect from "./components/menu/icon.vue";

const { service } = useCool();

// cl-crud 配置
const Crud = useCrud(
  {
    service: service.base.sys.menu,
    onRefresh(_, { render }) {
      service.base.sys.menu.list().then((list) => {
        list.map((e) => {
          e.permList = e.perms ? e.perms.split(",") : [];
        });

        render(deepTree(list));
      });
    }
  },
  (app) => {
    app.refresh();
  }
);

// cl-table 配置
const Table = useTable({
  contextMenu: [
    (row) => {
      return {
        label: "新增",
        hidden: !(row.type != 2 && service.base.sys.user._permission.add),
        callback(done) {
          append(row);
          done();
        }
      };
    },
    "update",
    "delete",
    (row) => {
      return {
        label: "添加權限",
        hidden: !(row.type == 1 && service.base.sys.user._permission.add),
        callback(done) {
          addPermission(row);
          done();
        }
      };
    }
  ],
  columns: [
    {
      prop: "name",
      label: "名稱",
      align: "left",
      width: 200
    },
    {
      prop: "icon",
      label: "圖標",
      width: 80
    },
    {
      prop: "type",
      label: "類型",
      width: 100,
      dict: [
        {
          label: "目錄",
          value: 0
        },
        {
          label: "菜單",
          value: 1,
          type: "success"
        },
        {
          label: "權限",
          value: 2,
          type: "danger"
        }
      ]
    },
    {
      prop: "router",
      label: "節點路由",
      minWidth: 160
    },
    {
      prop: "keepAlive",
      label: "路由緩存",
      width: 100
    },
    {
      prop: "viewPath",
      label: "文件路徑",
      minWidth: 200,
      showOverflowTooltip: true
    },
    {
      prop: "perms",
      label: "權限",
      headerAlign: "center",
      minWidth: 300
    },
    {
      prop: "orderNum",
      label: "排序號",
      width: 90
    },
    {
      prop: "updateTime",
      label: "更新時間",
      sortable: "custom",
      width: 160
    },
    {
      label: "操作",
      type: "op",
      width: 250,
      buttons: ["slot-add", "edit", "delete"]
    }
  ]
});

// cl-upsert 配置
const Upsert = useUpsert({
  dialog: {
    width: "800px"
  },
  items: [
    {
      prop: "type",
      value: 0,
      label: "節點類型",
      required: true,
      component: {
        name: "el-radio-group",
        options: [
          {
            label: "目錄",
            value: 0
          },
          {
            label: "菜單",
            value: 1
          },
          {
            label: "權限",
            value: 2
          }
        ]
      }
    },
    {
      prop: "name",
      label: "節點名稱",
      component: {
        name: "el-input"
      },
      required: true
    },
    {
      prop: "parentId",
      label: "上級節點",
      hook: "empty",
      component: {
        name: "slot-parentId"
      }
    },
    {
      prop: "router",
      label: "節點路由",
      hidden: ({ scope }) => scope.type != 1,
      component: {
        name: "el-input",
        props: {
          placeholder: "請輸入節點路由，如：/test"
        }
      }
    },
    {
      prop: "keepAlive",
      value: true,
      label: "路由緩存",
      hidden: ({ scope }) => scope.type != 1,
      component: {
        name: "el-radio-group",
        options: [
          {
            label: "開啟",
            value: true
          },
          {
            label: "關閉",
            value: false
          }
        ]
      }
    },
    {
      prop: "isShow",
      label: "是否顯示",
      value: true,
      hidden: ({ scope }) => scope.type == 2,
      flex: false,
      component: {
        name: "el-switch"
      }
    },
    {
      prop: "viewPath",
      label: "文件路徑",
      hidden: ({ scope }) => scope.type != 1,
      component: {
        vm: MenuFile
      }
    },
    {
      prop: "icon",
      label: "節點圖標",
      hidden: ({ scope }) => scope.type == 2,
      component: {
        vm: IconSelect
      }
    },
    {
      prop: "orderNum",
      label: "排序號",
      component: {
        name: "el-input-number",
        props: {
          placeholder: "請填寫排序號",
          min: 0,
          max: 99,
          "controls-position": "right"
        }
      }
    },
    {
      prop: "perms",
      label: "權限",
      hidden: ({ scope }) => scope.type != 2,
      component: {
        vm: MenuPerms
      }
    }
  ],
  onSubmit: (data: any, { next }: any) => {
    next(data);
  }
});

// 行點擊展開
function onRowClick(row: any, column: any) {
  if (column?.property && row.children) {
    Table.value?.toggleRowExpansion(row);
  }
}

// 子集新增
function append({ type, id }: any) {
  Crud.value?.rowAppend({
    parentId: id,
    parentType: type,
    type: type + 1,
    keepAlive: true,
    isShow: true
  });
}

// 設置權限
function addPermission({ id }: any) {
  Crud.value?.rowAppend({
    parentId: id,
    type: 2
  });
}
</script>
