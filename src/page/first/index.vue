<template>
  <h1>这是 first 页面</h1>
  <DragPopup v-model:visible="show" :isCenterShow="show">
    <div class="box">12121</div>
  </DragPopup>
  <button @click="go">组件导航页</button>
  <!-- <button @click="show = !show">开启popup</button> -->

  <div class="">
    <input type="file" id="fileInput" />
    <pre id="fileContent"></pre>
  </div>

  <div class="">
    <select id="printer-select" style="width: 300px; height: 30px">
      <option value="" v-for="(item, index) in printers" :key="index">
        {{ JSON.stringify(item) }}
      </option>
    </select>
  </div>

  <div id="label-designer">
    <canvas id="barcode" width="200" height="100"></canvas>
  </div>

  <div class="toolbox">
    <button id="add-barcode" @click="getBarCode">生成条码</button>
    <button id="add-qrcode" @click="selectPrinter">选择打印机</button>
    <button id="add-qrcode" @click="printLabel">打印</button>
    <button id="add-qrcode" @click="loadFile">读取文件</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import DragPopup from "../../components/DragPopup.vue";
import JsBarcode from "jsbarcode";
// import { ipcRenderer } from "electron";

const router = useRouter();

onMounted(() => {
  document.getElementById("fileInput").addEventListener("change", async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      loadFile(file.path);
    } catch (err) {
      console.error("文件读取失败:", err);
    }
  });
});
const go = () => {
  router.push("/componentsNav");
};

const show = ref(false);
const printers = ref([]);
const getBarCode = () => {
  JsBarcode("#barcode", "601211KBD0000018", {
    format: "CODE128",
    lineColor: "#000",
    width: 1.3,
    height: 40,
    displayValue: true,
  });
};

async function loadFile(url) {
  try {
    const content = await ipcRenderer.invoke("read-file", url);
    console.log(content);
  } catch (err) {
    console.error("读取文件失败:", err);
  }
}

const selectPrinter = async () => {
  const printers = await ipcRenderer.invoke("get-printers");
  printers.value = printers;
};
async function printLabel() {
  try {
    // if (!printerName) {
    //     const defaultPrinter = printers.find(p => p.isDefault);
    //     if (!defaultPrinter) throw new Error('没有设置默认打印机');
    //     printerName = defaultPrinter.name;
    // }
    const element = document.getElementById("label-designer");
    const html = `
    <!DOCTYPE html>
    <html>
      <body>${element.outerHTML}</body>
    </html>
  `;

    // 准备打印选项

    // // 调用主进程的打印方法
    const success = await ipcRenderer.invoke("print-dom-element", html);
    if (!success) throw new Error("打印失败");
    //  const printOptions = {
    //   url: window.location.href, // 或直接使用当前页面的 URL: window.location.href
    //   printerName: "TSC TX210",
    //   // 可以添加其他打印参数
    //   margins: {
    //     marginType: "none", // 或 'default', 'none', 'printableArea', 'custom'
    //   },
    //   landscape: false,
    //   pagesPerSheet: 1,
    //   copies: 1,
    // };
    // const result = await ipcRenderer.invoke("print-label", printOptions);
    console.log("打印结果:", success);
  } catch (error) {
    console.error("打印出错:", error);
  }
}
</script>

<style scoped></style>
<style scoped lang="less">
.box {
  width: 300px;
  height: 300px;
}
</style>
