export default () => {
  return {
    components: [import("./components/index.vue"), import("./components/space.vue")],

    options: {
      // 尺寸
      size: 120,
      // 显示文案
      text: "選擇文件",
      // 限制
      limit: {
        // 上传最大数量
        upload: 9,
        // 文件空间選擇数
        select: 9,
        // 上传大小限制
        size: 100
      }
    }
  };
};
