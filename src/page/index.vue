<template>
<div class="container">
    <h3>参数配置</h3>
    <NForm ref="formRef" :model="form" :rules="rules" label-placement="left" :label-width="120" class="form" >
        <NFormItem path="age" label="РСВА厂" >
            <NSelect v-model:value="form.age" :options="PCBAOption" style="width: 250px" />
        </NFormItem>
        <NFormItem path="password" label="组装厂">
            <NInput v-model:value="form.password" style="width: 250px"  />
        </NFormItem>
        <NFormItem path="age" label="产品类别">
            <NSelect v-model:value="form.age" :options="PCBAOption" style="width: 250px" />
        </NFormItem>
        <NFormItem path="age" label="产品规格">
            <NSelect v-model:value="form.age" :options="PCBAOption" style="width: 250px" />
        </NFormItem>
        <NFormItem path="password" label="产品代系">
            <NSelect v-model:value="form.age" :options="PCBAOption" style="width: 250px" />
        </NFormItem>
        <NFormItem path="age" label="产品序列号">
            <NSelect v-model:value="form.age" :options="PCBAOption" style="width: 250px" />
        </NFormItem>
        <NFormItem path="password" label="年">
            <NSelect v-model:value="form.age" :options="PCBAOption" style="width: 250px" />
        </NFormItem>
        <NFormItem path="password" label="周">
            <NSelect v-model:value="form.age" :options="PCBAOption" style="width: 250px" />
        </NFormItem>
        <NFormItem path="password" label="国别">
            <NSelect v-model:value="form.age" :options="PCBAOption" style="width: 250px" />
        </NFormItem>
        <NFormItem path="password" label="流水号">
            <NInput v-model:value="form.password"  style="width: 210px"  />
        </NFormItem>
        <NButton  type="primary" @click="submit"  style="width: 90px">生成</NButton>
    </NForm>

    <div class="" v-for="(item, index) in printers" :key="index">{{ item }}</div>
    <div id="label-designer">
        <canvas id="barcode" width="200" height="100"></canvas>
    </div>

    <div v-if="headers.length > 0" class="table-container">
        <table>
            <thead>
                <tr>
                    <th v-for="(header, index) in headers" :key="index">
                        {{ header }}
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, rowIndex) in excelData" :key="rowIndex">
                    <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                        {{ cell }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="toolbox">
        <NButton type="primary" class="ml-10px" id="add-barcode" @click="getBarCode">生成条码</NButton>
        <NButton type="primary" class="ml-10px" id="add-qrcode" @click="selectPrinter">选择打印机</NButton>
        <NButton type="primary" class="ml-10px" id="add-qrcode" @click="printLabel">打印</NButton>
        <NButton type="primary" class="ml-10px" @click="handleOpenFile">打开 Excel 文件</NButton>
    </div>
</div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import JsBarcode from "jsbarcode";
import * as XLSX from 'xlsx'
import { NButton,NForm,NFormItem,NInput,NSelect, } from 'naive-ui'

const form = ref({
    age:null,
    password:null
})
const PCBAOption=ref([])
const router = useRouter();
const fileName = ref('')
const headers = ref([])
const excelData = ref([])

const rules={}
onMounted(() => {

});
const submit = () => {
   
};
ipcRenderer.on('navigate-to', (event, path) => {
    router.push(path); // 使用 Vue Router 进行跳转
});
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

const selectPrinter = async () => {
    try {
        printers.value = await ipcRenderer.invoke('get-printers')
        console.log('可用的打印机:', printers.value)
    } catch (error) {
        console.error('获取打印机时出错:', error)
    }
};
async function printLabel () {
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

const handleOpenFile = async () => {
    try {
        const result = await window.ipcRenderer.openFile()
        if (result) {
            fileName.value = result.fileName

            // 读取Excel文件
            const workbook = XLSX.read(result.data, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]

            // 转换为JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            if (jsonData.length > 0) {
                headers.value = jsonData[0] // 第一行作为表头
                excelData.value = jsonData.slice(1) // 其余行作为数据
            }
        }
    } catch (error) {
        console.error('Error reading file:', error)
        alert('读取文件失败: ' + error.message)
    }
}
</script>

<style scoped></style>
<style scoped lang="less">
.container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
}
.ml-10px{
    margin-left: 10px;
}
.form{
    display: flex;
    flex-wrap: wrap;
    h3{
        font-size: 14px;
    }
}
.file-info {
    margin-bottom: 15px;
    font-size: 14px;
    color: #555;
}

.table-container {
    margin-top: 20px;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

th {
    background-color: #f2f2f2;
    position: sticky;
    top: 0;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

tr:hover {
    background-color: #f1f1f1;
}
</style>
